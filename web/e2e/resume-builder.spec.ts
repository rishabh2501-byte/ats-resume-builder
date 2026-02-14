import { test, expect } from '@playwright/test';

test.describe('Resume Builder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/builder');
  });

  test('should load the builder page', async ({ page }) => {
    await expect(page.getByText('Resume Builder')).toBeVisible();
    await expect(page.getByText('Live Preview')).toBeVisible();
  });

  test('should have all section tabs', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Personal' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Experience' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Education' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Skills' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Projects' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Certs' })).toBeVisible();
  });

  test('should fill personal information', async ({ page }) => {
    await page.getByLabel('First Name').fill('John');
    await page.getByLabel('Last Name').fill('Doe');
    await page.getByLabel('Email').fill('john@example.com');
    await page.getByLabel('Phone').fill('555-1234');

    // Check preview updates
    await expect(page.locator('.bg-white').getByText('John Doe')).toBeVisible();
  });

  test('should add experience entry', async ({ page }) => {
    await page.getByRole('tab', { name: 'Experience' }).click();
    await page.getByRole('button', { name: 'Add Experience' }).click();

    await expect(page.getByText('Experience 1')).toBeVisible();
    
    await page.getByLabel('Position').first().fill('Software Engineer');
    await page.getByLabel('Company').first().fill('Tech Corp');
  });

  test('should add education entry', async ({ page }) => {
    await page.getByRole('tab', { name: 'Education' }).click();
    await page.getByRole('button', { name: 'Add Education' }).click();

    await expect(page.getByText('Education 1')).toBeVisible();
  });

  test('should add skills', async ({ page }) => {
    await page.getByRole('tab', { name: 'Skills' }).click();
    await page.getByRole('button', { name: 'Add Skill' }).click();

    await page.getByPlaceholder('e.g., JavaScript, Project Management').fill('JavaScript');
  });

  test('should toggle dark mode', async ({ page }) => {
    const themeButton = page.locator('button').filter({ has: page.locator('svg') }).first();
    await themeButton.click();
    
    // Check if dark class is applied
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);
  });
});

test.describe('ATS Analyzer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/analyzer');
  });

  test('should load the analyzer page', async ({ page }) => {
    await expect(page.getByText('ATS Resume Analyzer')).toBeVisible();
    await expect(page.getByText('Your Resume')).toBeVisible();
    await expect(page.getByText('Job Description')).toBeVisible();
  });

  test('should have analyze button disabled without input', async ({ page }) => {
    const analyzeButton = page.getByRole('button', { name: 'Analyze Resume' });
    await expect(analyzeButton).toBeDisabled();
  });

  test('should enable analyze button with input', async ({ page }) => {
    await page.getByPlaceholder('Paste your resume content here...').fill('Software Engineer with JavaScript experience');
    await page.getByPlaceholder('Paste the job description here...').fill('Looking for JavaScript developer');

    const analyzeButton = page.getByRole('button', { name: 'Analyze Resume' });
    await expect(analyzeButton).toBeEnabled();
  });
});

test.describe('Navigation', () => {
  test('should navigate to all pages', async ({ page }) => {
    await page.goto('/');
    
    // Home page
    await expect(page.getByText('Build ATS-Friendly Resumes')).toBeVisible();

    // Navigate to builder
    await page.getByRole('link', { name: 'Resume Builder' }).click();
    await expect(page).toHaveURL('/builder');

    // Navigate to analyzer
    await page.getByRole('link', { name: 'ATS Analyzer' }).click();
    await expect(page).toHaveURL('/analyzer');

    // Navigate to templates
    await page.getByRole('link', { name: 'Templates' }).click();
    await expect(page).toHaveURL('/templates');
  });
});
