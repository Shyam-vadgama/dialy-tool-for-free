/**
 * History Manager - Advanced undo/redo system with memory management
 */
import { EventEmitter } from 'eventemitter3';

export class HistoryManager extends EventEmitter {
  constructor(engine) {
    super();
    this.engine = engine;
    this.history = [];
    this.currentIndex = -1;
    this.maxHistorySize = 50;
    this.memoryUsage = 0;
    this.maxMemoryUsage = 100 * 1024 * 1024; // 100MB
    this.currentOperation = null;
  }

  async init() {
    console.log('HistoryManager: init() started');
    // Setup keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        this.undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.shiftKey && e.key === 'Z' || e.key === 'y')) {
        e.preventDefault();
        this.redo();
      }
    });
    console.log('HistoryManager: Keyboard shortcuts setup');
    console.log('HistoryManager: init() finished');
  }

  beginOperation(type, description = '') {
    if (this.currentOperation) {
      console.warn('Beginning new operation while another is in progress');
      this.endOperation();
    }

    this.currentOperation = {
      type,
      description,
      timestamp: Date.now(),
      actions: [],
      beforeState: this.captureDocumentState()
    };

    this.emit('operationBegin', this.currentOperation);
  }

  endOperation() {
    if (!this.currentOperation) return;

    this.currentOperation.afterState = this.captureDocumentState();
    
    // Only add to history if there were actual changes
    if (this.hasStateChanged(this.currentOperation.beforeState, this.currentOperation.afterState)) {
      this.addToHistory(this.currentOperation);
    }

    this.currentOperation = null;
    this.emit('operationEnd');
  }

  addAction(action) {
    if (!this.currentOperation) {
      console.warn('Adding action outside of operation');
      return;
    }

    this.currentOperation.actions.push({
      ...action,
      timestamp: Date.now()
    });
  }

  addToHistory(operation) {
    // Remove any redo history after current index
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    // Add new operation
    this.history.push(operation);
    this.currentIndex++;

    // Estimate memory usage
    this.updateMemoryUsage(operation);

    // Cleanup old history if needed
    this.cleanupHistory();

    this.emit('historyChanged', {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      currentOperation: operation
    });
  }

  captureDocumentState() {
    if (!this.engine.currentDocument) return null;

    const state = {
      document: { ...this.engine.currentDocument },
      layers: this.engine.layers.getAllLayers().map(layer => ({
        id: layer.id,
        name: layer.name,
        type: layer.type,
        opacity: layer.opacity,
        blendMode: layer.blendMode,
        visible: layer.visible,
        locked: layer.locked,
        // For raster layers, capture the image data
        imageData: layer.type === 'raster' && layer.canvas ? 
          this.captureCanvasState(layer.canvas) : null
      })),
      selection: this.engine.selection.getSelection()
    };

    return state;
  }

  captureCanvasState(canvas) {
    // Create a compressed representation
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Convert to base64 for storage (could be optimized with compression)
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCanvas.getContext('2d').putImageData(imageData, 0, 0);
    
    return {
      width: canvas.width,
      height: canvas.height,
      dataURL: tempCanvas.toDataURL('image/png', 0.8) // Compressed
    };
  }

  restoreDocumentState(state) {
    if (!state) return;

    // Restore document properties
    Object.assign(this.engine.currentDocument, state.document);

    // Clear existing layers
    const currentLayers = this.engine.layers.getAllLayers();
    currentLayers.forEach(layer => this.engine.layers.deleteLayer(layer.id));

    // Restore layers
    state.layers.forEach(layerState => {
      const layer = this.engine.layers.createLayer(layerState.name, layerState.type);
      layer.opacity = layerState.opacity;
      layer.blendMode = layerState.blendMode;
      layer.visible = layerState.visible;
      layer.locked = layerState.locked;

      // Restore raster content
      if (layerState.imageData && layer.type === 'raster') {
        this.restoreCanvasState(layer.canvas, layerState.imageData);
        layer.texture.update();
      }
    });

    // Restore selection
    if (state.selection) {
      this.engine.selection.setSelection(state.selection);
    }

    this.emit('stateRestored', state);
  }

  restoreCanvasState(canvas, imageData) {
    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = imageData.dataURL;
  }

  hasStateChanged(beforeState, afterState) {
    if (!beforeState || !afterState) return true;

    // Simple comparison - could be optimized
    const beforeJSON = JSON.stringify(beforeState);
    const afterJSON = JSON.stringify(afterState);
    return beforeJSON !== afterJSON;
  }

  updateMemoryUsage(operation) {
    // Estimate memory usage based on operation
    let operationSize = 0;
    
    if (operation.beforeState) {
      operationSize += this.estimateStateSize(operation.beforeState);
    }
    if (operation.afterState) {
      operationSize += this.estimateStateSize(operation.afterState);
    }

    operation.memorySize = operationSize;
    this.memoryUsage += operationSize;
  }

  estimateStateSize(state) {
    // Rough estimation based on image data
    let size = 1000; // Base size for metadata
    
    if (state.layers) {
      state.layers.forEach(layer => {
        if (layer.imageData) {
          // Estimate based on dimensions (4 bytes per pixel)
          size += layer.imageData.width * layer.imageData.height * 4;
        }
      });
    }

    return size;
  }

  cleanupHistory() {
    // Remove oldest entries if exceeding limits
    while (this.history.length > this.maxHistorySize || this.memoryUsage > this.maxMemoryUsage) {
      if (this.history.length <= 1) break;

      const removed = this.history.shift();
      this.currentIndex--;
      this.memoryUsage -= removed.memorySize || 0;
    }
  }

  undo() {
    if (!this.canUndo()) return;

    const operation = this.history[this.currentIndex];
    this.restoreDocumentState(operation.beforeState);
    this.currentIndex--;

    this.emit('undoPerformed', operation);
    this.emit('historyChanged', {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      undoneOperation: operation
    });
  }

  redo() {
    if (!this.canRedo()) return;

    this.currentIndex++;
    const operation = this.history[this.currentIndex];
    this.restoreDocumentState(operation.afterState);

    this.emit('redoPerformed', operation);
    this.emit('historyChanged', {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      redoneOperation: operation
    });
  }

  canUndo() {
    return this.currentIndex >= 0;
  }

  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }

  getHistory() {
    return this.history.map((op, index) => ({
      ...op,
      isCurrent: index === this.currentIndex,
      canNavigateTo: true
    }));
  }

  navigateToState(index) {
    if (index < -1 || index >= this.history.length) return;

    if (index < this.currentIndex) {
      // Undo to reach the state
      while (this.currentIndex > index && this.canUndo()) {
        this.undo();
      }
    } else if (index > this.currentIndex) {
      // Redo to reach the state
      while (this.currentIndex < index && this.canRedo()) {
        this.redo();
      }
    }
  }

  clear() {
    this.history = [];
    this.currentIndex = -1;
    this.memoryUsage = 0;
    this.currentOperation = null;

    this.emit('historyCleared');
    this.emit('historyChanged', {
      canUndo: false,
      canRedo: false
    });
  }

  getMemoryUsage() {
    return {
      current: this.memoryUsage,
      max: this.maxMemoryUsage,
      percentage: (this.memoryUsage / this.maxMemoryUsage) * 100
    };
  }

  destroy() {
    this.clear();
    this.removeAllListeners();
  }
}