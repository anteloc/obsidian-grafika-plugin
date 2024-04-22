import { ApiDependency } from "./IGraphApi";

export const commonDependencies: () => ApiDependency[] = () => {
    return [
        {
            id: "html2canvas",
            defaultVar: "html2canvas",
            type: "non-module",
            contents: require("./sandboxed/html2canvas.min.js.src"),
        },
        {
            id: "moment",
            defaultVar: "moment",
            type: "non-module",
            contents: require("./sandboxed/moment.min.js.src"),
        },
        {
            id: "underscore",
            defaultVar: "_",
            type: "non-module",
            contents: require("./sandboxed/underscore-umd-min.js.src"),
        },
        {
            id: "voca",
            defaultVar: "v",
            type: "non-module",
            contents: require("./sandboxed/voca.min.js.src"),
        },
        {
            id: "uuid",
            defaultVar: "uuidv4",
            type: "non-module",
            contents: require("./sandboxed/uuidv4.min.js.src"),
        },
    ];
};
