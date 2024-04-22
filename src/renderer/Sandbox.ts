// Source adapted from: https://github.com/apache/echarts-examples/blob/gh-pages/src/editor/sandbox/index.js
import { v4 as uuid } from "uuid";

const SRCDOC_TEMPLATE = require("./sandboxed/srcdoc.html.src");

export type SandboxedScript = {
    id: string;
    type?: string;
    src?: string;
    content?: string;
};

export type SandboxPlaceholderValues = {
    __LANG__?: string; // Reserved for internal use
    __CSP__?: string; // Reserved for internal use
    __API_NAME__: string;
    __GRAPH_CONTAINER__: string;
    __SCRIPTS__?: string; // Reserved for internal use
    __DEPENDENCIES_PREAMBLE__: string;
    __SCREENSHOT_SETUP_FUNCTION__: string;
    __GRAPH_SOURCE_CODE__: string;
};

export class Sandbox {
    static readonly SANDBOX_ALLOW = [
        "allow-pointer-lock",
        "allow-scripts",
        "allow-downloads",
        "allow-same-origin",
    ];

    static readonly SANDBOX_SHARED_ALLOW = [
        "allow-popups",
        "allow-popups-to-escape-sandbox",
        "allow-modals",
    ];

    static readonly CSP = {
        "default-src": [
            `'self'`,
            `'unsafe-inline'`,
            `'unsafe-eval'`,
            "data:",
            "blob:",
            // TODO Disable this for future web versions?
            "filesystem:",
            "https://*",
        ],
        "frame-src": [`'none'`],
        "object-src": [`'none'`],
        "navigate-to": [`'none'`],
        "worker-src": [`'none'`],
    };

    // TODO Review if this should be modified, hardcoded or passed as a parameter
    static readonly SANDBOX_STYLE =
        "width:700px;height:700px;border:2px solid black;background:none";

    private sandboxId: string;
    private allow;
    private csp;
    private sandboxed: HTMLIFrameElement;

    constructor(
        public sandboxContainer: HTMLElement,
        private placeholderValues: SandboxPlaceholderValues,
        private scripts: SandboxedScript[],
        private isShared: boolean,
        private onerror: (e: string) => void,
        private handleCodeError: (codeError: Error) => void,
        private handleScreenshotCaptured: (
            captured: { imgDataUrl: URL },
            responseId: string,
        ) => void,
    ) {
        this.sandboxId = `sandbox-${uuid()}`;

        this.allow = this.isShared
            ? [...Sandbox.SANDBOX_ALLOW, ...Sandbox.SANDBOX_SHARED_ALLOW]
            : [...Sandbox.SANDBOX_ALLOW];

        this.csp = this.isShared && { ...Sandbox.CSP };
    }

    public get srcdoc() {
        return this.sandboxed.srcdoc;
    }

    public async start() {
        this.placeholderValues.__LANG__ = document.documentElement.lang || "en";
        this.placeholderValues.__CSP__ = "";

        if (this.csp) {
            for (const [k, v] of Object.entries(this.csp)) {
                this.placeholderValues.__CSP__ += `${k} ${v.join(" ")}; `;
            }
        }

        this.placeholderValues.__SCRIPTS__ = this.scripts
            .map((s) => this.scriptTag(s))
            .join("\n");

        const sandbox = this.setupSandbox(this.allow.join(" "));

        this.sandboxContainer.appendChild(sandbox);

        this.sandboxed = sandbox;
    }

    private setupSandbox(allowStr: string): HTMLIFrameElement {
        const sandbox = document.createElement("iframe");

        sandbox.style.cssText = Sandbox.SANDBOX_STYLE;

        sandbox.setAttribute("id", this.sandboxId);
        sandbox.setAttribute("sandbox", allowStr);
        sandbox.setAttribute("csp", this.placeholderValues.__CSP__);

        sandbox.srcdoc = this.fillTemplate();
        this.addSandboxEventListeners(sandbox);

        return sandbox;
    }

    private fillTemplate(): string {
        let srcdoc = SRCDOC_TEMPLATE;

        for (const [placeholder, value] of Object.entries(
            this.placeholderValues,
        )) {
            srcdoc = srcdoc.replace(placeholder, value);
        }

        return srcdoc;
    }

    private addSandboxEventListeners(sandbox: HTMLIFrameElement) {
        sandbox.addEventListener("load", (_evt: Event) => {
            // console.log("sandbox loaded, evt:", _evt);

            this.addContentWindowEventListeners();

            // FIXME - Legacy fixme from the original source
            // No good way to prevent the user from trying to redirect the iframe via `document.location.href = xxx`
            // This is a tricky way
            // `onload` will be triggered again after the iframe redirects
            // here we check and block it as we usually won't do this
            if (sandbox.__loaded__ && this.isShared) {
                // const errorMsg =
                //     "potential redirection from the code was blocked";
                // console.error(errorMsg);
                // this.onerror(errorMsg);
                return;
            }
            sandbox.__loaded__ = true;
        });

        sandbox.addEventListener("error", (event: Event) =>
            this.onerror(event.toString()),
        );
    }

    private addContentWindowEventListeners() {
        const messageListener = this.handleMessage.bind(this);

        this.sandboxed.contentWindow?.addEventListener(
            "message",
            messageListener,
            false,
        );

        // Automatically remove the message listener when the iframe is unloaded
        const unloadListener = (_evt: Event) =>
            this.sandboxed.contentWindow?.removeEventListener(
                "message",
                messageListener,
                false,
            );

        this.sandboxed.contentWindow?.addEventListener(
            "unload",
            unloadListener,
            false,
        );
    }

    public sendMessage(type: string, message: object) {
        // console.log("Sending message to sandboxed iframe contentWindow:", this.sandboxed.contentWindow, evt, message);
        this.sandboxed.contentWindow?.postMessage({ type, ...message }, "*");
    }

    private handleMessage(event: MessageEvent) {
        const message = event.data;

        switch (message.type) {
            case "codeError":
                message.error.sourceCode = this.srcdoc;
                this.handleCodeError(message.error);
                break;
            case "screenshotCaptured":
                this.handleScreenshotCaptured(
                    message.captured,
                    message.responseId,
                );
                break;
            case "error":
            case "unhandledRejection":
                this.onerror(event.toString());
                break;
            default:
                break;
        }
    }

    private scriptTag(script: SandboxedScript): string {
        const typeAttr = script.type ? `type="${script.type}"` : "";

        return script.content
            ? `
           <!-- Inline script -->
           <script defer id="${script.id}" ${typeAttr}>${script.content}</script>
           `
            : `
           <!-- External script -->
           <script defer id="${script.id}" ${typeAttr} src="${script.src}"></script>
           `;
    }
}
