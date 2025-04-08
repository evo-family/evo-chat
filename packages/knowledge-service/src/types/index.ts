import { FileManager } from '../file-manager/fileManager';
import { KnowledgeManager } from '../knowledge-manager/knowledgeManager';

/**
 * 所有manager的依赖
 */
export interface IDepManager {
  fileManager: FileManager;
  knowledgeManager: KnowledgeManager;
}
