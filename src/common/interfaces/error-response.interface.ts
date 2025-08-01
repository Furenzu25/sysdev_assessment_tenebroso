export interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
  details?: {
    field?: string;
    value?: any;
    constraint?: string;
    suggestion?: string;
  };
  debug?: {
    operation?: string;
    entity?: string;
    method?: string;
  };
} 