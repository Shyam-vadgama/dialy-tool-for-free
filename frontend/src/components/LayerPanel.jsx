/**
 * Professional Layer Panel Component
 * Advanced layer management for image editing
 */
import React, { useState, useCallback, useRef } from 'react';

const LayerPanel = ({ 
  layers = [], 
  activeLayerId, 
  onLayerSelect,
  onLayerToggle,
  onLayerDelete,
  onLayerDuplicate,
  onLayerMerge,
  onLayerMove,
  onLayerRename,
  onLayerOpacityChange,
  onLayerBlendModeChange,
  onLayerMaskToggle,
  onAddLayer,
  onAddAdjustmentLayer,
  onAddTextLayer,
  onAddShapeLayer 
}) => {
  const [draggedLayer, setDraggedLayer] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [selectedLayers, setSelectedLayers] = useState(new Set([activeLayerId]));
  const [showBlendModes, setShowBlendModes] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const dragCounter = useRef(0);

  // Blend modes available in professional image editors
  const blendModes = [
    'normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard-light',
    'color-dodge', 'color-burn', 'darken', 'lighten', 'difference',
    'exclusion', 'hue', 'saturation', 'color', 'luminosity'
  ];

  // Layer type icons
  const getLayerIcon = (layer) => {
    switch (layer.type) {
      case 'image': return '🖼️';
      case 'text': return '📝';
      case 'shape': return '⚫';
      case 'adjustment': return '🎨';
      case 'mask': return '🎭';
      case 'group': return '📁';
      default: return '📄';
    }
  };

  // Handle layer selection with multi-select support
  const handleLayerSelect = useCallback((layerId, event) => {
    event.stopPropagation();
    
    let newSelection = new Set();
    
    if (event.ctrlKey || event.metaKey) {
      // Multi-select with Ctrl/Cmd
      newSelection = new Set(selectedLayers);
      if (newSelection.has(layerId)) {
        newSelection.delete(layerId);
      } else {
        newSelection.add(layerId);
      }
    } else if (event.shiftKey && selectedLayers.size > 0) {
      // Range select with Shift
      const layerIds = layers.map(l => l.id);
      const currentIndex = layerIds.indexOf(Array.from(selectedLayers)[0]);
      const targetIndex = layerIds.indexOf(layerId);
      const startIndex = Math.min(currentIndex, targetIndex);
      const endIndex = Math.max(currentIndex, targetIndex);
      
      newSelection = new Set(layerIds.slice(startIndex, endIndex + 1));
    } else {
      // Single select
      newSelection = new Set([layerId]);
    }
    
    setSelectedLayers(newSelection);
    onLayerSelect(layerId);
  }, [selectedLayers, layers, onLayerSelect]);

  // Drag and drop handlers
  const handleDragStart = (event, layerId) => {
    setDraggedLayer(layerId);
    event.dataTransfer.effectAllowed = 'move';
    dragCounter.current = 0;
  };

  const handleDragOver = (event, index) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    dragCounter.current++;
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (event, targetIndex) => {
    event.preventDefault();
    
    if (draggedLayer) {
      const sourceIndex = layers.findIndex(l => l.id === draggedLayer);
      if (sourceIndex !== targetIndex && sourceIndex !== -1) {
        onLayerMove(draggedLayer, targetIndex);
      }
    }
    
    setDraggedLayer(null);
    setDragOverIndex(null);
    dragCounter.current = 0;
  };

  // Context menu handlers
  const handleContextMenu = (event, layerId) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      layerId
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  // Layer opacity change with smooth updates
  const handleOpacityChange = useCallback((layerId, opacity) => {
    onLayerOpacityChange(layerId, opacity);
  }, [onLayerOpacityChange]);

  // Blend mode change
  const handleBlendModeChange = useCallback((layerId, blendMode) => {
    onLayerBlendModeChange(layerId, blendMode);
    setShowBlendModes(false);
  }, [onLayerBlendModeChange]);

  return (
    <div style={{
      width: '280px',
      backgroundColor: 'var(--surface)',
      borderLeft: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px',
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--surface-alt)'
      }}>
        <h3 style={{ 
          margin: 0, 
          color: 'var(--text-primary)', 
          fontSize: '14px',
          fontWeight: '600'
        }}>
          Layers
        </h3>
      </div>

      {/* Layer Controls */}
      <div style={{
        padding: '8px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        gap: '4px',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={() => onAddLayer('image')}
          className="layer-control-btn"
          title="Add Image Layer"
        >
          🖼️
        </button>
        <button 
          onClick={() => onAddTextLayer()}
          className="layer-control-btn"
          title="Add Text Layer"
        >
          📝
        </button>
        <button 
          onClick={() => onAddShapeLayer()}
          className="layer-control-btn"
          title="Add Shape Layer"
        >
          ⚫
        </button>
        <button 
          onClick={() => onAddAdjustmentLayer()}
          className="layer-control-btn"
          title="Add Adjustment Layer"
        >
          🎨
        </button>
        <div style={{ width: '1px', backgroundColor: 'var(--border)', margin: '0 4px' }} />
        <button 
          onClick={() => selectedLayers.forEach(id => onLayerDuplicate(id))}
          className="layer-control-btn"
          disabled={selectedLayers.size === 0}
          title="Duplicate Selected"
        >
          📋
        </button>
        <button 
          onClick={() => selectedLayers.forEach(id => onLayerDelete(id))}
          className="layer-control-btn"
          disabled={selectedLayers.size === 0}
          title="Delete Selected"
        >
          🗑️
        </button>
      </div>

      {/* Blend Mode Selector */}
      {showBlendModes && (
        <div style={{
          padding: '8px',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--surface-alt)'
        }}>
          <div style={{ fontSize: '12px', marginBottom: '4px', color: 'var(--text-secondary)' }}>
            Blend Mode:
          </div>
          <select 
            value={layers.find(l => l.id === activeLayerId)?.blendMode || 'normal'}
            onChange={(e) => handleBlendModeChange(activeLayerId, e.target.value)}
            style={{
              width: '100%',
              padding: '4px',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              backgroundColor: 'var(--background)',
              color: 'var(--text-primary)',
              fontSize: '12px'
            }}
          >
            {blendModes.map(mode => (
              <option key={mode} value={mode}>
                {mode.charAt(0).toUpperCase() + mode.slice(1).replace('-', ' ')}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Layer List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {layers.length === 0 ? (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '12px'
          }}>
            No layers yet. Add a layer to start editing.
          </div>
        ) : (
          layers.map((layer, index) => (
            <div
              key={layer.id}
              draggable
              onDragStart={(e) => handleDragStart(e, layer.id)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onContextMenu={(e) => handleContextMenu(e, layer.id)}
              onClick={(e) => handleLayerSelect(layer.id, e)}
              style={{
                padding: '8px',
                borderBottom: '1px solid var(--border-light)',
                backgroundColor: selectedLayers.has(layer.id) ? 'var(--primary-alpha)' : 'transparent',
                cursor: 'pointer',
                position: 'relative',
                borderLeft: selectedLayers.has(layer.id) ? '3px solid var(--primary)' : '3px solid transparent'
              }}
              className="layer-item"
            >
              {/* Drag indicator */}
              {dragOverIndex === index && (
                <div style={{
                  position: 'absolute',
                  top: '-1px',
                  left: 0,
                  right: 0,
                  height: '2px',
                  backgroundColor: 'var(--primary)',
                  zIndex: 10
                }} />
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Layer visibility toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerToggle(layer.id);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    opacity: layer.visible ? 1 : 0.3
                  }}
                >
                  👁️
                </button>

                {/* Layer icon */}
                <span style={{ fontSize: '14px' }}>
                  {getLayerIcon(layer)}
                </span>

                {/* Layer info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                    fontWeight: selectedLayers.has(layer.id) ? '600' : '400',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {layer.name}
                  </div>
                  
                  {/* Layer details */}
                  <div style={{
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    gap: '8px',
                    marginTop: '2px'
                  }}>
                    <span>{Math.round(layer.opacity * 100)}%</span>
                    <span>{layer.blendMode}</span>
                    {layer.mask && <span>🎭</span>}
                    {layer.locked && <span>🔒</span>}
                  </div>
                </div>

                {/* Quick actions */}
                <div style={{ display: 'flex', gap: '2px' }}>
                  {layer.mask && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLayerMaskToggle(layer.id);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '10px',
                        opacity: 0.7
                      }}
                      title="Toggle Layer Mask"
                    >
                      🎭
                    </button>
                  )}
                </div>
              </div>

              {/* Opacity slider */}
              {selectedLayers.has(layer.id) && (
                <div style={{ marginTop: '6px' }}>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round(layer.opacity * 100)}
                    onChange={(e) => handleOpacityChange(layer.id, parseInt(e.target.value) / 100)}
                    style={{
                      width: '100%',
                      height: '4px',
                      borderRadius: '2px',
                      background: 'var(--border)',
                      outline: 'none',
                      appearance: 'none'
                    }}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999
            }}
            onClick={handleCloseContextMenu}
          />
          <div style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            minWidth: '120px'
          }}>
            <button 
              onClick={() => {
                onLayerDuplicate(contextMenu.layerId);
                handleCloseContextMenu();
              }}
              className="context-menu-item"
            >
              📋 Duplicate
            </button>
            <button 
              onClick={() => {
                onLayerDelete(contextMenu.layerId);
                handleCloseContextMenu();
              }}
              className="context-menu-item"
            >
              🗑️ Delete
            </button>
            <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '4px 0' }} />
            <button 
              onClick={() => {
                setShowBlendModes(true);
                handleCloseContextMenu();
              }}
              className="context-menu-item"
            >
              🎨 Blend Mode
            </button>
            <button 
              onClick={() => {
                onLayerMaskToggle(contextMenu.layerId);
                handleCloseContextMenu();
              }}
              className="context-menu-item"
            >
              🎭 Add Mask
            </button>
          </div>
        </>
      )}

      <style jsx>{`
        .layer-control-btn {
          padding: 4px 8px;
          border: 1px solid var(--border);
          background: var(--background);
          color: var(--text-primary);
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s ease;
        }
        
        .layer-control-btn:hover:not(:disabled) {
          background: var(--primary-alpha);
          border-color: var(--primary);
        }
        
        .layer-control-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .layer-item:hover {
          background: var(--hover-bg) !important;
        }
        
        .context-menu-item {
          display: block;
          width: 100%;
          padding: 8px 12px;
          border: none;
          background: none;
          color: var(--text-primary);
          text-align: left;
          cursor: pointer;
          font-size: 12px;
          transition: background-color 0.2s ease;
        }
        
        .context-menu-item:hover {
          background: var(--primary-alpha);
        }

        /* Custom range slider styles */
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--primary);
          cursor: pointer;
        }
        
        input[type="range"]::-moz-range-thumb {
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

export default LayerPanel;