import { AbstractGraphApi } from "../core/AbstractGraphApi";
import { ApiDependency } from "../core/IGraphApi";
import { apiDependencies } from "./EchartsDependencies";
import { commonDependencies } from "../core/GraphCommonDependencies";

const screenshotSetup = require("./sandboxed/screenshotSetup.js.src");

export class EchartsApi extends AbstractGraphApi {
    static PARENT_LANGUAGE = "javascript";

    public dependencies(): ApiDependency[] {
        return [...commonDependencies(), ...apiDependencies()];
    }

    protected screenshotSetupJs(): string {
        return screenshotSetup;
    }

    // Will not be executed in the context of the plugin, 
    // but added as a string to the context of the renderer. i. e. sandboxedScreenshotSetup.toString()
    // public sandboxedScreenshotSetup(screenshotCtx) {
    //     const originalInit = echarts.init;

    //     echarts.init = function (el, theme, opts) {
    //         const chart = originalInit(el, theme, opts);

    //         // Make a screenshot function available to be used in the context
    //         screenshotCtx.captureScreenshot = () => chart.getDataURL({ excludeComponents: ["toolbox"] });

    //         return chart;
    //     };
    // }
}
