/**
 * Layer Manager - Multi-layer system with advanced blending and masking
 */
import * as PIXI from 'pixi.js';
import { EventEmitter } from 'eventemitter3';

export class LayerManager extends EventEmitter {
  constructor(engine) {
    super();
    this.engine = engine;
    this.layers = [];
    this.activeLayer = null;
    this.layerCounter = 0;
  }

  async init() {
    console.log('LayerManager: init() started');
    // Setup layer container
    this.layerContainer = new PIXI.Container();
    this.engine.documentContainer.addChild(this.layerContainer);
    console.log('LayerManager: layerContainer initialized and added to documentContainer');
    console.log('LayerManager: init() finished');
  }

  createDocument(document) {
    this.layers = [];
    this.activeLayer = null;
    this.layerCounter = 0;
    this.layerContainer.removeChildren();
  }

  createLayer(name, type = 'raster', options = {}) {
    const layer = new Layer({
      id: ++this.layerCounter,
      name: name || `Layer ${this.layerCounter}`,
      type,
      width: this.engine.currentDocument.width,
      height: this.engine.currentDocument.height,
      ...options
    });

    this.layers.push(layer);
    this.layerContainer.addChild(layer.container);
    this.setActiveLayer(layer);

    this.emit('layerAdded', layer);
    return layer;
  }

  deleteLayer(layerId) {
    const index = this.layers.findIndex(l => l.id === layerId);
    if (index === -1) return;

    const layer = this.layers[index];
    this.layerContainer.removeChild(layer.container);
    layer.destroy();
    
    this.layers.splice(index, 1);

    if (layer === this.activeLayer) {
      this.setActiveLayer(this.layers[Math.min(index, this.layers.length - 1)]);
    }

    this.emit('layerDeleted', layerId);
  }

  setActiveLayer(layer) {
    if (this.activeLayer) {
      this.activeLayer.setActive(false);
    }
    
    this.activeLayer = layer;
    if (layer) {
      layer.setActive(true);
    }

    this.emit('activeLayerChanged', layer);
  }

  moveLayer(layerId, direction) {
    const index = this.layers.findIndex(l => l.id === layerId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index + 1 : index - 1;
    if (newIndex < 0 || newIndex >= this.layers.length) return;

    // Swap layers
    const layer = this.layers[index];
    this.layers.splice(index, 1);
    this.layers.splice(newIndex, 0, layer);

    // Update container order
    this.layerContainer.removeChild(layer.container);
    this.layerContainer.addChildAt(layer.container, newIndex);

    this.emit('layersReordered', this.layers);
  }

  duplicateLayer(layerId) {
    const layer = this.getLayer(layerId);
    if (!layer) return;

    const newLayer = this.createLayer(`${layer.name} copy`, layer.type);
    newLayer.opacity = layer.opacity;
    newLayer.blendMode = layer.blendMode;
    newLayer.visible = layer.visible;
    
    // Copy content
    if (layer.type === 'raster' && layer.canvas) {
      const canvas = document.createElement('canvas');
      canvas.width = layer.canvas.width;
      canvas.height = layer.canvas.height;
      canvas.getContext('2d').drawImage(layer.canvas, 0, 0);
      newLayer.setContent({ canvas, texture: PIXI.Texture.from(canvas) });
    }

    return newLayer;
  }

  getLayer(layerId) {
    return this.layers.find(l => l.id === layerId);
  }

  getAllLayers() {
    return [...this.layers];
  }

  destroy() {
    this.layers.forEach(layer => layer.destroy());
    this.layers = [];
    this.removeAllListeners();
  }
}

class Layer extends EventEmitter {
  constructor(options) {
    super();
    
    this.id = options.id;
    this.name = options.name;
    this.type = options.type; // 'raster', 'vector', 'text', 'adjustment'
    this.width = options.width;
    this.height = options.height;
    this.opacity = options.opacity ?? 1.0;
    this.blendMode = options.blendMode || PIXI.BLEND_MODES.NORMAL;
    this.visible = options.visible ?? true;
    this.locked = options.locked ?? false;
    this.active = false;

    this.container = new PIXI.Container();
    this.sprite = null;
    this.canvas = null;
    this.texture = null;
    this.mask = null;

    this.init();
  }

  init() {
    // Create layer canvas for raster operations
    if (this.type === 'raster') {
      this.canvas = document.createElement('canvas');
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.context = this.canvas.getContext('2d');
      
      this.texture = PIXI.Texture.from(this.canvas);
      this.sprite = new PIXI.Sprite(this.texture);
      this.container.addChild(this.sprite);
    }

    this.updateVisuals();
  }

  setContent(content) {
    if (this.type === 'raster' && content.canvas) {
      this.context.clearRect(0, 0, this.width, this.height);
      this.context.drawImage(content.canvas, 0, 0);
      this.texture.update();
    } else if (content.texture) {
      if (this.sprite) {
        this.sprite.texture = content.texture;
      }
    }
    
    this.emit('contentChanged');
  }

  fillColor(color) {
    if (this.type !== 'raster') return;
    
    this.context.fillStyle = typeof color === 'number' ? 
      `#${color.toString(16).padStart(6, '0')}` : color;
    this.context.fillRect(0, 0, this.width, this.height);
    this.texture.update();
    
    this.emit('contentChanged');
  }

  setOpacity(opacity) {
    this.opacity = Math.max(0, Math.min(1, opacity));
    this.updateVisuals();
    this.emit('propertyChanged', { property: 'opacity', value: this.opacity });
  }

  setBlendMode(blendMode) {
    this.blendMode = blendMode;
    this.updateVisuals();
    this.emit('propertyChanged', { property: 'blendMode', value: this.blendMode });
  }

  setVisible(visible) {
    this.visible = visible;
    this.updateVisuals();
    this.emit('propertyChanged', { property: 'visible', value: this.visible });
  }

  setLocked(locked) {
    this.locked = locked;
    this.emit('propertyChanged', { property: 'locked', value: this.locked });
  }

  setActive(active) {
    this.active = active;
    // Add visual indicators for active layer
    if (this.sprite) {
      this.sprite.tint = active ? 0xffffff : 0xffffff;
    }
  }

  updateVisuals() {
    this.container.alpha = this.opacity;
    this.container.visible = this.visible;
    if (this.sprite) {
      this.sprite.blendMode = this.blendMode;
    }
  }

  // Drawing operations
  drawBrush(x, y, size, color, opacity = 1.0) {
    if (this.type !== 'raster' || this.locked) return;

    const ctx = this.context;
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
    
    this.texture.update();
    this.emit('contentChanged');
  }

  erase(x, y, size) {
    if (this.type !== 'raster' || this.locked) return;

    const ctx = this.context;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
    
    this.texture.update();
    this.emit('contentChanged');
  }

  applyFilter(filterName, options = {}) {
    if (this.type !== 'raster' || this.locked) return;

    // Apply various filters using canvas operations
    const imageData = this.context.getImageData(0, 0, this.width, this.height);
    const filteredData = this.processImageData(imageData, filterName, options);
    
    this.context.putImageData(filteredData, 0, 0);
    this.texture.update();
    this.emit('contentChanged');
  }

  processImageData(imageData, filterName, options) {
    const data = imageData.data;
    
    switch (filterName) {
      case 'brightness':
        const brightness = options.value || 0;
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.max(0, Math.min(255, data[i] + brightness));
          data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + brightness));
          data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + brightness));
        }
        break;
        
      case 'contrast':
        const contrast = (options.value || 0) + 1;
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.max(0, Math.min(255, (data[i] - 128) * contrast + 128));
          data[i + 1] = Math.max(0, Math.min(255, (data[i + 1] - 128) * contrast + 128));
          data[i + 2] = Math.max(0, Math.min(255, (data[i + 2] - 128) * contrast + 128));
        }
        break;
        
      case 'grayscale':
        for (let i = 0; i < data.length; i += 4) {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
        }
        break;
    }
    
    return imageData;
  }

  destroy() {
    this.container.destroy(true);
    if (this.texture) {
      this.texture.destroy(true);
    }
    this.removeAllListeners();
  }
}