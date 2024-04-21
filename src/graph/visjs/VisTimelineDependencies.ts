import { ApiDependency } from "../core/IGraphApi";

export const apiDependencies: () => ApiDependency[] = () => {
    return [
        {
            id: "timeline-arrows",
            defaultVar: "Arrow",
            mode: "sandboxed",
            type: "module",
            contents: require("./sandboxed/arrow.js.src"),
        },
        {
            id: "vis-timeline/standalone",
            defaultVar: "vis",
            mode: "sandboxed",
            type: "non-module",
            contents: require("./sandboxed/vis-timeline-graph2d.min.js.src"),
        },
    ];
};
