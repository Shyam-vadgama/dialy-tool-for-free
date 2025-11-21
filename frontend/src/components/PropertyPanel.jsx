/**
 * Professional Properties Panel Component
 * Contextual properties and adjustments for selected elements
 */
import React, { useState, useCallback } from 'react';

const PropertyPanel = ({ 
  selectedElement,
  onElementUpdate,
  documentInfo,
  onDocumentUpdate,
  showHistogram = true
}) => {
  const [activeTab, setActiveTab] = useState('properties');
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  // Render properties based on element type
  const renderElementProperties = () => {
    if (!selectedElement) {
      return (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '12px'
        }}>
          Select an element to view properties
        </div>
      );
    }

    const { type, properties = {} } = selectedElement;

    switch (type) {
      case 'text':
        return renderTextProperties(properties);
      case 'shape':
        return renderShapeProperties(properties);
      case 'image':
        return renderImageProperties(properties);
      case 'layer':
        return renderLayerProperties(properties);
      default:
        return renderGeneralProperties(properties);
    }
  };

  const renderTextProperties = (props) => (
    <div style={{ padding: '12px' }}>
      <h4 style={{ 
        margin: '0 0 12px 0', 
        fontSize: '13px', 
        color: 'var(--text-primary)',
        fontWeight: '600'
      }}>
        Text Properties
      </h4>
      
      {/* Font Family */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
          Font Family
        </label>
        <select
          value={props.fontFamily || 'Arial'}
          onChange={(e) => onElementUpdate({ fontFamily: e.target.value })}
          className="property-input"
        >
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
          <option value="Impact">Impact</option>
        </select>
      </div>

      {/* Font Size */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
          Font Size: {props.fontSize || 16}px
        </label>
        <input
          type="range"
          min="8"
          max="200"
          value={props.fontSize || 16}
          onChange={(e) => onElementUpdate({ fontSize: parseInt(e.target.value) })}
          className="property-slider"
        />
      </div>

      {/* Font Weight */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
          Font Weight
        </label>
        <select
          value={props.fontWeight || 'normal'}
          onChange={(e) => onElementUpdate({ fontWeight: e.target.value })}
          className="property-input"
        >
          <option value="normal">Normal</option>
          <option value="bold">Bold</option>
          <option value="lighter">Lighter</option>
          <option value="bolder">Bolder</option>
        </select>
      </div>

      {/* Text Color */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
          Color
        </label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div 
            style={{
              width: '24px',
              height: '24px',
              backgroundColor: props.color || '#000000',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => setColorPickerOpen(!colorPickerOpen)}
          />
          <input
            type="text"
            value={props.color || '#000000'}
            onChange={(e) => onElementUpdate({ color: e.target.value })}
            className="property-input"
            style={{ flex: 1 }}
            placeholder="#000000"
          />
        </div>
      </div>

      {/* Text Alignment */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
          Alignment
        </label>
        <div style={{ display: 'flex', gap: '4px' }}>
          {['left', 'center', 'right', 'justify'].map(align => (
            <button
              key={align}
              onClick={() => onElementUpdate({ textAlign: align })}
              className={`align-btn ${props.textAlign === align ? 'active' : ''}`}
              title={`Align ${align}`}
            >
              {align === 'left' && '⬅️'}
              {align === 'center' && '⏺️'}
              {align === 'right' && '➡️'}
              {align === 'justify' && '📄'}
            </button>
          ))}
        </div>
      </div>

      {/* Line Height */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
          Line Height: {(props.lineHeight || 1.2).toFixed(1)}
        </label>
        <input
          type="range"
          min="0.5"
          max="3"
          step="0.1"
          value={props.lineHeight || 1.2}
          onChange={(e) => onElementUpdate({ lineHeight: parseFloat(e.target.value) })}
          className="property-slider"
        />
      </div>
    </div>
  );

  const renderShapeProperties = (props) => (
    <div style={{ padding: '12px' }}>
      <h4 style={{ 
        margin: '0 0 12px 0', 
        fontSize: '13px', 
        color: 'var(--text-primary)',
        fontWeight: '600'
      }}>
        Shape Properties
      </h4>

      {/* Fill Color */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
          Fill Color
        </label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div 
            style={{
              width: '24px',
              height: '24px',
              backgroundColor: props.fillColor || '#000000',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => setColorPickerOpen(!colorPickerOpen)}
          />
          <input
            type="text"
            value={props.fillColor || '#000000'}
            onChange={(e) => onElementUpdate({ fillColor: e.target.value })}
            className="property-input"
            style={{ flex: 1 }}
          />
        </div>
      </div>

      {/* Stroke Color */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
          Stroke Color
        </label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div 
            style={{
              width: '24px',
              height: '24px',
              backgroundColor: props.strokeColor || '#000000',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => setColorPickerOpen(!colorPickerOpen)}
          />
          <input
            type="text"
            value={props.strokeColor || '#000000'}
            onChange={(e) => onElementUpdate({ strokeColor: e.target.value })}
            className="property-input"
            style={{ flex: 1 }}
          />
        </div>
      </div>

      {/* Stroke Width */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
          Stroke Width: {props.strokeWidth || 1}px
        </label>
        <input
          type="range"
          min="0"
          max="50"
          value={props.strokeWidth || 1}
          onChange={(e) => onElementUpdate({ strokeWidth: parseInt(e.target.value) })}
          className="property-slider"
        />
      </div>

      {/* Corner Radius (for rectangles) */}
      {props.shape === 'rectangle' && (
        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
            Corner Radius: {props.borderRadius || 0}px
          </label>
          <input
            type="range"
            min="0"
            max="50"
            value={props.borderRadius || 0}
            onChange={(e) => onElementUpdate({ borderRadius: parseInt(e.target.value) })}
            className="property-slider"
          />
        </div>
      )}
    </div>
  );

  const renderImageProperties = (props) => (
    <div style={{ padding: '12px' }}>
      <h4 style={{ 
        margin: '0 0 12px 0', 
        fontSize: '13px', 
        color: 'var(--text-primary)',
        fontWeight: '600'
      }}>
        Image Properties
      </h4>

      {/* Image Info */}
      <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: 'var(--background-alt)', borderRadius: '4px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          <div>Size: {props.originalWidth}×{props.originalHeight}</div>
          <div>Format: {props.format || 'Unknown'}</div>
          <div>File Size: {props.fileSize ? `${(props.fileSize / 1024).toFixed(1)} KB` : 'Unknown'}</div>
        </div>
      </div>

      {/* Opacity */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
          Opacity: {Math.round((props.opacity || 1) * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={props.opacity || 1}
          onChange={(e) => onElementUpdate({ opacity: parseFloat(e.target.value) })}
          className="property-slider"
        />
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
          Brightness: {Math.round((props.brightness || 1) * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.01"
          value={props.brightness || 1}
          onChange={(e) => onElementUpdate({ brightness: parseFloat(e.target.value) })}
          className="property-slider"
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
          Contrast: {Math.round((props.contrast || 1) * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.01"
          value={props.contrast || 1}
          onChange={(e) => onElementUpdate({ contrast: parseFloat(e.target.value) })}
          className="property-slider"
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
          Saturation: {Math.round((props.saturation || 1) * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.01"
          value={props.saturation || 1}
          onChange={(e) => onElementUpdate({ saturation: parseFloat(e.target.value) })}
          className="property-slider"
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
          Hue: {Math.round((props.hue || 0))}°
        </label>
        <input
          type="range"
          min="-180"
          max="180"
          value={props.hue || 0}
          onChange={(e) => onElementUpdate({ hue: parseInt(e.target.value) })}
          className="property-slider"
        />
      </div>
    </div>
  );

  const renderGeneralProperties = (props) => (
    <div style={{ padding: '12px' }}>
      <h4 style={{ 
        margin: '0 0 12px 0', 
        fontSize: '13px', 
        color: 'var(--text-primary)',
        fontWeight: '600'
      }}>
        Transform
      </h4>

      {/* Position */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
          Position
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ flex: 1 }}>
            <input
              type="number"
              value={Math.round(props.x || 0)}
              onChange={(e) => onElementUpdate({ x: parseFloat(e.target.value) })}
              className="property-input"
              style={{ textAlign: 'center' }}
              placeholder="X"
            />
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', textAlign: 'center' }}>X</div>
          </div>
          <div style={{ flex: 1 }}>
            <input
              type="number"
              value={Math.round(props.y || 0)}
              onChange={(e) => onElementUpdate({ y: parseFloat(e.target.value) })}
              className="property-input"
              style={{ textAlign: 'center' }}
              placeholder="Y"
            />
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', textAlign: 'center' }}>Y</div>
          </div>
        </div>
      </div>

      {/* Size */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
          Size
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ flex: 1 }}>
            <input
              type="number"
              value={Math.round(props.width || 100)}
              onChange={(e) => onElementUpdate({ width: parseFloat(e.target.value) })}
              className="property-input"
              style={{ textAlign: 'center' }}
              placeholder="Width"
            />
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', textAlign: 'center' }}>W</div>
          </div>
          <button
            onClick={() => onElementUpdate({ lockAspectRatio: !props.lockAspectRatio })}
            style={{
              border: 'none',
              background: 'none',
              color: props.lockAspectRatio ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            title="Lock aspect ratio"
          >
            🔗
          </button>
          <div style={{ flex: 1 }}>
            <input
              type="number"
              value={Math.round(props.height || 100)}
              onChange={(e) => onElementUpdate({ height: parseFloat(e.target.value) })}
              className="property-input"
              style={{ textAlign: 'center' }}
              placeholder="Height"
            />
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', textAlign: 'center' }}>H</div>
          </div>
        </div>
      </div>

      {/* Rotation */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
          Rotation: {Math.round(props.rotation || 0)}°
        </label>
        <input
          type="range"
          min="-180"
          max="180"
          value={props.rotation || 0}
          onChange={(e) => onElementUpdate({ rotation: parseInt(e.target.value) })}
          className="property-slider"
        />
      </div>
    </div>
  );

  const renderDocumentInfo = () => (
    <div style={{ padding: '12px' }}>
      <h4 style={{ 
        margin: '0 0 12px 0', 
        fontSize: '13px', 
        color: 'var(--text-primary)',
        fontWeight: '600'
      }}>
        Document
      </h4>

      {/* Canvas Size */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
          Canvas Size
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="number"
            value={documentInfo?.width || 800}
            onChange={(e) => onDocumentUpdate({ width: parseInt(e.target.value) })}
            className="property-input"
            style={{ flex: 1, textAlign: 'center' }}
            placeholder="Width"
          />
          <span style={{ color: 'var(--text-muted)' }}>×</span>
          <input
            type="number"
            value={documentInfo?.height || 600}
            onChange={(e) => onDocumentUpdate({ height: parseInt(e.target.value) })}
            className="property-input"
            style={{ flex: 1, textAlign: 'center' }}
            placeholder="Height"
          />
        </div>
      </div>

      {/* Resolution */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
          Resolution: {documentInfo?.dpi || 72} DPI
        </label>
        <input
          type="range"
          min="72"
          max="300"
          step="1"
          value={documentInfo?.dpi || 72}
          onChange={(e) => onDocumentUpdate({ dpi: parseInt(e.target.value) })}
          className="property-slider"
        />
      </div>

      {/* Background Color */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
          Background
        </label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div 
            style={{
              width: '24px',
              height: '24px',
              backgroundColor: documentInfo?.backgroundColor || '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => setColorPickerOpen(!colorPickerOpen)}
          />
          <input
            type="text"
            value={documentInfo?.backgroundColor || '#ffffff'}
            onChange={(e) => onDocumentUpdate({ backgroundColor: e.target.value })}
            className="property-input"
            style={{ flex: 1 }}
          />
        </div>
      </div>
    </div>
  );

  const renderHistogram = () => {
    if (!showHistogram) return null;

    // Mock histogram data
    const histogramData = Array.from({ length: 256 }, (_, i) => Math.random() * 100);

    return (
      <div style={{ padding: '12px' }}>
        <h4 style={{ 
          margin: '0 0 12px 0', 
          fontSize: '13px', 
          color: 'var(--text-primary)',
          fontWeight: '600'
        }}>
          Histogram
        </h4>
        
        <div style={{
          width: '100%',
          height: '100px',
          backgroundColor: 'var(--background)',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'end',
          padding: '4px'
        }}>
          {histogramData.map((value, index) => (
            <div
              key={index}
              style={{
                flex: 1,
                height: `${value}%`,
                backgroundColor: `hsl(${(index / 256) * 360}, 70%, 50%)`,
                margin: '0 0.1px'
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      width: '280px',
      backgroundColor: 'var(--surface)',
      borderLeft: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      {/* Tab Header */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border)'
      }}>
        <button
          onClick={() => setActiveTab('properties')}
          style={{
            flex: 1,
            padding: '10px',
            border: 'none',
            backgroundColor: activeTab === 'properties' ? 'var(--primary)' : 'var(--surface)',
            color: activeTab === 'properties' ? 'white' : 'var(--text-primary)',
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Properties
        </button>
        <button
          onClick={() => setActiveTab('document')}
          style={{
            flex: 1,
            padding: '10px',
            border: 'none',
            backgroundColor: activeTab === 'document' ? 'var(--primary)' : 'var(--surface)',
            color: activeTab === 'document' ? 'white' : 'var(--text-primary)',
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Document
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'properties' && renderElementProperties()}
        {activeTab === 'document' && renderDocumentInfo()}
        {activeTab === 'properties' && renderHistogram()}
      </div>

      <style jsx>{`
        .property-input {
          width: 100%;
          padding: 6px 8px;
          border: 1px solid var(--border);
          border-radius: 4px;
          background: var(--background);
          color: var(--text-primary);
          font-size: 11px;
        }
        
        .property-input:focus {
          outline: none;
          border-color: var(--primary);
        }
        
        .property-slider {
          width: 100%;
          height: 4px;
          border-radius: 2px;
          background: var(--border);
          outline: none;
          appearance: none;
        }
        
        .property-slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--primary);
          cursor: pointer;
        }
        
        .property-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--primary);
          cursor: pointer;
          border: none;
        }
        
        .align-btn {
          padding: 4px 6px;
          border: 1px solid var(--border);
          background: var(--background);
          color: var(--text-primary);
          border-radius: 4px;
          cursor: pointer;
          font-size: 10px;
          transition: all 0.2s ease;
        }
        
        .align-btn:hover {
          background: var(--hover-bg);
        }
        
        .align-btn.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }
      `}</style>
    </div>
  );
};

export default PropertyPanel;