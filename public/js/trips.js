/**
 * CamperPack - Trips and Packing List Management
 */

class TripsManager {
  constructor() {
    this.currentTrip = null;
    this.tripItems = [];
    this.sortMode = 'workflow'; // workflow, location, category
    this.locations = [];
  }

  async init() {
    this.bindEvents();
    this.locations = await window.db.getAllLocations();
    await this.loadHomeScreen();
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

  async loadHomeScreen() {
    await this.renderTemplatesList();
    await this.renderTripsList();
    await this.loadCurrentTrip();
  }

  async renderTemplatesList() {
    const container = document.getElementById('home-templates-list');
    if (!container) return;

    const templates = await window.db.getAllTemplates();

    if (templates.length === 0) {
      container.innerHTML = '<p class="empty-text">No templates found</p>';
      return;
    }

    // Get item counts for each template
    const templateHtml = await Promise.all(templates.map(async (template) => {
      const templateItems = await window.db.getTemplateItems(template.id);
      const itemCount = templateItems.length;

      return `
        <div class="template-card" onclick="templates.showTemplateEditor('${template.id}')">
          <div class="template-name">${this.escapeHtml(template.name)}</div>
          <div class="template-meta">${itemCount} items</div>
        </div>
      `;
    }));

    container.innerHTML = templateHtml.join('');
  }

  async renderTripsList() {
    const container = document.getElementById('trips-list');
    if (!container) return;

    const trips = await window.db.getAllTrips();

    if (trips.length === 0) {
      container.innerHTML = '<p class="empty-text">No trips yet. Create one to get started!</p>';
      return;
    }

    // Sort trips: active first, then by date descending
    trips.sort((a, b) => {
      const statusOrder = { planning: 0, packing: 1, traveling: 2, completed: 3 };
      const statusDiff = (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
      if (statusDiff !== 0) return statusDiff;
      return new Date(b.start_date) - new Date(a.start_date);
    });

    container.innerHTML = trips.map(trip => this.renderTripCard(trip)).join('');
  }

  renderTripCard(trip) {
    const startDate = trip.start_date ? new Date(trip.start_date).toLocaleDateString() : '';
    const endDate = trip.end_date ? new Date(trip.end_date).toLocaleDateString() : '';
    const dateRange = startDate && endDate ? `${startDate} - ${endDate}` : '';

    const statusLabels = {
      planning: 'Planning',
      packing: 'Packing',
      traveling: 'Traveling',
      completed: 'Completed'
    };

    const statusClass = trip.status || 'planning';

    return `
      <div class="trip-list-card ${statusClass}" onclick="trips.openTrip('${trip.id}')">
        <div class="trip-card-content">
          <div class="trip-card-name">${this.escapeHtml(trip.name)}</div>
          <div class="trip-card-details">
            ${trip.destination ? `<span class="trip-destination">${this.escapeHtml(trip.destination)}</span>` : ''}
            ${dateRange ? `<span class="trip-dates">${dateRange}</span>` : ''}
          </div>
        </div>
        <div class="trip-card-status">
          <span class="status-badge ${statusClass}">${statusLabels[trip.status] || trip.status}</span>
        </div>
      </div>
    `;
  }

  async openTrip(tripId) {
    const trip = await window.db.getTrip(tripId);
    if (!trip) return;

    this.currentTrip = trip;
    await this.loadPackingList();
    window.app.showScreen('packing');
  }

  async loadCurrentTrip() {
    this.currentTrip = await window.db.getCurrentTrip();

    const section = document.getElementById('current-trip-section');
    const card = document.getElementById('current-trip-card');

    if (!section || !card) return;

    if (this.currentTrip) {
      section.classList.remove('hidden');
      card.innerHTML = this.renderTripCard(this.currentTrip);
      await this.loadPackingList();
    } else {
      section.classList.add('hidden');
    }
  }

  async handleTripSubmit(e) {
    e.preventDefault();

    const templateId = document.getElementById('trip-template').value;
    if (!templateId) {
      alert('Please select a trip template');
      return;
    }

    // Check if template has items
    const templateItems = await window.db.getTemplateItems(templateId);
    if (templateItems.length === 0) {
      const proceed = confirm('This template has no items configured. Would you like to configure it first?');
      if (proceed) {
        window.templates.showTemplateEditor(templateId);
        return;
      }
    }

    const trip = {
      name: document.getElementById('trip-name').value.trim(),
      template_id: templateId,
      start_date: document.getElementById('trip-start').value,
      end_date: document.getElementById('trip-end').value,
      destination: document.getElementById('trip-destination').value.trim(),
      status: 'packing'
    };

    const savedTrip = await window.db.saveTrip(trip);

    // Generate packing list from template
    await this.generatePackingList(savedTrip);

    this.currentTrip = savedTrip;
    await this.loadPackingList();

    window.app.showScreen('packing');
  }

  async generatePackingList(trip) {
    // Get items from template
    const templateItems = await window.db.getTemplateItems(trip.template_id);

    if (templateItems.length === 0) {
      // Fallback: use all items if template is empty
      const allItems = await window.db.getAllItems();
      for (const item of allItems) {
        if (!item.storage_location) continue;
        await window.db.saveTripItem({
          trip_id: trip.id,
          item_id: item.id,
          packed: 0
        });
      }
      return;
    }

    // Get full item details and create trip items
    for (const ti of templateItems) {
      const item = await window.db.getItem(ti.item_id);
      if (!item) continue;

      await window.db.saveTripItem({
        trip_id: trip.id,
        item_id: item.id,
        packed: 0
      });
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

  changeSortMode(mode) {
    this.sortMode = mode;
    this.renderPackingList();
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

    const container = document.getElementById('packing-sections');
    if (!container) return;

    // Render based on sort mode
    switch (this.sortMode) {
      case 'location':
        this.renderByLocation(container);
        break;
      case 'category':
        this.renderByCategory(container);
        break;
      default:
        this.renderByWorkflow(container);
    }
  }

  renderByWorkflow(container) {
    // Get locations for grouping
    const locationsMap = new Map(this.locations.map(l => [l.id, l]));

    // Group items by workflow phase
    const critical = this.tripItems.filter(ti => ti.item.is_critical);
    const houseItems = this.tripItems.filter(ti =>
      ti.item.storage_location === 'house' && !ti.item.is_critical
    );
    const permanent = this.tripItems.filter(ti =>
      ti.item.is_permanent && !ti.item.is_critical
    );
    const purchaseBefore = this.tripItems.filter(ti =>
      ti.item.purchase_timing === 'before_arrival' && !ti.item.is_critical
    );
    const purchaseAfter = this.tripItems.filter(ti =>
      ti.item.purchase_timing === 'after_arrival'
    );

    let html = '';

    if (critical.length > 0) {
      html += this.renderSection('Critical Items', critical, 'critical');
    }
    if (houseItems.length > 0) {
      html += this.renderSection('Pack from House', houseItems);
    }
    if (permanent.length > 0) {
      html += this.renderSection('Verify in Trailer/Truck', permanent);
    }
    if (purchaseBefore.length > 0) {
      html += this.renderSection('Purchase Before Trip', purchaseBefore);
    }
    if (purchaseAfter.length > 0) {
      html += this.renderSection('Can Purchase After Arrival', purchaseAfter);
    }

    container.innerHTML = html || '<p class="empty-text">No items in packing list</p>';
    this.bindChecklistEvents(container);
  }

  renderByLocation(container) {
    // Sort locations by area then sort_order
    const sortedLocations = [...this.locations].sort((a, b) => {
      const areaOrder = { house: 0, truck: 1, trailer: 2 };
      const areaDiff = (areaOrder[a.area] || 99) - (areaOrder[b.area] || 99);
      if (areaDiff !== 0) return areaDiff;
      return (a.sort_order || 0) - (b.sort_order || 0);
    });

    // Group items by location
    const itemsByLocation = {};
    for (const ti of this.tripItems) {
      const loc = ti.item.storage_location || 'unknown';
      if (!itemsByLocation[loc]) {
        itemsByLocation[loc] = [];
      }
      itemsByLocation[loc].push(ti);
    }

    let html = '';
    let currentArea = null;

    for (const loc of sortedLocations) {
      const items = itemsByLocation[loc.id];
      if (!items || items.length === 0) continue;

      // Add area header if changed
      if (loc.area !== currentArea) {
        currentArea = loc.area;
        const areaNames = { house: 'House', truck: 'Truck', trailer: 'Trailer' };
        html += `<div class="area-header">${areaNames[currentArea] || currentArea}</div>`;
      }

      html += this.renderSection(loc.name, items);
    }

    container.innerHTML = html || '<p class="empty-text">No items in packing list</p>';
    this.bindChecklistEvents(container);
  }

  renderByCategory(container) {
    const categoryNames = {
      clothing: 'Clothing',
      toiletries: 'Toiletries',
      meds: 'Medicines',
      pet: 'Pet Supplies',
      electronics: 'Electronics',
      food: 'Food & Drinks',
      gear: 'Camping Gear',
      kitchen: 'Kitchen Items',
      bedding: 'Bedding',
      tools: 'Tools',
      other: 'Other'
    };

    // Group items by category
    const itemsByCategory = {};
    for (const ti of this.tripItems) {
      const cat = ti.item.category || 'other';
      if (!itemsByCategory[cat]) {
        itemsByCategory[cat] = [];
      }
      itemsByCategory[cat].push(ti);
    }

    // Sort categories
    const categories = Object.keys(itemsByCategory).sort((a, b) => {
      const nameA = categoryNames[a] || a;
      const nameB = categoryNames[b] || b;
      return nameA.localeCompare(nameB);
    });

    let html = '';

    for (const cat of categories) {
      const items = itemsByCategory[cat];
      const catName = categoryNames[cat] || cat;
      html += this.renderSection(catName, items);
    }

    container.innerHTML = html || '<p class="empty-text">No items in packing list</p>';
    this.bindChecklistEvents(container);
  }

  renderSection(title, items, extraClass = '') {
    // Sort items: unpacked first, then by name
    items.sort((a, b) => {
      if (a.packed !== b.packed) return a.packed - b.packed;
      return a.item.name.localeCompare(b.item.name);
    });

    return `
      <div class="packing-section ${extraClass}">
        <h3>${title} <span class="section-count">(${items.filter(i => i.packed).length}/${items.length})</span></h3>
        <div class="checklist">
          ${items.map(ti => this.renderChecklistItem(ti)).join('')}
        </div>
      </div>
    `;
  }

  renderChecklistItem(tripItem) {
    const item = tripItem.item;
    const icon = item.icon || this.getCategoryIcon(item.category);
    const location = this.getLocationName(item.storage_location);

    const badges = [];
    if (item.is_critical) badges.push('<span class="badge-sm critical">!</span>');

    return `
      <div class="checklist-item ${tripItem.packed ? 'checked' : ''}" data-id="${tripItem.id}">
        <div class="checklist-checkbox"></div>
        <div class="checklist-icon">${icon}</div>
        <div class="checklist-info">
          <div class="checklist-name">${this.escapeHtml(item.name)} ${badges.join('')}</div>
          <div class="checklist-location">${location}</div>
        </div>
      </div>
    `;
  }

  bindChecklistEvents(container) {
    container.querySelectorAll('.checklist-item').forEach(el => {
      el.addEventListener('click', () => this.togglePacked(el.dataset.id));
    });
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

    alert('You\'re all set! Have a great trip!');
    window.app.showScreen('home');
    await this.loadHomeScreen();
  }

  getLocationName(locationId) {
    if (!locationId) return 'No location';
    const location = this.locations.find(l => l.id === locationId);
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
    await this.loadHomeScreen();
  }
}

// Export singleton
window.trips = new TripsManager();
