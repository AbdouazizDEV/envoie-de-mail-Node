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
 * Validation des données du formulaire de réservation
 */
const validateReservationData = (data) => {
  const errors = [];

  // Validation email
  if (!data.email || !data.email.trim()) {
    errors.push('Le champ email est requis');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Le format de l\'email est invalide');
  }

  // Validation nom complet
  if (!data.fullName || !data.fullName.trim()) {
    errors.push('Le champ nom complet est requis');
  }

  // Validation participationType
  const validParticipationTypes = ['participant', 'exposant', 'partenaire', 'speaker'];
  if (!data.participationType || !data.participationType.trim()) {
    errors.push('Le type de participation est requis');
  } else if (!validParticipationTypes.includes(data.participationType)) {
    errors.push(`Type de participation invalide. Valeurs acceptées: ${validParticipationTypes.join(', ')}`);
  }

  // Validation package selon le type de participation
  const participationType = data.participationType?.trim();
  
  if (participationType === 'exposant') {
    // Pour les exposants, le stand est REQUIS
    const validStands = ['Stand Standard', 'Stand Premium', 'Stand VIP'];
    if (!data.package || !data.package.trim()) {
      errors.push('Le stand est requis pour les exposants');
    } else if (!validStands.includes(data.package.trim())) {
      errors.push(`Stand invalide. Valeurs acceptées: ${validStands.join(', ')}`);
    }
  } else if (participationType === 'participant') {
    // Pour les participants, le package est OPTIONNEL
    const validPackages = ['Package Teranga', 'Package Silver', 'Package Gold', 'Non spécifié', ''];
    if (data.package && data.package.trim() && !validPackages.includes(data.package.trim())) {
      errors.push(`Package invalide. Valeurs acceptées: ${validPackages.filter(p => p !== '').join(', ')}, ou laissez vide`);
    }
    // Si vide, on définit "Non spécifié" par défaut
    if (!data.package || !data.package.trim()) {
      data.package = 'Non spécifié';
    }
  }

  // Validation nombre de personnes
  if (!data.numberOfPeople || isNaN(parseInt(data.numberOfPeople)) || parseInt(data.numberOfPeople) < 1) {
    errors.push('Le nombre de personnes doit être un nombre valide supérieur à 0');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Handler pour la route POST /api/reservation
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
    const reservationData = req.body;

    if (!reservationData || typeof reservationData !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Données invalides. Un objet JSON est attendu.',
      });
    }

    // Validation des champs requis
    const validation = validateReservationData(reservationData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Erreurs de validation',
        errors: validation.errors,
      });
    }

    // Envoi de l'email
    await MailService.sendReservationEmail(reservationData);

    // Réponse de succès
    return res.status(200).json({
      success: true,
      message: 'Email envoyé avec succès',
    });
  } catch (error) {
    console.error('Erreur dans /api/reservation:', error);

    // Réponse d'erreur générique (ne pas exposer les détails techniques)
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de l\'envoi de l\'email',
    });
  }
};
