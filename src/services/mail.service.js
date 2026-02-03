const { createTransporter } = require('../config/mailer');
const fs = require('fs');
const path = require('path');

/**
 * Service centralisé pour l'envoi d'emails
 */
class MailService {
  /**
   * Charge un template HTML depuis le dossier templates
   * @param {string} templateName - Nom du template (sans extension)
   * @param {Object} data - Données à injecter dans le template
   * @returns {string} - HTML généré
   */
  static loadTemplate(templateName, data = {}) {
    try {
      const templatePath = path.join(
        __dirname,
        '../templates',
        `${templateName}.html`
      );
      let html = fs.readFileSync(templatePath, 'utf8');

      // Remplacement simple des variables dans le template
      // Format: {{variableName}}
      Object.keys(data).forEach((key) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        html = html.replace(regex, data[key] || '');
      });

      return html;
    } catch (error) {
      console.error(`Erreur lors du chargement du template ${templateName}:`, error);
      throw new Error(`Template ${templateName} introuvable`);
    }
  }

  /**
   * Envoie un email
   * @param {Object} options - Options d'envoi
   * @param {string} options.to - Destinataire
   * @param {string} options.subject - Sujet de l'email
   * @param {string} options.html - Contenu HTML
   * @param {string} [options.from] - Expéditeur (optionnel)
   * @returns {Promise<Object>}
   */
  static async sendEmail({ to, subject, html, from = null }) {
    try {
      const transporter = createTransporter();
      const mailUser = process.env.MAIL_USER;

      const mailOptions = {
        from: from || `"Node Mail Backend" <${mailUser}>`,
        to: to || mailUser, // Par défaut, envoie à l'adresse configurée
        subject: subject,
        html: html,
      };

      const info = await transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: info.messageId,
        response: info.response,
      };
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      throw error;
    }
  }

  /**
   * Envoie un email de contact
   * @param {Object} contactData - Données du formulaire de contact
   * @returns {Promise<Object>}
   */
  static async sendContactEmail(contactData) {
    const html = this.loadTemplate('contact', {
      civility: contactData.civility || '',
      fullName: contactData.fullName || '',
      organization: contactData.organization || '',
      country: contactData.country || '',
      email: contactData.email || '',
      phone: contactData.phone || '',
      participationType: contactData.participationType || '',
      message: contactData.message || '',
      date: new Date().toLocaleString('fr-FR', {
        dateStyle: 'full',
        timeStyle: 'medium',
      }),
    });

    return await this.sendEmail({
      subject: 'Nouveau message de contact',
      html: html,
    });
  }

  /**
   * Envoie un email de réservation
   * @param {Object} reservationData - Données du formulaire de réservation
   * @returns {Promise<Object>}
   */
  static async sendReservationEmail(reservationData) {
    const html = this.loadTemplate('reservation', {
      fullName: reservationData.fullName || '',
      email: reservationData.email || '',
      phone: reservationData.phone || '',
      organization: reservationData.organization || '',
      participationType: reservationData.participationType || '',
      package: reservationData.package || '',
      numberOfPeople: reservationData.numberOfPeople || '1',
      date: new Date().toLocaleString('fr-FR', {
        dateStyle: 'full',
        timeStyle: 'medium',
      }),
    });

    return await this.sendEmail({
      subject: 'Nouvelle réservation',
      html: html,
    });
  }
}

module.exports = MailService;
