import { AbstractGraphApi } from "../core/AbstractGraphApi";
import { ApiDependency } from "../core/IGraphApi";
import { commonDependencies } from "../core/GraphCommonDependencies";
import { apiDependencies } from "./ChartJsDependencies";

export class ChartJsApi extends AbstractGraphApi {
    static PARENT_LANGUAGE = "javascript";

    public dependencies(): ApiDependency[] {
        return [
            ...commonDependencies(),
            ...apiDependencies(),
        ];
    }

    public graphContainerHtml(_cls: string): string {
        // TODO Keep it here until cls param can be used to set canvas's style
        return `<canvas id="graph-container"></canvas>`;
    }
}
