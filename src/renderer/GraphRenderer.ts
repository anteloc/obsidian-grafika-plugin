import { GptPlotAnalyzer } from "src/ai/gpt/GptPlotAnalyzer";
import { AbstractGraphApi } from "src/graph/core/AbstractGraphApi";
import { SandboxedRenderer } from "./SandboxedRenderer";

import { v4 as uuid } from "uuid";

export class GraphRenderer {
    private sandoxedRenderer: SandboxedRenderer;
    private analyzingNotice: any;

    constructor(
        private sourceCode: string,
        private api: AbstractGraphApi,
        private analyzer: GptPlotAnalyzer,
        private alertNotice: (message: string, duration: number) => void,
        private markdownRenderer: (
            markdown: string,
            markdownContainer: HTMLElement,
        ) => Promise<void>,
        private rendererEls: {
            rendererContainer: HTMLDivElement;
            analyzeButton: HTMLButtonElement;
            analysisResultsContainer: HTMLElement;
        },
    ) {
        const {
            apiName,
            dependencies,
            sandboxedScreenshotSetup,
            graphContainerHtml,
        } = this.api;

        this.sandoxedRenderer = new SandboxedRenderer(
            this.sourceCode,
            apiName,
            dependencies(),
            sandboxedScreenshotSetup,
            this.handleScreenshotCaptured.bind(this),
            graphContainerHtml(""),
            this.rendererEls.rendererContainer,
        );
    }

    public async start() {
        await this.sandoxedRenderer.renderGraph();

        this.rendererEls.analyzeButton.addEventListener("click", () => {
            this.sandoxedRenderer.takeScreenshot(`analyze-${uuid()}`);
        });
    }

    private handleScreenshotCaptured(
        captured: { dataUrl: URL },
        responseId: string,
    ) {
        if (responseId.startsWith("analyze-")) {
            this.analyzePlot(captured);
        }
    }

    protected async analyzePlot(captured: { imgDataUrl: URL }) {
        const analyzingNotice = this.alertNotice("Analyzing plot...", 0);

        const prompt = `Analyze the attached graph plot image and provide the following informative sections:
            1. Plot Description: describe the plot meaning in a maximum of 20 words
            2. Insights: In a maximum of 100 words, provide insights about the meaning of the plot about:
                - the conclusions that can be drawn from the data, 
                - the relevance of the plot to the data analysis context
                - the implications of the plot to the data analysis context
            4. Foresight: In a maximum of 50 words, provide foresight about the future implications of the plot to the data analysis context
                - If the X axis is time, what future trends can be expected?
                - If the X axis is a category, what future changes can be expected for other categories?
                - If the X axis is a continuous variable, what values of the variable, not present in the plot, could be relevant to take into account?
                - If none of the above, analyze what future implications can be expected taking into account the whole plot and not only an X axis
            3. Conclusion: Provide a conclusion based on the insights and foresight sections, in a maximum of 100 words`;

            // debugger
        try {
            let result = await this.analyzer.analyze(
                prompt,
                captured.imgDataUrl,
            );

            result = result || "**ERROR** Failed to analyze the plot image.";

            await this.markdownRenderer(
                this.makeCallout("ai-analysis", "AI", result),
                this.rendererEls.analysisResultsContainer,
            );

            console.log("analyzePlot: GPT Result:", result);
        } catch (error) {
            console.error("analyzePlot: GPT Error:", error);
            await this.markdownRenderer(
                this.makeCallout("error", "AI Error", error.message),
                this.rendererEls.analysisResultsContainer,
            );
        } finally {
            analyzingNotice.hide();
        }
    }

    private makeCallout(type: string, header: string, text: string) {
        const lines = [];

        const textLines = text.split("\n").map((line) => `> ${line}`);

        lines.push(`> [!${type}]+ ${header}`);
        lines.push(...textLines);

        return lines.join("\n");
    }
}
