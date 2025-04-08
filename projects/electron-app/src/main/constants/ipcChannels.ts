export const IpcChannels = {
  UPLOAD_FILE: 'upload-file',
  UPLOAD_DIRECTORY: 'upload-directory',
  GET_FILE_LIST: 'get-file-list',
  UPLOAD_BUFFER_FILE: 'save-paste-file',
  GET_FILE_BUFFER: 'get-file-buffer',
  GET_FILE_CONTENT: 'get-file-content',
  DELETE_FILE: 'delete-file',

  SET_MODEL_EMBEDDING_MAP: 'set-model-embedding-map',

  KNOWLEDGE_CREATE: 'knowledge-create',
  KNOWLEDGE_GET_LIST: 'knowledge-get-list',
  KNOWLEDGE_UPDATE: 'knowledge-update',
  KNOWLEDGE_ADD_FILE_TO_VECTOR: 'knowledge-add-file-to-vector', // 添加文件到向量
  KNOWLEDGE_ADD_FOLDER_TO_VECTOR: 'knowledge-add-folder-to-vector', // 添加文件夹到向量
  KNOWLEDGE_ADD_FILE_META_TO_VECTOR: 'knowledge-add-file-meta-to-vector', //添加单个已存在的文件到向量
  KNOWLEDGE_ADD_FILES_META_TO_VECTOR: 'knowledge-add-files-meta-to-vector', //添加多个已存在的文件到向量
  KNOWLEDGE_GET_VECTORS: 'knowledge-get-vectors',
  KNOWLEDGE_SEARCH_VECTORS: 'knowledge-search-vectors', // 添加搜索向量的常量
  KNOWLEDGE_GET_VECTORS_BY_FILE: 'knowledge-get-vectors-by-file', // 获取文件的向量信息
  KNOWLEDGE_DELETE_VECTORS_BY_FILE: 'knowledge-delete-vectors-by-file', // 删除文件的向量信息

  COMMON_GET_NATIVE_THEME: 'common-get-native-theme', // 获取主题
  COMMON_ON_NATIVE_THEME_CHANGE: 'common-on-native-theme-change', // 监听主题变化
  COMMON_OPEN_EXTERNAL: 'common-open-external', // 打开外部链接

  // 检查更新
  UPDATA_CHECK: 'updata-check'
} as const
