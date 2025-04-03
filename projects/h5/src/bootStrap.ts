import VConsole from 'vconsole'
import {  initDataCellStorageWithWeb, initStateTissueStorageWithWeb } from '@evo/utils';

initStateTissueStorageWithWeb();
initDataCellStorageWithWeb();



const isVconsole = location.href.indexOf('vconsole') !== -1

if (isVconsole) {
  new VConsole()
}