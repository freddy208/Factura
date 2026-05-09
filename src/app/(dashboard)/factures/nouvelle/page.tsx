import InvoiceForm from '@/components/invoices/InvoiceForm'

export default async function NouvelleFacturePage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>
}) {
  const { client } = await searchParams
  return <InvoiceForm type="invoice" defaultClientId={client} />
}