import { describe, test, expect, beforeAll } from 'vitest';
import { apolloClient } from '@/lib/graphql/client';
import { 
  GET_METRICS, 
  EXECUTE_QUERY, 
  PLAN_QUERY, 
  EXECUTE_TOOLS 
} from '@/lib/graphql/queries';

describe('GraphQL Integration Tests', () => {
  beforeAll(() => {
    // Ensure GraphQL server is running
    expect(process.env.NEXT_PUBLIC_GRAPHQL_HTTP_URL).toBe('http://localhost:3001/graphql');
  });

  test('GET_METRICS query returns valid data', async () => {
    const { data } = await apolloClient.query({
      query: GET_METRICS,
    });

    expect(data.getMetrics).toBeDefined();
    expect(data.getMetrics.totalRequests).toBeGreaterThanOrEqual(0);
    expect(data.getMetrics.successfulRequests).toBeGreaterThanOrEqual(0);
    expect(typeof data.getMetrics.avgDuration).toBe('number');
  });

  test('EXECUTE_QUERY mutation works end-to-end', async () => {
    const { data } = await apolloClient.mutate({
      mutation: EXECUTE_QUERY,
      variables: {
        query: 'Get shipments from last week',
        userId: 'test-user',
      },
    });

    expect(data.executeQuery).toBeDefined();
    expect(data.executeQuery.requestId).toBeDefined();
    expect(data.executeQuery.message).toBeDefined();
    expect(data.executeQuery.toolsUsed).toBeInstanceOf(Array);
    expect(data.executeQuery.metadata).toBeDefined();
  });

  test('Two-step plan flow works correctly', async () => {
    // Step 1: Generate plan
    const planResult = await apolloClient.mutate({
      mutation: PLAN_QUERY,
      variables: {
        query: 'Show me facilities in Hannover',
      },
    });

    expect(planResult.data.planQuery).toBeDefined();
    expect(planResult.data.planQuery.requestId).toBeDefined();
    expect(planResult.data.planQuery.plan.steps).toBeInstanceOf(Array);
    expect(planResult.data.planQuery.plan.steps.length).toBeGreaterThan(0);

    const requestId = planResult.data.planQuery.requestId;

    // Step 2: Execute plan
    const executeResult = await apolloClient.mutate({
      mutation: EXECUTE_TOOLS,
      variables: { requestId },
    });

    expect(executeResult.data.executeTools).toBeDefined();
    expect(executeResult.data.executeTools.results).toBeInstanceOf(Array);
    expect(executeResult.data.executeTools.metadata.successfulSteps).toBeGreaterThan(0);
  });

  test('GraphQL client connection is healthy', async () => {
    // Test basic connectivity
    const { data } = await apolloClient.query({
      query: GET_METRICS,
      errorPolicy: 'all',
    });

    expect(data).toBeDefined();
  });
});
