// Real-Time Cross-Tab / Cross-Window Lobby Sync Engine
// Uses BroadcastChannel API + localStorage events for cross-account synchronization

const CHANNEL_NAME = 'fifa_blockchain_lobby_channel_v1';
const STORAGE_KEY_ROOMS = 'fifa_active_public_rooms_v1';

class LobbySyncEngine {
  constructor() {
    this.listeners = new Set();
    this.channel = null;
    this.initChannel();
    this.initStorageListener();
  }

  initChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          this.notifyListeners(event.data);
        };
      } catch (e) {
        console.warn('BroadcastChannel initialization failed, falling back to localStorage events', e);
      }
    }
  }

  initStorageListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === STORAGE_KEY_ROOMS && event.newValue) {
          try {
            const data = JSON.parse(event.newValue);
            this.notifyListeners({ type: 'PUBLIC_ROOMS_UPDATED', payload: data });
          } catch (e) {
            console.error('Storage sync error:', e);
          }
        }
      });
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(message) {
    this.listeners.forEach((cb) => {
      try {
        cb(message);
      } catch (err) {
        console.error('Listener callback error:', err);
      }
    });
  }

  broadcast(type, payload) {
    const msg = { type, payload, timestamp: Date.now() };
    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch (e) {
        console.warn('BroadcastChannel postMessage failed:', e);
      }
    }

    // Also dispatch custom local event for same-window component updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fifa_lobby_event', { detail: msg }));
    }
  }

  // Helper to persist active public rooms in localStorage
  getPublicRooms() {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ROOMS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  savePublicRooms(rooms) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_ROOMS, JSON.stringify(rooms));
      this.broadcast('PUBLIC_ROOMS_UPDATED', rooms);
    } catch (e) {
      console.warn('Error saving public rooms to localStorage:', e);
    }
  }
}

export const lobbySyncEngine = new LobbySyncEngine();
