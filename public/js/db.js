/**
 * CamperPack - IndexedDB Local Storage with Cloud Sync
 */

const DB_NAME = 'camperpack';
const DB_VERSION = 3; // Added travelers store

class CamperPackDB {
  constructor() {
    this.db = null;
    this.syncQueue = [];
    this.isOnline = navigator.onLine;

    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Items store
        if (!db.objectStoreNames.contains('items')) {
          const itemsStore = db.createObjectStore('items', { keyPath: 'id' });
          itemsStore.createIndex('category', 'category', { unique: false });
          itemsStore.createIndex('storage_location', 'storage_location', { unique: false });
          itemsStore.createIndex('is_critical', 'is_critical', { unique: false });
          itemsStore.createIndex('is_permanent', 'is_permanent', { unique: false });
        }

        // Trip templates store
        if (!db.objectStoreNames.contains('templates')) {
          const templatesStore = db.createObjectStore('templates', { keyPath: 'id' });
          templatesStore.createIndex('trip_type', 'trip_type', { unique: false });
        }

        // Trips store
        if (!db.objectStoreNames.contains('trips')) {
          const tripsStore = db.createObjectStore('trips', { keyPath: 'id' });
          tripsStore.createIndex('status', 'status', { unique: false });
        }

        // Trip items store
        if (!db.objectStoreNames.contains('tripItems')) {
          const tripItemsStore = db.createObjectStore('tripItems', { keyPath: 'id' });
          tripItemsStore.createIndex('trip_id', 'trip_id', { unique: false });
          tripItemsStore.createIndex('packed', 'packed', { unique: false });
        }

        // Storage locations store
        if (!db.objectStoreNames.contains('locations')) {
          const locationsStore = db.createObjectStore('locations', { keyPath: 'id' });
          locationsStore.createIndex('area', 'area', { unique: false });
        }

        // Template items store (items associated with each template)
        if (!db.objectStoreNames.contains('templateItems')) {
          const templateItemsStore = db.createObjectStore('templateItems', { keyPath: 'id' });
          templateItemsStore.createIndex('template_id', 'template_id', { unique: false });
          templateItemsStore.createIndex('item_id', 'item_id', { unique: false });
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('synced', 'synced', { unique: false });
        }

        // Travelers store
        if (!db.objectStoreNames.contains('travelers')) {
          const travelersStore = db.createObjectStore('travelers', { keyPath: 'id' });
          travelersStore.createIndex('name', 'name', { unique: false });
          travelersStore.createIndex('sort_order', 'sort_order', { unique: false });
        }
      };
    });
  }

  // Generate unique ID
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generic CRUD operations
  async getAll(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async get(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async put(storeName, data, trackSync = true) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      // Ensure updated_at is set
      data.updated_at = new Date().toISOString();

      const request = store.put(data);
      request.onsuccess = async () => {
        if (trackSync) {
          await this.addToSyncQueue(storeName, data.id, 'upsert', data);
        }
        resolve(data);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName, id, trackSync = true) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      request.onsuccess = async () => {
        if (trackSync) {
          await this.addToSyncQueue(storeName, id, 'delete', null);
        }
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getByIndex(storeName, indexName, value) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Items specific methods
  async getAllItems() {
    return this.getAll('items');
  }

  async getItem(id) {
    return this.get('items', id);
  }

  async saveItem(item) {
    if (!item.id) {
      item.id = this.generateId();
      item.created_at = new Date().toISOString();
    }
    return this.put('items', item);
  }

  async deleteItem(id) {
    return this.delete('items', id);
  }

  async getItemsByCategory(category) {
    return this.getByIndex('items', 'category', category);
  }

  async getItemsByLocation(location) {
    return this.getByIndex('items', 'storage_location', location);
  }

  async getCriticalItems() {
    return this.getByIndex('items', 'is_critical', 1);
  }

  async getPermanentItems() {
    return this.getByIndex('items', 'is_permanent', 1);
  }

  async getHouseItems() {
    const items = await this.getAllItems();
    return items.filter(item =>
      item.storage_location === 'house' ||
      (!item.is_permanent && item.storage_location)
    );
  }

  // Templates methods
  async getAllTemplates() {
    return this.getAll('templates');
  }

  async getTemplate(id) {
    return this.get('templates', id);
  }

  async saveTemplate(template) {
    if (!template.id) {
      template.id = this.generateId();
      template.created_at = new Date().toISOString();
    }
    return this.put('templates', template);
  }

  // Template Items methods (items associated with templates)
  async getTemplateItems(templateId) {
    return this.getByIndex('templateItems', 'template_id', templateId);
  }

  async getAllTemplateItems() {
    return this.getAll('templateItems');
  }

  async saveTemplateItem(templateItem) {
    if (!templateItem.id) {
      templateItem.id = `${templateItem.template_id}-${templateItem.item_id}`;
      templateItem.created_at = new Date().toISOString();
    }
    return this.put('templateItems', templateItem);
  }

  async deleteTemplateItem(templateId, itemId) {
    const id = `${templateId}-${itemId}`;
    return this.delete('templateItems', id);
  }

  async setTemplateItems(templateId, itemIds) {
    // Remove all existing items for this template
    const existing = await this.getTemplateItems(templateId);
    for (const item of existing) {
      await this.delete('templateItems', item.id);
    }

    // Add new items
    for (const itemId of itemIds) {
      await this.saveTemplateItem({
        template_id: templateId,
        item_id: itemId
      });
    }
  }

  async isItemInTemplate(templateId, itemId) {
    const items = await this.getTemplateItems(templateId);
    return items.some(ti => ti.item_id === itemId);
  }

  // Trips methods
  async getAllTrips() {
    return this.getAll('trips');
  }

  async getTrip(id) {
    return this.get('trips', id);
  }

  async saveTrip(trip) {
    if (!trip.id) {
      trip.id = this.generateId();
      trip.created_at = new Date().toISOString();
    }
    return this.put('trips', trip);
  }

  async deleteTrip(id) {
    // Also delete associated trip items
    const tripItems = await this.getTripItems(id);
    for (const item of tripItems) {
      await this.delete('tripItems', item.id, false);
    }
    return this.delete('trips', id);
  }

  async getCurrentTrip() {
    const trips = await this.getAllTrips();
    return trips.find(t => t.status === 'planning' || t.status === 'packing') || null;
  }

  // Trip Items methods
  async getTripItems(tripId) {
    return this.getByIndex('tripItems', 'trip_id', tripId);
  }

  async saveTripItem(tripItem) {
    if (!tripItem.id) {
      tripItem.id = this.generateId();
    }
    return this.put('tripItems', tripItem);
  }

  async toggleTripItemPacked(id) {
    const item = await this.get('tripItems', id);
    if (item) {
      item.packed = item.packed ? 0 : 1;
      item.packed_at = item.packed ? new Date().toISOString() : null;
      return this.put('tripItems', item);
    }
  }

  // Storage Locations methods
  async getAllLocations() {
    return this.getAll('locations');
  }

  async getLocationsByArea(area) {
    return this.getByIndex('locations', 'area', area);
  }

  // Travelers methods
  async getAllTravelers() {
    const travelers = await this.getAll('travelers');
    return travelers.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }

  async getTraveler(id) {
    return this.get('travelers', id);
  }

  async saveTraveler(traveler) {
    if (!traveler.id) {
      traveler.id = this.generateId();
      traveler.created_at = new Date().toISOString();
      // Set sort_order to end of list
      const all = await this.getAllTravelers();
      traveler.sort_order = all.length;
    }
    return this.put('travelers', traveler);
  }

  async deleteTraveler(id) {
    return this.delete('travelers', id);
  }

  // Sync Queue methods
  async addToSyncQueue(tableName, recordId, action, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction('syncQueue', 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const request = store.add({
        table_name: tableName,
        record_id: recordId,
        action: action,
        data: data ? JSON.stringify(data) : null,
        created_at: new Date().toISOString(),
        synced: 0
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingSyncItems() {
    return this.getByIndex('syncQueue', 'synced', 0);
  }

  async markSynced(id) {
    const item = await this.get('syncQueue', id);
    if (item) {
      item.synced = 1;
      return this.put('syncQueue', item, false);
    }
  }

  async clearSyncedItems() {
    const synced = await this.getByIndex('syncQueue', 'synced', 1);
    for (const item of synced) {
      await this.delete('syncQueue', item.id, false);
    }
  }

  // Sync with cloud (bidirectional)
  async syncWithCloud() {
    if (!this.isOnline) {
      console.log('Offline - sync skipped');
      return { success: false, reason: 'offline' };
    }

    try {
      // Step 1: Push local changes to cloud
      const pending = await this.getPendingSyncItems();
      let pushed = 0;

      if (pending.length > 0) {
        const pushResponse = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ changes: pending })
        });

        if (pushResponse.ok) {
          // Mark items as synced
          for (const item of pending) {
            await this.markSynced(item.id);
          }
          await this.clearSyncedItems();
          pushed = pending.length;
        }
      }

      // Step 2: Pull all data from cloud
      const pullResponse = await fetch('/api/sync', {
        method: 'GET'
      });

      if (!pullResponse.ok) {
        throw new Error('Failed to pull from cloud');
      }

      const cloudData = await pullResponse.json();
      let pulled = 0;

      // Merge cloud data into local (cloud wins for conflicts)
      if (cloudData.items && cloudData.items.length > 0) {
        for (const item of cloudData.items) {
          await this.put('items', item, false); // Don't re-queue for sync
          pulled++;
        }
      }

      if (cloudData.templates && cloudData.templates.length > 0) {
        for (const template of cloudData.templates) {
          await this.put('templates', template, false);
        }
      }

      if (cloudData.trips && cloudData.trips.length > 0) {
        for (const trip of cloudData.trips) {
          await this.put('trips', trip, false);
        }
      }

      if (cloudData.locations && cloudData.locations.length > 0) {
        for (const location of cloudData.locations) {
          await this.put('locations', location, false);
        }
      }

      if (cloudData.templateItems && cloudData.templateItems.length > 0) {
        for (const ti of cloudData.templateItems) {
          await this.put('templateItems', ti, false);
        }
      }

      if (cloudData.tripItems && cloudData.tripItems.length > 0) {
        for (const ti of cloudData.tripItems) {
          await this.put('tripItems', ti, false);
        }
      }

      if (cloudData.travelers && cloudData.travelers.length > 0) {
        for (const traveler of cloudData.travelers) {
          await this.put('travelers', traveler, false);
        }
      }

      // Update last sync time
      localStorage.setItem('lastSync', new Date().toISOString());

      console.log(`Sync complete: pushed ${pushed}, pulled ${pulled} items`);
      return { success: true, pushed, pulled };
    } catch (error) {
      console.error('Sync error:', error);
      return { success: false, reason: error.message };
    }
  }

  async applyServerChanges(changes) {
    for (const change of changes) {
      const data = JSON.parse(change.data);
      if (change.action === 'delete') {
        await this.delete(change.table_name, change.record_id, false);
      } else {
        await this.put(change.table_name, data, false);
      }
    }
  }

  // Online/Offline handlers
  handleOnline() {
    this.isOnline = true;
    document.getElementById('offline-indicator')?.classList.add('hidden');
    this.syncWithCloud();
  }

  handleOffline() {
    this.isOnline = false;
    document.getElementById('offline-indicator')?.classList.remove('hidden');
  }

  // Initialize with default data
  async seedDefaultData() {
    // Check if already seeded
    const templates = await this.getAllTemplates();
    if (templates.length > 0) {
      return;
    }

    // Seed default templates
    const defaultTemplates = [
      { id: 'weekend', name: 'Weekend Trip', duration_days: 3, trip_type: 'weekend', clothing_multiplier: 1.0, notes: 'Short 2-3 day trip' },
      { id: 'week', name: 'Week Trip', duration_days: 7, trip_type: 'week', clothing_multiplier: 0.8, notes: '5-7 day trip with laundry option' },
      { id: 'extended', name: 'Extended Stay', duration_days: 14, trip_type: 'extended', clothing_multiplier: 0.5, notes: '2+ weeks with laundry facilities' },
      { id: 'day', name: 'Day Trip', duration_days: 1, trip_type: 'day', clothing_multiplier: 0.0, notes: 'No overnight stay' },
      { id: 'special', name: 'Special Event', duration_days: 4, trip_type: 'special', clothing_multiplier: 1.0, notes: 'Festival, gathering, or special occasion' }
    ];

    for (const template of defaultTemplates) {
      await this.put('templates', template, false);
    }

    // Seed storage locations
    const locations = [
      // Trailer
      { id: 'pass_thru_main', name: 'Pass-thru main', area: 'trailer', sort_order: 1 },
      { id: 'pass_thru_small', name: 'Pass-thru small', area: 'trailer', sort_order: 2 },
      { id: 'pantry', name: 'Pantry', area: 'trailer', sort_order: 3 },
      { id: 'kitchen_overhead', name: 'Kitchen overhead', area: 'trailer', sort_order: 4 },
      { id: 'tv_cabinet', name: 'TV cabinet', area: 'trailer', sort_order: 5 },
      { id: 'under_table', name: 'Under table', area: 'trailer', sort_order: 6 },
      { id: 'kitchen_drawer_1', name: 'Kitchen drawer 1', area: 'trailer', sort_order: 7 },
      { id: 'kitchen_drawer_2', name: 'Kitchen drawer 2', area: 'trailer', sort_order: 8 },
      { id: 'kitchen_drawer_3', name: 'Kitchen drawer 3', area: 'trailer', sort_order: 9 },
      { id: 'kitchen_drawer_4', name: 'Kitchen drawer 4', area: 'trailer', sort_order: 10 },
      { id: 'under_sink', name: 'Under sink', area: 'trailer', sort_order: 11 },
      { id: 'kitchen_counter', name: 'Kitchen counter', area: 'trailer', sort_order: 12 },
      { id: 'in_sink', name: 'In sink', area: 'trailer', sort_order: 13 },
      { id: 'fridge', name: 'Fridge', area: 'trailer', sort_order: 14 },
      { id: 'key_hooks', name: 'Key hooks', area: 'trailer', sort_order: 15 },
      { id: 'wall_hooks', name: 'Wall hooks', area: 'trailer', sort_order: 16 },
      { id: 'bathroom_cabinet', name: 'Bathroom cabinet', area: 'trailer', sort_order: 17 },
      { id: 'medicine_cabinet', name: 'Medicine cabinet', area: 'trailer', sort_order: 18 },
      { id: 'shower', name: 'Shower', area: 'trailer', sort_order: 19 },
      { id: 'left_bedside', name: 'Left bedside', area: 'trailer', sort_order: 20 },
      { id: 'right_bedside', name: 'Right bedside', area: 'trailer', sort_order: 21 },
      { id: 'under_bed', name: 'Under bed', area: 'trailer', sort_order: 22 },
      // Truck
      { id: 'console', name: 'Console', area: 'truck', sort_order: 30 },
      { id: 'glove_compartment', name: 'Glove compartment', area: 'truck', sort_order: 31 },
      { id: 'front_cab', name: 'Front cab', area: 'truck', sort_order: 32 },
      { id: 'rear_pockets', name: 'Rear pockets', area: 'truck', sort_order: 33 },
      { id: 'rear_under_seat', name: 'Rear under seat', area: 'truck', sort_order: 34 },
      { id: 'rear_seat', name: 'Rear seat', area: 'truck', sort_order: 35 },
      { id: 'truck_bed', name: 'Truck bed', area: 'truck', sort_order: 36 },
      { id: 'bed_trunk', name: 'Bed trunk', area: 'truck', sort_order: 37 },
      // House
      { id: 'house', name: 'House (pack before trip)', area: 'house', sort_order: 50 }
    ];

    for (const location of locations) {
      await this.put('locations', location, false);
    }

    console.log('Default data seeded');
  }
}

// Export singleton instance
window.db = new CamperPackDB();
