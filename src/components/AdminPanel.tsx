import React, { useState, useRef, useEffect } from 'react';
import { Album, PortfolioPhoto, CATEGORIES } from '../types';
import { X, Lock, Upload, Image as ImageIcon, FolderPlus, Trash2, Eye, EyeOff, AlertCircle, Pencil, Check, Search, Filter, Database, Layers, LayoutGrid, PlusCircle } from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  albums: Album[];
  photos: PortfolioPhoto[];
  onDataChange: (newAlbums: Album[], newPhotos: PortfolioPhoto[]) => void;
}

export default function AdminPanel({
  isOpen,
  onClose,
  albums,
  photos,
  onDataChange
}: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  // Form states
  const [activeTab, setActiveTab] = useState<'single' | 'bulk' | 'albums' | 'manage'>('single');
  
  // Single image upload states
  const [singleTitle, setSingleTitle] = useState('');
  const [singleCategory, setSingleCategory] = useState<string>('Stage');
  const [singleAlbumId, setSingleAlbumId] = useState<string>('');
  const [singleFileBase64, setSingleFileBase64] = useState<string | null>(null);
  const [singleFileName, setSingleFileName] = useState('');

  // Bulk upload states
  const [bulkCategory, setBulkCategory] = useState<string>('Stage');
  const [bulkAlbumId, setBulkAlbumId] = useState<string>('');
  const [bulkNaming, setBulkNaming] = useState('Event Expo');
  const [bulkFiles, setBulkFiles] = useState<{ name: string; size: number; base64: string }[]>([]);

  // Create album states
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [newAlbumTag, setNewAlbumTag] = useState('Corporate Event');
  const [newAlbumDesc, setNewAlbumDesc] = useState('');
  const [newAlbumDate, setNewAlbumDate] = useState('2026-06-09');
  const [newAlbumCoverBase64, setNewAlbumCoverBase64] = useState<string | null>(null);

  // Message notifications
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Edit states for current list items
  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);

  // Edit fields for Album
  const [editAlbumTitle, setEditAlbumTitle] = useState('');
  const [editAlbumTag, setEditAlbumTag] = useState('');
  const [editAlbumDesc, setEditAlbumDesc] = useState('');
  const [editAlbumDate, setEditAlbumDate] = useState('');

  // Edit fields for Photo
  const [editPhotoTitle, setEditPhotoTitle] = useState('');
  const [editPhotoCategory, setEditPhotoCategory] = useState<string>('Stage');
  const [editPhotoAlbumId, setEditPhotoAlbumId] = useState('');
  const [editPhotoCoverBase64, setEditPhotoCoverBase64] = useState<string | null>(null);

  // Search & Filtering States for Manage Media
  const [manageSearchQuery, setManageSearchQuery] = useState('');
  const [manageCategoryFilter, setManageCategoryFilter] = useState('All');
  const [manageAlbumFilter, setManageAlbumFilter] = useState('All');
  const [viewSubTab, setViewSubTab] = useState<'photos' | 'albums'>('photos');

  // AI Image scanner states
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [suggestedAlbumName, setSuggestedAlbumName] = useState('');

  // Retroactive batch state tracking
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [batchStatus, setBatchStatus] = useState('');
  const [hasStartedAutoProcess, setHasStartedAutoProcess] = useState(false);

  const singleFileInputRef = useRef<HTMLInputElement>(null);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);
  const albumFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      // Keep state but reset errors/notifications
      setAuthError(false);
      setSuccessMsg('');
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAuth = () => {
    if (password === 'joudcon2026') {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
      setPassword('');
    }
  };

  // Precision programmatical image canvas JOUDCON watermark burner
  const watermarkImage = (imgBase64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imgBase64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imgBase64);
          return;
        }

        // Maintain original proportions
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw original image onto high-definition flat buffer
        ctx.drawImage(img, 0, 0);

        // Proportional sizing: watermark should look robust and premium
        const logoSize = Math.max(64, Math.floor(canvas.width * 0.085)); // proportional banner box
        const margin = Math.max(16, Math.floor(canvas.width * 0.022)); 
        
        const x = canvas.width - logoSize - margin;
        const y = canvas.height - logoSize - margin;

        // Translucent container pill backdrop behind the vector element
        ctx.fillStyle = 'rgba(255, 255, 255, 0.92)'; // High-visibility pure white backdrop
        ctx.strokeStyle = '#53678F'; // Joudcon slate blue accent outline
        ctx.lineWidth = Math.max(1.5, Math.floor(logoSize * 0.018));
        
        const cardX = x - margin * 0.4;
        const cardY = y - margin * 0.4;
        const cardWidth = logoSize + margin * 0.8;
        const cardHeight = logoSize + margin * 0.8;
        const rx = 14; // round borders

        ctx.beginPath();
        ctx.moveTo(cardX + rx, cardY);
        ctx.lineTo(cardX + cardWidth - rx, cardY);
        ctx.quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + rx);
        ctx.lineTo(cardX + cardWidth, cardY + cardHeight - rx);
        ctx.quadraticCurveTo(cardX + cardWidth, cardY + cardHeight, cardX + cardWidth - rx, cardY + cardHeight);
        ctx.lineTo(cardX + rx, cardY + cardHeight);
        ctx.quadraticCurveTo(cardX, cardY + cardHeight, cardX, cardY + cardHeight - rx);
        ctx.lineTo(cardX, cardY + rx);
        ctx.quadraticCurveTo(cardX, cardY, cardX + rx, cardY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // SVG string matching precisely Joudcon Vector Slogans
        const svgString = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${logoSize}" height="${logoSize}" viewBox="0 0 100 100" fill="none">
            <rect x="15" y="15" width="70" height="70" rx="12" transform="rotate(45 50 50)" stroke="#53678F" stroke-width="6" stroke-linecap="round" stroke-dasharray="72 12 22 12 180" />
            <circle cx="70" cy="22" r="8" fill="#FBB040" />
            <path d="M 60 32 C 65 32, 70 36, 70 42 C 70 54, 52 65, 45 78 C 43 82, 38 82, 36 78 C 34 74, 34 54, 34 46 C 34 42, 38 40, 42 40 C 48 40, 52 44, 46 54 C 44 58, 44 64, 48 64 C 52 64, 58 46, 60 32 Z" fill="#53678F" stroke="#53678F" stroke-width="1" stroke-linejoin="round" />
            <circle cx="50" cy="60" r="6" fill="#FBB040" />
            <text x="50" y="93" fill="#53678F" font-size="10" font-family="'Space Grotesk', system-ui, sans-serif" font-weight="900" text-anchor="middle" letter-spacing="1.2">JOUDCON</text>
          </svg>
        `.trim();

        const logoImg = new Image();
        logoImg.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
        logoImg.onload = () => {
          ctx.drawImage(logoImg, x, y, logoSize, logoSize);
          resolve(canvas.toDataURL('image/jpeg', 0.92));
        };
        logoImg.onerror = () => {
          // Programmatic fallback is also high quality and elegant
          ctx.font = `bold ${Math.floor(logoSize * 0.16)}px 'Space Grotesk', sans-serif`;
          ctx.fillStyle = '#53678F';
          ctx.fillText('JOUDCON', x + logoSize * 0.08, y + logoSize * 0.52);
          resolve(canvas.toDataURL('image/jpeg', 0.92));
        };
      };
      img.onerror = () => {
        resolve(imgBase64); // Fallback to raw if unreadable
      };
    });
  };

  // Turn files into base64 Helper
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Trigger Gemini AI Image Recognition
  const triggerAIScan = async (base64: string) => {
    setIsScanning(true);
    setSuggestedAlbumName('');
    setScanStatus('AI scanning event elements & installation metadata...');
    try {
      const response = await fetch('/api/scan-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64,
          categories: CATEGORIES,
          existingAlbums: albums.map(a => a.title),
        }),
      });

      if (!response.ok) {
        throw new Error('Failure response from Joudcon Gemini server middleware.');
      }

      const data = await response.json();
      if (data.title) {
        setSingleTitle(data.title);
      }
      if (data.category && CATEGORIES.includes(data.category as any)) {
        setSingleCategory(data.category);
      }
      if (data.albumName) {
        const existingAlb = albums.find(
          a => a.title.toLowerCase().trim() === data.albumName.toLowerCase().trim()
        );
        if (existingAlb) {
          setSingleAlbumId(existingAlb.id);
          setScanStatus(`Gemini matched active project: "${existingAlb.title}"`);
        } else {
          setSuggestedAlbumName(data.albumName);
          setScanStatus(`Gemini suggests creating: "${data.albumName}"`);
        }
      } else {
        setScanStatus('Scanning audit complete!');
      }
      setTimeout(() => setScanStatus(''), 4500);
    } catch (err: any) {
      console.error("Scanning Error:", err);
      setErrorMsg('AI scan failed: Verify your GEMINI_API_KEY inside Settings > Secrets.');
      setScanStatus('');
    } finally {
      setIsScanning(false);
    }
  };

  const handleCreateAlbumOnTheFly = () => {
    if (!suggestedAlbumName) return;
    const newAlbum: Album = {
      id: `album-${Date.now()}`,
      title: suggestedAlbumName,
      description: `Premium event setup automatically catalogued via Joudcon AI scanning.`,
      coverUrl: singleFileBase64 || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
      tag: 'AI Organized',
      date: new Date().toISOString().split('T')[0]
    };

    onDataChange([newAlbum, ...albums], photos);
    setSingleAlbumId(newAlbum.id);
    setSuggestedAlbumName('');
    showSuccess(`Created project album "${newAlbum.title}" on-the-fly.`);
  };

  // Safe background queue watermarker
  const runRetroactiveWatermarker = async (customPending?: PortfolioPhoto[]) => {
    if (isBatchProcessing) return;
    
    const pendingPhotos = customPending || photos.filter(p => !p.isWatermarked);
    if (pendingPhotos.length === 0) {
      showSuccess("All existing images are already branded with Joudcon watermark!");
      return;
    }

    setIsBatchProcessing(true);
    setBatchProgress({ current: 0, total: pendingPhotos.length });
    setBatchStatus(`Initializing background watermark burner...`);

    let updatedPhotos = [...photos];
    let successCount = 0;

    for (let i = 0; i < pendingPhotos.length; i++) {
      const ph = pendingPhotos[i];
      setBatchProgress({ current: i + 1, total: pendingPhotos.length });
      setBatchStatus(`Watermarking ${i + 1}/${pendingPhotos.length}: "${ph.title}"`);
      
      try {
        const watermarked = await watermarkImage(ph.url);
        
        // Update snapshot URL & mark checked
        updatedPhotos = updatedPhotos.map(item => {
          if (item.id === ph.id) {
            return {
              ...item,
              url: watermarked,
              isWatermarked: true
            };
          }
          return item;
        });

        // Sync with primary state & storage
        onDataChange(albums, updatedPhotos);
        successCount++;
        
        // 120ms yield to protect main UI thread responsiveness
        await new Promise(r => setTimeout(r, 120));
      } catch (err) {
        console.error(`Failed to watermark image ${ph.id}:`, err);
      }
    }

    setIsBatchProcessing(false);
    setBatchStatus('');
    showSuccess(`Branding stream finalized. Secured ${successCount} existing catalog items.`);
  };

  useEffect(() => {
    if (isAuthenticated && !hasStartedAutoProcess) {
      const pending = photos.filter(p => !p.isWatermarked);
      if (pending.length > 0) {
        setHasStartedAutoProcess(true);
        // Automatically start in the background safely
        runRetroactiveWatermarker(pending);
      }
    }
  }, [isAuthenticated, hasStartedAutoProcess, photos]);

  const handleSingleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setScanStatus('Drawing the company watermark...');
        const base64 = await fileToBase64(file);
        const watermarked = await watermarkImage(base64);
        setSingleFileBase64(watermarked);
        setSingleFileName(file.name);
        setScanStatus('Starting AI scanning preview...');
        
        // Auto-scan file immediately
        triggerAIScan(watermarked);
      } catch (err) {
        setErrorMsg('Error watermarking file.');
        setScanStatus('');
      }
    }
  };

  const handleBulkFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const readFiles = Array.from(e.target.files) as File[];
      const results: { name: string; size: number; base64: string }[] = [];
      setScanStatus('Embedding watermark logos in bulk...');
      
      for (const file of readFiles) {
        try {
          const base64 = await fileToBase64(file);
          const watermarked = await watermarkImage(base64);
          results.push({
            name: file.name,
            size: file.size,
            base64: watermarked
          });
        } catch (err) {
          // ignore bad files
        }
      }
      setBulkFiles((prev) => [...prev, ...results]);
      setScanStatus('');
    }
  };

  const handleAlbumCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setScanStatus('Watermarking custom cover image...');
        const base64 = await fileToBase64(file);
        const watermarked = await watermarkImage(base64);
        setNewAlbumCoverBase64(watermarked);
        setScanStatus('');
      } catch (err) {
        setErrorMsg('Error reading album cover file.');
        setScanStatus('');
      }
    }
  };

  // Form Submissions
  const handleSingleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleFileBase64) {
      setErrorMsg('Please select or drag an image first.');
      return;
    }

    const newPhoto: PortfolioPhoto = {
      id: `photo-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      url: singleFileBase64,
      title: singleTitle.trim() || `Asset - ${singleCategory}`,
      category: singleCategory,
      albumId: singleAlbumId || null,
      createdAt: new Date().toISOString(),
      isWatermarked: true
    };

    onDataChange(albums, [newPhoto, ...photos]);
    
    // reset form
    setSingleTitle('');
    setSingleFileBase64(null);
    setSingleFileName('');
    if (singleFileInputRef.current) singleFileInputRef.current.value = '';
    
    showSuccess('Successfully published single image.');
  };

  const handleBulkUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkFiles.length === 0) {
      setErrorMsg('Please select one or more images inside the queue.');
      return;
    }

    const newPhotos: PortfolioPhoto[] = bulkFiles.map((file, idx) => ({
      id: `photo-bulk-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
      url: file.base64,
      title: `${bulkNaming.trim() || 'Event Archive'} - ${String(idx + 1).padStart(2, '0')}`,
      category: bulkCategory,
      albumId: bulkAlbumId || null,
      createdAt: new Date().toISOString(),
      isWatermarked: true
    }));

    onDataChange(albums, [...newPhotos, ...photos]);
    
    // reset
    setBulkFiles([]);
    if (bulkFileInputRef.current) bulkFileInputRef.current.value = '';
    
    showSuccess(`Successfully bulk-uploaded ${newPhotos.length} images.`);
  };

  const handleCreateAlbumSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumTitle.trim()) {
      setErrorMsg('Album title is required.');
      return;
    }

    const defaultCovers = [
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504270997636-07ddfbd48945?auto=format&fit=crop&w=800&q=80'
    ];
    const defaultCover = defaultCovers[Math.floor(Math.random() * defaultCovers.length)];

    const newAlbum: Album = {
      id: `album-${Date.now()}`,
      title: newAlbumTitle.trim(),
      description: newAlbumDesc.trim() || 'No description provided.',
      coverUrl: newAlbumCoverBase64 || defaultCover,
      tag: newAlbumTag.trim() || 'Corporate',
      date: newAlbumDate || new Date().toISOString().split('T')[0]
    };

    onDataChange([newAlbum, ...albums], photos);

    // reset Form
    setNewAlbumTitle('');
    setNewAlbumDesc('');
    setNewAlbumCoverBase64(null);
    if (albumFileInputRef.current) albumFileInputRef.current.value = '';
    
    showSuccess(`Created Album "${newAlbum.title}" successfully.`);
    setActiveTab('single'); // switch tab so they can assign images to it
  };

  // Queue item deletability
  const handleDeletePhoto = (photoId: string) => {
    const updated = photos.filter((p) => p.id !== photoId);
    onDataChange(albums, updated);
    showSuccess('Deleted photo successfully.');
  };

  const handleDeleteAlbum = (albumId: string) => {
    if (window.confirm("Are you sure? This will delete the album itself (photos inside will remain in general service capabilities).")) {
      const updatedAlbums = albums.filter((a) => a.id !== albumId);
      // Detach photos from deleted album
      const updatedPhotos = photos.map((p) => p.albumId === albumId ? { ...p, albumId: null } : p);
      onDataChange(updatedAlbums, updatedPhotos);
      showSuccess('Deleted album successfully.');
    }
  };

  const startEditingAlbum = (alb: Album) => {
    setEditingAlbumId(alb.id);
    setEditAlbumTitle(alb.title);
    setEditAlbumTag(alb.tag);
    setEditAlbumDesc(alb.description);
    setEditAlbumDate(alb.date);
    setEditingPhotoId(null);
  };

  const saveAlbumEdit = (albumId: string) => {
    if (!editAlbumTitle.trim()) {
      setErrorMsg('Album name cannot be empty.');
      return;
    }
    const updatedAlbums = albums.map((alb) => {
      if (alb.id === albumId) {
        return {
          ...alb,
          title: editAlbumTitle.trim(),
          tag: editAlbumTag.trim(),
          description: editAlbumDesc.trim(),
          date: editAlbumDate
        };
      }
      return alb;
    });
    onDataChange(updatedAlbums, photos);
    setEditingAlbumId(null);
    showSuccess('Album details updated.');
  };

  const startEditingPhoto = (ph: PortfolioPhoto) => {
    setEditingPhotoId(ph.id);
    setEditPhotoTitle(ph.title);
    setEditPhotoCategory(ph.category);
    setEditPhotoAlbumId(ph.albumId || '');
    setEditPhotoCoverBase64(null);
    setEditingAlbumId(null);
  };

  const savePhotoEdit = (photoId: string) => {
    const updatedPhotos = photos.map((ph) => {
      if (ph.id === photoId) {
        return {
          ...ph,
          title: editPhotoTitle.trim() || ph.title,
          category: editPhotoCategory,
          albumId: editPhotoAlbumId || null,
          url: editPhotoCoverBase64 || ph.url,
          isWatermarked: editPhotoCoverBase64 ? true : ph.isWatermarked
        };
      }
      return ph;
    });
    onDataChange(albums, updatedPhotos);
    setEditingPhotoId(null);
    setEditPhotoCoverBase64(null);
    showSuccess('Photo details and image updated.');
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setErrorMsg('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="min-h-screen bg-[#0F1D35] text-[#F8F6F2] flex flex-col font-sans animate-fade-in select-none" id="admin-workspace-page">
      {/* Header */}
      <header className="bg-[#122340] border-b border-white/10 px-4 sm:px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0F1D35] rounded-xl border border-white/10 flex items-center justify-center flex-shrink-0">
              <Lock className="text-[#F5A623] w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-[0.18em] font-extrabold text-[#E8921A] uppercase leading-none">Joudcon Events</span>
                <span className="text-[8px] bg-[#E8921A]/10 border border-[#E8921A]/20 text-[#F5A623] font-mono tracking-wide px-1.5 py-0.5 rounded uppercase font-bold leading-none">Admin Portal</span>
              </div>
              <h1 className="font-display tracking-widest text-xs font-black uppercase text-white mt-1">
                Staff Administration Page
              </h1>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 bg-[#0F1D35] hover:bg-white/5 border border-white/10 hover:border-[#E8921A] text-white py-1.5 px-4 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
          >
            ← Return to Website
          </button>
        </div>
      </header>

      {/* Page Content area */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        {!isAuthenticated ? (
          /* password Authenticator Overlay */
          <div className="p-8 flex flex-col items-center justify-center text-center max-w-sm mx-auto my-12">
            <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
              <Lock className="text-[#F5A623] w-6 h-6 animate-pulse" />
            </div>
            <h3 className="font-display text-xl font-bold uppercase text-white mb-1">Enter PIN Password</h3>
            <p className="text-xs text-gray-400 mb-6">Enter secure staff passcode to edit portfolio items.</p>

            <div className="w-full space-y-4">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAuth();
                }}
                className="w-full tracking-widest text-center text-lg bg-[#122340] border-2 border-white/10 rounded-md py-2 px-4 focus:outline-none focus:border-[#E8921A] text-white transition-all font-mono"
              />

              {authError && (
                <div className="flex items-center gap-1.5 justify-center text-red-400 text-xs">
                  <AlertCircle size={14} />
                  <span>Invalid passcode. Please try again.</span>
                </div>
              )}

              <button
                onClick={handleAuth}
                className="w-full bg-[#E8921A] hover:bg-[#F5A623] text-[#0F1D35] py-2.5 rounded-md font-sans font-bold uppercase tracking-wider text-xs transition-colors"
              >
                Unlock Portfolio Dashboard
              </button>
              
              <p className="text-[10px] text-gray-500 font-mono">Def: joudcon2026</p>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard Panel */
          <div className="flex-1 flex flex-col gap-6 animate-fade-in animate-fade-in" id="admin-workspace-content">
            {/* Premium Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="cms-statistics">
              <div className="bg-[#122340] border border-white/10 rounded-xl p-5 flex items-center justify-between shadow-md hover:border-[#E8921A]/30 transition-all">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block font-display">Portfolio Photos</span>
                  <span className="font-display text-3xl font-black text-white block mt-1 tracking-tight">{photos.length}</span>
                  <span className="text-[9px] text-[#F5A623] block mt-0.5 font-sans">Branded ({photos.filter(p => p.isWatermarked).length}/{photos.length})</span>
                </div>
                <div className="w-12 h-12 bg-[#0F1D35] border border-white/5 rounded-lg flex items-center justify-center text-[#F5A623] shrink-0">
                  <ImageIcon size={22} />
                </div>
              </div>
              <div className="bg-[#122340] border border-white/10 rounded-xl p-5 flex items-center justify-between shadow-md hover:border-[#E8921A]/30 transition-all">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block font-display">Specialty Projects</span>
                  <span className="font-display text-3xl font-black text-white block mt-1 tracking-tight">{albums.length}</span>
                  <span className="text-[9px] text-[#F5A623] block mt-0.5 font-sans">Custom layout event folders</span>
                </div>
                <div className="w-12 h-12 bg-[#0F1D35] border border-white/5 rounded-lg flex items-center justify-center text-[#F5A623] shrink-0">
                  <FolderPlus size={22} />
                </div>
              </div>
              <div className="bg-[#122340] border border-white/10 rounded-xl p-5 flex items-center justify-between shadow-md hover:border-[#E8921A]/30 transition-all">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block font-display">Active Categories</span>
                  <span className="font-display text-3xl font-black text-white block mt-1 tracking-tight">{CATEGORIES.length}</span>
                  <span className="text-[9px] text-[#F5A623] block mt-0.5 font-sans">Capability filter groups</span>
                </div>
                <div className="w-12 h-12 bg-[#0F1D35] border border-white/5 rounded-lg flex items-center justify-center text-[#F5A623] shrink-0">
                  <Layers size={22} />
                </div>
              </div>
            </div>

            {/* Retroactive digital watermarking progress widget */}
            {(isBatchProcessing || photos.some(p => !p.isWatermarked)) && (
              <div className="bg-[#122340] border border-[#E8921A]/30 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-lg animate-fade-in" id="retroactive-watermarking-widget">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full bg-[#F5A623] ${isBatchProcessing ? "animate-ping" : ""}`} />
                    <h4 className="text-xs uppercase font-extrabold tracking-widest text-[#F5A623] font-display">
                      {isBatchProcessing ? "Joudcon Branding Stream Active" : "Unsecured Portfolio Images Detected"}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-300 font-sans">
                    {isBatchProcessing 
                      ? `${batchStatus} (${batchProgress.current}/${batchProgress.total})` 
                      : `Found ${photos.filter(p => !p.isWatermarked).length} existing showcase items that do not have Joudcon logo backdrops. Run retroactive watermarking to secure them.`}
                  </p>
                  
                  {isBatchProcessing && (
                    <div className="w-full bg-[#0F1D35] h-1.5 rounded-full overflow-hidden mt-2.5 max-w-md">
                      <div 
                        className="bg-[#E8921A] h-full rounded-full transition-all duration-300"
                        style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
                {!isBatchProcessing && (
                  <button
                    onClick={() => runRetroactiveWatermarker()}
                    className="shrink-0 bg-[#E8921A] hover:bg-[#F5A623] text-[#0F1D35] text-xs font-bold font-sans uppercase tracking-wider py-2 px-4 rounded-lg shadow-md border border-[#E8921A]/20 transition-all cursor-pointer"
                  >
                    ✨ Run Retroactive Watermarker
                  </button>
                )}
              </div>
            )}

            {/* Authenticated operations panel card */}
            <div className="bg-[#122340]/40 border border-white/10 rounded-2xl shadow-xl overflow-hidden flex flex-col flex-1">
              {/* Tabs Selector */}
              <div className="flex border-b border-white/5 bg-[#122340]/60 text-xs text-gray-400">
              <button
                onClick={() => { setActiveTab('single'); setSuccessMsg(''); }}
                className={`flex-1 py-3 px-2 border-b-2 text-center transition-all font-display uppercase tracking-widest font-semibold ${
                  activeTab === 'single' ? 'border-[#E8921A] text-[#F5A623] bg-white/5' : 'border-transparent hover:text-white hover:bg-white/5'
                }`}
              >
                Single Image
              </button>
              <button
                onClick={() => { setActiveTab('bulk'); setSuccessMsg(''); }}
                className={`flex-1 py-3 px-2 border-b-2 text-center transition-all font-display uppercase tracking-widest font-semibold ${
                  activeTab === 'bulk' ? 'border-[#E8921A] text-[#F5A623] bg-white/5' : 'border-transparent hover:text-white hover:bg-white/5'
                }`}
              >
                Bulk Upload
              </button>
              <button
                onClick={() => { setActiveTab('albums'); setSuccessMsg(''); }}
                className={`flex-1 py-3 px-2 border-b-2 text-center transition-all font-display uppercase tracking-widest font-semibold ${
                  activeTab === 'albums' ? 'border-[#E8921A] text-[#F5A623] bg-white/5' : 'border-transparent hover:text-white hover:bg-white/5'
                }`}
              >
                Create Album
              </button>
              <button
                onClick={() => { setActiveTab('manage'); setSuccessMsg(''); }}
                className={`flex-1 py-3 px-2 border-b-2 text-center transition-all font-display uppercase tracking-widest font-semibold ${
                  activeTab === 'manage' ? 'border-[#E8921A] text-[#F5A623] bg-white/5' : 'border-transparent hover:text-white hover:bg-white/5'
                }`}
              >
                Manage Media ({photos.length})
              </button>
            </div>

            {/* Notification messages */}
            <div className="px-6 pt-3">
              {successMsg && (
                <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 p-2 text-xs rounded-md text-center">
                  {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="bg-red-950/40 border border-red-500/30 text-red-400 p-2 text-xs rounded-md text-center">
                  {errorMsg}
                </div>
              )}
            </div>

            {/* Tab Panels */}
            <div className="flex-1 p-6">
              {activeTab === 'single' && (
                <form onSubmit={handleSingleUploadSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">Image Title</label>
                      <input
                        type="text"
                        placeholder="e.g., Curved LED Stage (leave blank for default)"
                        value={singleTitle}
                        onChange={(e) => setSingleTitle(e.target.value)}
                        className="w-full bg-[#122340] border border-white/10 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:border-[#E8921A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1 font-sans">Assign Category</label>
                      <select
                        value={singleCategory}
                        onChange={(e) => setSingleCategory(e.target.value)}
                        className="w-full bg-[#122340] border border-white/10 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:border-[#E8921A]"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1 font-sans">Assign to Album (Optional)</label>
                      <select
                        value={singleAlbumId}
                        onChange={(e) => setSingleAlbumId(e.target.value)}
                        className="w-full bg-[#122340] border border-white/10 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:border-[#E8921A]"
                      >
                        <option value="">— No Album (General Feature Only) —</option>
                        {albums.map((alb) => (
                          <option key={alb.id} value={alb.id}>{alb.title}</option>
                        ))}
                      </select>
                      {suggestedAlbumName && !albums.some(a => a.title.toLowerCase().trim() === suggestedAlbumName.toLowerCase().trim()) && (
                        <button
                          type="button"
                          onClick={handleCreateAlbumOnTheFly}
                          className="mt-2 text-xs text-[#F5A623] hover:text-white flex items-center gap-1.5 bg-[#F5A623]/10 px-3 py-1.5 rounded-md border border-[#F5A623]/25 transition-all font-sans cursor-pointer font-bold leading-normal"
                        >
                          ✨ Create suggested album &quot;{suggestedAlbumName}&quot; (AI Suggested)
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Drag and drop selection zone */}
                  <div>
                    <span className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">Image File</span>
                    <div
                      onClick={() => !isScanning && singleFileInputRef.current?.click()}
                      className={`border-2 border-dashed border-white/10 hover:border-[#E8921A] rounded-lg p-6 text-center cursor-pointer transition-colors bg-[#122340]/40 flex flex-col items-center justify-center ${isScanning ? 'pointer-events-none opacity-60' : ''}`}
                    >
                      <Upload className="w-8 h-8 text-[#F5A623] mb-2 animate-bounce" />
                      {singleFileName ? (
                        <div className="space-y-2">
                          <div className="text-emerald-400 text-xs font-semibold">
                            📎 Selected: {singleFileName}
                          </div>
                          {singleFileBase64 && (
                            <button
                              type="button"
                              disabled={isScanning}
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerAIScan(singleFileBase64);
                              }}
                              className="text-xs bg-white/10 hover:bg-[#F5A623]/20 border border-white/20 text-[#F5A623] hover:text-white py-1 px-3 rounded-full transition-all inline-flex items-center gap-1 cursor-pointer font-semibold animate-fade-in"
                            >
                              ✨ Trigger Gemini AI Scan Suggestion
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 font-sans">
                          <strong>Click or drop</strong> to insert event photo file
                        </div>
                      )}
                      <input
                        type="file"
                        ref={singleFileInputRef}
                        onChange={handleSingleFileChange}
                        accept="image/*"
                        className="hidden"
                        disabled={isScanning}
                      />
                    </div>
                  </div>

                  {/* AI & Watermark Status Indicators */}
                  {(scanStatus || isScanning) && (
                    <div className="bg-[#1e3a6a]/20 border border-[#E8921A]/20 rounded-lg p-3 flex items-center justify-between text-xs text-[#F8F6F2] animate-fade-in">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#F5A623] animate-ping" />
                        <span className="font-mono text-gray-300 font-semibold">{scanStatus}</span>
                      </div>
                      {isScanning && (
                        <div className="text-[10px] bg-[#E8921A]/10 border border-[#E8921A]/20 text-[#F5A623] font-mono font-bold tracking-wider px-2 py-0.5 rounded animate-pulse uppercase select-none">
                          ANALYZING IMAGE
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-[#E8921A] text-[#0F1D35] py-2 rounded font-sans font-bold uppercase tracking-wider text-xs hover:bg-[#F5A623] transition-colors"
                  >
                    Publish to Live Site
                  </button>
                </form>
              )}

              {activeTab === 'bulk' && (
                <form onSubmit={handleBulkUploadSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">Blanket Title Prefix</label>
                      <input
                        type="text"
                        placeholder="e.g. Riyadh Tech Summit"
                        value={bulkNaming}
                        onChange={(e) => setBulkNaming(e.target.value)}
                        className="w-full bg-[#122340] border border-white/10 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:border-[#E8921A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">Blanket Category</label>
                      <select
                        value={bulkCategory}
                        onChange={(e) => setBulkCategory(e.target.value)}
                        className="w-full bg-[#122340] border border-white/10 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:border-[#E8921A]"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">Assign Album</label>
                    <select
                      value={bulkAlbumId}
                      onChange={(e) => setBulkAlbumId(e.target.value)}
                      className="w-full bg-[#122340] border border-white/10 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:border-[#E8921A]"
                    >
                      <option value="">— No Album (General Category Only) —</option>
                      {albums.map((alb) => (
                        <option key={alb.id} value={alb.id}>{alb.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Drag-n-drop Queue Multi Input */}
                  <div>
                    <span className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">Upload Multiple Images</span>
                    <div
                      onClick={() => bulkFileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/10 hover:border-[#E8921A] rounded-lg p-6 text-center cursor-pointer transition-colors bg-[#122340]/40 flex flex-col items-center justify-center"
                    >
                      <FolderPlus className="w-8 h-8 text-[#F5A623] mb-2" />
                      <div className="text-xs text-gray-400">
                        <strong>Click to select</strong> or drag multiple photo assets
                      </div>
                      <input
                        type="file"
                        ref={bulkFileInputRef}
                        onChange={handleBulkFileChange}
                        accept="image/*"
                        multiple
                        className="hidden"
                      />
                    </div>
                  </div>

                  {bulkFiles.length > 0 && (
                    <div className="space-y-1 bg-[#122340] p-3 rounded-md border border-white/5">
                      <div className="flex justify-between items-center text-[10px] text-gray-400 uppercase font-bold border-b border-white/10 pb-1 mb-1">
                        <span>Selected Queue ({bulkFiles.length})</span>
                        <button type="button" onClick={() => setBulkFiles([])} className="text-red-400 hover:text-red-300">Clear All</button>
                      </div>
                      <div className="max-h-24 overflow-y-auto space-y-1 pr-1 font-mono text-[10px] text-gray-400">
                        {bulkFiles.map((file, i) => (
                          <div key={i} className="flex justify-between items-center bg-white/5 p-1 rounded">
                            <span className="truncate max-w-[400px]">📎 {file.name}</span>
                            <span>{(file.size / 1024).toFixed(0)} KB</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-[#122340] border border-[#E8921A] text-[#F5A623] hover:bg-[#E8921A] hover:text-[#0F1D35] py-2 rounded font-sans font-bold uppercase tracking-wider text-xs transition-colors"
                  >
                    Submit Drag Queue ({bulkFiles.length} item{bulkFiles.length !== 1 ? 's' : ''})
                  </button>
                </form>
              )}

              {activeTab === 'albums' && (
                <form onSubmit={handleCreateAlbumSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">Album Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Riyadh Season Pavilion"
                        value={newAlbumTitle}
                        onChange={(e) => setNewAlbumTitle(e.target.value)}
                        className="w-full bg-[#122340] border border-white/10 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:border-[#E8921A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">Cover Tag / Subtitle</label>
                      <input
                        type="text"
                        placeholder="e.g. Luxury Pavilion Setup"
                        value={newAlbumTag}
                        onChange={(e) => setNewAlbumTag(e.target.value)}
                        className="w-full bg-[#122340] border border-white/10 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:border-[#E8921A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1 font-sans">Event Date</label>
                      <input
                        type="date"
                        value={newAlbumDate}
                        onChange={(e) => setNewAlbumDate(e.target.value)}
                        className="w-full bg-[#122340] border border-white/10 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:border-[#E8921A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">Album Cover Image</label>
                      <input
                        type="file"
                        ref={albumFileInputRef}
                        accept="image/*"
                        onChange={handleAlbumCoverChange}
                        className="w-full text-xs text-gray-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-white/5 file:text-white hover:file:bg-white/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">Description</label>
                    <textarea
                      placeholder="Brief subtext describing your structural execution, sizing, or key capabilities achieved..."
                      value={newAlbumDesc}
                      onChange={(e) => setNewAlbumDesc(e.target.value)}
                      rows={3}
                      className="w-full bg-[#122340] border border-white/10 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:border-[#E8921A]"
                    />
                  </div>

                  {newAlbumCoverBase64 && (
                    <div className="text-xs text-emerald-400 font-semibold text-center py-1">
                      ✓ Cover Custom Image Ready
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-[#E8921A] text-[#0F1D35] py-2 rounded font-sans font-bold uppercase tracking-wider text-xs hover:bg-[#F5A623] transition-colors"
                  >
                    Build Custom Event Album
                  </button>
                </form>
              )}

              {activeTab === 'manage' && (() => {
                const filteredPhotos = photos.filter((ph) => {
                  const matchesSearch = ph.title.toLowerCase().includes(manageSearchQuery.toLowerCase());
                  const matchesCategory = manageCategoryFilter === 'All' || ph.category === manageCategoryFilter;
                  const matchesAlbum = manageAlbumFilter === 'All'
                    ? true
                    : manageAlbumFilter === 'none'
                      ? !ph.albumId
                      : ph.albumId === manageAlbumFilter;
                  return matchesSearch && matchesCategory && matchesAlbum;
                });

                return (
                  <div className="space-y-5 animate-fade-in">
                    {/* Sub-tabs header for Photos management vs. Albums management */}
                    <div className="flex bg-[#122340] p-1 rounded-lg border border-white/5 text-xs">
                      <button
                        type="button"
                        onClick={() => { setViewSubTab('photos'); setSuccessMsg(''); }}
                        className={`flex-1 py-2 px-3 rounded text-center font-semibold font-display uppercase tracking-widest transition-all ${
                          viewSubTab === 'photos'
                            ? 'bg-[#E8921A] text-[#0F1D35]'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Media Photos ({filteredPhotos.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => { setViewSubTab('albums'); setSuccessMsg(''); }}
                        className={`flex-1 py-2 px-3 rounded text-center font-semibold font-display uppercase tracking-widest transition-all ${
                          viewSubTab === 'albums'
                            ? 'bg-[#E8921A] text-[#0F1D35]'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Event Albums ({albums.length})
                      </button>
                    </div>

                    {/* SUB-PANEL 1: PHOTOS LISTING */}
                    {viewSubTab === 'photos' && (
                      <div className="space-y-4">
                        {/* Search & Filters Controls Bar */}
                        <div className="bg-[#122340]/40 p-3 rounded-lg border border-white/5 space-y-3">
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                              <Search size={14} />
                            </span>
                            <input
                              type="text"
                              value={manageSearchQuery}
                              onChange={(e) => setManageSearchQuery(e.target.value)}
                              placeholder="Search photos by title..."
                              className="w-full bg-[#122340]/90 border border-white/10 rounded-md py-1.5 pl-9 pr-8 text-xs focus:outline-none focus:border-[#E8921A] text-white"
                            />
                            {manageSearchQuery && (
                              <button
                                type="button"
                                onClick={() => setManageSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white text-xs"
                              >
                                Clear
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            {/* Filter by Category */}
                            <div className="space-y-1">
                              <label className="text-gray-400 uppercase tracking-widest font-semibold block">Category</label>
                              <select
                                value={manageCategoryFilter}
                                onChange={(e) => setManageCategoryFilter(e.target.value)}
                                className="w-full bg-[#122340]/90 border border-white/10 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#E8921A] text-white"
                              >
                                <option value="All">All Categories</option>
                                {CATEGORIES.map((cat) => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            </div>

                            {/* Filter by Album */}
                            <div className="space-y-1">
                              <label className="text-gray-400 uppercase tracking-widest font-semibold block">Attached Album</label>
                              <select
                                value={manageAlbumFilter}
                                onChange={(e) => setManageAlbumFilter(e.target.value)}
                                className="w-full bg-[#122340]/90 border border-white/10 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#E8921A] text-white"
                              >
                                <option value="All">All Albums</option>
                                <option value="none">No Album (General Featured)</option>
                                {albums.map((alb) => (
                                  <option key={alb.id} value={alb.id}>{alb.title}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Photos Body */}
                        {filteredPhotos.length === 0 ? (
                          <div className="text-center py-8 bg-[#122340]/20 rounded-lg border border-dashed border-white/10">
                            <ImageIcon className="mx-auto text-gray-600 mb-2" size={24} />
                            <p className="text-xs text-gray-500 font-sans">No photos match your filter queries.</p>
                            {(manageSearchQuery || manageCategoryFilter !== 'All' || manageAlbumFilter !== 'All') && (
                              <button
                                type="button"
                                onClick={() => {
                                  setManageSearchQuery('');
                                  setManageCategoryFilter('All');
                                  setManageAlbumFilter('All');
                                }}
                                className="mt-2 text-xs text-[#F5A623] hover:underline font-semibold"
                              >
                                Reset Filters
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-[38vh] overflow-y-auto pr-1">
                            {filteredPhotos.map((ph) => {
                              const associatedAlbum = albums.find(a => a.id === ph.albumId);
                              return (
                                <div key={ph.id} className="bg-[#122340]/60 border border-white/5 p-2 rounded-lg hover:bg-white/5 transition-all flex flex-col gap-2">
                                  {editingPhotoId === ph.id ? (
                                    <div className="space-y-4 p-1 text-xs">
                                      <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                                        <span className="text-[10px] font-bold text-[#F5A623] uppercase block">Editing Media Block</span>
                                        <span className="text-[9px] text-gray-500 font-mono">ID: {ph.id}</span>
                                      </div>
                                      
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="col-span-1">
                                          <label className="text-[9px] text-gray-400 uppercase font-sans font-bold block mb-1">Asset Title *</label>
                                          <input
                                            type="text"
                                            value={editPhotoTitle}
                                            onChange={(e) => setEditPhotoTitle(e.target.value)}
                                            className="w-full bg-[#0F1D35] px-2.5 py-1.5 border border-white/10 rounded-md text-xs focus:border-[#E8921A] text-white focus:outline-none"
                                          />
                                        </div>
                                        <div className="col-span-1">
                                          <label className="text-[9px] text-gray-400 uppercase font-sans font-bold block mb-1">Service Category</label>
                                          <select
                                            value={editPhotoCategory}
                                            onChange={(e) => setEditPhotoCategory(e.target.value)}
                                            className="w-full bg-[#0F1D35] px-2.5 py-1.5 border border-white/10 rounded-md text-xs focus:border-[#E8921A] text-white focus:outline-none"
                                          >
                                            {CATEGORIES.map((cat) => (
                                              <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                          </select>
                                        </div>
                                        <div className="col-span-1">
                                          <label className="text-[9px] text-gray-400 uppercase font-sans font-bold block mb-1">Assigned Album</label>
                                          <select
                                            value={editPhotoAlbumId}
                                            onChange={(e) => setEditPhotoAlbumId(e.target.value)}
                                            className="w-full bg-[#0F1D35] px-2.5 py-1.5 border border-white/10 rounded-md text-xs focus:border-[#E8921A] text-white focus:outline-none"
                                          >
                                            <option value="">— No Album (General Photo) —</option>
                                            {albums.map((alb) => (
                                              <option key={alb.id} value={alb.id}>{alb.title}</option>
                                            ))}
                                          </select>
                                        </div>
                                        <div className="col-span-1">
                                          <label className="text-[9px] text-gray-400 uppercase font-sans font-bold block mb-1">Replace Image (Optional)</label>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                              if (e.target.files && e.target.files[0]) {
                                                try {
                                                  setScanStatus('Applying corporate watermark...');
                                                  const b64 = await fileToBase64(e.target.files[0]);
                                                  const watermarked = await watermarkImage(b64);
                                                  setEditPhotoCoverBase64(watermarked);
                                                  setScanStatus('');
                                                } catch (err) {
                                                  setErrorMsg('Error reading replacement image file.');
                                                  setScanStatus('');
                                                }
                                              }
                                            }}
                                            className="w-full text-[10px] text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-semibold file:bg-[#0F1D35] file:text-white focus:outline-none"
                                          />
                                          {editPhotoCoverBase64 && (
                                            <span className="text-[9px] text-emerald-400 font-semibold block mt-1">✓ Preview Replacement Image Loaded</span>
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                                        <button
                                          type="button"
                                          onClick={() => setEditingPhotoId(null)}
                                          className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-xs text-gray-300 font-semibold"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => savePhotoEdit(ph.id)}
                                          className="px-3 py-1 rounded bg-[#E8921A] text-[#0F1D35] font-bold text-xs hover:bg-[#F5A623] transition-colors"
                                        >
                                          Save Updates
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-between w-full gap-3">
                                      <div className="flex items-center gap-3 truncate flex-1">
                                        {ph.url ? (
                                          <div className="relative w-12 h-9 rounded overflow-hidden flex-shrink-0 border border-white/10 bg-[#0F1D35]">
                                            <img
                                              src={ph.url}
                                              alt=""
                                              referrerPolicy="no-referrer"
                                              className="w-full h-full object-cover select-none"
                                            />
                                          </div>
                                        ) : (
                                          <div className="w-12 h-9 bg-white/5 border border-white/10 rounded flex items-center justify-center flex-shrink-0">
                                            <ImageIcon size={18} className="text-gray-500" />
                                          </div>
                                        )}
                                        <div className="truncate flex-1">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="font-semibold text-gray-200 text-xs block truncate" title={ph.title}>
                                              {ph.title}
                                            </span>
                                            <span className="text-[8px] tracking-wide bg-amber-400/10 border border-amber-400/20 text-[#F5A623] font-mono rounded px-1.5 uppercase leading-none py-0.5">
                                              #{ph.category}
                                            </span>
                                          </div>
                                          {associatedAlbum ? (
                                            <span className="text-[9px] text-gray-400 font-sans block truncate mt-0.5">
                                              📁 Album: {associatedAlbum.title}
                                            </span>
                                          ) : (
                                            <span className="text-[9px] text-gray-500 font-sans block mt-0.5">
                                              🌐 General Feature Pool
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-1.5 flex-shrink-0">
                                        <button
                                          type="button"
                                          onClick={() => startEditingPhoto(ph)}
                                          className="p-1 px-1.5 rounded bg-white/5 hover:bg-amber-400/20 text-amber-400 hover:text-amber-300 transition-all text-xs flex items-center gap-1"
                                          title="Edit details"
                                        >
                                          <Pencil size={11} />
                                          <span className="hidden sm:inline text-[9px] font-sans font-medium">Edit</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeletePhoto(ph.id)}
                                          className="p-1 px-1.5 rounded bg-white/5 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all text-xs flex items-center gap-1"
                                          title="Delete photo"
                                        >
                                          <Trash2 size={11} />
                                          <span className="hidden sm:inline text-[9px] font-sans font-medium">Delete</span>
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* SUB-PANEL 2: ALBUMS LISTING */}
                    {viewSubTab === 'albums' && (
                      <div className="space-y-4">
                        {albums.length === 0 ? (
                          <div className="text-center py-8 bg-[#122340]/20 rounded-lg border border-dashed border-white/10">
                            <FolderPlus className="mx-auto text-gray-600 mb-2" size={24} />
                            <p className="text-xs text-gray-500">No events custom albums declared yet.</p>
                            <button
                              type="button"
                              onClick={() => setActiveTab('albums')}
                              className="mt-2 text-xs text-[#F5A623] hover:underline font-semibold"
                            >
                              Create Album Now
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[38vh] overflow-y-auto pr-1">
                            {albums.map((alb) => (
                              <div key={alb.id} className="bg-[#122340]/60 border border-white/5 rounded-lg p-2.5 flex flex-col gap-2 col-span-1">
                                {editingAlbumId === alb.id ? (
                                  <div className="space-y-2 text-xs">
                                    <span className="text-[10px] font-bold text-[#F5A623] uppercase block">Edit Album details</span>
                                    <div className="space-y-1">
                                      <input
                                        type="text"
                                        value={editAlbumTitle}
                                        placeholder="Album Name"
                                        onChange={(e) => setEditAlbumTitle(e.target.value)}
                                        className="w-full bg-[#0F1D35] px-2 py-1.5 text-xs border border-white/10 rounded focus:border-[#E8921A] text-white focus:outline-none"
                                      />
                                      <input
                                        type="text"
                                        value={editAlbumTag}
                                        placeholder="Cover Tag / Subtitle"
                                        onChange={(e) => setEditAlbumTag(e.target.value)}
                                        className="w-full bg-[#0F1D35] px-2 py-1.5 text-xs border border-white/10 rounded focus:border-[#E8921A] text-white focus:outline-none"
                                      />
                                      <input
                                        type="date"
                                        value={editAlbumDate}
                                        onChange={(e) => setEditAlbumDate(e.target.value)}
                                        className="w-full bg-[#0F1D35] px-2 py-1.5 text-xs border border-white/10 rounded focus:border-[#E8921A] text-white focus:outline-none"
                                      />
                                      <textarea
                                        value={editAlbumDesc}
                                        placeholder="Brief description of structural features, sizing..."
                                        onChange={(e) => setEditAlbumDesc(e.target.value)}
                                        rows={2}
                                        className="w-full bg-[#0F1D35] px-2 py-1.5 text-xs border border-white/10 rounded focus:border-[#E8921A] text-white focus:outline-none"
                                      />
                                    </div>
                                    <div className="flex justify-end gap-1.5 pt-1.5">
                                      <button
                                        type="button"
                                        onClick={() => setEditingAlbumId(null)}
                                        className="px-2.5 py-0.5 rounded text-[10px] bg-white/5 text-gray-400 hover:text-white"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => saveAlbumEdit(alb.id)}
                                        className="px-2.5 py-0.5 rounded text-[10px] bg-[#E8921A] text-[#0F1D35] font-bold hover:bg-[#F5A623]"
                                      >
                                        Save Changes
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex justify-between items-start gap-2 h-full">
                                    <div className="truncate flex-1">
                                      <span className="text-[9px] text-[#F5A623] font-mono italic block">{alb.date}</span>
                                      <span className="text-xs font-semibold text-gray-200 block truncate" title={alb.title}>
                                        {alb.title}
                                      </span>
                                      <span className="text-[10px] font-sans text-gray-400 block truncate">
                                        {alb.tag}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 self-center flex-shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => startEditingAlbum(alb)}
                                        className="text-amber-400 hover:text-amber-300 p-1 rounded hover:bg-white/5 transition-colors"
                                        title="Edit album metadata"
                                      >
                                        <Pencil size={11} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteAlbum(alb.id)}
                                        className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-white/5 transition-colors"
                                        title="Delete event album"
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Sticky Actions Footer */}
            <div className="bg-[#122340] px-6 py-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400 font-mono">
              <span className="text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Autosaving changes locally
              </span>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Restore factory default photos & albums? This deletes all your custom uploads.")) {
                    localStorage.removeItem('joudcon_albums');
                    localStorage.removeItem('joudcon_photos');
                    window.location.reload();
                  }
                }}
                className="hover:text-[#F15050] text-[10px] underline uppercase transition-colors shrink-0"
                title="Wipe database and restore default Joudcon photos and templates"
              >
                Reset Default Database
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* System Status Metric Footer */}
      <footer className="shrink-0 bg-[#122340] px-6 py-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 font-mono mt-auto text-center sm:text-left select-none">
        <span className="text-emerald-400/80 flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Personnel Client Base Connected Securely
        </span>
        <span>Joudcon System v3.2.1 • AES-256 TLS Client Layer</span>
      </footer>
    </div>
  );
}
