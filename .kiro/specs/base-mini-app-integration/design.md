# Design Document: Base Mini App Integration

## Overview

This design document outlines the technical approach for converting The MEV Exorcist into a Farcaster Mini App running on the Base network. The integration involves three main components:

1. **Frontend Integration**: Adding Mini App SDK support to the Next.js frontend
2. **Backend Migration**: Switching from Ethereum Sepolia to Base network
3. **Social Features**: Implementing sharing and authentication with Farcaster

The application will maintain its existing MEV monitoring functionality while adding seamless integration with Farcaster's social features and wallet system.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Farcaster Client                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Mini App WebView                          │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │         MEV Exorcist Frontend                    │ │ │
│  │  │  (Next.js + MiniAppProvider)                     │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ WebSocket
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              MEV Exorcist Backend                            │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Base RPC   │───▶│ Transaction  │───▶│  Socket.io   │  │
│  │  WebSocket   │    │  Processor   │    │  Broadcaster │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```


### Component Interaction Flow

1. **Initialization**:
   - Frontend loads in Farcaster client webview
   - MiniAppProvider initializes and calls `sdk.actions.ready()`
   - Backend connects to Base network via Alchemy WebSocket
   - Frontend establishes Socket.io connection to backend

2. **Transaction Monitoring**:
   - Backend receives pending transactions from Base network
   - Filters for Uniswap V3 Router transactions
   - Decodes and classifies by risk level
   - Broadcasts to all connected clients via Socket.io

3. **User Interaction**:
   - User views transactions in real-time stream
   - High-risk transactions trigger visual/audio alerts
   - User can share transactions to Farcaster
   - User identity retrieved from Farcaster context

## Components and Interfaces

### Frontend Components

#### 1. MiniAppProvider Wrapper

**Purpose**: Wraps the entire application to provide Mini App SDK context

**Interface**:
```typescript
interface MiniAppProviderProps {
  children: React.ReactNode;
}

// Usage in layout.tsx
<MiniAppProvider>
  {children}
</MiniAppProvider>
```


#### 2. MiniApp Context Hook

**Purpose**: Provides access to Mini App SDK functionality throughout the app

**Interface**:
```typescript
interface MiniAppContext {
  isReady: boolean;
  context: {
    user?: {
      fid: number;
      username: string;
      displayName: string;
      pfpUrl: string;
    };
  };
  wallet: {
    ethProvider?: any;
  };
  actions: {
    ready: () => Promise<void>;
    openUrl: (url: string) => Promise<void>;
  };
}

// Usage
const { context, wallet, actions } = useMiniApp();
```

#### 3. Share Button Component

**Purpose**: Allows users to share MEV alerts on Farcaster

**Interface**:
```typescript
interface ShareButtonProps {
  transaction: ClassifiedTransaction;
}

function ShareButton({ transaction }: ShareButtonProps): JSX.Element;
```


#### 4. User Profile Display

**Purpose**: Shows authenticated Farcaster user information

**Interface**:
```typescript
interface UserProfileProps {
  user?: {
    fid: number;
    username: string;
    displayName: string;
    pfpUrl: string;
  };
}

function UserProfile({ user }: UserProfileProps): JSX.Element;
```

### Backend Components

#### 1. Base Network Configuration

**Purpose**: Configure backend to connect to Base network instead of Sepolia

**Configuration Changes**:
```typescript
interface BaseNetworkConfig {
  ALCHEMY_WSS_URL: string;  // Base WebSocket URL
  ALCHEMY_HTTP_URL: string; // Base HTTP RPC URL
  UNISWAP_V3_ROUTER: string; // Base Uniswap V3 Router address
  BASESCAN_URL: string;     // BaseScan explorer URL
}

// Base Mainnet Configuration
const BASE_CONFIG = {
  ALCHEMY_WSS_URL: 'wss://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY',
  ALCHEMY_HTTP_URL: 'https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY',
  UNISWAP_V3_ROUTER: '0x2626664c2603336E57B271c5C0b26F421741e481',
  BASESCAN_URL: 'https://basescan.org'
};
```


#### 2. Transaction Link Generator

**Purpose**: Generate BaseScan links instead of Etherscan links

**Interface**:
```typescript
interface TransactionLinkGenerator {
  generateLink(txHash: string): string;
}

class BaseScanLinkGenerator implements TransactionLinkGenerator {
  constructor(private baseUrl: string) {}
  
  generateLink(txHash: string): string {
    return `${this.baseUrl}/tx/${txHash}`;
  }
}
```

## Data Models

### Mini App Metadata (farcaster.json)

```json
{
  "version": "1.0.0",
  "name": "The MEV Exorcist",
  "iconUrl": "https://your-domain.com/icon.png",
  "homeUrl": "https://your-domain.com",
  "imageUrl": "https://your-domain.com/preview.png",
  "splashImageUrl": "https://your-domain.com/splash.png",
  "splashBackgroundColor": "#000000",
  "webhookUrl": "https://your-domain.com/api/webhook"
}
```


### HTML Meta Tags

```html
<meta property="fc:frame" content="vNext" />
<meta property="fc:frame:image" content="https://your-domain.com/preview.png" />
<meta property="fc:frame:button:1" content="Open MEV Exorcist" />
<meta property="fc:frame:button:1:action" content="link" />
<meta property="fc:frame:button:1:target" content="https://your-domain.com" />
```

### Share Cast Format

```typescript
interface ShareCastData {
  text: string;
  embeds: string[];
}

// Example
const shareCast: ShareCastData = {
  text: `🚨 HIGH RISK MEV Target Detected!\n\n` +
        `💰 Value: ${transaction.ethValue} ETH\n` +
        `🔍 Function: ${transaction.functionName}\n` +
        `⏰ ${new Date(transaction.timestamp).toLocaleString()}`,
  embeds: [`https://your-domain.com/tx/${transaction.hash}`]
};
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Mini App SDK Initialization

*For any* Mini App load, the system should call `sdk.actions.ready()` during initialization to signal readiness to the Farcaster client.

**Validates: Requirements 1.2, 2.3**

### Property 2: Functionality Preservation Across Contexts

*For any* transaction monitoring operation, the system should produce the same results whether running inside Farcaster or as a standalone application.

**Validates: Requirements 1.4**

### Property 3: Graceful Degradation

*For any* Mini App feature, when the Farcaster context is unavailable, the system should continue functioning without errors.

**Validates: Requirements 1.5**


### Property 4: User Data Access

*For any* user data request, when running in a Mini App context, the system should retrieve user information from `sdk.context.user` rather than external sources.

**Validates: Requirements 2.5, 9.1**

### Property 5: Wallet Provider Selection

*For any* blockchain operation, when the Mini App wallet provider is available, the system should use `sdk.wallet.ethProvider` instead of external wallet connections.

**Validates: Requirements 3.1, 3.2, 3.3**

### Property 6: Ethers.js Compatibility

*For any* ethers.js operation, the system should work correctly with both the Mini App provider and standard providers.

**Validates: Requirements 3.4**

### Property 7: Share Button Visibility

*For any* high-risk transaction, the system should display a share button in the UI.

**Validates: Requirements 5.1**

### Property 8: Share Action Invocation

*For any* share button click, the system should call `sdk.actions.openUrl()` with a properly formatted cast URL.

**Validates: Requirements 5.2**


### Property 9: Share Content Completeness

*For any* transaction share action, the generated cast URL should include all required transaction details (hash, risk level, ETH value) and a deep link back to the Mini App.

**Validates: Requirements 5.3, 5.4**

### Property 10: Deep Link Navigation

*For any* shared transaction link, when opened, the system should load and display the specific transaction details from the URL parameters.

**Validates: Requirements 5.5**

### Property 11: Base Network Link Generation

*For any* transaction detected on Base network, the system should generate links pointing to basescan.org instead of etherscan.io.

**Validates: Requirements 6.4**

### Property 12: Network Functionality Preservation

*For any* transaction monitoring operation, the system should maintain the same functionality when switched from Sepolia to Base network.

**Validates: Requirements 6.5**

### Property 13: Touch Event Handling

*For any* interactive element, touch events should trigger the same actions as click events.

**Validates: Requirements 7.2**


### Property 14: Username Display

*For any* authenticated user, when user data is available from the Farcaster context, the system should display the user's username in the UI.

**Validates: Requirements 9.2**

### Property 15: Profile Data Access

*For any* authenticated user, the system should be able to access profile information (avatar, bio) from the Farcaster context.

**Validates: Requirements 9.3**

### Property 16: Analytics Event Tracking

*For any* user interaction (Mini App launch, transaction view, share action), the system should trigger the corresponding analytics event.

**Validates: Requirements 10.1, 10.2**

### Property 17: Error Logging

*For any* error that occurs during execution, the system should log the error event for debugging purposes.

**Validates: Requirements 10.3**

### Property 18: Analytics Privacy Respect

*For any* analytics event, when the user has opted out of tracking, the system should not send analytics data.

**Validates: Requirements 10.4**


## Error Handling

### Frontend Error Handling

1. **Mini App Context Unavailable**:
   - Detect when `sdk.context` is null or undefined
   - Fall back to standalone mode
   - Display appropriate UI for non-Farcaster users
   - Log warning but continue execution

2. **Wallet Provider Unavailable**:
   - Check for `sdk.wallet.ethProvider` before wallet operations
   - Display message: "Wallet not available in this context"
   - Disable wallet-dependent features gracefully
   - Provide alternative actions when possible

3. **Share Action Failures**:
   - Wrap `sdk.actions.openUrl()` in try-catch
   - Display user-friendly error message
   - Log error details for debugging
   - Provide fallback copy-to-clipboard option

4. **Network Errors**:
   - Handle WebSocket disconnections gracefully
   - Display connection status indicator
   - Implement automatic reconnection
   - Show cached data during disconnection


### Backend Error Handling

1. **Base Network Connection Failures**:
   - Implement exponential backoff for reconnection
   - Log connection attempts and failures
   - Monitor Alchemy API rate limits
   - Alert on sustained connection failures

2. **Transaction Processing Errors**:
   - Catch and log errors for individual transactions
   - Continue processing other transactions
   - Track error rates for monitoring
   - Implement circuit breaker for repeated failures

3. **Invalid Transaction Data**:
   - Validate transaction structure before processing
   - Skip malformed transactions with warning log
   - Track skipped transaction count
   - Alert on high skip rates

4. **WebSocket Broadcast Failures**:
   - Handle client disconnections gracefully
   - Remove disconnected clients from broadcast list
   - Log broadcast errors without crashing
   - Implement message queue for temporary failures

## Testing Strategy

### Unit Testing

The integration will include unit tests for:

1. **Component Rendering**:
   - MiniAppProvider wraps children correctly
   - Share button appears for high-risk transactions
   - User profile displays when data is available
   - Graceful degradation when context is unavailable

2. **Hook Functionality**:
   - useMiniApp() returns correct context
   - Wallet provider selection logic
   - User data retrieval from context
   - Analytics event triggering


3. **Configuration**:
   - Base network URLs are correct
   - Uniswap V3 Router address is valid
   - BaseScan link generation
   - CORS headers configuration

4. **Error Handling**:
   - Null context handling
   - Missing wallet provider
   - Failed share actions
   - Network disconnections

### Property-Based Testing

The integration will use **fast-check** (already in the project) for property-based testing. Each correctness property will be implemented as a property-based test with a minimum of 100 iterations.

**Property Test Requirements**:
- Each property-based test MUST be tagged with a comment referencing the design document property
- Tag format: `// Feature: base-mini-app-integration, Property {number}: {property_text}`
- Each correctness property MUST be implemented by a SINGLE property-based test
- Tests should run 100+ iterations to ensure robustness

**Property Tests to Implement**:

1. **Property 1 - SDK Initialization**: Test that ready() is called for any component mount
2. **Property 2 - Functionality Preservation**: Test that transaction processing produces same results in both contexts
3. **Property 3 - Graceful Degradation**: Test that all features work when context is null/undefined
4. **Property 4 - User Data Access**: Test that user data comes from correct source
5. **Property 5 - Wallet Provider Selection**: Test that correct provider is used based on availability
6. **Property 6 - Ethers.js Compatibility**: Test that ethers operations work with Mini App provider
7. **Property 7 - Share Button Visibility**: Test that share button appears for all high-risk transactions
8. **Property 8 - Share Action Invocation**: Test that openUrl is called with correct parameters
9. **Property 9 - Share Content Completeness**: Test that share URLs contain all required data
10. **Property 10 - Deep Link Navigation**: Test that transaction details load from URL params
11. **Property 11 - Base Network Links**: Test that all generated links use basescan.org
12. **Property 12 - Network Functionality**: Test that monitoring works the same on Base
13. **Property 13 - Touch Events**: Test that touch and click produce same results
14. **Property 14 - Username Display**: Test that username appears when user data exists
15. **Property 15 - Profile Data Access**: Test that profile fields are accessible
16. **Property 16 - Analytics Tracking**: Test that events trigger analytics calls
17. **Property 17 - Error Logging**: Test that errors trigger logging
18. **Property 18 - Analytics Privacy**: Test that opt-out prevents tracking


### Integration Testing

Integration tests will verify:

1. **End-to-End Mini App Flow**:
   - App loads in simulated Farcaster context
   - User authentication works
   - Transactions are received and displayed
   - Share functionality creates correct casts
   - Deep links navigate to correct transactions

2. **Base Network Integration**:
   - Backend connects to Base network
   - Transactions are detected and processed
   - Links point to BaseScan
   - All existing functionality works on Base

3. **Cross-Browser Testing**:
   - Test in Chrome, Safari, Firefox
   - Test on iOS and Android devices
   - Verify WebSocket connections work
   - Verify responsive design

4. **Performance Testing**:
   - Measure load time in Mini App context
   - Test with high transaction volume
   - Monitor memory usage
   - Verify smooth animations on mobile

## Implementation Notes

### Package Dependencies

**New Frontend Dependencies**:
```json
{
  "@neynar/react": "^latest",
  "@farcaster/miniapp-sdk": "^latest"
}
```

**Backend Configuration Changes**:
- Update Alchemy API endpoints to Base network
- Update Uniswap V3 Router address for Base
- Update explorer URLs to BaseScan


### Environment Variables

**New Frontend Variables**:
```bash
NEXT_PUBLIC_MINI_APP_MODE=true
NEXT_PUBLIC_BASESCAN_URL=https://basescan.org
```

**Updated Backend Variables**:
```bash
# Base Mainnet
ALCHEMY_WSS_URL=wss://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY
ALCHEMY_HTTP_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY
UNISWAP_V3_ROUTER=0x2626664c2603336E57B271c5C0b26F421741e481
NETWORK_NAME=base
EXPLORER_URL=https://basescan.org
```

### Deployment Considerations

1. **CORS Configuration**:
   - Allow embedding from Farcaster client domains
   - Set appropriate `X-Frame-Options` header
   - Configure CSP for iframe embedding

2. **HTTPS Requirements**:
   - Mini Apps must be served over HTTPS
   - Ensure SSL certificates are valid
   - Configure secure WebSocket (wss://)

3. **Performance Optimization**:
   - Enable CDN for static assets
   - Implement code splitting
   - Optimize bundle size for mobile
   - Use service workers for offline support

4. **Monitoring**:
   - Track Mini App load times
   - Monitor WebSocket connection stability
   - Alert on high error rates
   - Track user engagement metrics

### Security Considerations

1. **Input Validation**:
   - Validate all data from Farcaster context
   - Sanitize user-generated content in shares
   - Validate transaction hashes from URL params

2. **API Security**:
   - Protect Alchemy API keys
   - Rate limit public endpoints
   - Implement request authentication

3. **Privacy**:
   - Only request necessary user data
   - Respect analytics opt-out preferences
   - Don't store sensitive user information
   - Comply with privacy regulations

