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
            text: `Use a maximum of ${maxWords} for answering the following: 
            ${analyzeImagePrompt}`,
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
}
