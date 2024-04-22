import type { IGraphApi, ApiDependency, ApiCodeFragments } from "./IGraphApi";
import { GraphApiUtils } from "./GraphApiUtils";
import { GrafikaPluginUtils } from "src/plugin/GrafikaPluginUtils";

const defaultGraphContainer = require("./sandboxed/graphContainer.html.src");

export abstract class AbstractGraphApi {
    private graphUtils: GraphApiUtils;

    constructor(
        public readonly apiName: string,
        pluginUtils: GrafikaPluginUtils,
        public graphContainerCls: string,
    ) {
        this.graphUtils = new GraphApiUtils(pluginUtils);
    }

    public abstract dependencies(): ApiDependency[];

    // Will not be executed in the context of the plugin,
    // but added as a string to the context of the sandboxed renderer, 
    // i. e. sandboxedScreenshotSetup.toString()
    // This is a default implementation, custom screenshot logic should be implemented by subclasses
    // public sandboxedScreenshotSetup(screenshotCtx) {
    //     screenshotCtx.captureScreenshot = () => {
    //         throw new Error(
    //             "Screenshot functionality not implemented by: " + this.apiName,
    //         );
    //     };
    // }

    // FIXME Container's class, maybe get them from child classes? Templates?
    protected graphContainerHtml(_cls: string): string {
        return defaultGraphContainer;
    }

    protected abstract screenshotSetupJs(): string;

    public codeFragments(codeBlock: string): ApiCodeFragments {
        return {
            apiName: this.apiName,
            graphContainerHtml: this.graphContainerHtml(this.graphContainerCls),
            screenshotSetupJs: this.screenshotSetupJs(),
            graphSourceCodeJs: codeBlock,
        };
    }

    public make(): IGraphApi {
        return {
            apiName: this.apiName,
            utils: this.graphUtils.make(),
        };
    }
}
