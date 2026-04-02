# Variables d'environnement

## Configuration requise

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
MAIL_USER=votre-email@gmail.com
MAIL_PASS=votre-app-password-gmail
MAIL_TO=forumdesterritoires2024@gmail.com
```

## Configuration sur Vercel

1. Allez sur votre projet Vercel
2. **Settings** → **Environment Variables**
3. Ajoutez les variables :

| Variable | Description |
|----------|-------------|
| `MAIL_USER` | Votre adresse email Gmail (expéditeur) |
| `MAIL_PASS` | Mot de passe d'application Gmail (16 caractères) |
| `MAIL_TO` | Adresse email destinataire (où recevoir les emails) - Optionnel, par défaut = MAIL_USER |

## Variables optionnelles

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
```

Par défaut, ces valeurs sont déjà configurées pour Gmail dans le code.

## Comment obtenir un App Password Gmail

📖 **Guide détaillé complet** : Consultez le fichier **[GUIDE_APP_PASSWORD_GMAIL.md](./GUIDE_APP_PASSWORD_GMAIL.md)** pour des instructions étape par étape avec captures d'écran et FAQ.

### Résumé rapide :

1. Activez la **Validation en deux étapes** sur votre compte Google (https://myaccount.google.com/)
2. Allez dans **Sécurité** → **Validation en deux étapes** → **Mots de passe des applications**
3. Sélectionnez **"Autre (nom personnalisé)"** et donnez un nom (ex: "Node Mail Backend")
4. Cliquez sur **"Générer"** et **COPIEZ IMMÉDIATEMENT** le mot de passe de 16 caractères
5. Utilisez ce mot de passe comme valeur de `MAIL_PASS`

⚠️ **Important** : 
- N'utilisez **JAMAIS** votre mot de passe Gmail normal
- Le mot de passe d'application ne s'affiche qu'**UNE SEULE FOIS** - copiez-le immédiatement !
- Si vous le perdez, créez-en un nouveau

