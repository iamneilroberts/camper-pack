/**
 * CamperPack - Inventory Management
 */

class InventoryManager {
  constructor() {
    this.currentFilter = 'all';
    this.searchQuery = '';
    this.editingItemId = null;
  }

  async init() {
    this.bindEvents();
    await this.loadInventory();
  }

  bindEvents() {
    // Search
    const searchInput = document.getElementById('inventory-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.renderItems();
      });
    }

    // Filter tabs
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentFilter = tab.dataset.filter;
        this.renderItems();
      });
    });

    // Add item button
    const addBtn = document.getElementById('add-item-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.showItemForm());
    }

    // Item form
    const itemForm = document.getElementById('item-form');
    if (itemForm) {
      itemForm.addEventListener('submit', (e) => this.handleItemSubmit(e));

      // Cancel button
      const cancelBtn = itemForm.querySelector('[data-action="cancel"]');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => this.hideItemForm());
      }
    }
  }

  async loadInventory() {
    this.items = await window.db.getAllItems();
    this.locations = await window.db.getAllLocations();
    this.renderItems();
  }

  renderItems() {
    const container = document.getElementById('inventory-list');
    if (!container) return;

    let filteredItems = this.items;

    // Apply filter
    if (this.currentFilter !== 'all') {
      filteredItems = filteredItems.filter(item => {
        const location = this.locations.find(l => l.id === item.storage_location);
        return location?.area === this.currentFilter;
      });
    }

    // Apply search
    if (this.searchQuery) {
      filteredItems = filteredItems.filter(item =>
        item.name.toLowerCase().includes(this.searchQuery) ||
        item.category?.toLowerCase().includes(this.searchQuery) ||
        item.notes?.toLowerCase().includes(this.searchQuery)
      );
    }

    // Sort by name
    filteredItems.sort((a, b) => a.name.localeCompare(b.name));

    if (filteredItems.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>No items found</p>
          <button class="btn btn-primary" onclick="inventory.showItemForm()">Add Your First Item</button>
        </div>
      `;
      return;
    }

    container.innerHTML = filteredItems.map(item => this.renderItemCard(item)).join('');

    // Add click handlers
    container.querySelectorAll('.item-card').forEach(card => {
      card.addEventListener('click', () => {
        this.showItemForm(card.dataset.id);
      });
    });
  }

  renderItemCard(item) {
    const location = this.locations.find(l => l.id === item.storage_location);
    const locationName = location?.name || 'No location';

    const badges = [];
    if (item.is_critical) badges.push('<span class="badge critical">Critical</span>');
    if (item.is_permanent) badges.push('<span class="badge permanent">Permanent</span>');

    const icon = item.icon || this.getCategoryIcon(item.category);

    return `
      <div class="item-card" data-id="${item.id}">
        <div class="item-icon">${icon}</div>
        <div class="item-details">
          <div class="item-name">${this.escapeHtml(item.name)}</div>
          <div class="item-meta">${this.escapeHtml(locationName)} • ${item.quantity || 1}x</div>
        </div>
        <div class="item-badges">${badges.join('')}</div>
      </div>
    `;
  }

  getCategoryIcon(category) {
    const icons = {
      clothing: '👕',
      toiletries: '🧴',
      meds: '💊',
      pet: '🐕',
      electronics: '🔌',
      food: '🍎',
      gear: '🎒',
      kitchen: '🍳',
      bedding: '🛏️',
      tools: '🔧',
      other: '📦'
    };
    return icons[category] || '📦';
  }

  async showItemForm(itemId = null) {
    this.editingItemId = itemId;

    // Reset form
    const form = document.getElementById('item-form');
    form.reset();

    // If editing, populate form
    if (itemId) {
      const item = await window.db.getItem(itemId);
      if (item) {
        document.getElementById('item-name').value = item.name || '';
        document.getElementById('item-category').value = item.category || '';
        document.getElementById('item-location').value = item.storage_location || '';
        document.getElementById('item-quantity').value = item.quantity || 1;
        document.getElementById('item-icon').value = item.icon || '';
        document.getElementById('item-permanent').checked = !!item.is_permanent;
        document.getElementById('item-critical').checked = !!item.is_critical;
        document.getElementById('item-purchase').value = item.purchase_timing || '';
        document.getElementById('item-notes').value = item.notes || '';
      }
    }

    // Show form screen
    window.app.showScreen('item-form');
    document.getElementById('page-title').textContent = itemId ? 'Edit Item' : 'Add Item';
  }

  hideItemForm() {
    this.editingItemId = null;
    window.app.showScreen('inventory');
    document.getElementById('page-title').textContent = 'Inventory';
  }

  async handleItemSubmit(e) {
    e.preventDefault();

    const item = {
      name: document.getElementById('item-name').value.trim(),
      category: document.getElementById('item-category').value,
      storage_location: document.getElementById('item-location').value,
      quantity: parseInt(document.getElementById('item-quantity').value) || 1,
      icon: document.getElementById('item-icon').value.trim(),
      is_permanent: document.getElementById('item-permanent').checked ? 1 : 0,
      is_critical: document.getElementById('item-critical').checked ? 1 : 0,
      purchase_timing: document.getElementById('item-purchase').value || null,
      notes: document.getElementById('item-notes').value.trim() || null
    };

    if (this.editingItemId) {
      item.id = this.editingItemId;
    }

    await window.db.saveItem(item);
    await this.loadInventory();
    this.hideItemForm();
  }

  async deleteItem(id) {
    if (confirm('Delete this item?')) {
      await window.db.deleteItem(id);
      await this.loadInventory();
      this.hideItemForm();
    }
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Export inventory to JSON
  async exportInventory() {
    const items = await window.db.getAllItems();
    const data = JSON.stringify(items, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `camperpack-inventory-${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }

  // Import inventory from JSON
  async importInventory(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const items = JSON.parse(e.target.result);
          for (const item of items) {
            await window.db.saveItem(item);
          }
          await this.loadInventory();
          resolve(items.length);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }
}

// Export singleton
window.inventory = new InventoryManager();
