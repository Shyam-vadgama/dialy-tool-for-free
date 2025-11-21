import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as fabric from 'fabric';

const ImageEditor = () => {
  // State management
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [activeTool, setActiveTool] = useState('move');
  const [activeLayer, setActiveLayer] = useState(null);
  const [layers, setLayers] = useState([]);
  const [zoom, setZoom] = useState(100);
  const [toolSettings, setToolSettings] = useState({
    size: 10,
    hardness: 1,
    opacity: 1,
    flow: 1,
    pressureSize: true,
    pressureOpacity: false
  });
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [brushPresets, setBrushPresets] = useState([
    { name: 'Soft', size: 15, hardness: 0.3, opacity: 0.8 },
    { name: 'Hard', size: 10, hardness: 1, opacity: 1 },
    { name: 'Texture', size: 25, hardness: 0.7, opacity: 0.6 }
  ]);

  // Refs
  const canvasContainerRef = useRef(null);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageWorkerRef = useRef(null);
  const fabricCanvasRef = useRef(null); // Ref for Fabric.js canvas

  // Initialize the editor
  useEffect(() => {
    console.log('ImageEditor: Starting initialization...');

    let retryCount = 0;
    const maxRetries = 20; // Maximum 2 seconds of retries

    const initEditor = async () => {
      console.log(`ImageEditor: Init attempt ${retryCount + 1}/${maxRetries}`);

      if (!canvasContainerRef.current) {
        retryCount++;
        if (retryCount < maxRetries) {
          console.log('ImageEditor: Canvas container not ready, retrying...');
          setTimeout(initEditor, 100);
          return;
        } else {
          console.error('ImageEditor: Failed to find canvas container after maximum retries');
          // Force initialization to show UI anyway
          setIsInitialized(true);
          return;
        }
      }

      if (editorRef.current) {
        console.log('ImageEditor: Already initialized');
        return;
      }

      try {
        console.log('ImageEditor: Canvas container found! Creating canvas...');

        // Create canvas container
        const canvasEl = document.createElement('canvas');
        canvasEl.width = 800;
        canvasEl.height = 600;
        canvasEl.style.border = '1px solid #ccc';
        canvasEl.style.backgroundColor = 'white';

        // Add canvas to DOM
        canvasContainerRef.current.appendChild(canvasEl);

        // Initialize Fabric.js canvas
        const fabricCanvas = new fabric.Canvas(canvasEl, {
          width: 800,
          height: 600,
          selection: true,
          backgroundColor: '#f0f0f0',
          preserveObjectStacking: true
        });

        // Store references
        fabricCanvasRef.current = fabricCanvas;
        editorRef.current = {
          canvas: fabricCanvas,
          initialized: true,
          layers: {
            getAllLayers: () => layers,
            setActiveLayer: (layer) => setActiveLayer(layer)
          },
          tools: {
            setActiveTool: (toolName) => setActiveTool(toolName),
            updateToolSettings: (settings) => setToolSettings(settings)
          },
          history: {
            canUndo: () => canUndo,
            canRedo: () => canRedo
          },
          destroy: () => {
            if (fabricCanvas) {
              fabricCanvas.dispose();
            }
          }
        };

        // Create initial layers (using Fabric.js objects)
        const backgroundLayer = new fabric.Rect({
          left: 0,
          top: 0,
          width: 800,
          height: 600,
          fill: '#f0f0f0',
          name: 'Background',
          selectable: false,
          evented: false
        });

        fabricCanvas.add(backgroundLayer);

        // Add text placeholder
        const titleText = new fabric.Text('Professional Image Editor', {
          left: 400,
          top: 300,
          fontSize: 24,
          fontFamily: 'Arial',
          originX: 'center',
          originY: 'center',
          fill: '#333'
        });

        const subtitleText = new fabric.Text('Ready for editing!', {
          left: 400,
          top: 340,
          fontSize: 14,
          fontFamily: 'Arial',
          originX: 'center',
          originY: 'center',
          fill: '#333'
        });

        fabricCanvas.add(titleText);
        fabricCanvas.add(subtitleText);

        // Set up event listeners for Fabric canvas
        fabricCanvas.on('selection:created', (e) => {
          if (e.selected && e.selected[0]) {
            setSelectedElement(e.selected[0]);
          }
        });

        fabricCanvas.on('selection:updated', (e) => {
          if (e.selected && e.selected[0]) {
            setSelectedElement(e.selected[0]);
          }
        });

        fabricCanvas.on('selection:cleared', () => {
          setSelectedElement(null);
        });

        // Initialize layers array
        setLayers([
          { id: '1', name: 'Background', visible: true, opacity: 1, blendMode: 'normal', objects: [backgroundLayer] },
          { id: '2', name: 'Text Layer', visible: true, opacity: 1, blendMode: 'normal', objects: [titleText, subtitleText] },
          { id: '3', name: 'Drawing Layer', visible: true, opacity: 1, blendMode: 'normal', objects: [] }
        ]);

        console.log('ImageEditor: Initialization complete');
        setIsInitialized(true);

      } catch (error) {
        console.error('ImageEditor initialization failed:', error);
        setIsInitialized(true); // Still show UI
      }
    };

    // Use requestAnimationFrame to ensure DOM is rendered, then start initialization
    requestAnimationFrame(() => {
      setTimeout(initEditor, 200); // Longer initial delay to ensure DOM is ready
    });

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
      }

      // Cleanup Fabric.js canvas
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, []);

  // Event handlers
  const handleNewDocument = () => {
    // Create new document with Fabric.js canvas
    const newDocument = { name: 'New Document', width: 800, height: 600 };
    setCurrentDocument(newDocument);

    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setWidth(800);
      fabricCanvasRef.current.setHeight(600);
      fabricCanvasRef.current.setBackgroundColor('#ffffff');
      fabricCanvasRef.current.clear();
    }

    // Reset layers
    setLayers([
      { id: '1', name: 'Background', visible: true, opacity: 1, blendMode: 'normal', objects: [] },
      { id: '2', name: 'Layer 1', visible: true, opacity: 1, blendMode: 'normal', objects: [] }
    ]);
    setActiveLayer({ id: '1', name: 'Background', visible: true, opacity: 1, blendMode: 'normal', objects: [] });
  };

  const handleOpenFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Create fabric image and add to canvas
          const fabricImg = new fabric.Image(img, {
            left: fabricCanvasRef.current.width / 2,
            top: fabricCanvasRef.current.height / 2,
            originX: 'center',
            originY: 'center'
          });

          fabricCanvasRef.current.add(fabricImg);
          fabricCanvasRef.current.renderAll();

          // Update document state
          setCurrentDocument({ name: file.name, width: fabricCanvasRef.current.width, height: fabricCanvasRef.current.height });

          // Update layers to include the image
          const newLayer = {
            id: `layer-${Date.now()}`,
            name: file.name,
            visible: true,
            opacity: 1,
            blendMode: 'normal',
            objects: [fabricImg]
          };

          setLayers([...layers, newLayer]);
          setActiveLayer(newLayer);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (fabricCanvasRef.current) {
      // Export canvas as data URL
      const dataURL = fabricCanvasRef.current.toDataURL({
        format: 'png',
        quality: 1
      });

      // Create download link
      const link = document.createElement('a');
      link.download = currentDocument?.name?.replace(/\.[^/.]+$/, "") + '_edited.png' || 'edited_image.png';
      link.href = dataURL;
      link.click();
    }
  };

  const handleToolChange = (toolName) => {
    setActiveTool(toolName);

    if (fabricCanvasRef.current) {
      // Clean up previous event listeners
      fabricCanvasRef.current.off('mouse:down');

      // Disable drawing mode for all tools initially
      fabricCanvasRef.current.isDrawingMode = false;

      // Handle different tools
      switch(toolName) {
        case 'brush':
          fabricCanvasRef.current.isDrawingMode = true;
          fabricCanvasRef.current.freeDrawingBrush = new fabric.PencilBrush(fabricCanvasRef.current);
          fabricCanvasRef.current.freeDrawingBrush.width = toolSettings.size;
          fabricCanvasRef.current.freeDrawingBrush.color = toolSettings.opacity > 0 ? `rgba(0,0,0,${toolSettings.opacity})` : '#000000';
          break;
        case 'eraser':
          fabricCanvasRef.current.isDrawingMode = true;
          // Use a different approach for eraser since EraserBrush might not be available
          const eraserBrush = new fabric.PencilBrush(fabricCanvasRef.current);
          eraserBrush.color = `rgba(0,0,0,${1 - toolSettings.opacity})`; // Invert opacity for eraser
          fabricCanvasRef.current.freeDrawingBrush = eraserBrush;
          fabricCanvasRef.current.freeDrawingBrush.width = toolSettings.size;
          break;
        case 'selection':
          fabricCanvasRef.current.selection = true;
          fabricCanvasRef.current.isDrawingMode = false;
          break;
        case 'move':
          fabricCanvasRef.current.selection = true;
          fabricCanvasRef.current.isDrawingMode = false;
          break;
        case 'text':
          fabricCanvasRef.current.isDrawingMode = false;
          // Add click event to add text
          fabricCanvasRef.current.on('mouse:down', (opt) => {
            const { e } = opt;
            const pointer = fabricCanvasRef.current.getPointer(e);
            const text = new fabric.Text('Double click to edit', {
              left: pointer.x,
              top: pointer.y,
              fontSize: 20,
              fill: '#000000'
            });
            fabricCanvasRef.current.add(text);
            fabricCanvasRef.current.setActiveObject(text);
            fabricCanvasRef.current.renderAll();
          });
          break;
        case 'crop':
          fabricCanvasRef.current.isDrawingMode = false;
          break;
        case 'clone':
          fabricCanvasRef.current.isDrawingMode = false;
          break;
        default:
          fabricCanvasRef.current.selection = true;
          break;
      }
    }
  };

  const handleLayerSelect = (layer) => {
    setActiveLayer(layer);

    // In Fabric.js, we'll focus on the objects in the layer
    if (fabricCanvasRef.current && layer.objects && layer.objects.length > 0) {
      fabricCanvasRef.current.setActiveObject(layer.objects[0]);
    }
  };

  const handleLayerVisibility = (layerId) => {
    setLayers(layers.map(layer => {
      if (layer.id === layerId) {
        // Update visibility for objects in this layer
        if (layer.objects) {
          layer.objects.forEach(obj => {
            obj.set('visible', !layer.visible);
          });
          fabricCanvasRef.current.renderAll();
        }
        return { ...layer, visible: !layer.visible };
      }
      return layer;
    }));
  };

  const handleDeleteLayer = (layerId) => {
    setLayers(layers.filter(layer => {
      if (layer.id === layerId) {
        // Remove objects from canvas
        if (layer.objects) {
          layer.objects.forEach(obj => {
            fabricCanvasRef.current.remove(obj);
          });
          fabricCanvasRef.current.renderAll();
        }
        return false;
      }
      return true;
    }));
  };

  const handleAddLayer = () => {
    const newLayer = {
      id: `layer-${Date.now()}`,
      name: `Layer ${layers.length + 1}`,
      visible: true,
      opacity: 1,
      blendMode: 'normal',
      objects: []
    };
    setLayers([...layers, newLayer]);
  };

  // Zoom functionality with performance optimization
  const handleZoomIn = useCallback(() => {
    if (fabricCanvasRef.current) {
      const currentZoom = fabricCanvasRef.current.getZoom();
      const newZoom = Math.min(currentZoom * 1.2, 10);
      fabricCanvasRef.current.setZoom(newZoom);
      setZoom(Math.round(newZoom * 100));
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (fabricCanvasRef.current) {
      const currentZoom = fabricCanvasRef.current.getZoom();
      const newZoom = Math.max(currentZoom * 0.8, 0.1);
      fabricCanvasRef.current.setZoom(newZoom);
      setZoom(Math.round(newZoom * 100));
    }
  }, []);

  const handleZoomFit = useCallback(() => {
    if (fabricCanvasRef.current && canvasContainerRef.current) {
      const canvas = fabricCanvasRef.current;
      const container = canvasContainerRef.current;

      const zoomWidth = container.offsetWidth / canvas.getWidth();
      const zoomHeight = container.offsetHeight / canvas.getHeight();
      const zoom = Math.min(zoomWidth, zoomHeight, 1); // Don't zoom in beyond 100%

      canvas.setZoom(zoom);
      setZoom(Math.round(zoom * 100));

      // Center the view
      canvas.setViewportTransform([zoom, 0, 0, zoom, 0, 0]);
    }
  }, []);

  if (!isInitialized) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '80vh',
        gap: '20px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ fontSize: '18px', color: 'var(--text-primary)' }}>
          Initializing Professional Image Editor...
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--background)' }}>
      {/* Top Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleNewDocument} className="btn btn-primary glass-button">
            📄 New
          </button>
          <button onClick={handleOpenFile} className="btn btn-primary glass-button">
            📁 Open
          </button>
          <button onClick={handleSave} className="btn btn-primary glass-button" disabled={!currentDocument}>
            💾 Save
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn glass-button" disabled={!canUndo}>
            ↶ Undo
          </button>
          <button className="btn glass-button" disabled={!canRedo}>
            ↷ Redo
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={handleZoomOut} className="btn glass-button">🔍-</button>
          <span style={{ minWidth: '60px', textAlign: 'center', color: 'var(--text-primary)' }}>{zoom}%</span>
          <button onClick={handleZoomIn} className="btn glass-button">🔍+</button>
          <button onClick={handleZoomFit} className="btn glass-button">📐 Fit</button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar - Tools */}
        <div style={{ width: '200px', backgroundColor: 'var(--surface)', borderRight: '1px solid var(--border)', padding: '10px' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '15px' }}>Tools</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '5px' }}>
            {[
              { name: 'move', icon: '✋', label: 'Move' },
              { name: 'selection', icon: '⬚', label: 'Select' },
              { name: 'brush', icon: '🖌️', label: 'Brush' },
              { name: 'eraser', icon: '🧽', label: 'Eraser' },
              { name: 'clone', icon: '📋', label: 'Clone' },
              { name: 'text', icon: 'T', label: 'Text' },
              { name: 'crop', icon: '✂️', label: 'Crop' }
            ].map(tool => (
              <button
                key={tool.name}
                onClick={() => handleToolChange(tool.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  backgroundColor: activeTool === tool.name ? 'var(--primary)' : 'transparent',
                  color: activeTool === tool.name ? 'white' : 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                <span>{tool.icon}</span>
                <span>{tool.label}</span>
              </button>
            ))}
          </div>

          {/* Tool Settings Panel */}
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>Tool Settings</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Size: {toolSettings.size}</label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={toolSettings.size}
                  onChange={(e) => {
                    const newSize = parseInt(e.target.value);
                    const newSettings = { ...toolSettings, size: newSize };
                    setToolSettings(newSettings);

                    if (fabricCanvasRef.current && fabricCanvasRef.current.freeDrawingBrush) {
                      fabricCanvasRef.current.freeDrawingBrush.width = newSize;
                    }
                  }}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Opacity: {Math.round(toolSettings.opacity * 100)}%</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={toolSettings.opacity}
                  onChange={(e) => {
                    const newOpacity = parseFloat(e.target.value);
                    const newSettings = { ...toolSettings, opacity: newOpacity };
                    setToolSettings(newSettings);

                    if (fabricCanvasRef.current && fabricCanvasRef.current.freeDrawingBrush) {
                      // Update brush color with new opacity
                      const brushColor = activeTool === 'eraser'
                        ? `rgba(0,0,0,${1 - newOpacity})` // Invert for eraser (more opacity = more erasing)
                        : `rgba(0,0,0,${newOpacity})`;
                      fabricCanvasRef.current.freeDrawingBrush.color = brushColor;
                    }
                  }}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Hardness: {Math.round(toolSettings.hardness * 100)}%</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={toolSettings.hardness}
                  onChange={(e) => {
                    const newSettings = { ...toolSettings, hardness: parseFloat(e.target.value) };
                    setToolSettings(newSettings);
                  }}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--background-alt)' }}>
          <div ref={canvasContainerRef} style={{ width: '100%', height: '100%' }} />
        </div>

        {/* Right Sidebar - Layers & Properties */}
        <div style={{ width: '250px', backgroundColor: 'var(--surface)', borderLeft: '1px solid var(--border)', padding: '10px' }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ color: 'var(--text-primary)' }}>Layers</h3>
              <button onClick={handleAddLayer} className="btn-small glass-button">
                ➕
              </button>
            </div>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {layers.slice().reverse().map(layer => (
                <div
                  key={layer.id}
                  onClick={() => handleLayerSelect(layer)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px',
                    cursor: 'pointer',
                    backgroundColor: activeLayer?.id === layer.id ? 'var(--primary-opacity)' : 'transparent',
                    borderRadius: '4px',
                    marginBottom: '4px',
                    border: activeLayer?.id === layer.id ? '1px solid var(--primary)' : '1px solid transparent'
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLayerVisibility(layer.id);
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                  >
                    {layer.visible ? '👁️' : '🚫'}
                  </button>
                  <span style={{ flex: 1, color: 'var(--text-primary)' }}>{layer.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteLayer(layer.id);
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Properties Panel */}
          <div>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '15px' }}>Properties</h3>
            {currentDocument && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ color: 'var(--text-secondary)' }}>Document:</label>
                  <span style={{ color: 'var(--text-primary)' }}>{currentDocument.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ color: 'var(--text-secondary)' }}>Size:</label>
                  <span style={{ color: 'var(--text-primary)' }}>{currentDocument.width} × {currentDocument.height}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ color: 'var(--text-secondary)' }}>Layers:</label>
                  <span style={{ color: 'var(--text-primary)' }}>{layers.length}</span>
                </div>
              </div>
            )}

            {/* Selected Object Properties */}
            {selectedElement && (
              <div style={{ marginTop: '15px' }}>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>Selected Object</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Type:</span>
                    <span style={{ color: 'var(--text-primary)' }}>{selectedElement.type}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Position:</span>
                    <span style={{ color: 'var(--text-primary)' }}>X: {Math.round(selectedElement.left || 0)}, Y: {Math.round(selectedElement.top || 0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Size:</span>
                    <span style={{ color: 'var(--text-primary)' }}>W: {Math.round(selectedElement.width || 0)}, H: {Math.round(selectedElement.height || 0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Angle:</span>
                    <span style={{ color: 'var(--text-primary)' }}>{Math.round(selectedElement.angle || 0)}°</span>
                  </div>

                  {/* Object opacity control */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Opacity:</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={selectedElement.opacity || 1}
                      onChange={(e) => {
                        selectedElement.set('opacity', parseFloat(e.target.value));
                        fabricCanvasRef.current.renderAll();
                      }}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ImageEditor;