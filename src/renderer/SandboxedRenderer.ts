import { blob2url } from "../utils/Utils";
import { Sandbox, SandboxPlaceholderValues, SandboxedScript } from "./Sandbox";
import { ApiDependency } from "../graph/core/IGraphApi";

import voca from "voca";

export type SandboxedCodeFragments = {
    apiName: string;
    dependenciesPreamble?: string;
    screenshotSetup: string;
    graphContainer: string;
    graphSourceCode: string;
};

export class SandboxedRenderer {
    private sandbox: Sandbox;
    private dependenciesScripts: SandboxedScript[];

    constructor(
        private codeFragments: SandboxedCodeFragments,
        // private sourceCode: string,
        // private apiName: string,
        private dependencies: ApiDependency[],
        // private sandboxedScreenshotSetup: (screenshotCtx) => void,
        private screenshotHandler: (
            captured: { dataUrl: URL },
            responseId: string,
        ) => void,
        // private graphContainerHtml: string,
        private rendererContainer: HTMLElement,
    ) {
        this.dependenciesScripts = this.sandboxedDependenciesScripts();
        this.codeFragments.dependenciesPreamble = this.dependenciesPreamble();
    }

    public takeScreenshot(requestId: string) {
        this.sandbox.sendMessage("screenshot", { requestId });
    }

    public async renderGraph() {
        const {apiName: __API_NAME__, 
            graphContainer: __GRAPH_CONTAINER__, 
            dependenciesPreamble: __DEPENDENCIES_PREAMBLE__, 
            screenshotSetup: __SCREENSHOT_SETUP_FUNCTION__, 
            graphSourceCode: __GRAPH_SOURCE_CODE__} = this.codeFragments;

        const placeholderValues: SandboxPlaceholderValues = {
            __API_NAME__,
            __GRAPH_CONTAINER__,
            __DEPENDENCIES_PREAMBLE__,
            __SCREENSHOT_SETUP_FUNCTION__,
            __GRAPH_SOURCE_CODE__,
        };

        this.sandbox = new Sandbox(
            this.rendererContainer,
            placeholderValues,
            this.dependenciesScripts,
            true,
            this.handleCodeError.bind(this),
            this.handleScreenshotCaptured.bind(this),
        );

        await this.sandbox.start();
    }

    private sandboxedDependenciesScripts(): SandboxedScript[] {
        return this.dependencies.map(
            ({ id, url, contents, type }) => ({
                id,
                src: url || (contents && blob2url(contents, "text/javascript")),
                type: type === "module" ? "module" : undefined,
            }),
        );
    }

    private dependenciesPreamble(): string {
        return this.dependencies
            .map(({ id, type, defaultVar, exportsVars }, idx) => {
                if (type !== "module") return "";

                const src = this.dependenciesScripts[idx].src;

                const defaultVarImport = defaultVar
                    ? `import ${defaultVar} from '${src}';`
                    : `// No default export for ${id}`;

                const exportsVarsImport = exportsVars
                    ? `import { ${exportsVars.join(", ")} } from '${src}';`
                    : `// No named exports for ${id}`;

                return `
                // Imports for ${id} dependency
                ${defaultVarImport}
                ${exportsVarsImport}
                `;
            })
            .join("\n");
    }

    protected handleScreenshotCaptured(
        captured: { dataUrl: URL },
        responseId: string,
    ) {
        this.screenshotHandler(captured, responseId);
    }

    protected handleCodeError(codeError: Error) {
        console.log(
            "SandboxRenderer: codeError on sandboxed script",
            codeError,
        );

        this.renderError(
            codeError.sourceCode,
            codeError,
            this.rendererContainer,
        );
    }

    // FIXME Use a library for this, maybe one with tracing support in order to get the correct line.
    // Currently, many errors are either not correctly associated with the source code or not displayed at all,
    // only the DevTools console shows the error message.
    protected async renderError(
        sourceCode: string | null,
        error: Error,
        errorContainer: HTMLElement,
    ) {
        // Ideas:
        // 1. Provide correct line numbers for the errors, current line numbers are not valid due to
        //   the preamble code added to the code block
        // 2. Provide error markers to show on top of source code, a very basic version of this for starters
        // const errorsContainer = this.errorsContainer(el, "width: 100%; height: 100px; overflow: auto;");
        // 3. Use a library for this!

        const sourceLines = sourceCode?.split("\n") || [];

        const errorText = error.stack
            ? error.stack.toString()
            : error.toString();

        const errorTextLines = errorText.split("\n");

        // FIXME Line number from stack message not always match source code,
        // maybe due to comments and empty lines removed from the original
        // code during execution
        const displayText = errorTextLines
            .map((etl) => {
                const errorPos = this.errorPos(etl);
                const codeFragment = errorPos
                    ? sourceLines[errorPos.line - 1]?.substring(
                          errorPos.col - 1,
                      )
                    : null;

                let displayLine = codeFragment
                    ? `${etl} >> ${codeFragment}`
                    : etl;
                displayLine = voca.truncate(displayLine, 100, "...");

                return displayLine;
            })
            .join("\n");

        errorContainer.innerHTML = "";
        errorContainer.createEl("pre", {
            cls: "width: 100%; height: 100px; overflow: auto;",
            text: `
FIXME Wrong error code fragment depending on source code structure
${displayText}
`,
        });
    }

    private errorPos(line: string): { line: number; col: number } | null {
        const parsePos = (l: string, re: RegExp) => {
            const m = l.match(re);
            return m ? { line: parseInt(m[1]), col: parseInt(m[2]) } : null;
        };

        const anonymousPos = (l: string) =>
            parsePos(l, /<anonymous>:(.*):.*\)$/);
        const scrDocPos = (l: string) =>
            parsePos(l, /\(?about:srcdoc:(.*):(.*)\)?$/);

        return anonymousPos(line) || scrDocPos(line);
    }
}
