import { AbstractGraphApi } from "../graph/core/AbstractGraphApi";
import { EchartsApi } from "src/graph/echarts/EchartsApi";
import { ChartJsApi } from "src/graph/chartjs/ChartJsApi";
import { VisNetworkApi } from "src/graph/visjs/VisNetworkApi";
import { VisTimelineApi } from "src/graph/visjs/VisTimelineApi";
import { GrafikaPluginUtils } from "./GrafikaPluginUtils";

type GraphApiManifest = {
    language: string;
    parentLanguage: string;
    containerCls: string;
    instance: (...args: any[]) => AbstractGraphApi;
};

const APIS_MANIFESTS: Record<string, GraphApiManifest> = {
    chartjs: {
        language: "chart-js",
        parentLanguage: ChartJsApi.PARENT_LANGUAGE,
        containerCls: "chartjs-container",
        instance: (apiName, pluginUtils, cls) =>
            new ChartJsApi(apiName, pluginUtils, cls) as AbstractGraphApi,
    },
    visnetwork: {
        language: "visnetwork-js",
        parentLanguage: VisNetworkApi.PARENT_LANGUAGE,
        containerCls: "vis-network-container",
        instance: (apiName, pluginUtils, cls) =>
            new VisNetworkApi(apiName, pluginUtils, cls) as AbstractGraphApi,
    },
    vistimeline: {
        language: "vistimeline-js",
        parentLanguage: VisTimelineApi.PARENT_LANGUAGE,
        containerCls: "vis-timeline-container",
        instance: (apiName, pluginUtils, cls) =>
            new VisTimelineApi(apiName, pluginUtils, cls) as AbstractGraphApi,
    },
    echarts: {
        language: "echarts-js",
        parentLanguage: EchartsApi.PARENT_LANGUAGE,
        containerCls: "echarts-container",
        instance: (apiName, pluginUtils, cls) =>
            new EchartsApi(apiName, pluginUtils, cls) as AbstractGraphApi,
    },
};

export const REGISTRABLE_LANGUAGES = Object.values(APIS_MANIFESTS).map(
    (mf) => ({
        language: mf.language,
        parentLanguage: mf.parentLanguage,
    }),
);

export function buildGraphApis(pluginUtils: GrafikaPluginUtils) {
    return Object.entries(APIS_MANIFESTS).map(
        ([apiName, { language, containerCls, instance }]) => ({
            api: instance(apiName, pluginUtils, containerCls),
            language,
        }),
    );
}
