import { App, Modal, PluginSettingTab, Setting } from "obsidian";
import GrafikaPlugin from "./GrafikaPlugin";
import { DEFAULT_GPT_MODEL, OPENAI_MODELS } from "src/ai/gpt/GptModels";

export interface GrafikaPluginSettings {
    openaiApiKey: string;
    openaiModel: string;
    externalApiKeys: { apiName: string; key: string }[];
}

export const DEFAULT_SETTINGS: GrafikaPluginSettings = {
    openaiApiKey: "",
    openaiModel: DEFAULT_GPT_MODEL.model,
    externalApiKeys: [{ apiName: "hello", key: "world" }],
};

class AddAPIKeyModal extends Modal {
    apiName: string;
    key: string;
    onSubmit: (apiName: string, key: string) => void;

    constructor(app: App, onSubmit: (apiName: string, key: string) => void) {
        super(app);
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl } = this;

        contentEl.createEl("h1", { text: "Add API Key" });

        new Setting(contentEl).setName("API Name").addText((text) =>
            text.onChange((value) => {
                this.apiName = value;
            }),
        );

        new Setting(contentEl).setName("Key").addText((text) =>
            text.onChange((value) => {
                this.key = value;
            }),
        );

        new Setting(contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText("Add")
                    .setCta()
                    .onClick(() => {
                        this.close();
                        this.onSubmit(this.apiName, this.key);
                    }),
            )
            .addButton((btn) =>
                btn
                    .setButtonText("Cancel")
                    .setCta()
                    .onClick(() => {
                        this.close();
                    }),
            );
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

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
        this.apiKeysSettings(containerEl);
    }

    private openaiSettings(containerEl: HTMLElement) {
        new Setting(containerEl).setName("OpenAI").setHeading();

        new Setting(containerEl)
            .setName("GPT API Key")
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
            .setDesc("Model used for plot analysis")
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

    private apiKeysSettings(containerEl: HTMLElement) {
        const externalApiKeys = this.plugin.settings.externalApiKeys;

        new Setting(containerEl)
            .setName("API Keys")
            .setHeading()
            .addButton((button) => {
                button.setButtonText("+").onClick(() => {
                    new AddAPIKeyModal(this.app, (apiName, key) => {
                        externalApiKeys.push({
                            apiName,
                            key,
                        });

                        this.plugin.saveSettings();

                        this.display();
                    }).open();
                });
            });

        externalApiKeys.forEach(({ apiName: name, key }, idx) => {
            new Setting(containerEl)
                .setName(name)
                // .setDesc("Remote service API key")
                .addText((text) =>
                    text.setValue(key).onChange(async (newKey) => {
                        externalApiKeys[idx] = {
                            apiName: name,
                            key: newKey,
                        };
                        await this.plugin.saveSettings();
                    }),
                )
                .addButton((button) => {
                    button.setIcon("trash-2").onClick(() => {
                        externalApiKeys.splice(idx, 1);
                        this.display();
                    });
                });
        });
    }
}
