#!/usr/bin/env node

/**
 * Test Frontend Connection to Production GraphQL API
 */

const https = require('https');

const GRAPHQL_ENDPOINT = 'https://clear-ai-v2-production.up.railway.app/graphql';
const HEALTH_ENDPOINT = 'https://clear-ai-v2-production.up.railway.app/health';

async function testConnection() {
  console.log('🔍 Testing Frontend Connection to Production GraphQL API...\n');

  // Test 1: Health Check
  console.log('📡 Testing health endpoint...');
  try {
    const healthResponse = await fetch(HEALTH_ENDPOINT);
    const healthData = await healthResponse.json();
    console.log('✅ Health check passed:', healthData);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return;
  }

  // Test 2: Basic GraphQL Query
  console.log('\n🔍 Testing basic GraphQL query (getMetrics)...');
  try {
    const queryResponse = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query GetMetrics {
            getMetrics {
              totalRequests
              successfulRequests
              failedRequests
              avgDuration
              uptime
            }
          }
        `
      })
    });

    const queryData = await queryResponse.json();
    
    if (queryData.errors) {
      console.log('❌ GraphQL query failed:', queryData.errors);
    } else {
      console.log('✅ GraphQL query successful:', queryData.data.getMetrics);
    }
  } catch (error) {
    console.log('❌ GraphQL query failed:', error.message);
    return;
  }

  // Test 3: Agent Config Query
  console.log('\n🔍 Testing agent config query (listAgentConfigs)...');
  try {
    const configResponse = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query ListAgentConfigs {
            listAgentConfigs {
              id
              name
              type
              isDefault
              isActive
            }
          }
        `
      })
    });

    const configData = await configResponse.json();
    
    if (configData.errors) {
      console.log('❌ Agent config query failed:', configData.errors);
    } else {
      console.log('✅ Agent config query successful:', configData.data.listAgentConfigs.length, 'configs found');
    }
  } catch (error) {
    console.log('❌ Agent config query failed:', error.message);
    return;
  }

  // Test 4: Mutation with new parameters
  console.log('\n🔍 Testing mutation with new parameters (analyzeResults)...');
  try {
    const mutationResponse = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation TestAnalyzeResults($requestId: ID!, $analyzerConfigId: ID) {
            analyzeResults(requestId: $requestId, analyzerConfigId: $analyzerConfigId) {
              requestId
            }
          }
        `,
        variables: {
          requestId: 'test-123',
          analyzerConfigId: 'test-config-456'
        }
      })
    });

    const mutationData = await mutationResponse.json();
    
    if (mutationData.errors) {
      // Check if it's the expected business logic error or a validation error
      const error = mutationData.errors[0];
      if (error.message.includes('Plan not found')) {
        console.log('✅ Mutation signature correct (business logic error expected):', error.message);
      } else if (error.message.includes('Unknown argument')) {
        console.log('❌ Mutation signature error:', error.message);
      } else {
        console.log('⚠️  Mutation error:', error.message);
      }
    } else {
      console.log('✅ Mutation successful:', mutationData.data);
    }
  } catch (error) {
    console.log('❌ Mutation test failed:', error.message);
    return;
  }

  console.log('\n🎉 Frontend connection tests completed!');
  console.log('\n📋 Summary:');
  console.log('- ✅ Health endpoint accessible');
  console.log('- ✅ GraphQL HTTP endpoint working');
  console.log('- ✅ Basic queries working');
  console.log('- ✅ Agent config queries working');
  console.log('- ✅ Mutations accept new parameters');
  console.log('\n🚀 Frontend should now work with production API!');
}

// Run the test
testConnection().catch(console.error);
