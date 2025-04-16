export interface ITableDefinition {
  name: string;
  schema: string;
}

export const tableDefinitions: Record<string, ITableDefinition> = {
  files: {
    name: 'files',
    schema: `
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      path VARCHAR(1024) NOT NULL,
      size INTEGER NOT NULL,
      type VARCHAR(50) NOT NULL,
      create_user VARCHAR(64) NULL,
      update_user VARCHAR(64) NULL,
      create_time BIGINT NOT NULL,
      modified_time BIGINT NOT NULL
    `,
  },
  knowledge: {
    name: 'knowledge',
    schema: `
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      model_id VARCHAR(64) NOT NULL,
      model_provider_id VARCHAR(64) NOT NULL,
      create_user VARCHAR(64) NULL,
      update_user VARCHAR(64) NULL,
      create_time BIGINT NOT NULL,
      modified_time BIGINT NOT NULL
    `,
  },
  knowledge_vector: {
    name: 'knowledge_vector',
    schema: `
      id VARCHAR(64) PRIMARY KEY,
      file_id VARCHAR(64) NOT NULL,
      loader_id VARCHAR(255) NOT NULL,
      loader_type VARCHAR(50) NOT NULL,
      knowledge_id VARCHAR(64) NOT NULL,
      create_user VARCHAR(64) NULL,
      update_user VARCHAR(64) NULL,
      create_time BIGINT NOT NULL,
      modified_time BIGINT NOT NULL
    `,
  },

  mcp_category: {
    name: 'mcp_category',
    schema: `
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      create_user VARCHAR(64) NULL,
      update_user VARCHAR(64) NULL,
      create_time BIGINT NOT NULL,
      modified_time BIGINT NOT NULL
    `,
  },

  mcp: {
    name: 'mcp',
    schema: `
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      category_id VARCHAR(64) NOT NULL,
      type VARCHAR(50) NOT NULL,
      config TEXT NOT NULL,
      enabled INTEGER DEFAULT 1,
      create_user VARCHAR(64) NULL,
      update_user VARCHAR(64) NULL,
      create_time BIGINT NOT NULL,
      modified_time BIGINT NOT NULL
    `,
  },
};
