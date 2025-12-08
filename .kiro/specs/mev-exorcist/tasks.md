# Implementation Plan

- [x] 1. Set up project structure and dependencies





  - Create separate backend and frontend directories
  - Initialize Node.js project for backend with TypeScript
  - Initialize Next.js 14 project for frontend
  - Install backend dependencies: ws, socket.io, ethers, dotenv
  - Install frontend dependencies: socket.io-client, framer-motion, tailwindcss
  - Install testing dependencies: jest, @types/jest, fast-check
  - Create environment variable templates (.env.example, .env.local.example)
  - _Requirements: 9.1, 9.2, 9.3, 10.1_

- [x] 2. Implement backend WebSocket client manager





  - Create AlchemyWebSocketClient class with connection management
  - Implement connect() method with error handling
  - Implement subscribe() method for pending transactions
  - Implement reconnection logic with exponential backoff (1s, 2s, 4s, 8s, 16s, max 30s)
  - Add connection state tracking and event emitters
  - _Requirements: 1.1, 1.4, 1.5_

- [x] 2.1 Write property test for WebSocket reconnection


  - **Property: Exponential backoff timing**
  - **Validates: Requirements 1.4**

- [x] 3. Implement transaction processor





  - Create TransactionProcessor class
  - Implement processTransactionHash() to fetch transaction details from Alchemy
  - Implement isTargetTransaction() to filter by Uniswap V3 Router address
  - Add error handling for failed transaction fetches
  - _Requirements: 1.3, 2.1, 2.2_

- [x] 3.1 Write property test for transaction detail fetching


  - **Property 1: Transaction detail fetching consistency**
  - **Validates: Requirements 1.3**

- [x] 3.2 Write property test for router address filtering


  - **Property 2: Router address filtering**
  - **Property 3: Non-router transaction filtering**
  - **Validates: Requirements 2.1, 2.2**

- [x] 4. Implement ABI decoder





  - Create ABIDecoder class with Uniswap V3 ABI
  - Implement decode() method using ethers.js Interface
  - Implement isSwapFunction() to identify swap operations
  - Add error handling for invalid input data
  - Extract swap parameters (amountIn, amountOutMin, path, recipient, deadline)
  - _Requirements: 2.3, 2.4, 2.5_

- [x] 4.1 Write property test for router transaction decoding


  - **Property 4: Router transaction decoding**
  - **Validates: Requirements 2.3**

- [x] 4.2 Write property test for swap parameter extraction


  - **Property 5: Swap parameter extraction**
  - **Validates: Requirements 2.5**

- [x] 5. Implement risk classifier





  - Create RiskClassifier class
  - Implement classify() method to extract transaction data
  - Implement calculateRiskLevel() with 0.1 ETH threshold
  - Format ETH values with 4 decimal precision
  - Create ClassifiedTransaction data structure
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 5.1 Write property test for ETH value extraction


  - **Property 6: ETH value extraction**
  - **Validates: Requirements 3.1**


- [x] 5.2 Write property test for risk classification thresholds





  - **Property 7: High-risk classification threshold**
  - **Property 8: Low-risk classification threshold**
  - **Validates: Requirements 3.2, 3.3**


- [x] 5.3 Write property test for high-risk data extraction





  - **Property 9: High-risk data extraction completeness**
  - **Validates: Requirements 3.4**

- [x] 6. Implement Socket.io server and broadcasting





  - Create TransactionBroadcaster class with Socket.io server
  - Implement start() method to initialize server on configured port
  - Implement broadcast() method to send transactions to all clients
  - Add connection/disconnection event handlers
  - Implement getConnectedClients() for monitoring
  - Add health check endpoint
  - _Requirements: 3.5, 9.4_


- [x] 6.1 Write property test for transaction broadcasting

  - **Property 10: Transaction broadcast consistency**
  - **Validates: Requirements 3.5**

- [x] 7. Integrate backend components into main server





  - Create main server entry point (index.ts)
  - Wire together WebSocket client, processor, decoder, classifier, and broadcaster
  - Implement transaction processing pipeline
  - Add configuration loading from environment variables
  - Add startup logging for configuration and connection state
  - Implement graceful shutdown handling
  - _Requirements: 1.1, 1.2, 1.3, 9.1, 9.2, 9.3, 9.4_

- [x] 7.1 Write integration test for end-to-end backend flow


  - Test mock Alchemy WebSocket → Process → Broadcast flow
  - _Requirements: 1.1, 1.3, 3.5_

- [x] 8. Checkpoint - Ensure all backend tests pass





  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement frontend Socket.io client hook





  - Create useTransactionStream custom hook
  - Implement Socket.io client connection to backend
  - Handle connection, disconnection, and error events
  - Maintain transactions array state
  - Add automatic reconnection logic
  - _Requirements: 4.1, 10.1, 10.5_

- [x] 10. Implement transaction stream component





  - Create TransactionStream component
  - Render scrolling list of transactions
  - Implement risk-based styling (gray for LOW, red for HIGH)
  - Add pulsing border animation for HIGH risk transactions
  - Implement 50-item limit with FIFO removal
  - Add click handler for transaction details
  - _Requirements: 4.3, 4.4, 4.5_

- [x] 10.1 Write property test for low-risk transaction styling


  - **Property 11: Low-risk transaction styling**
  - **Property 15: Low-risk transaction color consistency**
  - **Validates: Requirements 4.3, 5.3**

- [x] 10.2 Write property test for high-risk transaction styling

  - **Property 12: High-risk transaction styling**
  - **Property 14: High-risk transaction color consistency**
  - **Validates: Requirements 4.4, 5.2**

- [x] 10.3 Write property test for transaction stream size limit

  - **Property 13: Transaction stream size limit**
  - **Validates: Requirements 4.5**

- [x] 11. Implement radar visualization component





  - Create RadarVisualization component with SVG circular radar
  - Implement normal state: slow rotation (10s), green color
  - Implement alert state: fast rotation (2s), red color
  - Add state transition logic triggered by HIGH risk transactions
  - Implement 3-second alert state timeout
  - Handle rapid transaction sequences to maintain alert state
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 11.1 Write property test for radar alert state transition


  - **Property 16: Radar alert state transition**
  - **Validates: Requirements 6.3**

- [x] 11.2 Write property test for continuous alert state


  - **Property 17: Continuous alert state maintenance**
  - **Validates: Requirements 6.5**

- [x] 12. Implement detail card component





  - Create DetailCard component with overlay styling
  - Display victim wallet address with truncation (0x1234...5678)
  - Display ETH value with 4 decimal precision
  - Display transaction hash as clickable Etherscan link
  - Display "HUNTED" status label in red
  - Add close button and click-outside-to-close functionality
  - Trigger display on HIGH risk transaction detection
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 12.1 Write property test for detail card display trigger


  - **Property 18: Detail card display trigger**
  - **Validates: Requirements 7.1**


- [x] 12.2 Write property test for address truncation





  - **Property 19: Address truncation format**
  - **Validates: Requirements 7.2**


- [x] 12.3 Write property test for ETH value precision





  - **Property 20: ETH value precision**

  - **Validates: Requirements 7.3**

- [x] 12.4 Write property test for Etherscan link generation





  - **Property 21: Etherscan link generation**
  - **Validates: Requirements 7.4**

- [x] 13. Implement audio system hook





  - Create useAudioFeedback custom hook
  - Implement Web Audio API setup
  - Create playTick() function (100ms sine wave at 800Hz)
  - Create playSiren() function (500ms oscillating square wave 400-800Hz)
  - Implement audio permission request on first user interaction
  - Add enable/disable toggle functionality
  - Implement sound effect queuing to prevent overlap
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 13.1 Write property test for low-risk audio feedback


  - **Property 22: Low-risk audio feedback**
  - **Validates: Requirements 8.1**

- [x] 13.2 Write property test for high-risk audio feedback

  - **Property 23: High-risk audio feedback**
  - **Validates: Requirements 8.2**

- [x] 13.3 Write property test for audio queuing

  - **Property 24: Audio queuing for rapid transactions**
  - **Validates: Requirements 8.5**

- [x] 14. Implement cyber-horror theme and styling





  - Create Tailwind CSS custom theme with color palette
  - Define colors: Void Black (#000000), Blood Red (#FF0000), Matrix Green (#00FF00)
  - Apply monospace font family globally
  - Create glitch animation effect for title
  - Apply black background to main interface
  - Create pulsing border animation for HIGH risk transactions
  - Add CSS transforms for GPU-accelerated animations
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 15. Integrate frontend components into main dashboard





  - Create main Dashboard page component
  - Add "THE MEV EXORCIST" title with glitch effect
  - Integrate TransactionStream component
  - Integrate RadarVisualization component
  - Integrate DetailCard component
  - Wire up useTransactionStream hook
  - Wire up useAudioFeedback hook
  - Connect transaction events to radar and audio systems
  - Add connection status indicator
  - _Requirements: 4.1, 4.2, 5.1, 5.4_

- [x] 15.1 Write integration test for frontend end-to-end flow


  - Test mock Socket.io → Receive → Render → Audio flow
  - _Requirements: 4.1, 4.3, 4.4, 8.1, 8.2_

- [x] 16. Checkpoint - Ensure all frontend tests pass





  - Ensure all tests pass, ask the user if questions arise.

- [x] 17. Configure backend deployment




  - Create Dockerfile for backend (optional)
  - Create railway.json or render.yaml configuration
  - Set up environment variables in deployment platform
  - Configure health check endpoint
  - Test deployment with staging environment
  - Verify WebSocket connection to Alchemy from deployed backend
  - _Requirements: 9.1, 9.2, 9.3, 9.5_

- [ ] 18. Configure frontend deployment
  - Create vercel.json with headers and CSP configuration
  - Set up environment variables in Vercel
  - Configure build settings (Next.js framework)
  - Test preview deployment
  - Verify Socket.io connection to deployed backend
  - Test on multiple browsers and devices
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 19. Final integration testing and polish
  - Test complete system with real Sepolia testnet data
  - Verify all visual effects work correctly
  - Verify audio plays on all supported browsers
  - Test error handling with simulated connection failures
  - Verify responsive design on mobile devices
  - Add loading states and error messages
  - Optimize performance (check FPS, memory usage)
  - _Requirements: 4.2, 10.4, 10.5_

- [ ] 20. Final checkpoint - Production readiness
  - Ensure all tests pass, ask the user if questions arise.
