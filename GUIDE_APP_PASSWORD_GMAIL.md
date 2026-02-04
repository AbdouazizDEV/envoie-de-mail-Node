# 📧 Guide : Comment obtenir un Mot de passe d'application Gmail

Ce guide vous explique étape par étape comment créer un **Mot de passe d'application Gmail** pour permettre à votre backend d'envoyer des emails.

---

## ⚠️ Prérequis IMPORTANT

**Vous DEVEZ d'abord activer la Validation en deux étapes** sur votre compte Google avant de pouvoir créer un mot de passe d'application.

---

## 📋 Étape 1 : Activer la Validation en deux étapes

### 1.1 Accéder à votre compte Google

1. Ouvrez votre navigateur web (Chrome, Firefox, Safari, etc.)
2. Allez sur : **https://myaccount.google.com/**
3. Connectez-vous avec votre compte Gmail si ce n'est pas déjà fait

### 1.2 Activer la validation en deux étapes

1. Dans le menu de gauche, cliquez sur **"Sécurité"** (ou cherchez "Sécurité" dans la barre de recherche en haut)
2. Faites défiler jusqu'à la section **"Connexion à Google"**
3. Cherchez **"Validation en deux étapes"** et cliquez dessus
4. Cliquez sur **"Commencer"** ou **"Activer"**
5. Suivez les instructions à l'écran pour configurer la validation en deux étapes :
   - Vous devrez entrer votre numéro de téléphone
   - Vous recevrez un code par SMS ou appel
   - Entrez le code reçu pour confirmer

✅ **Une fois activée**, vous verrez "Validation en deux étapes : Activée" avec un bouton vert

---

## 🔑 Étape 2 : Créer un Mot de passe d'application

### 2.1 Accéder aux Mots de passe des applications

1. Toujours dans la page **"Sécurité"** de votre compte Google
2. Faites défiler jusqu'à la section **"Validation en deux étapes"**
3. Cliquez sur **"Validation en deux étapes"** (même si c'est déjà activé)
4. Faites défiler jusqu'à trouver **"Mots de passe des applications"**
5. Cliquez sur **"Mots de passe des applications"**

💡 **Note** : Si vous ne voyez pas cette option, assurez-vous que la validation en deux étapes est bien activée.

### 2.2 Créer un nouveau mot de passe

1. Une nouvelle page s'ouvre avec le titre **"Mots de passe des applications"**
2. Vous verrez une liste déroulante **"Sélectionner une application"**
3. Cliquez sur cette liste et choisissez **"Autre (nom personnalisé)"**
4. Dans le champ qui apparaît, tapez un nom descriptif, par exemple :
   - `Node Mail Backend`
   - `Mon Site Web`
   - `Application Email`
   - Ou tout autre nom qui vous aidera à vous souvenir de l'utilisation
5. Cliquez sur le bouton **"Générer"** (ou "Créer")

### 2.3 Copier le mot de passe généré

1. **IMPORTANT** : Un mot de passe de 16 caractères s'affiche à l'écran
   - Format : `xxxx xxxx xxxx xxxx` (4 groupes de 4 caractères)
   - Exemple : `abcd efgh ijkl mnop`

2. **COPIEZ CE MOT DE PASSE IMMÉDIATEMENT** car :
   - ⚠️ Il ne sera affiché qu'**UNE SEULE FOIS**
   - ⚠️ Vous ne pourrez plus le voir après avoir fermé cette page
   - ⚠️ Si vous le perdez, vous devrez en créer un nouveau

3. **Conseil** : Collez-le dans un fichier texte temporaire ou notez-le quelque part de sûr

---

## 🔐 Étape 3 : Utiliser le mot de passe dans votre configuration

### 3.1 Sur Vercel (Production)

1. Allez sur **https://vercel.com/dashboard**
2. Sélectionnez votre projet
3. Allez dans **Settings** → **Environment Variables**
4. Trouvez la variable `MAIL_PASS`
5. Cliquez sur **"Edit"** ou **"Modifier"**
6. **Collez le mot de passe d'application** (les 16 caractères, avec ou sans espaces)
7. Cliquez sur **"Save"** ou **"Enregistrer"**

### 3.2 En local (Développement)

1. Ouvrez le fichier `.env` à la racine de votre projet
2. Trouvez la ligne `MAIL_PASS=`
3. Collez le mot de passe après le signe `=`
   ```
   MAIL_PASS=abcdefghijklmnop
   ```
   (ou avec espaces : `MAIL_PASS=abcd efgh ijkl mnop`)
4. Sauvegardez le fichier

---

## ❓ Questions fréquentes (FAQ)

### Q1 : Pourquoi ai-je besoin d'un mot de passe d'application ?

**Réponse** : Google a renforcé la sécurité. Votre mot de passe Gmail normal ne fonctionne plus avec les applications tierces. Le mot de passe d'application est spécialement créé pour autoriser des applications externes à envoyer des emails en votre nom.

### Q2 : Puis-je utiliser mon mot de passe Gmail normal ?

**Réponse** : ❌ **NON**. Cela ne fonctionnera pas et vous obtiendrez une erreur "Invalid login" ou "Authentication failed". Vous DEVEZ utiliser un mot de passe d'application.

### Q3 : Le mot de passe d'application est-il sécurisé ?

**Réponse** : ✅ **OUI**. C'est plus sécurisé car :
- Il est unique à chaque application
- Vous pouvez le révoquer à tout moment
- Il ne donne accès qu'à l'envoi d'emails, pas à votre compte complet

### Q4 : J'ai perdu mon mot de passe d'application, que faire ?

**Réponse** : Pas de problème ! Créez-en un nouveau :
1. Allez dans "Mots de passe des applications"
2. Créez un nouveau mot de passe
3. Mettez à jour la variable `MAIL_PASS` sur Vercel avec le nouveau mot de passe

### Q5 : Puis-je avoir plusieurs mots de passe d'application ?

**Réponse** : ✅ **OUI**. Vous pouvez en créer plusieurs pour différentes applications. Chaque mot de passe fonctionne indépendamment.

### Q6 : Que se passe-t-il si je désactive la validation en deux étapes ?

**Réponse** : ⚠️ Tous vos mots de passe d'application seront automatiquement désactivés. Vous devrez les recréer après avoir réactivé la validation en deux étapes.

### Q7 : Le mot de passe contient des espaces, dois-je les garder ?

**Réponse** : Vous pouvez les garder ou les supprimer, les deux fonctionnent :
- `abcd efgh ijkl mnop` ✅
- `abcdefghijklmnop` ✅

### Q8 : Combien de temps le mot de passe d'application est-il valide ?

**Réponse** : Il reste valide **indéfiniment** jusqu'à ce que vous le révoquiez manuellement ou que vous désactiviez la validation en deux étapes.

---

## 🎯 Résumé rapide

1. ✅ Activez la **Validation en deux étapes** sur votre compte Google
2. ✅ Allez dans **"Mots de passe des applications"**
3. ✅ Créez un nouveau mot de passe pour "Autre (nom personnalisé)"
4. ✅ **Copiez immédiatement** le mot de passe de 16 caractères
5. ✅ Utilisez-le comme valeur de `MAIL_PASS` sur Vercel ou dans votre fichier `.env`

---

## 🆘 Besoin d'aide ?

Si vous rencontrez des difficultés :

1. **Vérifiez** que la validation en deux étapes est bien activée
2. **Assurez-vous** d'utiliser le mot de passe d'application, pas votre mot de passe Gmail normal
3. **Vérifiez** que vous avez copié les 16 caractères complets
4. **Consultez** la documentation Google : https://support.google.com/accounts/answer/185833

---

**✅ Une fois configuré, votre backend pourra envoyer des emails via Gmail !**
