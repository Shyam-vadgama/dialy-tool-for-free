/**
 * Crop Tool - Crop image content
 */
import { BaseTool } from '../core/BaseTool.js';
import * as PIXI from 'pixi.js';

export class CropTool extends BaseTool {
  constructor(engine) {
    super(engine);
    this.name = 'crop';
    this.label = 'Crop';
    this.icon = '✂️';
    this.cursor = 'crosshair';
    this.hotkey = 'C';

    this.cropRect = null;
    this.cropGraphics = null;
    this.isSelecting = false;
    this.startPoint = null;
  }

  async init() {
    this.cropGraphics = new PIXI.Graphics();
    this.engine.uiContainer.addChild(this.cropGraphics);
    this.cropGraphics.visible = false;
  }

  onActivate() {
    this.cropGraphics.visible = true;
    this.showFullDocumentCrop();
  }

  onDeactivate() {
    this.cropGraphics.visible = false;
    this.clearCrop();
  }

  showFullDocumentCrop() {
    if (!this.engine.currentDocument) return;

    this.cropRect = {
      x: 0,
      y: 0,
      width: this.engine.currentDocument.width,
      height: this.engine.currentDocument.height
    };

    this.drawCropOverlay();
  }

  onPointerDown(event) {
    if (!this.engine.currentDocument) return;

    const point = this.getLocalPoint(event);
    this.startPoint = { x: point.x, y: point.y };
    this.isSelecting = true;
  }

  onPointerMove(event) {
    if (!this.isSelecting || !this.startPoint) return;

    const point = this.getLocalPoint(event);
    
    this.cropRect = {
      x: Math.min(this.startPoint.x, point.x),
      y: Math.min(this.startPoint.y, point.y),
      width: Math.abs(point.x - this.startPoint.x),
      height: Math.abs(point.y - this.startPoint.y)
    };

    this.drawCropOverlay();
  }

  onPointerUp(event) {
    this.isSelecting = false;
    this.startPoint = null;
  }

  drawCropOverlay() {
    if (!this.cropRect || !this.engine.currentDocument) return;

    this.cropGraphics.clear();

    const docWidth = this.engine.currentDocument.width;
    const docHeight = this.engine.currentDocument.height;

    // Draw semi-transparent overlay outside crop area
    this.cropGraphics.beginFill(0x000000, 0.5);
    
    // Top
    this.cropGraphics.drawRect(0, 0, docWidth, this.cropRect.y);
    
    // Bottom
    this.cropGraphics.drawRect(0, this.cropRect.y + this.cropRect.height, 
      docWidth, docHeight - (this.cropRect.y + this.cropRect.height));
    
    // Left
    this.cropGraphics.drawRect(0, this.cropRect.y, this.cropRect.x, this.cropRect.height);
    
    // Right
    this.cropGraphics.drawRect(this.cropRect.x + this.cropRect.width, this.cropRect.y, 
      docWidth - (this.cropRect.x + this.cropRect.width), this.cropRect.height);
    
    this.cropGraphics.endFill();

    // Draw crop border
    this.cropGraphics.lineStyle(2, 0xFFFFFF, 1);
    this.cropGraphics.drawRect(this.cropRect.x, this.cropRect.y, 
      this.cropRect.width, this.cropRect.height);
  }

  applyCrop() {
    if (!this.cropRect || !this.engine.currentDocument) return;

    this.engine.history.beginOperation('crop', 'Crop Image');

    // Update document dimensions
    this.engine.currentDocument.width = this.cropRect.width;
    this.engine.currentDocument.height = this.cropRect.height;

    // Crop all layers
    this.engine.layers.getAllLayers().forEach(layer => {
      if (layer.type === 'raster') {
        this.cropLayer(layer);
      }
    });

    this.engine.history.endOperation();
    this.clearCrop();
    this.emit('cropApplied', this.cropRect);
  }

  cropLayer(layer) {
    if (!layer.canvas || !this.cropRect) return;

    // Create new canvas with crop dimensions
    const newCanvas = document.createElement('canvas');
    newCanvas.width = this.cropRect.width;
    newCanvas.height = this.cropRect.height;
    const newCtx = newCanvas.getContext('2d');

    // Copy cropped area
    newCtx.drawImage(
      layer.canvas,
      this.cropRect.x, this.cropRect.y, this.cropRect.width, this.cropRect.height,
      0, 0, this.cropRect.width, this.cropRect.height
    );

    // Update layer
    layer.canvas.width = this.cropRect.width;
    layer.canvas.height = this.cropRect.height;
    layer.width = this.cropRect.width;
    layer.height = this.cropRect.height;
    
    layer.context.clearRect(0, 0, this.cropRect.width, this.cropRect.height);
    layer.context.drawImage(newCanvas, 0, 0);
    
    layer.texture.update();
  }

  clearCrop() {
    this.cropRect = null;
    this.cropGraphics.clear();
  }

  onKeyDown(event) {
    if (event.key === 'Enter') {
      this.applyCrop();
    } else if (event.key === 'Escape') {
      this.clearCrop();
      this.showFullDocumentCrop();
    }
  }

  destroy() {
    if (this.cropGraphics) {
      this.cropGraphics.destroy();
    }
    super.destroy();
  }
}