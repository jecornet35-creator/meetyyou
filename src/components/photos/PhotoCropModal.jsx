import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, ZoomIn, ZoomOut, RotateCcw, Check } from 'lucide-react';

export default function PhotoCropModal({ src, onDone, onCancel }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgLoaded, setImgLoaded] = useState(false);

  const SIZE = 420; // canvas/preview size (square crop)

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imgLoaded) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, SIZE, SIZE);

    ctx.save();
    ctx.translate(SIZE / 2 + offset.x, SIZE / 2 + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    const aspect = img.naturalWidth / img.naturalHeight;
    let drawW, drawH;
    if (aspect >= 1) {
      drawH = SIZE;
      drawW = SIZE * aspect;
    } else {
      drawW = SIZE;
      drawH = SIZE / aspect;
    }
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // Dim outside circle
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Circle border
    ctx.save();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }, [zoom, rotation, offset, imgLoaded]);

  useEffect(() => { draw(); }, [draw]);

  const handleMouseDown = (e) => {
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };
  const handleMouseMove = (e) => {
    if (!dragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setDragging(false);

  const handleTouchStart = (e) => {
    const t = e.touches[0];
    setDragging(true);
    setDragStart({ x: t.clientX - offset.x, y: t.clientY - offset.y });
  };
  const handleTouchMove = (e) => {
    if (!dragging) return;
    const t = e.touches[0];
    setOffset({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y });
  };

  const handleCrop = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    // Render clean (no dim) to output canvas
    const out = document.createElement('canvas');
    out.width = 600;
    out.height = 600;
    const ctx = out.getContext('2d');
    const scale = 600 / SIZE;

    ctx.translate(300 + offset.x * scale, 300 + offset.y * scale);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom * scale, zoom * scale);

    const aspect = img.naturalWidth / img.naturalHeight;
    let drawW, drawH;
    if (aspect >= 1) { drawH = SIZE; drawW = SIZE * aspect; }
    else { drawW = SIZE; drawH = SIZE / aspect; }
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

    out.toBlob((blob) => onDone(blob), 'image/jpeg', 0.92);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-bold text-gray-800 text-lg">Recadrer la photo</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex flex-col items-center gap-4 bg-gray-900">
          {/* Hidden img for drawing */}
          <img
            ref={imgRef}
            src={src}
            crossOrigin="anonymous"
            onLoad={() => setImgLoaded(true)}
            className="hidden"
            alt="source"
          />

          <canvas
            ref={canvasRef}
            width={SIZE}
            height={SIZE}
            className="rounded-full cursor-grab active:cursor-grabbing max-w-full"
            style={{ maxWidth: '100%', height: 'auto' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          />

          <p className="text-gray-400 text-xs">Glissez pour repositionner</p>
        </div>

        {/* Controls */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <ZoomOut className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="range" min="0.5" max="3" step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-amber-500"
            />
            <ZoomIn className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </div>

          <div className="flex items-center gap-3">
            <RotateCcw className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="range" min="-180" max="180" step="1"
              value={rotation}
              onChange={(e) => setRotation(parseFloat(e.target.value))}
              className="flex-1 accent-amber-500"
            />
            <span className="text-xs text-gray-500 w-10 text-right">{rotation}°</span>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onCancel}>
              Annuler
            </Button>
            <Button className="flex-1 bg-amber-500 hover:bg-amber-600 gap-2" onClick={handleCrop}>
              <Check className="w-4 h-4" />
              Valider
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}