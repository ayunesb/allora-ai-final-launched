
import { AuditLog } from "./AuditLogTable";

// Mock audit log data
export const mockAuditLogs: AuditLog[] = [
  {
    id: "1",
    timestamp: "2025-04-09T08:23:11Z",
    user: "john.smith@example.com",
    action: "DATA_ACCESS",
    resource: "customer_records",
    details: "Viewed customer #1098 personal information",
    ip: "192.168.1.45"
  },
  {
    id: "2",
    timestamp: "2025-04-09T07:15:22Z",
    user: "admin@allora-ai.com",
    action: "SYSTEM_CHANGE",
    resource: "security_settings",
    details: "Updated password policy requirements",
    ip: "203.0.113.42"
  },
  {
    id: "3",
    timestamp: "2025-04-08T16:47:03Z",
    user: "jane.doe@example.com",
    action: "EXPORT",
    resource: "financial_data",
    details: "Exported Q1 financial report",
    ip: "198.51.100.73"
  },
  {
    id: "4",
    timestamp: "2025-04-08T14:32:18Z",
    user: "system",
    action: "AUTHENTICATION",
    resource: "login_service",
    details: "Failed login attempt for user mark@example.com",
    ip: "203.0.113.15"
  },
  {
    id: "5",
    timestamp: "2025-04-08T10:05:47Z",
    user: "sarah.johnson@example.com",
    action: "DATA_MODIFICATION",
    resource: "product_database",
    details: "Updated pricing for product SKU-7734",
    ip: "192.168.1.27"
  }
];
