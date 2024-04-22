import { ApiDependency } from "../core/IGraphApi";

export const apiDependencies: () => ApiDependency[] = () => {
    return [
        {
            id: "timeline-arrows",
            defaultVar: "Arrow",
            type: "module",
            contents: require("./sandboxed/timeline/arrow.js.src"),
        },
        {
            id: "vis-timeline/standalone",
            defaultVar: "vis",
            type: "non-module",
            contents: require("./sandboxed/timeline/vis-timeline-graph2d.min.js.src"),
        },
    ];
};
