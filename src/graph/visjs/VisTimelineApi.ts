import { AbstractGraphApi } from "../core/AbstractGraphApi";
import { ApiDependency } from "../core/IGraphApi";
import { commonDependencies } from "../core/GraphCommonDependencies";
import { apiDependencies} from "./VisTimelineDependencies";

const screenshotSetup = require("./sandboxed/timeline/screenshotSetup.js.src");
const graphContainer = require("./sandboxed/timeline/graphContainer.html.src");
const timelineCss = require("./sandboxed/timeline/vis-timeline-graph2d.css.src");

export class VisTimelineApi extends AbstractGraphApi {
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
        // FIXME Styles should fit the iframe sandboxed container
        // Maybe move the styles to the iframe or a new iframe's styles.css file?
        return graphContainer.replace("__VIS_TIMELINE_CSS__", timelineCss);
    }
}
