-- ==============================================================================
-- Migration: 20260929000001_avero_redesign.sql
-- Description: Complete schema redesign for Avero Enterprise Retail OS & POS Engine.
-- Tables: 21 core tables covering multi-tenancy, identity, inventory, serialized
--         nodes (WADN), billing transactions, payments, credits, returns, and POS terminals.
-- ==============================================================================

-- 1. EXTENSIONS & PREREQUISITES
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. HELPER FUNCTIONS

-- Helper function: retrieve the active tenant/organization ID for the calling authenticated user
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Trigger function: manage updated_at timestamps automatically
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ==============================================================================
-- 3. TABLE DEFINITIONS
-- ==============================================================================

-- 1. ORGANIZATIONS
CREATE TABLE IF NOT EXISTS public.organizations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    code text NOT NULL UNIQUE,
    address text,
    phone text,
    email text,
    settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. PROFILES (Staff & Users linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
    full_name text NOT NULL,
    phone text,
    email text,
    role text NOT NULL DEFAULT 'cashier',
    avatar_url text,
    permissions jsonb DEFAULT '[]'::jsonb,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. CUSTOMERS
CREATE TABLE IF NOT EXISTS public.customers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name text NOT NULL,
    phone text NOT NULL,
    email text,
    available_change_credit numeric(12,2) NOT NULL DEFAULT 0.00,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_customers_org_phone UNIQUE (organization_id, phone)
);

-- 4. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    sku text NOT NULL,
    barcode text,
    name text NOT NULL,
    brand text,
    category text,
    unit text NOT NULL DEFAULT 'piece',
    base_price numeric(12,2) NOT NULL DEFAULT 0.00,
    tax_rate numeric(12,2) NOT NULL DEFAULT 0.00,
    is_serialized boolean NOT NULL DEFAULT false,
    min_stock_threshold integer NOT NULL DEFAULT 5,
    is_active boolean NOT NULL DEFAULT true,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_products_org_sku UNIQUE (organization_id, sku)
);

-- 5. BATCHES (Lots & Perishables)
CREATE TABLE IF NOT EXISTS public.batches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    batch_number text NOT NULL,
    mfg_date date,
    expiry_date date,
    distributor_return_deadline date,
    cost_price numeric(12,2) NOT NULL DEFAULT 0.00,
    mrp numeric(12,2) NOT NULL DEFAULT 0.00,
    selling_price numeric(12,2) NOT NULL DEFAULT 0.00,
    initial_qty integer NOT NULL DEFAULT 0,
    current_qty integer NOT NULL DEFAULT 0,
    supplier_name text,
    status text NOT NULL DEFAULT 'ACTIVE',
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 6. TERMINALS (POS Counters)
CREATE TABLE IF NOT EXISTS public.terminals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    terminal_code text NOT NULL,
    terminal_name text NOT NULL,
    counter_location text,
    pin_hash text NOT NULL,
    manager_pin_hash text,
    status text NOT NULL DEFAULT 'ONLINE',
    active_cashier_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    active_cashier_name text,
    allowed_operations jsonb DEFAULT '[]'::jsonb,
    last_heartbeat timestamptz,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_terminals_org_code UNIQUE (organization_id, terminal_code)
);

-- 7. WADNS (Warranty & Asset Digital Nodes / Serialized Inventory)
CREATE TABLE IF NOT EXISTS public.wadns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    wadn_code text NOT NULL UNIQUE,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    batch_id uuid REFERENCES public.batches(id) ON DELETE SET NULL,
    serial_number text,
    status text NOT NULL DEFAULT 'IN_STOCK',
    warranty_end timestamptz,
    owner_customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 8. WADN_HISTORY (Lifecycle Audit Log)
CREATE TABLE IF NOT EXISTS public.wadn_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    wadn_id uuid NOT NULL REFERENCES public.wadns(id) ON DELETE CASCADE,
    event text NOT NULL,
    detail text,
    actor text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 9. INVENTORY_MOVEMENTS (Double-entry Stock Ledger)
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    movement_number text NOT NULL,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    batch_id uuid REFERENCES public.batches(id) ON DELETE SET NULL,
    wadn_id uuid REFERENCES public.wadns(id) ON DELETE SET NULL,
    qty integer NOT NULL DEFAULT 0,
    from_state text,
    to_state text NOT NULL,
    movement_type text NOT NULL,
    reference_type text,
    reference_id text,
    reason text,
    performed_by text,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 10. SALES (Point-of-Sale Checkout Invoices)
CREATE TABLE IF NOT EXISTS public.sales (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    invoice_number text NOT NULL,
    terminal_id uuid REFERENCES public.terminals(id) ON DELETE SET NULL,
    cashier_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    cashier_name text,
    customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name text,
    customer_phone text,
    subtotal numeric(12,2) NOT NULL DEFAULT 0.00,
    discount numeric(12,2) NOT NULL DEFAULT 0.00,
    tax numeric(12,2) NOT NULL DEFAULT 0.00,
    total numeric(12,2) NOT NULL DEFAULT 0.00,
    total_paid numeric(12,2) NOT NULL DEFAULT 0.00,
    change_given numeric(12,2) NOT NULL DEFAULT 0.00,
    change_credit_issued numeric(12,2) NOT NULL DEFAULT 0.00,
    change_credit_redeemed numeric(12,2) NOT NULL DEFAULT 0.00,
    status text NOT NULL DEFAULT 'COMPLETED',
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_sales_org_invoice UNIQUE (organization_id, invoice_number)
);

-- 11. SALE_ITEMS (Sales Invoice Line Items)
CREATE TABLE IF NOT EXISTS public.sale_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id uuid NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    batch_id uuid REFERENCES public.batches(id) ON DELETE SET NULL,
    wadn_id uuid REFERENCES public.wadns(id) ON DELETE SET NULL,
    sku text NOT NULL,
    product_name text NOT NULL,
    brand text,
    category text,
    unit_price numeric(12,2) NOT NULL DEFAULT 0.00,
    qty integer NOT NULL DEFAULT 1,
    discount numeric(12,2) NOT NULL DEFAULT 0.00,
    tax_amount numeric(12,2) NOT NULL DEFAULT 0.00,
    total numeric(12,2) NOT NULL DEFAULT 0.00,
    returned_qty integer NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'COMPLETED',
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 12. PAYMENTS (Split Tender Ledger)
CREATE TABLE IF NOT EXISTS public.payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    sale_id uuid NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    method text NOT NULL,
    amount numeric(12,2) NOT NULL DEFAULT 0.00,
    status text NOT NULL DEFAULT 'COMPLETED',
    reference text,
    provider text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 13. CHANGE_CREDITS (Store Change Credit Vouchers)
CREATE TABLE IF NOT EXISTS public.change_credits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    credit_number text NOT NULL,
    customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_phone text NOT NULL,
    customer_name text,
    original_sale_id uuid REFERENCES public.sales(id) ON DELETE SET NULL,
    amount numeric(12,2) NOT NULL DEFAULT 0.00,
    balance numeric(12,2) NOT NULL DEFAULT 0.00,
    type text NOT NULL DEFAULT 'CHANGE_REMAINDER',
    status text NOT NULL DEFAULT 'ACTIVE',
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 14. RETURNS (Sales Returns Header)
CREATE TABLE IF NOT EXISTS public.returns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    return_number text NOT NULL,
    original_sale_id uuid REFERENCES public.sales(id) ON DELETE SET NULL,
    invoice_number text,
    terminal_id uuid REFERENCES public.terminals(id) ON DELETE SET NULL,
    customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_phone text,
    customer_name text,
    return_reason text,
    total_refund_amount numeric(12,2) NOT NULL DEFAULT 0.00,
    status text NOT NULL DEFAULT 'PENDING',
    authorized_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    authorizer_name text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz
);

-- 15. RETURN_ITEMS (Sales Return Item Lines)
CREATE TABLE IF NOT EXISTS public.return_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    return_id uuid NOT NULL REFERENCES public.returns(id) ON DELETE CASCADE,
    sale_item_id uuid REFERENCES public.sale_items(id) ON DELETE SET NULL,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    batch_id uuid REFERENCES public.batches(id) ON DELETE SET NULL,
    wadn_id uuid REFERENCES public.wadns(id) ON DELETE SET NULL,
    product_name text NOT NULL,
    sku text NOT NULL,
    qty integer NOT NULL DEFAULT 1,
    return_unit_price numeric(12,2) NOT NULL DEFAULT 0.00,
    refund_amount numeric(12,2) NOT NULL DEFAULT 0.00,
    reason text,
    condition text,
    disposition text,
    status text NOT NULL DEFAULT 'PENDING',
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 16. REFUNDS (Disbursement Transactions)
CREATE TABLE IF NOT EXISTS public.refunds (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    refund_number text NOT NULL,
    return_id uuid REFERENCES public.returns(id) ON DELETE CASCADE,
    sale_id uuid REFERENCES public.sales(id) ON DELETE SET NULL,
    customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_phone text,
    method text NOT NULL,
    amount numeric(12,2) NOT NULL DEFAULT 0.00,
    status text NOT NULL DEFAULT 'COMPLETED',
    reference text,
    provider text,
    original_tender_breakdown jsonb DEFAULT '{}'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 17. POS_SESSIONS (Terminal Cashier Shifts)
CREATE TABLE IF NOT EXISTS public.pos_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    terminal_id uuid NOT NULL REFERENCES public.terminals(id) ON DELETE CASCADE,
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    cashier_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    cashier_name text,
    is_manager boolean NOT NULL DEFAULT false,
    session_token text NOT NULL UNIQUE,
    started_at timestamptz NOT NULL DEFAULT now(),
    ended_at timestamptz,
    status text NOT NULL DEFAULT 'ACTIVE'
);

-- 18. AUDIT_LOGS (Enterprise Audit Trail)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    entity_type text NOT NULL,
    entity_id text,
    event text NOT NULL,
    detail text,
    actor_id text,
    actor_name text,
    ip_address text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 19. INVOICE_SEQUENCES (Atomic Counters per Organization)
CREATE TABLE IF NOT EXISTS public.invoice_sequences (
    organization_id uuid PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
    sale_prefix text NOT NULL DEFAULT 'INV',
    sale_counter integer NOT NULL DEFAULT 1000,
    return_prefix text NOT NULL DEFAULT 'RET',
    return_counter integer NOT NULL DEFAULT 1000,
    refund_prefix text NOT NULL DEFAULT 'REF',
    refund_counter integer NOT NULL DEFAULT 1000,
    credit_prefix text NOT NULL DEFAULT 'CCR',
    credit_counter integer NOT NULL DEFAULT 1000,
    movement_prefix text NOT NULL DEFAULT 'MOV',
    movement_counter integer NOT NULL DEFAULT 1000
);

-- 20. PAYMENT_PROVIDERS (Integrated Payment Configurations)
CREATE TABLE IF NOT EXISTS public.payment_providers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    provider_key text NOT NULL,
    display_name text NOT NULL,
    config jsonb DEFAULT '{}'::jsonb,
    is_active boolean NOT NULL DEFAULT true,
    supported_methods jsonb DEFAULT '[]'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 21. SALVAGE_TICKETS (Perishable & Markdown Management)
CREATE TABLE IF NOT EXISTS public.salvage_tickets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    batch_id uuid REFERENCES public.batches(id) ON DELETE SET NULL,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    ticket_type text NOT NULL,
    qty integer NOT NULL DEFAULT 0,
    recoverable_value numeric(12,2) NOT NULL DEFAULT 0.00,
    deadline timestamptz,
    supplier_name text,
    status text NOT NULL DEFAULT 'OPEN',
    notes text,
    assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz
);

-- ==============================================================================
-- 4. PERFORMANCE INDEXES
-- ==============================================================================

-- Organizations
CREATE INDEX IF NOT EXISTS idx_organizations_code ON public.organizations (code);

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_org ON public.profiles (organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);

-- Customers
CREATE INDEX IF NOT EXISTS idx_customers_org ON public.customers (organization_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers (phone);

-- Products
CREATE INDEX IF NOT EXISTS idx_products_org ON public.products (organization_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products (sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products (barcode);

-- Batches
CREATE INDEX IF NOT EXISTS idx_batches_org ON public.batches (organization_id);
CREATE INDEX IF NOT EXISTS idx_batches_product ON public.batches (product_id);
CREATE INDEX IF NOT EXISTS idx_batches_status ON public.batches (status);
CREATE INDEX IF NOT EXISTS idx_batches_expiry ON public.batches (expiry_date);

-- Terminals
CREATE INDEX IF NOT EXISTS idx_terminals_org ON public.terminals (organization_id);
CREATE INDEX IF NOT EXISTS idx_terminals_status ON public.terminals (status);

-- WADNs
CREATE INDEX IF NOT EXISTS idx_wadns_org ON public.wadns (organization_id);
CREATE INDEX IF NOT EXISTS idx_wadns_code ON public.wadns (wadn_code);
CREATE INDEX IF NOT EXISTS idx_wadns_product ON public.wadns (product_id);
CREATE INDEX IF NOT EXISTS idx_wadns_batch ON public.wadns (batch_id);
CREATE INDEX IF NOT EXISTS idx_wadns_status ON public.wadns (status);
CREATE INDEX IF NOT EXISTS idx_wadns_customer ON public.wadns (owner_customer_id);

-- WADN History
CREATE INDEX IF NOT EXISTS idx_wadn_history_wadn ON public.wadn_history (wadn_id);
CREATE INDEX IF NOT EXISTS idx_wadn_history_created ON public.wadn_history (created_at);

-- Inventory Movements
CREATE INDEX IF NOT EXISTS idx_movements_org ON public.inventory_movements (organization_id);
CREATE INDEX IF NOT EXISTS idx_movements_product ON public.inventory_movements (product_id);
CREATE INDEX IF NOT EXISTS idx_movements_batch ON public.inventory_movements (batch_id);
CREATE INDEX IF NOT EXISTS idx_movements_created ON public.inventory_movements (created_at);

-- Sales
CREATE INDEX IF NOT EXISTS idx_sales_org ON public.sales (organization_id);
CREATE INDEX IF NOT EXISTS idx_sales_invoice ON public.sales (invoice_number);
CREATE INDEX IF NOT EXISTS idx_sales_terminal ON public.sales (terminal_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON public.sales (customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_phone ON public.sales (customer_phone);
CREATE INDEX IF NOT EXISTS idx_sales_status ON public.sales (status);
CREATE INDEX IF NOT EXISTS idx_sales_created ON public.sales (created_at);

-- Sale Items
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON public.sale_items (sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product ON public.sale_items (product_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_batch ON public.sale_items (batch_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_wadn ON public.sale_items (wadn_id);

-- Payments
CREATE INDEX IF NOT EXISTS idx_payments_org ON public.payments (organization_id);
CREATE INDEX IF NOT EXISTS idx_payments_sale ON public.payments (sale_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments (status);
CREATE INDEX IF NOT EXISTS idx_payments_created ON public.payments (created_at);

-- Change Credits
CREATE INDEX IF NOT EXISTS idx_change_credits_org ON public.change_credits (organization_id);
CREATE INDEX IF NOT EXISTS idx_change_credits_customer ON public.change_credits (customer_id);
CREATE INDEX IF NOT EXISTS idx_change_credits_phone ON public.change_credits (customer_phone);
CREATE INDEX IF NOT EXISTS idx_change_credits_sale ON public.change_credits (original_sale_id);
CREATE INDEX IF NOT EXISTS idx_change_credits_status ON public.change_credits (status);

-- Returns
CREATE INDEX IF NOT EXISTS idx_returns_org ON public.returns (organization_id);
CREATE INDEX IF NOT EXISTS idx_returns_sale ON public.returns (original_sale_id);
CREATE INDEX IF NOT EXISTS idx_returns_customer ON public.returns (customer_id);
CREATE INDEX IF NOT EXISTS idx_returns_status ON public.returns (status);
CREATE INDEX IF NOT EXISTS idx_returns_created ON public.returns (created_at);

-- Return Items
CREATE INDEX IF NOT EXISTS idx_return_items_return ON public.return_items (return_id);
CREATE INDEX IF NOT EXISTS idx_return_items_product ON public.return_items (product_id);
CREATE INDEX IF NOT EXISTS idx_return_items_batch ON public.return_items (batch_id);
CREATE INDEX IF NOT EXISTS idx_return_items_sale_item ON public.return_items (sale_item_id);

-- Refunds
CREATE INDEX IF NOT EXISTS idx_refunds_org ON public.refunds (organization_id);
CREATE INDEX IF NOT EXISTS idx_refunds_return ON public.refunds (return_id);
CREATE INDEX IF NOT EXISTS idx_refunds_sale ON public.refunds (sale_id);
CREATE INDEX IF NOT EXISTS idx_refunds_customer ON public.refunds (customer_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON public.refunds (status);
CREATE INDEX IF NOT EXISTS idx_refunds_created ON public.refunds (created_at);

-- POS Sessions
CREATE INDEX IF NOT EXISTS idx_pos_sessions_terminal ON public.pos_sessions (terminal_id);
CREATE INDEX IF NOT EXISTS idx_pos_sessions_org ON public.pos_sessions (organization_id);
CREATE INDEX IF NOT EXISTS idx_pos_sessions_status ON public.pos_sessions (status);

-- Audit Logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON public.audit_logs (organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs (created_at);

-- Payment Providers
CREATE INDEX IF NOT EXISTS idx_payment_providers_org ON public.payment_providers (organization_id);

-- Salvage Tickets
CREATE INDEX IF NOT EXISTS idx_salvage_tickets_org ON public.salvage_tickets (organization_id);
CREATE INDEX IF NOT EXISTS idx_salvage_tickets_product ON public.salvage_tickets (product_id);
CREATE INDEX IF NOT EXISTS idx_salvage_tickets_batch ON public.salvage_tickets (batch_id);
CREATE INDEX IF NOT EXISTS idx_salvage_tickets_status ON public.salvage_tickets (status);

-- ==============================================================================
-- 5. UPDATED_AT TRIGGERS
-- ==============================================================================

DROP TRIGGER IF EXISTS trg_organizations_updated_at ON public.organizations;
CREATE TRIGGER trg_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_customers_updated_at ON public.customers;
CREATE TRIGGER trg_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_batches_updated_at ON public.batches;
CREATE TRIGGER trg_batches_updated_at
    BEFORE UPDATE ON public.batches
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_terminals_updated_at ON public.terminals;
CREATE TRIGGER trg_terminals_updated_at
    BEFORE UPDATE ON public.terminals
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_wadns_updated_at ON public.wadns;
CREATE TRIGGER trg_wadns_updated_at
    BEFORE UPDATE ON public.wadns
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_change_credits_updated_at ON public.change_credits;
CREATE TRIGGER trg_change_credits_updated_at
    BEFORE UPDATE ON public.change_credits
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- 1. organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organizations_org_isolation ON public.organizations;
CREATE POLICY organizations_org_isolation ON public.organizations
    FOR ALL
    TO authenticated
    USING (id = public.get_user_org_id())
    WITH CHECK (id = public.get_user_org_id());

-- 2. profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS profiles_org_isolation ON public.profiles;
CREATE POLICY profiles_org_isolation ON public.profiles
    FOR ALL
    TO authenticated
    USING (organization_id = public.get_user_org_id() OR id = auth.uid())
    WITH CHECK (organization_id = public.get_user_org_id() OR id = auth.uid());

-- 3. customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS customers_org_isolation ON public.customers;
CREATE POLICY customers_org_isolation ON public.customers
    FOR ALL
    TO authenticated
    USING (organization_id = public.get_user_org_id())
    WITH CHECK (organization_id = public.get_user_org_id());

-- 4. products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS products_org_isolation ON public.products;
CREATE POLICY products_org_isolation ON public.products
    FOR ALL
    TO authenticated
    USING (organization_id = public.get_user_org_id())
    WITH CHECK (organization_id = public.get_user_org_id());

-- 5. batches
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS batches_org_isolation ON public.batches;
CREATE POLICY batches_org_isolation ON public.batches
    FOR ALL
    TO authenticated
    USING (organization_id = public.get_user_org_id())
    WITH CHECK (organization_id = public.get_user_org_id());

-- 6. terminals
ALTER TABLE public.terminals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS terminals_org_isolation ON public.terminals;
CREATE POLICY terminals_org_isolation ON public.terminals
    FOR ALL
    TO authenticated
    USING (organization_id = public.get_user_org_id())
    WITH CHECK (organization_id = public.get_user_org_id());

-- 7. wadns
ALTER TABLE public.wadns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS wadns_org_isolation ON public.wadns;
CREATE POLICY wadns_org_isolation ON public.wadns
    FOR ALL
    TO authenticated
    USING (organization_id = public.get_user_org_id())
    WITH CHECK (organization_id = public.get_user_org_id());

-- 8. wadn_history
ALTER TABLE public.wadn_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS wadn_history_org_isolation ON public.wadn_history;
CREATE POLICY wadn_history_org_isolation ON public.wadn_history
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.wadns
            WHERE wadns.id = wadn_history.wadn_id
              AND wadns.organization_id = public.get_user_org_id()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.wadns
            WHERE wadns.id = wadn_history.wadn_id
              AND wadns.organization_id = public.get_user_org_id()
        )
    );

-- 9. inventory_movements
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS inventory_movements_org_isolation ON public.inventory_movements;
CREATE POLICY inventory_movements_org_isolation ON public.inventory_movements
    FOR ALL
    TO authenticated
    USING (organization_id = public.get_user_org_id())
    WITH CHECK (organization_id = public.get_user_org_id());

-- 10. sales
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sales_org_isolation ON public.sales;
CREATE POLICY sales_org_isolation ON public.sales
    FOR ALL
    TO authenticated
    USING (organization_id = public.get_user_org_id())
    WITH CHECK (organization_id = public.get_user_org_id());

-- 11. sale_items
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sale_items_org_isolation ON public.sale_items;
CREATE POLICY sale_items_org_isolation ON public.sale_items
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.sales
            WHERE sales.id = sale_items.sale_id
              AND sales.organization_id = public.get_user_org_id()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.sales
            WHERE sales.id = sale_items.sale_id
              AND sales.organization_id = public.get_user_org_id()
        )
    );

-- 12. payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS payments_org_isolation ON public.payments;
CREATE POLICY payments_org_isolation ON public.payments
    FOR ALL
    TO authenticated
    USING (organization_id = public.get_user_org_id())
    WITH CHECK (organization_id = public.get_user_org_id());

-- 13. change_credits
ALTER TABLE public.change_credits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS change_credits_org_isolation ON public.change_credits;
CREATE POLICY change_credits_org_isolation ON public.change_credits
    FOR ALL
    TO authenticated
    USING (organization_id = public.get_user_org_id())
    WITH CHECK (organization_id = public.get_user_org_id());

-- 14. returns
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS returns_org_isolation ON public.returns;
CREATE POLICY returns_org_isolation ON public.returns
    FOR ALL
    TO authenticated
    USING (organization_id = public.get_user_org_id())
    WITH CHECK (organization_id = public.get_user_org_id());

-- 15. return_items
ALTER TABLE public.return_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS return_items_org_isolation ON public.return_items;
CREATE POLICY return_items_org_isolation ON public.return_items
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.returns
            WHERE returns.id = return_items.return_id
              AND returns.organization_id = public.get_user_org_id()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.returns
            WHERE returns.id = return_items.return_id
              AND returns.organization_id = public.get_user_org_id()
        )
    );

-- 16. refunds
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS refunds_org_isolation ON public.refunds;
CREATE POLICY refunds_org_isolation ON public.refunds
    FOR ALL
    TO authenticated
    USING (organization_id = public.get_user_org_id())
    WITH CHECK (organization_id = public.get_user_org_id());

-- 17. pos_sessions
ALTER TABLE public.pos_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pos_sessions_org_isolation ON public.pos_sessions;
CREATE POLICY pos_sessions_org_isolation ON public.pos_sessions
    FOR ALL
    TO authenticated
    USING (organization_id = public.get_user_org_id())
    WITH CHECK (organization_id = public.get_user_org_id());

-- 18. audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS audit_logs_org_isolation ON public.audit_logs;
CREATE POLICY audit_logs_org_isolation ON public.audit_logs
    FOR ALL
    TO authenticated
    USING (organization_id = public.get_user_org_id())
    WITH CHECK (organization_id = public.get_user_org_id());

-- 19. invoice_sequences
ALTER TABLE public.invoice_sequences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS invoice_sequences_org_isolation ON public.invoice_sequences;
CREATE POLICY invoice_sequences_org_isolation ON public.invoice_sequences
    FOR ALL
    TO authenticated
    USING (organization_id = public.get_user_org_id())
    WITH CHECK (organization_id = public.get_user_org_id());

-- 20. payment_providers
ALTER TABLE public.payment_providers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS payment_providers_org_isolation ON public.payment_providers;
CREATE POLICY payment_providers_org_isolation ON public.payment_providers
    FOR ALL
    TO authenticated
    USING (organization_id = public.get_user_org_id())
    WITH CHECK (organization_id = public.get_user_org_id());

-- 21. salvage_tickets
ALTER TABLE public.salvage_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS salvage_tickets_org_isolation ON public.salvage_tickets;
CREATE POLICY salvage_tickets_org_isolation ON public.salvage_tickets
    FOR ALL
    TO authenticated
    USING (organization_id = public.get_user_org_id())
    WITH CHECK (organization_id = public.get_user_org_id());
