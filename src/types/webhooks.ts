
export type WebhookType = 'zapier' | 'custom' | 'slack' | 'github' | 'stripe' | 'notion';

export type WebhookStatus = 'success' | 'failed' | 'pending';

export interface WebhookEvent {
  id: string;
  webhook_id: string;
  event_type: string;  // Standardized to event_type instead of eventType
  status: WebhookStatus;
  created_at: string;
  payload: any;
  response?: any;
  targetUrl: string;
  webhookType: WebhookType;
  timestamp: string;
  duration?: number;
  errorMessage?: string;
  responseCode?: number;
  source?: string;
}

export interface WebhookTestResult {
  success: boolean;
  message?: string;
  statusCode?: number;
  data?: any;
}

export interface WebhookFilter {
  types?: WebhookType[];
  status?: WebhookStatus | '';
  dateRange?: [Date | null, Date | null];
  search?: string;
}

export type BusinessEventType = 
  | 'campaign_created' 
  | 'strategy_approved' 
  | 'lead_converted'
  | 'revenue_milestone'
  | 'user_onboarded'
  | 'test_webhook'
  | 'test_event';

export interface BusinessEventPayload {
  eventType: string;
  data: Record<string, any>;
}

export interface WebhookResult {
  success: boolean;
  message?: string;
  error?: any;
  statusCode?: number;
  responseData?: any;
}

export function validateWebhookUrlFormat(url: string): boolean {
  return /^https?:\/\/.+/.test(url);
}

export function testWebhook(url: string): boolean {
  return validateWebhookUrlFormat(url);
}

export function sanitizeWebhookUrl(url: string): string {
  return url.trim().replace(/\s/g, '');
}
