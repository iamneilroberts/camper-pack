/**
 * CamperPack - Inventory Management
 */

// Personal categories that support per-traveler quantities
const PERSONAL_CATEGORIES = ['clothing', 'toiletries', 'meds', 'other'];

// Icon choices for the picker - organized by category
const ICON_CHOICES = [
  // Camping & Outdoors
  '🏕️', '⛺', '🔥', '🪵', '🏔️', '🌲', '🌳', '🥾', '🎒', '🧭',
  '🔦', '🪔', '⛱️', '🌄', '🌅', '🏞️', '🛶', '🚣', '🎣', '🐟',
  // Vehicles & Travel
  '🚗', '🚙', '🚐', '🚛', '🚚', '🏎️', '🛻', '⛽', '🗺️', '📍',
  // Clothing
  '👕', '👖', '🩳', '👗', '🧥', '🧤', '🧣', '🧦', '👟', '🥿',
  '👒', '🧢', '👓', '🕶️', '🩱', '👙', '🩴',
  // Kitchen & Food
  '🍳', '🥘', '🍲', '🍽️', '🥄', '🔪', '🧊', '🧂', '🫙', '🥫',
  '🍎', '🥩', '🥗', '☕', '🧃', '🍺', '🧋', '💧', '🫗',
  // Electronics
  '🔌', '🔋', '💡', '📱', '💻', '📷', '🎥', '📺', '🔊', '🎧',
  '📡', '⚡', '🔆',
  // Toiletries & Medical
  '🧴', '🧼', '🪥', '🧻', '🩹', '💊', '💉', '🩺', '🧪', '🧽',
  // Pets
  '🐕', '🐶', '🐾', '🦴', '🐈', '🐱',
  // Tools & Hardware
  '🔧', '🔨', '🪛', '🔩', '🪜', '🧰', '⚙️', '🔗', '🪢', '🧲',
  // Bedding & Comfort
  '🛏️', '🛋️', '🪑', '🧸', '🪭', '🛡️',
  // Documents & Misc
  '📦', '🗃️', '📋', '📝', '🏷️', '🔑', '💳', '📁', '💰', '🎫',
  // Safety & Emergency
  '🧯', '⚠️', '🚨', '🆘', '⛑️', '🦺',
  // Nature & Weather
  '☀️', '🌙', '⭐', '🌧️', '❄️', '🌊', '🌸', '🍂',
  // Fun & Activities
  '🎮', '🎲', '🎯', '⚽', '🏈', '🎾', '🏓', '🛹', '🚴', '🏊'
];

class InventoryManager {
  constructor() {
    this.currentFilter = 'all';
    this.searchQuery = '';
    this.editingItemId = null;
    this.travelers = [];
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

    // Category change - show/hide traveler quantities
    const categorySelect = document.getElementById('item-category');
    if (categorySelect) {
      categorySelect.addEventListener('change', () => this.updateTravelerQuantitiesVisibility());
    }
  }

  updateTravelerQuantitiesVisibility() {
    const category = document.getElementById('item-category').value;
    const section = document.getElementById('traveler-quantities-section');

    if (PERSONAL_CATEGORIES.includes(category) && this.travelers.length > 0) {
      section.classList.remove('hidden');
    } else {
      section.classList.add('hidden');
    }
  }

  renderTravelerQuantityInputs(travelerQuantities = {}) {
    const container = document.getElementById('traveler-qty-inputs');
    if (!container || this.travelers.length === 0) return;

    container.innerHTML = this.travelers.map(t => `
      <div class="traveler-qty-row">
        <span class="traveler-name">${this.escapeHtml(t.name)}</span>
        <input type="number" min="0" value="${travelerQuantities[t.id] || 1}"
               data-traveler-id="${t.id}" class="traveler-qty-input">
      </div>
    `).join('');
  }

  getTravelerQuantitiesFromForm() {
    const quantities = {};
    document.querySelectorAll('.traveler-qty-input').forEach(input => {
      const travelerId = input.dataset.travelerId;
      const qty = parseInt(input.value) || 0;
      if (qty > 0) {
        quantities[travelerId] = qty;
      }
    });
    return quantities;
  }

  async loadInventory() {
    this.items = await window.db.getAllItems();
    this.locations = await window.db.getAllLocations();
    this.travelers = await window.db.getAllTravelers();
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

    // Initialize swipe-to-delete
    if (!this.swipeInitialized) {
      window.app.initSwipeToDelete(
        container,
        '.item-card',
        async (id) => {
          await window.db.deleteItem(id);
          await this.loadInventory();
        }
      );
      this.swipeInitialized = true;
    }
  }

  renderItemCard(item) {
    const location = this.locations.find(l => l.id === item.storage_location);
    const locationName = location?.name || 'No location';

    const badges = [];
    if (item.is_critical) badges.push('<span class="badge critical">Critical</span>');
    if (item.is_permanent) badges.push('<span class="badge permanent">Permanent</span>');

    const icon = item.icon || this.getCategoryIcon(item.category);

    return `
      <div class="item-card swipeable-item" data-id="${item.id}">
        <div class="item-content" onclick="inventory.showItemForm('${item.id}')">
          <div class="item-icon">${icon}</div>
          <div class="item-details">
            <div class="item-name">${this.escapeHtml(item.name)}</div>
            <div class="item-meta">${this.escapeHtml(locationName)} • ${item.quantity || 1}x</div>
          </div>
          <div class="item-badges">${badges.join('')}</div>
        </div>
        <div class="delete-action">Delete</div>
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

    // Refresh travelers list
    this.travelers = await window.db.getAllTravelers();

    // Reset form
    const form = document.getElementById('item-form');
    form.reset();

    let travelerQuantities = {};

    // If editing, populate form
    let selectedIcon = '';
    if (itemId) {
      const item = await window.db.getItem(itemId);
      if (item) {
        document.getElementById('item-name').value = item.name || '';
        document.getElementById('item-category').value = item.category || '';
        document.getElementById('item-location').value = item.storage_location || '';
        document.getElementById('item-quantity').value = item.quantity || 1;
        document.getElementById('item-icon').value = item.icon || '';
        selectedIcon = item.icon || '';
        document.getElementById('item-permanent').checked = !!item.is_permanent;
        document.getElementById('item-critical').checked = !!item.is_critical;
        document.getElementById('item-purchase').value = item.purchase_timing || '';
        document.getElementById('item-notes').value = item.notes || '';
        travelerQuantities = item.traveler_quantities || {};
      }
    }

    // Update icon picker button display
    this.updateIconDisplay(selectedIcon);

    // Render traveler quantity inputs
    this.renderTravelerQuantityInputs(travelerQuantities);

    // Update visibility based on category
    this.updateTravelerQuantitiesVisibility();

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

    const category = document.getElementById('item-category').value;

    const item = {
      name: document.getElementById('item-name').value.trim(),
      category: category,
      storage_location: document.getElementById('item-location').value,
      quantity: parseInt(document.getElementById('item-quantity').value) || 1,
      icon: document.getElementById('item-icon').value.trim(),
      is_permanent: document.getElementById('item-permanent').checked ? 1 : 0,
      is_critical: document.getElementById('item-critical').checked ? 1 : 0,
      purchase_timing: document.getElementById('item-purchase').value || null,
      notes: document.getElementById('item-notes').value.trim() || null
    };

    // For personal categories, save traveler quantities
    if (PERSONAL_CATEGORIES.includes(category) && this.travelers.length > 0) {
      item.traveler_quantities = this.getTravelerQuantitiesFromForm();
    }

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

  // Icon Picker Methods
  updateIconDisplay(icon) {
    const displayEl = document.getElementById('selected-icon');
    const inputEl = document.getElementById('item-icon');
    if (displayEl) {
      displayEl.textContent = icon || '📦';
    }
    if (inputEl) {
      inputEl.value = icon || '';
    }
  }

  showIconPicker() {
    const grid = document.getElementById('icon-picker-grid');
    const currentIcon = document.getElementById('item-icon').value;

    // Render icon grid
    grid.innerHTML = ICON_CHOICES.map(icon => `
      <button type="button" class="icon-option ${icon === currentIcon ? 'selected' : ''}"
              onclick="inventory.selectIcon('${icon}')">
        ${icon}
      </button>
    `).join('');

    document.getElementById('icon-picker-modal').classList.remove('hidden');
  }

  closeIconPicker() {
    document.getElementById('icon-picker-modal').classList.add('hidden');
  }

  selectIcon(icon) {
    this.updateIconDisplay(icon);
    this.closeIconPicker();
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

  // Export inventory to CSV
  async exportToCSV() {
    const items = await window.db.getAllItems();

    const headers = ['name', 'category', 'storage_location', 'is_permanent', 'is_critical', 'purchase_timing', 'icon', 'quantity', 'notes'];

    const csvRows = [headers.join(',')];

    for (const item of items) {
      const row = headers.map(header => {
        let val = item[header] ?? '';
        // Escape commas and quotes in values
        if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
          val = '"' + val.replace(/"/g, '""') + '"';
        }
        return val;
      });
      csvRows.push(row.join(','));
    }

    const csv = csvRows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `camperpack-inventory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  }

  // Import inventory from CSV
  async importFromCSV(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = e.target.result;
          const items = this.parseCSV(text);

          let imported = 0;
          for (const item of items) {
            if (item.name) { // Skip empty rows
              await window.db.saveItem(item);
              imported++;
            }
          }

          await this.loadInventory();
          resolve(imported);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  // Parse CSV text into array of objects
  parseCSV(text) {
    const lines = text.split('\n');
    const items = [];
    let headers = null;

    for (let line of lines) {
      line = line.trim();

      // Skip empty lines and comments
      if (!line || line.startsWith('#')) continue;

      // Parse CSV line (handles quoted values)
      const values = this.parseCSVLine(line);

      // First non-comment line is headers
      if (!headers) {
        headers = values.map(h => h.trim().toLowerCase());
        continue;
      }

      // Create item object
      const item = {};
      headers.forEach((header, i) => {
        let val = values[i]?.trim() ?? '';

        // Convert numeric fields
        if (header === 'is_permanent' || header === 'is_critical') {
          item[header] = val === '1' || val.toLowerCase() === 'true' ? 1 : 0;
        } else if (header === 'quantity') {
          item[header] = parseInt(val) || 1;
        } else if (val === '') {
          item[header] = null;
        } else {
          item[header] = val;
        }
      });

      if (item.name) {
        items.push(item);
      }
    }

    return items;
  }

  // Parse a single CSV line, handling quoted values
  parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (inQuotes) {
        if (char === '"' && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else if (char === '"') {
          inQuotes = false;
        } else {
          current += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ',') {
          values.push(current);
          current = '';
        } else {
          current += char;
        }
      }
    }
    values.push(current);

    return values;
  }

  // Clear all inventory (for reimport)
  async clearInventory() {
    if (!confirm('Delete ALL inventory items? This cannot be undone.')) {
      return false;
    }

    const items = await window.db.getAllItems();
    for (const item of items) {
      await window.db.deleteItem(item.id);
    }

    await this.loadInventory();
    return true;
  }
}

// Export singleton
window.inventory = new InventoryManager();
