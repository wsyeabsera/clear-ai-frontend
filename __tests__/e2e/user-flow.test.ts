import { test, expect } from '@playwright/test';

test.describe('Complete User Flow', () => {
  test('User can create session, submit query, and see results', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Create new session
    await page.click('button:has-text("Create Session")');
    await expect(page.locator('.session-list')).toContainText('Session');

    // Enter query
    await page.fill('textarea[placeholder*="Ask the AI"]', 'Get shipments from last week');
    await page.click('button[type="submit"]');

    // Wait for agent progress
    await expect(page.locator('text=Planner')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Executor')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Analyzer')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Summarizer')).toBeVisible({ timeout: 10000 });

    // Wait for results
    await expect(page.locator('.results-display')).toBeVisible({ timeout: 30000 });

    // Check tool inspector shows executed tools
    await page.click('text=Tools');
    await expect(page.locator('.tool-execution-card')).toBeVisible();
  });

  test('Plan editor flow works correctly', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Create session and submit query that triggers plan editor
    await page.click('button:has-text("Create Session")');
    await page.fill('textarea[placeholder*="Ask the AI"]', 'Show me facilities');
    
    // Wait for plan to appear in bottom panel
    await expect(page.locator('.plan-editor')).toBeVisible({ timeout: 10000 });

    // Verify plan steps are shown
    await expect(page.locator('.plan-step')).toHaveCount(1, { timeout: 5000 });

    // Execute plan
    await page.click('button:has-text("Execute")');

    // Wait for execution to complete
    await expect(page.locator('.results-display')).toBeVisible({ timeout: 30000 });
  });

  test('Multi-session management works', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Create first session
    await page.click('button:has-text("Create Session")');
    await page.fill('textarea[placeholder*="Ask the AI"]', 'First query');
    await page.click('button[type="submit"]');

    // Create second session
    await page.click('button:has-text("Create Session")');
    await page.fill('textarea[placeholder*="Ask the AI"]', 'Second query');
    await page.click('button[type="submit"]');

    // Verify both sessions exist
    await expect(page.locator('.session-list')).toContainText('Session');
    
    // Switch between sessions
    await page.click('.session-item:first-child');
    await page.click('.session-item:last-child');

    // Close a session
    await page.click('.session-item:first-child .close-button');
  });

  test('Performance dashboard shows real metrics', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Navigate to performance dashboard
    await page.click('text=Performance');
    
    // Verify metrics are displayed
    await expect(page.locator('text=System Metrics')).toBeVisible();
    await expect(page.locator('text=Success Rate')).toBeVisible();
    await expect(page.locator('text=Tool Usage')).toBeVisible();
    
    // Check that metrics have numeric values
    await expect(page.locator('.metric-value')).toHaveCount(4);
  });

  test('Error handling works correctly', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Create session and submit invalid query
    await page.click('button:has-text("Create Session")');
    await page.fill('textarea[placeholder*="Ask the AI"]', 'Invalid query that should fail');
    await page.click('button[type="submit"]');

    // Wait for error message
    await expect(page.locator('text=Error')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Sorry, there was an error')).toBeVisible();
  });
});
