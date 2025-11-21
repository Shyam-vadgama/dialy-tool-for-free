/**
 * Tool Manager - Professional tool system with brushes, selections, and transformations
 */
import { EventEmitter } from 'eventemitter3';
import { BaseTool } from './BaseTool.js';
import { BrushTool } from '../tools/BrushTool.js';
import { SelectionTool } from '../tools/SelectionTool.js';
import { MoveTool } from '../tools/MoveTool.js';
import { EraserTool } from '../tools/EraserTool.js';
import { CloneStampTool } from '../tools/CloneStampTool.js';
import { CropTool } from '../tools/CropTool.js';
import { TextTool } from '../tools/TextTool.js';

export class ToolManager extends EventEmitter {
  constructor(engine) {
    super();
    this.engine = engine;
    this.tools = new Map();
    this.activeTool = null;
    this.toolSettings = {};
  }

  async init() {
    console.log('ToolManager: init() started');
    // Register all available tools
    this.registerTool('brush', new BrushTool(this.engine));
    this.registerTool('selection', new SelectionTool(this.engine));
    this.registerTool('move', new MoveTool(this.engine));
    this.registerTool('eraser', new EraserTool(this.engine));
    this.registerTool('clone', new CloneStampTool(this.engine));
    this.registerTool('crop', new CropTool(this.engine));
    this.registerTool('text', new TextTool(this.engine));
    console.log('ToolManager: All tools registered');

    // Initialize tools
    console.log('ToolManager: Initializing individual tools...');
    for (const tool of this.tools.values()) {
      console.log(`ToolManager: Initializing ${tool.name} tool.`);
      await tool.init();
      console.log(`ToolManager: ${tool.name} tool initialized.`);
    }
    console.log('ToolManager: All individual tools initialized');

    // Set default tool
    this.setActiveTool('move');
    console.log('ToolManager: Default tool set to "move"');
    console.log('ToolManager: init() finished');
  }

  registerTool(name, tool) {
    this.tools.set(name, tool);
    tool.on('settingsChanged', (settings) => {
      this.toolSettings[name] = { ...this.toolSettings[name], ...settings };
      this.emit('toolSettingsChanged', name, settings);
    });
  }

  setActiveTool(toolName) {
    const tool = this.tools.get(toolName);
    if (!tool) {
      console.warn(`Tool "${toolName}" not found`);
      return;
    }

    // Deactivate current tool
    if (this.activeTool) {
      this.activeTool.deactivate();
    }

    // Activate new tool
    this.activeTool = tool;
    this.activeTool.activate();

    this.emit('toolChanged', tool);
  }

  getActiveTool() {
    return this.activeTool;
  }

  getTool(name) {
    return this.tools.get(name);
  }

  getAllTools() {
    return Array.from(this.tools.entries()).map(([name, tool]) => ({
      name,
      tool,
      icon: tool.icon,
      label: tool.label,
      hotkey: tool.hotkey
    }));
  }

  getToolSettings(toolName) {
    return this.toolSettings[toolName] || {};
  }

  updateToolSettings(toolName, settings) {
    this.toolSettings[toolName] = { ...this.toolSettings[toolName], ...settings };
    const tool = this.tools.get(toolName);
    if (tool && tool.updateSettings) {
      tool.updateSettings(settings);
    }
    this.emit('toolSettingsChanged', toolName, settings);
  }

  destroy() {
    for (const tool of this.tools.values()) {
      tool.destroy();
    }
    this.tools.clear();
    this.removeAllListeners();
  }
}