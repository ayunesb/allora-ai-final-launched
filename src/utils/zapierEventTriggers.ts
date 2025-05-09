
import { toast } from 'sonner';

// Type definitions for strategy events
interface StrategyApprovalData {
  strategyId: string;
  strategyTitle: string;
  companyId?: string;
  approvedBy?: string;
}

interface CampaignCreationData {
  campaignId: string;
  campaignTitle: string;
  platform?: string;
  budget?: number;
}

interface LeadConversionData {
  leadId: string;
  leadName?: string;
  email?: string;
  company?: string;
  value?: number;
}

/**
 * Trigger webhook for strategy approval
 */
export async function onStrategyApproved(data: StrategyApprovalData): Promise<boolean> {
  try {
    // Get the webhook URL from localStorage (set in the ZapierWebhookSection component)
    const zapierWebhookUrl = localStorage.getItem('zapier_webhook_url');
    if (!zapierWebhookUrl) {
      console.warn('No Zapier webhook URL configured');
      return false;
    }

    // Send the webhook to Zapier
    await fetch(zapierWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'no-cors', // Required for cross-origin requests to Zapier
      body: JSON.stringify({
        event_type: 'strategy_approved',
        timestamp: new Date().toISOString(),
        data: {
          strategy_id: data.strategyId,
          strategy_title: data.strategyTitle,
          company_id: data.companyId,
          approved_by: data.approvedBy,
        }
      }),
    });
    
    console.log('Strategy approval event sent to Zapier');
    return true;
  } catch (error) {
    console.error('Failed to trigger strategy approval webhook:', error);
    return false;
  }
}

/**
 * Trigger webhook for campaign creation
 */
export async function onCampaignCreated(data: CampaignCreationData): Promise<boolean> {
  try {
    const zapierWebhookUrl = localStorage.getItem('zapier_webhook_url');
    if (!zapierWebhookUrl) {
      console.warn('No Zapier webhook URL configured');
      return false;
    }

    await fetch(zapierWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'no-cors',
      body: JSON.stringify({
        event_type: 'campaign_created',
        timestamp: new Date().toISOString(),
        data: {
          campaign_id: data.campaignId,
          campaign_title: data.campaignTitle,
          platform: data.platform,
          budget: data.budget,
        }
      }),
    });
    
    console.log('Campaign creation event sent to Zapier');
    return true;
  } catch (error) {
    console.error('Failed to trigger campaign creation webhook:', error);
    return false;
  }
}

/**
 * Trigger webhook for lead conversion
 */
export async function onLeadConverted(data: LeadConversionData): Promise<boolean> {
  try {
    const zapierWebhookUrl = localStorage.getItem('zapier_webhook_url');
    if (!zapierWebhookUrl) {
      console.warn('No Zapier webhook URL configured');
      return false;
    }

    await fetch(zapierWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'no-cors',
      body: JSON.stringify({
        event_type: 'lead_converted',
        timestamp: new Date().toISOString(),
        data: {
          lead_id: data.leadId,
          lead_name: data.leadName,
          email: data.email,
          company: data.company,
          value: data.value,
        }
      }),
    });
    
    console.log('Lead conversion event sent to Zapier');
    return true;
  } catch (error) {
    console.error('Failed to trigger lead conversion webhook:', error);
    return false;
  }
}
