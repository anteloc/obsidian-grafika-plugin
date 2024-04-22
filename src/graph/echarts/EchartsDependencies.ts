import { ApiDependency } from "../core/IGraphApi";

export const apiDependencies: () => ApiDependency[] = () => {
    return [
        {
            id: "echarts",
            type: "module",
            contents: require("./sandboxed/echarts.min.js.src"),
        },
        {
            id: "echarts-gl",
            type: "non-module",
            contents: require("./sandboxed/echarts-gl.min.js.src"),
        },
    ];
};
