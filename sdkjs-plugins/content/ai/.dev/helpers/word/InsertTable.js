//Вставляет таблицу в документ. Либо в текущей позиции курсора, либо в начале или конце документа. Тип таблицы и колличество столбцов/рядов можно задавать промптом. 

WORD_FUNCTIONS.insertTable = function () {
		let func = new RegisteredFunction();
		func.name = "insertTable";
		func.description = "Use this function to insert a table at the current cursor position or at the start/end of the document. You can specify the number of rows and columns, and optionally add headers.";
		func.params = [
			"rows (number): number of rows in the table",
			"columns (number): number of columns in the table",
			"hasHeaders (boolean): whether the first row should be formatted as headers",
			"tableStyle (string): optional table style name (e.g., 'Table Grid', 'Light Grid')",
			"width (number): table width percentage (default is 100)",
			"widthType (string): width type - 'percent' or 'point' (default is 'percent')",
			"position (string): where to insert the table - 'current', 'start', or 'end' (default is 'current')"
		];

		func.examples = [
			"If you need to insert a simple 3x4 table at current position, respond with:\n" +
			"[functionCalling (insertTable)]: {\"rows\": 3, \"columns\": 4}",

			"If you need to insert a table at the start of the document, respond with:\n" +
			"[functionCalling (insertTable)]: {\"rows\": 3, \"columns\": 3, \"position\": \"start\"}",

			"If you need to insert a table at the end of the document, respond with:\n" +
			"[functionCalling (insertTable)]: {\"rows\": 4, \"columns\": 2, \"position\": \"end\"}",

			"If you need to insert a table with headers at the top, respond with:\n" +
			"[functionCalling (insertTable)]: {\"rows\": 5, \"columns\": 3, \"hasHeaders\": true, \"position\": \"start\"}"
		];

		func.call = async function (params) {
			Asc.scope.rows = params.rows || 3;
			Asc.scope.columns = params.columns || 3;
			Asc.scope.hasHeaders = params.hasHeaders || false;
			Asc.scope.tableStyle = params.tableStyle;
			Asc.scope.width = params.width || 100;
			Asc.scope.widthType = params.widthType || "percent";
			Asc.scope.position = params.position || "current";

			await Asc.Editor.callCommand(function () {
				let doc = Api.GetDocument();

				if (Asc.scope.position === "start") {
					doc.MoveCursorToStart();
				} else if (Asc.scope.position === "end") {
					doc.MoveCursorToEnd();
				}

				let table = Api.CreateTable(Asc.scope.rows, Asc.scope.columns);
				doc.InsertContent([table]);

				let unit = (Asc.scope.widthType === "point") ? "twips" : Asc.scope.widthType;
				let widthValue = (Asc.scope.widthType === "point") ? (Asc.scope.width * 20) : Asc.scope.width;
				table.SetWidth(unit, widthValue);

				if (Asc.scope.tableStyle) {
					table.SetStyle(Asc.scope.tableStyle);
				}

				if (Asc.scope.hasHeaders) {
					for (let col = 0; col < Asc.scope.columns; col++) {
						let cell = table.GetCell(0, col);
						if (cell) {
							let para = cell.GetContent().GetElement(0);
							if (para) {
								let textPr = para.GetTextPr();
								textPr.SetBold(true);
								para.SetTextPr(textPr);
							}
						}
					}
				}
			});
		};

		return func;
	};