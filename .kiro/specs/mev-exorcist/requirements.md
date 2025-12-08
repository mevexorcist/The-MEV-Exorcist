# Requirements Document

## Introduction

The MEV Exorcist is a real-time Ethereum mempool monitoring application that visualizes potential MEV (Maximal Extractable Value) attack targets in the pending transaction pool. The system detects high-value swap transactions on Uniswap V3 that are vulnerable to front-running and sandwich attacks, presenting them through a cyber-horror themed interface. The application targets the Juara Kiroween Hackathon with a "Wicked/Dark Mode" theme, making invisible blockchain dangers visible through real-time monitoring and dramatic visual feedback.

## Glossary

- **MEV (Maximal Extractable Value)**: The profit that can be extracted by reordering, inserting, or censoring transactions within blocks
- **Mempool**: The waiting area for pending Ethereum transactions before they are included in a block
- **The Seer**: The backend Node.js server component responsible for monitoring the mempool
- **The Radar**: The frontend React/Next.js component responsible for visualizing detected transactions
- **Uniswap V3 Router**: The smart contract address on Ethereum that handles token swap operations
- **ABI (Application Binary Interface)**: The interface definition used to decode smart contract function calls
- **WebSocket (WSS)**: A persistent bidirectional communication protocol for real-time data streaming
- **Alchemy**: The blockchain node provider service used to access Ethereum network data
- **Sepolia Testnet**: The Ethereum test network used for safe development and testing
- **Front-running**: An MEV attack where a bot places a transaction before a victim's transaction
- **Sandwich Attack**: An MEV attack where a bot places transactions both before and after a victim's transaction
- **Slippage**: The difference between expected and actual transaction execution price

## Requirements

### Requirement 1

**User Story:** As a blockchain researcher, I want to monitor pending Uniswap transactions in real-time, so that I can observe MEV attack patterns as they occur.

#### Acceptance Criteria

1. WHEN The Seer connects to Alchemy THEN the system SHALL establish a persistent WebSocket connection to the Ethereum Sepolia testnet
2. WHEN a new transaction enters the mempool THEN The Seer SHALL receive the transaction hash within 100 milliseconds
3. WHEN The Seer receives a transaction hash THEN the system SHALL fetch the complete transaction details from the node provider
4. WHEN The Seer loses connection to Alchemy THEN the system SHALL attempt automatic reconnection with exponential backoff
5. WHEN The Seer successfully reconnects THEN the system SHALL resume transaction monitoring without data loss

### Requirement 2

**User Story:** As a user, I want the system to filter only Uniswap V3 swap transactions, so that I can focus on relevant trading activity without noise.

#### Acceptance Criteria

1. WHEN The Seer receives a transaction THEN the system SHALL check if the transaction recipient address matches the Uniswap V3 Router address
2. WHEN a transaction does not target the Uniswap V3 Router THEN The Seer SHALL discard the transaction without further processing
3. WHEN a transaction targets the Uniswap V3 Router THEN The Seer SHALL decode the transaction input data using the Uniswap V3 ABI
4. WHEN transaction decoding fails THEN The Seer SHALL log the error and continue processing other transactions
5. WHEN a decoded transaction contains a swap function call THEN the system SHALL extract the swap parameters for analysis

### Requirement 3

**User Story:** As a trader, I want to identify high-value swap transactions that are MEV targets, so that I can understand which transactions are at risk.

#### Acceptance Criteria

1. WHEN The Seer decodes a swap transaction THEN the system SHALL extract the ETH value being swapped
2. WHEN the swap value exceeds 0.1 ETH THEN the system SHALL classify the transaction as "High Risk MEV Target"
3. WHEN the swap value is below 0.1 ETH THEN the system SHALL classify the transaction as "Low Risk"
4. WHEN a transaction is classified as High Risk THEN The Seer SHALL extract the sender address, transaction hash, ETH value, and risk level
5. WHEN transaction classification is complete THEN The Seer SHALL broadcast the classified transaction data to all connected frontend clients

### Requirement 4

**User Story:** As a user, I want to see detected transactions displayed in real-time on my screen, so that I can monitor mempool activity as it happens.

#### Acceptance Criteria

1. WHEN The Radar loads THEN the system SHALL establish a Socket.io connection to The Seer backend
2. WHEN The Seer broadcasts a transaction THEN The Radar SHALL receive the transaction data within 50 milliseconds
3. WHEN The Radar receives a Low Risk transaction THEN the system SHALL display it in the transaction stream with gray styling
4. WHEN The Radar receives a High Risk transaction THEN the system SHALL display it in the transaction stream with red styling and a pulsing border
5. WHEN the transaction stream exceeds 50 items THEN The Radar SHALL remove the oldest transactions to maintain performance

### Requirement 5

**User Story:** As a user, I want a cyber-horror themed interface with dark colors and dramatic effects, so that the experience matches the "wicked" hackathon theme.

#### Acceptance Criteria

1. WHEN The Radar renders THEN the system SHALL apply a black background color (#000000) to the main interface
2. WHEN displaying High Risk transactions THEN the system SHALL use blood red color (#FF0000) for text and borders
3. WHEN displaying Low Risk transactions THEN the system SHALL use matrix green color (#00FF00) for text
4. WHEN The Radar displays the title THEN the system SHALL apply a glitch animation effect to the text
5. WHEN the interface is idle THEN the system SHALL display a monospace font throughout the application

### Requirement 6

**User Story:** As a user, I want to see an animated radar visualization that reacts to MEV threats, so that I can quickly identify dangerous activity.

#### Acceptance Criteria

1. WHEN The Radar loads THEN the system SHALL display a circular radar animation component
2. WHEN no High Risk transactions are detected THEN the radar SHALL rotate slowly with a green color scheme
3. WHEN a High Risk transaction is detected THEN the radar SHALL change to red color and increase rotation speed
4. WHEN the radar is in alert state THEN the system SHALL maintain the alert state for 3 seconds before returning to normal
5. WHEN multiple High Risk transactions occur rapidly THEN the radar SHALL remain in alert state continuously

### Requirement 7

**User Story:** As a user, I want to see detailed information about detected MEV targets in a popup card, so that I can examine specific transactions.

#### Acceptance Criteria

1. WHEN a High Risk transaction is detected THEN The Radar SHALL display a detail card overlay
2. WHEN the detail card displays THEN the system SHALL show the victim wallet address in truncated format
3. WHEN the detail card displays THEN the system SHALL show the ETH value with 4 decimal precision
4. WHEN the detail card displays THEN the system SHALL show the transaction hash as a clickable link to Etherscan
5. WHEN the detail card displays THEN the system SHALL show a "HUNTED" status label in red

### Requirement 8

**User Story:** As a user, I want audio feedback when transactions are detected, so that I can be alerted even when not looking at the screen.

#### Acceptance Criteria

1. WHEN a Low Risk transaction is detected THEN The Radar SHALL play a subtle "tick" sound effect
2. WHEN a High Risk transaction is detected THEN The Radar SHALL play a loud siren or glitch noise sound effect
3. WHEN the user first interacts with the page THEN the system SHALL request audio permission from the browser
4. WHEN audio is disabled by the user THEN the system SHALL continue visual notifications without sound
5. WHEN multiple High Risk transactions occur rapidly THEN the system SHALL prevent audio overlap by queuing sound effects

### Requirement 9

**User Story:** As a developer, I want the backend to be deployable to cloud platforms, so that the application can run continuously without local infrastructure.

#### Acceptance Criteria

1. WHEN The Seer is configured THEN the system SHALL read the Alchemy WebSocket URL from environment variables
2. WHEN The Seer is configured THEN the system SHALL read the Uniswap V3 Router address from environment variables
3. WHEN The Seer is configured THEN the system SHALL read the server port from environment variables with a default value
4. WHEN The Seer starts THEN the system SHALL log the configuration status and connection state
5. WHEN The Seer is deployed to Render or Railway THEN the system SHALL start successfully and maintain WebSocket connections

### Requirement 10

**User Story:** As a developer, I want the frontend to be deployable to Vercel, so that users can access the application through a public URL.

#### Acceptance Criteria

1. WHEN The Radar is configured THEN the system SHALL read the backend URL from environment variables
2. WHEN The Radar is built for production THEN the system SHALL generate optimized static assets
3. WHEN The Radar is deployed to Vercel THEN the system SHALL connect to the backend server successfully
4. WHEN The Radar is accessed by users THEN the system SHALL load within 2 seconds on standard connections
5. WHEN The Radar encounters connection errors THEN the system SHALL display a user-friendly error message with retry options
