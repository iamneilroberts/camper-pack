/**
 * CamperPack - Main App Controller
 */

class CamperPackApp {
  constructor() {
    this.currentScreen = 'home';
  }

  async init() {
    // Initialize database
    await window.db.init();
    await window.db.seedDefaultData();

    // Store locations in db object for easy access
    window.db.locations = await window.db.getAllLocations();

    // Initialize modules
    await window.inventory.init();
    await window.trips.init();
    await window.camera.init();

    // Register service worker
    this.registerServiceWorker();

    // Bind navigation
    this.bindNavigation();

    // Bind home actions
    this.bindHomeActions();

    // Bind sync button
    this.bindSyncButton();

    // Bind settings
    this.bindSettings();

    // Check online status
    this.updateOnlineStatus();

    // Handle URL parameters
    this.handleUrlParams();

    console.log('CamperPack initialized');
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration.scope);

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              if (confirm('A new version is available. Reload to update?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          });
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  bindNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const screen = item.dataset.screen;
        this.showScreen(screen);

        // Update active nav item
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      });
    });
  }

  bindHomeActions() {
    const actionCards = document.querySelectorAll('.action-card');
    actionCards.forEach(card => {
      card.addEventListener('click', () => {
        const action = card.dataset.action;
        this.handleAction(action);
      });
    });
  }

  bindSyncButton() {
    const syncBtn = document.getElementById('sync-btn');
    if (syncBtn) {
      syncBtn.addEventListener('click', () => this.performSync());
    }
  }

  bindSettings() {
    // Force sync
    const forceSyncBtn = document.getElementById('force-sync-btn');
    if (forceSyncBtn) {
      forceSyncBtn.addEventListener('click', () => this.performSync());
    }

    // CSV Export
    const exportCsvBtn = document.getElementById('export-csv-btn');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => window.inventory.exportToCSV());
    }

    // CSV Import
    const importCsvBtn = document.getElementById('import-csv-btn');
    if (importCsvBtn) {
      importCsvBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (file) {
            try {
              const count = await window.inventory.importFromCSV(file);
              alert(`Imported ${count} items from CSV`);
            } catch (err) {
              alert('CSV Import failed: ' + err.message);
            }
          }
        };
        input.click();
      });
    }

    // Clear inventory
    const clearBtn = document.getElementById('clear-inventory-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => window.inventory.clearInventory());
    }

    // JSON Export
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => window.inventory.exportInventory());
    }

    // JSON Import
    const importBtn = document.getElementById('import-btn');
    if (importBtn) {
      importBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (file) {
            try {
              const count = await window.inventory.importInventory(file);
              alert(`Imported ${count} items from JSON`);
            } catch (err) {
              alert('JSON Import failed: ' + err.message);
            }
          }
        };
        input.click();
      });
    }

    // Update last sync time display
    this.updateLastSyncDisplay();
  }

  handleAction(action) {
    switch (action) {
      case 'new-trip':
        this.showScreen('new-trip');
        break;
      case 'current-trip':
        this.showScreen('packing');
        break;
      case 'inventory':
        this.showScreen('inventory');
        break;
      case 'pre-departure':
        this.showScreen('pre-departure');
        break;
      default:
        console.warn('Unknown action:', action);
    }
  }

  showScreen(screenId) {
    // Hide all screens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.remove('active'));

    // Show target screen
    const targetScreen = document.getElementById(`${screenId}-screen`);
    if (targetScreen) {
      targetScreen.classList.add('active');
      this.currentScreen = screenId;

      // Update page title
      const titles = {
        'home': 'CamperPack',
        'inventory': 'Inventory',
        'item-form': 'Edit Item',
        'templates': 'Templates',
        'new-trip': 'New Trip',
        'packing': 'Packing List',
        'pre-departure': 'Pre-Departure',
        'camera': 'Camera',
        'settings': 'Settings'
      };
      document.getElementById('page-title').textContent = titles[screenId] || 'CamperPack';

      // Handle screen-specific logic
      if (screenId === 'camera') {
        window.camera.startCamera();
      } else {
        window.camera.stopCamera();
      }

      // Update nav active state
      const navItems = document.querySelectorAll('.nav-item');
      navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.screen === screenId);
      });
    }
  }

  async performSync() {
    const syncIcon = document.querySelector('.sync-icon');
    if (syncIcon) {
      syncIcon.classList.add('syncing');
    }

    try {
      const result = await window.db.syncWithCloud();
      if (result.success) {
        const msg = `Sync complete!\nPushed: ${result.pushed || 0} items\nPulled: ${result.pulled || 0} items`;
        alert(msg);

        // Refresh inventory if on that screen
        if (window.inventory) {
          await window.inventory.loadInventory();
        }
      } else {
        alert('Sync failed: ' + (result.reason || 'Unknown error'));
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('Sync error: ' + error.message);
    } finally {
      if (syncIcon) {
        syncIcon.classList.remove('syncing');
      }
      this.updateLastSyncDisplay();
    }
  }

  updateLastSyncDisplay() {
    const lastSyncEl = document.getElementById('last-sync');
    if (lastSyncEl) {
      const lastSync = localStorage.getItem('lastSync');
      if (lastSync) {
        const date = new Date(lastSync);
        lastSyncEl.textContent = date.toLocaleString();
      } else {
        lastSyncEl.textContent = 'Never';
      }
    }
  }

  updateOnlineStatus() {
    const indicator = document.getElementById('offline-indicator');
    if (indicator) {
      indicator.classList.toggle('hidden', navigator.onLine);
    }
  }

  handleUrlParams() {
    const params = new URLSearchParams(window.location.search);

    const action = params.get('action');
    if (action) {
      this.handleAction(action);
    }

    const screen = params.get('screen');
    if (screen) {
      this.showScreen(screen);
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  window.app = new CamperPackApp();
  await window.app.init();
});
