
// Объясняет ошибку в ячейке, добавляя комментарий с объяснением
// Поддерживаемые ошибки: #DIV/0!, #N/A, #VALUE!, #REF!, #NAME?
// Если в ячейке нет ошибки, добавляет комментарий "There is no error in this cell"
// Добавлены триггеры на естественном языке для определения типа ошибки из пользовательского ввода + обработчик промпта пользователя
if (true) {
    let func = new RegisteredFunction();
    func.name = "explainError";
    func.params = [
        "range (string, optional): cell range containing error to explain (e.g., 'A1'). If omitted, uses active/selected cell",
        "userInput (string, optional): raw user query that may contain natural language trigger"
    ];

    func.examples = [
        "To explain error in active cell, respond:" +
        "[functionCalling (explainError)]: {}",

        "To explain error in specific cell A1, respond:" +
        "[functionCalling (explainError)]: {\"range\": \"A1\"}",

        "To explain error in cell B5, respond:" +
        "[functionCalling (explainError)]: {\"range\": \"B5\"}",

        // Natural language triggers
        "Explain the error in A1 cell",
        "Explain this error",
        "Why does my formula return “#VALUE!” in E33 cell?",
        "Fix the spreadsheet error in E33 cell",
        "What does the error in selected cell mean?",
        "Why this error?",
        "Why N/A?",
        "Why do I see #REF?",
        "What is wrong with this formula?",
        "Explain formula error",
        "Help me fix this cell error",
        "why div",
        "why na",
        "what is ref",
        "meaning of name error",
        "reason for value error"
    ];

    func.call = async function (params) {
        Asc.scope.range = params.range;

        // Normalize error type based on user input triggers
        let normalizedError = null;
        if (params && params.userInput) {
            let text = params.userInput.toLowerCase();

            const triggers = ["why", "what", "explain", "meaning", "reason", "cause"];
            let hasTrigger = triggers.some(t => text.includes(t));

            if (hasTrigger) {
                if (/div/.test(text)) normalizedError = "#DIV/0!";
                else if (/\bna\b/.test(text)) normalizedError = "#N/A";
                else if (/value/.test(text)) normalizedError = "#VALUE!";
                else if (/ref/.test(text)) normalizedError = "#REF!";
                else if (/name/.test(text)) normalizedError = "#NAME?";
            }
        }
        // Get error from the specified cell
        let errorData = null;
        if (!normalizedError) {
            errorData = await Asc.Editor.callCommand(function () {
                let ws = Api.GetActiveSheet();
                let _range;

                if (!Asc.scope.range) {
                    _range = Api.GetSelection();
                } else {
                    _range = ws.GetRange(Asc.scope.range);
                }

                if (!_range || !_range.GetCells(1, 1)) {
                    return null;
                }

                let cell = _range.GetCells(1, 1);
                let error = cell.GetValue2();
                let cellAddress = cell.GetAddress();

                return {
                    error: error,
                    address: cellAddress,
                    hasError: error && error.toString().startsWith('#')
                };
            });
        } else {
            errorData = {
                error: normalizedError,
                address: Asc.scope.range || "?",
                hasError: true
            };
        }

        // If no error, add comment indicating no error
        if (!errorData || !errorData.hasError) {
            await Asc.Editor.callCommand(function () {
                let ws = Api.GetActiveSheet();
                let _range;

                if (!Asc.scope.range) {
                    _range = Api.GetSelection();
                } else {
                    _range = ws.GetRange(Asc.scope.range);
                }

                if (_range) {
                    let cell = _range.GetCells(1, 1);
                    if (cell) {
                        cell.AddComment("There is no error in this cell", "AI Assistant");
                    }
                }
            });
            return;
        }

        let argPrompt = "Explain the following Excel error in detail:\n\n" +
            "Error: " + errorData.error + "\n" +
            "Cell: " + errorData.address + "\n\n" +
            "IMPORTANT RULES:\n" +
            "1. Identify the exact meaning of this error type (e.g., division by zero, invalid reference).\n" +
            "2. Explain why this error commonly occurs.\n" +
            "3. Give clear, step-by-step reasoning of the possible cause in this specific cell.\n" +
            "4. Suggest practical ways to fix or avoid the error.\n" +
            "5. Keep explanation simple, clear, and beginner-friendly.\n" +
            "6. Mention common mistakes that lead to this error.\n" +
            "7. If multiple causes are possible, list them briefly in order of likelihood.\n" +
            "8. Keep the explanation concise but comprehensive.\n" +
            "9. Avoid filler text and unnecessary theory.\n" +
            "10. Response length should be under 1024 characters (recommended), maximum 32767.\n" +
            "11. Prioritize the most important fix suggestions if length constraint requires cuts.\n" +
            "12. Output must be plain text only, without Markdown, JSON, or special formatting.\n\n" +
            "13. Formatting rules: each numbered point must start on a new line; if you include multiple causes, format them as sub-items starting on new lines.\n\n" +
            "Please provide a detailed but concise explanation of this error.";

        let requestEngine = AI.Request.create(AI.ActionType.Chat);
        if (!requestEngine)
            return;

        let isSendedEndLongAction = false;
        async function checkEndAction() {
            if (!isSendedEndLongAction) {
                await Asc.Editor.callMethod("EndAction", ["Block", "AI (" + requestEngine.modelUI.name + ")"]);
                isSendedEndLongAction = true;
            }
        }

        await Asc.Editor.callMethod("StartAction", ["Block", "AI (" + requestEngine.modelUI.name + ")"]);
        await Asc.Editor.callMethod("StartAction", ["GroupActions"]);

        let explanation = await requestEngine.chatRequest(argPrompt, false, async function (data) {
            if (!data)
                return;
            await checkEndAction();
        });

        await checkEndAction();
        await Asc.Editor.callMethod("EndAction", ["GroupActions"]);

        // Add comment with explanation to the cell
        if (explanation) {
            Asc.scope.explanation = explanation;
            await Asc.Editor.callCommand(function () {
                let ws = Api.GetActiveSheet();
                let _range;

                if (!Asc.scope.range) {
                    _range = Api.GetSelection();
                } else {
                    _range = ws.GetRange(Asc.scope.range);
                }

                if (_range) {
                    let cell = _range.GetCells(1, 1);
                    if (cell) {
                        // Create comment with error explanation
                        let commentText = "Error Explanation:\n\n" + Asc.scope.explanation;
                        cell.AddComment(commentText, "AI Assistant");
                    }
                }
            });
        }
    };

    funcs.push(func);
}