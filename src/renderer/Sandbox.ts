// Source adapted from: https://github.com/apache/echarts-examples/blob/gh-pages/src/editor/sandbox/index.js
import { v4 as uuid } from "uuid";

const SRCDOC_TEMPLATE = require("./sandboxed/srcdoc.html.src");

export type SandboxedScript = {
    id: string;
    type?: string;
    src?: string;
    content?: string;
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

    static readonly SANDBOX_STYLE =
        "width:700px;height:700px;border:2px solid black;background:none";

    private sandboxId: string;
    private allow;
    private csp;
    private sandboxed: HTMLIFrameElement;

    constructor(
        public sandboxContainer: HTMLElement,
        private graphContainerHtml: string,
        private scripts: SandboxedScript[],
        private isShared: boolean,
        private onerror: (e: string) => void,
        private onCodeError: (codeError: Error) => void,
        private onScreenshotCaptured: (
            imgDataUrl: URL,
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
        const lang = document.documentElement.lang || "en";
        const allowStr = this.allow.join(" ");
        const cspStr =
            this.csp &&
            Object.entries(this.csp)
                .map(([k, v]) => `${k} ${v.join(" ")}`)
                .join("; ");

        const scriptsStr = this.scripts
            .map((s) => this.scriptTag(s))
            .join("\n");

        const sandbox = document.createElement("iframe");

        sandbox.style.cssText = Sandbox.SANDBOX_STYLE;

        sandbox.setAttribute("id", this.sandboxId);
        sandbox.setAttribute("sandbox", allowStr);
        cspStr && sandbox.setAttribute("csp", cspStr);

        sandbox.srcdoc = SRCDOC_TEMPLATE.replace("__LANG__", lang)
            .replace("__CSP__", cspStr || "")
            .replace("__GRAPH_CONTAINER__", this.graphContainerHtml)
            .replace("__SCRIPTS__", scriptsStr);

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

        this.sandboxContainer.appendChild(sandbox);

        this.sandboxed = sandbox;
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

    // TODO Unused for now,
    // - sends messages to the contentWindow of the sandboxed iframe
    // - determine the actions and objects to be sent in case some interaction
    // with the iframe is required
    // FIXME Add proper types according to window.postMessage() signature
    public sendMessage(type: string, message: object) {
        // console.log("Sending message to sandboxed iframe contentWindow:", this.sandboxed.contentWindow, evt, message);
            this.sandboxed.contentWindow?.postMessage({ type, ...message }, "*");
    }

    private handleMessage(event: MessageEvent) {
        const message = event.data;

        switch (message.type) {
            case "codeError":
                message.error.sourceCode = this.srcdoc;
                this.onCodeError(message.error);
                break;
            case "screenshotCaptured":
                this.onScreenshotCaptured(message.captured, message.responseId);
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
