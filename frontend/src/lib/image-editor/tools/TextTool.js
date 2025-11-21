/**
 * Text Tool - Add and edit text layers
 */
import { BaseTool } from '../core/BaseTool.js';
import * as PIXI from 'pixi.js';

export class TextTool extends BaseTool {
  constructor(engine) {
    super(engine);
    this.name = 'text';
    this.label = 'Text';
    this.icon = 'T';
    this.cursor = 'text';
    this.hotkey = 'T';

    this.settings = {
      fontFamily: 'Arial',
      fontSize: 24,
      fontWeight: 'normal',
      fontStyle: 'normal',
      color: '#000000',
      align: 'left'
    };

    this.activeTextInput = null;
    this.textLayer = null;
  }

  onPointerDown(event) {
    if (!this.engine.currentDocument) return;

    const point = this.getLocalPoint(event);
    this.createTextInput(point.x, point.y);
  }

  createTextInput(x, y) {
    // Remove any existing text input
    this.removeTextInput();

    // Create HTML input for text editing
    this.activeTextInput = document.createElement('textarea');
    this.activeTextInput.style.position = 'absolute';
    this.activeTextInput.style.left = `${x}px`;
    this.activeTextInput.style.top = `${y}px`;
    this.activeTextInput.style.fontSize = `${this.settings.fontSize}px`;
    this.activeTextInput.style.fontFamily = this.settings.fontFamily;
    this.activeTextInput.style.fontWeight = this.settings.fontWeight;
    this.activeTextInput.style.fontStyle = this.settings.fontStyle;
    this.activeTextInput.style.color = this.settings.color;
    this.activeTextInput.style.background = 'transparent';
    this.activeTextInput.style.border = '2px dashed #0080ff';
    this.activeTextInput.style.outline = 'none';
    this.activeTextInput.style.resize = 'both';
    this.activeTextInput.style.minWidth = '100px';
    this.activeTextInput.style.minHeight = '30px';
    this.activeTextInput.placeholder = 'Enter text...';

    this.engine.container.appendChild(this.activeTextInput);
    this.activeTextInput.focus();

    // Handle text completion
    this.activeTextInput.addEventListener('blur', () => {
      this.commitText();
    });

    this.activeTextInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && event.ctrlKey) {
        this.commitText();
      }
    });

    // Store position for text layer creation
    this.textPosition = { x, y };
  }

  commitText() {
    if (!this.activeTextInput || !this.activeTextInput.value.trim()) {
      this.removeTextInput();
      return;
    }

    this.engine.history.beginOperation('add_text', 'Add Text');

    // Create text layer
    this.textLayer = this.engine.layers.createLayer('Text', 'text');
    this.createTextSprite(this.activeTextInput.value);

    this.removeTextInput();
    this.engine.history.endOperation();
  }

  createTextSprite(text) {
    if (!this.textLayer) return;

    const style = new PIXI.TextStyle({
      fontFamily: this.settings.fontFamily,
      fontSize: this.settings.fontSize,
      fontWeight: this.settings.fontWeight,
      fontStyle: this.settings.fontStyle,
      fill: this.settings.color,
      align: this.settings.align,
      wordWrap: true,
      wordWrapWidth: 400
    });

    const textSprite = new PIXI.Text(text, style);
    textSprite.position.set(this.textPosition.x, this.textPosition.y);
    
    this.textLayer.container.addChild(textSprite);
    this.textLayer.textSprite = textSprite;
    this.textLayer.text = text;
    
    // Store text properties for editing
    this.textLayer.textStyle = { ...this.settings };
  }

  removeTextInput() {
    if (this.activeTextInput) {
      this.engine.container.removeChild(this.activeTextInput);
      this.activeTextInput = null;
    }
  }

  editTextLayer(layer) {
    if (layer.type !== 'text' || !layer.textSprite) return;

    const bounds = layer.textSprite.getBounds();
    
    // Create input at text position
    this.createTextInput(bounds.x, bounds.y);
    this.activeTextInput.value = layer.text || '';
    
    // Apply layer's style
    Object.assign(this.settings, layer.textStyle || {});
    this.updateTextInputStyle();
    
    // Remove the text sprite temporarily
    layer.container.removeChild(layer.textSprite);
    this.textLayer = layer;
  }

  updateTextInputStyle() {
    if (!this.activeTextInput) return;

    this.activeTextInput.style.fontSize = `${this.settings.fontSize}px`;
    this.activeTextInput.style.fontFamily = this.settings.fontFamily;
    this.activeTextInput.style.fontWeight = this.settings.fontWeight;
    this.activeTextInput.style.fontStyle = this.settings.fontStyle;
    this.activeTextInput.style.color = this.settings.color;
  }

  updateSettings(settings) {
    super.updateSettings(settings);
    this.updateTextInputStyle();
  }

  onDeactivate() {
    if (this.activeTextInput) {
      this.commitText();
    }
  }

  destroy() {
    this.removeTextInput();
    super.destroy();
  }
}