const MailService = require('../src/services/mail.service');

/**
 * Fonction utilitaire pour gérer les headers CORS
 */
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

/**
 * Validation des données du formulaire de contact
 */
const validateContactData = (data) => {
  const errors = [];

  if (!data.email || !data.email.trim()) {
    errors.push('Le champ email est requis');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Le format de l\'email est invalide');
  }

  if (!data.fullName || !data.fullName.trim()) {
    errors.push('Le champ nom complet est requis');
  }

  if (!data.message || !data.message.trim()) {
    errors.push('Le champ message est requis');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Handler pour la route POST /api/contact
 * Vercel Serverless Function
 */
module.exports = async (req, res) => {
  // Gestion des requêtes OPTIONS (preflight CORS)
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    return res.status(200).end();
  }

  // Seulement les requêtes POST sont autorisées
  if (req.method !== 'POST') {
    setCorsHeaders(res);
    return res.status(405).json({
      success: false,
      message: 'Méthode non autorisée. Utilisez POST.',
    });
  }

  setCorsHeaders(res);

  try {
    // Récupération et validation des données
    const contactData = req.body;

    if (!contactData || typeof contactData !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Données invalides. Un objet JSON est attendu.',
      });
    }

    // Validation des champs requis
    const validation = validateContactData(contactData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Erreurs de validation',
        errors: validation.errors,
      });
    }

    // Envoi de l'email
    await MailService.sendContactEmail(contactData);

    // Réponse de succès
    return res.status(200).json({
      success: true,
      message: 'Email envoyé avec succès',
    });
  } catch (error) {
    console.error('Erreur dans /api/contact:', error);

    // Réponse d'erreur générique (ne pas exposer les détails techniques)
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de l\'envoi de l\'email',
    });
  }
};
