import { ApiDependency } from "../core/IGraphApi";

export const apiDependencies: () => ApiDependency[] = () => {
    return [
        {
            id: "vis-network/standalone",
            defaultVar: "vis",
            type: "non-module",
            contents: require("./sandboxed/network/vis-network.min.js.src"),
        },
    ];
};
