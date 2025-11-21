/**
 * Move Tool - For repositioning layers and selections
 */
import { BaseTool } from '../core/BaseTool.js';

export class MoveTool extends BaseTool {
  constructor(engine) {
    super(engine);
    this.name = 'move';
    this.label = 'Move';
    this.icon = '✋';
    this.cursor = 'move';
    this.hotkey = 'V';

    this.isDragging = false;
    this.dragStart = null;
    this.dragLayer = null;
  }

  onPointerDown(event) {
    if (!this.engine.currentDocument) return;

    const point = this.getLocalPoint(event);
    this.dragStart = { x: point.x, y: point.y };
    this.dragLayer = this.engine.layers.activeLayer;
    this.isDragging = true;

    if (this.dragLayer) {
      this.engine.history.beginOperation('move_layer', `Move ${this.dragLayer.name}`);
    }
  }

  onPointerMove(event) {
    if (!this.isDragging || !this.dragLayer || !this.dragStart) return;

    const point = this.getLocalPoint(event);
    const deltaX = point.x - this.dragStart.x;
    const deltaY = point.y - this.dragStart.y;

    // Move layer container
    this.dragLayer.container.position.set(
      this.dragLayer.container.position.x + deltaX,
      this.dragLayer.container.position.y + deltaY
    );

    this.dragStart = { x: point.x, y: point.y };
  }

  onPointerUp(event) {
    if (this.isDragging) {
      this.isDragging = false;
      this.dragStart = null;
      this.dragLayer = null;
      this.engine.history.endOperation();
    }
  }

  onDeactivate() {
    if (this.isDragging) {
      this.isDragging = false;
      this.dragStart = null;
      this.dragLayer = null;
    }
  }
}