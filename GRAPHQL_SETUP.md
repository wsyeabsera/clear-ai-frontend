# GraphQL Server Setup

This frontend application expects a GraphQL server to be running on `localhost:4000`. The GraphQL 400 errors you're seeing indicate that the backend server is not running or not accessible.

## Quick Setup

1. **Start the GraphQL Server**: Ensure your backend GraphQL server is running on port 4000
2. **Environment Variables**: You can optionally set these environment variables:
   - `NEXT_PUBLIC_GRAPHQL_HTTP_URL=http://localhost:4000`
   - `NEXT_PUBLIC_GRAPHQL_WS_URL=ws://localhost:4000`

## Error Handling

The application now includes improved error handling for GraphQL connections:
- Network errors are logged to the console with helpful messages
- Failed GraphQL queries won't crash the application
- WebSocket retries are disabled to reduce console spam

## Development

If you don't have a GraphQL backend server yet, the application will still function but you'll see connection errors in the console. The UI will gracefully handle these errors without breaking.

## Troubleshooting

- **400 Bad Request**: Usually means the GraphQL server is not running
- **Failed to fetch**: Network connectivity issue or server not accessible
- **WebSocket errors**: Real-time features may not work if WebSocket connection fails

The application is designed to work offline with graceful degradation when the backend is unavailable.
