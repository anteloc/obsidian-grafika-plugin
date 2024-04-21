import { GptPlotAnalyzer } from "src/ai/gpt/GptPlotAnalyzer";
import { AbstractGraphApi } from "src/graph/core/AbstractGraphApi";
import { SandboxedRenderer } from "./SandboxedRenderer";

import { v4 as uuid } from "uuid";

export class GraphRenderer {
    private sandoxedRenderer: SandboxedRenderer;

    constructor(
        private sourceCode: string,
        private api: AbstractGraphApi,
        private analyzer: GptPlotAnalyzer,
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
        captured: { dataUrl: URL; mimeType: string },
        responseId: string,
    ) {
        if (responseId.startsWith("analyze-")) {
            this.analyzePlot(captured);
        }
    }

    protected async analyzePlot(captured: { dataUrl: URL; mimeType: string }) {
        let result = await this.analyzer.analyze(
            "Analyze the attached graph plot image(s) and describe its contents and potential meaning",
            captured.dataUrl,
            captured.mimeType,
        );

        result = result || "**ERROR** Failed to analyze the plot image.";

        await this.markdownRenderer(
            this.makeCallout("ai-analysis", "AI", result),
            this.rendererEls.analysisResultsContainer,
        );

        console.log("analyzePlot: GPT Result:", result);
    }

    private makeCallout(type: string, header: string, text: string) {
        const lines = [];

        const textLines = text.split("\n").map((line) => `> ${line}`);

        lines.push(`> [!${type}]+ ${header}`);
        lines.push(...textLines);

        return lines.join("\n");
    }

    
}
