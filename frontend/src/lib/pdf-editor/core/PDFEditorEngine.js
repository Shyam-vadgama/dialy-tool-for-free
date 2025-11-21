/**
 * Professional PDF Editor Engine
 * Advanced PDF editing with text modification, form creation, and OCR
 */
import { EventEmitter } from 'eventemitter3';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts, PageSizes } from 'pdf-lib';
import Tesseract from 'tesseract.js';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export class PDFEditorEngine extends EventEmitter {
  constructor(container, options = {}) {
    super();
    
    this.container = container;
    this.options = {
      width: 1200,
      height: 800,
      backgroundColor: '#f0f0f0',
      ...options
    };

    this.currentDocument = null;
    this.pdfDocument = null; // PDF.js document for rendering
    this.editableDocument = null; // pdf-lib document for editing
    this.pages = [];
    this.currentPageIndex = 0;
    this.zoom = 1.0;
    this.rotation = 0;
    
    // Editing state
    this.editMode = false;
    this.selectedElement = null;
    this.annotations = [];
    this.textElements = [];
    this.formFields = [];
    
    // OCR state
    this.ocrResults = new Map();
    this.ocrWorker = null;

    this.init();
  }

  async init() {
    try {
      // Setup container
      this.container.style.position = 'relative';
      this.container.style.overflow = 'auto';
      this.container.style.backgroundColor = this.options.backgroundColor;

      // Create main canvas for PDF rendering
      this.canvas = document.createElement('canvas');
      this.canvas.style.border = '1px solid #ccc';
      this.canvas.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
      this.container.appendChild(this.canvas);

      this.context = this.canvas.getContext('2d');

      // Create overlay canvas for editing
      this.overlayCanvas = document.createElement('canvas');
      this.overlayCanvas.style.position = 'absolute';
      this.overlayCanvas.style.top = this.canvas.offsetTop + 'px';
      this.overlayCanvas.style.left = this.canvas.offsetLeft + 'px';
      this.overlayCanvas.style.pointerEvents = 'auto';
      this.container.appendChild(this.overlayCanvas);

      this.overlayContext = this.overlayCanvas.getContext('2d');

      // Setup event handlers
      this.setupEventHandlers();

      // Initialize OCR worker
      await this.initOCR();

      this.emit('initialized');
    } catch (error) {
      console.error('Failed to initialize PDF Editor:', error);
      this.emit('error', error);
    }
  }

  async initOCR() {
    try {
      this.ocrWorker = await Tesseract.createWorker();
      await this.ocrWorker.loadLanguage('eng');
      await this.ocrWorker.initialize('eng');
    } catch (error) {
      console.warn('OCR initialization failed:', error);
    }
  }

  setupEventHandlers() {
    // Handle window resize
    window.addEventListener('resize', () => this.handleResize());
    
    // Handle overlay interactions
    this.overlayCanvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.overlayCanvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.overlayCanvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    this.overlayCanvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));
  }

  // Document Management
  async loadPDF(file) {
    try {
      this.emit('documentLoading', file.name);

      const arrayBuffer = await file.arrayBuffer();
      
      // Load with PDF.js for rendering
      this.pdfDocument = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      // Load with pdf-lib for editing
      this.editableDocument = await PDFDocument.load(arrayBuffer);

      this.currentDocument = {
        name: file.name,
        pageCount: this.pdfDocument.numPages,
        created: new Date()
      };

      // Initialize pages
      await this.initializePages();
      
      // Render first page
      await this.renderPage(0);

      this.emit('documentLoaded', this.currentDocument);
      return this.currentDocument;
    } catch (error) {
      console.error('Failed to load PDF:', error);
      this.emit('error', error);
      throw error;
    }
  }

  async createNewPDF(options = {}) {
    try {
      this.editableDocument = await PDFDocument.create();
      const page = this.editableDocument.addPage(PageSizes.A4);

      // Create a simple PDF.js compatible document for rendering
      const pdfBytes = await this.editableDocument.save();
      this.pdfDocument = await pdfjsLib.getDocument({ data: pdfBytes }).promise;

      this.currentDocument = {
        name: options.name || 'New Document.pdf',
        pageCount: 1,
        created: new Date()
      };

      await this.initializePages();
      await this.renderPage(0);

      this.emit('documentCreated', this.currentDocument);
      return this.currentDocument;
    } catch (error) {
      console.error('Failed to create PDF:', error);
      this.emit('error', error);
      throw error;
    }
  }

  async initializePages() {
    this.pages = [];
    
    for (let i = 0; i < this.pdfDocument.numPages; i++) {
      const page = await this.pdfDocument.getPage(i + 1);
      const viewport = page.getViewport({ scale: 1.0 });
      
      this.pages.push({
        index: i,
        page,
        viewport,
        annotations: [],
        textElements: [],
        formFields: [],
        ocrText: null
      });
    }
  }

  // Rendering
  async renderPage(pageIndex) {
    if (!this.pdfDocument || pageIndex < 0 || pageIndex >= this.pages.length) return;

    try {
      this.currentPageIndex = pageIndex;
      const pageInfo = this.pages[pageIndex];
      const viewport = pageInfo.page.getViewport({ 
        scale: this.zoom,
        rotation: this.rotation 
      });

      // Resize canvases
      this.canvas.width = viewport.width;
      this.canvas.height = viewport.height;
      this.overlayCanvas.width = viewport.width;
      this.overlayCanvas.height = viewport.height;

      // Update canvas position and size
      this.updateCanvasSize();

      // Clear and render PDF page
      this.context.clearRect(0, 0, viewport.width, viewport.height);
      
      const renderContext = {
        canvasContext: this.context,
        viewport: viewport
      };

      await pageInfo.page.render(renderContext).promise;

      // Render overlay elements
      this.renderOverlay();

      this.emit('pageRendered', pageIndex);
    } catch (error) {
      console.error('Failed to render page:', error);
      this.emit('error', error);
    }
  }

  renderOverlay() {
    const pageInfo = this.pages[this.currentPageIndex];
    if (!pageInfo) return;

    this.overlayContext.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);

    // Render annotations
    pageInfo.annotations.forEach(annotation => this.renderAnnotation(annotation));

    // Render text elements
    pageInfo.textElements.forEach(textElement => this.renderTextElement(textElement));

    // Render form fields
    pageInfo.formFields.forEach(formField => this.renderFormField(formField));

    // Render selection if any
    if (this.selectedElement) {
      this.renderSelection(this.selectedElement);
    }
  }

  renderAnnotation(annotation) {
    const ctx = this.overlayContext;
    ctx.save();

    switch (annotation.type) {
      case 'highlight':
        ctx.fillStyle = annotation.color || 'rgba(255, 255, 0, 0.3)';
        ctx.fillRect(annotation.x, annotation.y, annotation.width, annotation.height);
        break;
        
      case 'rectangle':
        ctx.strokeStyle = annotation.color || '#ff0000';
        ctx.lineWidth = annotation.lineWidth || 2;
        ctx.strokeRect(annotation.x, annotation.y, annotation.width, annotation.height);
        break;
        
      case 'freehand':
        ctx.strokeStyle = annotation.color || '#000000';
        ctx.lineWidth = annotation.lineWidth || 2;
        ctx.beginPath();
        annotation.points.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
        break;
    }

    ctx.restore();
  }

  renderTextElement(textElement) {
    const ctx = this.overlayContext;
    ctx.save();

    ctx.fillStyle = textElement.color || '#000000';
    ctx.font = `${textElement.fontSize || 12}px ${textElement.fontFamily || 'Arial'}`;
    ctx.fillText(textElement.text, textElement.x, textElement.y);

    ctx.restore();
  }

  renderFormField(formField) {
    const ctx = this.overlayContext;
    ctx.save();

    switch (formField.type) {
      case 'textfield':
        ctx.strokeStyle = '#0066cc';
        ctx.lineWidth = 1;
        ctx.strokeRect(formField.x, formField.y, formField.width, formField.height);
        
        if (formField.value) {
          ctx.fillStyle = '#000000';
          ctx.font = '12px Arial';
          ctx.fillText(formField.value, formField.x + 5, formField.y + 15);
        }
        break;
        
      case 'checkbox':
        ctx.strokeStyle = '#0066cc';
        ctx.lineWidth = 1;
        ctx.strokeRect(formField.x, formField.y, formField.width, formField.height);
        
        if (formField.checked) {
          ctx.fillStyle = '#0066cc';
          ctx.fillRect(formField.x + 2, formField.y + 2, formField.width - 4, formField.height - 4);
        }
        break;
    }

    ctx.restore();
  }

  renderSelection(element) {
    const ctx = this.overlayContext;
    ctx.save();

    ctx.strokeStyle = '#0066cc';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(element.x - 2, element.y - 2, (element.width || 0) + 4, (element.height || 0) + 4);

    ctx.restore();
  }

  updateCanvasSize() {
    const containerRect = this.container.getBoundingClientRect();
    const canvasAspectRatio = this.canvas.width / this.canvas.height;
    const containerAspectRatio = containerRect.width / containerRect.height;

    let displayWidth, displayHeight;

    if (canvasAspectRatio > containerAspectRatio) {
      displayWidth = Math.min(this.canvas.width, containerRect.width - 40);
      displayHeight = displayWidth / canvasAspectRatio;
    } else {
      displayHeight = Math.min(this.canvas.height, containerRect.height - 40);
      displayWidth = displayHeight * canvasAspectRatio;
    }

    this.canvas.style.width = displayWidth + 'px';
    this.canvas.style.height = displayHeight + 'px';
    this.overlayCanvas.style.width = displayWidth + 'px';
    this.overlayCanvas.style.height = displayHeight + 'px';

    // Center the canvases
    this.canvas.style.margin = 'auto';
    this.canvas.style.display = 'block';
    this.overlayCanvas.style.left = this.canvas.offsetLeft + 'px';
    this.overlayCanvas.style.top = this.canvas.offsetTop + 'px';
  }

  // Event Handlers
  handleResize() {
    this.updateCanvasSize();
  }

  handleMouseDown(event) {
    const point = this.getCanvasPoint(event);
    const element = this.getElementAtPoint(point);

    if (element) {
      this.selectedElement = element;
      this.renderOverlay();
      this.emit('elementSelected', element);
    } else {
      this.selectedElement = null;
      this.renderOverlay();
    }
  }

  handleMouseMove(event) {
    // Handle drag operations if needed
  }

  handleMouseUp(event) {
    // Handle drag end
  }

  handleDoubleClick(event) {
    const point = this.getCanvasPoint(event);
    const textElement = this.getTextElementAtPoint(point);

    if (textElement) {
      this.editTextElement(textElement);
    } else {
      // Create new text element
      this.createTextElement(point.x, point.y);
    }
  }

  getCanvasPoint(event) {
    const rect = this.overlayCanvas.getBoundingClientRect();
    const scaleX = this.overlayCanvas.width / rect.width;
    const scaleY = this.overlayCanvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  }

  getElementAtPoint(point) {
    const pageInfo = this.pages[this.currentPageIndex];
    if (!pageInfo) return null;

    // Check annotations first
    for (const annotation of pageInfo.annotations) {
      if (this.isPointInElement(point, annotation)) {
        return annotation;
      }
    }

    // Check text elements
    for (const textElement of pageInfo.textElements) {
      if (this.isPointInElement(point, textElement)) {
        return textElement;
      }
    }

    // Check form fields
    for (const formField of pageInfo.formFields) {
      if (this.isPointInElement(point, formField)) {
        return formField;
      }
    }

    return null;
  }

  getTextElementAtPoint(point) {
    const pageInfo = this.pages[this.currentPageIndex];
    if (!pageInfo) return null;

    return pageInfo.textElements.find(element => 
      this.isPointInElement(point, element)
    );
  }

  isPointInElement(point, element) {
    return point.x >= element.x && 
           point.x <= element.x + (element.width || 0) &&
           point.y >= element.y && 
           point.y <= element.y + (element.height || 0);
  }

  // Editing Operations
  addAnnotation(type, options) {
    const pageInfo = this.pages[this.currentPageIndex];
    if (!pageInfo) return;

    const annotation = {
      id: Date.now().toString(),
      type,
      pageIndex: this.currentPageIndex,
      ...options
    };

    pageInfo.annotations.push(annotation);
    this.renderOverlay();

    this.emit('annotationAdded', annotation);
    return annotation;
  }

  createTextElement(x, y, text = 'New Text') {
    const pageInfo = this.pages[this.currentPageIndex];
    if (!pageInfo) return;

    const textElement = {
      id: Date.now().toString(),
      type: 'text',
      pageIndex: this.currentPageIndex,
      x,
      y,
      text,
      fontSize: 12,
      fontFamily: 'Arial',
      color: '#000000',
      width: 100,
      height: 20
    };

    pageInfo.textElements.push(textElement);
    this.selectedElement = textElement;
    this.renderOverlay();

    // Show text editor
    this.showTextEditor(textElement);

    this.emit('textElementCreated', textElement);
    return textElement;
  }

  showTextEditor(textElement) {
    // Create inline text editor
    const input = document.createElement('input');
    input.type = 'text';
    input.value = textElement.text;
    input.style.position = 'absolute';
    input.style.left = (this.overlayCanvas.offsetLeft + textElement.x) + 'px';
    input.style.top = (this.overlayCanvas.offsetTop + textElement.y) + 'px';
    input.style.fontSize = textElement.fontSize + 'px';
    input.style.fontFamily = textElement.fontFamily;
    input.style.color = textElement.color;
    input.style.border = '1px solid #0066cc';
    input.style.background = 'white';
    input.style.zIndex = '1000';

    this.container.appendChild(input);
    input.focus();
    input.select();

    const saveText = () => {
      textElement.text = input.value;
      this.container.removeChild(input);
      this.renderOverlay();
      this.emit('textElementUpdated', textElement);
    };

    input.addEventListener('blur', saveText);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        saveText();
      } else if (e.key === 'Escape') {
        this.container.removeChild(input);
      }
    });
  }

  editTextElement(textElement) {
    this.showTextEditor(textElement);
  }

  // OCR Operations
  async performOCR(pageIndex = this.currentPageIndex) {
    if (!this.ocrWorker) {
      throw new Error('OCR not initialized');
    }

    try {
      this.emit('ocrStarted', pageIndex);

      // Get page as image data
      const pageCanvas = document.createElement('canvas');
      const pageContext = pageCanvas.getContext('2d');
      
      const pageInfo = this.pages[pageIndex];
      const viewport = pageInfo.page.getViewport({ scale: 2.0 }); // Higher resolution for OCR
      
      pageCanvas.width = viewport.width;
      pageCanvas.height = viewport.height;

      const renderContext = {
        canvasContext: pageContext,
        viewport: viewport
      };

      await pageInfo.page.render(renderContext).promise;

      // Perform OCR
      const result = await this.ocrWorker.recognize(pageCanvas);
      
      this.ocrResults.set(pageIndex, result.data);
      pageInfo.ocrText = result.data;

      this.emit('ocrCompleted', pageIndex, result.data);
      return result.data;
    } catch (error) {
      console.error('OCR failed:', error);
      this.emit('ocrError', error);
      throw error;
    }
  }

  // Export Operations
  async exportPDF() {
    if (!this.editableDocument) return null;

    try {
      // Apply all edits to the document
      await this.applyEditsToDocument();

      const pdfBytes = await this.editableDocument.save();
      return new Blob([pdfBytes], { type: 'application/pdf' });
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  async applyEditsToDocument() {
    const pages = this.editableDocument.getPages();

    for (let pageIndex = 0; pageIndex < this.pages.length; pageIndex++) {
      const pageInfo = this.pages[pageIndex];
      const page = pages[pageIndex];

      // Add text elements
      for (const textElement of pageInfo.textElements) {
        page.drawText(textElement.text, {
          x: textElement.x,
          y: page.getHeight() - textElement.y - textElement.fontSize, // PDF coordinates are bottom-up
          size: textElement.fontSize,
          color: rgb(0, 0, 0) // Convert color if needed
        });
      }

      // Add form fields and annotations would go here
    }
  }

  // Page Operations
  async goToPage(pageIndex) {
    if (pageIndex >= 0 && pageIndex < this.pages.length) {
      await this.renderPage(pageIndex);
    }
  }

  async nextPage() {
    if (this.currentPageIndex < this.pages.length - 1) {
      await this.goToPage(this.currentPageIndex + 1);
    }
  }

  async previousPage() {
    if (this.currentPageIndex > 0) {
      await this.goToPage(this.currentPageIndex - 1);
    }
  }

  setZoom(zoom) {
    this.zoom = zoom;
    this.renderPage(this.currentPageIndex);
    this.emit('zoomChanged', zoom);
  }

  rotatePage(degrees = 90) {
    this.rotation = (this.rotation + degrees) % 360;
    this.renderPage(this.currentPageIndex);
    this.emit('rotationChanged', this.rotation);
  }

  // Cleanup
  async destroy() {
    if (this.ocrWorker) {
      await this.ocrWorker.terminate();
    }

    if (this.canvas) {
      this.container.removeChild(this.canvas);
    }

    if (this.overlayCanvas) {
      this.container.removeChild(this.overlayCanvas);
    }

    this.removeAllListeners();
  }
}