
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { testWebhook } from '@/utils/webhookValidation';
import { WebhookType, WebhookResult } from '@/types/unified-types';

export function useWebhooks() {
  const [stripeWebhook, setStripeWebhook] = useState('');
  const [zapierWebhook, setZapierWebhook] = useState('');
  const [githubWebhook, setGithubWebhook] = useState('');
  const [slackWebhook, setSlackWebhook] = useState('');
  const [customWebhook, setCustomWebhook] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  
  // Handle saving all webhooks
  const handleSaveWebhooks = useCallback(
    async (
      isStripeValid: boolean,
      isZapierValid: boolean,
      isGithubValid: boolean,
      isSlackValid: boolean,
      isCustomValid: boolean
    ) => {
      setIsSaving(true);
      
      try {
        // Collect valid webhooks for saving
        const webhooksToSave = [
          ...(stripeWebhook && isStripeValid ? [{ type: 'stripe', url: stripeWebhook }] : []),
          ...(zapierWebhook && isZapierValid ? [{ type: 'zapier', url: zapierWebhook }] : []),
          ...(githubWebhook && isGithubValid ? [{ type: 'github', url: githubWebhook }] : []),
          ...(slackWebhook && isSlackValid ? [{ type: 'slack', url: slackWebhook }] : []),
          ...(customWebhook && isCustomValid ? [{ type: 'custom', url: customWebhook }] : [])
        ];
        
        if (webhooksToSave.length === 0) {
          toast.info('No valid webhooks to save');
          return;
        }
        
        // Mock API call to save webhooks - in a real app this would call the API
        console.log('Saving webhooks:', webhooksToSave);
        
        // Simulating success after a delay
        setTimeout(() => {
          toast.success('Webhooks saved successfully!');
          setIsSaving(false);
        }, 500);
      } catch (error) {
        console.error('Error saving webhooks:', error);
        toast.error('Failed to save webhooks. Please try again.');
        setIsSaving(false);
      }
    },
    [stripeWebhook, zapierWebhook, githubWebhook, slackWebhook, customWebhook]
  );
  
  // Generic test webhook function
  const testWebhookUrl = useCallback(
    async (url: string, webhookType: WebhookType): Promise<boolean> => {
      if (!url) {
        toast.error('Please enter a webhook URL first');
        return false;
      }
      
      setTestLoading(true);
      setTestingWebhook(webhookType);
      
      try {
        const result = await testWebhook(url);
        
        if (result.success) {
          toast.success(`${webhookType.charAt(0).toUpperCase() + webhookType.slice(1)} webhook test successful!`);
          return true;
        } else {
          toast.error(`Test failed: ${result.message}`);
          return false;
        }
      } catch (error) {
        toast.error(`Test failed: ${error instanceof Error ? error.message : String(error)}`);
        return false;
      } finally {
        setTestLoading(false);
        setTestingWebhook(null);
      }
    },
    []
  );
  
  // Type-specific test functions
  const handleTestStripeWebhook = useCallback(
    async (isValid: boolean): Promise<boolean> => {
      if (!isValid) {
        toast.error('Stripe webhook URL is invalid');
        return false;
      }
      return testWebhookUrl(stripeWebhook, 'stripe');
    },
    [stripeWebhook, testWebhookUrl]
  );
  
  const handleTestZapierWebhook = useCallback(
    async (isValid: boolean): Promise<boolean> => {
      if (!isValid) {
        toast.error('Zapier webhook URL is invalid');
        return false;
      }
      return testWebhookUrl(zapierWebhook, 'zapier');
    },
    [zapierWebhook, testWebhookUrl]
  );
  
  const handleTestGithubWebhook = useCallback(
    async (isValid: boolean): Promise<boolean> => {
      if (!isValid) {
        toast.error('GitHub webhook URL is invalid');
        return false;
      }
      return testWebhookUrl(githubWebhook, 'github');
    },
    [githubWebhook, testWebhookUrl]
  );
  
  const handleTestSlackWebhook = useCallback(
    async (isValid: boolean): Promise<boolean> => {
      if (!isValid) {
        toast.error('Slack webhook URL is invalid');
        return false;
      }
      return testWebhookUrl(slackWebhook, 'slack');
    },
    [slackWebhook, testWebhookUrl]
  );
  
  const handleTestCustomWebhook = useCallback(
    async (isValid: boolean): Promise<boolean> => {
      if (!isValid) {
        toast.error('Custom webhook URL is invalid');
        return false;
      }
      return testWebhookUrl(customWebhook, 'custom');
    },
    [customWebhook, testWebhookUrl]
  );
  
  return {
    stripeWebhook,
    setStripeWebhook,
    zapierWebhook,
    setZapierWebhook,
    githubWebhook,
    setGithubWebhook,
    slackWebhook,
    setSlackWebhook,
    customWebhook,
    setCustomWebhook,
    isSaving,
    testLoading,
    testingWebhook,
    handleSaveWebhooks,
    handleTestStripeWebhook,
    handleTestZapierWebhook,
    handleTestGithubWebhook,
    handleTestSlackWebhook,
    handleTestCustomWebhook
  };
}
