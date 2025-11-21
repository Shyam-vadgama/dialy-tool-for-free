import { EventEmitter } from 'eventemitter3';

export class BaseTool extends EventEmitter {
  constructor(engine) {
    super();
    this.engine = engine;
    this.name = 'base';
    this.label = 'Base Tool';
    this.icon = '🔧';
    this.cursor = 'default';
    this.hotkey = null;
    this.active = false;
    this.settings = {};
  }

  async init() {
    // Override in subclasses
  }

  activate() {
    this.active = true;
    this.engine.container.style.cursor = this.cursor;
    this.onActivate();
  }

  deactivate() {
    this.active = false;
    this.onDeactivate();
  }

  onActivate() {
    // Override in subclasses
  }

  onDeactivate() {
    // Override in subclasses
  }

  onPointerDown(event) {
    // Override in subclasses
  }

  onPointerMove(event) {
    // Override in subclasses
  }

  onPointerUp(event) {
    // Override in subclasses
  }

  onKeyDown(event) {
    // Override in subclasses
  }

  onKeyUp(event) {
    // Override in subclasses
  }

  updateSettings(settings) {
    this.settings = { ...this.settings, ...settings };
    this.emit('settingsChanged', settings);
  }

  getLocalPoint(event) {
    const rect = this.engine.app.view.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return this.engine.viewport.toLocal({ x, y });
  }

  destroy() {
    this.removeAllListeners();
  }
}