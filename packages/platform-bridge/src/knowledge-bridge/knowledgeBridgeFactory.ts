import { IKnowledgeService } from "@evo/types";
import { isElectron } from "@evo/utils";
import { ElectronKnowledge } from "./electronKnowledge";
import { WebKnowledge } from "./webKnowledge";

// 上传服务工厂
export class KnowledgeBridgeFactory {
  static createKnowledgeBridge(): IKnowledgeService {
    if (isElectron()) {
      return new ElectronKnowledge();
    } else {
      return new WebKnowledge();
    }
  }

  static getKnowledge() {
    return KnowledgeBridgeFactory.createKnowledgeBridge();
  }
}
