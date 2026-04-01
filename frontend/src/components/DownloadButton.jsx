import { useState, useEffect } from 'react';
import axios from 'axios';
import { Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

let _cache = null;
let _fetching = null; // prevent parallel fetches

async function fetchFiles() {
  if (_cache) return _cache;
  if (_fetching) return _fetching;
  _fetching = axios.get('/api/files/public')
    .then(r => { _cache = r.data; setTimeout(() => { _cache = null; _fetching = null; }, 60000); return _cache; })
    .catch(() => { _fetching = null; return []; });
  return _fetching;
}

export default function DownloadButton({
  product,
  platform,
  label = 'Download Free Trial',
  style: styleProp,
  variant = 'primary',
}) {
  const [file, setFile] = useState(undefined); // undefined = loading, null = no file
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFiles().then(files => {
      let match = files;
      if (product) match = match.filter(f => f.product?.toLowerCase().includes(product.toLowerCase()));
      if (platform) match = match.filter(f => !f.platform || f.platform.toLowerCase() === platform.toLowerCase());
      setFile(match[0] ?? null);
    });
  }, [product, platform]);

  const handleClick = () => {
    if (file) {
      // Trigger tracked download
      setDownloading(true);
      const a = document.createElement('a');
      a.href = `/api/files/${file.id}/download`;
      a.download = file.original_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => setDownloading(false), 2000);
    } else {
      // No file uploaded yet — send to pricing page
      navigate('/pricing');
    }
  };

  const loading = file === undefined;

  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '13px 26px', borderRadius: 10, fontWeight: 600,
    fontSize: 15, cursor: 'pointer', border: 'none',
    fontFamily: 'inherit', transition: 'opacity 0.2s',
    opacity: loading ? 0.6 : 1,
  };

  const variants = {
    primary:   { background: 'linear-gradient(135deg,#00d4ff,#7c3aed)', color: '#fff' },
    secondary: { background: 'transparent', border: '1px solid #1e2d4a', color: '#f1f5f9' },
    outline:   { background: 'transparent', border: '1px solid #00d4ff', color: '#00d4ff' },
  };

  return (
    <button
      style={{ ...base, ...variants[variant], ...styleProp }}
      onClick={handleClick}
      disabled={loading || downloading}
    >
      <Download size={16} />
      {loading ? 'Loading...' : downloading ? 'Starting...' : label}
      {file?.version && <span style={{ fontSize: 11, opacity: 0.7, marginLeft: 2 }}>v{file.version}</span>}
    </button>
  );
}
