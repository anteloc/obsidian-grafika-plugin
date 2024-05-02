import * as prettier from "prettier";

const supportInfo = await prettier.getSupportInfo();
const jsLanguage = (supportInfo).languages.find(
    (lang) => lang.name === "JavaScript",
);

// Custom languages are actually just JavaScript with different names and aliases
const echartsLanguage = {... jsLanguage, name: "EChartsJS", aliases: ["echarts-js"]};
const chartjsLanguage = {... jsLanguage, name: "ChartJS", aliases: ["chart-js"]};
const visjsLanguage = {... jsLanguage, name: "VisJS", aliases: ["visnetwork-js", "vistimeline-js"]};

export const languages = [
    echartsLanguage,
    chartjsLanguage,
    visjsLanguage,
];