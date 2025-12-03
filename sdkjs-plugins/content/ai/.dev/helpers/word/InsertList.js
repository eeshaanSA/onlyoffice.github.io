//Вставляет список (bulleted list/numbered list) в документ. Либо в текущей позиции курсора, либо в начале или конце документа.
WORD_FUNCTIONS.insertList = function () {
		let func = new RegisteredFunction();
		func.name = "insertList";
		func.description = "Use this function to create simple numbered or bulleted lists at the current cursor position or at the start/end of the document.";
		func.params = [
			"items (array): array of strings representing list items",
			"listType (string): 'numbered' for numbered list, 'bulleted' for bulleted list (default is 'bulleted')",
			"position (string): where to insert the list - 'current', 'start', or 'end' (default is 'current')"
		];

		func.examples = [
			"If you need to create a bulleted list at current position, respond with:\n" +
			"[functionCalling (insertList)]: {\"items\": [\"First item\", \"Second item\", \"Third item\"], \"listType\": \"bulleted\"}",

			"If you need to create a numbered list at the start of the document, respond with:\n" +
			"[functionCalling (insertList)]: {\"items\": [\"Step 1\", \"Step 2\", \"Step 3\"], \"listType\": \"numbered\", \"position\": \"start\"}",

			"If you need to create a bulleted list at the end of the document, respond with:\n" +
			"[functionCalling (insertList)]: {\"items\": [\"Apple\", \"Banana\", \"Orange\"], \"position\": \"end\"}",

			"If you need to create a simple numbered list, respond with:\n" +
			"[functionCalling (insertList)]: {\"items\": [\"Task 1\", \"Task 2\", \"Task 3\"], \"listType\": \"numbered\"}"
		];

		func.call = async function (params) {
			Asc.scope.items = params.items || ["Item 1", "Item 2", "Item 3"];
			Asc.scope.listType = params.listType || "bulleted";
			Asc.scope.position = params.position || "current";

			await Asc.Editor.callCommand(function () {
				let doc = Api.GetDocument();

				if (Asc.scope.position === "start") {
					doc.MoveCursorToStart();
				} else if (Asc.scope.position === "end") {
					doc.MoveCursorToEnd();
					let newParagraph = Api.CreateParagraph();
					doc.InsertContent([newParagraph]);
				} else if (Asc.scope.position === "current") {
					let newParagraph = Api.CreateParagraph();
					doc.InsertContent([newParagraph]);
				}

				let paragraphs = [];
				let numbering;

				if (Asc.scope.listType === "numbered") {
					numbering = doc.CreateNumbering("numbered");
				} else {
					numbering = doc.CreateNumbering("bullet");
				}

				let numLvl = numbering.GetLevel(0);

				for (let i = 0; i < Asc.scope.items.length; i++) {
					let item = Asc.scope.items[i];
					let paragraph = Api.CreateParagraph();
					paragraph.AddText(item);
					paragraph.SetNumbering(numLvl);
					paragraph.SetContextualSpacing(true);
					paragraphs.push(paragraph);
				}

				doc.InsertContent(paragraphs);
			});
		};

		return func;
	};	
