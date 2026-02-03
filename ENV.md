# Variables d'environnement

## Configuration requise

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
MAIL_USER=votre-email@gmail.com
MAIL_PASS=votre-app-password-gmail
```

## Configuration sur Vercel

1. Allez sur votre projet Vercel
2. **Settings** → **Environment Variables**
3. Ajoutez les variables :

| Variable | Description |
|----------|-------------|
| `MAIL_USER` | Votre adresse email Gmail |
| `MAIL_PASS` | Mot de passe d'application Gmail (16 caractères) |

## Variables optionnelles

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
```

Par défaut, ces valeurs sont déjà configurées pour Gmail dans le code.

## Comment obtenir un App Password Gmail

1. Activez la **Validation en deux étapes** sur votre compte Google
2. Allez dans **Sécurité** → **Mots de passe des applications**
3. Créez un nouveau mot de passe d'application
4. Utilisez ce mot de passe (16 caractères) comme `MAIL_PASS`

⚠️ **Important** : N'utilisez jamais votre mot de passe Gmail normal, uniquement un mot de passe d'application.
