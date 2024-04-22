import {
    MetadataCache,
    Pos,
    SectionCache,
    TFile,
    TagCache,
    Vault,
    Workspace,
} from "obsidian";
import { GrafikaPluginSettings } from "./GrafikaPluginSettings";

export class GrafikaPluginUtils {
    constructor(
        private pluginSettings: GrafikaPluginSettings,
        private vault: Vault,
        private metadataCache: MetadataCache,
        private workspace: Workspace,
    ) {}

    public get openBlockId(): (blockId: string) => Promise<void> {
        return this.openBlockIdImpl.bind(this);
    }

    public get findTaggedTable(): (
        tableTag: string,
    ) => Promise<string | undefined> {
        return this.findTaggedTableImpl.bind(this);
    }

    public get fileContents(): (filePath: string) => Promise<string | null> {
        return ((filePath: string) =>
            this.fileContentsImpl(filePath, "text")).bind(this);
    }

    public apiKey(externalApiName: string) {
        return this.pluginSettings.externalApiKeys.find(
            (k) => k.apiName === externalApiName,
        )?.key;
    }

    public async assetUrl(filePath: string): Promise<string> {
        const contents = await this.fileContentsImpl(filePath, "binary");

        if (!contents) {
            throw new Error(`File not found: ${filePath}`);
        }

        return URL.createObjectURL(new Blob([contents]));
    }

    private async findTaggedTableImpl(
        tableTag: string,
    ): Promise<string | undefined> {
        const fileTablePairs = this.findFileTablePairsImpl(tableTag);

        if (!fileTablePairs || fileTablePairs.length === 0) {
            return undefined;
        }

        // Keep the first file with a table that contains tableTag,
        // table tags should be *unique* in the vault
        const { table, file } = fileTablePairs[0];

        const tableMd = (await this.fileContents(file.path))?.substring(
            table.position.start.offset,
            table.position.end.offset,
        );

        return tableMd;
    }

    private async openBlockIdImpl(blockId: string) {
        const fileWithTask = this.vault.getMarkdownFiles().filter((f) => {
            const blocks = this.metadataCache.getFileCache(f)?.blocks;
            return (
                blocks && Object.values(blocks).some((b) => b.id === blockId)
            );
        });
        fileWithTask.forEach(async (f) => {
            const linktext = f.path + "#^" + blockId;
            console.log("Opening link: ", linktext);
            await this.workspace.openLinkText(linktext, "", true);
        });
    }

    // TODO Simplify this code, it's too noisy
    private findFileTablePairsImpl(
        tableTag: string,
    ): { file: TFile; table: SectionCache }[] {
        const fileCache = (file: TFile) =>
            this.metadataCache.getFileCache(file);

        // TODO Refactor these two methods to functions or method that can be reused
        const containsPosition = (p1: Pos, p2: Pos) => {
            return (
                p1.start.offset < p2.start.offset &&
                p2.end.offset < p1.end.offset
            );
        };

        const contains = (tbl: SectionCache, tg: TagCache) =>
            containsPosition(tbl.position, tg.position);

        const fileTablePairs = this.vault
            .getMarkdownFiles()
            .map((f) => ({
                // Put sections and tags together with the file
                file: f,
                sections: fileCache(f)?.sections,
                tags: fileCache(f)?.tags,
            }))
            .map((fs) => ({
                // Keep tables, and also tags matching the tableTag
                file: fs.file,
                tables: fs.sections?.filter((s) => s.type === "table"),
                tags: fs.tags?.filter((tg) => tg.tag === tableTag),
            }))
            .map((ft) => ({
                // Put the file and the first table that contains tableTag together
                file: ft.file,
                table: ft.tables?.find((tbl) =>
                    ft.tags?.some((tg) => contains(tbl, tg)),
                ),
            }))
            .filter((ft) => ft.table);
            
        // @ts-ignore
        return fileTablePairs || [];
    }

    private async fileContentsImpl(
        filePath: string,
        mode: "text" | "binary",
    ): Promise<string | ArrayBuffer | null> {
        const file = this.vault.getFileByPath(filePath);

        if (!file) {
            return null;
        }

        // FIXME Handle big file reading with async generator?
        const fileContents =
            mode === "binary"
                ? await this.vault.readBinary(file)
                : await this.vault.read(file);

        return fileContents;
    }

    private blobUrl = (str: string, mimeType: string) =>
        URL.createObjectURL(new Blob([str], { type: mimeType }));
}
