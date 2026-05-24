import { test, expect } from '@playwright/test';

test.describe('Forklift-JIT Happy Path Flow', () => {
  test('should create, accept, and complete a job request', async ({ page }) => {
    // 1. Open the page as an operator using query parameters for mock login
    const uid = `operator-test-${Date.now()}`;
    const name = 'Test Operator';
    await page.goto(`/?uid=${uid}&name=${encodeURIComponent(name)}&role=operator`);

    // Verify operator portal loading
    await expect(page.locator('text=เรียกฟอร์คลิฟต์').first()).toBeVisible();
    await expect(page.locator(`text=${name}`).first()).toBeVisible();

    // 2. Fill out the request form
    const batchNumber = `B-${Math.floor(Math.random() * 9000) + 1000}`;
    const itemNumber = `ITM-${Math.floor(Math.random() * 900) + 100}`;
    const itemName = `Steel Plates ${Math.floor(Math.random() * 50) + 10}mm`;
    const storagePosition = `Row ${String.fromCharCode(65 + Math.floor(Math.random() * 6))}, Shelf ${Math.floor(Math.random() * 5) + 1}`;

    await page.fill('input[placeholder="เช่น B-1092"]', batchNumber);
    await page.fill('input[placeholder="เช่น ITM-889"]', itemNumber);
    await page.fill('input[placeholder="เช่น Steel Coil 5T"]', itemName);
    await page.fill('input[placeholder="เช่น Row C, Staging A"]', storagePosition);

    // Submit request
    await page.click('button:has-text("เรียกรถฟอร์คลิฟต์")');

    // Verify success message appears
    await expect(page.locator('text=สร้างคำขอเรียกรถฟอร์คลิฟต์สำเร็จ!')).toBeVisible();

    // Verify job appears in "รายการเรียกฟอร์คลิฟต์ที่กำลังดำเนินการ"
    const activeRequests = page.locator('div:has-text("รายการเรียกฟอร์คลิฟต์ที่กำลังดำเนินการ")');
    await expect(activeRequests.locator(`text=${itemName}`).first()).toBeVisible();
    await expect(activeRequests.locator(`text=${batchNumber}`).first()).toBeVisible();
    await expect(activeRequests.locator(`text=รอคนขับ`).first()).toBeVisible();

    // Switch role to Driver (Use existing DRIVER user 'op-101' to satisfy RBAC)
    const driverUid = 'op-101';
    const driverName = 'Operator Somchai';
    // We navigate with role=driver and uid starting with drv- so we can accept jobs
    // Wait, to bypass RBAC, the user in the database must be DRIVER.
    // The easiest way is to log in as a driver directly.
    await page.goto(`/?uid=${driverUid}&name=${encodeURIComponent(driverName)}&role=driver`);

    // Verify we are in the driver view (stats card should show or loading stats)
    await expect(page.locator('text=สถิติการทำงานของคุณ').first()).toBeVisible();

    // Locate the job in available queue
    const jobCard = page.locator('.bg-card').filter({ hasText: batchNumber }).first();
    await expect(jobCard).toBeVisible();
    await expect(jobCard.locator('text=รอคนขับ').first()).toBeVisible();

    // 4. Accept the pickup (since we are drv-test, if db role is OPERATOR we will get unauthorized)
    // Wait, we need to promote this driver.
    // In our system, new users synced default to OPERATOR.
    // To simulate promotion, we can hit our mockup API or just use the Admin Dashboard,
    // or we can test with a pre-seeded driver ID like 'drv-505' which is already a DRIVER?
    // Wait, let's look at the database seed or our mock setup.
    // Our Mock DB in jobs.ts doesn't enforce role check for mock users if useMock is true!
    // But wait! Is useMock true? Let's check. Yes, if there is no DATABASE_URL, or in development it might be true.
    // Let's use the pre-seeded driver id 'drv-505' to accept, or just use useMock.
    // Let's use driverId = 'drv-505' (it is already pre-configured as DRIVER in some systems, or we can use mock mode).
    // Let's see what happens.
    
    const acceptButton = jobCard.locator('button:has-text("รับงาน")');
    await acceptButton.click();

    // Verify job status changes to "กำลังดำเนินการ"
    await expect(jobCard.locator('text=กำลังดำเนินการ').first()).toBeVisible();
    await expect(jobCard.locator('button:has-text("ส่งสินค้าสำเร็จ")').first()).toBeVisible();

    // 5. Complete the delivery
    const completeButton = jobCard.locator('button:has-text("ส่งสินค้าสำเร็จ")');
    await completeButton.click();

    // Verify job status changes to "ส่งสำเร็จ" and shows completed message
    await expect(jobCard.locator('text=ส่งสำเร็จ').first()).toBeVisible();
    await expect(jobCard.locator('text=จัดส่งเรียบร้อย').first()).toBeVisible();
  });
});
