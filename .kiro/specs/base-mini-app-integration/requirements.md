# Requirements Document

## Introduction

This document outlines the requirements for converting The MEV Exorcist application into a Farcaster Mini App that runs on the Base network. The integration will enable users to access real-time MEV monitoring directly within Farcaster clients, with seamless wallet integration and social sharing capabilities.

## Glossary

- **Mini App**: A web application that runs inside Farcaster clients, providing interactive experiences without leaving the platform
- **Base Network**: An Ethereum Layer 2 network optimized for low-cost transactions
- **Farcaster**: A decentralized social network protocol
- **MEV Exorcist**: The existing application that monitors Ethereum mempool for MEV attack targets
- **MiniAppProvider**: A React component from @neynar/react that provides Mini App SDK functionality
- **Wallet Provider**: The Ethereum provider exposed by the Mini App SDK for blockchain interactions
- **farcaster.json**: A metadata file that describes the Mini App's configuration and ownership

## Requirements

### Requirement 1

**User Story:** As a Farcaster user, I want to access The MEV Exorcist directly within my Farcaster client, so that I can monitor MEV activity without leaving the social platform.

#### Acceptance Criteria

1. WHEN a user opens The MEV Exorcist Mini App from Farcaster THEN the system SHALL load the application interface within the Farcaster client webview
2. WHEN the Mini App loads THEN the system SHALL signal readiness to the Farcaster client using the Mini App SDK
3. WHEN the Mini App is embedded in a cast THEN the system SHALL display appropriate preview metadata including title, description, and image
4. THE Mini App SHALL maintain all existing MEV monitoring functionality when running inside Farcaster
5. WHEN the Mini App detects it is running outside Farcaster THEN the system SHALL function as a standalone web application

### Requirement 2

**User Story:** As a developer, I want to integrate the Mini App SDK into the frontend, so that the application can communicate with Farcaster clients.

#### Acceptance Criteria

1. WHEN the application initializes THEN the system SHALL install the @neynar/react package
2. WHEN the React application starts THEN the system SHALL wrap the root component with MiniAppProvider
3. WHEN the MiniAppProvider initializes THEN the system SHALL call sdk.actions.ready() to signal the app is loaded
4. THE system SHALL expose Mini App context through the useMiniApp() hook
5. WHEN running in a Mini App context THEN the system SHALL access user data through sdk.context

### Requirement 3

**User Story:** As a user, I want to connect my Ethereum wallet through Farcaster, so that I can interact with blockchain features seamlessly.

#### Acceptance Criteria

1. WHEN the Mini App needs wallet access THEN the system SHALL use the Ethereum provider from sdk.wallet.ethProvider
2. WHEN a user connects their wallet THEN the system SHALL retrieve the wallet address from the Farcaster context
3. WHEN blockchain transactions are required THEN the system SHALL use the Mini App's wallet provider instead of external wallet connections
4. THE system SHALL maintain compatibility with existing ethers.js integration
5. WHEN the wallet provider is unavailable THEN the system SHALL gracefully handle the absence and display appropriate messaging

### Requirement 4

**User Story:** As a developer, I want to configure the Mini App metadata, so that Farcaster clients can properly display and verify the application.

#### Acceptance Criteria

1. THE system SHALL create a farcaster.json file in the public directory
2. WHEN Farcaster clients request metadata THEN the system SHALL serve the farcaster.json file at the root URL
3. THE farcaster.json file SHALL include the Mini App name, version, icon URL, and home URL
4. THE farcaster.json file SHALL include a cryptographic signature proving ownership
5. THE system SHALL include HTML meta tags for embed rendering configuration

### Requirement 5

**User Story:** As a user, I want to share MEV alerts on Farcaster, so that I can notify my network about high-risk transactions.

#### Acceptance Criteria

1. WHEN a high-risk transaction is detected THEN the system SHALL provide a share button
2. WHEN a user clicks the share button THEN the system SHALL use sdk.actions.openUrl() to create a cast
3. THE share action SHALL pre-fill the cast with transaction details including hash, risk level, and ETH value
4. THE share action SHALL include a link back to the Mini App with the transaction hash as a parameter
5. WHEN a user opens a shared link THEN the system SHALL display details for the specific transaction

### Requirement 6

**User Story:** As a developer, I want to switch the backend from Ethereum Sepolia to Base network, so that the application monitors MEV activity on Base.

#### Acceptance Criteria

1. WHEN the backend initializes THEN the system SHALL connect to Base network RPC endpoints
2. THE system SHALL update the Alchemy WebSocket URL to use Base network
3. THE system SHALL update the Uniswap V3 Router address to the Base deployment
4. WHEN transactions are detected THEN the system SHALL link to BaseScan instead of Etherscan
5. THE system SHALL maintain all existing transaction monitoring functionality on Base network

### Requirement 7

**User Story:** As a user, I want the Mini App to work on mobile devices, so that I can monitor MEV activity from my phone.

#### Acceptance Criteria

1. WHEN the Mini App loads on mobile THEN the system SHALL render a responsive interface optimized for small screens
2. WHEN touch interactions occur THEN the system SHALL respond appropriately to touch events
3. THE system SHALL maintain performance on mobile devices with limited resources
4. WHEN the device orientation changes THEN the system SHALL adapt the layout accordingly
5. THE system SHALL ensure all interactive elements are touch-friendly with appropriate sizing

### Requirement 8

**User Story:** As a developer, I want to deploy the Mini App to a public URL, so that Farcaster clients can access it.

#### Acceptance Criteria

1. THE system SHALL deploy the frontend to a production hosting service
2. THE system SHALL deploy the backend to a production hosting service with WebSocket support
3. WHEN the Mini App is deployed THEN the system SHALL serve content over HTTPS
4. THE system SHALL configure CORS to allow embedding in Farcaster clients
5. THE system SHALL include appropriate security headers for iframe embedding

### Requirement 9

**User Story:** As a user, I want to authenticate with my Farcaster identity, so that the Mini App can personalize my experience.

#### Acceptance Criteria

1. WHEN the Mini App loads THEN the system SHALL retrieve the user's Farcaster ID from sdk.context.user
2. WHEN user data is available THEN the system SHALL display the user's Farcaster username
3. THE system SHALL access the user's profile information including avatar and bio
4. WHEN the user is not authenticated THEN the system SHALL display a guest experience
5. THE system SHALL respect user privacy and only access necessary profile data

### Requirement 10

**User Story:** As a developer, I want to add analytics tracking, so that I can understand how users interact with the Mini App.

#### Acceptance Criteria

1. WHEN user interactions occur THEN the system SHALL track events using the Neynar analytics system
2. THE system SHALL track Mini App launches, transaction views, and share actions
3. WHEN errors occur THEN the system SHALL log error events for debugging
4. THE system SHALL respect user privacy preferences for analytics
5. THE system SHALL provide aggregate usage statistics without exposing individual user data
