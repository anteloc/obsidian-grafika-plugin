import { ApiDependency } from "../core/IGraphApi";

export const apiDependencies: () => ApiDependency[] = () => {
    return [
        {
            id: "chart.js/auto",
            defaultVar: "Chart",
            type: "non-module",
            contents: require("./sandboxed/chart.umd.js.src"),
        },
    ];
};
