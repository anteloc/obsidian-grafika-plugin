import OpenAI from "openai";
import { ChatCompletionCreateParamsNonStreaming } from "openai/resources";
import { svg2png } from "../../utils/Utils";
import { DEFAULT_MAX_WORDS } from "./GptModels";

export class GptPlotAnalyzer {
    constructor(
        private model: string,
        private apiKey: string,
    ) {}

    public async analyze(
        prompt: string,
        imageData: URL,
        mimeType: string,
    ): Promise<string | null> {
        // FIXME If the image is actually an SVG, convert it to a PNG before sending it to the GPT API

        const image =
            mimeType === "image/svg+xml" ? await svg2png(imageData) : imageData;

        const openai = new OpenAI({
            apiKey: this.apiKey,
            // WARNING: This is a security risk, added here after a
            // warning message from the OpenAI API.
            dangerouslyAllowBrowser: true,
        });

        // Just one image for now
        const requestBody = await this.requestBody(
            prompt,
            DEFAULT_MAX_WORDS,
            image,
        );

        console.log("GPT Request body:", requestBody);

        const response = await openai.chat.completions.create(requestBody);

        return response.choices[0].message.content;
    }

    private async requestBody(
        prompt: string,
        maxWords: number,
        image: URL,
    ): Promise<ChatCompletionCreateParamsNonStreaming> {
        const userContent = [];

        // TODO Maybe modify prompt somehow in order to limit/reduce the length of the answer, explain how to use the attachments, etc?
        const userPrompt = { type: "text", text: prompt };

        const plotImage = {
            type: "image_url",
            image_url: {
                url: image,
                detail: "low",
            },
        };

        userContent.push(userPrompt, plotImage);

        const body = {
            model: this.model,
            n: 1,
            max_tokens: 1000,
            messages: [
                {
                    role: "system",
                    content: `You are an expert in data science, data plotting and also data and plot interpretation and analysis. 
                You are asked to analyze the following plot image and provide a detailed answer to the question(s) or task(s) 
                described in the message together with the image, using ${maxWords} words maximum for the answer.`,
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
