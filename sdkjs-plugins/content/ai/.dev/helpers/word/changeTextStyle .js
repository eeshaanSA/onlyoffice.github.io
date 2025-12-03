
// В функцию changeTextStyle добавлена возможность изменять кейс текста (верхний, нижний, предложение, каждое слово, переключение) 
WORD_FUNCTIONS.changeTextStyle = function () {
    let func = new RegisteredFunction();
    func.name = "changeTextStyle";
    func.params = [
        "bold (boolean): whether to make the text bold",
        "italic (boolean): whether to make the text italic",
        "underline (boolean): whether to underline the text",
        "strikeout (boolean): whether to strike out the text",
        "fontSize (number): font size to apply to the selected text",
        "caseType (string): 'upper' for UPPERCASE, 'lower' for lowercase, 'sentence' for Sentence case, 'capitalize' for Capitalize Each Word, 'toggle' for tOGGLE cASE"
    ];

    func.examples = [
        "If you need to make selected text bold and italic, respond with:" +
        "[functionCalling (changeTextStyle)]: {\"bold\": true, \"italic\": true }",

        "If you need to underline the selected text, respond with:" +
        "[functionCalling (changeTextStyle)]: {\"underline\": true }",

        "If you need to strike out the selected text, respond with:" +
        "[functionCalling (changeTextStyle)]: {\"strikeout\": true }",

        "If you need to set the font size of selected text to 18, respond with:" +
        "[functionCalling (changeTextStyle)]: {\"fontSize\": 18 }",

        "If you need to make selected text bold, respond with:" +
        "[functionCalling (changeTextStyle)]: {\"bold\": true }",

        "If you need to make selected text non-italic, respond with:" +
        "[functionCalling (changeTextStyle)]: {\"italic\": false }",
        //changecase
        "If you need to make selected text uppercase, respond with:" +
        "[functionCalling (changeTextStyle)]: {\"caseType\": \"upper\"}",

        "If you need to make selected text lowercase, respond with:" +
        "[functionCalling (changeTextStyle)]: {\"caseType\": \"lower\"}",

        "If you need to make selected text ToGgle Case, respond with:" +
        "[functionCalling (changeTextStyle)]: {\"caseType\": \"toggle\"}",

        "If you need to make selected text Sentence case, respond with:" +
        "[functionCalling (changeTextStyle)]: {\"caseType\": \"sentence\"}",

        "If you need to make selected text Capitalize Each Word, respond with:" +
        "[functionCalling (changeTextStyle)]: {\"caseType\": \"capitalize\"}"
    ];

    func.call = async function (params) {
        Asc.scope.bold = params.bold;
        Asc.scope.italic = params.italic;
        Asc.scope.underline = params.underline;
        Asc.scope.strikeout = params.strikeout;
        Asc.scope.fontSize = params.fontSize;
        Asc.scope.caseType = params.caseType;
        await Asc.Editor.callCommand(function () {
            let doc = Api.GetDocument();
            let range = doc.GetRangeBySelect();
            if (!range || "" === range.GetText()) {
                doc.SelectCurrentWord();
                range = doc.GetRangeBySelect();
            }

            if (!range)
                return;

            if (undefined !== Asc.scope.bold)
                range.SetBold(Asc.scope.bold);

            if (undefined !== Asc.scope.italic)
                range.SetItalic(Asc.scope.italic);

            if (undefined !== Asc.scope.underline)
                range.SetUnderline(Asc.scope.underline);

            if (undefined !== Asc.scope.strikeout)
                range.SetStrikeout(Asc.scope.strikeout);

            if (undefined !== Asc.scope.fontSize)
                range.SetFontSize(Asc.scope.fontSize);

            // Case Type - Updated with robust logic from textcleaner.js
            if (undefined !== Asc.scope.caseType) {
                let text = range.GetText();

                if (!text || text.trim() === "") {
                    text = doc.GetCurrentWord();
                    if (text) {
                        doc.SelectCurrentWord();
                        range = doc.GetRangeBySelect();
                    }
                }

                if (text && text.trim() !== "") {
                    // Define case conversion functions
                    let convertCase;
                    switch (Asc.scope.caseType) {
                        case "upper":
                            convertCase = t => t.toUpperCase();
                            break;
                        case "lower":
                            convertCase = t => t.toLowerCase();
                            break;
                        case "sentence":
                            convertCase = t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
                            break;
                        case "capitalize":
                            convertCase = t => t.replace(/\b\w/g, l => l.toUpperCase());
                            break;
                        case "toggle":
                            convertCase = t => t.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('');
                            break;
                        default:
                            convertCase = t => t;
                    }

                    // Process paragraphs
                    const processParagraphs = paragraphs => {
                        for (let i = 0; i < paragraphs.length; i++) {
                            const para = paragraphs[i];

                            if (!para.GetElementsCount) continue;

                            const elementsCount = para.GetElementsCount();
                            let fullText = "";
                            let runs = [];

                            for (let j = 0; j < elementsCount; j++) {
                                const elem = para.GetElement(j);
                                if (elem.GetText) {
                                    const text = elem.GetText();
                                    if (text) {
                                        fullText += text;
                                        runs.push({ element: elem, text: text, length: text.length });
                                    }
                                }
                            }

                            if (fullText.trim() === "") continue;

                            const newFullText = convertCase(fullText);

                            if (newFullText !== fullText) {
                                para.RemoveAllElements();
                                let currentPos = 0;
                                for (let k = 0; k < runs.length; k++) {
                                    const run = runs[k];
                                    const newRunText = newFullText.substring(currentPos, currentPos + run.length);
                                    const newRun = Api.CreateRun();

                                    const oldPr = run.element.GetTextPr();
                                    newRun.SetTextPr(oldPr);
                                    newRun.AddText(newRunText);

                                    para.AddElement(newRun);
                                    currentPos += run.length;
                                }
                            }
                        }
                    };

                    if (range && range.GetText && range.GetText().trim() !== "") {
                        processParagraphs(range.GetAllParagraphs());
                    } else {
                        processParagraphs(doc.GetAllParagraphs());
                    }
                }
            }

        });
    };

    return func;
}