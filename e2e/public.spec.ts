import { test, expect } from '@playwright/test'

test.describe('Pages publiques', () => {
  test('landing affiche le hero', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Créez des devis et').first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'Connexion' }).first()).toBeVisible()
  })

  test('/login est accessible', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /Bon retour/i })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Se connecter' })).toBeVisible()
  })

  test('/register est accessible', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByRole('heading', { name: /Créer votre compte/i })).toBeVisible()
  })

  test('/offline affiche le mode hors ligne', async ({ page }) => {
    await page.goto('/offline')
    await expect(page.getByRole('heading', { name: /hors ligne/i })).toBeVisible()
  })

  test('dashboard redirige vers login sans session', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('/admin redirige sans droits', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).not.toHaveURL(/\/admin/)
  })
})
