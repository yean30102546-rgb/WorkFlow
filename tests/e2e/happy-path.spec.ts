import { test, expect } from '@playwright/test';

test.describe('Forklift-JIT Happy Path Flow', () => {
  test('should create, accept, and complete a job request', async ({ page }) => {
    // 1. Open the page as an operator using query parameters for mock login
    const uid = `operator-test-${Date.now()}`;
    const name = 'Test Operator';
    await page.goto(`/?uid=${uid}&name=${encodeURIComponent(name)}&role=operator`);

    // Verify operator portal loading
    await expect(page.locator('text=Call Forklift Pickup').first()).toBeVisible();
    await expect(page.locator(`text=Operator: ${name}`)).toBeVisible();

    // 2. Fill out the request form
    const batchNumber = `B-${Math.floor(Math.random() * 9000) + 1000}`;
    const itemNumber = `ITM-${Math.floor(Math.random() * 900) + 100}`;
    const itemName = `Steel Plates ${Math.floor(Math.random() * 50) + 10}mm`;
    const storagePosition = `Row ${String.fromCharCode(65 + Math.floor(Math.random() * 6))}, Shelf ${Math.floor(Math.random() * 5) + 1}`;

    await page.fill('input[placeholder="e.g. B-1092"]', batchNumber);
    await page.fill('input[placeholder="e.g. ITM-889"]', itemNumber);
    await page.fill('input[placeholder="e.g. Steel Coil 5T"]', itemName);
    await page.fill('input[placeholder="e.g. Row C, Staging A"]', storagePosition);

    // Submit request
    await page.click('button:has-text("Call Forklift Pickup")');

    // Verify success message appears
    await expect(page.locator('text=Job registered successfully!')).toBeVisible();

    // Verify job appears in "Your Active Requests"
    const activeRequests = page.locator('div:has-text("Your Active Requests")');
    await expect(activeRequests.locator(`text=${itemName}`)).toBeVisible();
    await expect(activeRequests.locator(`text=${batchNumber}`)).toBeVisible();
    await expect(activeRequests.locator(`text=PENDING`)).toBeVisible();

    // 3. Switch role to Driver
    await page.click('button:has-text("Forklift Driver")');

    // Verify we are in the driver view (statistics are visible)
    await expect(page.locator('text=Available Pickups')).toBeVisible();

    // Locate the job in "Available Jobs Queue"
    const jobCard = page.locator(`div:has-text("${itemName}")`).filter({ hasText: batchNumber }).first();
    await expect(jobCard).toBeVisible();
    await expect(jobCard.locator('text=Waiting Driver')).toBeVisible();

    // 4. Accept the pickup
    const acceptButton = jobCard.locator('button:has-text("Accept Pickup")');
    await acceptButton.click();

    // Verify job status changes to "In Progress" or "Claimed"
    await expect(jobCard.locator('text=In Progress')).toBeVisible();
    await expect(jobCard.locator('button:has-text("Finish Delivery")')).toBeVisible();

    // 5. Complete the delivery
    const completeButton = jobCard.locator('button:has-text("Finish Delivery")');
    await completeButton.click();

    // Verify job card disappears from active tasks
    await expect(jobCard).toBeHidden();

    // 6. Switch back to Operator Portal to verify history
    await page.click('button:has-text("Operator Portal")');

    // Verify operator portal is active
    await expect(page.locator('text=Call Forklift Pickup').first()).toBeVisible();

    // Verify job appears in "Completed Pickups" history panel
    const completedPickups = page.locator('div:has-text("Completed Pickups")');
    await expect(completedPickups.locator(`text=${itemName}`)).toBeVisible();
    await expect(completedPickups.locator('text=COMPLETED').first()).toBeVisible();
  });
});
