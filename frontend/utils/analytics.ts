/**
 * Analytics utility module
 * Wraps Neynar analytics functions and respects user privacy preferences
 */

export type AnalyticsEvent = 
  | 'miniapp_launch'
  | 'transaction_view'
  | 'share_click'
  | 'share_success'
  | 'share_error'
  | 'error'
  | 'connection_established'
  | 'connection_lost';

interface AnalyticsEventData {
  event: AnalyticsEvent;
  properties?: Record<string, any>;
  timestamp?: number;
}

interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
}

class Analytics {
  private config: AnalyticsConfig = {
    enabled: true,
    debug: false,
  };

  /**
   * Initialize analytics with configuration
   */
  init(config: Partial<AnalyticsConfig> = {}) {
    this.config = { ...this.config, ...config };
    
    // Check for user privacy preferences
    const doNotTrack = 
      navigator.doNotTrack === '1' ||
      // @ts-ignore - for older browsers
      window.doNotTrack === '1' ||
      // @ts-ignore - for older browsers
      navigator.msDoNotTrack === '1';
    
    if (doNotTrack) {
      this.config.enabled = false;
      console.log('[Analytics] Tracking disabled due to Do Not Track preference');
    }

    if (this.config.debug) {
      console.log('[Analytics] Initialized with config:', this.config);
    }
  }

  /**
   * Track an analytics event
   */
  track(event: AnalyticsEvent, properties?: Record<string, any>) {
    if (!this.config.enabled) {
      if (this.config.debug) {
        console.log('[Analytics] Tracking disabled, skipping event:', event);
      }
      return;
    }

    const eventData: AnalyticsEventData = {
      event,
      properties,
      timestamp: Date.now(),
    };

    if (this.config.debug) {
      console.log('[Analytics] Track event:', eventData);
    }

    // In production, this would send to Neynar analytics
    // For now, we'll just log it
    this.sendToAnalytics(eventData);
  }

  /**
   * Track Mini App launch
   */
  trackLaunch(isMiniApp: boolean) {
    this.track('miniapp_launch', {
      is_miniapp: isMiniApp,
      user_agent: navigator.userAgent,
      screen_width: window.screen.width,
      screen_height: window.screen.height,
    });
  }

  /**
   * Track transaction view
   */
  trackTransactionView(transactionHash: string, riskLevel: string) {
    this.track('transaction_view', {
      transaction_hash: transactionHash,
      risk_level: riskLevel,
    });
  }

  /**
   * Track share action
   */
  trackShare(transactionHash: string, success: boolean, error?: string) {
    if (success) {
      this.track('share_success', {
        transaction_hash: transactionHash,
      });
    } else {
      this.track('share_error', {
        transaction_hash: transactionHash,
        error,
      });
    }
  }

  /**
   * Track error
   */
  trackError(error: Error | string, context?: Record<string, any>) {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;

    this.track('error', {
      error_message: errorMessage,
      error_stack: errorStack,
      ...context,
    });
  }

  /**
   * Track connection status
   */
  trackConnection(connected: boolean) {
    this.track(connected ? 'connection_established' : 'connection_lost', {
      timestamp: Date.now(),
    });
  }

  /**
   * Enable or disable analytics
   */
  setEnabled(enabled: boolean) {
    this.config.enabled = enabled;
    
    if (this.config.debug) {
      console.log('[Analytics] Tracking', enabled ? 'enabled' : 'disabled');
    }
  }

  /**
   * Check if analytics is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Send event data to analytics service
   * In production, this would integrate with Neynar analytics
   */
  private sendToAnalytics(eventData: AnalyticsEventData) {
    // TODO: Integrate with Neynar analytics API
    // For now, we'll use console.log in debug mode
    if (this.config.debug) {
      console.log('[Analytics] Send to service:', eventData);
    }

    // Example: Send to Neynar analytics
    // fetch('/api/analytics', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(eventData),
    // });
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Initialize with default config
if (typeof window !== 'undefined') {
  analytics.init({
    debug: process.env.NODE_ENV === 'development',
  });
}
