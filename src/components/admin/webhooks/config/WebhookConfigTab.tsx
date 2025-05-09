
import React, { useState } from 'react';

interface WebhookConfigFormProps {
  webhookType: string;
  onWebhookTypeChange: (type: string) => void;
  stripeWebhook?: string;
  stripeSecret?: string;
  zapierWebhook?: string;
  githubWebhook?: string;
  githubSecret?: string;
  slackWebhook?: string;
  customWebhook?: string;
  stripeValid?: boolean;
  zapierValid?: boolean;
  githubValid?: boolean;
  slackValid?: boolean;
  customValid?: boolean;
  onSave?: (type: string, data: any) => void;
  onDelete?: (type: string) => void;
  onTest?: (type: string) => void;
}

export const WebhookConfigForm = ({ 
  webhookType,
  onWebhookTypeChange,
  stripeWebhook = "",
  stripeSecret = "",
  zapierWebhook = "",
  githubWebhook = "",
  githubSecret = "",
  slackWebhook = "",
  customWebhook = "",
  stripeValid = false,
  zapierValid = false,
  githubValid = false,
  slackValid = false,
  customValid = false,
  onSave,
  onDelete,
  onTest
}: WebhookConfigFormProps) => {
  // Simple placeholder for the form component
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Configure Webhooks</h3>
      <p className="text-sm text-muted-foreground">
        Set up integration webhooks for external services
      </p>
      {/* Form content would go here */}
    </div>
  );
};

export interface WebhookConfigTabProps {
  stripeWebhook?: string;
  stripeSecret?: string;
  zapierWebhook?: string;
  githubWebhook?: string;
  githubSecret?: string;
  slackWebhook?: string;
  customWebhook?: string;
  stripeValid?: boolean;
  zapierValid?: boolean;
  githubValid?: boolean;
  slackValid?: boolean;
  customValid?: boolean;
  onSave?: (type: string, data: any) => void;
  onDelete?: (type: string) => void;
  onTest?: (type: string) => void;
  onTypeChange?: (type: string) => void;
  
  // Add compatibility with old props
  stripeWebhookId?: string;
  stripeEndpointSecret?: string;
  zapierWebhookUrl?: string;
  githubWebhookUrl?: string;
  slackWebhookUrl?: string;
  customWebhookUrl?: string;
}

export const WebhookConfigTab: React.FC<WebhookConfigTabProps> = ({
  stripeWebhook,
  stripeSecret,
  zapierWebhook,
  githubWebhook,
  githubSecret,
  slackWebhook,
  customWebhook,
  stripeValid = false,
  zapierValid = false,
  githubValid = false,
  slackValid = false,
  customValid = false,
  onSave,
  onDelete,
  onTest,
  onTypeChange,
  
  // Handle legacy props
  stripeWebhookId,
  stripeEndpointSecret,
  zapierWebhookUrl,
  githubWebhookUrl,
  slackWebhookUrl,
  customWebhookUrl,
}) => {
  const [activeWebhookType, setActiveWebhookType] = useState('stripe');

  // Map legacy props to new prop names
  const effectiveStripeWebhook = stripeWebhook || stripeWebhookId;
  const effectiveStripeSecret = stripeSecret || stripeEndpointSecret;
  const effectiveZapierWebhook = zapierWebhook || zapierWebhookUrl;
  const effectiveGithubWebhook = githubWebhook || githubWebhookUrl;
  const effectiveGithubSecret = githubSecret || "";
  const effectiveSlackWebhook = slackWebhook || slackWebhookUrl;
  const effectiveCustomWebhook = customWebhook || customWebhookUrl;

  const handleTypeChange = (type: string) => {
    setActiveWebhookType(type);
    if (onTypeChange) {
      onTypeChange(type);
    }
  };

  return (
    <WebhookConfigForm
      webhookType={activeWebhookType}
      onWebhookTypeChange={handleTypeChange}
      stripeWebhook={effectiveStripeWebhook}
      stripeSecret={effectiveStripeSecret}
      zapierWebhook={effectiveZapierWebhook}
      githubWebhook={effectiveGithubWebhook}
      githubSecret={effectiveGithubSecret}
      slackWebhook={effectiveSlackWebhook}
      customWebhook={effectiveCustomWebhook}
      stripeValid={stripeValid}
      zapierValid={zapierValid}
      githubValid={githubValid}
      slackValid={slackValid}
      customValid={customValid}
      onSave={onSave}
      onDelete={onDelete}
      onTest={onTest}
    />
  );
};

export default WebhookConfigTab;
