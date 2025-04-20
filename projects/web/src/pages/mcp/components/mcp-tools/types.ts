export interface JsonSchemaType {
  type: string;
  properties: Record<string, {
    type: string;
    description: string;
    required?: boolean;
  }>;
  required: string[];
  additionalProperties: boolean;
  $schema: string;
}