# Configuration Google OAuth pour Factura

## Étapes de configuration dans Supabase

### 1. Créer un projet Google Cloud Console
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API Google+ (si ce n'est pas déjà fait)

### 2. Configurer OAuth 2.0
1. Dans le menu, allez à "APIs & Services" > "Credentials"
2. Cliquez sur "Create Credentials" > "OAuth client ID"
3. Sélectionnez "Web application"
4. Ajoutez les URI de redirection autorisés :
   - `http://localhost:3000/auth/callback` (développement)
   - `https://votre-domaine.com/auth/callback` (production)
5. Copiez le **Client ID** et le **Client Secret**

### 3. Configurer Supabase
1. Allez dans votre dashboard Supabase
2. Navigation : `Authentication` > `Providers` > `Google`
3. Activez le provider Google
4. Entrez le **Client ID** et **Client Secret** de Google
5. Ajoutez l'URL de redirection : `https://votre-projet.supabase.co/auth/v1/callback`
6. Sauvegardez la configuration

### 4. Variables d'environnement
Assurez-vous que vos variables d'environnement sont correctement configurées dans `.env.local` :
```
NEXT_PUBLIC_SUPABASE_URL=votre-url-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon
```

## Fonctionnalités implémentées

✅ **Bouton de connexion Google** sur la page de login
✅ **Bouton d'inscription Google** sur la page d'inscription  
✅ **Gestion du callback OAuth** avec redirection automatique
✅ **Redirection intelligente** vers dashboard ou onboarding
✅ **Design cohérent** avec le reste de l'application

## Flux utilisateur

1. L'utilisateur clique sur "Continuer avec Google"
2. Redirection vers la page d'authentification Google
3. Après autorisation, redirection vers `/auth/callback`
4. Le système crée/met à jour le profil utilisateur
5. Redirection finale vers `/dashboard` ou `/onboarding`

## Avantages pour les techniciens/plombiers

- **Pas de mot de passe à mémoriser**
- **Connexion en un clic**
- **Session persistante** (reste connecté)
- **Sécurité renforcée** avec l'authentification Google
- **Compatible mobile** pour les interventions sur chantier

## Test

Pour tester l'implémentation :
1. Démarrez le serveur de développement : `npm run dev`
2. Allez sur `http://localhost:3000/login`
3. Cliquez sur "Continuer avec Google"
4. Authentifiez-vous avec votre compte Google
5. Vérifiez la redirection vers le dashboard
