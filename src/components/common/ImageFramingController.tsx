import React from 'react';
import { ZoomIn, ZoomOut, Maximize2, Move, RotateCcw, Check, Sparkles } from 'lucide-react';
import { normalizeDriveOrDirectUrl } from '../../utils/googleDrive';

export interface ImageFramingProps {
  imageUrl: string;
  fit?: 'cover' | 'contain';
  zoom?: number; // 100 to 200
  position?: string; // 'center', 'top', 'bottom', 'left', 'right'
  onChange: (updates: { fit: 'cover' | 'contain'; zoom: number; position: string }) => void;
  aspectRatio?: '4/3' | '16/10';
  label?: string;
}

export const ImageFramingController: React.FC<ImageFramingProps> = ({
  imageUrl,
  fit = 'cover',
  zoom = 100,
  position = 'center',
  onChange,
  aspectRatio = '4/3',
  label = 'Ajuste, Zoom y Encuadre de la Foto',
}) => {
  if (!imageUrl || !imageUrl.trim()) return null;

  const currentFit = fit || 'cover';
  const currentZoom = typeof zoom === 'number' && !isNaN(zoom) ? Math.min(200, Math.max(100, zoom)) : 100;
  const currentPosition = position || 'center';

  const normalized = normalizeDriveOrDirectUrl(imageUrl).normalizedUrl;

  const handleFitChange = (newFit: 'cover' | 'contain') => {
    onChange({ fit: newFit, zoom: currentZoom, position: currentPosition });
  };

  const handleZoomChange = (newZoom: number) => {
    const clamped = Math.min(200, Math.max(100, Math.round(newZoom)));
    onChange({ fit: currentFit, zoom: clamped, position: currentPosition });
  };

  const handlePositionChange = (newPos: string) => {
    onChange({ fit: currentFit, zoom: currentZoom, position: newPos });
  };

  const handleReset = () => {
    onChange({ fit: 'cover', zoom: 100, position: 'center' });
  };

  const positions: { id: string; label: string }[] = [
    { id: 'center', label: 'Centro' },
    { id: 'top', label: 'Arriba' },
    { id: 'bottom', label: 'Abajo' },
    { id: 'left', label: 'Izquierda' },
    { id: 'right', label: 'Derecha' },
  ];

  return (
    <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Maximize2 className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            {label}
          </span>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-[11px] text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 transition-colors"
          title="Restablecer encuadre original (Llenar marco, 100% zoom, centro)"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Restablecer</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Interactive Live Card Preview */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="text-[11px] font-semibold text-slate-500 mb-1.5 self-start flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Vista previa exacta para el cliente:</span>
          </div>

          <div
            className={`relative w-full ${
              aspectRatio === '16/10' ? 'aspect-[16/10]' : 'aspect-[4/3]'
            } rounded-xl overflow-hidden border-2 border-slate-300 shadow-sm transition-colors ${
              currentFit === 'contain' ? 'bg-slate-100' : 'bg-slate-900'
            } flex items-center justify-center`}
          >
            {normalized ? (
              <img
                src={normalized}
                alt="Encuadre en vivo"
                className={`w-full h-full ${
                  currentFit === 'contain' ? 'object-contain p-1.5' : 'object-cover'
                } transition-transform duration-200 select-none pointer-events-none`}
                style={{
                  transform: `scale(${currentZoom / 100})`,
                  objectPosition: currentPosition,
                }}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="text-slate-400 text-xs">Sin imagen</div>
            )}

            {/* Badge overlay on preview */}
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono shadow-xs flex items-center gap-1.5">
              <span>{currentFit === 'cover' ? 'Cover' : 'Contain'}</span>
              <span>•</span>
              <span className="text-amber-300 font-bold">{currentZoom}%</span>
              <span>•</span>
              <span className="capitalize">{currentPosition}</span>
            </div>
          </div>
        </div>

        {/* Controls Column */}
        <div className="md:col-span-7 space-y-3.5">
          {/* Mode Selector */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
              Modo de Ajuste
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFitChange('cover')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  currentFit === 'cover'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {currentFit === 'cover' && <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />}
                <span>Llenar marco (Cover)</span>
              </button>

              <button
                type="button"
                onClick={() => handleFitChange('contain')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  currentFit === 'contain'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {currentFit === 'contain' && <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />}
                <span>Foto completa (Contain)</span>
              </button>
            </div>
          </div>

          {/* Zoom Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <ZoomIn className="w-3.5 h-3.5 text-indigo-600" />
                <span>Nivel de Zoom</span>
              </label>
              <div className="flex items-center gap-1">
                <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {currentZoom}%
                </span>
                {currentZoom !== 100 && (
                  <button
                    type="button"
                    onClick={() => handleZoomChange(100)}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold px-1.5 py-0.5 rounded hover:bg-indigo-50"
                  >
                    100%
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleZoomChange(currentZoom - 5)}
                disabled={currentZoom <= 100}
                className="w-7 h-7 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center text-slate-700 shrink-0"
                title="Alejar (-5%)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <input
                type="range"
                min="100"
                max="200"
                step="5"
                value={currentZoom}
                onChange={(e) => handleZoomChange(Number(e.target.value))}
                className="w-full accent-slate-900 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />

              <button
                type="button"
                onClick={() => handleZoomChange(currentZoom + 5)}
                disabled={currentZoom >= 200}
                className="w-7 h-7 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center text-slate-700 shrink-0"
                title="Acercar (+5%)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Focal Point / Alignment */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
              <Move className="w-3.5 h-3.5 text-indigo-600" />
              <span>Enfoque / Posición</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {positions.map((pos) => {
                const isSelected = currentPosition === pos.id;
                return (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => handlePositionChange(pos.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {pos.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
