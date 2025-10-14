# Deployment Guide

This guide covers deploying the Clear AI v2 frontend to production.

## Prerequisites

- Vercel account (recommended) or any Node.js hosting platform
- GraphQL server deployed and accessible
- Environment variables configured

## Vercel Deployment

### 1. Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Select the frontend directory as root

### 2. Configure Environment Variables

In Vercel dashboard, go to Settings > Environment Variables:

```
NEXT_PUBLIC_GRAPHQL_HTTP_URL=https://your-graphql-server.com/graphql
NEXT_PUBLIC_GRAPHQL_WS_URL=wss://your-graphql-server.com/graphql
NODE_ENV=production
```

### 3. Build Configuration

Vercel will auto-detect Next.js. Ensure your `next.config.js` includes:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@apollo/client'],
  },
}

module.exports = nextConfig
```

### 4. Deploy

1. Push to your main branch
2. Vercel will automatically deploy
3. Check deployment logs for any issues

## Alternative Deployment Options

### Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t clear-ai-frontend .
docker run -p 3000:3000 clear-ai-frontend
```

### Netlify

1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Configure environment variables

## Production Checklist

### Before Deployment

- [ ] All tests passing (`npm run test:all`)
- [ ] Environment variables configured
- [ ] GraphQL server accessible from production
- [ ] WebSocket connections working
- [ ] SSL certificates configured
- [ ] Performance optimized (lighthouse score > 90)

### After Deployment

- [ ] Test all major user flows
- [ ] Verify real-time features work
- [ ] Check error handling
- [ ] Monitor performance metrics
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure CDN for static assets

## Environment Configuration

### Development
```
NEXT_PUBLIC_GRAPHQL_HTTP_URL=http://localhost:3001/graphql
NEXT_PUBLIC_GRAPHQL_WS_URL=ws://localhost:3001/graphql
NODE_ENV=development
```

### Production
```
NEXT_PUBLIC_GRAPHQL_HTTP_URL=https://api.yourapp.com/graphql
NEXT_PUBLIC_GRAPHQL_WS_URL=wss://api.yourapp.com/graphql
NODE_ENV=production
```

## Monitoring

### Key Metrics to Monitor

- Page load times
- GraphQL query performance
- WebSocket connection stability
- Error rates
- User engagement

### Recommended Tools

- **Analytics**: Vercel Analytics, Google Analytics
- **Error Tracking**: Sentry
- **Performance**: Lighthouse CI, WebPageTest
- **Uptime**: UptimeRobot, Pingdom

## Troubleshooting

### Common Production Issues

1. **WebSocket Connection Failed**
   - Check SSL certificates
   - Verify WebSocket URL uses `wss://`
   - Check firewall/proxy settings

2. **GraphQL Queries Failing**
   - Verify CORS configuration
   - Check API endpoint accessibility
   - Review network connectivity

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies installed
   - Review build logs for specific errors

### Performance Optimization

1. **Enable Compression**
   ```javascript
   // next.config.js
   module.exports = {
     compress: true,
   }
   ```

2. **Optimize Images**
   ```javascript
   // next.config.js
   module.exports = {
     images: {
       domains: ['your-cdn.com'],
     },
   }
   ```

3. **Bundle Analysis**
   ```bash
   npm install -D @next/bundle-analyzer
   npm run analyze
   ```

## Security Considerations

- Use HTTPS in production
- Implement CSP headers
- Sanitize user inputs
- Rate limit API calls
- Secure environment variables
- Regular dependency updates
