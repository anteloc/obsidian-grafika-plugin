import { ApiDependency } from "../core/IGraphApi";

export const apiDependencies: () => ApiDependency[] = () => {
    return [
        // FIXME Review defaultVar and / or exportVars
        {
            id: "echarts",
            mode: "sandboxed",
            type: "module",
            contents: require("./sandboxed/echarts.min.js.src"),
        },
        {
            id: "echarts-gl",
            mode: "sandboxed",
            type: "non-module",
            contents: require("./sandboxed/echarts-gl.min.js.src"),
        },
    ];
};
