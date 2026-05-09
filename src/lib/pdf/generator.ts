import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export async function generateInvoicePDF(
  invoice: any,
  profile: any,
  isPro: boolean
) {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
  const pageW = 210
  const blue: [number, number, number] = [37, 99, 235]
  const indigo: [number, number, number] = [79, 70, 229]
  const dark: [number, number, number] = [17, 24, 39]
  const gray: [number, number, number] = [107, 114, 128]
  const lightGray: [number, number, number] = [249, 250, 251]
  const borderGray: [number, number, number] = [229, 231, 235]

  const headerColor = invoice.type === 'invoice' ? blue : indigo
  const marginX = 14
  const usableW = pageW - marginX * 2 // 182 mm

  // ── FIX #1 : remplace l'espace fine insécable (U+202F) par un espace normal ──
  function fCurrency(amount: number) {
    const fmt = (n: number) =>
      new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
        .format(Math.round(n))
        .replace(/\u202f/g, ' ') // ← supprime le caractère qui devient "/"

    if (invoice.currency === 'XAF') {
      return fmt(amount) + ' FCFA'
    }
    return (
      new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: invoice.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
        .format(amount)
        .replace(/\u202f/g, ' ') // ← idem ici
    )
  }

  // ── Header ──
  doc.setFillColor(...headerColor)
  doc.rect(0, 0, pageW, 52, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(profile?.company_name || 'Factura', marginX, 20)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  let infoY = 27
  if (profile?.email) { doc.text(profile.email, marginX, infoY); infoY += 5 }
  if (profile?.phone) { doc.text(profile.phone, marginX, infoY); infoY += 5 }
  if (profile?.address) { doc.text(profile.address, marginX, infoY) }

  // Numéro à droite
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(invoice.type === 'invoice' ? 'FACTURE' : 'DEVIS', pageW - marginX, 18, { align: 'right' })
  doc.setFontSize(16)
  doc.text(invoice.number, pageW - marginX, 28, { align: 'right' })
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(fCurrency(invoice.total), pageW - marginX, 38, { align: 'right' })

  // ── DE / À ──
  doc.setFillColor(...lightGray)
  doc.rect(marginX, 60, usableW, 36, 'F')
  doc.setDrawColor(...headerColor)
  doc.setLineWidth(0.5)
  doc.line(marginX, 60, pageW - marginX, 60)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...gray)
  doc.text('ÉMETTEUR', 18, 69)
  doc.text('DESTINATAIRE', 112, 69)

  // Émetteur
  let deY = 76
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...dark)
  if (profile?.company_name) { doc.text(profile.company_name, 18, deY); deY += 6 }
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...gray)
  if (profile?.email) { doc.text(profile.email, 18, deY); deY += 5 }
  if (profile?.phone) { doc.text(profile.phone, 18, deY); deY += 5 }
  if (profile?.address) { doc.text(profile.address, 18, deY) }

  // Destinataire
  let aY = 76
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...dark)
  if (invoice.clients?.name) { doc.text(invoice.clients.name, 112, aY); aY += 6 }
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...gray)
  if (invoice.clients?.company) { doc.text(invoice.clients.company, 112, aY); aY += 5 }
  if (invoice.clients?.email) { doc.text(invoice.clients.email, 112, aY); aY += 5 }
  if (invoice.clients?.phone) { doc.text(invoice.clients.phone, 112, aY); aY += 5 }
  if (invoice.clients?.address) { doc.text(invoice.clients.address, 112, aY) }
  if (!invoice.clients) {
    doc.setTextColor(...gray)
    doc.text('Sans client', 112, aY)
  }

  // ── Dates ──
  doc.setFillColor(...borderGray)
  doc.rect(marginX, 102, usableW, 14, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...gray)
  doc.text("DATE D'ÉMISSION", 18, 109)
  doc.text("DATE D'ÉCHÉANCE", 82, 109)
  doc.text('STATUT', 152, 109)

  const statusLabels: Record<string, string> = {
    draft: 'Brouillon',
    sent: 'Envoyée',
    paid: 'Payée',
    cancelled: 'Annulée',
    accepted: 'Acceptée',
    refused: 'Refusée',
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...dark)
  doc.text(invoice.issue_date || '', 18, 113)
  doc.text(invoice.due_date || 'À réception', 82, 113)
  doc.text(statusLabels[invoice.status] || invoice.status, 152, 113)

  // ── Tableau ──
  const items =
    invoice.invoice_items
      ?.sort((a: any, b: any) => a.position - b.position)
      .map((item: any) => [
        item.description,
        String(item.quantity),
        fCurrency(item.unit_price),
        fCurrency(item.total),
      ]) || []

  // ── FIX #2 : largeurs ajustées pour ne pas dépasser 182 mm ──
  autoTable(doc, {
    startY: 122,
    head: [['Description', 'Qté', 'Prix unitaire', 'Total']],
    body: items,
    headStyles: {
      fillColor: headerColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
      cellPadding: 4,
    },
    bodyStyles: {
      fontSize: 10,
      textColor: dark,
      cellPadding: 4,
      valign: 'middle',
      lineColor: borderGray,
      lineWidth: 0.1,
    },
    alternateRowStyles: {
      fillColor: lightGray,
    },
    columnStyles: {
      0: { cellWidth: 75, halign: 'left' },   // Description
      1: { cellWidth: 20, halign: 'center' }, // Qté
      2: { cellWidth: 45, halign: 'right' },  // Prix unitaire
      3: { cellWidth: 42, halign: 'right' },  // Total  ← un peu plus large
    },
    margin: { left: marginX, right: marginX },
    tableWidth: usableW, // ← FIX #3 : force la largeur exacte
    styles: {
      overflow: 'linebreak', // ← évite que le texte déborde
    },
  })

  const finalY = (doc as any).lastAutoTable.finalY + 8

  // ── Totaux ──
  const totX = 135
  const boxH = invoice.tax_rate > 0 ? 36 : 26

  doc.setFillColor(...lightGray)
  doc.rect(totX - 6, finalY - 4, pageW - totX - marginX + 2, boxH, 'F')

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...gray)
  doc.text('Sous-total', totX, finalY + 4)
  doc.text(fCurrency(invoice.subtotal), pageW - marginX, finalY + 4, { align: 'right' })

  if (invoice.tax_rate > 0) {
    doc.text(`TVA (${invoice.tax_rate}%)`, totX, finalY + 13)
    doc.text(fCurrency(invoice.tax_amount), pageW - marginX, finalY + 13, { align: 'right' })
  }

  // Total final
  const totalY = finalY + (invoice.tax_rate > 0 ? 22 : 12)
  doc.setFillColor(...headerColor)
  doc.rect(totX - 6, totalY - 4, pageW - totX - marginX + 8, 14, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('TOTAL', totX, totalY + 4)
  doc.setFontSize(11)
  doc.text(fCurrency(invoice.total), pageW - marginX, totalY + 4, { align: 'right' })

  // ── Notes ──
  if (invoice.notes) {
    const notesY = totalY + 18
    doc.setFillColor(...lightGray)
    doc.rect(marginX, notesY, usableW, 20, 'F')
    doc.setDrawColor(...headerColor)
    doc.setLineWidth(0.5)
    doc.line(marginX, notesY, marginX, notesY + 20)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(...gray)
    doc.text('NOTES', 18, notesY + 7)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...dark)
    const lines = doc.splitTextToSize(invoice.notes, usableW - 8)
    lines.slice(0, 2).forEach((line: string, i: number) => {
      doc.text(line, 18, notesY + 14 + i * 4)
    })
  }

  // ── Watermark plan free ──
  if (!isPro) {
    doc.setTextColor(210, 210, 210)
    doc.setFontSize(50)
    doc.setFont('helvetica', 'bold')
    doc.text('FACTURA FREE', 105, 190, {
      align: 'center',
      angle: 45,
    })
  }

  // ── Footer ──
  doc.setDrawColor(...borderGray)
  doc.setLineWidth(0.3)
  doc.line(marginX, 280, pageW - marginX, 280)

  doc.setTextColor(...gray)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text(
    `Généré le ${new Date().toLocaleDateString('fr-FR')} — Factura`,
    pageW / 2,
    285,
    { align: 'center' }
  )

  return doc
}