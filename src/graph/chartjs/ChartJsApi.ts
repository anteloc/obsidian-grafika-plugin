import { AbstractGraphApi } from "../core/AbstractGraphApi";
import { ApiDependency } from "../core/IGraphApi";
import { commonDependencies } from "../core/GraphCommonDependencies";
import { apiDependencies } from "./ChartJsDependencies";

const screenshotSetup = require("./sandboxed/screenshotSetup.js.src");
const graphContainer = require("./sandboxed/graphContainer.html.src");

export class ChartJsApi extends AbstractGraphApi {
    static PARENT_LANGUAGE = "javascript";

    public dependencies(): ApiDependency[] {
        return [
            ...commonDependencies(),
            ...apiDependencies(),
        ];
    }

    protected screenshotSetupJs(): string {
        return screenshotSetup;
    }

    protected graphContainerHtml(_cls: string): string {
        return graphContainer;
    }
}
