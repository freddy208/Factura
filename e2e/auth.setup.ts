import { mkdirSync } from 'fs'
import path from 'path'
import { test as setup } from '@playwright/test'
import { loginAndReachDashboard } from './helpers/login'

const authFile = path.join(process.cwd(), 'playwright', '.auth', 'user.json')

setup('authentifier utilisateur E2E', async ({ page }) => {
  const email = process.env.E2E_USER_EMAIL
  const password = process.env.E2E_USER_PASSWORD

  if (!email || !password) {
    throw new Error(
      'Définissez E2E_USER_EMAIL et E2E_USER_PASSWORD dans .env.local (voir .env.example).'
    )
  }

  mkdirSync(path.dirname(authFile), { recursive: true })
  await loginAndReachDashboard(page, email, password)
  await page.context().storageState({ path: authFile })
})
