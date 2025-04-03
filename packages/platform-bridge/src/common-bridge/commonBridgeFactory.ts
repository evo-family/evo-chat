import { ICommonService } from "@evo/types";
import { ElectronCommon } from "./electronCommon";
import { WebCommon } from "./webCommon";
import { BaseBridgeFactory } from "../common/baseBridgeFactory";
import { MobileCommon } from "./mobileCommon";

export class CommonBridgeFactory extends BaseBridgeFactory<ICommonService> {
  protected createElectronBridge(): ICommonService {
    return new ElectronCommon();
  }
  protected createMobileBridge(): ICommonService {
    return new MobileCommon();
  }
  protected createWebBridge(): ICommonService {
    return new WebCommon();
  }

}