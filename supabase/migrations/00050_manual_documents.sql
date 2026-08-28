create table if not exists manual_documents (
  id uuid primary key default gen_random_uuid(),
  document_type text not null check (document_type in ('invoice', 'receipt')),
  document_number text not null,
  customer_name text not null,
  customer_email text,
  customer_phone text,
  customer_address text,
  property_id uuid references properties(id) on delete set null,
  property_ref text,
  property_name text,
  document_date text,
  total_amount numeric,
  form_data jsonb not null,
  pdf_path text not null,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists manual_documents_type_created_idx
  on manual_documents (document_type, created_at desc);

create index if not exists manual_documents_number_idx
  on manual_documents (document_number);

create index if not exists manual_documents_property_ref_idx
  on manual_documents (property_ref);

alter table manual_documents enable row level security;

create policy "Admins can view manual documents"
  on manual_documents for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

insert into storage.buckets (id, name, public)
values ('manual-documents', 'manual-documents', false)
on conflict do nothing;
