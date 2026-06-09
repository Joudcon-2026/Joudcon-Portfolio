import React, { useRef, useState, useEffect } from 'react';
import { PortfolioPhoto } from '../types';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowLeftRight, Columns, Info, Sparkles } from 'lucide-react';
import Logo from './Logo';

interface ScrollingGalleryProps {
  photos: PortfolioPhoto[];
  onPhotoClick: (photoIndex: number, list: PortfolioPhoto[]) => void;
}

export default function ScrollingGallery({ photos, onPhotoClick }: ScrollingGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter out any photos without images
  const validPhotos = photos.filter(p => p.url);

  // Fallback to presets if active data is light
  const displayPhotos = validPhotos.length >= 8 
    ? validPhotos 
    : [...validPhotos, ...validPhotos, ...validPhotos].slice(0, 12);

  // For Vertical Split Scroll:
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Split scrolling translations
  const yDown1 = useTransform(scrollYProgress, [0, 1], [-50, 150]);
  const yUp1 = useTransform(scrollYProgress, [0, 1], [150, -50]);
  const yDown2 = useTransform(scrollYProgress, [0, 1], [-100, 100]);

  // Split photos into columns
  const col1 = displayPhotos.filter((_, idx) => idx % 3 === 0);
  const col2 = displayPhotos.filter((_, idx) => idx % 3 === 1);
  const col3 = displayPhotos.filter((_, idx) => idx % 3 === 2);

  return (
    <section className="relative py-16 bg-[#0F1D35] overflow-hidden border-t border-b border-white/5" ref={containerRef} id="immersive-scroll-grid">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[300px] bg-[#E8921A]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-[#1E3A6A]/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#122340] border border-white/10 px-3 py-1 rounded-full text-[10px] uppercase font-semibold tracking-widest text-[#F5A623] mb-3">
              <Sparkles size={11} />
              Immersive Exhibition
            </div>
            <h3 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
              Dynamic <span className="text-[#F5A623]">Split Scrolling</span> Grid
            </h3>
            <p className="text-xs text-gray-400 max-w-lg mt-2 font-sans font-light">
              Experience our curation through interactive multi-directional columns sliding in opposing momentum speeds relative to your scroll position.
            </p>
          </div>
        </div>
      </div>

      {/* Grid Canvas Wrapper */}
      <div className="relative w-full overflow-hidden animate-fade-in" style={{ minHeight: '440px' }}>
        
        <div className="max-w-6xl mx-auto px-4 h-[600px] overflow-hidden rounded-xl bg-[#122340]/40 border border-white/5 relative flex gap-4 select-none">
          {/* Top-Bottom fading gradients shields */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#0F1D35] to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0F1D35] to-transparent z-10 pointer-events-none" />

          {/* Col 1 - Downwards translate */}
          <div className="flex-1 flex flex-col gap-4 py-8">
            <motion.div style={{ y: yDown1 }} className="flex flex-col gap-4">
              {col1.map((photo) => (
                <div
                  key={`col1-${photo.id}`}
                  onClick={() => onPhotoClick(photos.indexOf(photo), photos)}
                  className="relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer border border-white/5 group shadow-lg bg-[#0F1D35]"
                >
                  <img
                    src={photo.url}
                    alt={photo.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Subtle Joudcon Logo Watermark */}
                  <div className="absolute top-2 left-2 z-10 bg-[#0F1D35]/70 backdrop-blur-xs rounded-lg p-1 border border-white/5 opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Logo size={12} showText={false} />
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3.5 text-white">
                    <span className="text-[9px] uppercase tracking-wider text-[#F5A623] font-bold">{photo.category}</span>
                    <p className="font-display text-xs font-bold truncate">{photo.title}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Col 2 - Upwards translate */}
          <div className="flex-1 flex flex-col gap-4 py-8">
            <motion.div style={{ y: yUp1 }} className="flex flex-col gap-4">
              {col2.map((photo) => (
                <div
                  key={`col2-${photo.id}`}
                  onClick={() => onPhotoClick(photos.indexOf(photo), photos)}
                  className="relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer border border-white/5 group shadow-lg bg-[#0F1D35]"
                >
                  <img
                    src={photo.url}
                    alt={photo.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Subtle Joudcon Logo Watermark */}
                  <div className="absolute top-2 left-2 z-10 bg-[#0F1D35]/70 backdrop-blur-xs rounded-lg p-1 border border-white/5 opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Logo size={12} showText={false} />
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3.5 text-white">
                    <span className="text-[9px] uppercase tracking-wider text-[#F5A623] font-bold">{photo.category}</span>
                    <p className="font-display text-xs font-bold truncate">{photo.title}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Col 3 - Downwards offset 2 translate */}
          <div className="flex-1 hidden md:flex flex-col gap-4 py-8">
            <motion.div style={{ y: yDown2 }} className="flex flex-col gap-4">
              {col3.map((photo) => (
                <div
                  key={`col3-${photo.id}`}
                  onClick={() => onPhotoClick(photos.indexOf(photo), photos)}
                  className="relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer border border-white/5 group shadow-lg bg-[#0F1D35]"
                >
                  <img
                    src={photo.url}
                    alt={photo.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Subtle Joudcon Logo Watermark */}
                  <div className="absolute top-2 left-2 z-10 bg-[#0F1D35]/70 backdrop-blur-xs rounded-lg p-1 border border-white/5 opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Logo size={12} showText={false} />
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3.5 text-white">
                    <span className="text-[9px] uppercase tracking-wider text-[#F5A623] font-bold">{photo.category}</span>
                    <p className="font-display text-xs font-bold truncate">{photo.title}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Info panel explaining split mechanic */}
        <div className="mt-4 flex items-center gap-1.5 justify-center text-gray-400 text-[11px] font-sans">
          <Info size={11} className="text-[#F5A623]" />
          <span>Scroll up or down with your page momentum to see the vertical columns slide in counter-motion speeds.</span>
        </div>
      </div>
    </section>
  );
}
