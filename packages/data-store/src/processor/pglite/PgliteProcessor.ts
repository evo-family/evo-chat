import { PGLiteManager, SchemaManager } from "@evo/pglite-manager";
import { BaseResult, IFileMeta, IFileService, IGetFileListParams, IUploadBufferParams, TUploadDirectoryResult, TUploadResult } from "@evo/types";
import { BaseProcessor } from "@evo/utils";

const DataBase = "idb://evo-pglite";
export class PgliteProcessor extends BaseProcessor {

  public dbManager: PGLiteManager | null = null;

  constructor() {
    super();

    // this.dbManager = SchemaManager.getInstance(DataBase, { relaxedDurability: true }).getDbManager();
  }
}


export const pgliteProcessor = PgliteProcessor.create().processor;