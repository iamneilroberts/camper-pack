/**
 * CamperPack - Template Management
 * Allows associating items with trip templates
 */

class TemplatesManager {
  constructor() {
    this.currentTemplateId = null;
    this.items = [];
    this.templateItems = [];
  }

  async init() {
    // Templates are initialized from trips.js when navigating to templates screen
  }

  async showTemplateEditor(templateId) {
    this.currentTemplateId = templateId;

    // Load template details
    const template = await window.db.getTemplate(templateId);
    if (!template) {
      alert('Template not found');
      return;
    }

    // Load all items and template associations
    this.items = await window.db.getAllItems();
    this.templateItems = await window.db.getTemplateItems(templateId);

    // Create set of selected item IDs for quick lookup
    const selectedIds = new Set(this.templateItems.map(ti => ti.item_id));

    // Update page title
    document.getElementById('page-title').textContent = `Edit: ${template.name}`;

    // Show templates screen
    window.app.showScreen('templates');

    // Render the template editor
    this.renderTemplateEditor(template, selectedIds);
  }

  renderTemplateEditor(template, selectedIds) {
    const container = document.getElementById('templates-list');
    if (!container) return;

    // Group items by category
    const itemsByCategory = {};
    for (const item of this.items) {
      const cat = item.category || 'other';
      if (!itemsByCategory[cat]) {
        itemsByCategory[cat] = [];
      }
      itemsByCategory[cat].push(item);
    }

    // Sort categories
    const categories = Object.keys(itemsByCategory).sort();

    // Count selected items
    const selectedCount = selectedIds.size;
    const totalCount = this.items.length;

    container.innerHTML = `
      <div class="template-editor">
        <div class="template-info">
          <h3>${this.escapeHtml(template.name)}</h3>
          <p>${this.escapeHtml(template.notes || '')}</p>
          <p class="template-stats">${selectedCount} of ${totalCount} items selected</p>
        </div>

        <div class="template-actions-bar">
          <button class="btn btn-secondary btn-sm" onclick="templates.selectAll()">Select All</button>
          <button class="btn btn-secondary btn-sm" onclick="templates.deselectAll()">Deselect All</button>
          <button class="btn btn-secondary btn-sm" onclick="templates.selectPermanent()">Select Permanent</button>
          <button class="btn btn-secondary btn-sm" onclick="templates.selectCritical()">Select Critical</button>
        </div>

        <div class="template-items-list">
          ${categories.map(cat => this.renderCategorySection(cat, itemsByCategory[cat], selectedIds)).join('')}
        </div>

        <div class="form-actions sticky-actions">
          <button class="btn btn-secondary" onclick="templates.cancelEdit()">Cancel</button>
          <button class="btn btn-primary" onclick="templates.saveTemplate()">Save Template</button>
        </div>
      </div>
    `;

    // Bind checkbox events
    container.querySelectorAll('.template-item-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', () => this.updateStats());
    });
  }

  renderCategorySection(category, items, selectedIds) {
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

    const categoryName = categoryNames[category] || category;

    // Sort items by name
    items.sort((a, b) => a.name.localeCompare(b.name));

    return `
      <div class="template-category">
        <div class="category-header" onclick="templates.toggleCategory('${category}')">
          <span class="category-toggle">&#9660;</span>
          <span class="category-name">${categoryName}</span>
          <span class="category-count">${items.filter(i => selectedIds.has(i.id)).length}/${items.length}</span>
        </div>
        <div class="category-items" id="category-${category}">
          ${items.map(item => this.renderTemplateItem(item, selectedIds.has(item.id))).join('')}
        </div>
      </div>
    `;
  }

  renderTemplateItem(item, isSelected) {
    const badges = [];
    if (item.is_critical) badges.push('<span class="badge-sm critical">Critical</span>');
    if (item.is_permanent) badges.push('<span class="badge-sm permanent">Permanent</span>');

    const icon = item.icon || this.getCategoryIcon(item.category);

    return `
      <label class="template-item ${isSelected ? 'selected' : ''}">
        <input type="checkbox" class="template-item-checkbox"
               data-item-id="${item.id}"
               ${isSelected ? 'checked' : ''}>
        <span class="item-icon">${icon}</span>
        <span class="item-name">${this.escapeHtml(item.name)}</span>
        <span class="item-badges">${badges.join('')}</span>
      </label>
    `;
  }

  toggleCategory(category) {
    const section = document.getElementById(`category-${category}`);
    if (section) {
      section.classList.toggle('collapsed');
      const header = section.previousElementSibling;
      if (header) {
        const toggle = header.querySelector('.category-toggle');
        if (toggle) {
          toggle.innerHTML = section.classList.contains('collapsed') ? '&#9654;' : '&#9660;';
        }
      }
    }
  }

  selectAll() {
    document.querySelectorAll('.template-item-checkbox').forEach(cb => {
      cb.checked = true;
      cb.closest('.template-item')?.classList.add('selected');
    });
    this.updateStats();
  }

  deselectAll() {
    document.querySelectorAll('.template-item-checkbox').forEach(cb => {
      cb.checked = false;
      cb.closest('.template-item')?.classList.remove('selected');
    });
    this.updateStats();
  }

  selectPermanent() {
    const permanentIds = new Set(this.items.filter(i => i.is_permanent).map(i => i.id));
    document.querySelectorAll('.template-item-checkbox').forEach(cb => {
      if (permanentIds.has(cb.dataset.itemId)) {
        cb.checked = true;
        cb.closest('.template-item')?.classList.add('selected');
      }
    });
    this.updateStats();
  }

  selectCritical() {
    const criticalIds = new Set(this.items.filter(i => i.is_critical).map(i => i.id));
    document.querySelectorAll('.template-item-checkbox').forEach(cb => {
      if (criticalIds.has(cb.dataset.itemId)) {
        cb.checked = true;
        cb.closest('.template-item')?.classList.add('selected');
      }
    });
    this.updateStats();
  }

  updateStats() {
    const checkboxes = document.querySelectorAll('.template-item-checkbox');
    const selected = Array.from(checkboxes).filter(cb => cb.checked).length;
    const total = checkboxes.length;

    const statsEl = document.querySelector('.template-stats');
    if (statsEl) {
      statsEl.textContent = `${selected} of ${total} items selected`;
    }

    // Update visual state
    checkboxes.forEach(cb => {
      const label = cb.closest('.template-item');
      if (label) {
        label.classList.toggle('selected', cb.checked);
      }
    });

    // Update category counts
    document.querySelectorAll('.template-category').forEach(cat => {
      const catCheckboxes = cat.querySelectorAll('.template-item-checkbox');
      const catSelected = Array.from(catCheckboxes).filter(cb => cb.checked).length;
      const catTotal = catCheckboxes.length;
      const countEl = cat.querySelector('.category-count');
      if (countEl) {
        countEl.textContent = `${catSelected}/${catTotal}`;
      }
    });
  }

  async saveTemplate() {
    // Get all selected item IDs
    const selectedIds = [];
    document.querySelectorAll('.template-item-checkbox:checked').forEach(cb => {
      selectedIds.push(cb.dataset.itemId);
    });

    // Save to database
    await window.db.setTemplateItems(this.currentTemplateId, selectedIds);

    alert(`Saved ${selectedIds.length} items to template`);
    window.app.showScreen('home');
  }

  cancelEdit() {
    window.app.showScreen('home');
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
}

// Export singleton
window.templates = new TemplatesManager();
