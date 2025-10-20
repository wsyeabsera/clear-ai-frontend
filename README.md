# Clear AI v3 - Multi-Agent Frontend

A sophisticated multi-agent AI interface with real-time plan execution, comprehensive analytics, and tool exploration capabilities.

## Prerequisites

- GraphQL Server running at `http://localhost:4000/graphql`
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

### Core Workflow
- **Plan Creation**: AI generates execution plans from natural language queries
- **Plan Execution**: Real-time execution with step-by-step progress tracking
- **Analysis & Summary**: Automated analysis and summary generation
- **Complete Flow**: End-to-end automation from query to final summary

### Pages & Navigation
- **Chat Interface**: Main conversation interface with real-time agent progress
- **Plans**: View, manage, and execute AI-generated plans
- **Executions**: Monitor plan execution progress and results
- **Tools**: Explore and manually execute MCP tools
- **Analytics**: Comprehensive system statistics and performance metrics

### Advanced Features
- **Multi-Session Management**: Tab-based session handling with persistence
- **Real-Time Updates**: Live progress tracking for all operations
- **Tool Integration**: Direct MCP tool execution and exploration
- **Comprehensive Analytics**: Detailed statistics and failure pattern analysis
- **Data Persistence**: Local storage with IndexedDB caching

## Architecture

- **Framework**: Next.js 14 (App Router)
- **State Management**: Zustand with persistence
- **GraphQL Client**: Apollo Client with real-time subscriptions
- **UI Components**: shadcn/ui + TailwindCSS
- **Caching**: IndexedDB for API response caching
- **Real-Time Updates**: GraphQL subscriptions for live progress

## Development

### Key Components

- `CenterPanel`: Main chat interface with complete workflow execution
- `LeftPanel`: Session management and backend history integration
- `RightPanel`: Request details with plan/execution/analysis/summary tabs
- `Navigation`: Updated navigation for new page structure

### Pages

- `/`: Main chat interface
- `/plans`: Plans list and management
- `/plans/[requestId]`: Individual plan details
- `/executions`: Executions list and monitoring
- `/executions/[executionId]`: Individual execution details
- `/tools`: MCP tools explorer and manual execution
- `/analytics`: System analytics and statistics

### Hooks

- `usePlanFlow`: Complete workflow execution (Plan → Execute → Analyze → Summarize)
- `useSessionStore`: Multi-session state management with enhanced querying
- `useAgentSubscriptions`: Real-time agent progress via WebSocket

### Data Flow

1. **User Query** → Plan Creation
2. **Plan** → Execution with real-time progress
3. **Execution** → Analysis and evaluation
4. **Analysis** → Summary generation
5. **Complete Data** → Stored in session with full traceability

### Caching

- **IndexedDB**: API response caching with TTL
- **LocalStorage**: Session persistence
- **Real-time Updates**: Live data refresh for active operations

## Testing

- **Integration Tests**: GraphQL connectivity and API integration
- **E2E Tests**: Complete user flows with Playwright
- **Component Tests**: Individual component functionality

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions.

## Troubleshooting

### Common Issues

1. **GraphQL Connection Failed**
   - Ensure GraphQL server is running on port 4000
   - Check `.env.local` has correct endpoints

2. **Real-Time Updates Not Working**
   - Verify WebSocket URL is correct
   - Check network connectivity

3. **Tests Failing**
   - Ensure GraphQL server is running
   - Run `npm run test:integration` first to verify API connectivity

## Migration Notes

This is Clear AI v3, a complete rewrite of the frontend to work with the new backend architecture:

- **Removed**: Agent configuration management (now handled by backend)
- **Added**: Complete workflow automation (Plan → Execute → Analyze → Summarize)
- **Enhanced**: Real-time progress tracking and comprehensive analytics
- **New**: MCP tool integration and manual execution capabilities
- **Improved**: Data persistence and caching strategies
