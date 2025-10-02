export interface AuditLogEntry {
  id: number;
  officerId: number;
  action: string;
  timestamp: string;
  details?: string;
}
