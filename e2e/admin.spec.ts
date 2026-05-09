import { test, expect } from '@playwright/test'
import { loginAndReachDashboard } from './helpers/login'

test.describe('Panel administrateur', () => {
  test.beforeEach(() => {
    test.skip(
      !process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD,
      'Définissez E2E_ADMIN_EMAIL et E2E_ADMIN_PASSWORD (même compte que ADMIN_EMAIL dans .env.local).'
    )
  })

  test('affiche le panel admin après connexion', async ({ page }) => {
    const adminEmail = process.env.E2E_ADMIN_EMAIL!
    const adminPassword = process.env.E2E_ADMIN_PASSWORD!

    await loginAndReachDashboard(page, adminEmail, adminPassword)
    await page.goto('/admin')

    await expect(page).toHaveURL(/\/admin/)
    await expect(page.getByRole('heading', { name: /Panel Admin/i })).toBeVisible()
    await expect(page.getByText(/Tous les utilisateurs/i)).toBeVisible()
  })

  test('lien retour dashboard depuis admin', async ({ page }) => {
    const adminEmail = process.env.E2E_ADMIN_EMAIL!
    const adminPassword = process.env.E2E_ADMIN_PASSWORD!

    await loginAndReachDashboard(page, adminEmail, adminPassword)
    await page.goto('/admin')
    await page.getByRole('link', { name: /Retour dashboard/i }).click()
    await expect(page).toHaveURL(/\/dashboard/)
  })
})
