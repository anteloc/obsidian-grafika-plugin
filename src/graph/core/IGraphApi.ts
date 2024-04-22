export type GraphFunction = (require: (mod: string) =>  any, gc: HTMLElement, utils: any) => Promise<void>;

// FIXME Add proper documentation
export type ApiDependency = {
    id: string, 
    type: "module" | "non-module",
    defaultVar?: string,
    exportsVars?: string[],
    contents?: string,
    url?: string,
};

export type ApiCodeFragments = {
    apiName: string,
    graphContainerHtml: string,
    screenshotSetupJs: string,
    graphSourceCodeJs: string,
}

export interface IGraphApi {
    apiName: string;
    utils: any;
}

