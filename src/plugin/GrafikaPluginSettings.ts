import { App, PluginSettingTab, Setting } from "obsidian";
import GrafikaPlugin from "./GrafikaPlugin";
import { DEFAULT_GPT_MODEL, OPENAI_MODELS } from "src/ai/gpt/GptModels";

export interface GrafikaPluginSettings {
    openaiApiKey: string;
    openaiModel: string;
}

export const DEFAULT_SETTINGS: GrafikaPluginSettings = {
    openaiApiKey: "",
    openaiModel: DEFAULT_GPT_MODEL.model,
};

export class GrafikaSettingTab extends PluginSettingTab {
    plugin: GrafikaPlugin;

    constructor(app: App, plugin: GrafikaPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        this.openaiSettings(containerEl);
    }

    private openaiSettings(containerEl: HTMLElement) {
        new Setting(containerEl)
            .setName("OpenAI GPT API Key")
            .setDesc("Required for analyzing plots with GPT")
            .addText((text) =>
                text
                    .setPlaceholder("Enter your API key")
                    .setValue(this.plugin.settings.openaiApiKey)
                    .onChange(async (value) => {
                        this.plugin.settings.openaiApiKey = value;
                        await this.plugin.saveSettings();
                    }),
            );

        new Setting(containerEl)
            .setName("Model")
            .setDesc("OpenAI model to use for the analysis")
            .addDropdown((modelSelector) => {
                // Add models to dropdown in order of preference
                OPENAI_MODELS.forEach(({ name, model }) =>
                    modelSelector.addOption(model, name),
                );

                modelSelector
                    .setValue(this.plugin.settings.openaiModel)
                    .onChange(async (model) => {
                        this.plugin.settings.openaiModel = model;
                        await this.plugin.saveSettings();
                    });
            });
    }
}
