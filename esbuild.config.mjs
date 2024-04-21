import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";
import fs from "fs";
import { Readable } from "stream";
import path from "path";

const download = async (url, path) =>
    Readable.fromWeb((await fetch(url)).body).pipe(fs.createWriteStream(path));

const copyOnStart = (fromTos) => {
    return {
        name: "copyAsSrc",
        setup(build) {
            build.onStart(() =>
                fromTos.forEach(({ from, to }) => {
                    console.log("Copying:", from, "->", to);

                    from.startsWith("https://")
                        ? download(from, to)
                        : fs.cpSync(
                              from,
                              path.join(
                                  path.dirname(build.initialOptions.outfile),
                                  to,
                              ),
                              {
                                  recursive: true,
                                  force: true,
                                  dereference: true,
                              },
                          );
                }),
            );
        },
    };
};

const toSandbox = (sandboxDir, froms) =>
    froms.map((from) => ({
        from: from,
        to: `${path.join(sandboxDir, path.basename(from))}.src`,
    }));

const banner = `/*
Building Grafika Obsidian Plugin...
*/
`;

const prod = process.argv[2] === "production";

// FIXME This could fail: No node_modules browser minified version for voca, fetch from online
const commonDeps = toSandbox("./src/graph/core/sandboxed", [
    "https://raw.githubusercontent.com/panzerdp/voca/v1.4.0/dist/voca.min.js",
    "./node_modules/underscore/underscore-umd-min.js",
    "./node_modules/uuid/dist/umd/uuidv4.min.js",
    "./node_modules/moment/min/moment.min.js",
]);

const echartsDeps = toSandbox("./src/graph/echarts/sandboxed", [
    "./node_modules/echarts/dist/echarts.min.js",
    "./node_modules/echarts-gl/dist/echarts-gl.min.js",
]);

const chartJsDeps = toSandbox("./src/graph/chartjs/sandboxed", [
    "./node_modules/chart.js/dist/chart.umd.js",
]);

const visJsDeps = toSandbox("./src/graph/visjs/sandboxed", [
    "./node_modules/vis-network/standalone/umd/vis-network.min.js",
    "./node_modules/vis-timeline/standalone/umd/vis-timeline-graph2d.min.js",
    "./node_modules/vis-data/standalone/umd/vis-data.min.js",
    "./node_modules/timeline-arrows/arrow.js"
]);

const filesToSrc = [].concat(commonDeps, echartsDeps, chartJsDeps, visJsDeps);

const context = await esbuild.context({
    banner: {
        js: banner,
    },
    entryPoints: ["src/main.ts"],
    bundle: true,
    plugins: [copyOnStart(filesToSrc)],
    loader: {
        ".src": "text",
    },
    external: [
        "obsidian",
        "electron",
        "@codemirror/autocomplete",
        "@codemirror/collab",
        "@codemirror/commands",
        "@codemirror/language",
        "@codemirror/lint",
        "@codemirror/search",
        "@codemirror/state",
        "@codemirror/view",
        "@lezer/common",
        "@lezer/highlight",
        "@lezer/lr",
        ...builtins,
    ],
    format: "cjs",
    target: "es2018",
    logLevel: "info",
    sourcemap: prod ? false : "inline",
    treeShaking: true,
    outfile: "main.js",
});

if (prod) {
    await context.rebuild();
    process.exit(0);
} else {
    await context.watch();
}
