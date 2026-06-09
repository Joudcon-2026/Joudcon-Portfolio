import React, { useState, useEffect } from 'react';
import { Album, PortfolioPhoto, CATEGORIES } from './types';
import { INITIAL_ALBUMS, INITIAL_PHOTOS } from './data';
import Logo from './components/Logo';
import Lightbox from './components/Lightbox';
import AdminPanel from './components/AdminPanel';
import ScrollingGallery from './components/ScrollingGallery';
import { getItem, setItem } from './lib/db';
import {
  Calendar,
  Image as ImageIcon,
  Compass,
  Lock,
  Plus,
  ArrowRight,
  Filter,
  Check,
  Sparkles,
  Info
} from 'lucide-react';

export default function App() {
  // Preloader State Setup
  const [isPreloaderActive, setIsPreloaderActive] = useState(true);
  const [preloaderOpacity, setPreloaderOpacity] = useState(1);

  // Albums & Photos Storage State
  const [albums, setAlbums] = useState<Album[]>([]);
  const [photos, setPhotos] = useState<PortfolioPhoto[]>([]);

  // Selected filter states
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  // Lightbox overlay controller
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPhotos, setLightboxPhotos] = useState<PortfolioPhoto[]>([]);
  const [lightboxInitialIndex, setLightboxInitialIndex] = useState(0);
  const [lightboxTitle, setLightboxTitle] = useState('');

  // Admin separate-page toggle and hash router integration
  const [adminOpen, setAdminOpen] = useState(false);

  useEffect(() => {
    const handleHashRouter = () => {
      if (window.location.hash === '#admin') {
        setAdminOpen(true);
      } else {
        setAdminOpen(false);
      }
    };
    handleHashRouter(); // Check on mount
    window.addEventListener('hashchange', handleHashRouter);
    return () => window.removeEventListener('hashchange', handleHashRouter);
  }, []);

  const openAdminPage = () => {
    window.location.hash = 'admin';
    setAdminOpen(true);
  };

  const closeAdminPage = () => {
    window.location.hash = '';
    setAdminOpen(false);
  };

  // Stats for the visual overview
  const [totalClientPhotos, setTotalClientPhotos] = useState(0);

  // Search input query
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Initial State Load with IndexedDB high-capacity storage and legacy localStorage migration
  useEffect(() => {
    async function loadPortfolioData() {
      try {
        // Look for values in high-capacity IndexedDB
        let storedAlbums = await getItem<Album[]>('joudcon_albums_db');
        let storedPhotos = await getItem<PortfolioPhoto[]>('joudcon_photos_db');

        // Migrate legacy localStorage if found to preserve user history and clear standard quota to prevent crashing
        const legacyAlbums = localStorage.getItem('joudcon_albums');
        const legacyPhotos = localStorage.getItem('joudcon_photos');

        if (legacyAlbums && !storedAlbums) {
          try {
            storedAlbums = JSON.parse(legacyAlbums);
            await setItem('joudcon_albums_db', storedAlbums);
          } catch (e) {
            console.error('Failed to parse legacy albums:', e);
          }
        }
        if (legacyPhotos && !storedPhotos) {
          try {
            storedPhotos = JSON.parse(legacyPhotos);
            await setItem('joudcon_photos_db', storedPhotos);
          } catch (e) {
            console.error('Failed to parse legacy photos:', e);
          }
        }

        // Safely remove legacy keys to free local storage quota
        if (legacyAlbums || legacyPhotos) {
          localStorage.removeItem('joudcon_albums');
          localStorage.removeItem('joudcon_photos');
          localStorage.removeItem('joudcon_photos_unwatermarked'); // clean up any old keys
        }

        const loadedAlbums = storedAlbums || INITIAL_ALBUMS;
        const loadedPhotos = storedPhotos || INITIAL_PHOTOS;

        // If newly loaded app with no data yet, seed initial values into IndexedDB to support complete features offline
        if (!storedAlbums) {
          await setItem('joudcon_albums_db', INITIAL_ALBUMS);
        }
        if (!storedPhotos) {
          await setItem('joudcon_photos_db', INITIAL_PHOTOS);
        }

        setAlbums(loadedAlbums);
        setPhotos(loadedPhotos);
        setTotalClientPhotos(loadedPhotos.length);
      } catch (error) {
        console.error('IndexedDB bootstrap load failed, falling back to preset catalogs:', error);
        setAlbums(INITIAL_ALBUMS);
        setPhotos(INITIAL_PHOTOS);
        setTotalClientPhotos(INITIAL_PHOTOS.length);
      }
    }

    loadPortfolioData();

    // Fade out preloader smoothly after 2.3 seconds
    const timer = setTimeout(() => {
      setPreloaderOpacity(0);
      const removeTimer = setTimeout(() => {
        setIsPreloaderActive(false);
      }, 700); // Wait for transition fade out to complete
      return () => clearTimeout(removeTimer);
    }, 2300);

    return () => clearTimeout(timer);
  }, []);

  // Update IndexedDB when albums/photos state is edited inside Admin Panel
  const handleDataChange = async (newAlbums: Album[], newPhotos: PortfolioPhoto[]) => {
    setAlbums(newAlbums);
    setPhotos(newPhotos);
    setTotalClientPhotos(newPhotos.length);
    try {
      await setItem('joudcon_albums_db', newAlbums);
      await setItem('joudcon_photos_db', newPhotos);
    } catch (err) {
      console.error('Storage update failure:', err);
    }
  };

  // Helper to open visual lightbox for a category or album
  const triggerAlbumLightbox = (album: Album) => {
    const albumPhotos = photos.filter((p) => p.albumId === album.id);
    if (albumPhotos.length === 0) {
      alert(`There are no uploaded photos yet inside "${album.title}". Add photos in the staff panel to view.`);
      return;
    }
    setLightboxPhotos(albumPhotos);
    setLightboxInitialIndex(0);
    setLightboxTitle(album.title);
    setLightboxOpen(true);
  };

  const triggerCategoryLightbox = (photoIndex: number, filteredList: PortfolioPhoto[]) => {
    setLightboxPhotos(filteredList);
    setLightboxInitialIndex(photoIndex);
    setLightboxTitle(activeCategory === 'All' ? 'Complete Event Gallery' : `Asset Category: ${activeCategory}`);
    setLightboxOpen(true);
  };

  // Filters photos list based on Category tag and search string
  const filteredPhotos = photos.filter((p) => {
    const matchesCategory = activeCategory === 'All' || p.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = searchQuery
      ? p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  if (adminOpen) {
    return (
      <AdminPanel
        isOpen={adminOpen}
        onClose={closeAdminPage}
        albums={albums}
        photos={photos}
        onDataChange={handleDataChange}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#F8F6F2] text-[#1E3A6A] selection:bg-[#E8921A] selection:text-white" id="applet-viewport">
      
      {/* ─── 1. PRELOADER OVERLAY (Smooth CSS transitions) ─── */}
      {isPreloaderActive && (
        <div
          style={{ opacity: preloaderOpacity }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0F1D35] transition-opacity duration-700 pointer-events-none"
          id="global-preloader"
        >
          <div className="flex flex-col items-center gap-6">
            {/* Custom vector logo pulsing element */}
            <div className="w-32 h-32 flex items-center justify-center bg-[#122340] rounded-full border border-white/5 shadow-inner scale-100 animate-pulse">
              <Logo size={80} showText={false} />
            </div>

            {/* Typography slogan representation */}
            <div className="text-center animate-fade-in">
              <h1 className="font-display tracking-[0.22em] text-3xl font-extrabold text-white uppercase select-none">
                JOUD<span className="text-[#F5A623]">CON</span>
              </h1>
              <p className="text-[0.65rem] tracking-[0.45em] uppercase text-gray-400 font-semibold mt-1">
                Event Portfolio
              </p>
            </div>

            <div className="w-48 h-[1px] bg-white/10 relative overflow-hidden mt-4 rounded-full">
              <div className="absolute top-0 left-0 bg-[#E8921A] h-full w-24 animate-shimmer" />
            </div>

            <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mt-2 select-none">
              Welcome to our Portfolio
            </p>
          </div>
        </div>
      )}

      {/* ─── STICKY HEADER ─── */}
      <header className="sticky top-0 z-40 bg-[#0F1D35] border-b-2 border-[#E8921A] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Logo size={42} showText={true} />

          {/* User profile action indicators and unlinked Staff trigger */}
          <div className="flex items-center gap-4">
            <button
              onClick={openAdminPage}
              className="group flex items-center gap-2 bg-[#122340] border border-white/5 hover:border-[#E8921A] text-white py-1.5 px-3.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 shadow-md"
              id="header-admin-btn"
            >
              <Lock size={12} className="text-[#F5A623] group-hover:rotate-12 transition-transform" />
              <span>Staff Login</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── MAIN HERO ZONE ─── */}
      <div className="relative bg-[#0F1D35] text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-white/5" id="hero-banner">
        {/* Decorative background grids */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e3a6a_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E8921A]/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 bg-[#122340] border border-white/10 px-3 py-1 rounded-full text-[10px] uppercase font-semibold tracking-widest text-[#F5A623]">
            <Sparkles size={11} />
            Professional Fabrication & Delivery
          </div>

          <h2 className="font-display text-4xl sm:text-6xl font-black uppercase tracking-tight leading-none text-white max-w-4xl">
            Where Event <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5A623] to-[#E8921A]">Vision</span> Meets Structural Perfection
          </h2>

          <p className="text-sm sm:text-lg text-gray-400 font-sans max-w-2xl font-light">
            Discover Joudcon&apos;s award-winning event installations. Swipe through high-fidelity stages, exhibition booths, luxury tents, and precision branding capabilities.
          </p>

          <div className="flex gap-4 items-center justify-center text-xs mt-2 text-gray-500 font-mono">
            <span className="flex items-center gap-1.5"><Check size={12} className="text-[#E8921A]" /> {albums.length} Main Projects</span>
            <span className="text-white/10">•</span>
            <span className="flex items-center gap-1.5"><Check size={12} className="text-[#E8921A]" /> {photos.length} High-Res Medias</span>
          </div>
        </div>
      </div>

      {/* ─── Immersive Multi-Directional & Split Scrolling Gallery ─── */}
      <ScrollingGallery
        photos={photos}
        onPhotoClick={triggerCategoryLightbox}
      />

      {/* ─── 2. FEATURED ALBUMS (Phase 1, Requirement 2) ─── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14" id="portfolio-main-grid">
        <section className="mb-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] font-extrabold text-[#E8921A] block mb-2 font-display">
                Curated Events
              </span>
              <h3 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#1E3A6A]">
                Featured Event Albums
              </h3>
            </div>
            <p className="text-xs text-gray-500 max-w-sm sm:text-right">
              Click any featured card below to open its dedicated full-screen high-resolution slideshow and scroll through the asset files.
            </p>
          </div>

          {/* Albums Responsive Grid (Phase 1, Req 2) */}
          {albums.length === 0 ? (
            <div className="bg-white/50 border border-gray-200/60 rounded-xl p-10 text-center text-gray-500">
              <ImageIcon className="mx-auto w-10 h-10 text-gray-400 mb-2" />
              <p className="font-semibold">No featured albums published yet.</p>
              <p className="text-xs text-gray-400">Click Staff Panel to create your first event album.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="album-cards-container">
              {albums.map((album) => {
                const albumPicCount = photos.filter((p) => p.albumId === album.id).length;
                const latestPhoto = photos.find((p) => p.albumId === album.id);
                const displayCoverUrl = latestPhoto?.url || album.coverUrl;
                return (
                  <div
                    key={album.id}
                    onClick={() => triggerAlbumLightbox(album)}
                    className="group relative bg-[#0F1D35] rounded-xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
                  >
                    {/* Visual Media Wrapper */}
                    <div className="aspect-[4/3] bg-gray-900 overflow-hidden relative">
                      {displayCoverUrl ? (
                        <img
                          src={displayCoverUrl}
                          alt={album.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#E8921A] font-display font-bold text-4xl">
                          {album.title.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      
                      {/* Gradient Ambient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0F1D35] via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Meta info block */}
                    <div className="p-5 flex flex-col gap-1.5 relative z-10 text-white select-none">
                      <div className="flex items-center justify-between text-[10px] font-mono tracking-wider uppercase text-[#F5A623]">
                        <span>{album.tag}</span>
                        <span className="flex items-center gap-1 font-sans text-gray-400">
                          <Calendar size={10} /> {album.date}
                        </span>
                      </div>
                      
                      <h4 className="font-display text-lg font-bold group-hover:text-[#F5A623] transition-colors leading-tight truncate">
                        {album.title}
                      </h4>

                      <p className="text-xs text-gray-400 line-clamp-2 h-8 leading-relaxed font-light mt-0.5">
                        {album.description}
                      </p>

                      <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-2 text-[11px] text-gray-400 font-sans">
                        <span>{albumPicCount} Loaded Assets</span>
                        <span className="flex items-center gap-1 text-[#F5A623] group-hover:translate-x-1 transition-transform">
                          View Slideshow <ArrowRight size={10} />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ─── 3. CATEGORIZED EVENT ITEMS (Phase 1, Requirement 3) ─── */}
        <section id="assets-grid-section">
          <hr className="border-gray-200/80 mb-14" />

          {/* Grid Heading with Search capability */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] font-extrabold text-[#E8921A] block mb-2 font-display">
                Capabilities Catalogue
              </span>
              <h3 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#1E3A6A]">
                Event Portfolio Elements
              </h3>
              <p className="text-xs text-gray-400 max-w-md mt-1 font-sans">
                Browse individual asset layouts matching specific execution parameters like Photo Booths, Backdrops, stage designs, tents, and AV displays.
              </p>
            </div>

            {/* Live Portfolio Filter Search Bar */}
            <div className="w-full md:w-80 flex items-center bg-white border border-gray-200/70 rounded-full px-3 py-1.5 shadow-sm">
              <input
                type="text"
                placeholder="Search portfolio items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-transparent outline-none border-none py-1 text-[#1E3A6A]"
              />
              <span className="text-gray-400 text-xs font-mono select-none pointer-events-none">🔍</span>
            </div>
          </div>

          {/* Categories Horizontal Filter selector (Phase 1, Req 3) */}
          <div className="w-full mb-8" id="category-filter-bar">
            <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-[#E8921A] mb-3">
              <Filter size={10} /> Group portfolio assets by tag:
            </span>
            <div className="flex gap-2 overflow-x-auto pb-3 scroll-smooth no-scrollbar select-none">
              <button
                onClick={() => setActiveCategory('All')}
                className={`py-1.5 px-4 rounded-full text-xs font-medium uppercase tracking-wider transition-all border shrink-0 ${
                  activeCategory === 'All'
                    ? 'bg-[#1E3A6A] text-white border-[#1E3A6A] shadow-md shadow-[#1e3a6a]/15'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-[#1E3A6A] hover:text-[#1E3A6A]'
                }`}
              >
                All Capabilities
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`py-1.5 px-4 rounded-full text-xs font-medium uppercase tracking-wider transition-all border shrink-0 ${
                    activeCategory === cat
                      ? 'bg-[#1E3A6A] text-white border-[#1E3A6A] shadow-md shadow-[#1e3a6a]/15'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-[#1E3A6A] hover:text-[#1E3A6A]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Photo Grid Loader */}
          {filteredPhotos.length === 0 ? (
            <div className="bg-white/50 border border-gray-100 rounded-xl py-16 px-4 text-center">
              <ImageIcon className="mx-auto w-10 h-10 text-gray-300 mb-2" />
              <p className="font-sans font-semibold text-[#1E3A6A]">No matching assets in this category.</p>
              <p className="text-xs text-gray-400 mt-0.5">We are currently organizing more photos. Add assets using Staff Panel!</p>
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="bg-[#1E3A6A]/10 text-xs px-3 py-1.5 rounded-full mt-3 font-semibold text-[#1E3A6A]">
                  Clear Search Filter
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" id="photos-grid-view">
              {filteredPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  onClick={() => triggerCategoryLightbox(index, filteredPhotos)}
                  className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer shadow-md border border-gray-200/40 bg-white"
                >
                  {/* Image render */}
                  {photo.url ? (
                    <>
                      <img
                        src={photo.url}
                        alt={photo.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 ease group-hover:scale-105"
                      />
                      {/* Subtly watermarked branding badge */}
                      <div className="absolute top-2 left-2 z-10 bg-[#0F1D35]/70 backdrop-blur-xs rounded-lg p-1 border border-white/5 shadow shadow-black/30 flex items-center justify-center opacity-85 group-hover:opacity-100 transition-opacity">
                        <Logo size={14} showText={false} />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-slate-900 text-white flex items-center justify-center font-display uppercase font-bold text-center p-3 text-xs leading-tight">
                      {photo.title}
                    </div>
                  )}

                  {/* Gradient Light Hover State Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3.5 z-10 text-white select-none">
                    <span className="text-[8px] uppercase tracking-widest text-[#F5A623] font-bold block mb-0.5">
                      {photo.category}
                    </span>
                    <h5 className="font-display text-[11px] font-bold truncate">
                      {photo.title}
                    </h5>
                  </div>

                  {/* Top-Right Expand Indicator Overlay */}
                  <div className="absolute top-2.5 right-2.5 z-10 w-6 h-6 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center transform scale-75 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Plus size={12} className="text-[#F5A623]" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ─── FOOTER & SECURITY DOOR TRIGGER ─── */}
      <footer className="bg-[#0F1D35] text-[#F8F6F2] py-14 border-t-2 border-[#E8921A] select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-6">
          <Logo size={46} showText={true} textColor="text-white" />

          {/* Quick legal checklist & system version references */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-xs text-gray-500 font-sans mt-2">
            <span>Riyadh, Saudi Arabia</span>
            <span className="hidden sm:inline text-white/10">•</span>
            <span>Premium Event Logistics & Manufacture</span>
            <span className="hidden sm:inline text-white/10">•</span>
            {/* Locked administrative secret doorway trigger */}
            <button
              onClick={openAdminPage}
              className="hover:text-[#F5A623] flex items-center gap-1 cursor-pointer transition-colors"
              title="Secured Admin Portal Doorway"
            >
              <Lock size={10} className="text-[#F5A623]" /> Staff Portal
            </button>
          </div>

          <div className="w-full max-w-sm h-[1px] bg-white/5 rounded-full my-1" />

          <p className="text-[10px] text-gray-500 font-mono tracking-wide text-center uppercase">
            © 2026 Joudcon Events. All Rights Reserved.
          </p>
        </div>
      </footer>

      {/* ─── 4. FULL SCREEN SLIDESHOW LIGHTBOX ─── */}
      <Lightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        photos={lightboxPhotos}
        initialPhotoIndex={lightboxInitialIndex}
        albumTitle={lightboxTitle}
      />
    </div>
  );
}
