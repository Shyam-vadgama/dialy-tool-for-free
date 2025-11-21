/**
 * Professional Brush Tool with pressure sensitivity and advanced settings
 */
import { BaseTool } from '../core/BaseTool.js';
import * as PIXI from 'pixi.js';

export class BrushTool extends BaseTool {
  constructor(engine) {
    super(engine);
    this.name = 'brush';
    this.label = 'Brush';
    this.icon = '🖌️';
    this.cursor = 'crosshair';
    this.hotkey = 'B';

    this.settings = {
      size: 10,
      opacity: 1.0,
      hardness: 1.0,
      spacing: 0.1,
      color: '#000000',
      blendMode: 'source-over',
      pressureSensitive: true,
      flow: 1.0
    };

    this.isDrawing = false;
    this.lastPoint = null;
    this.strokePoints = [];
    this.brushPreview = null;
  }

  async init() {
    this.createBrushPreview();
  }

  createBrushPreview() {
    this.brushPreview = new PIXI.Graphics();
    this.brushPreview.visible = false;
    this.engine.uiContainer.addChild(this.brushPreview);
  }

  onActivate() {
    this.brushPreview.visible = true;
    this.updateBrushPreview();
  }

  onDeactivate() {
    this.brushPreview.visible = false;
    if (this.isDrawing) {
      this.finishStroke();
    }
  }

  onPointerDown(event) {
    if (!this.engine.currentDocument || !this.engine.layers.activeLayer) return;

    const point = this.getLocalPoint(event);
    const pressure = event.pressure || 1.0;

    this.isDrawing = true;
    this.lastPoint = { x: point.x, y: point.y, pressure };
    this.strokePoints = [this.lastPoint];

    // Start stroke
    this.engine.history.beginOperation('brush_stroke');
    this.drawBrushDab(point.x, point.y, pressure);
  }

  onPointerMove(event) {
    const point = this.getLocalPoint(event);
    
    if (this.isDrawing && this.engine.layers.activeLayer) {
      const pressure = event.pressure || 1.0;
      const currentPoint = { x: point.x, y: point.y, pressure };

      // Interpolate between points for smooth strokes
      this.interpolateStroke(this.lastPoint, currentPoint);
      
      this.lastPoint = currentPoint;
      this.strokePoints.push(currentPoint);
    } else {
      // Update brush preview position
      this.updateBrushPreviewPosition(point.x, point.y);
    }
  }

  onPointerUp(event) {
    if (this.isDrawing) {
      this.finishStroke();
    }
  }

  interpolateStroke(from, to) {
    const distance = Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
    const steps = Math.max(1, Math.floor(distance * this.settings.spacing));

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = from.x + (to.x - from.x) * t;
      const y = from.y + (to.y - from.y) * t;
      const pressure = from.pressure + (to.pressure - from.pressure) * t;

      this.drawBrushDab(x, y, pressure);
    }
  }

  drawBrushDab(x, y, pressure = 1.0) {
    const layer = this.engine.layers.activeLayer;
    if (!layer || layer.type !== 'raster' || layer.locked) return;

    const size = this.settings.size * (this.settings.pressureSensitive ? pressure : 1.0);
    const opacity = this.settings.opacity * this.settings.flow;

    // Create brush texture if needed
    const brushTexture = this.createBrushTexture(size);
    
    // Draw on layer canvas
    const ctx = layer.context;
    ctx.save();
    
    ctx.globalCompositeOperation = this.settings.blendMode;
    ctx.globalAlpha = opacity;
    
    // Apply color
    ctx.fillStyle = this.settings.color;
    
    // Draw soft or hard brush
    if (this.settings.hardness < 1.0) {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size / 2);
      const alpha = this.settings.hardness;
      gradient.addColorStop(0, this.settings.color);
      gradient.addColorStop(alpha, this.settings.color);
      gradient.addColorStop(1, this.settings.color.replace(/rgb\(([^)]+)\)/, 'rgba($1, 0)'));
      ctx.fillStyle = gradient;
    }
    
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    // Update texture
    layer.texture.update();
  }

  createBrushTexture(size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    gradient.addColorStop(0, 'rgba(0,0,0,1)');
    gradient.addColorStop(this.settings.hardness, 'rgba(0,0,0,1)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    return PIXI.Texture.from(canvas);
  }

  finishStroke() {
    this.isDrawing = false;
    this.lastPoint = null;
    this.strokePoints = [];
    this.engine.history.endOperation();
    this.engine.layers.activeLayer?.emit('contentChanged');
  }

  updateBrushPreview() {
    this.brushPreview.clear();
    
    const size = this.settings.size;
    const alpha = 0.5;
    
    // Draw outer circle
    this.brushPreview.lineStyle(1, 0xffffff, alpha);
    this.brushPreview.drawCircle(0, 0, size / 2);
    
    // Draw inner circle for hardness
    if (this.settings.hardness < 1.0) {
      this.brushPreview.lineStyle(1, 0x808080, alpha * 0.5);
      this.brushPreview.drawCircle(0, 0, (size / 2) * this.settings.hardness);
    }
  }

  updateBrushPreviewPosition(x, y) {
    this.brushPreview.position.set(x, y);
  }

  updateSettings(settings) {
    super.updateSettings(settings);
    
    if (settings.size || settings.hardness) {
      this.updateBrushPreview();
    }
  }

  destroy() {
    if (this.brushPreview) {
      this.brushPreview.destroy();
    }
    super.destroy();
  }
}