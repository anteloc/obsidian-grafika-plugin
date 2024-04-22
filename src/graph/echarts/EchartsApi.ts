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
}
