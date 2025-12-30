/**
 * CamperPack - Trips and Packing List Management
 */

class TripsManager {
  constructor() {
    this.currentTrip = null;
    this.tripItems = [];
  }

  async init() {
    this.bindEvents();
    await this.loadCurrentTrip();
  }

  bindEvents() {
    // New trip form
    const tripForm = document.getElementById('trip-form');
    if (tripForm) {
      tripForm.addEventListener('submit', (e) => this.handleTripSubmit(e));

      const cancelBtn = tripForm.querySelector('[data-action="cancel"]');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => window.app.showScreen('home'));
      }
    }

    // Pre-departure button
    const preDepartureBtn = document.getElementById('pre-departure-btn');
    if (preDepartureBtn) {
      preDepartureBtn.addEventListener('click', () => window.app.showScreen('pre-departure'));
    }

    // Ready to go button
    const readyBtn = document.getElementById('ready-to-go-btn');
    if (readyBtn) {
      readyBtn.addEventListener('click', () => this.handleReadyToGo());
    }
  }

  async loadCurrentTrip() {
    this.currentTrip = await window.db.getCurrentTrip();
    this.updateTripSummary();

    if (this.currentTrip) {
      await this.loadPackingList();
    }
  }

  updateTripSummary() {
    const summary = document.getElementById('current-trip-summary');
    const info = summary?.querySelector('.trip-info');

    if (!summary || !info) return;

    if (this.currentTrip) {
      summary.classList.remove('hidden');
      const start = new Date(this.currentTrip.start_date).toLocaleDateString();
      const end = new Date(this.currentTrip.end_date).toLocaleDateString();
      info.innerHTML = `
        <strong>${this.escapeHtml(this.currentTrip.name)}</strong><br>
        ${start} - ${end}<br>
        ${this.currentTrip.destination ? this.escapeHtml(this.currentTrip.destination) : ''}
      `;
    } else {
      summary.classList.add('hidden');
    }
  }

  async handleTripSubmit(e) {
    e.preventDefault();

    const trip = {
      name: document.getElementById('trip-name').value.trim(),
      template_id: document.getElementById('trip-template').value,
      start_date: document.getElementById('trip-start').value,
      end_date: document.getElementById('trip-end').value,
      destination: document.getElementById('trip-destination').value.trim(),
      status: 'planning'
    };

    const savedTrip = await window.db.saveTrip(trip);

    // Generate packing list from template
    await this.generatePackingList(savedTrip);

    this.currentTrip = savedTrip;
    await this.loadPackingList();

    window.app.showScreen('packing');
  }

  async generatePackingList(trip) {
    // Get all items
    const items = await window.db.getAllItems();

    // Calculate trip duration
    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);
    const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    // Get template
    const template = await window.db.getTemplate(trip.template_id);
    const clothingMultiplier = template?.clothing_multiplier || 1.0;

    for (const item of items) {
      // Skip items with no location (not fully set up)
      if (!item.storage_location) continue;

      // Calculate quantity needed based on category and duration
      let quantityNeeded = item.quantity || 1;

      if (item.category === 'clothing' && clothingMultiplier > 0) {
        quantityNeeded = Math.ceil(duration * clothingMultiplier * (item.quantity || 1));
      }

      const tripItem = {
        trip_id: trip.id,
        item_id: item.id,
        quantity_needed: quantityNeeded,
        packed: 0,
        notes: null
      };

      await window.db.saveTripItem(tripItem);
    }
  }

  async loadPackingList() {
    if (!this.currentTrip) return;

    this.tripItems = await window.db.getTripItems(this.currentTrip.id);

    // Get all items details
    const items = await window.db.getAllItems();
    const itemsMap = new Map(items.map(i => [i.id, i]));

    // Enrich trip items with item details
    this.tripItems = this.tripItems.map(ti => ({
      ...ti,
      item: itemsMap.get(ti.item_id)
    })).filter(ti => ti.item);

    this.renderPackingList();
    this.renderPreDepartureList();
  }

  renderPackingList() {
    const tripName = document.getElementById('packing-trip-name');
    if (tripName && this.currentTrip) {
      tripName.textContent = this.currentTrip.name;
    }

    // Update progress
    const packedCount = this.tripItems.filter(ti => ti.packed).length;
    const totalCount = this.tripItems.length;

    document.getElementById('packed-count').textContent = packedCount;
    document.getElementById('total-count').textContent = totalCount;

    // Get locations for grouping
    const locations = window.db.locations || [];
    const locationsMap = new Map(locations.map(l => [l.id, l]));

    // Group items
    const critical = this.tripItems.filter(ti => ti.item.is_critical);
    const houseItems = this.tripItems.filter(ti =>
      ti.item.storage_location === 'house' ||
      (!ti.item.is_permanent && locationsMap.get(ti.item.storage_location)?.area !== 'house')
    );
    const permanent = this.tripItems.filter(ti => ti.item.is_permanent);
    const purchaseBefore = this.tripItems.filter(ti => ti.item.purchase_timing === 'before_arrival');
    const purchaseAfter = this.tripItems.filter(ti => ti.item.purchase_timing === 'after_arrival');

    // Render each section
    this.renderChecklistSection('critical-items', critical);
    this.renderChecklistSection('house-items', houseItems.filter(ti => !ti.item.is_critical));
    this.renderChecklistSection('permanent-items', permanent.filter(ti => !ti.item.is_critical));
    this.renderChecklistSection('purchase-before', purchaseBefore);
    this.renderChecklistSection('purchase-after', purchaseAfter);
  }

  renderChecklistSection(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (items.length === 0) {
      container.innerHTML = '<p class="empty-text">No items</p>';
      return;
    }

    container.innerHTML = items.map(ti => this.renderChecklistItem(ti)).join('');

    // Add click handlers
    container.querySelectorAll('.checklist-item').forEach(el => {
      el.addEventListener('click', () => this.togglePacked(el.dataset.id));
    });
  }

  renderChecklistItem(tripItem) {
    const item = tripItem.item;
    const icon = item.icon || this.getCategoryIcon(item.category);
    const location = this.getLocationName(item.storage_location);

    return `
      <div class="checklist-item ${tripItem.packed ? 'checked' : ''}" data-id="${tripItem.id}">
        <div class="checklist-checkbox"></div>
        <div class="checklist-icon">${icon}</div>
        <div class="checklist-info">
          <div class="checklist-name">${this.escapeHtml(item.name)}</div>
          <div class="checklist-location">${location}</div>
        </div>
      </div>
    `;
  }

  async togglePacked(tripItemId) {
    await window.db.toggleTripItemPacked(tripItemId);
    await this.loadPackingList();
  }

  renderPreDepartureList() {
    const container = document.getElementById('critical-checklist');
    if (!container) return;

    const critical = this.tripItems.filter(ti => ti.item.is_critical);

    if (critical.length === 0) {
      container.innerHTML = '<p>No critical items defined. Add critical items in your inventory.</p>';
      return;
    }

    container.innerHTML = critical.map(ti => {
      const item = ti.item;
      const icon = item.icon || this.getCategoryIcon(item.category);
      return `
        <div class="critical-item ${ti.packed ? 'verified' : ''}" data-id="${ti.id}">
          <div class="checklist-checkbox"></div>
          <div class="checklist-icon">${icon}</div>
          <div class="checklist-info">
            <div class="checklist-name">${this.escapeHtml(item.name)}</div>
            <div class="checklist-location">${this.getLocationName(item.storage_location)}</div>
          </div>
        </div>
      `;
    }).join('');

    // Add click handlers
    container.querySelectorAll('.critical-item').forEach(el => {
      el.addEventListener('click', () => this.togglePacked(el.dataset.id));
    });

    // Update status
    this.updateDepartureStatus(critical);
  }

  updateDepartureStatus(criticalItems) {
    const allVerified = criticalItems.every(ti => ti.packed);
    const statusDiv = document.getElementById('departure-status');
    const readyBtn = document.getElementById('ready-to-go-btn');

    if (allVerified) {
      statusDiv.innerHTML = `
        <div class="status-complete">
          <span class="status-icon">✓</span>
          <span>All critical items verified!</span>
        </div>
      `;
      readyBtn.disabled = false;
    } else {
      const remaining = criticalItems.filter(ti => !ti.packed).length;
      statusDiv.innerHTML = `
        <div class="status-incomplete">
          <span class="status-icon">⚠</span>
          <span>${remaining} item${remaining !== 1 ? 's' : ''} not verified</span>
        </div>
      `;
      readyBtn.disabled = true;
    }
  }

  async handleReadyToGo() {
    if (!this.currentTrip) return;

    // Update trip status
    this.currentTrip.status = 'traveling';
    await window.db.saveTrip(this.currentTrip);

    alert('🎉 You\'re all set! Have a great trip!');
    window.app.showScreen('home');
    await this.loadCurrentTrip();
  }

  getLocationName(locationId) {
    if (!locationId) return 'No location';
    const locations = window.db.locations || [];
    const location = locations.find(l => l.id === locationId);
    return location?.name || locationId;
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

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Complete trip
  async completeTrip() {
    if (!this.currentTrip) return;

    this.currentTrip.status = 'completed';
    await window.db.saveTrip(this.currentTrip);
    this.currentTrip = null;
    this.tripItems = [];

    window.app.showScreen('home');
    this.updateTripSummary();
  }
}

// Export singleton
window.trips = new TripsManager();
