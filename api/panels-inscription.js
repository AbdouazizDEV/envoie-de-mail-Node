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
 * IDs de sessions valides par jour
 */
const VALID_SESSION_IDS = {
  rappel: ['rappel-1'],
  jour1: ['j1-1', 'j1-2', 'j1-3', 'j1-4'],
  jour2: ['j2-1', 'j2-2', 'j2-3', 'j2-4'],
  jour3: ['j3-1', 'j3-2', 'j3-3', 'j3-4'],
  jour4: ['j4-1', 'j4-2', 'j4-3'],
};

/**
 * Sessions simultanées (jour 3)
 */
const SIMULTANEOUS_SESSIONS = {
  morning: ['j3-1', 'j3-2'], // 09:00 - 11:00
  afternoon: ['j3-3', 'j3-4'], // 14:00 - 16:00
};

/**
 * Validation des données d'inscription aux panels
 */
const validatePanelsInscriptionData = (data) => {
  const errors = [];

  // Champs obligatoires
  const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'organization', 'role', 'country'];
  requiredFields.forEach((field) => {
    if (!data[field] || !data[field].trim()) {
      const fieldNames = {
        firstName: 'prénom',
        lastName: 'nom',
        email: 'email',
        phone: 'téléphone',
        organization: 'organisation',
        role: 'fonction',
        country: 'pays',
      };
      errors.push(`Le champ ${fieldNames[field] || field} est requis`);
    }
  });

  // Validation email
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.push('Le format de l\'email est invalide');
  }

  // Validation des sessions - au moins une session doit être sélectionnée
  if (!data.sessions || typeof data.sessions !== 'object') {
    errors.push('Les sessions sont requises');
  } else {
    const hasSessions = Object.values(data.sessions).some(
      (arr) => Array.isArray(arr) && arr.length > 0
    );
    if (!hasSessions) {
      errors.push('Veuillez sélectionner au moins une session');
    }
  }

  // Validation des IDs de sessions
  if (data.sessions && typeof data.sessions === 'object') {
    Object.keys(data.sessions).forEach((day) => {
      if (VALID_SESSION_IDS[day] && Array.isArray(data.sessions[day])) {
        data.sessions[day].forEach((sessionId) => {
          if (!VALID_SESSION_IDS[day].includes(sessionId)) {
            errors.push(`ID de session invalide: ${sessionId} pour ${day}`);
          }
        });
      }
    });

    // Validation des sessions simultanées (jour 3)
    if (data.sessions.jour3 && Array.isArray(data.sessions.jour3)) {
      const jour3Sessions = data.sessions.jour3;
      
      // Vérifier sessions du matin (j3-1 et j3-2 simultanées)
      const morningCount = jour3Sessions.filter((s) => SIMULTANEOUS_SESSIONS.morning.includes(s)).length;
      if (morningCount > 1) {
        errors.push('Vous ne pouvez pas vous inscrire à plusieurs sessions simultanées le matin du jour 3');
      }

      // Vérifier sessions de l'après-midi (j3-3 et j3-4 simultanées)
      const afternoonCount = jour3Sessions.filter((s) => SIMULTANEOUS_SESSIONS.afternoon.includes(s)).length;
      if (afternoonCount > 1) {
        errors.push('Vous ne pouvez pas vous inscrire à plusieurs sessions simultanées l\'après-midi du jour 3');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Handler pour la route POST /api/panels-inscription
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
    const inscriptionData = req.body;

    if (!inscriptionData || typeof inscriptionData !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Données invalides. Un objet JSON est attendu.',
      });
    }

    // Validation des champs requis
    const validation = validatePanelsInscriptionData(inscriptionData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Erreurs de validation',
        errors: validation.errors,
      });
    }

    // Envoi de l'email
    await MailService.sendPanelsInscriptionEmail(inscriptionData);

    // Réponse de succès
    return res.status(200).json({
      success: true,
      message: 'Inscription aux panels enregistrée avec succès',
    });
  } catch (error) {
    console.error('Erreur dans /api/panels-inscription:', error);

    // Réponse d'erreur générique
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de l\'enregistrement de l\'inscription',
    });
  }
};
