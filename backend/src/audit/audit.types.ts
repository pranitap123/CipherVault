export enum AuditAction {
    USER_REGISTER = "USER_REGISTER",
    USER_LOGIN = "USER_LOGIN",
  
    FILE_UPLOAD = "FILE_UPLOAD",
    FILE_DOWNLOAD = "FILE_DOWNLOAD",
    FILE_DELETE = "FILE_DELETE",

    ADMIN_VIEW_ALL_FILES = "ADMIN_VIEW_ALL_FILES",
    ADMIN_FILE_DELETE = "ADMIN_FILE_DELETE",
    ADMIN_VIEW_ALL_USERS = "ADMIN_VIEW_ALL_USERS",
    ADMIN_ROLE_UPDATE = "ADMIN_ROLE_UPDATE",
  }
  
  export interface CreateAuditLogInput {
    userId: string;
    action: AuditAction;
    resource?: string;
  }