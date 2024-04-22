import { AbstractGraphApi } from "../core/AbstractGraphApi";
import { ApiDependency } from "../core/IGraphApi";
import { apiDependencies } from "./VisNetworkDependencies";
import { commonDependencies } from "../core/GraphCommonDependencies";

const screenshotSetup = require("./sandboxed/network/screenshotSetup.js.src");
const graphContainer = require("./sandboxed/network/graphContainer.html.src");

export class VisNetworkApi extends AbstractGraphApi {
    static PARENT_LANGUAGE = "javascript";

    public dependencies(): ApiDependency[] {
        return [
            ...commonDependencies(),
            ...apiDependencies(),
        ];
    }

    public screenshotSetupJs(): string {
        return screenshotSetup;
    }

    public graphContainerHtml(_cls: string): string {
        return graphContainer;
    }
}
