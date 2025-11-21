/**
 * Transform Manager - Advanced transformation system with handles and constraints
 */
import { EventEmitter } from 'eventemitter3';
import * as PIXI from 'pixi.js';

export class TransformManager extends EventEmitter {
  constructor(engine) {
    super();
    this.engine = engine;
    this.transformContainer = null;
    this.transformHandles = null;
    this.activeTransform = null;
    this.transformMode = 'free'; // 'free', 'scale', 'rotate', 'skew'
  }

  async init() {
    console.log('TransformManager: init() started');
    console.log('TransformManager: Creating transform container');
    this.createTransformContainer();
    console.log('TransformManager: Creating transform handles');
    this.createTransformHandles();
    console.log('TransformManager: Setting up event handlers');
    this.setupEventHandlers();
    console.log('TransformManager: init() finished');
  }

  createTransformContainer() {
    this.transformContainer = new PIXI.Container();
    this.engine.uiContainer.addChild(this.transformContainer);
  }

  createTransformHandles() {
    this.transformHandles = {
      container: new PIXI.Container(),
      corners: [],
      edges: [],
      center: null,
      rotateHandle: null
    };

    // Create corner handles
    const cornerPositions = [
      { x: -1, y: -1, cursor: 'nw-resize' },
      { x: 1, y: -1, cursor: 'ne-resize' },
      { x: 1, y: 1, cursor: 'se-resize' },
      { x: -1, y: 1, cursor: 'sw-resize' }
    ];

    cornerPositions.forEach((pos, index) => {
      const handle = this.createHandle(8, 0x4CAF50, pos.cursor);
      handle.position.set(pos.x, pos.y);
      handle.userData = { type: 'corner', index, position: pos };
      this.transformHandles.corners.push(handle);
      this.transformHandles.container.addChild(handle);
    });

    // Create edge handles
    const edgePositions = [
      { x: 0, y: -1, cursor: 'n-resize' },
      { x: 1, y: 0, cursor: 'e-resize' },
      { x: 0, y: 1, cursor: 's-resize' },
      { x: -1, y: 0, cursor: 'w-resize' }
    ];

    edgePositions.forEach((pos, index) => {
      const handle = this.createHandle(6, 0x2196F3, pos.cursor);
      handle.position.set(pos.x, pos.y);
      handle.userData = { type: 'edge', index, position: pos };
      this.transformHandles.edges.push(handle);
      this.transformHandles.container.addChild(handle);
    });

    // Create center handle
    this.transformHandles.center = this.createHandle(8, 0xFF9800, 'move');
    this.transformHandles.center.userData = { type: 'center' };
    this.transformHandles.container.addChild(this.transformHandles.center);

    // Create rotation handle
    this.transformHandles.rotateHandle = this.createHandle(8, 0xE91E63, 'grab');
    this.transformHandles.rotateHandle.position.set(0, -30);
    this.transformHandles.rotateHandle.userData = { type: 'rotate' };
    this.transformHandles.container.addChild(this.transformHandles.rotateHandle);

    this.transformContainer.addChild(this.transformHandles.container);
    this.hideTransformHandles();
  }

  createHandle(size, color, cursor) {
    const handle = new PIXI.Graphics();
    handle.beginFill(color);
    handle.drawRect(-size/2, -size/2, size, size);
    handle.endFill();
    handle.beginFill(0xFFFFFF);
    handle.lineStyle(1, 0x000000);
    handle.drawRect(-size/2 + 1, -size/2 + 1, size - 2, size - 2);
    handle.endFill();
    
    handle.interactive = true;
    handle.buttonMode = true;
    handle.cursor = cursor;
    
    return handle;
  }

  setupEventHandlers() {
    // Handle interactions
    this.transformHandles.container.children.forEach(handle => {
      handle.on('pointerdown', (event) => this.startTransform(event, handle));
    });

    // Listen for layer selection changes
    this.engine.layers.on('activeLayerChanged', (layer) => {
      if (layer && !layer.locked) {
        this.showTransformForLayer(layer);
      } else {
        this.hideTransformHandles();
      }
    });
  }

  showTransformForLayer(layer) {
    if (!layer || layer.locked) {
      this.hideTransformHandles();
      return;
    }

    this.activeTransform = {
      layer,
      originalBounds: this.getLayerBounds(layer),
      currentBounds: this.getLayerBounds(layer),
      transform: {
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        skewX: 0,
        skewY: 0
      }
    };

    this.updateTransformHandlePositions();
    this.transformHandles.container.visible = true;
    this.emit('transformStarted', this.activeTransform);
  }

  hideTransformHandles() {
    this.transformHandles.container.visible = false;
    this.activeTransform = null;
    this.emit('transformEnded');
  }

  getLayerBounds(layer) {
    // Get the visible bounds of the layer content
    if (layer.sprite) {
      const bounds = layer.sprite.getBounds();
      return {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        centerX: bounds.x + bounds.width / 2,
        centerY: bounds.y + bounds.height / 2
      };
    }
    
    return {
      x: 0,
      y: 0,
      width: layer.width,
      height: layer.height,
      centerX: layer.width / 2,
      centerY: layer.height / 2
    };
  }

  updateTransformHandlePositions() {
    if (!this.activeTransform) return;

    const bounds = this.activeTransform.currentBounds;
    const handleContainer = this.transformHandles.container;

    handleContainer.position.set(bounds.centerX, bounds.centerY);
    handleContainer.rotation = this.activeTransform.transform.rotation;

    // Update corner positions
    const halfWidth = bounds.width / 2;
    const halfHeight = bounds.height / 2;

    this.transformHandles.corners[0].position.set(-halfWidth, -halfHeight); // Top-left
    this.transformHandles.corners[1].position.set(halfWidth, -halfHeight);  // Top-right
    this.transformHandles.corners[2].position.set(halfWidth, halfHeight);   // Bottom-right
    this.transformHandles.corners[3].position.set(-halfWidth, halfHeight);  // Bottom-left

    // Update edge positions
    this.transformHandles.edges[0].position.set(0, -halfHeight);        // Top
    this.transformHandles.edges[1].position.set(halfWidth, 0);          // Right
    this.transformHandles.edges[2].position.set(0, halfHeight);         // Bottom
    this.transformHandles.edges[3].position.set(-halfWidth, 0);         // Left

    // Center handle is at origin
    this.transformHandles.center.position.set(0, 0);

    // Rotation handle
    this.transformHandles.rotateHandle.position.set(0, -halfHeight - 30);
  }

  startTransform(event, handle) {
    if (!this.activeTransform) return;

    event.stopPropagation();
    
    const startPoint = this.getLocalPoint(event);
    const handleType = handle.userData.type;

    this.currentOperation = {
      type: handleType,
      handle,
      startPoint,
      startBounds: { ...this.activeTransform.currentBounds },
      startTransform: { ...this.activeTransform.transform },
      constrainAspect: event.shiftKey,
      fromCenter: event.altKey
    };

    // Setup move and end handlers
    const onPointerMove = (e) => this.updateTransform(e);
    const onPointerUp = (e) => this.endTransform(e);

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    this.currentOperation.cleanup = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    this.engine.history.beginOperation('transform', `Transform Layer ${this.activeTransform.layer.name}`);
  }

  updateTransform(event) {
    if (!this.currentOperation || !this.activeTransform) return;

    const currentPoint = this.getLocalPoint(event);
    const { type, startPoint, startBounds, startTransform } = this.currentOperation;

    switch (type) {
      case 'corner':
        this.updateScale(currentPoint, startPoint, startBounds, event.shiftKey, event.altKey);
        break;
      case 'edge':
        this.updateScale(currentPoint, startPoint, startBounds, false, event.altKey, type);
        break;
      case 'center':
        this.updatePosition(currentPoint, startPoint);
        break;
      case 'rotate':
        this.updateRotation(currentPoint, startPoint, startBounds);
        break;
    }

    this.applyTransformToLayer();
    this.updateTransformHandlePositions();
    this.emit('transformChanged', this.activeTransform);
  }

  updateScale(currentPoint, startPoint, startBounds, constrainAspect, fromCenter, edgeType = null) {
    const deltaX = currentPoint.x - startPoint.x;
    const deltaY = currentPoint.y - startPoint.y;

    let scaleX = 1;
    let scaleY = 1;

    if (edgeType === 'edge') {
      // Handle edge scaling
      const handle = this.currentOperation.handle;
      const edgeIndex = handle.userData.index;
      
      switch (edgeIndex) {
        case 0: // Top
        case 2: // Bottom
          scaleY = 1 + (deltaY / startBounds.height) * (edgeIndex === 0 ? -1 : 1);
          break;
        case 1: // Right
        case 3: // Left
          scaleX = 1 + (deltaX / startBounds.width) * (edgeIndex === 3 ? -1 : 1);
          break;
      }
    } else {
      // Handle corner scaling
      scaleX = 1 + deltaX / startBounds.width;
      scaleY = 1 + deltaY / startBounds.height;
    }

    if (constrainAspect) {
      const avgScale = (Math.abs(scaleX) + Math.abs(scaleY)) / 2;
      scaleX = scaleX >= 0 ? avgScale : -avgScale;
      scaleY = scaleY >= 0 ? avgScale : -avgScale;
    }

    this.activeTransform.transform.scaleX = Math.max(0.01, scaleX);
    this.activeTransform.transform.scaleY = Math.max(0.01, scaleY);

    // Update bounds
    this.activeTransform.currentBounds.width = startBounds.width * Math.abs(scaleX);
    this.activeTransform.currentBounds.height = startBounds.height * Math.abs(scaleY);
  }

  updatePosition(currentPoint, startPoint) {
    const deltaX = currentPoint.x - startPoint.x;
    const deltaY = currentPoint.y - startPoint.y;

    this.activeTransform.transform.x += deltaX;
    this.activeTransform.transform.y += deltaY;

    this.activeTransform.currentBounds.x += deltaX;
    this.activeTransform.currentBounds.y += deltaY;
    this.activeTransform.currentBounds.centerX += deltaX;
    this.activeTransform.currentBounds.centerY += deltaY;

    this.currentOperation.startPoint = currentPoint;
  }

  updateRotation(currentPoint, startPoint, startBounds) {
    const centerX = startBounds.centerX;
    const centerY = startBounds.centerY;

    const startAngle = Math.atan2(startPoint.y - centerY, startPoint.x - centerX);
    const currentAngle = Math.atan2(currentPoint.y - centerY, currentPoint.x - centerX);
    
    const deltaAngle = currentAngle - startAngle;
    this.activeTransform.transform.rotation = this.currentOperation.startTransform.rotation + deltaAngle;
  }

  applyTransformToLayer() {
    if (!this.activeTransform || !this.activeTransform.layer.sprite) return;

    const sprite = this.activeTransform.layer.sprite;
    const transform = this.activeTransform.transform;

    sprite.position.set(
      this.activeTransform.originalBounds.centerX + transform.x,
      this.activeTransform.originalBounds.centerY + transform.y
    );
    
    sprite.scale.set(transform.scaleX, transform.scaleY);
    sprite.rotation = transform.rotation;
    sprite.skew.set(transform.skewX, transform.skewY);
  }

  endTransform(event) {
    if (!this.currentOperation) return;

    this.currentOperation.cleanup();
    this.currentOperation = null;

    this.engine.history.endOperation();
    this.emit('transformCompleted', this.activeTransform);
  }

  getLocalPoint(event) {
    const rect = this.engine.app.view.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return this.engine.viewport.toLocal({ x, y });
  }

  // Transform operations
  resetTransform() {
    if (!this.activeTransform) return;

    this.engine.history.beginOperation('reset_transform', 'Reset Transform');
    
    this.activeTransform.transform = {
      x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, skewX: 0, skewY: 0
    };
    
    this.activeTransform.currentBounds = { ...this.activeTransform.originalBounds };
    this.applyTransformToLayer();
    this.updateTransformHandlePositions();
    
    this.engine.history.endOperation();
  }

  flipHorizontal() {
    if (!this.activeTransform) return;

    this.engine.history.beginOperation('flip_horizontal', 'Flip Horizontal');
    this.activeTransform.transform.scaleX *= -1;
    this.applyTransformToLayer();
    this.updateTransformHandlePositions();
    this.engine.history.endOperation();
  }

  flipVertical() {
    if (!this.activeTransform) return;

    this.engine.history.beginOperation('flip_vertical', 'Flip Vertical');
    this.activeTransform.transform.scaleY *= -1;
    this.applyTransformToLayer();
    this.updateTransformHandlePositions();
    this.engine.history.endOperation();
  }

  rotate90CW() {
    if (!this.activeTransform) return;

    this.engine.history.beginOperation('rotate_90cw', 'Rotate 90° CW');
    this.activeTransform.transform.rotation += Math.PI / 2;
    this.applyTransformToLayer();
    this.updateTransformHandlePositions();
    this.engine.history.endOperation();
  }

  rotate90CCW() {
    if (!this.activeTransform) return;

    this.engine.history.beginOperation('rotate_90ccw', 'Rotate 90° CCW');
    this.activeTransform.transform.rotation -= Math.PI / 2;
    this.applyTransformToLayer();
    this.updateTransformHandlePositions();
    this.engine.history.endOperation();
  }

  destroy() {
    this.hideTransformHandles();
    if (this.transformContainer) {
      this.transformContainer.destroy(true);
    }
    this.removeAllListeners();
  }
}