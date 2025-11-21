/**
 * Professional Tool Panel Component
 * Advanced tool selection and configuration for image editing
 */
import React, { useState, useCallback } from 'react';

const ToolPanel = ({ 
  activeTool,
  onToolSelect,
  toolSettings,
  onToolSettingChange,
  onToolReset,
  brushPresets = [],
  onBrushPresetSelect,
  onBrushPresetSave
}) => {
  const [expandedSection, setExpandedSection] = useState('tools');
  const [customBrushName, setCustomBrushName] = useState('');

  // Tool definitions with categories
  const toolCategories = {
    selection: [
      { id: 'rectangular-selection', name: 'Rectangular Select', icon: '⬛', hotkey: 'R' },
      { id: 'elliptical-selection', name: 'Elliptical Select', icon: '⭕', hotkey: 'E' },
      { id: 'lasso-selection', name: 'Lasso Select', icon: '🪃', hotkey: 'L' },
      { id: 'magic-wand', name: 'Magic Wand', icon: '🪄', hotkey: 'W' },
      { id: 'quick-selection', name: 'Quick Selection', icon: '⚡', hotkey: 'Q' }
    ],
    painting: [
      { id: 'brush', name: 'Brush', icon: '🖌️', hotkey: 'B' },
      { id: 'pencil', name: 'Pencil', icon: '✏️', hotkey: 'P' },
      { id: 'eraser', name: 'Eraser', icon: '🧹', hotkey: 'E' },
      { id: 'clone-stamp', name: 'Clone Stamp', icon: '📋', hotkey: 'S' },
      { id: 'healing-brush', name: 'Healing Brush', icon: '🩹', hotkey: 'H' },
      { id: 'smudge', name: 'Smudge', icon: '👆', hotkey: 'U' }
    ],
    adjustment: [
      { id: 'dodge', name: 'Dodge', icon: '☀️', hotkey: 'O' },
      { id: 'burn', name: 'Burn', icon: '🔥', hotkey: 'B' },
      { id: 'sponge', name: 'Sponge', icon: '🧽', hotkey: 'S' },
      { id: 'blur', name: 'Blur', icon: '💫', hotkey: 'R' },
      { id: 'sharpen', name: 'Sharpen', icon: '🔍', hotkey: 'P' }
    ],
    utility: [
      { id: 'move', name: 'Move', icon: '✋', hotkey: 'V' },
      { id: 'crop', name: 'Crop', icon: '✂️', hotkey: 'C' },
      { id: 'text', name: 'Text', icon: '📝', hotkey: 'T' },
      { id: 'eyedropper', name: 'Eyedropper', icon: '💉', hotkey: 'I' },
      { id: 'zoom', name: 'Zoom', icon: '🔍', hotkey: 'Z' },
      { id: 'hand', name: 'Hand', icon: '👋', hotkey: 'H' }
    ]
  };

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const handleToolSelect = (toolId) => {
    onToolSelect(toolId);
  };

  const renderToolButton = (tool) => (
    <button
      key={tool.id}
      onClick={() => handleToolSelect(tool.id)}
      className={`tool-btn ${activeTool === tool.id ? 'active' : ''}`}
      title={`${tool.name} (${tool.hotkey})`}
      style={{
        position: 'relative'
      }}
    >
      <span style={{ fontSize: '16px' }}>{tool.icon}</span>
      <div style={{ 
        fontSize: '8px', 
        color: 'var(--text-muted)',
        position: 'absolute',
        bottom: '2px',
        right: '2px',
        lineHeight: '1'
      }}>
        {tool.hotkey}
      </div>
    </button>
  );

  const renderBrushSettings = () => {
    if (!['brush', 'pencil', 'eraser', 'clone-stamp', 'healing-brush', 'smudge'].includes(activeTool)) {
      return null;
    }

    return (
      <div style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ 
          fontSize: '12px', 
          fontWeight: '600', 
          marginBottom: '8px',
          color: 'var(--text-primary)'
        }}>
          Brush Settings
        </div>
        
        {/* Brush Size */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ 
            fontSize: '11px', 
            color: 'var(--text-secondary)',
            display: 'block',
            marginBottom: '4px'
          }}>
            Size: {toolSettings?.size || 10}px
          </label>
          <input
            type="range"
            min="1"
            max="200"
            value={toolSettings?.size || 10}
            onChange={(e) => onToolSettingChange('size', parseInt(e.target.value))}
            className="tool-slider"
          />
        </div>

        {/* Brush Hardness */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ 
            fontSize: '11px', 
            color: 'var(--text-secondary)',
            display: 'block',
            marginBottom: '4px'
          }}>
            Hardness: {Math.round((toolSettings?.hardness || 1) * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={toolSettings?.hardness || 1}
            onChange={(e) => onToolSettingChange('hardness', parseFloat(e.target.value))}
            className="tool-slider"
          />
        </div>

        {/* Opacity */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ 
            fontSize: '11px', 
            color: 'var(--text-secondary)',
            display: 'block',
            marginBottom: '4px'
          }}>
            Opacity: {Math.round((toolSettings?.opacity || 1) * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={toolSettings?.opacity || 1}
            onChange={(e) => onToolSettingChange('opacity', parseFloat(e.target.value))}
            className="tool-slider"
          />
        </div>

        {/* Flow (for brush tools) */}
        {['brush', 'pencil'].includes(activeTool) && (
          <div style={{ marginBottom: '12px' }}>
            <label style={{ 
              fontSize: '11px', 
              color: 'var(--text-secondary)',
              display: 'block',
              marginBottom: '4px'
            }}>
              Flow: {Math.round((toolSettings?.flow || 1) * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={toolSettings?.flow || 1}
              onChange={(e) => onToolSettingChange('flow', parseFloat(e.target.value))}
              className="tool-slider"
            />
          </div>
        )}

        {/* Pressure Sensitivity */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ 
            fontSize: '11px', 
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <input
              type="checkbox"
              checked={toolSettings?.pressureSize || false}
              onChange={(e) => onToolSettingChange('pressureSize', e.target.checked)}
              style={{ margin: 0 }}
            />
            Pressure affects size
          </label>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ 
            fontSize: '11px', 
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <input
              type="checkbox"
              checked={toolSettings?.pressureOpacity || false}
              onChange={(e) => onToolSettingChange('pressureOpacity', e.target.checked)}
              style={{ margin: 0 }}
            />
            Pressure affects opacity
          </label>
        </div>
      </div>
    );
  };

  const renderSelectionSettings = () => {
    if (!['rectangular-selection', 'elliptical-selection', 'lasso-selection', 'magic-wand', 'quick-selection'].includes(activeTool)) {
      return null;
    }

    return (
      <div style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ 
          fontSize: '12px', 
          fontWeight: '600', 
          marginBottom: '8px',
          color: 'var(--text-primary)'
        }}>
          Selection Settings
        </div>

        {/* Selection Mode */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ 
            fontSize: '11px', 
            color: 'var(--text-secondary)',
            display: 'block',
            marginBottom: '4px'
          }}>
            Mode
          </label>
          <select
            value={toolSettings?.selectionMode || 'new'}
            onChange={(e) => onToolSettingChange('selectionMode', e.target.value)}
            style={{
              width: '100%',
              padding: '4px',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              backgroundColor: 'var(--background)',
              color: 'var(--text-primary)',
              fontSize: '11px'
            }}
          >
            <option value="new">New selection</option>
            <option value="add">Add to selection</option>
            <option value="subtract">Subtract from selection</option>
            <option value="intersect">Intersect with selection</option>
          </select>
        </div>

        {/* Feather */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ 
            fontSize: '11px', 
            color: 'var(--text-secondary)',
            display: 'block',
            marginBottom: '4px'
          }}>
            Feather: {toolSettings?.feather || 0}px
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={toolSettings?.feather || 0}
            onChange={(e) => onToolSettingChange('feather', parseInt(e.target.value))}
            className="tool-slider"
          />
        </div>

        {/* Magic Wand specific settings */}
        {activeTool === 'magic-wand' && (
          <>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ 
                fontSize: '11px', 
                color: 'var(--text-secondary)',
                display: 'block',
                marginBottom: '4px'
              }}>
                Tolerance: {toolSettings?.tolerance || 32}
              </label>
              <input
                type="range"
                min="0"
                max="255"
                value={toolSettings?.tolerance || 32}
                onChange={(e) => onToolSettingChange('tolerance', parseInt(e.target.value))}
                className="tool-slider"
              />
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ 
                fontSize: '11px', 
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <input
                  type="checkbox"
                  checked={toolSettings?.contiguous || true}
                  onChange={(e) => onToolSettingChange('contiguous', e.target.checked)}
                  style={{ margin: 0 }}
                />
                Contiguous
              </label>
            </div>
          </>
        )}

        {/* Anti-aliasing */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ 
            fontSize: '11px', 
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <input
              type="checkbox"
              checked={toolSettings?.antiAlias !== false}
              onChange={(e) => onToolSettingChange('antiAlias', e.target.checked)}
              style={{ margin: 0 }}
            />
            Anti-aliasing
          </label>
        </div>
      </div>
    );
  };

  const renderBrushPresets = () => {
    if (!['brush', 'pencil', 'eraser'].includes(activeTool) || brushPresets.length === 0) {
      return null;
    }

    return (
      <div style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ 
          fontSize: '12px', 
          fontWeight: '600', 
          marginBottom: '8px',
          color: 'var(--text-primary)'
        }}>
          Brush Presets
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '4px',
          marginBottom: '8px'
        }}>
          {brushPresets.map((preset, index) => (
            <button
              key={index}
              onClick={() => onBrushPresetSelect(preset)}
              style={{
                padding: '8px 4px',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                backgroundColor: 'var(--background)',
                cursor: 'pointer',
                fontSize: '10px',
                textAlign: 'center',
                color: 'var(--text-primary)'
              }}
              title={`${preset.name} (${preset.size}px)`}
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Save custom preset */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <input
            type="text"
            placeholder="Preset name"
            value={customBrushName}
            onChange={(e) => setCustomBrushName(e.target.value)}
            style={{
              flex: 1,
              padding: '4px',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              backgroundColor: 'var(--background)',
              color: 'var(--text-primary)',
              fontSize: '10px'
            }}
          />
          <button
            onClick={() => {
              if (customBrushName.trim()) {
                onBrushPresetSave({
                  name: customBrushName,
                  ...toolSettings
                });
                setCustomBrushName('');
              }
            }}
            style={{
              padding: '4px 8px',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              backgroundColor: 'var(--primary)',
              color: 'white',
              fontSize: '10px',
              cursor: 'pointer'
            }}
            disabled={!customBrushName.trim()}
          >
            Save
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      width: '260px',
      backgroundColor: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px',
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--surface-alt)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ 
          margin: 0, 
          color: 'var(--text-primary)', 
          fontSize: '14px',
          fontWeight: '600'
        }}>
          Tools
        </h3>
        <button
          onClick={onToolReset}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '12px'
          }}
          title="Reset tool settings"
        >
          🔄
        </button>
      </div>

      {/* Tool Categories */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {Object.entries(toolCategories).map(([categoryId, tools]) => (
          <div key={categoryId}>
            <button
              onClick={() => toggleSection(categoryId)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                backgroundColor: expandedSection === categoryId ? 'var(--primary-alpha)' : 'var(--surface-alt)',
                color: 'var(--text-primary)',
                fontSize: '11px',
                fontWeight: '600',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                textTransform: 'capitalize'
              }}
            >
              {categoryId}
              <span style={{ 
                transform: expandedSection === categoryId ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}>
                ▼
              </span>
            </button>
            
            {expandedSection === categoryId && (
              <div style={{
                padding: '8px',
                backgroundColor: 'var(--background-alt)',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '4px'
              }}>
                {tools.map(renderToolButton)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tool-specific settings */}
      <div style={{ borderTop: '1px solid var(--border)' }}>
        {renderBrushSettings()}
        {renderSelectionSettings()}
        {renderBrushPresets()}
      </div>

      <style jsx>{`
        .tool-btn {
          padding: 8px;
          border: 1px solid var(--border);
          background: var(--background);
          color: var(--text-primary);
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 40px;
          transition: all 0.2s ease;
          position: relative;
        }
        
        .tool-btn:hover {
          background: var(--hover-bg);
          border-color: var(--primary-alpha);
        }
        
        .tool-btn.active {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }
        
        .tool-slider {
          width: 100%;
          height: 4px;
          border-radius: 2px;
          background: var(--border);
          outline: none;
          appearance: none;
        }
        
        .tool-slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--primary);
          cursor: pointer;
        }
        
        .tool-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--primary);
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default ToolPanel;