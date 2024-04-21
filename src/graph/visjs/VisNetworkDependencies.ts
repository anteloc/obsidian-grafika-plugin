import { ApiDependency } from "../core/IGraphApi";

export const apiDependencies: () => ApiDependency[] = () => {
    return [
        {
            id: "vis-network/standalone",
            defaultVar: "vis",
            mode: "sandboxed",
            type: "non-module",
            contents: require("./sandboxed/vis-network.min.js.src"),
        },
    ];
};
