import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Trash2,
  Users,
  CalendarDays,
  Shield,
  Phone,
  User,
  Scissors,
  Pencil,
  Save,
  MessageCircle,
  Search,
  Sliders,
} from 'lucide-react';
import { AppointmentStatus, DaySchedule, ScheduleException, Provider, Appointment } from '../../types';
import { GoogleDriveInput } from '../common/GoogleDriveInput';

export const AdminSchedule: React.FC = () => {
  const {
    appointments,
    updateAppointmentStatus,
    deleteAppointment,
    markTransferReceiptReceived,
    providers,
    addProvider,
    updateProvider,
    deleteProvider,
    weeklySchedule,
    updateDaySchedule,
    updateProviderWeeklySchedule,
    exceptions,
    addException,
    deleteException,
    businessProfile,
    theme,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'citas' | 'horario' | 'excepciones' | 'proveedores'>('citas');
  const [statusFilter, setStatusFilter] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected provider for schedule configuration
  const [selectedScheduleProviderId, setSelectedScheduleProviderId] = useState<string>(
    providers.length > 0 ? providers[0].id : 'prov-1'
  );

  // Exception form state
  const [excDate, setExcDate] = useState('');
  const [excType, setExcType] = useState<'bloqueo_total' | 'horario_especial'>('bloqueo_total');
  const [excStart, setExcStart] = useState('09:00');
  const [excEnd, setExcEnd] = useState('14:00');
  const [excReason, setExcReason] = useState('');
  const [excProviderId, setExcProviderId] = useState('all');

  // Provider form state
  const [editingProviderId, setEditingProviderId] = useState<string | null>(null);
  const [newProvName, setNewProvName] = useState('');
  const [newProvRole, setNewProvRole] = useState('');
  const [newProvAvatar, setNewProvAvatar] = useState('');

  const activeScheduleProvider = providers.find((p) => p.id === selectedScheduleProviderId) || providers[0];
  const currentProviderSchedule = activeScheduleProvider?.weeklySchedule || weeklySchedule;

  const uniqueAppointments = Array.from(new Map(appointments.map((a) => [a.id, a])).values());
  const filteredAppointments = uniqueAppointments.filter((app) => {
    if (statusFilter !== 'todas' && app.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = app.customerName.toLowerCase().includes(q);
      const matchNumber = app.appointmentNumber.toLowerCase().includes(q);
      const matchService = app.serviceName.toLowerCase().includes(q);
      const matchPhone = app.customerPhone.toLowerCase().includes(q);
      return matchName || matchNumber || matchService || matchPhone;
    }
    return true;
  });

  const generateWhatsAppLink = (app: Appointment) => {
    const optionsText =
      app.selectedOptions && app.selectedOptions.length > 0
        ? `\nPersonalizaciones:\n` +
          app.selectedOptions
            .map(
              (o) =>
                `• ${o.groupTitle}: ${o.optionName}${
                  o.priceDelta > 0 ? ` (+${businessProfile.currency}${o.priceDelta})` : ''
                }`
            )
            .join('\n')
        : '';
    const nightText =
      app.nightSurcharge && app.nightSurcharge > 0
        ? `\n🌙 Cargo nocturno: +${businessProfile.currency}${app.nightSurcharge}`
        : '';

    const text = encodeURIComponent(
      `¡Hola ${app.customerName}! Te escribimos de *${businessProfile.name || 'Delis Snacks'}* respecto a tu cita/evento *#${app.appointmentNumber}*.\n` +
      `Servicio: *${app.serviceName}* con ${app.providerName}.\n` +
      `Fecha: ${new Date(app.startTimeUtc).toLocaleDateString('es-ES')} a las ${new Date(app.startTimeUtc).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} hrs.\n` +
      optionsText +
      nightText +
      `\nEstado: *${app.status.toUpperCase()}*.\n` +
      `Total: ${businessProfile.currency}${app.totalPrice || 0}.\n` +
      `¡Te esperamos con gusto!`
    );
    const cleanPhone = app.customerPhone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${text}`;
  };

  const handleCreateException = (e: React.FormEvent) => {
    e.preventDefault();
    if (!excDate || !excReason) return;
    addException({
      date: excDate,
      type: excType,
      startTime: excType === 'horario_especial' ? excStart : undefined,
      endTime: excType === 'horario_especial' ? excEnd : undefined,
      reason: excReason,
      providerId: excProviderId,
    });
    setExcDate('');
    setExcReason('');
  };

  const handleSaveProvider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProvName) return;
    const finalAvatar = newProvAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
    if (editingProviderId) {
      updateProvider(editingProviderId, {
        name: newProvName,
        role: newProvRole || 'Especialista',
        avatarUrl: finalAvatar,
      });
      setEditingProviderId(null);
    } else {
      addProvider({
        name: newProvName,
        role: newProvRole || 'Especialista',
        active: true,
        avatarUrl: finalAvatar,
      });
    }
    setNewProvName('');
    setNewProvRole('');
    setNewProvAvatar('');
  };

  const handleStartEditProvider = (prov: Provider) => {
    setEditingProviderId(prov.id);
    setNewProvName(prov.name);
    setNewProvRole(prov.role);
    setNewProvAvatar(prov.avatarUrl || '');
  };

  const handleCancelEditProvider = () => {
    setEditingProviderId(null);
    setNewProvName('');
    setNewProvRole('');
    setNewProvAvatar('');
  };

  const handleUpdateProviderDay = (daySchedule: DaySchedule) => {
    const updated = currentProviderSchedule.map((s) => (s.dayOfWeek === daySchedule.dayOfWeek ? daySchedule : s));
    updateProviderWeeklySchedule(activeScheduleProvider.id, updated);
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmada
          </span>
        );
      case 'pendiente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5" /> Pendiente (Mismo Día)
          </span>
        );
      case 'completada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completada
          </span>
        );
      case 'cancelada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Cancelada
          </span>
        );
    }
  };

  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-rose-500" /> Gestión de Agenda
          </h2>

        </div>

        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl text-xs sm:text-sm font-medium gap-1 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('citas')}
            className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl transition-all text-center whitespace-nowrap ${
              activeSubTab === 'citas' ? `${theme.buttonClass} shadow-sm font-bold` : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-medium'
            }`}
          >
            Citas & Eventos ({uniqueAppointments.length})
          </button>
          <button
            onClick={() => setActiveSubTab('horario')}
            className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl transition-all text-center whitespace-nowrap ${
              activeSubTab === 'horario' ? `${theme.buttonClass} shadow-sm font-bold` : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-medium'
            }`}
          >
            Horario Semanal
          </button>
          <button
            onClick={() => setActiveSubTab('excepciones')}
            className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl transition-all text-center whitespace-nowrap ${
              activeSubTab === 'excepciones' ? `${theme.buttonClass} shadow-sm font-bold` : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-medium'
            }`}
          >
            Bloqueos ({exceptions.length})
          </button>
          <button
            onClick={() => setActiveSubTab('proveedores')}
            className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl transition-all text-center whitespace-nowrap ${
              activeSubTab === 'proveedores' ? `${theme.buttonClass} shadow-sm font-bold` : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-medium'
            }`}
          >
            Personal ({providers.length})
          </button>
        </div>
      </div>

      {/* SUBTAB 0: GESTIÓN DE CITAS Y EVENTOS RESERVADOS */}
      {activeSubTab === 'citas' && (
        <div className="space-y-6">
          {/* Summary Metric Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Reservas</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900">{uniqueAppointments.length}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">Por Confirmar</span>
              <span className="text-xl sm:text-2xl font-black text-amber-600">
                {uniqueAppointments.filter((a) => a.status === 'pendiente').length}
              </span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Confirmadas</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-600">
                {uniqueAppointments.filter((a) => a.status === 'confirmada').length}
              </span>
            </div>
            <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-200 shadow-2xs">
              <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider block flex items-center gap-1">
                <span>🌙</span> Horario Nocturno
              </span>
              <span className="text-xl sm:text-2xl font-black text-indigo-950">
                {uniqueAppointments.filter((a) => (a.nightSurcharge || 0) > 0).length}
              </span>
            </div>
          </div>

          {/* Filter Bar & Search */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {[
                { id: 'todas', label: 'Todas' },
                { id: 'pendiente', label: 'Pendientes' },
                { id: 'confirmada', label: 'Confirmadas' },
                { id: 'completada', label: 'Completadas' },
                { id: 'cancelada', label: 'Canceladas' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    statusFilter === f.id
                      ? `${theme.buttonClass} shadow-2xs`
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar cliente, cita, servicio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>
          </div>

          {/* Appointments Grid */}
          {filteredAppointments.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center space-y-3">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700 text-base">No hay citas registradas en este filtro.</p>
              <p className="text-xs text-slate-400">Las citas y eventos agendados por los clientes aparecerán aquí automáticamente.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredAppointments.map((app, index) => {
                const startDate = new Date(app.startTimeUtc);
                const endDate = new Date(app.endTimeUtc);
                const startHour = startDate.getHours();
                const isNight = Boolean((app.nightSurcharge && app.nightSurcharge > 0) || startHour >= 21);

                return (
                  <div
                    key={`${app.id}-${index}`}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 hover:shadow-xs transition-shadow flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Top Row: Res# and Status */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                            #{app.appointmentNumber}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                            {app.modality === 'domicilio' ? 'A Domicilio' : 'En Local'}
                          </span>
                        </div>
                        {getStatusBadge(app.status)}
                      </div>

                      {/* Service & Specialist */}
                      <div>
                        <h4 className="text-base font-extrabold text-slate-900">{app.serviceName}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span>Especialista: <strong className="text-slate-700">{app.providerName}</strong></span>
                        </div>
                      </div>

                      {/* Date & Time pill + Night Badge */}
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-bold text-slate-800">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{startDate.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                          <span className="text-slate-300">|</span>
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>
                            {startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {isNight && (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded-xl text-xs font-bold">
                            <span>🌙</span>
                            <span>Horario Nocturno (+{businessProfile.currency}200)</span>
                          </div>
                        )}
                      </div>

                      {/* Selected Customization Options */}
                      {app.selectedOptions && app.selectedOptions.length > 0 && (
                        <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 text-xs space-y-1.5">
                          <span className="font-bold text-rose-950 block text-[11px] flex items-center gap-1">
                            <Sliders className="w-3 h-3 text-rose-600" /> Opciones Personalizadas:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {app.selectedOptions.map((opt, i) => (
                              <span key={i} className="bg-white px-2 py-0.5 rounded-md border border-rose-200 text-rose-900 text-[11px] font-medium">
                                <strong className="text-slate-700">{opt.groupTitle}:</strong> {opt.optionName}
                                {opt.priceDelta > 0 && ` (+${businessProfile.currency}${opt.priceDelta})`}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Customer Details */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{app.customerName}</span>
                          <span className="text-slate-500 font-mono">{app.customerPhone}</span>
                        </div>
                        {app.customerAddress && (
                          <p className="text-[11px] text-slate-600 truncate">📍 {app.customerAddress}</p>
                        )}
                        {app.customerNotes && (
                          <p className="text-[11px] text-slate-500 italic">"{app.customerNotes}"</p>
                        )}
                      </div>
                    </div>

                    {/* Bottom Row: Total & Action Controls */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Total a Cobrar</span>
                        <span className="font-mono font-black text-base text-slate-900">
                          {app.priceType === 'a_cotizar' ? 'A Cotizar' : `${businessProfile.currency}${app.totalPrice.toFixed(2)}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* WhatsApp Contact Link */}
                        <a
                          href={generateWhatsAppLink(app)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1 transition-colors"
                          title="Contactar por WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>

                        {/* Status Change & Transfer Receipt Buttons */}
                        {!app.transferReceiptReceived && (
                          <button
                            onClick={() => markTransferReceiptReceived(app.id, true)}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-2xs transition-all active:scale-95 flex items-center gap-1"
                            title="Marcar comprobante de transferencia como recibido y confirmar cita"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Comprobante Recibido & Confirmar</span>
                          </button>
                        )}
                        {app.transferReceiptReceived && (
                          <span className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                            <span>✓</span> Comprobante Validado
                          </span>
                        )}

                        {app.status === 'pendiente' && !app.transferReceiptReceived && (
                          <button
                            onClick={() => updateAppointmentStatus(app.id, 'confirmada')}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-all active:scale-95"
                          >
                            Aprobar
                          </button>
                        )}

                        {app.status === 'confirmada' && (
                          <button
                            onClick={() => updateAppointmentStatus(app.id, 'completada')}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-2xs transition-all active:scale-95"
                          >
                            Completar
                          </button>
                        )}

                        {app.status !== 'cancelada' && app.status !== 'completada' && (
                          <button
                            onClick={() => updateAppointmentStatus(app.id, 'cancelada')}
                            className="px-2 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold transition-colors"
                          >
                            Cancelar
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (window.confirm('¿Eliminar definitivamente este registro de cita?')) {
                              deleteAppointment(app.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Eliminar cita"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 1: HORARIO SEMANAL PERSONALIZADO POR PERSONAL */}
      {activeSubTab === 'horario' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Horario de Atención y Disponibilidad para Eventos</h3>
            </div>
            {providers.length > 0 && (
              <div className="w-full sm:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-2 max-w-full">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider shrink-0">Personal:</span>
                <select
                  value={selectedScheduleProviderId}
                  onChange={(e) => setSelectedScheduleProviderId(e.target.value)}
                  className="w-full sm:w-auto max-w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none truncate"
                >
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.role})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {currentProviderSchedule.map((day) => (
              <div
                key={day.dayOfWeek}
                className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all ${
                  day.enabled ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-100/50 border-slate-200 opacity-70'
                }`}
              >
                <div className="flex items-center gap-3 shrink-0">
                  <input
                    type="checkbox"
                    checked={day.enabled}
                    onChange={(e) => handleUpdateProviderDay({ ...day, enabled: e.target.checked })}
                    className="w-5 h-5 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                  />
                  <span className="font-bold text-slate-800 w-24">{dayNames[day.dayOfWeek]}</span>
                </div>

                {day.enabled ? (
                  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                    <div className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-slate-500 font-medium">Aper:</span>
                      <input
                        type="time"
                        value={day.startTime}
                        onChange={(e) => handleUpdateProviderDay({ ...day, startTime: e.target.value })}
                        className="bg-transparent text-slate-800 font-bold outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-slate-500 font-medium">Cier:</span>
                      <input
                        type="time"
                        value={day.endTime}
                        onChange={(e) => handleUpdateProviderDay({ ...day, endTime: e.target.value })}
                        className="bg-transparent text-slate-800 font-bold outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-slate-500 font-medium">Descanso:</span>
                      <input
                        type="time"
                        value={day.breakStartTime || ''}
                        onChange={(e) => handleUpdateProviderDay({ ...day, breakStartTime: e.target.value })}
                        className="bg-transparent text-slate-800 font-bold outline-none w-20"
                      />
                      <span className="text-slate-400">-</span>
                      <input
                        type="time"
                        value={day.breakEndTime || ''}
                        onChange={(e) => handleUpdateProviderDay({ ...day, breakEndTime: e.target.value })}
                        className="bg-transparent text-slate-800 font-bold outline-none w-20"
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-sm font-medium text-slate-400 italic">Cerrado / No laborable</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: EXCEPCIONES Y BLOQUEOS */}
      {activeSubTab === 'excepciones' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800">Agregar Bloqueo / Excepción</h3>
            <form onSubmit={handleCreateException} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Fecha</label>
                <input
                  type="date"
                  value={excDate}
                  onChange={(e) => setExcDate(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Tipo de Excepción</label>
                <select
                  value={excType}
                  onChange={(e) => setExcType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-rose-500 outline-none"
                >
                  <option value="bloqueo_total">Bloqueo Total (Día libre / Vacaciones)</option>
                  <option value="horario_especial">Horario Especial (Modificar horas)</option>
                </select>
              </div>

              {excType === 'horario_especial' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Desde</label>
                    <input
                      type="time"
                      value={excStart}
                      onChange={(e) => setExcStart(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Hasta</label>
                    <input
                      type="time"
                      value={excEnd}
                      onChange={(e) => setExcEnd(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-medium text-slate-700 mb-1">Motivo / Razón</label>
                <input
                  type="text"
                  placeholder="ej. Feriado Nacional, Mantenimiento"
                  value={excReason}
                  onChange={(e) => setExcReason(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Registrar Bloqueo
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800">Bloqueos & Excepciones Activas ({exceptions.length})</h3>
            {exceptions.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <CalendarDays className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p>No hay excepciones ni días bloqueados registrados.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {exceptions.map((exc) => (
                  <div key={exc.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{exc.date}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            exc.type === 'bloqueo_total' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {exc.type === 'bloqueo_total' ? 'Bloqueo Total' : `Horario: ${exc.startTime} - ${exc.endTime}`}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{exc.reason}</p>
                    </div>
                    <button
                      onClick={() => deleteException(exc.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 4: PROVEEDORES / PERSONAL */}
      {activeSubTab === 'proveedores' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800">
              {editingProviderId ? 'Editar Personal / Proveedor' : 'Agregar Personal / Proveedor'}
            </h3>
            <form onSubmit={handleSaveProvider} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  placeholder="ej. Dra. Mariana Gómez"
                  value={newProvName}
                  onChange={(e) => setNewProvName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Especialidad / Rol</label>
                <input
                  type="text"
                  placeholder="ej. Cosmetóloga & Masajista"
                  value={newProvRole}
                  onChange={(e) => setNewProvRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div>
                <GoogleDriveInput
                  label="Foto de Perfil (URL o Drive)"
                  value={newProvAvatar}
                  onChange={(normalizedUrl) => setNewProvAvatar(normalizedUrl)}
                  placeholder="Pega enlace de foto o Google Drive..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                {editingProviderId && (
                  <button
                    type="button"
                    onClick={handleCancelEditProvider}
                    className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  {editingProviderId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {editingProviderId ? 'Guardar Cambios' : 'Registrar Personal'}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800">Personal Registrado ({providers.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {providers.map((prov) => (
                <div key={prov.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={prov.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={prov.name}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-800 truncate">{prov.name}</h4>
                      <p className="text-xs text-slate-500 truncate">{prov.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleStartEditProvider(prov)}
                      className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                      title="Modificar datos e imagen"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    {providers.length > 1 && (
                      <button
                        onClick={() => deleteProvider(prov.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
