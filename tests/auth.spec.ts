import { test, expect } from '@playwright/test';

test.describe('Admin Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should show login form', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Admin Login');
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[type="text"]', 'wronguser');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.click('button[type="submit"]');

    await expect(page.locator('div.text-red-400')).toBeVisible();
    await expect(page.locator('div.text-red-400')).toContainText('Invalid credentials');
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // These should match the seed data
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Should redirect to admin dashboard
    await expect(page).toHaveURL(/\/admin/, { timeout: 15000 });
    await expect(page.locator('h1')).toContainText('SecureNet OS');
  });
});

test.describe('Hotspot Portal', () => {
  test('should load hotspot page and show packages', async ({ page }) => {
    await page.goto('/hotspot?mac=00:11:22:33:44:55&ip=192.168.88.10');
    
    await expect(page.locator('h1')).toContainText('SecureNet Hotspot');
    // Initially shows packages, check for a package price
    await expect(page.locator('text=TZS').first()).toBeVisible();

    // Switch to voucher input
    await page.click('text=Have a voucher code?');
    await expect(page.locator('button:has-text("Connect")')).toBeVisible();
  });

  test('should show error if phone number is missing when buying package', async ({ page }) => {
    await page.goto('/hotspot?mac=00:11:22:33:44:55&ip=192.168.88.10');
    
    // Find first package button and click
    const packageButton = page.locator('button:has-text("TZS")').first();
    await packageButton.click();

    await expect(page.locator('text=Please enter your phone number first')).toBeVisible();
  });
});
