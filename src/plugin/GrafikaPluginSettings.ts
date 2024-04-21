import { App, Modal, Notice, PluginSettingTab, Setting } from "obsidian";
import GrafikaPlugin from "./GrafikaPlugin";
import {
    DEFAULT_ANALYZE_IMAGE_PROMPT,
    DEFAULT_GPT_MODEL,
    DEFAULT_MAX_WORDS,
    DEFAULT_SYSTEM_PROMPT,
    OPENAI_MODELS,
} from "src/ai/gpt/GptModels";

export interface GrafikaPluginSettings {
    openai: {
        apiKey: string;
        model: string;
        systemPrompt: string;
        analyzeImagePrompt: string;
        maxWords: number;
    };
    externalApiKeys: { apiName: string; key: string }[];
}

export const DEFAULT_SETTINGS: GrafikaPluginSettings = {
    openai: {
        apiKey: "",
        model: DEFAULT_GPT_MODEL.model,
        systemPrompt: DEFAULT_SYSTEM_PROMPT,
        analyzeImagePrompt: DEFAULT_ANALYZE_IMAGE_PROMPT,
        maxWords: DEFAULT_MAX_WORDS,
    },
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
        const openai = this.plugin.settings.openai;

        new Setting(containerEl).setName("OpenAI").setHeading();

        new Setting(containerEl)
            .setName("GPT API Key")
            .setDesc("Required for analyzing plots with GPT")
            .addText((text) =>
                text
                    .setPlaceholder("Enter your API key")
                    .setValue(openai.apiKey)
                    .onChange(async (value) => {
                        openai.apiKey = value;
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

                modelSelector.setValue(openai.model).onChange(async (model) => {
                    openai.model = model;
                    await this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName("System Prompt")
            .setDesc("GPT will assume the role described in this prompt")
            .addTextArea((text) => {
                const el = text.inputEl;

                el.rows = 10;
                el.cols = 50;
                // el.style.width = "100%";
                el.style.resize = "none";

                text.setValue(openai.systemPrompt).onChange(async (value) => {
                    openai.systemPrompt = value;
                    await this.plugin.saveSettings();
                });
            })
            .addButton((button) => {
                button.setButtonText("Reset").onClick(async () => {
                    openai.systemPrompt = DEFAULT_SYSTEM_PROMPT;
                    await this.plugin.saveSettings();
                    this.display();
                });
            });

        new Setting(containerEl)
            .setName("Analyze Plot Prompt")
            .setDesc(
                "GPT will analyze the plot according to the instructions in this prompt",
            )
            .addTextArea((text) => {
                const el = text.inputEl;

                el.rows = 10;
                el.cols = 50;
                // el.style.width = "100%";
                el.style.resize = "none";

                text.setValue(openai.analyzeImagePrompt).onChange(
                    async (value) => {
                        openai.analyzeImagePrompt = value;
                        await this.plugin.saveSettings();
                    },
                );
            })
            .addButton((button) => {
                button.setButtonText("Reset").onClick(async () => {
                    openai.analyzeImagePrompt = DEFAULT_ANALYZE_IMAGE_PROMPT;
                    await this.plugin.saveSettings();
                    this.display();
                });
            });

        new Setting(containerEl)
            .setName("Max Words")
            .setDesc("Maximum number of words in GPT's response")
            .addText((text) => {
                text.setValue(openai.maxWords.toString()).onChange(
                    async (value) => {
                        try {
                            openai.maxWords = parseInt(value);
                            await this.plugin.saveSettings();
                        } catch (error) {
                            new Notice(`Invalid maxWords value: '${value}'`);
                        }
                    },
                );
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
