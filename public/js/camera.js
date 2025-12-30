/**
 * CamperPack - Camera and Vision AI Features
 */

class CameraManager {
  constructor() {
    this.stream = null;
    this.currentFacingMode = 'environment'; // Back camera
    this.videoElement = null;
    this.canvasElement = null;
  }

  async init() {
    this.videoElement = document.getElementById('camera-preview');
    this.canvasElement = document.getElementById('camera-canvas');
    this.bindEvents();
  }

  bindEvents() {
    const captureBtn = document.getElementById('capture-btn');
    if (captureBtn) {
      captureBtn.addEventListener('click', () => this.captureAndAnalyze());
    }

    const switchBtn = document.getElementById('switch-camera-btn');
    if (switchBtn) {
      switchBtn.addEventListener('click', () => this.switchCamera());
    }
  }

  async startCamera() {
    try {
      // Stop any existing stream
      this.stopCamera();

      const constraints = {
        video: {
          facingMode: this.currentFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (this.videoElement) {
        this.videoElement.srcObject = this.stream;
      }
    } catch (error) {
      console.error('Camera error:', error);
      this.showError('Could not access camera. Please grant camera permissions.');
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }

  async switchCamera() {
    this.currentFacingMode = this.currentFacingMode === 'environment' ? 'user' : 'environment';
    await this.startCamera();
  }

  async captureAndAnalyze() {
    if (!this.videoElement || !this.canvasElement) return;

    const video = this.videoElement;
    const canvas = this.canvasElement;
    const ctx = canvas.getContext('2d');

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0);

    // Get image data as base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);

    // Show loading state
    this.showResults('Analyzing image...');

    try {
      const response = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageData,
          mode: 'inventory' // or 'icon' for single item
        })
      });

      if (!response.ok) {
        throw new Error('Vision API error');
      }

      const result = await response.json();
      this.displayResults(result);
    } catch (error) {
      console.error('Vision error:', error);
      this.showError('Could not analyze image. Please try again.');
    }
  }

  displayResults(result) {
    const container = document.getElementById('vision-results');
    if (!container) return;

    container.classList.remove('hidden');

    if (result.items && result.items.length > 0) {
      const itemsHtml = result.items.map(item => `
        <div class="vision-item">
          <span class="vision-item-icon">${item.icon || '📦'}</span>
          <span class="vision-item-name">${this.escapeHtml(item.name)}</span>
          <button class="btn btn-sm btn-primary" onclick="camera.addToInventory('${this.escapeHtml(item.name)}', '${item.icon || ''}', '${item.category || 'other'}')">Add</button>
        </div>
      `).join('');

      container.innerHTML = `
        <h3>Identified Items</h3>
        <div class="vision-items-list">
          ${itemsHtml}
        </div>
        <button class="btn btn-secondary btn-block" onclick="camera.addAllToInventory(${JSON.stringify(result.items).replace(/"/g, '&quot;')})">
          Add All Items
        </button>
      `;
    } else {
      container.innerHTML = '<p>No items identified. Try taking another photo.</p>';
    }
  }

  async addToInventory(name, icon, category) {
    const item = {
      name: name,
      icon: icon || null,
      category: category || 'other',
      storage_location: null, // User will need to set this
      is_permanent: 0,
      is_critical: 0,
      quantity: 1
    };

    await window.db.saveItem(item);
    alert(`Added "${name}" to inventory!`);
  }

  async addAllToInventory(items) {
    for (const item of items) {
      await this.addToInventory(item.name, item.icon, item.category);
    }
    alert(`Added ${items.length} items to inventory!`);

    // Refresh inventory if on that screen
    if (window.inventory) {
      await window.inventory.loadInventory();
    }
  }

  showResults(message) {
    const container = document.getElementById('vision-results');
    if (container) {
      container.classList.remove('hidden');
      container.innerHTML = `<p>${message}</p>`;
    }
  }

  showError(message) {
    const container = document.getElementById('vision-results');
    if (container) {
      container.classList.remove('hidden');
      container.innerHTML = `<p class="error">${message}</p>`;
    }
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Capture single item for icon generation
  async captureForIcon() {
    if (!this.videoElement || !this.canvasElement) return null;

    const video = this.videoElement;
    const canvas = this.canvasElement;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);

    try {
      const response = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageData,
          mode: 'icon'
        })
      });

      if (!response.ok) {
        throw new Error('Vision API error');
      }

      const result = await response.json();
      return result.icon || result.emoji || null;
    } catch (error) {
      console.error('Icon generation error:', error);
      return null;
    }
  }
}

// Export singleton
window.camera = new CameraManager();
