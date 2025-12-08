This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Testing

### Unit and Property Tests

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate coverage report:

```bash
npm run test:coverage
```

### Integration Testing

Run the integration testing guide:

```bash
npm run test:integration
```

This provides a comprehensive checklist for manual integration testing including:
- Visual effects verification
- Audio testing across browsers
- Error handling scenarios
- Responsive design testing
- Performance testing

### Performance Monitoring

Open `performance-monitor.html` in your browser to monitor real-time performance metrics:
- FPS (Frames Per Second)
- Memory usage
- DOM node count
- Page load time
- First Contentful Paint
- Time to Interactive

### Testing Documentation

- **[TESTING-CHECKLIST.md](./TESTING-CHECKLIST.md)** - Comprehensive testing checklist (200+ items)
- **[POLISH-IMPROVEMENTS.md](./POLISH-IMPROVEMENTS.md)** - Polish improvements and testing infrastructure
- **[test-integration.js](./test-integration.js)** - Interactive testing guide script
- **[performance-monitor.html](./performance-monitor.html)** - Real-time performance monitoring tool

## Deploy on Vercel

The MEV Exorcist frontend is configured for deployment on Vercel.

### Quick Deploy

1. Push your code to GitHub
2. Import repository in Vercel Dashboard
3. Configure environment variables (see `.env.production.example`)
4. Deploy

### Detailed Instructions

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment instructions including:
- Environment variable configuration
- Build settings
- Security headers and CSP
- Browser and device testing
- Troubleshooting guide

### Deployment Checklist

Use [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md) for a quick reference checklist to ensure all deployment steps are completed.

### Required Environment Variables

```bash
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_ETHERSCAN_BASE=https://sepolia.etherscan.io
```

See `.env.production.example` for production configuration template.
