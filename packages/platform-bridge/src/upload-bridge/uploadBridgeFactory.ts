import { IFileService } from "@evo/types";
import { isElectron } from "@evo/utils";
import { ElectronUpload } from "./electronUpload";
import { WebUpload } from "./webUpload";

// 上传服务工厂
export class UploadBridgeFactory {
  static createUploadBridge(): IFileService {
    if (isElectron()) {
      return new ElectronUpload();
    } else {
      return new WebUpload();
    }
  }

  static getUpload() {
    return UploadBridgeFactory.createUploadBridge();
  }
}
