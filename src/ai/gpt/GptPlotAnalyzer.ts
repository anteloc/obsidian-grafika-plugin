import OpenAI from "openai";
import { ChatCompletionCreateParamsNonStreaming } from "openai/resources";
import { pngImgData } from "../../utils/Utils";

export class GptPlotAnalyzer {
    constructor(
        private openaiSettings: {
            apiKey: string;
            model: string;
            systemPrompt: string;
            analyzeImagePrompt: string;
            maxWords: number;
        },
    ) {}

    public async analyze(imageData: URL): Promise<string | null> {
        const { apiKey, model } = this.openaiSettings;

        const image = await pngImgData(imageData);

        const openai = new OpenAI({
            apiKey,
            // WARNING: This is a security risk, added here after a
            // warning message from the OpenAI API.
            dangerouslyAllowBrowser: true,
        });

        // Just one image for now
        const requestBody = await this.requestBody(image);

        console.log(`Ongoing ${model} request...`, requestBody);

        const response = await openai.chat.completions.create(requestBody);

        console.log(`Response received for ${model} request`);

        return response.choices[0].message.content;
    }

    private async requestBody(
        image: URL,
    ): Promise<ChatCompletionCreateParamsNonStreaming> {
        const { model, maxWords, analyzeImagePrompt, systemPrompt } =
            this.openaiSettings;

        const userContent = [];

        const userPrompt = {
            type: "text",
            text: `${analyzeImagePrompt}. Use a maximum of ${maxWords} for the answer.`,
        };

        const plotImage = {
            type: "image_url",
            image_url: {
                url: image,
                detail: "low",
            },
        };

        userContent.push(userPrompt, plotImage);

        const body = {
            model: model,
            n: 1,
            max_tokens: 1000,
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                {
                    role: "user",
                    content: userContent,
                },
            ],
        };

        return body as ChatCompletionCreateParamsNonStreaming;
    }

    // TODO Maybe required in the future, in cases where the image is not a URL but a Blob
    private blobToDataURL(blob: Blob): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (_e) => resolve(reader.result as string);
            reader.onerror = (_e) => reject(reader.error);
            reader.onabort = (_e) => reject(new Error("Read aborted"));
            reader.readAsDataURL(blob);
        });
    }
}
