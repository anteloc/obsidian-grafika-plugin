
import { AbstractGraphApi } from "../core/AbstractGraphApi";
import { ApiDependency } from "../core/IGraphApi";
import { commonDependencies } from "../core/GraphCommonDependencies";
import { apiDependencies} from "./VisTimelineDependencies";


export class VisTimelineApi extends AbstractGraphApi {
    static PARENT_LANGUAGE = "javascript";

    public dependencies(): ApiDependency[] {
        return [
            ...commonDependencies(),
            ...apiDependencies(),
        ];
    }
    
    public graphContainerHtml(_cls: string): string {
        // FIXME Styles should fit the iframe sandboxed container
        // Maybe move the styles to the iframe or a new iframe's styles.css file?
        return `
        <style>
            .vis-timeline-container {
                width: 700px;
                height: 100%;
                margin: 0;
                padding: 0;
                cursor: default;
                overflow: visible;
                background: rgb(251, 250, 246);
                border: 2px solid black;
            }
        </style>
        <div id="graph-container" class="vis-timeline-container"></div>
        `;
    }
}
