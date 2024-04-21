import type { IGraphApi, ApiDependency } from "./IGraphApi";
import { GraphApiUtils } from "./GraphApiUtils";
import { GrafikaPluginUtils } from "src/plugin/GrafikaPluginUtils";

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
    public sandboxedScreenshotSetup(screenshotCtx) {
        screenshotCtx.captureScreenshot = () => {
            throw new Error(
                "Screenshot functionality not implemented by: " + this.apiName,
            );
        };
    }

    public graphContainerHtml(_cls: string): string {
        return '<div id="graph-container"></div>';
    }

    public make(): IGraphApi {
        return {
            apiName: this.apiName,
            utils: this.graphUtils.make(),
        };
    }
}
