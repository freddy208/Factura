-- FACTURA — Rappels RLS Supabase (à adapter dans le dashboard SQL ou migrations).
-- Ce fichier ne modifie pas la base : liste des contrôles à valider manuellement.

-- profiles : lecture / mise à jour limitées au propriétaire (auth.uid() = id).
--            INSERT si vous utilisez un trigger à l'inscription ; sinon réservé service_role.

-- clients, invoices, invoice_items : SELECT / INSERT / UPDATE / DELETE uniquement
--   où user_id (sur invoices/clients) = auth.uid(), avec sous-requêtes cohérentes pour invoice_items.

-- payment_requests : INSERT par l'utilisateur connecté sur son user_id ; SELECT admin via policy séparée
--   ou lecture utilisateur sur ses propres lignes uniquement ; UPDATE réservé service_role / admin.

-- Fonctions RPC (check_quota, generate_invoice_number) : SECURITY INVOKER par défaut,
--   vérifier qu’elles ne contournent pas les policies ou passer en SECURITY DEFINER uniquement si nécessaire et audité.

-- Jamais exposer la service_role au navigateur : opérations admin via routes Next.js authentifiées uniquement.
