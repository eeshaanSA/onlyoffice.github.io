
// Описывает изображение на слайде с помощью ИИ и вставляет текстовое поле с результатом
// Требуется выделить изображение перед вызовом функции. Если  изображение не выделено, функция попросит выделить изображение
// Если выбрана модель, не поддерживающий работу с изображениями, функция предупредит об этом

if (true) {
    let func = new RegisteredFunction();
    func.name = "describeImage";
    func.description = "Allows users to select an image and generate a meaningful title, description, caption, or alt text for it using AI.";
    func.params = [
        "prompt (string): instruction for the AI (e.g., 'Add a short title for this chart.')"
    ];
    func.examples = [
        "[functionCalling (describeImage)]: {\"prompt\": \"Add a short title for this chart.\"}",
        "[functionCalling (describeImage)]: {\"prompt\": \"Write me a 1–2 sentence description of this photo.\"}",
        "[functionCalling (describeImage)]: {\"prompt\": \"Generate a descriptive caption for this organizational chart.\"}",
        "[functionCalling (describeImage)]: {\"prompt\": \"Provide accessibility-friendly alt text for this infographic.\"}"
    ];

    func.call = async function (params) {
        async function insertMessage(message) {
            Asc.scope._message = String(message || "");
            await Asc.Editor.callCommand(function () {
                let presentation = Api.GetPresentation();
                let slide = presentation.GetCurrentSlide();

                let fill = Api.CreateNoFill();
                let stroke = Api.CreateStroke(0, Api.CreateNoFill());
                let shape = Api.CreateShape("rect", 300 * 36000, 40 * 36000, fill, stroke);
                shape.SetPosition(720000, 3600000);

                let docContent = shape.GetDocContent();
                let p = docContent.GetElement(0);

                let run = Api.CreateRun();
                run.SetFontSize(22);
                run.SetColor(0, 0, 0);
                run.AddText(Asc.scope._message);
                p.AddElement(run);

                slide.AddObject(shape);
                Asc.scope._message = "";
            }, true);
        }

        try {
            let imageData = await new Promise((resolve) => {
                window.Asc.plugin.executeMethod("GetImageDataFromSelection", [], function (result) {
                    resolve(result);
                });
            });
            console.log('[describeImage] imageData:', imageData);
            if (!imageData || !imageData.src) {
                await insertMessage("Please select a valid image first.");
                return;
            }

            const whiteRectangleBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
            if (imageData.src === whiteRectangleBase64) {
                await insertMessage("Please select a valid image first.");
                return;
            }

            let argPrompt = params.prompt + " (for the selected image)";
            let requestEngine = AI.Request.create(AI.ActionType.Chat);
            if (!requestEngine) {
                await insertMessage("AI request engine not available.");
                return;
            }
            const allowVision = /(vision|gemini|gpt-4o|gpt-4v|gpt-4-vision)/i;
            if (!allowVision.test(requestEngine.modelUI.name)) {
                await insertMessage("⚠ This model may not support images. Please choose a vision-capable model (e.g. GPT-4V, Gemini, etc.).");
                return;
            }
            await Asc.Editor.callMethod("StartAction", ["Block", "AI (" + requestEngine.modelUI.name + ")"]);
            await Asc.Editor.callMethod("StartAction", ["GroupActions"]);

            let messages = [
                {
                    role: "user",
                    content: [
                        { type: "text", text: argPrompt },
                        { type: "image_url", image_url: { url: imageData.src, detail: "high" } }
                    ]
                }
            ];

            let resultText = "";
            await requestEngine.chatRequest(messages, false, async function (data) {
                if (data) {
                    resultText += data;
                }
                Asc.scope.text = resultText;
                await Asc.Editor.callMethod("EndAction", ["GroupActions"]);
                await Asc.Editor.callMethod("EndAction", ["Block", "AI (" + requestEngine.modelUI.name + ")"]);
            });

            Asc.scope.text = resultText || "";

            if (Asc.scope.text && Asc.scope.text.trim().length > 0) {
                await insertMessage(Asc.scope.text);
            }

        } catch (e) {
            try {
                await Asc.Editor.callMethod("EndAction", ["GroupActions"]);
                await Asc.Editor.callMethod("EndAction", ["Block", "AI (describeImage)"]);
            } catch (ee) { }
            console.error('[describeImage] error:', e);
            await insertMessage("An error occurred while describing the image.");
        }
    };

    funcs.push(func);
}