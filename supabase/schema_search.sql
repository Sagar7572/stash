-- Run this in Supabase SQL Editor to fix full-text search

-- 1. Add the generated tsvector column if it doesn't exist
ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', 
      coalesce(title, '') || ' ' ||
      coalesce(summary, '') || ' ' ||
      coalesce(array_to_string(keywords, ' '), '')
    )
  ) STORED;

-- 2. Backfill existing rows (in case GENERATED ALWAYS didn't populate existing rows)
UPDATE public.items
SET search_vector = to_tsvector('english',
  coalesce(title, '') || ' ' ||
  coalesce(summary, '') || ' ' ||
  coalesce(array_to_string(keywords, ' '), '')
)
WHERE search_vector IS NULL;

-- 3. Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS items_search_vector_idx
  ON public.items USING gin (search_vector);

-- 4. Notify PostgREST to reload schema (so the new column is recognized)
NOTIFY pgrst, 'reload schema';

-- 5. Optional: enable pg_trgm for partial word matching on title
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- CREATE INDEX IF NOT EXISTS items_title_trgm_idx
--   ON public.items USING gin (title gin_trgm_ops);

-- Verify the column exists and has data:
-- SELECT id, title, search_vector FROM public.items WHERE title ILIKE '%guide%' LIMIT 5;