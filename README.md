# Clear AI v2 - Cursor-Inspired Frontend

A sophisticated multi-agent AI interface showcasing real-time agent progress, tool execution visualization, and plan editing capabilities.

## Prerequisites

- GraphQL Server running at `http://localhost:3001/graphql`
- Wasteer API running at `http://localhost:3001/api`
- Node.js 18+ installed

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your GraphQL endpoint
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Testing

```bash
# Unit & integration tests
npm test

# Integration tests only
npm run test:integration

# E2E tests (requires dev server running)
npm run test:e2e

# All tests
npm run test:all
```

## Features

- **Multi-Panel Layout**: Sessions, Query, Tool Inspector, Plan Editor
- **Real-Time Agent Progress**: Visual cards showing all 4 agents working
- **Tool Execution Inspector**: Step-by-step tool execution with results
- **Plan Preview & Editing**: Review and modify AI plans before execution
- **Multi-Session Management**: Tab-based session handling with persistence
- **Performance Dashboard**: Real-time metrics and analytics

## Architecture

- **Framework**: Next.js 14 (App Router)
- **State Management**: Zustand
- **GraphQL Client**: Apollo Client + WebSocket subscriptions
- **UI Components**: shadcn/ui + TailwindCSS
- **Real-Time Updates**: GraphQL subscriptions for all agent progress

## Development

### Key Components

- `CenterPanel`: Main chat interface with real-time agent progress
- `BottomPanel`: Plan editor with execute/regenerate actions
- `RightPanel`: Tool inspector and performance dashboard
- `LeftPanel`: Session management and history

### Hooks

- `useAgentSubscriptions`: Real-time agent progress via WebSocket
- `usePlanFlow`: Plan generation and execution flow
- `useSessionStore`: Multi-session state management

### Testing

- **Integration Tests**: GraphQL connectivity, WebSocket subscriptions
- **E2E Tests**: Complete user flows with Playwright
- **API Tests**: Wasteer API connectivity and tool execution

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions.

## Troubleshooting

### Common Issues

1. **GraphQL Connection Failed**
   - Ensure GraphQL server is running on port 3001
   - Check `.env.local` has correct endpoints

2. **WebSocket Connection Issues**
   - Verify WebSocket URL is correct
   - Check firewall settings

3. **Tests Failing**
   - Ensure all services are running
   - Run `npm run test:integration` first to verify API connectivity# clear-ai-frontend
