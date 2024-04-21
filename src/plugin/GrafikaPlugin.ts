import {
    Plugin,
    MarkdownView,
    MarkdownRenderer,
    MarkdownPostProcessorContext,
} from "obsidian";

import { IGraphApi } from "../graph/core/IGraphApi";
import { REGISTRABLE_LANGUAGES, buildGraphApis } from "./GraphApisManifests";
import { CodemirrorRegisterer } from "./CodeMirrorRegisterer";
import {
    GrafikaPluginSettings,
    GrafikaSettingTab,
    DEFAULT_SETTINGS,
} from "./GrafikaPluginSettings";
import { GrafikaPluginUtils } from "./GrafikaPluginUtils";
import { GptPlotAnalyzer } from "../ai/gpt/GptPlotAnalyzer";
import { AbstractGraphApi } from "../graph/core/AbstractGraphApi";
import { GraphRenderer } from "../renderer/GraphRenderer";
import { v4 as uuid } from "uuid";

type MarkdownCodeBlockHandler = (
    sourceCode: string,
    el: HTMLElement,
    p: MarkdownPostProcessorContext,
) => Promise<void>;

export default class GrafikaPlugin extends Plugin {
    settings: GrafikaPluginSettings;
    private pluginUtils: GrafikaPluginUtils;

    private graphApis: Record<string, IGraphApi>;

    public get apis(): Record<string, IGraphApi> {
        return this.graphApis;
    }

    async onload() {
        await this.loadSettings();
        
        this.graphApis = {};
        
        this.pluginUtils = new GrafikaPluginUtils(
            this.settings,
            this.app.vault,
            this.app.metadataCache,
            this.app.workspace,
        );

        this.loadGraphApis();

        this.addSettingTab(new GrafikaSettingTab(this.app, this));

        // Register a plugin in order to enable/disable syntax highlighting via CodeMirror v5
        this.registerEditorExtension(
            CodemirrorRegisterer.viewPlugin(REGISTRABLE_LANGUAGES),
        );

        // Wait for layout ready to rerender active view to apply the new syntax highlighting
        const layoutReady = () =>
            this.app.workspace
                .getActiveViewOfType(MarkdownView)
                ?.previewMode.rerender(true);

        this.app.workspace.onLayoutReady(layoutReady);
    }

    onunload() {
        // TODO Check if code block processors require unregistering
        this.graphApis = {};
    }

    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData(),
        );
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    private loadGraphApis() {
        const { openaiApiKey, openaiModel } = this.settings;

        const plotAnalyzer = new GptPlotAnalyzer(openaiModel, openaiApiKey);
        const graphApis = buildGraphApis(this.pluginUtils);

        // Register APIs
        graphApis.forEach(({ api, language }) => {
            this.graphApis[api.apiName] = api.make();

            this.registerMarkdownCodeBlockProcessor(
                language,
                this.markdownCodeBlockHandler(api, plotAnalyzer),
            );
        });
    }

    // Return a closure() that will handle the markdown code block for the given API and
    // using the given plot analyzer for the AI analysis
    private markdownCodeBlockHandler(
        api: AbstractGraphApi,
        plotAnalyzer: GptPlotAnalyzer,
    ): MarkdownCodeBlockHandler {
        return async (
            sourceCode: string,
            el: HTMLElement,
            ppc: MarkdownPostProcessorContext,
        ) => {
            const wrapper = el.createEl("div", {
                cls: "",
                attr: { id: `graph-wrapper-${uuid()}` },
            });

            const analyzeButton = wrapper.createEl("button", {
                text: "Analyze with AI",
            });
            const rendererContainer = wrapper.createEl("div");
            const analysisResultsContainer = wrapper.createEl("div");

            wrapper.appendChild(analyzeButton);
            wrapper.appendChild(rendererContainer);
            wrapper.appendChild(analysisResultsContainer);

            el.appendChild(wrapper);

            const process = new GraphRenderer(
                sourceCode,
                api,
                plotAnalyzer,
                this.markdownRenderer(ppc.sourcePath),
                {
                    rendererContainer,
                    analyzeButton,
                    analysisResultsContainer,
                },
            );

            await process.start();
        };
    }

    // Return a closure() that will render the markdown content
    // only requiring markdown text and a container for the rendered content
    private markdownRenderer(
        sourcePath: string,
    ): (markdown: string, markdownContainer: HTMLElement) => Promise<void> {
        return async (markdown, markdownContainer) => {
            await MarkdownRenderer.render(
                this.app,
                markdown,
                markdownContainer,
                sourcePath,
                this,
            );
        };
    }
}
