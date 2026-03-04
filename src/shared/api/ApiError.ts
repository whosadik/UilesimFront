export class ApiError extends Error {
  status: number;
  code?: string;
  details?: any;
  requestId?: string;
  url: string;
  method: string;

  constructor(params: {
    status: number;
    message: string;
    code?: string;
    details?: any;
    requestId?: string;
    url: string;
    method: string;
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.status = params.status;
    this.code = params.code;
    this.details = params.details;
    this.requestId = params.requestId;
    this.url = params.url;
    this.method = params.method;
  }
}
