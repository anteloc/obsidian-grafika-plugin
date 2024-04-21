import { blob2url } from "../utils/Utils";
import { Sandbox, SandboxedScript } from "./Sandbox";
import { ApiDependency } from "../graph/core/IGraphApi";

import voca from "voca";

export class SandboxedRenderer {
    private sandbox: Sandbox;
    private sandboxedDependencyScripts: SandboxedScript[];

    constructor(
        private sourceCode: string,
        private apiName: string,
        private dependencies: ApiDependency[],
        private sandboxedScreenshotSetup: (screenshotCtx) => void,
        private screenshotHandler: (
            captured: { dataUrl: URL; mimeType: string },
            responseId: string,
        ) => void,
        private graphContainerHtml: string,
        private rendererContainer: HTMLElement,
    ) {
        this.sandboxedDependencyScripts = this.dependencies.map(
            ({ id, url, contents, type }) => ({
                id,
                src: url || (contents && blob2url(contents, "text/javascript")),
                type: type === "module" ? "module" : undefined,
            }),
        );
    }

    public takeScreenshot(requestId: string) {
        this.sandbox.sendMessage("screenshot", { requestId });
    }

    public async renderGraph() {
        // This is here in order to allow the Function() constructor to perform
        // several source code validations, like syntax errors, etc.
        let graphFunction;

        try {
            graphFunction = this.sandboxedGraphFunction()();
        } catch (error) {
            await this.renderError(
                error.sourceCode,
                error,
                this.rendererContainer,
            );
            return;
        }

        // Dependencies will be added as <script> tags to the sandbox iframe,
        // which means the order of this array determines the order of the imports
        const sandboxedScript = `
            ${this.sandboxedDependenciesPreamble()}
            // FIXME Verify that the original init() function is not patched more than once, given that 
            // the sandboxed script is reloaded every time the source code is updated

            // Screenshot setup function
            function ${this.sandboxedScreenshotSetup.toString()}

            const screenshotContext = {
                captureScreenshot: null,
            };

            sandboxedScreenshotSetup(screenshotContext);

            // Message handler closure
            let messageHandler = ${this.sandboxedMessageHandler.toString()}

            // FIXME Will a window.removeEventListener() be necessary?
            // Check: If/when a sandboxed iframe is disposed, will this event listener be automatically removed?
            
            const graphContainer = document.getElementById('graph-container');
            const graphFunction = ${graphFunction.toString()};

            window.addEventListener("load", () => {
                window.addEventListener("message", messageHandler, false);
                graphFunction();
            });
        `;

        const scripts = [
            ...this.sandboxedDependencyScripts,
            { id: "codeblock", type: "module", content: sandboxedScript },
        ];

        this.sandbox = new Sandbox(
            this.rendererContainer,
            this.graphContainerHtml,
            scripts,
            true,
            // TODO Not very useful for now, determine the error cases where this could be useful
            (e: string) => {
                console.log("Error on sandboxed iframe:", e);
            },
            // onCodeError
            this.handleOnCodeError.bind(this),
            // onScreenshotCaptured
            this.handleScreenshotCaptured.bind(this),
        );

        await this.sandbox.start();
    }

    // The returned value will be added as a string to the context of the renderer, i. e. sandboxedMessageHandler.toString()
    protected sandboxedGraphFunction(): Function {
        const asyncWrappedCode = `
            return (async function () { 
                const { utils } = top.app.plugins.plugins.grafika.apis.${this.apiName};

                try {
                    ${this.sourceCode} 
                } catch(error) {
                    window.postMessage({type: 'codeError', error}, 'app://obsidian.md');
                }
            });
        `;

        try {
            return Function(asyncWrappedCode);
        } catch (error) {
            error.sourceCode = asyncWrappedCode;
            throw error;
        }
    }

    // Will be added as a string to the context of the renderer, i. e. sandboxedMessageHandler.toString()
    private sandboxedMessageHandler = (event) => {
        const message = event.data;

        switch (message.type) {
            case "screenshot":
                //console.log("Sandbox: received screenshot request event: ", evt);
                const captured = screenshotContext.captureScreenshot();

                window.postMessage(
                    {
                        type: "screenshotCaptured",
                        captured,
                        responseId: message.requestId,
                    },
                    "app://obsidian.md",
                );
                break;

            default:
                break;
        }
    };

    protected sandboxedDependenciesPreamble(): string {
        // FIXME Too noisy, refactor this to a more readable approach
        return this.dependencies
            .map(({ id, type, defaultVar, exportsVars }, idx) =>
                type !== "module"
                    ? ""
                    : `
                // Imports for ${id} dependency
                ${defaultVar && voca.sprintf("import %s from '%s';", defaultVar, this.sandboxedDependencyScripts[idx].src)}
                ${exportsVars && voca.sprintf("import { %s } from '%s';", exportsVars.join(", "), this.sandboxedDependencyScripts[idx].src)}
                `,
            )
            .join("\n");
    }

    protected handleScreenshotCaptured(
        captured: { dataUrl: URL; mimeType: string },
        responseId: string,
    ) {
        this.screenshotHandler(captured, responseId);
    }

    protected handleOnCodeError(codeError: Error) {
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

    protected async renderError(
        sourceCode: string | null,
        error: Error,
        errorContainer: HTMLElement,
    ) {
        // Ideas:
        // 1. Provide line numbers for the errors, current line numbers are not valid due to
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
