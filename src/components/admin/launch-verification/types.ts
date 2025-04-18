
export interface ChecklistItem {
  id: string;
  name: string;
  description?: string;
  status: 'completed' | 'in-progress' | 'pending' | 'warning' | 'error';
  statusMessage?: string;
  details?: string;
  isRequired?: boolean;
}

export interface ChecklistCategory {
  id: string;
  name: string;
  description?: string;
  items: ChecklistItem[];
}

export interface ValidationResultsUI {
  apis: {
    heygen: ApiStatus;
    postmark: ApiStatus;
    stripe: ApiStatus; 
    twilio: ApiStatus;
    openai: ApiStatus;
    zapier?: ApiStatus;
  };
  database: {
    status: 'ready' | 'error';
    message?: string;
    tables?: DatabaseTableStatus[];
  };
  features: {
    authentication: boolean;
    onboarding: boolean;
    strategies: boolean;
    campaigns: boolean;
    aiDebate: boolean;
    welcomeVideo: boolean;
    billing: boolean;
  };
  compliance: {
    whatsappOptIn: boolean;
    emailUnsubscribe: boolean;
    billingCompliance: boolean;
    apiSecurityLevel: 'high' | 'medium' | 'low';
  };
  overallStatus: 'ready' | 'warning' | 'not_ready';
  // Add the missing properties that our components are trying to access
  databaseTables?: Record<string, DatabaseTableStatus>;
  databaseIndexes?: Array<{name: string; status: string; message: string}>;
  rlsPolicies?: Array<{table: string; status: string; message: string}>;
  databaseFunctions?: Array<{name: string; status: string; message: string}>;
  legalAcceptance?: { valid: boolean; message: string };
}

export type ApiStatus = 'connected' | 'error' | 'not_configured';

export interface DatabaseTableStatus {
  name?: string;
  exists: boolean;
  rowCount?: number;
  hasRls?: boolean;
  error?: string;
  // Add the missing properties that our components are trying to access
  rls?: boolean;
  message?: string;
}

export interface EnhancedVerificationState {
  categories: ChecklistCategory[];
  completedItems: number;
  totalItems: number;
  overallStatus: 'ready' | 'warning' | 'not_ready';
  isLoading: boolean;
}

export interface LaunchButtonProps {
  className?: string;
}

export interface LaunchProgressProps {
  isComplete: boolean;
  launchStep: string | null;
}

export interface LaunchInfoBoxProps {
  className?: string;
}
