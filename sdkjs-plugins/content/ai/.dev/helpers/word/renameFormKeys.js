
//Собирает данные из полей PDF, генерирует для них уникальные ключи и затем переименовывает их.

WORD_FUNCTIONS.renameFormKeys = function () {
	let func = new RegisteredFunction();
	func.name = "renameFormKeys";
	func.params = [
	];

	func.description = "Collect all form fields (keys/placeholders), ask the AI to generate unique UPPER_SNAKE_CASE keys, then rename the fields (and optionally update placeholders).";

	func.examples = [
		"If the user says: 'Rename form keys', respond with:\n" +
		"[functionCalling (renameFormKeys)]: {}"
	];

	func.call = async function (params) {
		function safeParseJsonFromText(text) {
			if (!text) throw new Error("Empty AI content");
			let trimmed = ("" + text).trim();
			try {
				return JSON.parse(trimmed);
			} catch (_) {
				const i1 = trimmed.indexOf("{");
				const i2 = trimmed.lastIndexOf("}");
				if (i1 === -1 || i2 === -1 || i2 <= i1) {
					throw new Error('AI content is not valid JSON. Got: "' + trimmed.slice(0, 200) + '..."');
				}
				return JSON.parse(trimmed.slice(i1, i2 + 1));
			}
		}
		let fieldsMap = await Asc.Editor.callCommand(function () {
			var doc = Api.GetDocument();
			var forms = doc.GetAllForms();
			var out = {};

			for (var i = 0; i < forms.length; i++) {
				var f = forms[i];
				var key = f.GetFormKey();
				var t = f.GetFormType();
				var ph = "";
				if (typeof f.GetPlaceholderText === "function") {
					try { ph = f.GetPlaceholderText() || ""; } catch (e) { ph = ""; }
				}

				var val = "";
				var chk = null;
				if (t === "textForm" || t === "comboBoxForm") {
					if (typeof f.GetText === "function") {
						try { val = f.GetText() || ""; } catch (e) { val = ""; }
					}
				} else if (t === "checkBoxForm") {
					if (typeof f.IsChecked === "function") {
						try { chk = !!f.IsChecked(); } catch (e) { chk = null; }
					}
				}

				out[key] = { type: t, ph: ph, val: val, chk: chk };
			}
			return out;
		});

		if (!fieldsMap || !Object.keys(fieldsMap).length)
			return;

		const systemHint =
			'Return ONLY valid JSON with two properties: ' +
			'"keys" (map oldKey->newKey) and "newValues" (map newKey->placeholder). ' +
			'Rules: ' +
			'1) New keys MUST be UPPER_SNAKE_CASE (letters, numbers, underscores only). ' +
			'2) Derive each new key from the semantic meaning of the field. Prefer "ph" (placeholder), ' +
			'   but if "ph" is empty, use "val" (current text). Do NOT include words like ENTER/INDICATE in the key. ' +
			'3) If multiple fields share the same meaning, add numeric suffixes (_1, _2, …). ' +
			'4) All new keys must be globally unique. ' +
			'5) "newValues" must map each new key to a short placeholder (≤60 chars). ' +
			'Output JSON only — no explanations, no code fences.';

		const argPrompt =
			systemHint + "\n\nFIELDS_JSON:\n" + JSON.stringify({ fields: fieldsMap });
		console.log("[AI PROMPT PREVIEW]", argPrompt);

		let requestEngine = AI.Request.create(AI.ActionType.Chat);
		if (!requestEngine)
			return;

		await Asc.Editor.callMethod("StartAction", ["GroupActions"]);
		await Asc.Editor.callMethod("StartAction", ["Block", "AI (" + requestEngine.modelUI.name + ")"]);

		let isSendedEndLongAction = false;
		async function checkEndAction() {
			if (!isSendedEndLongAction) {
				await Asc.Editor.callMethod("EndAction", ["Block", "AI (" + requestEngine.modelUI.name + ")"]);
				isSendedEndLongAction = true;
			}
		}

		let resultText = "";

		let result = await requestEngine.chatRequest(argPrompt, false, async function (data) {
			if (!data) return;
			console.log("[AI RAW RESPONSE]", data);
			await checkEndAction();
			resultText += data;
			await Asc.Editor.callMethod("EndAction", ["GroupActions", "", "cancel"]);
			await Asc.Editor.callMethod("StartAction", ["GroupActions"]);
		});

		await checkEndAction();

		await Asc.Editor.callMethod("EndAction", ["GroupActions", "", "cancel"]);
		await Asc.Editor.callMethod("StartAction", ["GroupActions"]);

		let ai;
		try {
			ai = safeParseJsonFromText(resultText);
		} catch (e) {
			try {
				ai = (result && result.message && typeof result.message.content === "string")
					? safeParseJsonFromText(result.message.content)
					: null;
			} catch (_) { }
		}
		if (!ai || typeof ai !== "object" || !ai.keys || typeof ai.keys !== "object") {
			await Asc.Editor.callMethod("EndAction", ["GroupActions"]);
			return;
		}
		if (!ai.newValues || typeof ai.newValues !== "object") {
			ai.newValues = {};
		}

		Asc.scope._keysMap = ai.keys;
		Asc.scope._newValues = ai.newValues;
		await Asc.Editor.callCommand(function () {
			var keysMap = Asc.scope._keysMap || {};
			var newValues = Asc.scope._newValues || {};
			var doc = Api.GetDocument();
			var forms = doc.GetAllForms();

			for (var i = 0; i < forms.length; i++) {
				var form = forms[i];
				var oldKey = form.GetFormKey();
				var newKey = (oldKey in keysMap) ? keysMap[oldKey] : null;
				if (!newKey) continue;

				form.SetFormKey(newKey);
			}

		});

		await Asc.Editor.callMethod("EndAction", ["GroupActions"]);
	};

	return func;

}
