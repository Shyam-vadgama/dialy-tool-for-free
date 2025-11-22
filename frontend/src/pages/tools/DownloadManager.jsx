// Force cache invalidation
import React, { useState, useCallback } from 'react';
import { Download, Globe, Video, Image, Music, FileText, Package, AlertCircle, CheckCircle, Loader } from 'lucide-react';

const DownloadManager = () => {
  const [activeTab, setActiveTab] = useState('basic');
  const [basicUrl, setBasicUrl] = useState('');
  const [advancedUrl, setAdvancedUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoFormats, setVideoFormats] = useState([]);
  const [scrapedAssets, setScrapedAssets] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Basic Video Download
  const handleBasicDownload = useCallback(async () => {
    if (!basicUrl) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('http://localhost:8000/api/download/basic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: basicUrl }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        setVideoFormats(data.formats);
        setSuccess(`Found video: ${data.title}`);
      } else {
        setError(data.detail || 'Failed to process video');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [basicUrl]);

  // Advanced Website Scraping
  const handleAdvancedScrape = useCallback(async () => {
    if (!advancedUrl) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('http://localhost:8000/api/download/advanced-scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: advancedUrl, 
          asset_types: ['images', 'videos', 'audio', 'fonts', 'documents'] 
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        setScrapedAssets(data.assets);
        setSuccess(`Found ${data.total_found} assets on the website`);
      } else {
        setError(data.detail || 'Failed to scrape website');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [advancedUrl]);

  // Download individual asset
  const downloadAsset = useCallback(async (asset) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/download/proxy?url=${encodeURIComponent(asset.url)}&filename=${encodeURIComponent(asset.filename)}`
      );
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = asset.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to download asset');
      }
    } catch (err) {
      setError('Download failed');
    }
  }, []);

  // Download video format
  const downloadVideoFormat = useCallback(async (format) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/download/proxy?url=${encodeURIComponent(format.url)}&filename=${encodeURIComponent(`video.${format.ext}`)}`
      );
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `video.${format.ext}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to download video');
      }
    } catch (err) {
      setError('Download failed');
    }
  }, []);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'images': return <Image className="w-5 h-5" />;
      case 'videos': return <Video className="w-5 h-5" />;
      case 'audio': return <Music className="w-5 h-5" />;
      case 'fonts': return <FileText className="w-5 h-5" />;
      case 'documents': return <Package className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    while (bytes >= 1024 && i < sizes.length - 1) {
      bytes /= 1024;
      i++;
    }
    return `${bytes.toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div className="download-manager" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="header" style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 className="title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--text-primary)' }}>
          <Download className="w-8 h-8" />
          Download Manager
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
          Download videos from URLs or scrape websites for assets (images, videos, audio, fonts, documents)
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('basic')}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: activeTab === 'basic' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'basic' ? 'white' : 'var(--text-primary)',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Video className="w-5 h-5" />
            Basic Download
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: activeTab === 'advanced' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'advanced' ? 'white' : 'var(--text-primary)',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Globe className="w-5 h-5" />
            Advanced Scraping
          </button>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px',
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px',
          backgroundColor: '#dcfce7',
          color: '#16a34a',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Basic Download Tab */}
      {activeTab === 'basic' && (
        <div className="basic-download" style={{ marginBottom: '30px' }}>
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>Basic Video Download</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Enter a video URL (YouTube, Vimeo, etc.) to download:
            </p>
            
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=example"
                value={basicUrl}
                onChange={(e) => setBasicUrl(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--background)',
                  color: 'var(--text-primary)'
                }}
                disabled={loading}
              />
              <button
                onClick={handleBasicDownload}
                disabled={loading || !basicUrl}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: loading || !basicUrl ? 0.6 : 1
                }}
              >
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                {loading ? 'Processing...' : 'Get Video'}
              </button>
            </div>

            {/* Video Formats */}
            {videoFormats.length > 0 && (
              <div className="video-formats">
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '12px' }}>Available Formats:</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
                  {videoFormats.map((format, index) => (
                    <div key={index} style={{
                      padding: '12px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      backgroundColor: 'var(--background)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>
                          {format.quality || 'Unknown Quality'} - {format.ext?.toUpperCase()}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                          {formatFileSize(format.filesize)}
                        </div>
                      </div>
                      <button
                        onClick={() => downloadVideoFormat(format)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: 'var(--primary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Advanced Scraping Tab */}
      {activeTab === 'advanced' && (
        <div className="advanced-scraping">
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', marginBottom: '20px' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>Advanced Website Scraping</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Enter a website URL to scrape and find all available assets:
            </p>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                placeholder="https://auth0.com/blog/building-a-wikipedia-app-using-react-hooks-and-auth0/"
                value={advancedUrl}
                onChange={(e) => setAdvancedUrl(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--background)',
                  color: 'var(--text-primary)'
                }}
                disabled={loading}
              />
              <button
                onClick={handleAdvancedScrape}
                disabled={loading || !advancedUrl}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: loading || !advancedUrl ? 0.6 : 1
                }}
              >
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Globe className="w-5 h-5" />}
                {loading ? 'Scraping...' : 'Scrape Website'}
              </button>
            </div>
          </div>

          {/* Scraped Assets */}
          {scrapedAssets && (
            <div className="scraped-assets">
              {Object.entries(scrapedAssets).map(([category, assets]) => {
                if (!assets || assets.length === 0) return null;
                
                return (
                  <div key={category} className="asset-category" style={{ marginBottom: '24px' }}>
                    <div className="category-header" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '12px',
                      padding: '12px',
                      backgroundColor: 'var(--surface)',
                      borderRadius: '8px',
                      border: '1px solid var(--border)'
                    }}>
                      {getCategoryIcon(category)}
                      <h4 style={{ color: 'var(--text-primary)', margin: 0, textTransform: 'capitalize' }}>
                        {category} ({assets.length})
                      </h4>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
                      {assets.slice(0, 20).map((asset, index) => (
                        <div key={index} style={{
                          padding: '12px',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          backgroundColor: 'var(--background)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {category === 'images' && (
                              <img
                                src={asset.url}
                                alt={asset.filename}
                                style={{
                                  width: '60px',
                                  height: '60px',
                                  objectFit: 'cover',
                                  borderRadius: '4px',
                                  marginBottom: '8px'
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            )}
                            <div style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {asset.filename}
                            </div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {asset.url.length > 50 ? asset.url.substring(0, 50) + '...' : asset.url}
                            </div>
                          </div>
                          <button
                            onClick={() => downloadAsset(asset)}
                            style={{
                              padding: '8px 12px',
                              backgroundColor: 'var(--primary)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              marginLeft: '12px'
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DownloadManager;