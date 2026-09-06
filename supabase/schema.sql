-- ====================================================================
-- FIFA CARDZ — Supabase Realtime Database Schema Migration
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (User Accounts & Wallet Linkage)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  wallet_address TEXT UNIQUE,
  username TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'player' CHECK (role IN ('player', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. MARKETPLACE LISTINGS TABLE
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id TEXT UNIQUE NOT NULL,
  token_id TEXT NOT NULL,
  nft_contract TEXT,
  seller_address TEXT NOT NULL,
  price_wei TEXT NOT NULL,
  price_eth TEXT,
  name TEXT NOT NULL,
  position TEXT DEFAULT 'ST',
  overall INTEGER DEFAULT 90,
  rarity TEXT DEFAULT 'Rare',
  color TEXT DEFAULT '#9333ea',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. USER CARDS TABLE (Owned NFTs)
CREATE TABLE IF NOT EXISTS public.user_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token_id TEXT NOT NULL,
  owner_address TEXT NOT NULL,
  name TEXT NOT NULL,
  position TEXT DEFAULT 'ST',
  overall INTEGER DEFAULT 90,
  rarity TEXT DEFAULT 'Rare',
  color TEXT DEFAULT '#9333ea',
  active BOOLEAN DEFAULT FALSE,
  listing_id TEXT,
  price TEXT DEFAULT '0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. GAME ROOMS TABLE (Multiplayer Match Rooms)
CREATE TABLE IF NOT EXISTS public.game_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT UNIQUE NOT NULL,
  host_address TEXT NOT NULL,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'quiz', 'draft', 'finished')),
  players JSONB DEFAULT '[]'::jsonb,
  current_round INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all users & authenticated clients
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Read Marketplace Listings" ON public.marketplace_listings FOR SELECT USING (true);
CREATE POLICY "Public Read User Cards" ON public.user_cards FOR SELECT USING (true);
CREATE POLICY "Public Read Game Rooms" ON public.game_rooms FOR SELECT USING (true);

-- Allow write/insert/update access for marketplace & game operations
CREATE POLICY "Allow All Insert Profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow All Update Profiles" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Allow All Insert Listings" ON public.marketplace_listings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow All Update Listings" ON public.marketplace_listings FOR UPDATE USING (true);
CREATE POLICY "Allow All Delete Listings" ON public.marketplace_listings FOR DELETE USING (true);

CREATE POLICY "Allow All Insert User Cards" ON public.user_cards FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow All Update User Cards" ON public.user_cards FOR UPDATE USING (true);
CREATE POLICY "Allow All Delete User Cards" ON public.user_cards FOR DELETE USING (true);

CREATE POLICY "Allow All Insert Game Rooms" ON public.game_rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow All Update Game Rooms" ON public.game_rooms FOR UPDATE USING (true);

-- ====================================================================
-- ENABLE SUPABASE REALTIME REPLICATION
-- ====================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.marketplace_listings, public.user_cards, public.game_rooms;
  END IF;
END $$;
