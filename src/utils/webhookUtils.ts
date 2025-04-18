
import { WebhookType, WebhookResult, WebhookEvent } from './webhookTypes';
import { executeWithRetry } from './webhookRetry';
import { logger } from '@/utils/loggingService';
import { secureStorage } from '@/utils/cryptoUtils';

/**
 * Secure the webhook URL by storing only a hashed version
 * This prevents sensitive URLs from being leaked in localStorage
 */
const secureWebhookUrl = (url: string): string => {
  // For display purposes, only show domain and mask the rest
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.hostname}/***`;
  } catch (e) {
    // If URL parsing fails, return a masked version
    return url.substring(0, 10) + '***';
  }
};

/**
 * Integration with useWebhookHistory for logging webhook events
 * @param webhookUrl The URL of the webhook being triggered
 * @param payload The data sent to the webhook
 * @param type The type of webhook service
 * @returns Promise with success status and response data
 */
export const logWebhookCall = async (
  webhookUrl: string,
  payload: any,
  type: WebhookType,
  eventType: string = 'webhook_call'
): Promise<string | null> => {
  try {
    // Generate a unique ID for this webhook event
    const eventId = `wh_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
    
    // Create the initial event entry with pending status
    const initialEvent: WebhookEvent = {
      id: eventId,
      timestamp: new Date().toISOString(),
      webhookType: type,
      eventType,
      targetUrl: secureWebhookUrl(webhookUrl), // Use secured version for storage
      payload,
      status: 'pending'
    };
    
    // Load existing events using the secure storage
    const storedHistory = secureStorage.getItem('webhook_event_history');
    const history = storedHistory ? JSON.parse(storedHistory) : { version: 1, events: [], lastUpdated: new Date().toISOString() };
    
    // Add the new event
    history.events = [initialEvent, ...history.events];
    history.lastUpdated = new Date().toISOString();
    
    // Save to secure storage
    secureStorage.setItem('webhook_event_history', JSON.stringify(history));
    
    return eventId;
  } catch (error) {
    logger.error('Error logging webhook call:', error);
    return null;
  }
};

/**
 * Update a webhook call log with the result
 * @param eventId The ID of the webhook event to update
 * @param result The result of the webhook call
 */
export const updateWebhookLog = (
  eventId: string,
  result: {
    status: 'success' | 'error';
    responseCode?: number;
    response?: any;
    errorMessage?: string;
    duration?: number;
    retryCount?: number;
  }
): void => {
  try {
    // Load existing events from secure storage
    const storedHistory = secureStorage.getItem('webhook_event_history');
    if (!storedHistory) return;
    
    const history = JSON.parse(storedHistory);
    
    // Update the specific event
    history.events = history.events.map((event: WebhookEvent) => 
      event.id === eventId ? { ...event, ...result } : event
    );
    
    history.lastUpdated = new Date().toISOString();
    
    // Save to secure storage
    secureStorage.setItem('webhook_event_history', JSON.stringify(history));
  } catch (error) {
    logger.error('Error updating webhook log:', error);
  }
};

/**
 * Execute a webhook call and track it in history
 * Improved with enhanced retry mechanism and more comprehensive logging
 * @param url The webhook URL to call
 * @param payload The data to send to the webhook
 * @param type The type of webhook service
 * @param eventType Custom event type description
 * @returns Promise with the result of the webhook call
 */
export const executeAndLogWebhook = async (
  url: string,
  payload: any,
  type: WebhookType,
  eventType: string = 'webhook_call'
): Promise<WebhookResult> => {
  const startTime = Date.now();
  const eventId = await logWebhookCall(url, payload, type, eventType);
  
  try {
    // Use our enhanced retry utility with improved configurations
    const result = await executeWithRetry(url, payload, type, eventType, {
      maxRetries: 5, // Increased for better resilience
      initialDelay: 1000,
      maxDelay: 60000, // Up to 1 minute max delay for critical calls
      jitter: true,   // Add randomness to avoid thundering herd
      onRetry: (attempt, delay, error) => {
        // Update the webhook log with retry information
        if (eventId) {
          updateWebhookLog(eventId, {
            status: 'error',
            errorMessage: `Retry ${attempt} scheduled after ${delay}ms. Error: ${error?.message || 'Unknown error'}`,
            duration: Date.now() - startTime,
            retryCount: attempt
          });
        }
      }
    });
    
    const duration = Date.now() - startTime;
    
    // Update the webhook log with success information
    if (eventId) {
      updateWebhookLog(eventId, {
        status: result.success ? 'success' : 'error',
        responseCode: result.success ? (result.statusCode || 200) : 400,
        response: result.success ? result.responseData : undefined,
        errorMessage: !result.success ? result.message : undefined,
        duration
      });
    }
    
    // Performance monitoring - log execution time
    if (result.success) {
      logger.info(`Webhook execution completed successfully in ${duration}ms`, {
        webhookType: type,
        eventType,
        duration
      });
    }
    
    return result;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    // Update the webhook log with error information
    if (eventId) {
      updateWebhookLog(eventId, {
        status: 'error',
        errorMessage: error.message || 'Unknown error',
        duration
      });
    }
    
    logger.error(`Webhook execution failed for ${type} webhook:`, {
      url: secureWebhookUrl(url), // Use secured version for logging
      eventType,
      error: error.message,
      duration
    });
    
    return {
      success: false,
      message: error.message || 'Unknown error during webhook execution',
      error
    };
  }
};

/**
 * Get webhook history from secure storage
 */
export const getWebhookHistory = (): WebhookEvent[] => {
  try {
    const storedHistory = secureStorage.getItem('webhook_event_history');
    if (!storedHistory) return [];
    
    const history = JSON.parse(storedHistory);
    return history.events || [];
  } catch (error) {
    logger.error('Error retrieving webhook history:', error);
    return [];
  }
};

/**
 * Clear webhook history from secure storage
 */
export const clearWebhookHistory = (): boolean => {
  try {
    secureStorage.removeItem('webhook_event_history');
    return true;
  } catch (error) {
    logger.error('Error clearing webhook history:', error);
    return false;
  }
};
