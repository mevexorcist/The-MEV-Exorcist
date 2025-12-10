# Implementation Plan: Base Mini App Integration

- [x] 1. Install and configure Mini App SDK dependencies


  - Install @neynar/react package in frontend
  - Install @farcaster/miniapp-sdk as peer dependency
  - Update package.json with correct versions
  - _Requirements: 2.1_

- [x] 2. Set up MiniAppProvider wrapper

  - [x] 2.1 Wrap root layout with MiniAppProvider


    - Modify frontend/app/layout.tsx to include MiniAppProvider
    - Configure provider with app metadata
    - Ensure provider wraps all children components
    - _Requirements: 2.2_

  - [ ]* 2.2 Write property test for SDK initialization
    - **Property 1: Mini App SDK Initialization**
    - **Validates: Requirements 1.2, 2.3**

  - [ ]* 2.3 Write unit test for MiniAppProvider structure
    - Test that MiniAppProvider is present in component tree
    - Test that children render correctly
    - _Requirements: 2.2_

- [x] 3. Create Mini App context hook and utilities

  - [x] 3.1 Create useMiniAppContext custom hook


    - Wrap useMiniApp() from @neynar/react
    - Provide type-safe access to context, wallet, and actions
    - Handle cases where context is unavailable
    - _Requirements: 2.4, 2.5_

  - [ ]* 3.2 Write property test for graceful degradation
    - **Property 3: Graceful Degradation**
    - **Validates: Requirements 1.5**

  - [ ]* 3.3 Write property test for user data access
    - **Property 4: User Data Access**
    - **Validates: Requirements 2.5, 9.1**


- [x] 4. Implement wallet provider integration

  - [x] 4.1 Create wallet provider selector utility


    - Check for sdk.wallet.ethProvider availability
    - Fall back to standard provider when unavailable
    - Maintain compatibility with existing ethers.js code
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 4.2 Write property test for wallet provider selection
    - **Property 5: Wallet Provider Selection**
    - **Validates: Requirements 3.1, 3.2, 3.3**

  - [ ]* 4.3 Write property test for ethers.js compatibility
    - **Property 6: Ethers.js Compatibility**
    - **Validates: Requirements 3.4**

  - [ ]* 4.4 Write unit test for wallet unavailable handling
    - Test graceful handling when provider is null
    - Test appropriate error messaging
    - _Requirements: 3.5_

- [x] 5. Create farcaster.json metadata file

  - [x] 5.1 Create public/farcaster.json with app metadata


    - Include name, version, icon URL, home URL
    - Add image URLs for preview and splash
    - Configure webhook URL for notifications
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 5.2 Add HTML meta tags for embed rendering

    - Add fc:frame meta tags to layout.tsx
    - Configure frame image and buttons
    - Set up proper Open Graph tags
    - _Requirements: 4.5_

  - [ ]* 5.3 Write unit test for metadata structure
    - Test that farcaster.json contains all required fields
    - Test that meta tags are present in HTML
    - _Requirements: 4.3, 4.5_


- [x] 6. Implement user profile display component

  - [x] 6.1 Create UserProfile component


    - Display Farcaster username and avatar
    - Show profile information from context
    - Handle guest mode when user is not authenticated
    - Add to main page header
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ]* 6.2 Write property test for username display
    - **Property 14: Username Display**
    - **Validates: Requirements 9.2**

  - [ ]* 6.3 Write property test for profile data access
    - **Property 15: Profile Data Access**
    - **Validates: Requirements 9.3**

  - [ ]* 6.4 Write unit test for guest mode
    - Test that guest experience displays when user is null
    - _Requirements: 9.4_

- [x] 7. Implement share functionality

  - [x] 7.1 Create ShareButton component


    - Add share button to DetailCard for high-risk transactions
    - Format cast text with transaction details
    - Generate deep link URL with transaction hash
    - Call sdk.actions.openUrl() with cast URL
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 7.2 Write property test for share button visibility
    - **Property 7: Share Button Visibility**
    - **Validates: Requirements 5.1**

  - [ ]* 7.3 Write property test for share action invocation
    - **Property 8: Share Action Invocation**
    - **Validates: Requirements 5.2**

  - [ ]* 7.4 Write property test for share content completeness
    - **Property 9: Share Content Completeness**
    - **Validates: Requirements 5.3, 5.4**


- [x] 8. Implement deep linking for shared transactions

  - [x] 8.1 Add URL parameter handling to main page


    - Parse transaction hash from URL query parameters
    - Load and display specific transaction on mount
    - Highlight the transaction in the stream
    - _Requirements: 5.5_

  - [ ]* 8.2 Write property test for deep link navigation
    - **Property 10: Deep Link Navigation**
    - **Validates: Requirements 5.5**

- [x] 9. Migrate backend to Base network

  - [x] 9.1 Update backend configuration for Base


    - Change ALCHEMY_WSS_URL to Base mainnet endpoint
    - Update UNISWAP_V3_ROUTER to Base deployment address
    - Add BASESCAN_URL environment variable
    - Update .env.example with Base configuration
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 9.2 Create BaseScan link generator


    - Create utility function to generate BaseScan links
    - Replace Etherscan links throughout codebase
    - Update frontend to use BaseScan URLs
    - _Requirements: 6.4_

  - [ ]* 9.3 Write property test for Base network links
    - **Property 11: Base Network Link Generation**
    - **Validates: Requirements 6.4**

  - [ ]* 9.4 Write property test for network functionality preservation
    - **Property 12: Network Functionality Preservation**
    - **Validates: Requirements 6.5**

  - [ ]* 9.5 Write unit tests for Base configuration
    - Test that Base URLs are correctly configured
    - Test that Uniswap V3 Router address is valid
    - _Requirements: 6.1, 6.2, 6.3_


- [x] 10. Optimize for mobile and touch interactions

  - [x] 10.1 Add touch event handlers


    - Ensure all interactive elements respond to touch
    - Add touch-friendly sizing (minimum 44x44px)
    - Test touch events trigger same actions as clicks
    - _Requirements: 7.2, 7.5_

  - [ ]* 10.2 Write property test for touch event handling
    - **Property 13: Touch Event Handling**
    - **Validates: Requirements 7.2**

- [x] 11. Implement analytics tracking

  - [x] 11.1 Create analytics utility module


    - Wrap Neynar analytics functions
    - Track Mini App launches, transaction views, share actions
    - Implement error logging
    - Respect user privacy preferences
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 11.2 Add analytics calls throughout app


    - Track app initialization
    - Track transaction views
    - Track share button clicks
    - Track errors
    - _Requirements: 10.1, 10.2, 10.3_

  - [ ]* 11.3 Write property test for analytics event tracking
    - **Property 16: Analytics Event Tracking**
    - **Validates: Requirements 10.1, 10.2**

  - [ ]* 11.4 Write property test for error logging
    - **Property 17: Error Logging**
    - **Validates: Requirements 10.3**

  - [ ]* 11.5 Write property test for analytics privacy
    - **Property 18: Analytics Privacy Respect**
    - **Validates: Requirements 10.4**


- [x] 12. Configure deployment settings

  - [x] 12.1 Update frontend deployment configuration


    - Configure CORS to allow Farcaster embedding
    - Set appropriate security headers (X-Frame-Options, CSP)
    - Ensure HTTPS is enforced
    - Update environment variables for production
    - _Requirements: 8.3, 8.4, 8.5_

  - [x] 12.2 Update backend deployment configuration


    - Ensure WebSocket support is enabled
    - Configure CORS for frontend domain
    - Set up health check endpoint
    - Update environment variables for Base network
    - _Requirements: 8.1, 8.2_

  - [ ]* 12.3 Write unit tests for CORS and security headers
    - Test that CORS headers are set correctly
    - Test that security headers are present
    - _Requirements: 8.4, 8.5_

- [x] 13. Checkpoint - Ensure all tests pass


  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Create app icons and preview images

  - [x] 14.1 Design and export app icons


    - Create 512x512 icon for farcaster.json
    - Create preview image for embeds (1200x630)
    - Create splash screen image
    - Optimize images for web
    - _Requirements: 4.3_

  - [x] 14.2 Add images to public directory

    - Place icon.png in public/
    - Place preview.png in public/
    - Place splash.png in public/
    - Update farcaster.json with correct URLs
    - _Requirements: 4.3_


- [x] 15. Update documentation

  - [x] 15.1 Update README with Mini App instructions


    - Add section on running as Farcaster Mini App
    - Document new environment variables
    - Add Base network configuration details
    - Include troubleshooting for Mini App issues
    - _Requirements: All_

  - [x] 15.2 Create Mini App deployment guide


    - Document deployment process for Mini Apps
    - Include Farcaster submission process
    - Add testing checklist for Mini App features
    - Document Base network specifics
    - _Requirements: 8.1, 8.2_

- [x] 16. Final testing and validation

  - [x] 16.1 Test in Farcaster development environment

    - Load app in Farcaster client simulator
    - Test all Mini App features
    - Verify wallet integration works
    - Test share functionality
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 16.2 Test Base network integration

    - Verify backend connects to Base
    - Confirm transactions are detected
    - Check BaseScan links work
    - Validate all monitoring features
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 16.3 Test on mobile devices

    - Test on iOS Safari
    - Test on Android Chrome
    - Verify touch interactions
    - Check responsive layout
    - _Requirements: 7.1, 7.2, 7.5_

  - [ ]* 16.4 Write property test for functionality preservation
    - **Property 2: Functionality Preservation Across Contexts**
    - **Validates: Requirements 1.4**

- [x] 17. Final Checkpoint - Ensure all tests pass


  - Ensure all tests pass, ask the user if questions arise.
