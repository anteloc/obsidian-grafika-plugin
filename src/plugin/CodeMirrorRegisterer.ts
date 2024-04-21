import {
    ViewUpdate,
    PluginValue,
    EditorView,
    ViewPlugin,
} from "@codemirror/view";

export class CodemirrorRegisterer implements PluginValue {
    private static SUPPORTED_MODES: Record<string, Record<string, string>> = {
        javascript: {
            name: "javascript",
            mime: "text/javascript",
        },
    };

    static languagesToRegister: Record<string, string>[];

    static viewPlugin(languagesToRegister: Record<string, string>[]) {
        CodemirrorRegisterer.languagesToRegister = languagesToRegister;
        return ViewPlugin.fromClass(CodemirrorRegisterer);
    }

    constructor(_view: EditorView) {
        // This is a workaround to register languages in CodeMirror when 
        // the modes have already been loaded.
        CodemirrorRegisterer.languagesToRegister.forEach((reg) => {
            const parentMode =
                CodemirrorRegisterer.SUPPORTED_MODES[reg.parentLanguage];
                
            this.registerLanguage(
                reg.language,
                parentMode.name,
                parentMode.mime,
            );
        });
    }

    private registerLanguage(language: string, modeName: string, mime: string) {
        // Set globally by Obsidian
        CodeMirror.defineMode(language, (_n, _m) =>
            CodeMirror.getMode(modeName, mime),
        );
    }

    update(_update: ViewUpdate) {
        // Empty for now
    }

    destroy() {
        // Empty for now
    }
}
