const nodemailer = require('nodemailer');

/**
 * Configuration et création du transporteur Nodemailer
 * Utilise les variables d'environnement pour la configuration SMTP
 */
const createTransporter = () => {
  // Configuration par défaut pour Gmail
  const config = {
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT) || 587,
    secure: process.env.MAIL_SECURE === 'true' || false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  };

  // Vérification des variables d'environnement requises
  if (!config.auth.user || !config.auth.pass) {
    throw new Error(
      'Variables d\'environnement MAIL_USER et MAIL_PASS requises'
    );
  }

  return nodemailer.createTransport(config);
};

/**
 * Vérifie la connexion SMTP
 * @returns {Promise<boolean>}
 */
const verifyConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Erreur de vérification SMTP:', error);
    return false;
  }
};

module.exports = {
  createTransporter,
  verifyConnection,
};
