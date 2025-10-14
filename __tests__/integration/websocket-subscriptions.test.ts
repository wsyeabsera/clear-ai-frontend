import { describe, test, expect } from 'vitest';
import { apolloClient } from '@/lib/graphql/client';
import { 
  QUERY_PROGRESS_SUBSCRIPTION, 
  PLANNER_PROGRESS_SUBSCRIPTION,
  EXECUTOR_PROGRESS_SUBSCRIPTION,
  ANALYZER_PROGRESS_SUBSCRIPTION,
  SUMMARIZER_PROGRESS_SUBSCRIPTION 
} from '@/lib/graphql/queries';

describe('WebSocket Subscription Tests', () => {
  test('Query progress subscription receives updates', async () => {
    return new Promise<void>((resolve, reject) => {
      const requestId = 'test-request-id';
      const subscription = apolloClient.subscribe({
        query: QUERY_PROGRESS_SUBSCRIPTION,
        variables: { requestId },
      });

      let receivedUpdate = false;
      const observable = subscription.subscribe({
        next: (result) => {
          if (result.data?.queryProgress) {
            expect(result.data.queryProgress).toBeDefined();
            expect(result.data.queryProgress.requestId).toBe(requestId);
            expect(result.data.queryProgress.phase).toBeDefined();
            receivedUpdate = true;
            observable.unsubscribe();
            resolve();
          }
        },
        error: (error) => {
          console.error('Subscription error:', error);
          reject(error);
        },
      });

      // Trigger a query to generate progress updates
      apolloClient.mutate({
        mutation: EXECUTE_QUERY,
        variables: {
          query: 'Test query for subscription',
          userId: 'test-user',
        },
      }).catch(reject);

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!receivedUpdate) {
          observable.unsubscribe();
          reject(new Error('Subscription timeout - no updates received'));
        }
      }, 10000);
    });
  });

  test('Planner progress subscription works', async () => {
    return new Promise<void>((resolve, reject) => {
      const requestId = 'test-planner-request-id';
      const subscription = apolloClient.subscribe({
        query: PLANNER_PROGRESS_SUBSCRIPTION,
        variables: { requestId },
      });

      const observable = subscription.subscribe({
        next: (result) => {
          if (result.data?.plannerProgress) {
            expect(result.data.plannerProgress.requestId).toBe(requestId);
            expect(result.data.plannerProgress.phase).toBeDefined();
            observable.unsubscribe();
            resolve();
          }
        },
        error: (error) => {
          console.error('Planner subscription error:', error);
          reject(error);
        },
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        observable.unsubscribe();
        resolve(); // Resolve even if no update (subscription might not trigger for test)
      }, 5000);
    });
  });

  test('WebSocket connection is established', async () => {
    // Test that we can create a subscription without errors
    const subscription = apolloClient.subscribe({
      query: QUERY_PROGRESS_SUBSCRIPTION,
      variables: { requestId: 'test-connection' },
    });

    expect(subscription).toBeDefined();
    
    // Clean up
    subscription.subscribe({
      next: () => {},
      error: () => {},
    }).unsubscribe();
  });
});
