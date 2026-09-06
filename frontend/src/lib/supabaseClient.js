import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://romvffutofykdbcqfnxq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvbXZmZnV0b2Z5a2RiY3FmbnhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0MjQ3MTYsImV4cCI6MjEwNDAwMDcxNn0.sYOmn8I5kzZIQD0zST54uVu2dpzNASvOj-hYkDyeb5A';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ====================================================================
// SUPABASE DATABASE HELPER FUNCTIONS
// ====================================================================

// Fetch all active marketplace listings
export async function fetchMarketplaceListingsFromSupabase() {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('marketplace_listings')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('Supabase fetchMarketplaceListings warning:', err.message);
    return null;
  }
}

// Insert new card listing to Supabase
export async function saveMarketplaceListingToSupabase(listing) {
  if (!isSupabaseConfigured) return false;
  try {
    const { data, error } = await supabase
      .from('marketplace_listings')
      .upsert({
        listing_id: listing.listingId || `list_${listing.tokenId}_${Date.now()}`,
        token_id: String(listing.tokenId),
        nft_contract: listing.nftContract || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        seller_address: listing.seller || listing.owner || '0x...',
        price_wei: String(listing.price),
        price_eth: listing.priceEth || '0.1',
        name: listing.name,
        position: listing.position || 'ST',
        overall: listing.overall || 90,
        rarity: listing.rarity || 'Rare',
        color: listing.color || '#9333ea',
        active: true
      }, { onConflict: 'listing_id' });

    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Supabase saveMarketplaceListing warning:', err.message);
    return false;
  }
}

// Mark listing as purchased in Supabase
export async function completePurchaseInSupabase(tokenId, buyerAddress) {
  if (!isSupabaseConfigured) return false;
  try {
    // 1. Mark listing as inactive
    await supabase
      .from('marketplace_listings')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('token_id', String(tokenId));

    // 2. Update user_cards owner
    await supabase
      .from('user_cards')
      .upsert({
        token_id: String(tokenId),
        owner_address: buyerAddress,
        active: false
      }, { onConflict: 'token_id' });

    return true;
  } catch (err) {
    console.warn('Supabase completePurchase warning:', err.message);
    return false;
  }
}

// Subscribe to Supabase Realtime changes for marketplace
export function subscribeToSupabaseMarketplace(onUpdate) {
  if (!isSupabaseConfigured) return () => {};

  try {
    const channel = supabase
      .channel('public:marketplace_listings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'marketplace_listings' },
        (payload) => {
          onUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (e) {
    console.warn('Supabase Realtime subscription error:', e);
    return () => {};
  }
}
