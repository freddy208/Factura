# Guide pour éviter les erreurs d'hydration dans Next.js

## Qu'est-ce que l'hydration mismatch ?

L'hydration mismatch se produit lorsque le HTML généré côté serveur ne correspond pas à ce que React tente de rendre côté client. Cela cause des erreurs et des performances dégradées.

## Solutions implémentées dans ce projet

### 1. Images : Utiliser Next.js Image component
❌ **Incorrect :**
```tsx
<img src="/icon-192.png" alt="Logo" className="w-6 h-6" />
```

✅ **Correct :**
```tsx
import Image from 'next/image'
<Image 
  src="/icon-192.png" 
  alt="Logo" 
  width={24} 
  height={24} 
  className="w-6 h-6" 
  priority 
/>
```

### 2. Accès à window et localStorage : Utiliser les hooks utilitaires
❌ **Incorrect :**
```tsx
const [isOnline, setIsOnline] = useState(navigator.onLine)
localStorage.setItem('key', 'value')
window.location.href = '/login'
```

✅ **Correct :**
```tsx
import { useOnlineStatus, useLocalStorage, useSafeRouter } from '@/hooks/useIsClient'

const isOnline = useOnlineStatus()
const [value, setValue] = useLocalStorage('key', 'defaultValue')
const router = useSafeRouter()

// Pour les redirections après logout
router.redirect('/login')
```

### 3. Rendu conditionnel côté client
❌ **Incorrect :**
```tsx
if (typeof window !== 'undefined') {
  // Code qui ne s'exécute que côté client
}
```

✅ **Correct :**
```tsx
import { useIsClient } from '@/hooks/useIsClient'

const isClient = useIsClient()
if (isClient) {
  // Code qui ne s'exécute que côté client
}
```

## Hooks utilitaires disponibles

### useIsClient()
Retourne `true` uniquement côté client, jamais côté serveur.

### useLocalStorage(key, initialValue)
Gère localStorage avec hydration safety.

### useOnlineStatus()
Gère l'état de connexion avec hydration safety.

### useSafeRouter()
Gère les redirections avec hydration safety.

## Bonnes pratiques

1. **Toujours utiliser Next.js Image** pour les images
2. **Utiliser les hooks utilitaires** pour tout accès aux APIs browser
3. **Éviter les valeurs aléatoires** (Date.now(), Math.random()) dans le rendu initial
4. **Utiliser useEffect** pour les effets qui nécessitent le browser
5. **Tester en mode production** pour détecter les erreurs d'hydration

## Fichiers corrigés

- ✅ `src/components/dashboard/Sidebar.tsx`
- ✅ `src/components/dashboard/TopBar.tsx`
- ✅ `src/components/dashboard/ConnectionStatus.tsx`
- ✅ `src/components/invoices/InvoiceActions.tsx`
- ✅ `src/components/invoices/InvoiceForm.tsx`
- ✅ `src/components/clients/DeleteClientButton.tsx`
- ✅ `src/app/(auth)/login/page.tsx`
- ✅ `src/app/(auth)/register/page.tsx`
- ✅ `src/app/(dashboard)/dashboard/page.tsx`
- ✅ `src/app/page.tsx`

## Résultat

Avec ces corrections, vous ne devriez plus voir d'erreurs d'hydration dans votre application Next.js.
