/**
 * Professional Image Editor Engine
 * WebGL-accelerated multi-layer image editing with advanced tools
 */
import * as PIXI from 'pixi.js';
import { EventEmitter } from 'eventemitter3';
import { LayerManager } from './LayerManager.js';
import { ToolManager } from './ToolManager.js';
import { HistoryManager } from './HistoryManager.js';
import { SelectionManager } from './SelectionManager.js';
import { TransformManager } from './TransformManager.js';

export class EditorEngine extends EventEmitter {
  constructor(container, options = {}) {
    super();
    
    this.container = container;
    this.options = {
      width: 1920,
      height: 1080,
      backgroundColor: 0x2d2d30,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      ...options
    };

    this.initialized = false;
    this.currentDocument = null;
    this.viewport = null;
    this.ui = null;

    // Core managers
    this.layers = new LayerManager(this);
    this.tools = new ToolManager(this);
    this.history = new HistoryManager(this);
    this.selection = new SelectionManager(this);
    this.transform = new TransformManager(this);


  }

  async init() {
    console.log('EditorEngine: init() started');
    try {
      // Initialize PIXI Application with WebGL
      console.log('EditorEngine: Initializing PIXI Application');
      this.app = new PIXI.Application({
        width: this.options.width,
        height: this.options.height,
        backgroundColor: this.options.backgroundColor,
        antialias: this.options.antialias,
        resolution: this.options.resolution,
        autoDensity: this.options.autoDensity,
        hello: false
      });
      console.log('EditorEngine: PIXI Application initialized');

      // Add canvas to container
      this.container.appendChild(this.app.view);
      console.log('EditorEngine: Canvas added to container');

      // Initialize viewport for panning/zooming
      console.log('EditorEngine: Initializing viewport');
      await this.initViewport();
      console.log('EditorEngine: Viewport initialized');

      // Initialize core systems
      console.log('EditorEngine: Initializing LayerManager');
      await this.layers.init();
      console.log('EditorEngine: LayerManager initialized');

      console.log('EditorEngine: Initializing ToolManager');
      await this.tools.init();
      console.log('EditorEngine: ToolManager initialized');
      
      console.log('EditorEngine: Initializing HistoryManager');
      await this.history.init();
      console.log('EditorEngine: HistoryManager initialized');
      
      console.log('EditorEngine: Initializing SelectionManager');
      await this.selection.init();
      console.log('EditorEngine: SelectionManager initialized');
      
      console.log('EditorEngine: Initializing TransformManager');
      await this.transform.init();
      console.log('EditorEngine: TransformManager initialized');

      // Setup event handlers
      console.log('EditorEngine: Setting up event handlers');
      this.setupEventHandlers();
      console.log('EditorEngine: Event handlers set up');

      this.initialized = true;
      this.emit('initialized');

      console.log('EditorEngine initialized successfully');
    } catch (error) {
      console.error('Failed to initialize EditorEngine:', error);
      this.emit('error', error);
    }
  }

  async initViewport() {
    // Create main viewport container
    this.viewport = new PIXI.Container();
    this.app.stage.addChild(this.viewport);

    // Document container (holds all layers)
    this.documentContainer = new PIXI.Container();
    this.viewport.addChild(this.documentContainer);

    // UI overlay container (tools, selections, etc.)
    this.uiContainer = new PIXI.Container();
    this.app.stage.addChild(this.uiContainer);

    // Setup viewport interaction
    this.viewport.interactive = true;
    this.viewport.hitArea = new PIXI.Rectangle(0, 0, this.app.view.width, this.app.view.height);
  }

  setupEventHandlers() {
    // Window resize handling
    window.addEventListener('resize', () => this.handleResize());
    
    // Viewport interaction
    this.viewport.on('pointerdown', (event) => this.handlePointerDown(event));
    this.viewport.on('pointermove', (event) => this.handlePointerMove(event));
    this.viewport.on('pointerup', (event) => this.handlePointerUp(event));
    this.viewport.on('wheel', (event) => this.handleWheel(event));

    // Tool events
    this.tools.on('toolChanged', (tool) => this.handleToolChange(tool));
  }

  // Document Management
  async createDocument(width, height, options = {}) {
    const document = {
      id: Date.now().toString(),
      name: options.name || 'Untitled',
      width,
      height,
      resolution: options.resolution || 300,
      colorMode: options.colorMode || 'RGB',
      backgroundColor: options.backgroundColor || 0xffffff,
      created: new Date(),
      modified: new Date()
    };

    this.currentDocument = document;
    this.layers.createDocument(document);
    this.history.clear();
    
    // Create background layer
    const bgLayer = this.layers.createLayer('Background', 'raster');
    bgLayer.fillColor(document.backgroundColor);

    this.emit('documentCreated', document);
    return document;
  }

  async openDocument(file) {
    try {
      this.emit('documentLoading', file.name);
      
      const imageData = await this.loadImage(file);
      const document = await this.createDocument(imageData.width, imageData.height, {
        name: file.name
      });

      // Create image layer
      const imageLayer = this.layers.createLayer('Image', 'raster');
      imageLayer.setContent(imageData);

      this.fitToScreen();
      this.emit('documentOpened', document);
      
      return document;
    } catch (error) {
      console.error('Failed to open document:', error);
      this.emit('error', error);
    }
  }

  async loadImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const texture = PIXI.Texture.from(canvas);
        resolve({
          width: img.width,
          height: img.height,
          texture,
          canvas,
          imageData: ctx.getImageData(0, 0, img.width, img.height)
        });
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  // Viewport Controls
  fitToScreen() {
    if (!this.currentDocument) return;

    const padding = 50;
    const availableWidth = this.app.view.width - padding * 2;
    const availableHeight = this.app.view.height - padding * 2;

    const scaleX = availableWidth / this.currentDocument.width;
    const scaleY = availableHeight / this.currentDocument.height;
    const scale = Math.min(scaleX, scaleY, 1);

    this.setZoom(scale);
    this.centerDocument();
  }

  setZoom(scale) {
    this.viewport.scale.set(scale);
    this.emit('zoomChanged', scale);
  }

  centerDocument() {
    if (!this.currentDocument) return;

    const centerX = (this.app.view.width - this.currentDocument.width * this.viewport.scale.x) / 2;
    const centerY = (this.app.view.height - this.currentDocument.height * this.viewport.scale.y) / 2;

    this.viewport.position.set(centerX, centerY);
  }

  // Event Handlers
  handleResize() {
    this.app.renderer.resize(this.container.clientWidth, this.container.clientHeight);
    if (this.viewport) {
      this.viewport.hitArea = new PIXI.Rectangle(0, 0, this.app.view.width, this.app.view.height);
    }
  }

  handlePointerDown(event) {
    const tool = this.tools.getActiveTool();
    if (tool && tool.onPointerDown) {
      tool.onPointerDown(event);
    }
  }

  handlePointerMove(event) {
    const tool = this.tools.getActiveTool();
    if (tool && tool.onPointerMove) {
      tool.onPointerMove(event);
    }
  }

  handlePointerUp(event) {
    const tool = this.tools.getActiveTool();
    if (tool && tool.onPointerUp) {
      tool.onPointerUp(event);
    }
  }

  handleWheel(event) {
    event.preventDefault();
    
    const delta = event.deltaY;
    const zoomFactor = delta > 0 ? 0.9 : 1.1;
    const newScale = this.viewport.scale.x * zoomFactor;
    
    // Zoom limits
    const minZoom = 0.01;
    const maxZoom = 32;
    
    if (newScale >= minZoom && newScale <= maxZoom) {
      // Zoom towards mouse position
      const mouseX = event.clientX;
      const mouseY = event.clientY;
      
      const worldPos = this.viewport.toLocal(new PIXI.Point(mouseX, mouseY));
      
      this.setZoom(newScale);
      
      const newWorldPos = this.viewport.toLocal(new PIXI.Point(mouseX, mouseY));
      this.viewport.position.x += (worldPos.x - newWorldPos.x) * this.viewport.scale.x;
      this.viewport.position.y += (worldPos.y - newWorldPos.y) * this.viewport.scale.y;
    }
  }

  handleToolChange(tool) {
    // Update cursor and UI based on active tool
    this.container.style.cursor = tool.cursor || 'default';
    this.emit('activeToolChanged', tool);
  }

  // Export/Save
  async exportDocument(format = 'PNG', options = {}) {
    if (!this.currentDocument) return null;

    try {
      // Render the document to a canvas
      const renderTexture = PIXI.RenderTexture.create({
        width: this.currentDocument.width,
        height: this.currentDocument.height
      });

      this.app.renderer.render(this.documentContainer, renderTexture);

      // Extract canvas from render texture
      const canvas = this.app.renderer.extract.canvas(renderTexture);
      
      // Convert to desired format
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, `image/${format.toLowerCase()}`, options.quality || 0.9);
      });

      renderTexture.destroy();
      return blob;
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  // Cleanup
  destroy() {
    if (this.app) {
      this.app.destroy(true, true);
    }
    
    this.layers?.destroy();
    this.tools?.destroy();
    this.history?.destroy();
    this.selection?.destroy();
    this.transform?.destroy();

    this.removeAllListeners();
  }
}