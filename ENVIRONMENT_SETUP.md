# Frontend Environment Setup

## Required Environment Variables

Create a `.env.local` file in the frontend root directory with the following variables:

```env
# GraphQL HTTP endpoint for queries and mutations
NEXT_PUBLIC_GRAPHQL_HTTP_URL=https://clear-ai-v2-production.up.railway.app/graphql

# GraphQL WebSocket endpoint for subscriptions
NEXT_PUBLIC_GRAPHQL_WS_URL=wss://clear-ai-v2-production.up.railway.app/graphql

# Optional: GraphQL request timeout in milliseconds
NEXT_PUBLIC_GRAPHQL_TIMEOUT=30000

# Optional: Enable GraphQL debugging
NEXT_PUBLIC_GRAPHQL_DEBUG=true
```

## Setup Instructions

1. **Create Environment File**:
   ```bash
   cd /Users/yab/Projects/clear-ai-frontend
   cp ENVIRONMENT_SETUP.md .env.local
   # Then edit .env.local with the content above
   ```

2. **Install Dependencies** (if not already done):
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Verify Connection**:
   - Open http://localhost:3000
   - Check browser console for GraphQL connection errors
   - Test basic functionality

## Troubleshooting

### Common Issues

1. **CORS Errors**: 
   - ✅ Fixed - Backend is configured with Vercel frontend URL

2. **GraphQL Type Errors**:
   - ✅ Fixed - Updated GET_EXECUTION query type from String! to ID!

3. **Connection Timeout**:
   - Increase NEXT_PUBLIC_GRAPHQL_TIMEOUT value
   - Check Railway backend status

4. **WebSocket Connection Issues**:
   - Verify Railway supports WebSocket connections
   - Check if WSS is properly configured

### Testing the Connection

Run these commands to test the GraphQL connection:

```bash
# Test HTTP endpoint
curl -X POST https://clear-ai-v2-production.up.railway.app/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { getMetrics { totalRequests successfulRequests } }"}'

# Test health endpoint
curl https://clear-ai-v2-production.up.railway.app/health
```

## Development vs Production

### Development
- Use `http://localhost:4001/graphql` for HTTP
- Use `ws://localhost:4001/graphql` for WebSocket

### Production
- Use `https://clear-ai-v2-production.up.railway.app/graphql` for HTTP
- Use `wss://clear-ai-v2-production.up.railway.app/graphql` for WebSocket
