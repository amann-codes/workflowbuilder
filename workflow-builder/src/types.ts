export interface UserQueryData {
  label: string;
}

export interface KnowledgeBaseData {
  label: string;
  topK?: number;
}

export interface LLMData {
  label: string;
  model?: string;
  systemPrompt?: string;
}

export interface OutputData {
  label: string;
}

export type WorkflowNodeData = UserQueryData | KnowledgeBaseData | LLMData | OutputData;