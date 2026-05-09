import InvoiceForm from '@/components/invoices/InvoiceForm'

export default async function NouveauDevisPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>
}) {
  const { client } = await searchParams
  return <InvoiceForm type="quote" defaultClientId={client} />
}