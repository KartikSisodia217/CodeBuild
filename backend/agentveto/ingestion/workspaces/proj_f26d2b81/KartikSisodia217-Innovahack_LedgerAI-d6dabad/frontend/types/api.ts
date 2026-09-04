export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface UploadResponse {
  task_id: string;
  message: string;
  document_id?: string;
  analysis_available?: boolean;
}

export interface Transaction {
  id: string;
  company_id: string;
  document_id: string | null;
  status: string;
  debits: any[];
  credits: any[];
  insights: string | null;
  created_at: string;
  updated_at: string;
}

export interface SSEEvent {
  task_id: string;
  status: "processing" | "completed";
  next_nodes: string[];
  state: Record<string, any>;
}

export interface AgentLog {
  agent: string;
  action: string;
  status: "success" | "pending" | "idle" | "error";
  colorClass: string;
  inputs?: Record<string, any> | string;
  retrievedData?: { title: string; type: string; snippet: string }[];
  reasoning?: string[];
  intermediateFindings?: string[];
  confidence?: number;
  executionTimeMs?: number;
  outputPayload?: Record<string, any> | string;
}

export interface HITLResolveRequest {
  task_id: string;
  provided_data: string;
}
