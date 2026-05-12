import { test, expect } from '@playwright/test'

test.describe('Parcours utilisateur connecté', () => {
  test('navigation principale du dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible()

    await page.getByRole('link', { name: 'Clients' }).first().click()
    await expect(page.getByRole('heading', { name: /Vos clients/i })).toBeVisible()

    await page.getByRole('link', { name: 'Devis' }).first().click()
    await expect(page.getByRole('heading', { name: 'Devis', exact: true })).toBeVisible()

    await page.getByRole('link', { name: 'Factures' }).first().click()
    await expect(page.getByRole('heading', { name: 'Factures', exact: true })).toBeVisible()

    await page.goto('/profil')
    await expect(page.getByRole('heading', { name: 'Mon Profil' })).toBeVisible()

    await page.goto('/settings')
    await expect(page.getByRole('heading', { name: 'Paramètres' })).toBeVisible()

    await page.goto('/notifications')
    await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible()

    await page.goto('/upgrade')
    await expect(page.getByRole('heading', { name: /Débloquez tout FACTURA/i })).toBeVisible()
    await expect(
      page.getByRole('button', { name: /Enregistrer ma demande Pro/i })
    ).toBeVisible()
  })

  test('créer un client puis une facture (brouillon)', async ({ page }) => {
    const suffix = Date.now()
    const clientName = `Client E2E ${suffix}`

    await page.goto('/clients/nouveau')
    await expect(page.getByRole('heading', { name: /Nouveau client/i })).toBeVisible()

    await page.getByPlaceholder('Jean Dupont').fill(clientName)
    await page.getByRole('button', { name: 'Enregistrer' }).click()
    await expect(page).toHaveURL(/\/clients$/)

    await page.goto('/factures/nouvelle')
    await expect(page.getByRole('heading', { name: /Nouvelle facture/i })).toBeVisible()

    await page.getByPlaceholder('Description de la prestation').fill(`Prestation E2E ${suffix}`)
    await page.locator('input[type="number"]').nth(1).fill('10000')

    await page.getByRole('button', { name: /Créer la facture/i }).click()

    await page.waitForURL(/\/factures\/[a-f0-9-]+$/i, { timeout: 45_000 })
    await expect(page.getByRole('button', { name: /Télécharger PDF/i })).toBeVisible()
  })

  test('créer un devis (brouillon)', async ({ page }) => {
    const suffix = Date.now()
    await page.goto('/devis/nouveau')
    await expect(page.getByRole('heading', { name: /Nouveau devis/i })).toBeVisible()

    await page.getByPlaceholder('Description de la prestation').fill(`Devis E2E ${suffix}`)
    await page.locator('input[type="number"]').nth(1).fill('5000')

    await page.getByRole('button', { name: /Créer le devis/i }).click()
    await page.waitForURL(/\/devis\/[a-f0-9-]+$/i, { timeout: 45_000 })
  })
})
