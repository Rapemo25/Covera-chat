-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    model_provider TEXT NOT NULL DEFAULT 'gemini',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_documents table
CREATE TABLE IF NOT EXISTS public.user_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    file_path TEXT NOT NULL,
    extracted_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create insurance_quotes table
CREATE TABLE IF NOT EXISTS public.insurance_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    quote_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS chat_messages_user_id_idx ON public.chat_messages (user_id);
CREATE INDEX IF NOT EXISTS user_documents_user_id_idx ON public.user_documents (user_id);
CREATE INDEX IF NOT EXISTS insurance_quotes_user_id_idx ON public.insurance_quotes (user_id);

-- Set up Row Level Security (RLS) policies
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_quotes ENABLE ROW LEVEL SECURITY;

-- Create policies for chat_messages
CREATE POLICY "Allow select for own messages" 
ON public.chat_messages FOR SELECT 
USING (auth.uid()::text = user_id);

CREATE POLICY "Allow insert for own messages" 
ON public.chat_messages FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

-- Create policies for user_documents
CREATE POLICY "Allow select for own documents" 
ON public.user_documents FOR SELECT 
USING (auth.uid()::text = user_id);

CREATE POLICY "Allow insert for own documents" 
ON public.user_documents FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

-- Create policies for insurance_quotes
CREATE POLICY "Allow select for own quotes" 
ON public.insurance_quotes FOR SELECT 
USING (auth.uid()::text = user_id);

CREATE POLICY "Allow insert for own quotes" 
ON public.insurance_quotes FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

-- Create a storage bucket for documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Allow public read access to documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents');

CREATE POLICY "Allow authenticated users to upload documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

