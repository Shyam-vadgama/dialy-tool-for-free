/**
 * Eraser Tool - Remove content from layers
 */
import { BaseTool } from '../core/BaseTool.js';

export class EraserTool extends BaseTool {
  constructor(engine) {
    super(engine);
    this.name = 'eraser';
    this.label = 'Eraser';
    this.icon = '🧽';
    this.cursor = 'crosshair';
    this.hotkey = 'E';

    this.settings = {
      size: 20,
      hardness: 1.0,
      opacity: 1.0
    };

    this.isErasing = false;
    this.lastPoint = null;
  }

  onPointerDown(event) {
    const layer = this.engine.layers.activeLayer;
    if (!layer || layer.type !== 'raster' || layer.locked) return;

    const point = this.getLocalPoint(event);
    this.isErasing = true;
    this.lastPoint = { x: point.x, y: point.y };

    this.engine.history.beginOperation('erase', 'Erase');
    this.erase(point.x, point.y);
  }

  onPointerMove(event) {
    if (!this.isErasing) return;

    const point = this.getLocalPoint(event);
    
    // Interpolate between points for smooth erasing
    if (this.lastPoint) {
      const distance = Math.sqrt(
        Math.pow(point.x - this.lastPoint.x, 2) + 
        Math.pow(point.y - this.lastPoint.y, 2)
      );
      const steps = Math.max(1, Math.floor(distance / 2));

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = this.lastPoint.x + (point.x - this.lastPoint.x) * t;
        const y = this.lastPoint.y + (point.y - this.lastPoint.y) * t;
        this.erase(x, y);
      }
    }

    this.lastPoint = { x: point.x, y: point.y };
  }

  onPointerUp(event) {
    if (this.isErasing) {
      this.isErasing = false;
      this.lastPoint = null;
      this.engine.history.endOperation();
    }
  }

  erase(x, y) {
    const layer = this.engine.layers.activeLayer;
    if (!layer) return;

    layer.erase(x, y, this.settings.size);
  }

  onDeactivate() {
    if (this.isErasing) {
      this.isErasing = false;
      this.lastPoint = null;
    }
  }
}