/**
 * Selection Manager - Advanced selection handling with marching ants and operations
 */
import { EventEmitter } from 'eventemitter3';
import * as PIXI from 'pixi.js';

export class SelectionManager extends EventEmitter {
  constructor(engine) {
    super();
    this.engine = engine;
    this.currentSelection = null;
    this.selectionMask = null;
    this.selectionBounds = null;
    this.marchingAntsAnimation = null;
  }

  async init() {
    console.log('SelectionManager: init() started');
    // Setup keyboard shortcuts for selection operations
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.clearSelection();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        this.selectAll();
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        this.invertSelection();
      }
    });
    console.log('SelectionManager: Keyboard shortcuts setup');
    console.log('SelectionManager: init() finished');
  }

  setSelection(selection) {
    this.currentSelection = selection;
    this.updateSelectionMask();
    this.calculateSelectionBounds();
    this.emit('selectionChanged', selection);
  }

  getSelection() {
    return this.currentSelection;
  }

  hasSelection() {
    return this.currentSelection !== null;
  }

  clearSelection() {
    this.currentSelection = null;
    this.selectionMask = null;
    this.selectionBounds = null;
    this.emit('selectionCleared');
    this.emit('selectionChanged', null);
  }

  selectAll() {
    if (!this.engine.currentDocument) return;

    const selection = {
      type: 'rectangular',
      x: 0,
      y: 0,
      width: this.engine.currentDocument.width,
      height: this.engine.currentDocument.height
    };

    this.setSelection(selection);
  }

  invertSelection() {
    if (!this.engine.currentDocument) return;

    // Create inverted mask
    const width = this.engine.currentDocument.width;
    const height = this.engine.currentDocument.height;
    const invertedMask = new Uint8Array(width * height);

    if (this.selectionMask) {
      // Invert existing selection
      for (let i = 0; i < invertedMask.length; i++) {
        invertedMask[i] = 255 - this.selectionMask[i];
      }
    } else {
      // Select all if no selection
      invertedMask.fill(255);
    }

    const selection = {
      type: 'bitmap',
      mask: {
        width,
        height,
        data: invertedMask
      }
    };

    this.setSelection(selection);
  }

  updateSelectionMask() {
    if (!this.currentSelection || !this.engine.currentDocument) {
      this.selectionMask = null;
      return;
    }

    const width = this.engine.currentDocument.width;
    const height = this.engine.currentDocument.height;
    const mask = new Uint8Array(width * height);

    switch (this.currentSelection.type) {
      case 'rectangular':
        this.createRectangularMask(mask, width, height, this.currentSelection);
        break;
      case 'elliptical':
        this.createEllipticalMask(mask, width, height, this.currentSelection);
        break;
      case 'lasso':
        this.createPolygonMask(mask, width, height, this.currentSelection.points);
        break;
      case 'bitmap':
        if (this.currentSelection.mask) {
          mask.set(this.currentSelection.mask.data);
        }
        break;
    }

    this.selectionMask = mask;
  }

  createRectangularMask(mask, width, height, selection) {
    const { x, y, width: selWidth, height: selHeight } = selection;
    const startX = Math.max(0, Math.floor(x));
    const startY = Math.max(0, Math.floor(y));
    const endX = Math.min(width, Math.ceil(x + selWidth));
    const endY = Math.min(height, Math.ceil(y + selHeight));

    for (let py = startY; py < endY; py++) {
      for (let px = startX; px < endX; px++) {
        const index = py * width + px;
        mask[index] = 255;
      }
    }
  }

  createEllipticalMask(mask, width, height, selection) {
    const { centerX, centerY, radiusX, radiusY } = selection;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = (x - centerX) / radiusX;
        const dy = (y - centerY) / radiusY;
        
        if (dx * dx + dy * dy <= 1) {
          const index = y * width + x;
          mask[index] = 255;
        }
      }
    }
  }

  createPolygonMask(mask, width, height, points) {
    if (points.length < 3) return;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (this.pointInPolygon({ x, y }, points)) {
          const index = y * width + x;
          mask[index] = 255;
        }
      }
    }
  }

  pointInPolygon(point, polygon) {
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x, yi = polygon[i].y;
      const xj = polygon[j].x, yj = polygon[j].y;
      
      if (((yi > point.y) !== (yj > point.y)) &&
          (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  }

  calculateSelectionBounds() {
    if (!this.selectionMask || !this.engine.currentDocument) {
      this.selectionBounds = null;
      return;
    }

    const width = this.engine.currentDocument.width;
    const height = this.engine.currentDocument.height;
    
    let minX = width, minY = height, maxX = 0, maxY = 0;
    let hasPixels = false;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        if (this.selectionMask[index] > 0) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
          hasPixels = true;
        }
      }
    }

    this.selectionBounds = hasPixels ? {
      x: minX,
      y: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1
    } : null;
  }

  getSelectionBounds() {
    return this.selectionBounds;
  }

  isPointSelected(x, y) {
    if (!this.selectionMask || !this.engine.currentDocument) return false;
    
    const px = Math.floor(x);
    const py = Math.floor(y);
    const width = this.engine.currentDocument.width;
    
    if (px < 0 || px >= width || py < 0 || py >= this.engine.currentDocument.height) {
      return false;
    }
    
    const index = py * width + px;
    return this.selectionMask[index] > 0;
  }

  // Selection operations
  copySelection() {
    const layer = this.engine.layers.activeLayer;
    if (!layer || !this.hasSelection() || layer.type !== 'raster') return null;

    const bounds = this.getSelectionBounds();
    if (!bounds) return null;

    // Create canvas for copied content
    const canvas = document.createElement('canvas');
    canvas.width = bounds.width;
    canvas.height = bounds.height;
    const ctx = canvas.getContext('2d');

    // Copy pixels from layer with selection mask
    const layerImageData = layer.context.getImageData(bounds.x, bounds.y, bounds.width, bounds.height);
    const copiedImageData = ctx.createImageData(bounds.width, bounds.height);

    for (let y = 0; y < bounds.height; y++) {
      for (let x = 0; x < bounds.width; x++) {
        const srcIndex = (y * bounds.width + x) * 4;
        const maskIndex = (bounds.y + y) * this.engine.currentDocument.width + (bounds.x + x);
        const alpha = this.selectionMask[maskIndex] / 255;

        copiedImageData.data[srcIndex] = layerImageData.data[srcIndex];
        copiedImageData.data[srcIndex + 1] = layerImageData.data[srcIndex + 1];
        copiedImageData.data[srcIndex + 2] = layerImageData.data[srcIndex + 2];
        copiedImageData.data[srcIndex + 3] = layerImageData.data[srcIndex + 3] * alpha;
      }
    }

    ctx.putImageData(copiedImageData, 0, 0);
    return canvas;
  }

  cutSelection() {
    const copied = this.copySelection();
    this.deleteSelection();
    return copied;
  }

  deleteSelection() {
    const layer = this.engine.layers.activeLayer;
    if (!layer || !this.hasSelection() || layer.type !== 'raster' || layer.locked) return;

    this.engine.history.beginOperation('delete_selection', 'Delete Selection');

    const bounds = this.getSelectionBounds();
    if (bounds) {
      // Clear selected pixels
      const ctx = layer.context;
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';

      // Apply selection mask
      for (let y = 0; y < bounds.height; y++) {
        for (let x = 0; x < bounds.width; x++) {
          const maskIndex = (bounds.y + y) * this.engine.currentDocument.width + (bounds.x + x);
          const alpha = this.selectionMask[maskIndex] / 255;
          
          if (alpha > 0) {
            ctx.globalAlpha = alpha;
            ctx.fillRect(bounds.x + x, bounds.y + y, 1, 1);
          }
        }
      }

      ctx.restore();
      layer.texture.update();
      layer.emit('contentChanged');
    }

    this.engine.history.endOperation();
  }

  pasteContent(canvas, x = 0, y = 0) {
    const layer = this.engine.layers.activeLayer;
    if (!layer || layer.type !== 'raster' || layer.locked) return;

    this.engine.history.beginOperation('paste', 'Paste');

    const ctx = layer.context;
    ctx.drawImage(canvas, x, y);
    layer.texture.update();
    layer.emit('contentChanged');

    this.engine.history.endOperation();
  }

  // Selection modification
  expandSelection(pixels) {
    if (!this.hasSelection()) return;

    const dilatedMask = this.dilateSelection(this.selectionMask, pixels);
    const selection = {
      type: 'bitmap',
      mask: {
        width: this.engine.currentDocument.width,
        height: this.engine.currentDocument.height,
        data: dilatedMask
      }
    };

    this.setSelection(selection);
  }

  contractSelection(pixels) {
    if (!this.hasSelection()) return;

    const erodedMask = this.erodeSelection(this.selectionMask, pixels);
    const selection = {
      type: 'bitmap',
      mask: {
        width: this.engine.currentDocument.width,
        height: this.engine.currentDocument.height,
        data: erodedMask
      }
    };

    this.setSelection(selection);
  }

  dilateSelection(mask, pixels) {
    const width = this.engine.currentDocument.width;
    const height = this.engine.currentDocument.height;
    const result = new Uint8Array(width * height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        let maxValue = 0;

        // Check neighborhood
        for (let dy = -pixels; dy <= pixels; dy++) {
          for (let dx = -pixels; dx <= pixels; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIndex = ny * width + nx;
              maxValue = Math.max(maxValue, mask[nIndex]);
            }
          }
        }

        result[index] = maxValue;
      }
    }

    return result;
  }

  erodeSelection(mask, pixels) {
    const width = this.engine.currentDocument.width;
    const height = this.engine.currentDocument.height;
    const result = new Uint8Array(width * height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        let minValue = 255;

        // Check neighborhood
        for (let dy = -pixels; dy <= pixels; dy++) {
          for (let dx = -pixels; dx <= pixels; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIndex = ny * width + nx;
              minValue = Math.min(minValue, mask[nIndex]);
            }
          }
        }

        result[index] = minValue;
      }
    }

    return result;
  }

  destroy() {
    this.clearSelection();
    this.removeAllListeners();
  }
}