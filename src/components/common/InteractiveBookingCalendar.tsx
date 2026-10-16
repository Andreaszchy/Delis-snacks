import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info, Check, AlertCircle, Ban } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface InteractiveBookingCalendarProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
  providerId?: string;
  showLegend?: boolean;
  className?: string;
  allowAdminSelectionOnFullDays?: boolean; // If true (e.g. in admin view), allows clicking red days to see/manage appointments
}

export const InteractiveBookingCalendar: React.FC<InteractiveBookingCalendarProps> = ({
  selectedDate,
  onSelectDate,
  providerId,
  showLegend = true,
  className = '',
  allowAdminSelectionOnFullDays = false,
}) => {
  const { getDayAvailabilityStatus, providers, theme } = useApp();
  const effectiveProviderId = providerId || (providers.length > 0 ? providers[0].id : undefined);

  // Initial view month based on selectedDate or today
  const [viewDate, setViewDate] = useState<Date>(() => {
    if (selectedDate) {
      const [y, m, d] = selectedDate.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date();
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  // First day of month and number of days
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);
  const totalDays = lastDayOfMonth.getDate();

  // Day of week for first day (0: Sunday, 1: Monday... Convert so Monday is 0)
  let startOffset = firstDayOfMonth.getDay() - 1;
  if (startOffset === -1) startOffset = 6; // Sunday becomes 6

  // Month navigation limits (from current month up to 3 months ahead)
  const minMonthDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const maxMonthDate = new Date(today.getFullYear(), today.getMonth() + 3, 1);

  const canGoPrev = viewDate > minMonthDate;
  const canGoNext = viewDate < maxMonthDate;

  const handlePrevMonth = () => {
    if (!canGoPrev) return;
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    if (!canGoNext) return;
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const handleGoToday = () => {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const status = getDayAvailabilityStatus(todayStr, effectiveProviderId);
    if (status.isAvailable || allowAdminSelectionOnFullDays) {
      onSelectDate(todayStr);
    }
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayHeaders = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Days array
  const dayCells = [];
  // Blank padding cells
  for (let i = 0; i < startOffset; i++) {
    dayCells.push(null);
  }
  // Days of current month
  for (let d = 1; d <= totalDays; d++) {
    dayCells.push(d);
  }

  // Selected date status info
  const selectedDateStatus = selectedDate ? getDayAvailabilityStatus(selectedDate, effectiveProviderId) : null;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden ${className}`}>
      {/* Calendar Header with Navigation */}
      <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 capitalize">
            {monthNames[viewMonth]} {viewYear}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleGoToday}
            className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors mr-1"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={!canGoPrev}
            className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-slate-700 transition-colors"
            title="Mes anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            disabled={!canGoNext}
            className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-slate-700 transition-colors"
            title="Mes siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/40 text-center py-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
        {dayHeaders.map((dh) => (
          <div key={dh}>{dh}</div>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 gap-1 p-2 bg-slate-50/20">
        {dayCells.map((dayNum, idx) => {
          if (dayNum === null) {
            return <div key={`empty-${idx}`} className="h-12 sm:h-14 rounded-xl" />;
          }

          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const isSelected = selectedDate === dateStr;
          const availability = getDayAvailabilityStatus(dateStr, effectiveProviderId);

          const { status, count, isAvailable } = availability;

          // Can this day be clicked?
          const isClickable = isAvailable || (allowAdminSelectionOnFullDays && status === 'red');

          // Style classes depending on status
          let colorClasses = '';
          let badgeText = '';
          let badgeClasses = '';

          if (status === 'green') {
            // Totalmente disponible (0 citas)
            colorClasses = isSelected
              ? 'bg-emerald-500 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500 ring-offset-1'
              : 'bg-emerald-50/90 text-emerald-950 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400 hover:shadow-xs';
            badgeText = '0/2';
            badgeClasses = isSelected ? 'bg-white/30 text-white' : 'bg-emerald-200/70 text-emerald-900';
          } else if (status === 'yellow') {
            // 1 cita agendada (Queda 1 cupo libre)
            colorClasses = isSelected
              ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-500 ring-offset-1'
              : 'bg-amber-50/90 text-amber-950 border-amber-300 hover:bg-amber-100 hover:border-amber-400 hover:shadow-xs';
            badgeText = '1/2';
            badgeClasses = isSelected ? 'bg-white/30 text-white' : 'bg-amber-200/80 text-amber-900';
          } else if (status === 'red') {
            // 2 citas agendadas (Lleno / No disponible)
            colorClasses = isSelected && allowAdminSelectionOnFullDays
              ? 'bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-500 ring-offset-1'
              : 'bg-rose-50/70 text-rose-500 border-rose-200 opacity-80 cursor-not-allowed';
            badgeText = '2/2 Lleno';
            badgeClasses = isSelected ? 'bg-white/30 text-white' : 'bg-rose-100 text-rose-700';
          } else {
            // Closed / Past / Blocked
            colorClasses = 'bg-slate-100/60 text-slate-400 border-transparent opacity-50 cursor-not-allowed';
            badgeText = '';
          }

          return (
            <button
              key={dateStr}
              type="button"
              disabled={!isClickable}
              onClick={() => {
                if (isClickable) {
                  onSelectDate(dateStr);
                }
              }}
              className={`h-12 sm:h-14 p-1 rounded-xl border flex flex-col justify-between items-center transition-all ${colorClasses}`}
              title={`${dateStr}: ${availability.message}`}
            >
              <div className="w-full flex items-center justify-between text-[11px] font-bold px-0.5">
                <span>{dayNum}</span>
                {status === 'green' && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                )}
                {status === 'yellow' && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-amber-500'}`} />
                )}
                {status === 'red' && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-rose-500'}`} />
                )}
              </div>

              {badgeText && (
                <span className={`text-[8.5px] sm:text-[9.5px] font-extrabold px-1 py-0.2 rounded-md ${badgeClasses} truncate max-w-full`}>
                  {badgeText}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Status Banner */}
      {selectedDate && selectedDateStatus && (
        <div className="px-3.5 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            {selectedDateStatus.status === 'green' && (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
            )}
            {selectedDateStatus.status === 'yellow' && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 animate-pulse" />
            )}
            {selectedDateStatus.status === 'red' && (
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
            )}
            {selectedDateStatus.status === 'closed' && (
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
            )}

            <div className="truncate">
              <span className="font-bold text-slate-900">{selectedDate}: </span>
              <span
                className={`font-semibold ${
                  selectedDateStatus.status === 'green'
                    ? 'text-emerald-700'
                    : selectedDateStatus.status === 'yellow'
                    ? 'text-amber-800'
                    : selectedDateStatus.status === 'red'
                    ? 'text-rose-600'
                    : 'text-slate-500'
                }`}
              >
                {selectedDateStatus.message}
              </span>
            </div>
          </div>

          <div className="shrink-0">
            {selectedDateStatus.status === 'green' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                2 cupos libres
              </span>
            )}
            {selectedDateStatus.status === 'yellow' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                1 cupo libre
              </span>
            )}
            {selectedDateStatus.status === 'red' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                Día lleno
              </span>
            )}
          </div>
        </div>
      )}

      {/* Color Code Legend */}
      {showLegend && (
        <div className="px-3.5 py-2.5 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="font-semibold text-slate-800">Verde:</span>
            <span>Totalmente disponible</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
            <span className="font-semibold text-slate-800">Amarillo:</span>
            <span>1 cita reservada (queda 1)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
            <span className="font-semibold text-slate-800">Rojo:</span>
            <span>2 citas (No disponible)</span>
          </div>
        </div>
      )}
    </div>
  );
};
