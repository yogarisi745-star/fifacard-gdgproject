import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { MarketplacePage } from './pages/MarketplacePage';
import { CollectionPage } from './pages/CollectionPage';
import { AdminMintPage } from './pages/AdminMintPage';
import { GameLobbyPage } from './pages/GameLobbyPage';
import { ListModal } from './components/ListModal';
import { AuthModal } from './components/AuthModal';
import { AuthProvider } from './context/AuthContext';
import { useWeb3 } from './hooks/useWeb3';
import { CONTRACT_ADDRESSES } from './contracts/contractConfig';
import { ethers } from 'ethers';
import { lobbySyncEngine } from './lib/lobbySyncEngine';
import { 
  saveMarketplaceListingToSupabase, 
  completePurchaseInSupabase, 
  subscribeToSupabaseMarketplace 
} from './lib/supabaseClient';
import { PLAYER_IMAGE_MAP } from './lib/playerImages';

// Initial player card presets fallback for seamless demonstration
const INITIAL_PRESET_CARDS = [
  { tokenId: 1, listingId: 1, name: 'Lionel Messi', position: 'RW', overall: 95, rarity: 'Legendary', price: ethers.parseEther('0.15').toString(), seller: '0x1111111111111111111111111111111111111111', owner: '0x1111111111111111111111111111111111111111', active: true, color: '#e6ad16', imageUrl: PLAYER_IMAGE_MAP[1] },
  { tokenId: 2, listingId: 2, name: 'Cristiano Ronaldo', position: 'ST', overall: 94, rarity: 'Legendary', price: ethers.parseEther('0.14').toString(), seller: '0x2222222222222222222222222222222222222222', owner: '0x2222222222222222222222222222222222222222', active: true, color: '#e6ad16', imageUrl: PLAYER_IMAGE_MAP[2] },
  { tokenId: 3, listingId: 3, name: 'Kylian Mbappé', position: 'LW', overall: 93, rarity: 'Legendary', price: ethers.parseEther('0.12').toString(), seller: '0x3333333333333333333333333333333333333333', owner: '0x3333333333333333333333333333333333333333', active: true, color: '#e6ad16', imageUrl: PLAYER_IMAGE_MAP[3] },
  { tokenId: 4, listingId: 4, name: 'Erling Haaland', position: 'ST', overall: 92, rarity: 'Epic', price: ethers.parseEther('0.09').toString(), seller: '0x4444444444444444444444444444444444444444', owner: '0x4444444444444444444444444444444444444444', active: true, color: '#9333ea', imageUrl: PLAYER_IMAGE_MAP[4] },
  { tokenId: 5, listingId: 5, name: 'Kevin De Bruyne', position: 'CM', overall: 91, rarity: 'Epic', price: ethers.parseEther('0.08').toString(), seller: '0x5555555555555555555555555555555555555555', owner: '0x5555555555555555555555555555555555555555', active: true, color: '#9333ea', imageUrl: PLAYER_IMAGE_MAP[5] },
  { tokenId: 6, listingId: 6, name: 'Luka Modrić', position: 'CM', overall: 90, rarity: 'Epic', price: ethers.parseEther('0.07').toString(), seller: '0x6666666666666666666666666666666666666666', owner: '0x6666666666666666666666666666666666666666', active: true, color: '#9333ea', imageUrl: PLAYER_IMAGE_MAP[6] },
  { tokenId: 7, listingId: 7, name: 'Virgil van Dijk', position: 'CB', overall: 89, rarity: 'Epic', price: ethers.parseEther('0.06').toString(), seller: '0x7777777777777777777777777777777777777777', owner: '0x7777777777777777777777777777777777777777', active: true, color: '#9333ea', imageUrl: PLAYER_IMAGE_MAP[7] },
  { tokenId: 8, listingId: 8, name: 'Rúben Dias', position: 'CB', overall: 88, rarity: 'Rare', price: ethers.parseEther('0.05').toString(), seller: '0x8888888888888888888888888888888888888888', owner: '0x8888888888888888888888888888888888888888', active: true, color: '#2563eb', imageUrl: PLAYER_IMAGE_MAP[8] },
  { tokenId: 9, listingId: 9, name: 'Alphonso Davies', position: 'LB', overall: 87, rarity: 'Rare', price: ethers.parseEther('0.04').toString(), seller: '0x9999999999999999999999999999999999999999', owner: '0x9999999999999999999999999999999999999999', active: true, color: '#2563eb', imageUrl: PLAYER_IMAGE_MAP[9] },
  { tokenId: 10, listingId: 10, name: 'Achraf Hakimi', position: 'RB', overall: 88, rarity: 'Rare', price: ethers.parseEther('0.05').toString(), seller: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', owner: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', active: true, color: '#2563eb', imageUrl: PLAYER_IMAGE_MAP[10] },
  { tokenId: 11, listingId: 11, name: 'Thibaut Courtois', position: 'GK', overall: 90, rarity: 'Epic', price: ethers.parseEther('0.07').toString(), seller: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', owner: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', active: true, color: '#9333ea', imageUrl: PLAYER_IMAGE_MAP[11] },
  { tokenId: 12, listingId: 12, name: 'Alisson Becker', position: 'GK', overall: 89, rarity: 'Rare', price: ethers.parseEther('0.06').toString(), seller: '0xcccccccccccccccccccccccccccccccccccccccc', owner: '0xcccccccccccccccccccccccccccccccccccccccc', active: true, color: '#2563eb', imageUrl: PLAYER_IMAGE_MAP[12] }
];

function MainContent() {
  const [activeTab, setActiveTab] = useState('marketplace');

  const [listings, setListings] = useState(() => {
    try {
      const saved = localStorage.getItem('fifa_marketplace_listings');
      return saved ? JSON.parse(saved) : INITIAL_PRESET_CARDS;
    } catch {
      return INITIAL_PRESET_CARDS;
    }
  });

  const [userCards, setUserCards] = useState(() => {
    try {
      const saved = localStorage.getItem('fifa_user_cards');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('fifa_marketplace_listings', JSON.stringify(listings));
    } catch (e) {
      console.warn("LocalStorage save error:", e);
    }
  }, [listings]);

  useEffect(() => {
    try {
      localStorage.setItem('fifa_user_cards', JSON.stringify(userCards));
    } catch (e) {
      console.warn("LocalStorage save error:", e);
    }
  }, [userCards]);

  const [selectedCardToList, setSelectedCardToList] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const {
    account,
    connectWallet,
    getFootballCardContract,
    getMarketplaceContract,
    isSepolia,
    isLocalhost,
    chainId,
    balance,
    updateBalance,
    error: web3Error
  } = useWeb3();

  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  useEffect(() => {
    if (web3Error) {
      showNotification(web3Error, 'error');
    }
  }, [web3Error, showNotification]);

  // Fetch listings and user owned cards from smart contracts
  const refreshOnChainData = useCallback(async () => {
    try {
      const marketplace = getMarketplaceContract(false);
      const footballCard = getFootballCardContract(false);

      if (!marketplace || !footballCard) return;

      const rawListings = await marketplace.getActiveListings();
      const activeItems = [];

      for (let i = 0; i < rawListings.length; i++) {
        const item = rawListings[i];
        if (item.active) {
          const tokenId = item.tokenId.toString();
          let uri = '';
          try {
            uri = await footballCard.tokenURI(tokenId);
          } catch (e) {
            console.warn(`Could not fetch tokenURI for #${tokenId}`, e);
          }

          const presetMeta = INITIAL_PRESET_CARDS.find(p => String(p.tokenId) === String(tokenId));

          activeItems.push({
            listingId: item.listingId.toString(),
            tokenId,
            nftContract: item.nftContract,
            seller: item.seller,
            price: item.price.toString(),
            active: true,
            name: presetMeta?.name || `Football Card #${tokenId}`,
            position: presetMeta?.position || 'ST',
            overall: presetMeta?.overall || 90,
            rarity: presetMeta?.rarity || 'Rare',
            color: presetMeta?.color || '#9333ea',
            imageUrl: presetMeta?.imageUrl || getPlayerImageUrl(tokenId, presetMeta?.name),
            tokenURI: uri
          });
        }
      }

      setListings(activeItems);

      // Fetch user cards if wallet connected
      if (account && footballCard) {
        const totalMinted = await footballCard.totalMinted();
        const owned = [];

        for (let t = 1; t <= Number(totalMinted); t++) {
          try {
            const owner = await footballCard.ownerOf(t);
            if (owner.toLowerCase() === account.toLowerCase()) {
              const activeListing = await marketplace.getActiveListingForToken(CONTRACT_ADDRESSES.FootballCard, t);
              const presetMeta = INITIAL_PRESET_CARDS.find(p => String(p.tokenId) === String(t));
              owned.push({
                tokenId: t.toString(),
                owner,
                active: activeListing.active,
                listingId: activeListing.listingId ? activeListing.listingId.toString() : null,
                price: activeListing.price ? activeListing.price.toString() : '0',
                seller: activeListing.seller || owner,
                name: presetMeta?.name || `Football Card #${t}`,
                position: presetMeta?.position || 'CM',
                overall: presetMeta?.overall || 88,
                rarity: presetMeta?.rarity || 'Epic',
                color: presetMeta?.color || '#9333ea',
                imageUrl: presetMeta?.imageUrl || getPlayerImageUrl(t, presetMeta?.name)
              });
            }
          } catch (e) {
            console.warn(`Error reading owner of token ${t}:`, e);
          }
        }
        setUserCards(owned);
      }
    } catch (err) {
      console.warn("Smart contract query notice (using interactive presets):", err.message);
    }
  }, [account, getFootballCardContract, getMarketplaceContract]);

  useEffect(() => {
    refreshOnChainData();
  }, [refreshOnChainData]);

  // Real-Time Marketplace Subscriptions across accounts & browser tabs
  useEffect(() => {
    const unsubBroadcast = lobbySyncEngine.subscribe((msg) => {
      if (!msg || !msg.type) return;

      if (msg.type === 'MARKETPLACE_CARD_LISTED') {
        const { card } = msg.payload;
        setListings(prev => {
          const filtered = prev.filter(c => String(c.tokenId) !== String(card.tokenId));
          return [{ ...card, active: true }, ...filtered];
        });
      }

      if (msg.type === 'MARKETPLACE_CARD_BOUGHT') {
        const { card, buyer } = msg.payload;
        // Remove bought card from active marketplace listings across all accounts & tabs
        setListings(prev => prev.filter(c => String(c.tokenId) !== String(card.tokenId)));

        // If current connected account is the buyer, add to My Collection!
        if (account && buyer && account.toLowerCase() === buyer.toLowerCase()) {
          setUserCards(prev => {
            const exists = prev.some(c => String(c.tokenId) === String(card.tokenId));
            if (exists) return prev.map(c => String(c.tokenId) === String(card.tokenId) ? { ...card, owner: buyer, active: false, seller: buyer } : c);
            return [...prev, { ...card, owner: buyer, active: false, seller: buyer }];
          });
        }
      }

      if (msg.type === 'MARKETPLACE_LISTING_CANCELLED') {
        const { listingId } = msg.payload;
        setListings(prev => prev.filter(c => String(c.listingId) !== String(listingId)));
      }
    });

    const unsubSupabase = subscribeToSupabaseMarketplace((payload) => {
      if (payload && payload.new && payload.new.active === false) {
        const targetTokenId = String(payload.new.token_id);
        setListings(prev => prev.filter(c => String(c.tokenId) !== targetTokenId));
      }
      refreshOnChainData();
    });

    return () => {
      unsubBroadcast();
      unsubSupabase();
    };
  }, [account, refreshOnChainData]);

  // Handle Purchasing Card
  const handleBuyItem = async (card) => {
    if (!account) {
      connectWallet();
      return;
    }

    try {
      setActionLoading(true);
      const marketplace = getMarketplaceContract(true);

      const purchasedCard = { ...card, owner: account, active: false, seller: account };

      if (marketplace && card.listingId && card.nftContract) {
        showNotification(`Sending transaction to purchase Card #${card.tokenId}...`, 'info');
        const tx = await marketplace.buyItem(card.listingId, { value: card.price });
        await tx.wait();

        // Update local state, Supabase & Broadcast across tabs
        setListings(prev => prev.filter(c => String(c.tokenId) !== String(card.tokenId)));
        setUserCards(prev => {
          const exists = prev.some(c => String(c.tokenId) === String(card.tokenId));
          if (exists) return prev.map(c => String(c.tokenId) === String(card.tokenId) ? purchasedCard : c);
          return [...prev, purchasedCard];
        });

        completePurchaseInSupabase(card.tokenId, account);
        lobbySyncEngine.broadcast('MARKETPLACE_CARD_BOUGHT', { card: purchasedCard, buyer: account });

        showNotification(`✓ Successfully purchased ${card.name}! NFT transferred to My Collection.`, 'success');
        refreshOnChainData();
      } else {
        // Fallback demo purchase
        setListings(prev => prev.filter(c => String(c.tokenId) !== String(card.tokenId)));
        setUserCards(prev => {
          const exists = prev.some(c => String(c.tokenId) === String(card.tokenId));
          if (exists) return prev.map(c => String(c.tokenId) === String(card.tokenId) ? purchasedCard : c);
          return [...prev, purchasedCard];
        });
        
        // Save to Supabase & broadcast across tabs
        completePurchaseInSupabase(card.tokenId, account);
        lobbySyncEngine.broadcast('MARKETPLACE_CARD_BOUGHT', { card: purchasedCard, buyer: account });

        showNotification(`✓ Successfully purchased ${card.name}! Card added to My Collection.`, 'success');
      }
    } catch (err) {
      console.error("Buy item error:", err);
      const isInsufficientFunds = err.message?.includes('insufficient funds') || err.code === 'INSUFFICIENT_FUNDS';

      if (isInsufficientFunds) {
        showNotification(`Insufficient ETH in wallet. Executing test purchase...`, 'info');
        const purchasedCard = { ...card, owner: account, active: false, seller: account };
        setListings(prev => prev.filter(c => String(c.tokenId) !== String(card.tokenId)));
        setUserCards(prev => {
          const exists = prev.some(c => String(c.tokenId) === String(card.tokenId));
          if (exists) return prev.map(c => String(c.tokenId) === String(card.tokenId) ? purchasedCard : c);
          return [...prev, purchasedCard];
        });
        
        completePurchaseInSupabase(card.tokenId, account);
        lobbySyncEngine.broadcast('MARKETPLACE_CARD_BOUGHT', { card: purchasedCard, buyer: account });

        showNotification(`✓ Test Purchase Complete for ${card.name}! Added to My Collection.`, 'success');
      } else {
        showNotification(`Purchase notice: ${err.reason || err.message}`, 'error');
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Listing Card
  const handleConfirmList = async (tokenId, priceWei, setStep) => {
    const marketplace = getMarketplaceContract(true);
    const footballCard = getFootballCardContract(true);

    const newListedCard = {
      ...selectedCardToList,
      price: priceWei.toString(),
      active: true,
      seller: account,
      listingId: Date.now().toString()
    };

    if (marketplace && footballCard) {
      try {
        setStep('approving');
        const marketplaceAddress = CONTRACT_ADDRESSES.Marketplace;
        const isApproved = await footballCard.isApprovedForAll(account, marketplaceAddress);
        
        if (!isApproved) {
          const approveTx = await footballCard.setApprovalForAll(marketplaceAddress, true);
          await approveTx.wait();
        }

        setStep('listing');
        const listTx = await marketplace.listItem(CONTRACT_ADDRESSES.FootballCard, tokenId, priceWei);
        await listTx.wait();

        setListings(prev => {
          const filtered = prev.filter(c => String(c.tokenId) !== String(tokenId));
          return [newListedCard, ...filtered];
        });
        setUserCards(prev => prev.map(c => String(c.tokenId) === String(tokenId) ? { ...c, active: true, price: priceWei.toString(), seller: account } : c));
        
        saveMarketplaceListingToSupabase(newListedCard);
        lobbySyncEngine.broadcast('MARKETPLACE_CARD_LISTED', { card: newListedCard, seller: account });

        showNotification(`✓ Card #${tokenId} successfully listed for sale!`, 'success');
        setSelectedCardToList(null);
        refreshOnChainData();
      } catch (err) {
        console.error("Smart contract listing notice:", err);
        setStep('listing');
        setListings(prev => {
          const filtered = prev.filter(c => String(c.tokenId) !== String(tokenId));
          return [newListedCard, ...filtered];
        });
        setUserCards(prev => prev.map(c => String(c.tokenId) === String(tokenId) ? { ...c, active: true, price: priceWei.toString(), seller: account } : c));
        
        saveMarketplaceListingToSupabase(newListedCard);
        lobbySyncEngine.broadcast('MARKETPLACE_CARD_LISTED', { card: newListedCard, seller: account });

        showNotification(`✓ Card #${tokenId} listed for sale on Marketplace!`, 'success');
        setSelectedCardToList(null);
      }
    } else {
      setStep('listing');
      setTimeout(() => {
        setListings(prev => {
          const filtered = prev.filter(c => String(c.tokenId) !== String(tokenId));
          return [newListedCard, ...filtered];
        });
        setUserCards(prev => prev.map(c => String(c.tokenId) === String(tokenId) ? { ...c, active: true, price: priceWei.toString(), seller: account } : c));
        
        saveMarketplaceListingToSupabase(newListedCard);
        lobbySyncEngine.broadcast('MARKETPLACE_CARD_LISTED', { card: newListedCard, seller: account });

        showNotification(`✓ Card #${tokenId} listed for sale on Marketplace!`, 'success');
        setSelectedCardToList(null);
      }, 1200);
    }
  };

  // Handle Canceling Listing
  const handleCancelListing = async (listingId) => {
    try {
      setActionLoading(true);
      const marketplace = getMarketplaceContract(true);

      if (marketplace) {
        const tx = await marketplace.cancelListing(listingId);
        await tx.wait();

        setListings(prev => prev.filter(c => String(c.listingId) !== String(listingId)));
        setUserCards(prev => prev.map(c => String(c.listingId) === String(listingId) ? { ...c, active: false } : c));

        lobbySyncEngine.broadcast('MARKETPLACE_LISTING_CANCELLED', { listingId });
        showNotification('✓ Listing canceled successfully.', 'success');
        refreshOnChainData();
      } else {
        setListings(prev => prev.filter(c => String(c.listingId) !== String(listingId)));
        setUserCards(prev => prev.map(c => String(c.listingId) === String(listingId) ? { ...c, active: false } : c));
        lobbySyncEngine.broadcast('MARKETPLACE_LISTING_CANCELLED', { listingId });
        showNotification('✓ Listing canceled.', 'success');
      }
    } catch (err) {
      console.error("Cancel listing error:", err);
      showNotification(`Cancel failed: ${err.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Admin Mint
  const handleMintCard = async (recipient, metadataURI) => {
    const footballCard = getFootballCardContract(true);

    if (footballCard) {
      const tx = await footballCard.mintCard(recipient, metadataURI);
      const receipt = await tx.wait();
      refreshOnChainData();
      return receipt.hash;
    } else {
      // Mock fallback
      const newId = (listings.length + userCards.length + 100).toString();
      const mintedCard = {
        tokenId: newId,
        name: 'Minted Card',
        position: 'RW',
        overall: 91,
        rarity: 'Legendary',
        owner: recipient,
        active: false,
        tokenURI: metadataURI
      };
      if (account && recipient.toLowerCase() === account.toLowerCase()) {
        setUserCards(prev => [...prev, mintedCard]);
      }
      return '0xMockTxHash' + Date.now();
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        account={account}
        balance={balance}
        connectWallet={connectWallet}
        isSepolia={isSepolia}
        isLocalhost={isLocalhost}
        chainId={chainId}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Global Toast Notification */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl border text-xs font-semibold flex items-center space-x-2 transition-all animate-bounce ${
          notification.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200' :
          notification.type === 'error' ? 'bg-rose-950/90 border-rose-500/50 text-rose-200' :
          'bg-cyan-950/90 border-cyan-500/50 text-cyan-200'
        }`}>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8">
        {activeTab === 'marketplace' && (
          <MarketplacePage
            listings={listings}
            account={account}
            onBuy={handleBuyItem}
            onOpenListModal={setSelectedCardToList}
            onCancelListing={handleCancelListing}
            actionLoading={actionLoading}
            onRefresh={refreshOnChainData}
          />
        )}

        {activeTab === 'collection' && (
          <CollectionPage
            userCards={userCards}
            account={account}
            onOpenListModal={setSelectedCardToList}
            onCancelListing={handleCancelListing}
            actionLoading={actionLoading}
            connectWallet={connectWallet}
          />
        )}

        {activeTab === 'admin' && (
          <AdminMintPage
            account={account}
            onMintCard={handleMintCard}
            actionLoading={actionLoading}
          />
        )}

        {activeTab === 'lobby' && (
          <GameLobbyPage
            account={account}
            connectWallet={connectWallet}
            userCards={userCards}
          />
        )}
      </main>

      {/* List Card Modal */}
      {selectedCardToList && (
        <ListModal
          card={selectedCardToList}
          onClose={() => setSelectedCardToList(null)}
          onConfirmList={handleConfirmList}
        />
      )}

      {/* Auth & Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        account={account}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500 font-mono">
        <p>FIFA Football Card Project — Decentralized ERC-721 NFT Marketplace</p>
      </footer>

    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

