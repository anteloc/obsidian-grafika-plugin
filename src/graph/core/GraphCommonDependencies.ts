import { ApiDependency } from "./IGraphApi";

export const commonDependencies: () => ApiDependency[] = () => {
    return [
        {
            id: "moment",
            defaultVar: "moment",
            mode: "sandboxed",
            type: "non-module",
            contents: require("./sandboxed/moment.min.js.src"),
        },
        {
            id: "underscore",
            defaultVar: "_",
            mode: "sandboxed",
            type: "non-module",
            contents: require("./sandboxed/underscore-umd-min.js.src"),
        },
        {
            id: "voca",
            defaultVar: "v",
            mode: "sandboxed",
            type: "non-module",
            contents: require("./sandboxed/voca.min.js.src"),
        },
        {
            id: "uuid",
            defaultVar: "uuidv4",
            mode: "sandboxed",
            type: "non-module",
            contents: require("./sandboxed/uuidv4.min.js.src"),
        },
    ];
};
