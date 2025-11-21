/**
 * Selection Tool with multiple selection modes (rectangular, elliptical, lasso, magic wand)
 */
import { BaseTool } from '../core/BaseTool.js';
import * as PIXI from 'pixi.js';

export class SelectionTool extends BaseTool {
  constructor(engine) {
    super(engine);
    this.name = 'selection';
    this.label = 'Selection';
    this.icon = '⬚';
    this.cursor = 'crosshair';
    this.hotkey = 'M';

    this.settings = {
      mode: 'rectangular', // 'rectangular', 'elliptical', 'lasso', 'magic_wand'
      feather: 0,
      antialias: true,
      tolerance: 32, // for magic wand
      contiguous: true // for magic wand
    };

    this.isSelecting = false;
    this.startPoint = null;
    this.currentSelection = null;
    this.selectionGraphics = null;
    this.marchingAnts = null;
  }

  async init() {
    this.createSelectionGraphics();
    this.setupMarchingAnts();
  }

  createSelectionGraphics() {
    this.selectionGraphics = new PIXI.Graphics();
    this.engine.uiContainer.addChild(this.selectionGraphics);
  }

  setupMarchingAnts() {
    // Animated dashed border for selection
    this.marchingAnts = {
      offset: 0,
      timer: null
    };
  }

  onActivate() {
    this.updateSelectionDisplay();
  }

  onDeactivate() {
    this.clearSelection();
  }

  onPointerDown(event) {
    if (!this.engine.currentDocument) return;

    const point = this.getLocalPoint(event);
    this.startPoint = { x: point.x, y: point.y };
    this.isSelecting = true;

    // Clear existing selection unless holding Shift
    if (!event.shiftKey) {
      this.clearSelection();
    }

    switch (this.settings.mode) {
      case 'rectangular':
      case 'elliptical':
        this.startRectangularSelection(point);
        break;
      case 'lasso':
        this.startLassoSelection(point);
        break;
      case 'magic_wand':
        this.performMagicWandSelection(point);
        break;
    }
  }

  onPointerMove(event) {
    if (!this.isSelecting) return;

    const point = this.getLocalPoint(event);

    switch (this.settings.mode) {
      case 'rectangular':
        this.updateRectangularSelection(point);
        break;
      case 'elliptical':
        this.updateEllipticalSelection(point);
        break;
      case 'lasso':
        this.updateLassoSelection(point);
        break;
    }
  }

  onPointerUp(event) {
    if (!this.isSelecting) return;

    this.finishSelection();
    this.isSelecting = false;
  }

  startRectangularSelection(point) {
    this.currentSelection = {
      type: 'rectangular',
      x: point.x,
      y: point.y,
      width: 0,
      height: 0
    };
  }

  updateRectangularSelection(point) {
    if (!this.currentSelection) return;

    const selection = this.currentSelection;
    selection.width = point.x - this.startPoint.x;
    selection.height = point.y - this.startPoint.y;

    // Normalize for negative dimensions
    if (selection.width < 0) {
      selection.x = this.startPoint.x + selection.width;
      selection.width = Math.abs(selection.width);
    } else {
      selection.x = this.startPoint.x;
    }

    if (selection.height < 0) {
      selection.y = this.startPoint.y + selection.height;
      selection.height = Math.abs(selection.height);
    } else {
      selection.y = this.startPoint.y;
    }

    this.drawSelectionPreview();
  }

  updateEllipticalSelection(point) {
    if (!this.currentSelection) return;

    const centerX = (this.startPoint.x + point.x) / 2;
    const centerY = (this.startPoint.y + point.y) / 2;
    const radiusX = Math.abs(point.x - this.startPoint.x) / 2;
    const radiusY = Math.abs(point.y - this.startPoint.y) / 2;

    this.currentSelection = {
      type: 'elliptical',
      centerX,
      centerY,
      radiusX,
      radiusY
    };

    this.drawSelectionPreview();
  }

  startLassoSelection(point) {
    this.currentSelection = {
      type: 'lasso',
      points: [{ x: point.x, y: point.y }]
    };
  }

  updateLassoSelection(point) {
    if (!this.currentSelection) return;

    this.currentSelection.points.push({ x: point.x, y: point.y });
    this.drawSelectionPreview();
  }

  performMagicWandSelection(point) {
    const layer = this.engine.layers.activeLayer;
    if (!layer || layer.type !== 'raster') return;

    // Get image data
    const imageData = layer.context.getImageData(0, 0, layer.width, layer.height);
    const selection = this.magicWandSelect(
      imageData,
      Math.floor(point.x),
      Math.floor(point.y),
      this.settings.tolerance,
      this.settings.contiguous
    );

    if (selection) {
      this.currentSelection = {
        type: 'bitmap',
        mask: selection
      };
      this.finishSelection();
    }
  }

  magicWandSelect(imageData, startX, startY, tolerance, contiguous) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    
    if (startX < 0 || startX >= width || startY < 0 || startY >= height) return null;

    const mask = new Uint8Array(width * height);
    const visited = new Uint8Array(width * height);
    
    const startIndex = (startY * width + startX) * 4;
    const targetR = data[startIndex];
    const targetG = data[startIndex + 1];
    const targetB = data[startIndex + 2];
    const targetA = data[startIndex + 3];

    const colorMatch = (r, g, b, a) => {
      const dr = Math.abs(r - targetR);
      const dg = Math.abs(g - targetG);
      const db = Math.abs(b - targetB);
      const da = Math.abs(a - targetA);
      return (dr + dg + db + da) <= tolerance * 4;
    };

    if (contiguous) {
      // Flood fill algorithm
      const stack = [{ x: startX, y: startY }];
      
      while (stack.length > 0) {
        const { x, y } = stack.pop();
        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        
        const index = y * width + x;
        if (visited[index]) continue;
        
        visited[index] = 1;
        const pixelIndex = index * 4;
        
        if (colorMatch(data[pixelIndex], data[pixelIndex + 1], data[pixelIndex + 2], data[pixelIndex + 3])) {
          mask[index] = 255;
          stack.push({ x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 });
        }
      }
    } else {
      // Select all matching pixels
      for (let i = 0; i < width * height; i++) {
        const pixelIndex = i * 4;
        if (colorMatch(data[pixelIndex], data[pixelIndex + 1], data[pixelIndex + 2], data[pixelIndex + 3])) {
          mask[i] = 255;
        }
      }
    }

    return { width, height, data: mask };
  }

  drawSelectionPreview() {
    this.selectionGraphics.clear();
    
    if (!this.currentSelection) return;

    // Draw selection outline
    this.selectionGraphics.lineStyle(1, 0xffffff, 1);
    
    switch (this.currentSelection.type) {
      case 'rectangular':
        this.drawDashedRect(
          this.currentSelection.x,
          this.currentSelection.y,
          this.currentSelection.width,
          this.currentSelection.height
        );
        break;
        
      case 'elliptical':
        this.drawDashedEllipse(
          this.currentSelection.centerX,
          this.currentSelection.centerY,
          this.currentSelection.radiusX,
          this.currentSelection.radiusY
        );
        break;
        
      case 'lasso':
        this.drawDashedPolygon(this.currentSelection.points);
        break;
    }
  }

  drawDashedRect(x, y, width, height) {
    const dashLength = 8;
    const gapLength = 4;
    const perimeter = (width + height) * 2;
    const totalDashLength = dashLength + gapLength;
    
    let currentLength = this.marchingAnts.offset % totalDashLength;
    let drawing = currentLength < dashLength;
    
    // Top edge
    for (let i = 0; i < width; i++) {
      if (drawing) {
        this.selectionGraphics.moveTo(x + i, y);
        this.selectionGraphics.lineTo(x + i + 1, y);
      }
      currentLength = (currentLength + 1) % totalDashLength;
      drawing = currentLength < dashLength;
    }
    
    // Similar for other edges...
  }

  drawDashedEllipse(centerX, centerY, radiusX, radiusY) {
    // Simplified ellipse drawing - could be enhanced
    this.selectionGraphics.drawEllipse(centerX, centerY, radiusX, radiusY);
  }

  drawDashedPolygon(points) {
    if (points.length < 2) return;
    
    this.selectionGraphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.selectionGraphics.lineTo(points[i].x, points[i].y);
    }
    this.selectionGraphics.closePath();
  }

  finishSelection() {
    if (!this.currentSelection) return;

    // Apply feathering if specified
    if (this.settings.feather > 0) {
      this.applyFeathering();
    }

    // Notify selection manager
    this.engine.selection.setSelection(this.currentSelection);
    
    this.updateSelectionDisplay();
    this.startMarchingAnts();
  }

  applyFeathering() {
    // Implement feathering algorithm
    // This would involve creating a soft edge transition
  }

  clearSelection() {
    this.currentSelection = null;
    this.selectionGraphics.clear();
    this.stopMarchingAnts();
    this.engine.selection.clearSelection();
  }

  startMarchingAnts() {
    if (this.marchingAnts.timer) {
      clearInterval(this.marchingAnts.timer);
    }
    
    this.marchingAnts.timer = setInterval(() => {
      this.marchingAnts.offset = (this.marchingAnts.offset + 1) % 12;
      this.drawSelectionPreview();
    }, 100);
  }

  stopMarchingAnts() {
    if (this.marchingAnts.timer) {
      clearInterval(this.marchingAnts.timer);
      this.marchingAnts.timer = null;
    }
  }

  updateSelectionDisplay() {
    const hasSelection = this.engine.selection.hasSelection();
    if (hasSelection) {
      this.drawSelectionPreview();
      this.startMarchingAnts();
    } else {
      this.selectionGraphics.clear();
      this.stopMarchingAnts();
    }
  }

  destroy() {
    this.stopMarchingAnts();
    if (this.selectionGraphics) {
      this.selectionGraphics.destroy();
    }
    super.destroy();
  }
}