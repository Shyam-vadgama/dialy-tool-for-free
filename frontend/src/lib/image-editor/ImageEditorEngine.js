import { Application, Graphics, Container, Sprite, Texture, BaseTexture } from 'pixi.js';
import { EventEmitter } from 'eventemitter3';

/**
 * High-performance WebGL-based image editor using PixiJS
 * Supports multiple layers, selections, transforms, and real-time filters
 */
export class ImageEditorEngine extends EventEmitter {
  constructor(container) {
    super();
    
    this.container = container;
    this.app = null;
    this.mainContainer = null;
    this.layers = new Map();
    this.activeLayerId = null;
    this.selectionRect = null;
    this.transformControls = null;
    this.history = [];
    this.historyIndex = -1;
    this.tools = {
      selection: null,
      brush: null,
      eraser: null,
      clone: null,
      blur: null
    };
    this.currentTool = 'selection';
    
    this.init();
  }

  async init() {
    // Initialize PixiJS application with WebGL
    this.app = new Application({
      width: this.container.offsetWidth,
      height: this.container.offsetHeight,
      antialias: true,
      transparent: false,
      backgroundColor: 0x2c2c2c,
      preserveDrawingBuffer: true
    });

    // Add canvas to container
    this.container.appendChild(this.app.view);

    // Main container for all layers
    this.mainContainer = new Container();
    this.app.stage.addChild(this.mainContainer);

    // Initialize tools
    this.initializeTools();
    this.initializeEventHandlers();

    this.emit('initialized');
  }

  initializeTools() {
    // Selection tool with rectangular and lasso modes
    this.tools.selection = {
      mode: 'rectangle', // 'rectangle', 'lasso', 'magic-wand'
      tolerance: 10,
      feather: 0,
      active: false
    };

    // Brush tool with pressure simulation
    this.tools.brush = {
      size: 20,
      hardness: 100,
      opacity: 100,
      color: 0x000000,
      mode: 'normal', // blend modes
      texture: null
    };

    // Eraser tool
    this.tools.eraser = {
      size: 20,
      hardness: 100,
      opacity: 100
    };
  }

  initializeEventHandlers() {
    // Mouse/touch event handlers for drawing
    this.app.view.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.app.view.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.app.view.addEventListener('mouseup', this.onMouseUp.bind(this));
    
    // Keyboard shortcuts
    window.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  // Layer management
  createLayer(name = 'New Layer', type = 'raster') {
    const layerId = `layer_${Date.now()}`;
    const layer = {
      id: layerId,
      name,
      type, // 'raster', 'vector', 'text', 'adjustment'
      visible: true,
      opacity: 1.0,
      blendMode: 'normal',
      locked: false,
      container: new Container(),
      mask: null,
      filters: [],
      bounds: { x: 0, y: 0, width: 0, height: 0 }
    };

    this.layers.set(layerId, layer);
    this.mainContainer.addChild(layer.container);
    
    if (!this.activeLayerId) {
      this.activeLayerId = layerId;
    }

    this.emit('layerCreated', layer);
    return layerId;
  }

  deleteLayer(layerId) {
    const layer = this.layers.get(layerId);
    if (!layer) return false;

    this.mainContainer.removeChild(layer.container);
    this.layers.delete(layerId);

    if (this.activeLayerId === layerId) {
      const layerIds = Array.from(this.layers.keys());
      this.activeLayerId = layerIds.length > 0 ? layerIds[0] : null;
    }

    this.emit('layerDeleted', layerId);
    return true;
  }

  setActiveLayer(layerId) {
    if (this.layers.has(layerId)) {
      this.activeLayerId = layerId;
      this.emit('activeLayerChanged', layerId);
    }
  }

  // Image loading and manipulation
  async loadImage(imageData) {
    try {
      const texture = await Texture.from(imageData);
      const layerId = this.createLayer('Background', 'raster');
      const layer = this.layers.get(layerId);
      
      const sprite = new Sprite(texture);
      layer.container.addChild(sprite);
      layer.bounds = {
        x: 0,
        y: 0,
        width: texture.width,
        height: texture.height
      };

      // Fit image to canvas
      this.fitToCanvas();
      
      this.saveState('Load Image');
      this.emit('imageLoaded', { layerId, texture });
      
      return layerId;
    } catch (error) {
      console.error('Failed to load image:', error);
      throw error;
    }
  }

  // Transform operations
  scaleLayer(layerId, scaleX, scaleY) {
    const layer = this.layers.get(layerId);
    if (!layer) return;

    layer.container.scale.set(scaleX, scaleY);
    this.emit('layerTransformed', layerId);
  }

  rotateLayer(layerId, rotation) {
    const layer = this.layers.get(layerId);
    if (!layer) return;

    layer.container.rotation = rotation;
    this.emit('layerTransformed', layerId);
  }

  // Selection tools
  createSelection(x, y, width, height) {
    if (this.selectionRect) {
      this.clearSelection();
    }

    this.selectionRect = new Graphics();
    this.selectionRect.lineStyle(1, 0xFFFFFF, 1);
    this.selectionRect.drawRect(x, y, width, height);
    
    // Add marching ants effect
    this.app.ticker.add(this.updateMarchingAnts.bind(this));
    
    this.app.stage.addChild(this.selectionRect);
    this.emit('selectionCreated', { x, y, width, height });
  }

  clearSelection() {
    if (this.selectionRect) {
      this.app.stage.removeChild(this.selectionRect);
      this.selectionRect = null;
      this.emit('selectionCleared');
    }
  }

  updateMarchingAnts(delta) {
    if (this.selectionRect) {
      // Create marching ants effect
      this.selectionRect.position.x += delta * 0.5;
    }
  }

  // Filters and adjustments
  applyFilter(layerId, filterType, params = {}) {
    const layer = this.layers.get(layerId);
    if (!layer) return;

    let filter = null;
    
    switch (filterType) {
      case 'blur':
        const { BlurFilter } = require('pixi.js');
        filter = new BlurFilter(params.strength || 2);
        break;
      case 'brightness':
        // Custom brightness filter would be implemented here
        break;
      case 'contrast':
        // Custom contrast filter would be implemented here
        break;
      default:
        console.warn(`Unknown filter type: ${filterType}`);
        return;
    }

    if (filter) {
      layer.container.filters = [...(layer.container.filters || []), filter];
      this.emit('filterApplied', { layerId, filterType, params });
    }
  }

  // History management
  saveState(action) {
    // Remove any redo states
    this.history = this.history.slice(0, this.historyIndex + 1);
    
    // Save current state
    const state = this.serializeState();
    this.history.push({ action, state, timestamp: Date.now() });
    this.historyIndex++;

    // Limit history size
    if (this.history.length > 50) {
      this.history.shift();
      this.historyIndex--;
    }

    this.emit('stateChanged', action);
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      const state = this.history[this.historyIndex];
      this.restoreState(state.state);
      this.emit('undoPerformed', state.action);
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      const state = this.history[this.historyIndex];
      this.restoreState(state.state);
      this.emit('redoPerformed', state.action);
    }
  }

  // Event handlers
  onMouseDown(event) {
    const rect = this.app.view.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    switch (this.currentTool) {
      case 'selection':
        this.startSelection(x, y);
        break;
      case 'brush':
        this.startBrush(x, y);
        break;
      case 'eraser':
        this.startEraser(x, y);
        break;
    }
  }

  onMouseMove(event) {
    const rect = this.app.view.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Handle tool-specific mouse move
    this.emit('mouseMove', { x, y });
  }

  onMouseUp(event) {
    // Handle tool-specific mouse up
    this.emit('mouseUp');
  }

  onKeyDown(event) {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key.toLowerCase()) {
        case 'z':
          event.preventDefault();
          if (event.shiftKey) {
            this.redo();
          } else {
            this.undo();
          }
          break;
        case 's':
          event.preventDefault();
          this.emit('saveRequested');
          break;
        case 'a':
          event.preventDefault();
          this.selectAll();
          break;
      }
    }
  }

  // Utility methods
  fitToCanvas() {
    // Implement auto-fit logic
  }

  selectAll() {
    // Select entire canvas
  }

  serializeState() {
    // Serialize current editor state for undo/redo
    return {
      layers: Array.from(this.layers.entries()),
      activeLayerId: this.activeLayerId
      // Add more state as needed
    };
  }

  restoreState(state) {
    // Restore editor state from serialized data
    // Implementation would restore layers, selections, etc.
  }

  // Export functionality
  async exportImage(format = 'png', quality = 1.0) {
    // Render all layers to a single texture
    const renderTexture = this.app.renderer.generateTexture(this.mainContainer);
    
    // Convert to specified format
    const canvas = this.app.renderer.extract.canvas(this.mainContainer);
    
    return new Promise((resolve) => {
      canvas.toBlob(resolve, `image/${format}`, quality);
    });
  }

  // Cleanup
  destroy() {
    if (this.app) {
      this.app.destroy(true);
      this.app = null;
    }
    this.removeAllListeners();
  }
}

export default ImageEditorEngine;