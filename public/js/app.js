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

    // Load travelers
    await this.loadTravelers();

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

    // Add traveler button
    const addTravelerBtn = document.getElementById('add-traveler-btn');
    if (addTravelerBtn) {
      addTravelerBtn.addEventListener('click', () => this.addTraveler());
    }

    // Add traveler on Enter key
    const travelerInput = document.getElementById('new-traveler-name');
    if (travelerInput) {
      travelerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.addTraveler();
        }
      });
    }
  }

  // Traveler management methods
  async loadTravelers() {
    const travelers = await window.db.getAllTravelers();
    this.renderTravelers(travelers);
  }

  renderTravelers(travelers) {
    const container = document.getElementById('travelers-list');
    if (!container) return;

    if (travelers.length === 0) {
      container.innerHTML = '<p class="empty-state">No travelers added yet</p>';
      return;
    }

    container.innerHTML = travelers.map(t => `
      <div class="traveler-item" data-id="${t.id}">
        <span class="traveler-name">${this.escapeHtml(t.name)}</span>
        <button class="delete-traveler-btn" onclick="app.deleteTraveler('${t.id}')" title="Remove">×</button>
      </div>
    `).join('');
  }

  async addTraveler() {
    const input = document.getElementById('new-traveler-name');
    const name = input.value.trim();

    if (!name) {
      alert('Please enter a traveler name');
      return;
    }

    // Check for duplicates
    const existing = await window.db.getAllTravelers();
    if (existing.some(t => t.name.toLowerCase() === name.toLowerCase())) {
      alert('A traveler with this name already exists');
      return;
    }

    await window.db.saveTraveler({ name });
    input.value = '';
    await this.loadTravelers();
  }

  async deleteTraveler(id) {
    if (!confirm('Remove this traveler? Their item quantities will be removed.')) {
      return;
    }

    await window.db.deleteTraveler(id);
    await this.loadTravelers();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Swipe-to-delete functionality
  initSwipeToDelete(container, itemSelector, onDelete) {
    let startX = 0;
    let currentX = 0;
    let swipingItem = null;
    let isDragging = false;
    const SWIPE_THRESHOLD = 80;

    // Reset any open swipe
    const resetSwipe = (except) => {
      const swiped = container.querySelectorAll('.swiped');
      swiped.forEach(item => {
        if (item !== except) {
          item.classList.remove('swiped');
          const content = item.querySelector('.item-content');
          if (content) content.style.transform = '';
        }
      });
    };

    container.addEventListener('touchstart', (e) => {
      const item = e.target.closest(itemSelector);
      if (!item || e.target.closest('.delete-action')) return;

      swipingItem = item;
      startX = e.touches[0].clientX;
      isDragging = false;

      // Reset other swiped items
      resetSwipe(item);
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
      if (!swipingItem) return;

      currentX = e.touches[0].clientX;
      const diff = startX - currentX;

      // Only start dragging after moving more than 10px
      if (Math.abs(diff) > 10) {
        isDragging = true;
      }

      if (isDragging && diff > 0) {
        // Swiping left - show delete
        const translate = Math.min(diff, SWIPE_THRESHOLD + 20);
        const content = swipingItem.querySelector('.item-content');
        if (content) {
          content.style.transform = `translateX(-${translate}px)`;
        }
      }
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      if (!swipingItem) return;

      const diff = startX - currentX;
      const content = swipingItem.querySelector('.item-content');

      if (diff > SWIPE_THRESHOLD) {
        // Snap to delete state
        swipingItem.classList.add('swiped');
        if (content) content.style.transform = `translateX(-${SWIPE_THRESHOLD}px)`;
      } else {
        // Reset
        swipingItem.classList.remove('swiped');
        if (content) content.style.transform = '';
      }

      swipingItem = null;
      isDragging = false;
    }, { passive: true });

    // Handle delete button clicks
    container.addEventListener('click', async (e) => {
      const deleteBtn = e.target.closest('.delete-action');
      if (!deleteBtn) {
        // Clicking elsewhere resets swipe
        if (!e.target.closest('.swiped')) {
          resetSwipe();
        }
        return;
      }

      const item = deleteBtn.closest(itemSelector);
      const itemId = item?.dataset.id;
      if (itemId && confirm('Delete this item?')) {
        await onDelete(itemId);
      }
    });

    // Handle clicks outside to reset
    document.addEventListener('click', (e) => {
      if (!e.target.closest(itemSelector)) {
        resetSwipe();
      }
    });
  }

  // Long press detection for quick edit
  initLongPress(container, itemSelector, onLongPress) {
    let pressTimer = null;
    let pressTarget = null;
    const LONG_PRESS_DURATION = 500;

    container.addEventListener('touchstart', (e) => {
      const item = e.target.closest(itemSelector);
      if (!item) return;

      pressTarget = item;
      pressTarget.classList.add('long-pressing');

      pressTimer = setTimeout(() => {
        pressTarget?.classList.remove('long-pressing');
        const itemId = item.dataset.itemId || item.dataset.id;
        if (itemId) {
          onLongPress(itemId);
        }
      }, LONG_PRESS_DURATION);
    }, { passive: true });

    container.addEventListener('touchmove', () => {
      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
        pressTarget?.classList.remove('long-pressing');
      }
    }, { passive: true });

    container.addEventListener('touchend', () => {
      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
        pressTarget?.classList.remove('long-pressing');
      }
    }, { passive: true });
  }

  // Quick Edit Modal
  quickEditItemId = null;

  async showQuickEdit(itemId) {
    this.quickEditItemId = itemId;
    const item = await window.db.getItem(itemId);
    if (!item) return;

    document.getElementById('qe-item-name').textContent = item.name;
    document.getElementById('qe-permanent').checked = !!item.is_permanent;
    document.getElementById('qe-critical').checked = !!item.is_critical;
    document.getElementById('qe-purchase').value = item.purchase_timing || '';

    document.getElementById('quick-edit-modal').classList.remove('hidden');
  }

  closeQuickEdit() {
    document.getElementById('quick-edit-modal').classList.add('hidden');
    this.quickEditItemId = null;
  }

  async saveQuickEdit() {
    if (!this.quickEditItemId) return;

    const item = await window.db.getItem(this.quickEditItemId);
    if (!item) return;

    item.is_permanent = document.getElementById('qe-permanent').checked ? 1 : 0;
    item.is_critical = document.getElementById('qe-critical').checked ? 1 : 0;
    item.purchase_timing = document.getElementById('qe-purchase').value || null;

    await window.db.saveItem(item);

    // Refresh the current view
    if (window.trips && this.currentScreen === 'packing') {
      await window.trips.loadPackingList();
    }
    if (window.templates && this.currentScreen === 'templates') {
      const template = await window.db.getTemplate(window.templates.currentTemplateId);
      const selectedIds = new Set((await window.db.getTemplateItems(window.templates.currentTemplateId)).map(ti => ti.item_id));
      window.templates.renderTemplateEditor(template, selectedIds);
    }
    if (window.inventory && this.currentScreen === 'inventory') {
      await window.inventory.loadInventory();
    }

    this.closeQuickEdit();
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
