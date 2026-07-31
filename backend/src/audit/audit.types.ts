export enum AuditAction {
    USER_REGISTER = "USER_REGISTER",
    USER_LOGIN = "USER_LOGIN",
  
    FILE_UPLOAD = "FILE_UPLOAD",
    FILE_DOWNLOAD = "FILE_DOWNLOAD",
    FILE_DELETE = "FILE_DELETE",
  }
  
  export interface CreateAuditLogInput {
    userId: string;
    action: AuditAction;
    resource?: string;
  }