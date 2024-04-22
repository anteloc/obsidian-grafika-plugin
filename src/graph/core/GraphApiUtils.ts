import * as d3 from "d3";
import * as _ from "underscore";
import { createMarkdownArrayTable } from "parse-markdown-table";

import { GrafikaPluginUtils } from "../../plugin/GrafikaPluginUtils";

export type FileDataParsers = {
    csv: (autoType?: boolean) => Promise<Record<string, unknown>[]>;
    tsv: (autoType?: boolean) => Promise<Record<string, unknown>[]>;
    dsv: (
        delim: string,
        autoType?: boolean,
    ) => Promise<Record<string, unknown>[]>;
    json: (autoType?: boolean) => Promise<Record<string, unknown>[]>;
};

export class GraphApiUtils {
    constructor(private pluginUtils: GrafikaPluginUtils) {}

    public make() {
        return {
            tableData: this.tableData,
            fileData: this.fileData,
            assetUrl: this.pluginUtils.assetUrl.bind(this.pluginUtils),
            apiKey: this.pluginUtils.apiKey.bind(this.pluginUtils),
        };
    }

    public get tableData(): (
        tableTag: string,
        autoType?: boolean,
    ) => Promise<Record<string, unknown>[] | undefined> {
        return this.tableDataImpl.bind(this);
    }

    public get fileData(): (filePath: string) => FileDataParsers | null {
        return this.fileDataImpl.bind(this);
    }

    private async tableDataImpl(
        tableTag: string,
        autoType?: boolean,
    ): Promise<Array<object | string> | undefined> {
        // tableTag should be *unique* for a table in the whole vault;
        // if not, the first tagget table found is returned

        const tableMd = await this.pluginUtils.findTaggedTable(tableTag);

        if (!tableMd) {
            return undefined;
        }

        const tableDsv = await this.tableData2Dsv(tableMd, "|");
        const format = d3.dsvFormat("|");

        const tableData = autoType
            ? format.parse(tableDsv, d3.autoType)
            : format.parse(tableDsv);

        return tableData;
    }

    // FIXME Improve this code, it's too noisy
    private async tableData2Dsv(
        tableMd: string,
        delim: string,
    ): Promise<string> {
        const tableMdData = await createMarkdownArrayTable(tableMd);
        const removeTags = (txt: string) => txt.replace(/#\S+/g, "").trim();

        // Remove tags and empty columns, not considered in the graph data
        const headers = tableMdData.headers.map((header) => removeTags(header));

        // Only columns with a valid header are considered: non-blank and also non-tag
        const validCols = headers
            .map((header, numCol) => (header ? numCol : -1))
            .filter((numCol) => numCol >= 0);

        const validHeaders = headers.filter((_, numCol) =>
            validCols.includes(numCol),
        );

        const validTable = [validHeaders];

        for await (const row of tableMdData.rows) {
            const validRow = row
                .filter((_, numCol) => validCols.includes(numCol))
                .map((rowCol) => removeTags(rowCol));

            validTable.push(validRow);
        }

        const tableDsv = validTable.map((tr) => tr.join(delim)).join("\n");

        return tableDsv;
    }

    // FIXME:
    // - Improve this code, it's too noisy
    // - *Maybe* replace d3 with other library, to avoid importing the whole d3 library,
    //   not strictly required after removing Observable Plot
    private fileDataImpl(filePath: string): FileDataParsers | null {
        const fileContents = async () =>
            (await this.pluginUtils.fileContents(filePath)) || "";

        const withParser = (parser: Function) => async (autoType?: boolean) =>
            autoType
                ? parser(await fileContents(), d3.autoType)
                : parser(await fileContents());

        const d3Csv = withParser(d3.csvParse);

        const d3Tsv = withParser(d3.tsvParse);

        const d3Dsv = async (delim: string, autoType?: boolean) =>
            await withParser(d3.dsvFormat(delim).parse)(autoType);

        const d3Json = async (autoType?: boolean) => {
            let parsed = JSON.parse((await fileContents()) || "[]");

            // Apply autoType only to arrays
            // FIXME Create a function for autotyping collections? Maybe import autotype from d3?
            if (_.isArray(parsed)) {
                parsed = parsed.map((d) => (autoType ? d3.autoType(d) : d));
            }

            return parsed;
        };

        return {
            csv: (autoType?: boolean) => d3Csv(autoType),
            tsv: (autoType?: boolean) => d3Tsv(autoType),
            dsv: (delim: string, autoType?: boolean) => d3Dsv(delim, autoType),
            json: (autoType?: boolean) => d3Json(autoType),
        };
    }
}
