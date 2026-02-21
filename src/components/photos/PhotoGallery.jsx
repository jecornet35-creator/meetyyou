import React from 'react';
import { X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PhotoGallery({ photos, mainPhoto, onRemove, onSetMain }) {
  if (!photos || photos.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-sm">
        <p className="text-lg">Aucune photo pour le moment</p>
        <p className="text-sm mt-1">Ajoutez votre première photo ci-dessus</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="font-semibold text-gray-800 mb-4">Galerie ({photos.length})</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {photos.map((url, i) => {
          const isMain = url === mainPhoto;
          return (
            <div key={i} className="relative group rounded-xl overflow-hidden aspect-square shadow-sm">
              <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />

              {isMain && (
                <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-white" />
                  Principale
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                {!isMain && (
                  <Button
                    size="sm"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white text-xs h-8"
                    onClick={() => onSetMain(url)}
                  >
                    <Star className="w-3 h-3 mr-1" />
                    Photo principale
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  className="w-full text-xs h-8"
                  onClick={() => onRemove(url)}
                >
                  <X className="w-3 h-3 mr-1" />
                  Supprimer
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}