import { GptPlotAnalyzer } from "src/ai/gpt/GptPlotAnalyzer";
import { AbstractGraphApi } from "src/graph/core/AbstractGraphApi";
import { SandboxedCodeFragments, SandboxedRenderer } from "./SandboxedRenderer";

import { v4 as uuid } from "uuid";
import { ApiCodeFragments } from "src/graph/core/IGraphApi";

export class GraphRenderer {
    private sandoxedRenderer: SandboxedRenderer;

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
        // const {
        //     apiName,
        //     dependencies,
        //     sandboxedScreenshotSetup,
        //     graphContainerHtml,
        // } = this.api;

        /*
        export type ApiCodeFragments = {
    apiName: string,
    graphContainerHtml: string,
    screenshotSetupJs: string,
    graphSourceCodeJs: string,
}
        */
        const {
            apiName,
            screenshotSetupJs: screenshotSetup,
            graphContainerHtml: graphContainer,
            graphSourceCodeJs: graphSourceCode,
        } = this.api.codeFragments(this.sourceCode);

        /*
export type SandboxedCodeFragments = {
    apiName: string;
    dependenciesPreamble?: string;
    screnshotSetup: string;
    graphContainer: string;
    graphSourceCode: string;
};
        */
        const codeFragments: SandboxedCodeFragments = {
            apiName,
            screenshotSetup,
            graphContainer,
            graphSourceCode,
        };

        this.sandoxedRenderer = new SandboxedRenderer(
            codeFragments,
            // this.sourceCode,
            // apiName,
            this.api.dependencies(),
            // sandboxedScreenshotSetup,
            this.handleScreenshotCaptured.bind(this),
            // graphContainerHtml(""),
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

        try {
            let result = await this.analyzer.analyze(captured.imgDataUrl);

            result = result || "**ERROR** Failed to analyze the plot image.";

            await this.markdownRenderer(
                this.makeCallout("ai-analysis", "AI", result),
                this.rendererEls.analysisResultsContainer,
            );
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
