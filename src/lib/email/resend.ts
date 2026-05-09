import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'FACTURA <noreply@factura.app>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

function baseTemplate(content: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body style="margin:0;padding:0;background:#F9FAFB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;
                  border:1px solid #E5E7EB;overflow:hidden;">
        <!-- Header -->
        <div style="background:#2563EB;padding:24px 32px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:32px;height:32px;background:rgba(255,255,255,0.2);
                        border-radius:8px;display:flex;align-items:center;
                        justify-content:center;">
              <span style="color:white;font-weight:bold;font-size:14px;">F</span>
            </div>
            <span style="color:white;font-weight:bold;font-size:18px;">FACTURA</span>
          </div>
        </div>
        <!-- Content -->
        <div style="padding:32px;">
          ${content}
        </div>
        <!-- Footer -->
        <div style="padding:16px 32px;border-top:1px solid #F3F4F6;
                    text-align:center;">
          <p style="color:#9CA3AF;font-size:12px;margin:0;">
            FACTURA — Devis et factures professionnels
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Bienvenue sur FACTURA 🎉',
      html: baseTemplate(`
        <h2 style="color:#111827;font-size:22px;font-weight:700;margin:0 0 8px;">
          Bienvenue ${name} 👋
        </h2>
        <p style="color:#6B7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
          Votre compte FACTURA est prêt. Créez votre première facture
          professionnelle en moins de 2 minutes.
        </p>
        <a href="${APP_URL}/dashboard"
           style="display:inline-block;background:#2563EB;color:white;
                  font-weight:600;font-size:15px;padding:14px 28px;
                  border-radius:12px;text-decoration:none;">
          Accéder au dashboard →
        </a>
        <div style="margin-top:32px;padding:16px;background:#F9FAFB;
                    border-radius:12px;border:1px solid #E5E7EB;">
          <p style="color:#374151;font-size:13px;font-weight:600;margin:0 0 8px;">
            Plan Gratuit inclus :
          </p>
          <p style="color:#6B7280;font-size:13px;margin:0;line-height:1.6;">
            ✓ 5 factures / mois<br>
            ✓ 5 devis / mois<br>
            ✓ Génération PDF
          </p>
        </div>
      `),
    })
  } catch (err) {
    console.error('sendWelcomeEmail error:', err)
  }
}

export async function sendProActivationEmail(email: string, companyName: string) {
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: '✅ Votre compte Pro est activé !',
      html: baseTemplate(`
        <div style="text-align:center;margin-bottom:24px;">
          <div style="width:56px;height:56px;background:#DCFCE7;border-radius:50%;
                      display:inline-flex;align-items:center;justify-content:center;
                      font-size:24px;">
            ✅
          </div>
        </div>
        <h2 style="color:#111827;font-size:22px;font-weight:700;
                   margin:0 0 8px;text-align:center;">
          Compte Pro activé !
        </h2>
        <p style="color:#6B7280;font-size:15px;line-height:1.6;
                  margin:0 0 24px;text-align:center;">
          ${companyName}, votre compte FACTURA Pro est maintenant actif.
          Profitez de toutes les fonctionnalités sans limite.
        </p>
        <a href="${APP_URL}/dashboard"
           style="display:block;background:#2563EB;color:white;font-weight:600;
                  font-size:15px;padding:14px 28px;border-radius:12px;
                  text-decoration:none;text-align:center;">
          Accéder au dashboard Pro →
        </a>
        <div style="margin-top:24px;padding:16px;background:#EFF6FF;
                    border-radius:12px;border:1px solid #BFDBFE;">
          <p style="color:#1D4ED8;font-size:13px;font-weight:600;margin:0 0 8px;">
            Maintenant disponible :
          </p>
          <p style="color:#1E40AF;font-size:13px;margin:0;line-height:1.8;">
            ✓ Factures et devis illimités<br>
            ✓ PDF sans watermark<br>
            ✓ Conversion devis → facture<br>
            ✓ Dashboard complet
          </p>
        </div>
      `),
    })
  } catch (err) {
    console.error('sendProActivationEmail error:', err)
  }
}

export async function sendPaymentNotifToAdmin(
  userEmail: string,
  companyName: string,
  adminEmail: string
) {
  try {
    await resend.emails.send({
      from: FROM,
      to: adminEmail,
      subject: `💰 Nouvelle demande Pro — ${companyName}`,
      html: baseTemplate(`
        <h2 style="color:#111827;font-size:20px;font-weight:700;margin:0 0 16px;">
          Nouvelle demande de passage en Pro
        </h2>
        <div style="background:#F9FAFB;border-radius:12px;padding:16px;
                    border:1px solid #E5E7EB;margin-bottom:24px;">
          <p style="margin:0 0 8px;font-size:14px;">
            <span style="color:#6B7280;">Entreprise :</span>
            <strong style="color:#111827;"> ${companyName}</strong>
          </p>
          <p style="margin:0;font-size:14px;">
            <span style="color:#6B7280;">Email :</span>
            <strong style="color:#111827;"> ${userEmail}</strong>
          </p>
        </div>
        <a href="${APP_URL}/admin"
           style="display:block;background:#2563EB;color:white;font-weight:600;
                  font-size:15px;padding:14px 28px;border-radius:12px;
                  text-decoration:none;text-align:center;">
          Gérer dans l'admin panel →
        </a>
      `),
    })
  } catch (err) {
    console.error('sendPaymentNotifToAdmin error:', err)
  }
}

export async function sendInvoiceSentEmail(
  clientEmail: string,
  clientName: string,
  invoiceNumber: string,
  total: string,
  senderCompany: string
) {
  try {
    await resend.emails.send({
      from: FROM,
      to: clientEmail,
      subject: `Facture ${invoiceNumber} — ${senderCompany}`,
      html: baseTemplate(`
        <h2 style="color:#111827;font-size:20px;font-weight:700;margin:0 0 8px;">
          Bonjour ${clientName},
        </h2>
        <p style="color:#6B7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
          ${senderCompany} vous a envoyé la facture
          <strong>${invoiceNumber}</strong> d'un montant de
          <strong>${total}</strong>.
        </p>
        <div style="background:#F9FAFB;border-radius:12px;padding:20px;
                    border:1px solid #E5E7EB;text-align:center;">
          <p style="color:#374151;font-size:14px;margin:0 0 4px;">Montant à régler</p>
          <p style="color:#2563EB;font-size:28px;font-weight:700;margin:0;">
            ${total}
          </p>
        </div>
      `),
    })
  } catch (err) {
    console.error('sendInvoiceSentEmail error:', err)
  }
}