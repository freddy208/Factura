import { Client, Invoice, InvoiceItem } from './database.types'

// Tous les types viennent de database.types.ts
export type {
  Database,
  Profile,
  Client,
  Invoice,
  InvoiceItem,
  PaymentRequest,
  Tables,
  InsertTables,
  UpdateTables,
} from './database.types'

// Types utilitaires supplémentaires
export type Plan = 'free' | 'pro'
export type InvoiceType = 'invoice' | 'quote'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'cancelled' | 'accepted' | 'refused'
export type CompanyType = 'freelance' | 'pme' | 'agence'

// Invoice avec relations
export type InvoiceWithRelations = Invoice & {
  clients?: Client | null
  invoice_items?: InvoiceItem[]
}