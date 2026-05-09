import type { Page } from '@playwright/test'

/**
 * Connexion + onboarding minimal si le compte n’a pas encore terminé l’onboarding.
 */
export async function loginAndReachDashboard(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.goto('/login')
  await page.getByPlaceholder('vous@entreprise.com').fill(email)
  await page.getByPlaceholder('••••••••').fill(password)
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 45_000 })

  if (page.url().includes('/onboarding')) {
    await page.getByRole('button', { name: 'Freelance' }).click()
    await page.getByRole('button', { name: 'Continuer' }).click()
    await page.getByRole('button', { name: /Acceder au dashboard/i }).click()
    await page.waitForURL('**/dashboard', { timeout: 45_000 })
  }
}
