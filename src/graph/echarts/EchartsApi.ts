import { AbstractGraphApi } from "../core/AbstractGraphApi";
import { ApiDependency } from "../core/IGraphApi";
import { apiDependencies } from "./EchartsDependencies";
import { commonDependencies } from "../core/GraphCommonDependencies";

export class EchartsApi extends AbstractGraphApi {
    static PARENT_LANGUAGE = "javascript";

    public dependencies(): ApiDependency[] {
        return [...commonDependencies(), ...apiDependencies()];
    }

    // Will not be executed in the context of the plugin, 
    // but added as a string to the context of the renderer. i. e. sandboxedScreenshotSetup.toString()
    public sandboxedScreenshotSetup(screenshotCtx) {
        const originalInit = echarts.init;

        echarts.init = function (el, theme, opts) {
            const chart = originalInit(el, theme, opts);

            // Make a screenshot function available to be used in the context
            screenshotCtx.captureScreenshot = () => {
                const chartOpts = chart.getOption();
                const renderer = chartOpts.renderer || "canvas"; 
                const mimeType = renderer === "svg" ? "image/svg+xml" : "image/png";
                const imgDataUrl = chart.getDataURL({ excludeComponents: ["toolbox"] });
                return { mimeType, dataUrl: imgDataUrl };
            }

            return chart;
        };
    }
}
