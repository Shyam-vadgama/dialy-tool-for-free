/**
 * Clone Stamp Tool - Duplicate image areas
 */
import { BaseTool } from '../core/BaseTool.js';

export class CloneStampTool extends BaseTool {
  constructor(engine) {
    super(engine);
    this.name = 'clone';
    this.label = 'Clone Stamp';
    this.icon = '📋';
    this.cursor = 'crosshair';
    this.hotkey = 'S';

    this.settings = {
      size: 20,
      hardness: 1.0,
      opacity: 1.0,
      aligned: true
    };

    this.sourcePoint = null;
    this.isCloning = false;
    this.initialOffset = null;
  }

  onPointerDown(event) {
    const layer = this.engine.layers.activeLayer;
    if (!layer || layer.type !== 'raster' || layer.locked) return;

    const point = this.getLocalPoint(event);

    if (event.altKey) {
      // Set source point
      this.sourcePoint = { x: point.x, y: point.y };
      this.emit('sourcePointSet', this.sourcePoint);
    } else if (this.sourcePoint) {
      // Start cloning
      this.isCloning = true;
      this.initialOffset = {
        x: point.x - this.sourcePoint.x,
        y: point.y - this.sourcePoint.y
      };
      this.engine.history.beginOperation('clone_stamp', 'Clone Stamp');
      this.clone(point.x, point.y);
    }
  }

  onPointerMove(event) {
    if (!this.isCloning || !this.sourcePoint) return;

    const point = this.getLocalPoint(event);
    this.clone(point.x, point.y);
  }

  onPointerUp(event) {
    if (this.isCloning) {
      this.isCloning = false;
      this.engine.history.endOperation();
    }
  }

  clone(targetX, targetY) {
    const layer = this.engine.layers.activeLayer;
    if (!layer || !this.sourcePoint) return;

    let sourceX, sourceY;

    if (this.settings.aligned && this.initialOffset) {
      sourceX = targetX - this.initialOffset.x;
      sourceY = targetY - this.initialOffset.y;
    } else {
      sourceX = this.sourcePoint.x;
      sourceY = this.sourcePoint.y;
    }

    // Get source image data
    const size = this.settings.size;
    const halfSize = size / 2;
    
    try {
      const sourceImageData = layer.context.getImageData(
        sourceX - halfSize, 
        sourceY - halfSize, 
        size, 
        size
      );

      // Apply to target area
      const ctx = layer.context;
      ctx.save();
      ctx.globalAlpha = this.settings.opacity;
      ctx.putImageData(sourceImageData, targetX - halfSize, targetY - halfSize);
      ctx.restore();

      layer.texture.update();
    } catch (error) {
      console.warn('Clone operation failed:', error);
    }
  }

  onActivate() {
    // Show instruction to Alt+click to set source
    this.emit('showInstruction', 'Alt+click to set source point, then paint to clone');
  }

  onDeactivate() {
    this.sourcePoint = null;
    this.isCloning = false;
    this.initialOffset = null;
  }
}