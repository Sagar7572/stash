-- Run this in Supabase SQL Editor to add keywords column
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS keywords text[] DEFAULT '{}';
