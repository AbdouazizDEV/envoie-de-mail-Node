# 📧 Node Mail Backend - Serverless sur Vercel

Backend serverless Node.js déployable sur Vercel pour l'envoi d'emails via Nodemailer, consommé par un frontend React.

## 📁 Structure du projet

```
backend/
├── api/
│   ├── contact.js          # Endpoint POST /api/contact
│   └── reservation.js      # Endpoint POST /api/reservation
├── src/
│   ├── config/
│   │   └── mailer.js       # Configuration Nodemailer
│   ├── services/
│   │   └── mail.service.js # Service centralisé d'envoi d'emails
│   └── templates/
│       ├── contact.html    # Template email contact
│       └── reservation.html # Template email réservation
├── package.json
├── vercel.json
└── README.md
```

## 🚀 Installation

### 1. Cloner ou télécharger le projet

```bash
cd "Node Mail"
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration des variables d'environnement

#### Localement (développement)

Créez un fichier `.env` à la racine du projet :

```env
MAIL_USER=votre-email@gmail.com
MAIL_PASS=votre-app-password-gmail
```

#### Sur Vercel (production)

1. Allez sur votre projet Vercel : https://vercel.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **Settings** → **Environment Variables**
4. Ajoutez les variables suivantes :

| Variable | Valeur | Description |
|----------|--------|-------------|
| `MAIL_USER` | votre-email@gmail.com | Votre adresse email Gmail |
| `MAIL_PASS` | votre-app-password | Mot de passe d'application Gmail |

### 4. Configuration Gmail (App Password)

Pour utiliser Gmail avec Nodemailer, vous devez créer un **Mot de passe d'application** :

1. Allez sur votre compte Google : https://myaccount.google.com/
2. Activez la **Validation en deux étapes** si ce n'est pas déjà fait
3. Allez dans **Sécurité** → **Validation en deux étapes**
4. Faites défiler jusqu'à **Mots de passe des applications**
5. Cliquez sur **Sélectionner une application** → **Autre (nom personnalisé)**
6. Entrez "Node Mail Backend" et cliquez sur **Générer**
7. Copiez le mot de passe généré (16 caractères) et utilisez-le comme `MAIL_PASS`

⚠️ **Important** : Utilisez le mot de passe d'application, pas votre mot de passe Gmail normal.

## 🧪 Test local avec Vercel CLI

### Installation de Vercel CLI

```bash
npm install -g vercel
```

### Lancer le serveur de développement

```bash
npm run dev
# ou
vercel dev
```

Le serveur sera accessible sur `http://localhost:3000`

## 📡 Endpoints API

### POST /api/contact

Envoie un email de contact.

**Body (JSON) :**

```json
{
  "civility": "Monsieur",
  "fullName": "Jean Dupont",
  "organization": "Acme Corp",
  "country": "France",
  "email": "jean.dupont@example.com",
  "phone": "+33 6 12 34 56 78",
  "participationType": "Exposant",
  "message": "Bonjour, je souhaite obtenir plus d'informations..."
}
```

**Réponse succès (200) :**

```json
{
  "success": true,
  "message": "Email envoyé avec succès"
}
```

**Réponse erreur (400) :**

```json
{
  "success": false,
  "message": "Erreurs de validation",
  "errors": [
    "Le champ email est requis",
    "Le champ nom complet est requis"
  ]
}
```

### POST /api/reservation

Envoie un email de réservation.

**Body (JSON) :**

```json
{
  "fullName": "Marie Martin",
  "email": "marie.martin@example.com",
  "phone": "+33 6 98 76 54 32",
  "organization": "Tech Solutions",
  "participationType": "Visiteur",
  "package": "Premium",
  "numberOfPeople": "3"
}
```

**Réponse succès (200) :**

```json
{
  "success": true,
  "message": "Email envoyé avec succès"
}
```

## 🧪 Tester les endpoints

### Avec cURL

#### Test Contact

```bash
curl -X POST https://votre-projet.vercel.app/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "civility": "Monsieur",
    "fullName": "Jean Dupont",
    "organization": "Acme Corp",
    "country": "France",
    "email": "jean.dupont@example.com",
    "phone": "+33 6 12 34 56 78",
    "participationType": "Exposant",
    "message": "Bonjour, je souhaite obtenir plus d informations."
  }'
```

#### Test Réservation

```bash
curl -X POST https://votre-projet.vercel.app/api/reservation \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Marie Martin",
    "email": "marie.martin@example.com",
    "phone": "+33 6 98 76 54 32",
    "organization": "Tech Solutions",
    "participationType": "Visiteur",
    "package": "Premium",
    "numberOfPeople": "3"
  }'
```

### Avec Postman

1. Créez une nouvelle requête POST
2. URL : `https://votre-projet.vercel.app/api/contact` ou `/api/reservation`
3. Headers : `Content-Type: application/json`
4. Body (raw JSON) : Utilisez les exemples JSON ci-dessus
5. Cliquez sur **Send**

### Avec Thunder Client (VS Code)

1. Installez l'extension Thunder Client
2. Créez une nouvelle requête POST
3. Configurez comme pour Postman

## ⚛️ Appeler l'API depuis React

### Exemple avec fetch

#### Contact.jsx

```jsx
import { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    civility: '',
    fullName: '',
    organization: '',
    country: '',
    email: '',
    phone: '',
    participationType: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('https://votre-projet.vercel.app/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Message envoyé avec succès !');
        // Réinitialiser le formulaire
        setFormData({
          civility: '',
          fullName: '',
          organization: '',
          country: '',
          email: '',
          phone: '',
          participationType: '',
          message: ''
        });
      } else {
        setMessage(`Erreur: ${data.message}`);
      }
    } catch (error) {
      setMessage('Une erreur est survenue. Veuillez réessayer.');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Vos champs de formulaire */}
      <button type="submit" disabled={loading}>
        {loading ? 'Envoi...' : 'Envoyer'}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default Contact;
```

#### Reserver.jsx

```jsx
import { useState } from 'react';

const Reserver = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    organization: '',
    participationType: '',
    package: '',
    numberOfPeople: '1'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('https://votre-projet.vercel.app/api/reservation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Réservation envoyée avec succès !');
        // Réinitialiser le formulaire
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          organization: '',
          participationType: '',
          package: '',
          numberOfPeople: '1'
        });
      } else {
        setMessage(`Erreur: ${data.message}`);
      }
    } catch (error) {
      setMessage('Une erreur est survenue. Veuillez réessayer.');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Vos champs de formulaire */}
      <button type="submit" disabled={loading}>
        {loading ? 'Envoi...' : 'Réserver'}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default Reserver;
```

### Exemple avec axios

```bash
npm install axios
```

```jsx
import axios from 'axios';

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await axios.post(
      'https://votre-projet.vercel.app/api/contact',
      formData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.success) {
      setMessage('Message envoyé avec succès !');
    }
  } catch (error) {
    setMessage('Une erreur est survenue.');
    console.error('Erreur:', error.response?.data || error.message);
  } finally {
    setLoading(false);
  }
};
```

## 🚀 Déploiement sur Vercel

### Méthode 1 : Via Vercel CLI

```bash
# Se connecter à Vercel
vercel login

# Déployer
vercel

# Pour la production
vercel --prod
```

### Méthode 2 : Via GitHub

1. Poussez votre code sur GitHub
2. Allez sur https://vercel.com/new
3. Importez votre repository
4. Configurez les variables d'environnement dans les paramètres du projet
5. Cliquez sur **Deploy**

### Méthode 3 : Via l'interface Vercel

1. Allez sur https://vercel.com/new
2. Importez votre projet (GitHub, GitLab, Bitbucket)
3. Vercel détectera automatiquement la configuration
4. Ajoutez les variables d'environnement
5. Cliquez sur **Deploy**

## 🔒 Sécurité

- ✅ Aucun secret dans le code
- ✅ Variables d'environnement uniquement
- ✅ Validation des données côté serveur
- ✅ Gestion des erreurs propre
- ✅ CORS configuré pour les appels frontend

## 📝 Notes importantes

1. **SMTP Gmail** : Par défaut, le projet utilise Gmail SMTP. Vous pouvez modifier la configuration dans `src/config/mailer.js` pour utiliser un autre fournisseur.

2. **Limites Gmail** : Gmail limite à 500 emails/jour pour les comptes gratuits. Pour un usage intensif, utilisez un service SMTP professionnel (SendGrid, Mailgun, etc.).

3. **Variables d'environnement** : Ne commitez jamais votre fichier `.env`. Il est déjà dans `.gitignore`.

4. **CORS** : Les headers CORS sont configurés pour accepter les requêtes depuis n'importe quelle origine (`*`). Pour la production, restreignez cela à votre domaine frontend.

## 🐛 Dépannage

### Erreur : "Variables d'environnement MAIL_USER et MAIL_PASS requises"

➡️ Vérifiez que les variables d'environnement sont bien configurées sur Vercel.

### Erreur : "Invalid login" ou "Authentication failed"

➡️ Vérifiez que vous utilisez un **mot de passe d'application** Gmail, pas votre mot de passe normal.

### Erreur : "Template introuvable"

➡️ Vérifiez que les fichiers HTML sont bien présents dans `src/templates/`.

### Les emails ne sont pas reçus

➡️ Vérifiez :
- Les logs Vercel pour voir les erreurs
- Votre dossier spam
- Que le destinataire par défaut est bien `MAIL_USER`

## 📄 Licence

MIT

## 👨‍💻 Support

Pour toute question ou problème, vérifiez les logs Vercel dans le dashboard ou consultez la documentation Nodemailer : https://nodemailer.com/
# envoie-de-mail-Node
