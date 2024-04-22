import { GptPlotAnalyzer } from "src/ai/gpt/GptPlotAnalyzer";
import { AbstractGraphApi } from "src/graph/core/AbstractGraphApi";
import { SandboxedCodeFragments, SandboxedRenderer } from "./SandboxedRenderer";

import { v4 as uuid } from "uuid";
import moment from "moment";
import voca from "voca";

export class GraphRenderer {
    private sandoxedRenderer: SandboxedRenderer;

    constructor(
        private sourceCode: string,
        private api: AbstractGraphApi,
        private analyzer: GptPlotAnalyzer,
        private alertNotice: (message: string, duration: number) => any,
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
            screenshotSetupJs: screenshotSetup,
            graphContainerHtml: graphContainer,
            graphSourceCodeJs: graphSourceCode,
        } = this.api.codeFragments(this.sourceCode);

        const codeFragments: SandboxedCodeFragments = {
            apiName,
            screenshotSetup,
            graphContainer,
            graphSourceCode,
        };

        this.sandoxedRenderer = new SandboxedRenderer(
            codeFragments,
            this.api.dependencies(),
            this.handleScreenshotCaptured.bind(this),
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
        captured: { imgDataUrl: URL },
        responseId: string,
    ) {
        if (responseId.startsWith("analyze-")) {
            this.analyzePlot(captured);
        }
    }

    protected async analyzePlot(captured: { imgDataUrl: URL }) {
        const analyzingNotice = this.alertNotice("Analyzing plot...", 0);

        let cType = "ai-analysis";
        let cHeader = "AI";
        const cInfoTempl = "**Date:** %s, **Took:** %d secs";

        const start = moment();
        let result;

        try {
            result =
                (await this.analyzer.analyze(captured.imgDataUrl)) ||
                "**ERROR** Failed to analyze the plot image";
        } catch (error) {
            console.error("analyzePlot: GPT Error:", error);

            cType = "error";
            cHeader = "AI Error";
            result = error.message;
        } finally {
            const end = moment();

            let elapsed = moment.duration(end.diff(start)).asSeconds();
            elapsed = Math.round(elapsed * 10) / 10;

            const cInfo = voca.sprintf(
                cInfoTempl,
                end.format("MMMM Do YYYY, h:mm:ss a"),
                elapsed,
            );

            await this.markdownRenderer(
                this.makeCallout(
                    cType,
                    cHeader,
                    cInfo,
                    result,
                    captured.imgDataUrl,
                ),
                this.rendererEls.analysisResultsContainer,
            );

            analyzingNotice.hide();
        }
    }

    private makeCallout(
        type: string,
        header: string,
        info: string,
        text: string,
        imgDataUrl?: URL,
    ) {
        const lines = [];

        const textLines = text.split("\n").map((line) => `> ${line}`);

        lines.push(`> [!${type}]+ ${header}`);
        lines.push(`> ${info}`);
        lines.push(`> ![Image|250](${imgDataUrl})`);
        lines.push(...textLines);

        return lines.join("\n");
    }
}
