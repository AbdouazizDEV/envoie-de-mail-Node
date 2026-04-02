const { createTransporter } = require('../config/mailer');
const { buildVisitorBadgePdf } = require('./visitor-badge-pdf');
const fs = require('fs');
const path = require('path');

/**
 * Service centralisé pour l'envoi d'emails
 */
class MailService {
  static escapeHtml(str) {
    if (str == null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  static getParticipationMeta(participationType) {
    const t = (participationType || '').trim();
    const displayMap = {
      participant: 'Participant',
      exposant: 'Exposant',
      partenaire: 'Partenaire',
      speaker: 'Speaker',
      visiteur: 'Visiteur',
    };
    let participationTypeLabel = 'Package / Stand';
    if (t === 'exposant') participationTypeLabel = 'Stand';
    else if (t === 'participant') participationTypeLabel = 'Package';
    else if (t === 'visiteur') participationTypeLabel = 'Formule';
    else if (t === 'partenaire' || t === 'speaker') participationTypeLabel = 'Détails / offre';

    return {
      participationTypeDisplay: displayMap[t] || t || '—',
      participationTypeLabel,
    };
  }

  static generateBadgeRef() {
    const part = Date.now().toString(36).toUpperCase().slice(-5);
    const rnd = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `VIS-2026-${part}-${rnd}`;
  }

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
  static async sendEmail({ to, subject, html, from = null, attachments = [] }) {
    try {
      const transporter = createTransporter();
      const mailUser = process.env.MAIL_USER;
      // Adresse email destinataire (où recevoir les emails de contact/réservation)
      const mailTo = process.env.MAIL_TO || mailUser;

      const mailOptions = {
        from: from || `"Forum des Territoires 2024" <${mailUser}>`,
        to: to || mailTo, // Envoie à l'adresse configurée dans MAIL_TO
        subject: subject,
        html: html,
      };

      if (attachments && attachments.length > 0) {
        mailOptions.attachments = attachments;
      }

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
    const mailUser = process.env.MAIL_USER;
    const mailTo = process.env.MAIL_TO || mailUser;
    const participationType = (reservationData.participationType || '').trim();
    const meta = this.getParticipationMeta(participationType);

    let visitorBadgeSection = '';
    const attachments = [];

    if (participationType === 'visiteur') {
      const badgeRef = this.generateBadgeRef();
      const registeredAt = new Date().toLocaleString('fr-FR', {
        dateStyle: 'full',
        timeStyle: 'medium',
      });
      const org = (reservationData.organization || '').trim();
      const phone = (reservationData.phone || '').trim();
      const organizationBlock = org
        ? `<p style="margin:12px 0 0 0;font-size:13px;color:#94a3b8;">${this.escapeHtml(org)}</p>`
        : '';
      const phoneBlock = phone
        ? `<p style="margin:8px 0 0 0;font-size:13px;color:#94a3b8;">${this.escapeHtml(phone)}</p>`
        : '';

      const badgeCardHtml = this.loadTemplate('visitor-badge-fragment', {
        fullName: this.escapeHtml(reservationData.fullName || ''),
        email: this.escapeHtml(reservationData.email || ''),
        package: this.escapeHtml(reservationData.package || 'Accès Forum & Visites'),
        numberOfPeople: this.escapeHtml(String(reservationData.numberOfPeople || '1')),
        badgeRef: this.escapeHtml(badgeRef),
        registeredAt: this.escapeHtml(registeredAt),
        visitorTagline: 'Accès au forum, aux espaces de visite et au networking.',
        organizationBlock,
        phoneBlock,
        instructions:
          'À remettre au visiteur le jour du forum (badge écran ou PDF imprimé). Une pièce d’identité peut être demandée à l’accueil.',
        pdfNote:
          '<strong style="color:#f8fafc;">PDF joint</strong> à cet email : impression format carte pour badge physique.',
      });

      visitorBadgeSection = `
<div style="margin-top:28px;padding-top:24px;border-top:2px dashed #dee2e6;">
  <p style="margin:0 0 14px 0;font-size:14px;font-weight:bold;color:#155724;text-transform:uppercase;letter-spacing:0.05em;">Aperçu du badge visiteur</p>
  ${badgeCardHtml}
</div>`;

      const pdfBuffer = await buildVisitorBadgePdf({
        fullName: reservationData.fullName,
        email: reservationData.email,
        phone,
        organization: org,
        package: reservationData.package,
        numberOfPeople: reservationData.numberOfPeople,
        badgeRef,
        registeredAt,
      });

      attachments.push({
        filename: 'badge-visiteur-forum.pdf',
        content: pdfBuffer,
        contentType: 'application/pdf',
      });
    }

    const html = this.loadTemplate('reservation', {
      fullName: this.escapeHtml(reservationData.fullName || ''),
      email: this.escapeHtml(reservationData.email || ''),
      phone: this.escapeHtml(reservationData.phone || ''),
      organization: this.escapeHtml(reservationData.organization || ''),
      participationType: this.escapeHtml(participationType),
      participationTypeDisplay: meta.participationTypeDisplay,
      participationTypeLabel: meta.participationTypeLabel,
      package: this.escapeHtml(reservationData.package || ''),
      numberOfPeople: this.escapeHtml(String(reservationData.numberOfPeople || '1')),
      visitorBadgeSection,
      date: new Date().toLocaleString('fr-FR', {
        dateStyle: 'full',
        timeStyle: 'medium',
      }),
    });

    const subject =
      participationType === 'visiteur'
        ? 'Nouvelle réservation — Visiteur (badge PDF joint)'
        : 'Nouvelle réservation';

    return await this.sendEmail({
      to: mailTo,
      subject,
      html,
      attachments,
    });
  }

  /**
   * Envoie un email d'inscription aux panels
   * @param {Object} inscriptionData - Données d'inscription aux panels
   * @returns {Promise<Object>}
   */
  static async sendPanelsInscriptionEmail(inscriptionData) {
    // Formatage des sessions sélectionnées
    const formatSessions = (sessions) => {
      if (!sessions || typeof sessions !== 'object') return '';
      
      const sessionLabels = {
        'rappel-1': 'Rappel - 1ère Session (10h-18h)',
        'j1-1': 'Jour 1 - Cérémonie d\'Ouverture (09h-10h30)',
        'j1-2': 'Jour 1 - Gouvernance locale participative (11h-12h30)',
        'j1-3': 'Jour 1 - Financement des projets territoriaux (14h-15h30)',
        'j1-4': 'Jour 1 - Transition écologique et développement durable (16h-17h30)',
        'j2-1': 'Jour 2 - Agro-business et sécurité alimentaire (09h-10h30)',
        'j2-2': 'Jour 2 - Tourisme et patrimoine (11h-12h30)',
        'j2-3': 'Jour 2 - Innovation territoriale (14h-15h30)',
        'j2-4': 'Jour 2 - Rencontres B to B et B to C (16h-18h)',
        'j3-1': 'Jour 3 - Panel 1: Habitat et aménagement urbain (09h-11h)',
        'j3-2': 'Jour 3 - Panel 2: Énergies renouvelables (09h-11h)',
        'j3-3': 'Jour 3 - Panel 3: Économie numérique (14h-16h)',
        'j3-4': 'Jour 3 - Panel 4: Coopération décentralisée (14h-16h)',
        'j4-1': 'Jour 4 - Synthèse et recommandations (09h-11h)',
        'j4-2': 'Jour 4 - Signature de partenariats (11h30-13h)',
        'j4-3': 'Jour 4 - Dîner de Gala (19h-23h)',
      };

      let formatted = '';
      Object.keys(sessions).forEach((day) => {
        if (Array.isArray(sessions[day]) && sessions[day].length > 0) {
          formatted += `<strong>${day === 'rappel' ? 'Rappel' : day.charAt(0).toUpperCase() + day.slice(1)}:</strong><ul>`;
          sessions[day].forEach((sessionId) => {
            formatted += `<li>${sessionLabels[sessionId] || sessionId}</li>`;
          });
          formatted += '</ul>';
        }
      });
      return formatted || 'Aucune session sélectionnée';
    };

    const html = this.loadTemplate('panels-inscription', {
      firstName: inscriptionData.firstName || '',
      lastName: inscriptionData.lastName || '',
      email: inscriptionData.email || '',
      phone: inscriptionData.phone || '',
      organization: inscriptionData.organization || '',
      role: inscriptionData.role || '',
      country: inscriptionData.country || '',
      validationCode: inscriptionData.validationCode || 'Non fourni',
      remarks: inscriptionData.remarks || 'Aucune',
      sessions: formatSessions(inscriptionData.sessions),
      date: new Date().toLocaleString('fr-FR', {
        dateStyle: 'full',
        timeStyle: 'medium',
      }),
    });

    return await this.sendEmail({
      subject: 'Nouvelle inscription aux panels',
      html: html,
    });
  }
}

module.exports = MailService;

