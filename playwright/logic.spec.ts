import { test, expect } from '@playwright/test';

const username = process.env.E2E_TEST_USERNAME || '';
const password = process.env.E2E_TEST_PASSWORD || '';

test.use({
	viewport: { width: 1920, height: 1080 },
});

test('login and take screenshot', async ({ page }) => {
	// Go to app
	await page.goto('');

	// Wait for login form to appear
	await page.waitForSelector('#login', { state: 'visible' });

	// Take a screenshot
	await page.screenshot({ path: 'playwright/screenshots/login.png', fullPage: true });

	// Fill login form
	await page.locator('[data-testid="username"] input').fill(username);
	await page.locator('[data-testid="password"] input').fill(password);

	// Click login button
	await page.click('[data-testid="submit"]');

	// Wait for loading screen to appear
	await page.waitForSelector('#loading-screen', { state: 'visible' });

	// Wait for loading screen to disappear
	await page.waitForSelector('#loading-screen', { state: 'hidden' });

	// Wait for network idle to ensure all resources are loaded
	await page.waitForLoadState('networkidle');

	// Take a screenshot
	await page.screenshot({ path: 'playwright/screenshots/after-login.png', fullPage: true });

	// Optional assertion: check chat body is visible
	const chatBodyVisible = await page.isVisible('#chat-body');
	expect(chatBodyVisible).toBe(true);
});
