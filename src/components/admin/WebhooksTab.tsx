
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import WebhookHistoryTab from './webhooks/WebhookHistoryTab';
import { useWebhooks } from '@/hooks/admin/useWebhooks';
import { useWebhookValidation } from '@/hooks/admin/useWebhookValidation';
import WebhookHeader from './webhooks/WebhookHeader';
import WebhookConfigTab from './webhooks/config/WebhookConfigTab';
import { useBreakpoint } from "@/hooks/use-mobile";

const WebhooksTab = () => {
  const [activeTab, setActiveTab] = useState<string>("config");
  const breakpoint = useBreakpoint();
  const isMobileView = ['xs', 'mobile'].includes(breakpoint);
  
  // Custom hooks for state management and functionality
  const {
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
    handleTestZapierWebhook,
    handleTestGithubWebhook,
    handleTestSlackWebhook,
    handleTestCustomWebhook,
    handleTestStripeWebhook
  } = useWebhooks();

  // Validation hooks
  const { isValid: isStripeWebhookValid, validateUrl: validateStripeUrl } = useWebhookValidation('stripe');
  const { isValid: isZapierWebhookValid, validateUrl: validateZapierUrl } = useWebhookValidation('zapier');
  const { isValid: isGithubWebhookValid, validateUrl: validateGithubUrl } = useWebhookValidation('github');
  const { isValid: isSlackWebhookValid, validateUrl: validateSlackUrl } = useWebhookValidation('slack');
  const { isValid: isCustomWebhookValid, validateUrl: validateCustomUrl } = useWebhookValidation('custom');

  // Initialize validation on mount
  React.useEffect(() => {
    if (stripeWebhook) validateStripeUrl(stripeWebhook);
    if (zapierWebhook) validateZapierUrl(zapierWebhook);
    if (githubWebhook) validateGithubUrl(githubWebhook);
    if (slackWebhook) validateSlackUrl(slackWebhook);
    if (customWebhook) validateCustomUrl(customWebhook);
  }, [
    stripeWebhook, zapierWebhook, githubWebhook, slackWebhook, customWebhook,
    validateStripeUrl, validateZapierUrl, validateGithubUrl, validateSlackUrl, validateCustomUrl
  ]);

  // Handlers
  const handleStripeWebhookChange = (value: string) => {
    setStripeWebhook(value);
    validateStripeUrl(value);
  };

  const handleZapierWebhookChange = (value: string) => {
    setZapierWebhook(value);
    validateZapierUrl(value);
  };

  const handleGithubWebhookChange = (value: string) => {
    setGithubWebhook(value);
    validateGithubUrl(value);
  };

  const handleSlackWebhookChange = (value: string) => {
    setSlackWebhook(value);
    validateSlackUrl(value);
  };

  const handleCustomWebhookChange = (value: string) => {
    setCustomWebhook(value);
    validateCustomUrl(value);
  };

  const handleSave = () => {
    handleSaveWebhooks(
      isStripeWebhookValid || false, 
      isZapierWebhookValid || false,
      isGithubWebhookValid || false,
      isSlackWebhookValid || false,
      isCustomWebhookValid || false
    );
  };
  
  // Test handlers that correctly return Promise<boolean>
  const testStripeWebhook = () => handleTestStripeWebhook(isStripeWebhookValid || false);
  const testZapierWebhook = () => handleTestZapierWebhook(isZapierWebhookValid || false);
  const testGithubWebhook = () => handleTestGithubWebhook(isGithubWebhookValid || false);
  const testSlackWebhook = () => handleTestSlackWebhook(isSlackWebhookValid || false);
  const testCustomWebhook = () => handleTestCustomWebhook(isCustomWebhookValid || false);

  return (
    <Card>
      <CardHeader>
        <WebhookHeader 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsContent value="config" className="mt-0">
          <CardContent className={isMobileView ? 'p-3' : ''}>
            <WebhookConfigTab 
              stripeWebhook={stripeWebhook}
              zapierWebhook={zapierWebhook}
              githubWebhook={githubWebhook}
              slackWebhook={slackWebhook}
              customWebhook={customWebhook}
              onStripeWebhookChange={handleStripeWebhookChange}
              onZapierWebhookChange={handleZapierWebhookChange}
              onGithubWebhookChange={handleGithubWebhookChange}
              onSlackWebhookChange={handleSlackWebhookChange}
              onCustomWebhookChange={handleCustomWebhookChange}
              onTestStripeWebhook={testStripeWebhook}
              onTestZapierWebhook={testZapierWebhook}
              onTestGithubWebhook={testGithubWebhook}
              onTestSlackWebhook={testSlackWebhook}
              onTestCustomWebhook={testCustomWebhook}
              onSave={handleSave}
              isSaving={isSaving}
              testingWebhook={testingWebhook}
              testLoading={testLoading}
              isStripeWebhookValid={isStripeWebhookValid || false}
              isZapierWebhookValid={isZapierWebhookValid || false}
              isGithubWebhookValid={isGithubWebhookValid || false}
              isSlackWebhookValid={isSlackWebhookValid || false}
              isCustomWebhookValid={isCustomWebhookValid || false}
            />
          </CardContent>
        </TabsContent>
        
        <TabsContent value="history" className="mt-0">
          <WebhookHistoryTab />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default WebhooksTab;
