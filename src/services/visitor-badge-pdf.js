const PDFDocument = require('pdfkit');
const { FORUM_LOGO_IMG_URL } = require('../config/forum-brand');

async function loadLogoBuffer() {
  const res = await fetch(FORUM_LOGO_IMG_URL);
  if (!res.ok) throw new Error(`Logo HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/**
 * Génère un PDF badge visiteur (format carte paysage, prêt impression).
 * @param {Object} data
 * @param {string} data.fullName
 * @param {string} data.email
 * @param {string} [data.phone]
 * @param {string} [data.organization]
 * @param {string} data.package
 * @param {string} data.numberOfPeople
 * @param {string} data.badgeRef
 * @param {string} data.registeredAt
 * @returns {Promise<Buffer>}
 */
async function buildVisitorBadgePdf(data) {
  const fullName = (data.fullName || 'Invité').trim();
  const email = (data.email || '').trim();
  const phone = (data.phone || '').trim();
  const organization = (data.organization || '').trim();
  const formula = (data.package || 'Accès Forum & Visites').trim();
  const numberOfPeople = String(data.numberOfPeople || '1');
  const badgeRef = (data.badgeRef || '').trim();
  const registeredAt = (data.registeredAt || '').trim();

  let logoBuffer = null;
  try {
    logoBuffer = await loadLogoBuffer();
  } catch (e) {
    console.warn('Badge PDF: logo indisponible, poursuite sans image —', e.message);
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: [420, 265],
      margin: 0,
      info: {
        Title: `Badge visiteur — ${fullName}`,
        Author: 'Forum des Territoires',
      },
    });

    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const W = 420;
    const H = 265;

    doc.rect(0, 0, W, H).fill('#0f172a');
    doc.rect(0, 0, W, 6).fill('#f59e0b');
    doc.rect(0, H - 6, W, 6).fill('#f59e0b');

    // Zone logo : largeur carte moins marges, hauteur max pour laisser place au contenu
    const logoFitW = W - 72;
    const logoFitH = 56;
    const logoBoxX = (W - logoFitW) / 2;
    const logoY = 7;

    if (logoBuffer) {
      doc.image(logoBuffer, logoBoxX, logoY, { fit: [logoFitW, logoFitH] });
    } else {
      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor('#94a3b8')
        .text('FORUM DES TERRITOIRES', 28, 22, { width: W - 56, align: 'center' });
    }

    const titleTop = logoBuffer ? logoY + logoFitH + 8 : 42;
    doc
      .font('Helvetica-Bold')
      .fontSize(18)
      .fillColor('#f8fafc')
      .text('BADGE VISITEUR', 28, titleTop, { width: W - 56, align: 'center' });

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('#cbd5e1')
      .text('Accès forum, espaces de visite et networking', 28, titleTop + 22, {
        width: W - 56,
        align: 'center',
      });

    const lineY = titleTop + 44;
    doc.moveTo(28, lineY).lineTo(W - 28, lineY).strokeColor('#334155').lineWidth(0.5).stroke();

    const nameY = lineY + 10;
    doc
      .font('Helvetica-Bold')
      .fontSize(20)
      .fillColor('#ffffff')
      .text(fullName, 28, nameY, { width: W - 56, align: 'center' });

    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#e2e8f0')
      .text(email, 28, nameY + 30, { width: W - 56, align: 'center' });

    let y = nameY + 52;
    if (organization) {
      doc.font('Helvetica').fontSize(9).fillColor('#94a3b8').text(organization, 28, y, {
        width: W - 56,
        align: 'center',
      });
      y += 14;
    }
    if (phone) {
      doc.font('Helvetica').fontSize(9).fillColor('#94a3b8').text(phone, 28, y, { width: W - 56, align: 'center' });
      y += 14;
    }

    let metaY = Math.max(y + 8, 172);
    if (metaY + 50 > H - 28) {
      metaY = H - 28 - 50;
    }
    doc.rect(28, metaY, W - 56, 50).fill('#1e293b');
    doc.rect(28, metaY, W - 56, 50).strokeColor('#475569').lineWidth(0.5).stroke();

    doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .fillColor('#94a3b8')
      .text('FORMULE', 40, metaY + 7);
    doc.font('Helvetica').fontSize(10).fillColor('#f1f5f9').text(formula, 40, metaY + 18, {
      width: W - 80,
    });

    doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .fillColor('#94a3b8')
      .text('PERSONNES', W / 2 + 10, metaY + 7);
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#f1f5f9')
      .text(numberOfPeople, W / 2 + 10, metaY + 18);

    doc
      .font('Helvetica')
      .fontSize(7)
      .fillColor('#64748b')
      .text(`Réf. ${badgeRef}`, 28, H - 28, { width: W - 56, align: 'center' });
    doc.fontSize(7).fillColor('#64748b').text(registeredAt, 28, H - 18, { width: W - 56, align: 'center' });

    doc.end();
  });
}

module.exports = { buildVisitorBadgePdf };
