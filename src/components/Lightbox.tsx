import React, { useState, useEffect, useCallback } from 'react';
import { PortfolioPhoto } from '../types';
import { ChevronLeft, ChevronRight, X, Play, Pause, Download, Image as ImageIcon } from 'lucide-react';
import Logo from './Logo';

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  photos: PortfolioPhoto[];
  initialPhotoIndex?: number;
  albumTitle?: string;
}

export default function Lightbox({
  isOpen,
  onClose,
  photos,
  initialPhotoIndex = 0,
  albumTitle
}: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialPhotoIndex);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialPhotoIndex);
    setIsPlaying(false);
  }, [initialPhotoIndex, isOpen]);

  const handleNext = useCallback(() => {
    if (photos.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  const handlePrev = useCallback(() => {
    if (photos.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  // Autoplay function
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && photos.length > 0) {
      timer = setInterval(() => {
        handleNext();
      }, 3000); // 3 seconds per slide
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, handleNext, photos.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];

  const handleDownload = () => {
    if (!currentPhoto) return;
    const link = document.createElement('a');
    link.href = currentPhoto.url;
    link.download = currentPhoto.title || `joudcon-photo-${currentIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-md animate-fade-in" id="lightbox-viewer">
      {/* Lightbox Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 text-white z-10 w-full bg-gradient-to-b from-black/80 to-transparent">
        <div>
          <span className="text-xs tracking-widest text-[#F5A623] uppercase font-semibold">
            {albumTitle ? `Album: ${albumTitle}` : 'Service Category / Assets'}
          </span>
          <h3 className="text-base font-medium text-gray-100 mt-1 font-sans">
            {currentPhoto?.title || `${albumTitle || 'Gallery'} Photo #${currentIndex + 1}`}
          </h3>
        </div>
        
        {/* Actions bar */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 text-gray-300 hover:text-[#F5A623] transition-colors rounded-full hover:bg-white/5"
            title={isPlaying ? "Pause Slideshow" : "Play Slideshow"}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          
          <button
            onClick={handleDownload}
            className="p-2 text-gray-300 hover:text-[#F5A623] transition-colors rounded-full hover:bg-white/5"
            title="Download Image"
          >
            <Download size={20} />
          </button>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-300 hover:text-red-400 transition-colors rounded-full hover:bg-white/5 ml-2"
            title="Close Viewer"
            id="close-lightbox-btn"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Main Container - Centered Image Display */}
      <div className="relative flex-1 flex items-center justify-center p-4">
        {/* Navigation Arrows */}
        {photos.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-10 p-3 text-white/70 hover:text-[#F5A623] hover:bg-white/10 rounded-full transition-all duration-200"
              id="prev-btn"
            >
              <ChevronLeft size={36} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-10 p-3 text-white/70 hover:text-[#F5A623] hover:bg-white/10 rounded-full transition-all duration-200"
              id="next-btn"
            >
              <ChevronRight size={36} />
            </button>
          </>
        )}

        {/* Central visual canvas */}
        <div className="relative max-w-5xl max-h-[75vh] flex flex-col items-center justify-center shadow-2xl rounded-lg overflow-hidden border border-white/5">
          {currentPhoto?.url ? (
            <div className="relative">
              <img
                src={currentPhoto.url}
                alt={currentPhoto.title || 'Event Media'}
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[75vh] object-contain transition-all duration-500 ease-in-out ease"
              />
              {/* Proportional watermarking label inside the interactive Lightbox */}
              <div className="absolute bottom-3 right-3 z-10 bg-[#0F1D35]/80 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-lg select-none pointer-events-none">
                <Logo size={16} showText={true} textColor="text-white animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="w-[600px] aspect-video bg-[#0F1D35] text-gray-400 flex flex-col items-center justify-center gap-2">
              <ImageIcon size={48} className="text-[#F5A623]" />
              <p className="font-display text-lg font-bold uppercase">{currentPhoto?.title || 'No Image File'}</p>
            </div>
          )}

          {/* Floating Tag */}
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm border border-white/10 text-white px-3 py-1 rounded text-xs">
            {currentPhoto?.category || 'General'}
          </div>
        </div>
      </div>

      {/* Bottom Thumbnail Bar & Slider Progress */}
      <div className="w-full bg-black/90 px-6 py-4 flex flex-col items-center border-t border-white/10">
        {/* Thumbnail slider */}
        {photos.length > 1 && (
          <div className="flex gap-2.5 overflow-x-auto max-w-full pb-2 no-scrollbar px-10">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsPlaying(false);
                }}
                className={`relative w-20 h-14 rounded-md overflow-hidden flex-shrink-0 transition-all border-2 ${
                  index === currentIndex
                    ? 'border-[#F5A623] scale-105 shadow-md shadow-[#F5A623]/25'
                    : 'border-transparent opacity-50 hover:opacity-80'
                }`}
              >
                {photo.url ? (
                  <img
                    src={photo.url}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#1e3a6a] text-xs text-white flex items-center justify-center">
                    {index + 1}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/10 hover:bg-transparent" />
              </button>
            ))}
          </div>
        )}

        {/* Playback progress & count indicator */}
        <div className="flex items-center gap-4 text-xs font-mono text-gray-400 mt-2">
          <span>{currentIndex + 1} / {photos.length}</span>
          {isPlaying && (
            <span className="flex items-center gap-1.5 text-[#F5A623]">
              <span className="w-2 h-2 rounded-full bg-[#F5A623] animate-pulse"></span>
              Autoplay Active
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
