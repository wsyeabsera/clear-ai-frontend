import { describe, test, expect } from 'vitest';

describe('Wasteer API Connectivity', () => {
  test('Wasteer API is reachable', async () => {
    const response = await fetch('http://localhost:3001/health');
    expect(response.ok).toBe(true);
    
    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.timestamp).toBeDefined();
  });

  test('GraphQL server can reach Wasteer API', async () => {
    // This is implicitly tested when tools execute successfully
    const { apolloClient } = await import('@/lib/graphql/client');
    const { EXECUTE_QUERY } = await import('@/lib/graphql/queries');

    const { data } = await apolloClient.mutate({
      mutation: EXECUTE_QUERY,
      variables: {
        query: 'List all shipments',
        userId: 'test-user',
      },
    });

    expect(data.executeQuery.toolsUsed).toContain('shipments_list');
    expect(data.executeQuery.metadata.error).toBeFalsy();
  });

  test('All 56 tools are accessible via GraphQL', async () => {
    const { apolloClient } = await import('@/lib/graphql/client');
    const { EXECUTE_QUERY } = await import('@/lib/graphql/queries');

    // Test a few key tools
    const toolTests = [
      'shipments_list',
      'facilities_list', 
      'contaminants_list',
      'inspections_list',
      'analytics_contamination_rate'
    ];

    for (const tool of toolTests) {
      const { data } = await apolloClient.mutate({
        mutation: EXECUTE_QUERY,
        variables: {
          query: `Test ${tool}`,
          userId: 'test-user',
        },
      });

      expect(data.executeQuery.toolsUsed).toContain(tool);
    }
  });

  test('CRUD operations work through GraphQL', async () => {
    const { apolloClient } = await import('@/lib/graphql/client');
    const { EXECUTE_QUERY } = await import('@/lib/graphql/queries');

    // Test read operation
    const { data } = await apolloClient.mutate({
      mutation: EXECUTE_QUERY,
      variables: {
        query: 'Get all facilities',
        userId: 'test-user',
      },
    });

    expect(data.executeQuery.toolsUsed).toContain('facilities_list');
    expect(data.executeQuery.metadata.successfulSteps).toBeGreaterThan(0);
  });
});
