import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

import ImageConverter from './pages/tools/ImageConverter';
import ImageEditor from './pages/tools/ImageEditor';
import JsonFormatter from './pages/tools/JsonFormatter';
import PasswordGenerator from './pages/tools/PasswordGenerator';
import PdfTools from './pages/tools/PdfTools';
import PdfEditor from './pages/tools/PdfEditor';
import QrGenerator from './pages/tools/QrGenerator';
import UrlEncoder from './pages/tools/UrlEncoder';
import TextConverter from './pages/tools/TextConverter';
import UuidGenerator from './pages/tools/UuidGenerator';
import MarkdownPreview from './pages/tools/MarkdownPreview';
import ColorTools from './pages/tools/ColorTools';
import UnitConverter from './pages/tools/UnitConverter';
import Base64Converter from './pages/tools/Base64Converter';
import DownloadManager from './pages/tools/DownloadManager';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tools/image" element={<ImageConverter />} />
          <Route path="/tools/image-editor" element={<ImageEditor />} />
          <Route path="/tools/pdf" element={<PdfTools />} />
          <Route path="/tools/pdf-editor" element={<PdfEditor />} />
          <Route path="/tools/dev" element={<JsonFormatter />} />
          <Route path="/tools/security" element={<PasswordGenerator />} />

          <Route path="/tools/qr" element={<QrGenerator />} />
          <Route path="/tools/url" element={<UrlEncoder />} />
          <Route path="/tools/text" element={<TextConverter />} />
          <Route path="/tools/uuid" element={<UuidGenerator />} />
          <Route path="/tools/markdown" element={<MarkdownPreview />} />

          <Route path="/tools/color" element={<ColorTools />} />
          <Route path="/tools/units" element={<UnitConverter />} />
          <Route path="/tools/base64" element={<Base64Converter />} />
          <Route path="/tools/download-manager" element={<DownloadManager />} />

          <Route path="/tools/*" element={<Home />} /> {/* Placeholder for now */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
