/**
 * Image Processing Worker
 * Handles heavy image processing tasks in a separate thread
 * Includes WebAssembly integration for high-performance operations
 */

// Import WASM image processor
importScripts('./wasmImageProcessor.js');

// Import image processing functions (these would normally be from libraries like sharp-wasm, etc.)
class ImageProcessor {
  constructor() {
    this.wasmProcessor = new WASMImageProcessor();
    this.initialized = false;
  }

  async init() {
    // Initialize image processing libraries here
    await this.wasmProcessor.init();
    this.initialized = true;
  }

  async processImage(imageData, operation, options = {}) {
    if (!this.initialized) {
      await this.init();
    }

    const { data, width, height } = imageData;
    const output = new Uint8ClampedArray(data.length);
    
    switch (operation) {
      case 'brightness':
        this.adjustBrightness(data, output, options.value || 0);
        break;
        
      case 'contrast':
        this.adjustContrast(data, output, options.value || 0);
        break;
        
      case 'saturation':
        this.adjustSaturation(data, output, options.value || 0);
        break;
        
      case 'blur':
        this.gaussianBlur(data, output, width, height, options.radius || 1);
        break;
        
      case 'sharpen':
        this.sharpen(data, output, width, height, options.strength || 1);
        break;
        
      case 'edge_detect':
        this.edgeDetect(data, output, width, height);
        break;
        
      case 'noise_reduction':
        this.noiseReduction(data, output, width, height, options.strength || 1);
        break;
        
      case 'color_balance':
        this.colorBalance(data, output, options.red || 0, options.green || 0, options.blue || 0);
        break;
        
      case 'hsl_adjust':
        this.hslAdjust(data, output, options.hue || 0, options.saturation || 0, options.lightness || 0);
        break;

      // High-performance WASM operations
      case 'wasm_gaussian_blur':
        return this.wasmProcessor.processImageData(imageData, 'gaussian_blur', options);
        
      case 'wasm_edge_detection':
        return this.wasmProcessor.processImageData(imageData, 'edge_detection', options);
        
      case 'wasm_noise_reduction':
        return this.wasmProcessor.processImageData(imageData, 'noise_reduction', options);
        
      case 'wasm_sharpening':
        return this.wasmProcessor.processImageData(imageData, 'sharpening', options);
        
      case 'wasm_histogram_equalization':
        return this.wasmProcessor.processImageData(imageData, 'histogram_equalization', options);
        
      case 'wasm_color_correction':
        return this.wasmProcessor.processImageData(imageData, 'color_correction', options);
        
      case 'wasm_morphological':
        return this.wasmProcessor.processImageData(imageData, 'morphological_ops', options);

      // Advanced WASM algorithms
      case 'fft_filter':
        return this.wasmProcessor.performFFTFiltering(imageData, options.filterType || 'lowpass', options.cutoffFrequency || 0.5);
        
      case 'wavelet_transform':
        return this.wasmProcessor.performWaveletTransform(imageData, options.waveletType || 'daubechies', options.levels || 3);
        
      case 'feature_detection':
        return this.wasmProcessor.performFeatureDetection(imageData, options.algorithm || 'harris', options.threshold || 0.1);
        
      default:
        output.set(data);
    }

    return {
      data: output,
      width,
      height
    };
  }

  adjustBrightness(input, output, value) {
    for (let i = 0; i < input.length; i += 4) {
      output[i] = Math.max(0, Math.min(255, input[i] + value));     // Red
      output[i + 1] = Math.max(0, Math.min(255, input[i + 1] + value)); // Green
      output[i + 2] = Math.max(0, Math.min(255, input[i + 2] + value)); // Blue
      output[i + 3] = input[i + 3]; // Alpha
    }
  }

  adjustContrast(input, output, value) {
    const factor = (259 * (value + 255)) / (255 * (259 - value));
    
    for (let i = 0; i < input.length; i += 4) {
      output[i] = Math.max(0, Math.min(255, factor * (input[i] - 128) + 128));
      output[i + 1] = Math.max(0, Math.min(255, factor * (input[i + 1] - 128) + 128));
      output[i + 2] = Math.max(0, Math.min(255, factor * (input[i + 2] - 128) + 128));
      output[i + 3] = input[i + 3];
    }
  }

  adjustSaturation(input, output, value) {
    const saturation = value / 100;
    
    for (let i = 0; i < input.length; i += 4) {
      const r = input[i];
      const g = input[i + 1];
      const b = input[i + 2];
      
      // Convert to grayscale
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      
      // Apply saturation
      output[i] = Math.max(0, Math.min(255, gray + saturation * (r - gray)));
      output[i + 1] = Math.max(0, Math.min(255, gray + saturation * (g - gray)));
      output[i + 2] = Math.max(0, Math.min(255, gray + saturation * (b - gray)));
      output[i + 3] = input[i + 3];
    }
  }

  gaussianBlur(input, output, width, height, radius) {
    const kernel = this.createGaussianKernel(radius);
    this.convolve(input, output, width, height, kernel);
  }

  createGaussianKernel(radius) {
    const size = radius * 2 + 1;
    const kernel = new Array(size * size);
    const sigma = radius / 3;
    const twoSigmaSquare = 2 * sigma * sigma;
    let sum = 0;

    for (let y = -radius; y <= radius; y++) {
      for (let x = -radius; x <= radius; x++) {
        const distance = x * x + y * y;
        const value = Math.exp(-distance / twoSigmaSquare);
        kernel[(y + radius) * size + (x + radius)] = value;
        sum += value;
      }
    }

    // Normalize
    for (let i = 0; i < kernel.length; i++) {
      kernel[i] /= sum;
    }

    return { values: kernel, size };
  }

  convolve(input, output, width, height, kernel) {
    const { values, size } = kernel;
    const half = Math.floor(size / 2);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, a = 0;

        for (let ky = 0; ky < size; ky++) {
          for (let kx = 0; kx < size; kx++) {
            const px = Math.max(0, Math.min(width - 1, x + kx - half));
            const py = Math.max(0, Math.min(height - 1, y + ky - half));
            const idx = (py * width + px) * 4;
            const weight = values[ky * size + kx];

            r += input[idx] * weight;
            g += input[idx + 1] * weight;
            b += input[idx + 2] * weight;
            a += input[idx + 3] * weight;
          }
        }

        const idx = (y * width + x) * 4;
        output[idx] = Math.max(0, Math.min(255, r));
        output[idx + 1] = Math.max(0, Math.min(255, g));
        output[idx + 2] = Math.max(0, Math.min(255, b));
        output[idx + 3] = Math.max(0, Math.min(255, a));
      }
    }
  }

  sharpen(input, output, width, height, strength) {
    const kernel = {
      values: [
        0, -strength, 0,
        -strength, 1 + 4 * strength, -strength,
        0, -strength, 0
      ],
      size: 3
    };
    this.convolve(input, output, width, height, kernel);
  }

  edgeDetect(input, output, width, height) {
    const kernel = {
      values: [
        -1, -1, -1,
        -1, 8, -1,
        -1, -1, -1
      ],
      size: 3
    };
    this.convolve(input, output, width, height, kernel);
  }

  noiseReduction(input, output, width, height, strength) {
    // Simple median filter for noise reduction
    const radius = Math.max(1, Math.floor(strength));
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const neighbors = [];
        
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const px = Math.max(0, Math.min(width - 1, x + dx));
            const py = Math.max(0, Math.min(height - 1, y + dy));
            const idx = (py * width + px) * 4;
            neighbors.push([input[idx], input[idx + 1], input[idx + 2], input[idx + 3]]);
          }
        }
        
        // Calculate median for each channel
        const idx = (y * width + x) * 4;
        output[idx] = this.median(neighbors.map(n => n[0]));
        output[idx + 1] = this.median(neighbors.map(n => n[1]));
        output[idx + 2] = this.median(neighbors.map(n => n[2]));
        output[idx + 3] = input[idx + 3]; // Keep original alpha
      }
    }
  }

  median(values) {
    const sorted = values.sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  }

  colorBalance(input, output, redShift, greenShift, blueShift) {
    for (let i = 0; i < input.length; i += 4) {
      output[i] = Math.max(0, Math.min(255, input[i] + redShift));
      output[i + 1] = Math.max(0, Math.min(255, input[i + 1] + greenShift));
      output[i + 2] = Math.max(0, Math.min(255, input[i + 2] + blueShift));
      output[i + 3] = input[i + 3];
    }
  }

  hslAdjust(input, output, hueShift, saturationShift, lightnessShift) {
    for (let i = 0; i < input.length; i += 4) {
      const [h, s, l] = this.rgbToHsl(input[i], input[i + 1], input[i + 2]);
      
      const newH = (h + hueShift / 360) % 1;
      const newS = Math.max(0, Math.min(1, s + saturationShift / 100));
      const newL = Math.max(0, Math.min(1, l + lightnessShift / 100));
      
      const [r, g, b] = this.hslToRgb(newH, newS, newL);
      
      output[i] = Math.round(r);
      output[i + 1] = Math.round(g);
      output[i + 2] = Math.round(b);
      output[i + 3] = input[i + 3];
    }
  }

  rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [h, s, l];
  }

  hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return [r * 255, g * 255, b * 255];
  }
}

// Worker message handling
const processor = new ImageProcessor();

self.onmessage = async function(e) {
  const { id, type, data } = e.data;

  try {
    let result;
    
    switch (type) {
      case 'process':
        result = await processor.processImage(data.imageData, data.operation, data.options);
        break;
        
      case 'batch_process':
        result = await processor.wasmProcessor.processBatch(data.imageData, data.operations);
        break;
        
      case 'optical_flow':
        result = await processor.wasmProcessor.performOpticalFlow(data.imageData1, data.imageData2, data.method || 'lucas_kanade');
        break;
        
      case 'get_memory_usage':
        result = { memoryUsage: processor.wasmProcessor.getMemoryUsage() };
        break;
        
      default:
        throw new Error(`Unknown operation: ${type}`);
    }
    
    self.postMessage({
      id,
      type: 'success',
      result
    });
  } catch (error) {
    self.postMessage({
      id,
      type: 'error',
      error: error.message
    });
  }
};