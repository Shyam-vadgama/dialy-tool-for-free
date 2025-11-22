import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

import ImageConverter from './pages/tools/ImageConverter';
import ImageEditor from './pages/tools/ImageEditor';
import JsonFormatter from './pages/tools/JsonFormatter';
import SecurityTools from './pages/tools/SecurityTools';
import PdfTools from './pages/tools/PdfTools';
import PdfEditor from './pages/tools/PdfEditor';
import QrGenerator from './pages/tools/QrGenerator';
import UrlEncoder from './pages/tools/UrlEncoder';
import TextConverter from './pages/tools/TextConverter';
import UuidGenerator from './pages/tools/UuidGenerator';
import MarkdownPreview from './pages/tools/MarkdownPreview';
import ColorTools from './pages/tools/ColorTools';
import UnitConverter from './pages/tools/UnitConverter';
import UniversalScraper from './pages/tools/UniversalScraper';
import Base64Converter from './pages/tools/Base64Converter';
import DownloadManager from './pages/tools/DownloadManager';
import Home from './pages/Home';
import WordCounter from './pages/tools/WordCounter';
import TimeZoneConverter from './pages/tools/TimeZoneConverter';
import LoremIpsumGenerator from './pages/tools/LoremIpsumGenerator';
import CodeFormatter from './pages/tools/CodeFormatter';
import TypingMaster from './pages/tools/TypingMaster';
import AgeCalculator from './pages/tools/AgeCalculator';
import BMICalculator from './pages/tools/BMICalculator';
import DateCalculator from './pages/tools/DateCalculator';
import BinaryConverter from './pages/tools/BinaryConverter';
import HexadecimalConverter from './pages/tools/HexadecimalConverter';
import IPSubnetCalculator from './pages/tools/IPSubnetCalculator';
import FactorCalculator from './pages/tools/FactorCalculator';
import ScientificCalculator from './pages/tools/ScientificCalculator';
import OctalConverter from './pages/tools/OctalConverter';

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
          <Route path="/tools/security" element={<SecurityTools />} />

          <Route path="/tools/qr" element={<QrGenerator />} />
          <Route path="/tools/url" element={<UrlEncoder />} />
          <Route path="/tools/text" element={<TextConverter />} />
          <Route path="/tools/uuid" element={<UuidGenerator />} />
          <Route path="/tools/markdown" element={<MarkdownPreview />} />
          <Route path="/tools/word-counter" element={<WordCounter />} />
          <Route path="/tools/lorem-ipsum" element={<LoremIpsumGenerator />} />
          <Route path="/tools/code-formatter" element={<CodeFormatter />} />
          <Route path="/tools/typing-master" element={<TypingMaster />} />
          <Route path="/tools/age-calculator" element={<AgeCalculator />} />
          <Route path="/tools/bmi-calculator" element={<BMICalculator />} />
          <Route path="/tools/date-calculator" element={<DateCalculator />} />
          <Route path="/tools/binary-converter" element={<BinaryConverter />} />
          <Route path="/tools/hex-converter" element={<HexadecimalConverter />} />
          <Route path="/tools/ip-subnet-calculator" element={<IPSubnetCalculator />} />
          <Route path="/tools/factor-calculator" element={<FactorCalculator />} />
          <Route path="/tools/scientific-calculator" element={<ScientificCalculator />} />
          <Route path="/tools/octal-converter" element={<OctalConverter />} />
          <Route path="/tools/unit-converter" element={<UnitConverter />} />
          <Route path="/tools/universal-scraper" element={<UniversalScraper />} />

          <Route path="/tools/color" element={<ColorTools />} />
          <Route path="/tools/units" element={<UnitConverter />} />
          <Route path="/tools/base64" element={<Base64Converter />} />
          <Route path="/tools/download-manager" element={<DownloadManager />} />
          <Route path="/tools/timezone-converter" element={<TimeZoneConverter />} />

          <Route path="/tools/*" element={<Home />} /> {/* Placeholder for now */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
