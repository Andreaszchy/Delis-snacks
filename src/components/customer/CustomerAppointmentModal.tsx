import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle2,
  Scissors,
  AlertCircle,
  MapPin,
  Home,
  Info,
  ShieldCheck,
  CalendarDays,
  Loader2,
  Sliders,
  Check,
  Sparkles,
  Tag,
} from 'lucide-react';
import { Service, SelectedOptionItem, ProductOptionGroup, ProductOption } from '../../types';

interface CustomerAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedServiceId?: string;
}

export const CustomerAppointmentModal: React.FC<CustomerAppointmentModalProps> = ({
  isOpen,
  onClose,
  preselectedServiceId,
}) => {
  const {
    services,
    providers,
    createAppointment,
    getAvailableSlotsForDate,
    businessProfile,
    theme,
    currentUser,
    updateCurrentUser,
    setIsPrivacyModalOpen,
  } = useApp();

  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    preselectedServiceId || (services.length > 0 ? services[0].id : '')
  );
  const [selectedProviderId, setSelectedProviderId] = useState<string>(
    providers.length > 0 ? providers[0].id : 'prov-1'
  );

  const activeService: Service | undefined = services.find((s) => s.id === selectedServiceId) || services[0];

  const selectedModality = 'local'; // Siempre local según requerimiento

  // Default date: today formatted YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState<string>(currentUser?.phone || '');
  const [savePhoneToProfile, setSavePhoneToProfile] = useState<boolean>(true);
  const [customerNotes, setCustomerNotes] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [showBankInfo, setShowBankInfo] = useState<boolean>(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(Boolean(currentUser?.privacyAcceptedAt));
  const [healthConsent, setHealthConsent] = useState(Boolean(currentUser?.healthConsent));

  // Opciones personalizables seleccionadas: groupId -> array de optionIds
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [limitWarning, setLimitWarning] = useState<{ groupId: string; message: string } | null>(null);

  const lastUserUidRef = React.useRef(currentUser?.uid);

  useEffect(() => {
    if (isOpen) {
      setCustomerName(currentUser?.name || '');
      setCustomerPhone(currentUser?.phone || '');
      setPrivacyAccepted(Boolean(currentUser?.privacyAcceptedAt));
      setHealthConsent(Boolean(currentUser?.healthConsent));
      setBookingError(null);
      setSuccessApp(null);
      if (preselectedServiceId) {
        setSelectedServiceId(preselectedServiceId);
      }
    }
  }, [isOpen, preselectedServiceId]);

  useEffect(() => {
    if (lastUserUidRef.current !== currentUser?.uid) {
      lastUserUidRef.current = currentUser?.uid;
      setCustomerName(currentUser?.name || '');
      setCustomerPhone(currentUser?.phone || '');
      setPrivacyAccepted(Boolean(currentUser?.privacyAcceptedAt));
      setHealthConsent(Boolean(currentUser?.healthConsent));
      setBookingError(null);
    }
  }, [currentUser?.uid, currentUser?.name, currentUser?.phone, currentUser?.privacyAcceptedAt, currentUser?.healthConsent]);

  // Inicializar selecciones por defecto cuando cambia el servicio
  useEffect(() => {
    if (!activeService) return;
    const initialMap: Record<string, string[]> = {};
    (activeService.optionGroups || []).forEach((group) => {
      if (group.required && group.type === 'single' && group.options.length > 0) {
        initialMap[group.id] = [group.options[0].id];
      } else {
        initialMap[group.id] = [];
      }
    });
    setSelections(initialMap);
    setLimitWarning(null);
  }, [selectedServiceId, activeService]);

  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [successApp, setSuccessApp] = useState<{
    number: string;
    status: string;
    totalPrice: number;
    priceType: string;
    deadlineMinutes: number;
    modality: string;
    selectedOptions?: SelectedOptionItem[];
    nightSurcharge?: number;
  } | null>(null);

  // Sync selected service
  useEffect(() => {
    if (preselectedServiceId) {
      setSelectedServiceId(preselectedServiceId);
    } else if (services.length > 0 && !selectedServiceId) {
      setSelectedServiceId(services[0].id);
    }
  }, [preselectedServiceId, services, selectedServiceId]);

  // Handler para seleccionar / alternar opciones
  const handleToggleOption = (
    groupId: string,
    optionId: string,
    groupType: 'single' | 'multiple',
    maxSelections?: number
  ) => {
    setSelections((prev) => {
      const currentSelected = prev[groupId] || [];

      if (groupType === 'single') {
        setLimitWarning(null);
        return {
          ...prev,
          [groupId]: [optionId],
        };
      } else {
        const exists = currentSelected.includes(optionId);
        if (exists) {
          setLimitWarning(null);
          return {
            ...prev,
            [groupId]: currentSelected.filter((id) => id !== optionId),
          };
        } else {
          if (maxSelections && maxSelections > 0 && currentSelected.length >= maxSelections) {
            setLimitWarning({
              groupId,
              message: `Máximo ${maxSelections} opción${maxSelections > 1 ? 'es' : ''} permitidas en este grupo.`,
            });
            return prev;
          }
          setLimitWarning(null);
          return {
            ...prev,
            [groupId]: [...currentSelected, optionId],
          };
        }
      }
    });
    setBookingError(null);
  };

  // Calcular costo extra y lista plana de opciones
  let optionsExtraCost = 0;
  const flatSelectedList: SelectedOptionItem[] = [];

  (activeService?.optionGroups || []).forEach((group) => {
    const selectedIds = selections[group.id] || [];
    selectedIds.forEach((sId) => {
      const opt = group.options.find((o) => o.id === sId);
      if (opt) {
        const delta = Number(opt.priceDelta) || 0;
        optionsExtraCost += delta;
        flatSelectedList.push({
          groupId: group.id,
          groupTitle: group.title,
          optionId: opt.id,
          optionName: opt.name,
          priceDelta: delta,
        });
      }
    });
  });

  const timeHour = selectedTime ? parseInt(selectedTime.split(':')[0], 10) : 0;
  const isLateNight = Boolean(selectedTime && timeHour >= 21);
  const lateNightFee = isLateNight && activeService?.priceType !== 'a_cotizar' ? 200 : 0;

  const baseServicePrice = activeService?.price || 0;
  const totalServiceEstimatedPrice =
    activeService?.priceType === 'a_cotizar'
      ? 0
      : baseServicePrice + optionsExtraCost + lateNightFee;

  if (!isOpen) return null;

  const availableSlots = selectedServiceId && selectedDate && selectedProviderId
    ? getAvailableSlotsForDate(selectedServiceId, selectedDate, selectedProviderId, selectedModality)
    : [];

  // Max 30 days calculation
  const maxDateObj = new Date();
  maxDateObj.setDate(maxDateObj.getDate() + 30);
  const maxDateStr = maxDateObj.toISOString().split('T')[0];

  // Missing validation message for disabled button
  const getMissingFieldsMessage = () => {
    if (activeService?.optionGroups) {
      for (const group of activeService.optionGroups) {
        const count = (selections[group.id] || []).length;
        if (group.required && count === 0) {
          return `Elegir opción en "${group.title}"`;
        }
      }
    }
    if (!selectedDate || !selectedTime) return 'Selecciona fecha y hora';
    if (!customerName.trim()) return 'Ingresa tu nombre completo';
    if (!customerPhone.trim()) return 'Ingresa tu teléfono / WhatsApp';
    if (!customerAddress.trim()) return 'Ingresa la dirección del evento';
    if (!privacyAccepted) return 'Acepta el Aviso de Privacidad';
    return null;
  };
  const missingMsg = getMissingFieldsMessage();

  // Determine current step for progress bar
  const step1Done = Boolean(selectedServiceId && selectedProviderId);
  const step2Done = Boolean(selectedDate && selectedTime);
  const step3Done = Boolean(customerName.trim() && customerPhone.trim() && customerAddress.trim());
  const step4Done = !missingMsg;

  let currentStep = 1;
  if (step1Done) currentStep = 2;
  if (step2Done) currentStep = 3;
  if (step3Done) currentStep = 4;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId || !selectedDate || !selectedTime || !customerName.trim() || !customerPhone.trim() || !privacyAccepted) return;

    // Validar grupos obligatorios
    if (activeService?.optionGroups) {
      for (const group of activeService.optionGroups) {
        const count = (selections[group.id] || []).length;
        if (group.required && count === 0) {
          setBookingError(`Por favor selecciona al menos una opción en "${group.title}".`);
          return;
        }
      }
    }

    setSubmitting(true);
    setBookingError(null);
    try {
      const newApp = await createAppointment({
        serviceId: selectedServiceId,
        providerId: selectedProviderId || (providers[0]?.id || 'prov-1'),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerNotes: customerNotes.trim(),
        customerAddress: customerAddress.trim(),
        modality: 'domicilio',
        selectedOptions: flatSelectedList,
        dateStr: selectedDate,
        timeStr: selectedTime,
        privacyAcceptedAt: new Date().toISOString(),
        healthConsent,
      });

      setSuccessApp({
        number: newApp.appointmentNumber,
        status: newApp.status,
        totalPrice: newApp.totalPrice,
        priceType: activeService?.priceType || 'fijo',
        deadlineMinutes: activeService?.providerResponseDeadlineMinutes || 60,
        modality: 'local',
        selectedOptions: flatSelectedList,
        nightSurcharge: newApp.nightSurcharge,
      });

      // Guardar teléfono y nombre en el perfil del cliente para reutilizarlo en futuras citas/pedidos
      if (savePhoneToProfile && currentUser.isLoggedIn) {
        const updates: Partial<typeof currentUser> = {};
        if (customerPhone.trim() && customerPhone.trim() !== currentUser.phone) {
          updates.phone = customerPhone.trim();
        }
        if (customerName.trim() && (!currentUser.name || currentUser.name === 'Cliente')) {
          updates.name = customerName.trim();
        }
        if (Object.keys(updates).length > 0) {
          updateCurrentUser(updates);
        }
      }
    } catch (err: any) {
      console.error('Error creating appointment:', err);
      setBookingError(err?.message || 'Hubo un error al registrar tu cita. Por favor intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSuccessApp(null);
    setBookingError(null);
    setSubmitting(false);
    setSelectedTime('');
    setCustomerNotes('');
    setCustomerName('');
    setCustomerPhone('');
    setPrivacyAccepted(false);
    setHealthConsent(false);
    setSelections({});
    setLimitWarning(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Discreet Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Servicios & Eventos
            </p>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              Reserva tu cita o evento
            </h2>
          </div>
          <button
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4-Step Progress Bar */}
        {!successApp && (
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 shrink-0">
            <div className="grid grid-cols-4 gap-1.5 text-center">
              {[
                { step: 1, label: 'Servicio', done: step1Done },
                { step: 2, label: 'Fecha y hora', done: step2Done },
                { step: 3, label: 'Tus datos', done: step3Done },
                { step: 4, label: 'Confirmar', done: step4Done },
              ].map((item) => {
                const isPassed = item.step < currentStep || item.done;
                const isCurrent = currentStep === item.step;
                return (
                  <div key={item.step} className="space-y-1">
                    <div
                      className={`h-1 rounded-full transition-all ${
                        isPassed ? 'bg-rose-600' : 'bg-slate-200'
                      }`}
                      style={isPassed ? { backgroundColor: theme.raw.primaryBtn } : undefined}
                    />
                    <span
                      className={`text-[10px] font-bold block truncate ${
                        isCurrent ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {item.step}. {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {successApp ? (
          <div className="p-6 sm:p-8 text-center space-y-4 overflow-y-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">¡Cita Registrada con Éxito!</h3>
            <p className="text-sm text-slate-600">
              Número de reserva:{' '}
              <strong className="text-rose-600 font-extrabold text-base">{successApp.number}</strong>
            </p>

            {successApp.status === 'pendiente' ? (
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs text-amber-900 text-left space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Pago por Transferencia / Depósito Pendiente</span>
                </div>
                <p>Para confirmar tu evento a domicilio, realiza tu pago a la tarjeta <strong>4152314180582036</strong> (Ariana Vianey Ibarra) por un total de <strong>{businessProfile.currency}{successApp.totalPrice.toFixed(2)}</strong>.</p>
                <a
                  href={`https://wa.me/${(businessProfile.phone || '526695934225').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Adjunto comprobante de la solicitud de servicio de ${activeService?.name || 'barra'} con id: ${successApp.number}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span>💬 Enviar comprobante por WhatsApp</span>
                </a>
              </div>
            ) : (
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-xs text-emerald-800 text-left space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Estado: Confirmación inmediata</span>
                </div>
                <p>Tu cita o evento ha quedado reservado en la agenda. ¡Te esperamos puntualmente!</p>
              </div>
            )}

            {successApp.selectedOptions && successApp.selectedOptions.length > 0 && (
              <div className="bg-rose-50/70 p-3.5 rounded-2xl border border-rose-200/80 text-xs text-left space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-rose-900">
                  <Sliders className="w-3.5 h-3.5 text-rose-600" />
                  <span>Personalizaciones Seleccionadas:</span>
                </div>
                <div className="space-y-1">
                  {successApp.selectedOptions.map((opt, i) => (
                    <div key={i} className="flex justify-between items-center text-[11px] text-rose-800">
                      <span>• {opt.groupTitle}: <strong className="text-slate-900">{opt.optionName}</strong></span>
                      {opt.priceDelta > 0 && (
                        <span className="font-bold text-rose-700">+{businessProfile.currency}{opt.priceDelta}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {successApp.nightSurcharge && successApp.nightSurcharge > 0 && (
              <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-200 text-xs text-indigo-900 text-left flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold">
                  <span>🌙</span> Cargo por horario nocturno (después de 9:00 PM):
                </span>
                <span className="font-extrabold font-mono text-indigo-950">+{businessProfile.currency}{successApp.nightSurcharge.toFixed(2)}</span>
              </div>
            )}

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 flex justify-between items-center">
              <span>Modalidad: <strong>En Local / Mostrador</strong></span>
              <span>
                Total:{' '}
                <strong className="text-slate-900 font-bold">
                  {successApp.priceType === 'a_cotizar'
                    ? 'A Cotizar'
                    : `${businessProfile.currency}${successApp.totalPrice.toFixed(2)}`}
                </strong>
              </span>
            </div>

            <button
              type="button"
              onClick={handleResetAndClose}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-colors mt-2"
            >
              Entendido
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col justify-between">
            <div className="p-5 sm:p-6 space-y-5 text-xs">
              {/* 1. Service Selected Card */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  1. Servicio Seleccionado
                </label>

                {activeService && (
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm">{activeService.name}</h3>
                        <p className="text-slate-500 text-xs mt-0.5">{activeService.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-base font-black text-slate-900 font-mono">
                          {activeService.priceType === 'a_cotizar'
                            ? 'A Cotizar'
                            : `${businessProfile.currency}${totalServiceEstimatedPrice.toFixed(2)}`}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-semibold">
                          {activeService.durationMinutes} min
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px]">
                      <span className="inline-flex items-center gap-1 font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                        <Home className="w-3.5 h-3.5 text-rose-600" />
                        <span>En Local / Mostrador</span>
                      </span>

                      {activeService.confirmationType === 'automatica' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          ✓ Confirmación inmediata
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                          ⏳ Sujeta a confirmación
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Opciones y Personalización del Servicio / Evento */}
              {activeService?.optionGroups && activeService.optionGroups.length > 0 && (
                <div className="space-y-3 p-4 bg-slate-50/90 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-rose-600" />
                      <span>Personaliza tu Servicio / Evento</span>
                    </label>
                    {optionsExtraCost > 0 && (
                      <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                        Extras: +{businessProfile.currency}{optionsExtraCost.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {limitWarning && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{limitWarning.message}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    {activeService.optionGroups.map((group) => {
                      const selectedIds = selections[group.id] || [];
                      return (
                        <div key={group.id} className="space-y-2 bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800">
                              {group.title}
                              {group.required && <span className="text-rose-500 ml-1 font-black">*</span>}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {group.type === 'multiple' && group.maxSelections && (
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                                  Máx. {group.maxSelections}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400">
                                {group.required ? 'Obligatorio' : 'Opcional'}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {group.options.map((opt) => {
                              const isSelected = selectedIds.includes(opt.id);
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => handleToggleOption(group.id, opt.id, group.type, group.maxSelections)}
                                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 active:scale-98 ${
                                    isSelected
                                      ? 'border-rose-500 bg-rose-50/60 text-slate-900 shadow-2xs ring-1 ring-rose-500'
                                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div
                                      className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-all ${
                                        group.type === 'single' ? 'rounded-full' : 'rounded-sm'
                                      } ${
                                        isSelected
                                          ? 'border-rose-600 bg-rose-600 text-white'
                                          : 'border-slate-300 bg-white'
                                      }`}
                                    >
                                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                    </div>
                                    <span className="text-xs font-semibold truncate">{opt.name}</span>
                                  </div>

                                  {opt.priceDelta > 0 && (
                                    <span className="text-[11px] font-bold text-rose-600 shrink-0">
                                      +{businessProfile.currency}{opt.priceDelta}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. Therapist Card Selection */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  2. Terapeuta / Especialista
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {providers.map((prov) => {
                    const isSelected = selectedProviderId === prov.id;
                    return (
                      <button
                        key={prov.id}
                        type="button"
                        onClick={() => {
                          setSelectedProviderId(prov.id);
                          setSelectedTime('');
                        }}
                        className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-rose-50/40 shadow-xs ring-1'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                        style={isSelected ? { borderColor: theme.raw.primaryBtn, boxShadow: `0 0 0 2px ${theme.raw.primaryBtn}` } : undefined}
                      >
                        <img
                          src={prov.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={prov.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-slate-900 truncate">{prov.name}</h4>
                          <p className="text-[10px] text-slate-500 truncate">{prov.role}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Date & Time Selection */}
              <div className="space-y-3">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  3. Fecha y Horarios Disponibles
                </label>
                
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    min={todayStr}
                    max={maxDateStr}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedTime('');
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>

                {availableSlots.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
                    <CalendarDays className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">
                      No hay horarios disponibles para este día. Prueba con otra fecha.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        setSelectedDate(tomorrow.toISOString().split('T')[0]);
                        setSelectedTime('');
                      }}
                      className="px-3.5 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-xl hover:bg-slate-100 text-slate-700 shadow-2xs"
                    >
                      Ver próximo día disponible
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedTime === slot;
                      const slotHour = parseInt(slot.split(':')[0], 10);
                      const isSlotNight = slotHour >= 21;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                            isSelected
                              ? 'text-white shadow-xs scale-102'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                          style={isSelected ? { backgroundColor: theme.raw.primaryBtn, color: theme.raw.primaryBtnText } : undefined}
                          title={isSlotNight ? 'Horario nocturno (+ $200)' : undefined}
                        >
                          <span className="flex items-center gap-1">
                            {slot}
                            {isSlotNight && <span className="text-[10px]">🌙</span>}
                          </span>
                          {isSlotNight && (
                            <span className={`text-[9px] font-extrabold ${isSelected ? 'text-amber-200' : 'text-indigo-600'}`}>
                              +$200
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {isLateNight && (
                  <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs flex items-center justify-between gap-2 shadow-2xs animate-in fade-in">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">🌙</span>
                      <div className="min-w-0">
                        <span className="font-bold block text-indigo-950 truncate">Horario Nocturno Aplicado</span>
                        <span className="text-[11px] text-indigo-700 block">Reserva a partir de las 9:00 PM (+{businessProfile.currency}200.00).</span>
                      </div>
                    </div>
                    <span className="font-black text-xs text-indigo-950 font-mono shrink-0 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                      +{businessProfile.currency}200
                    </span>
                  </div>
                )}

                <p className="text-[11px] text-slate-400 italic">
                  * Mínimo {activeService?.minNoticeHours || 2} horas de anticipación para agendar citas el mismo día.
                </p>
              </div>

              {/* 4. Customer Details */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">4. Tus Datos de Contacto</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tu nombre completo"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-rose-500 font-semibold"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="WhatsApp (10 dígitos)"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-rose-500 font-semibold"
                    />
                  </div>
                </div>

                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Domicilio exacto del evento a domicilio *"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-rose-500 font-semibold"
                  />
                </div>

                {/* Bank Transfer info banner */}
                <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <span>💳</span> Pago exclusivo por Transferencia / Depósito
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowBankInfo(!showBankInfo)}
                      className="text-rose-700 underline font-extrabold hover:text-rose-900"
                    >
                      {showBankInfo ? 'Ocultar cuenta' : 'Ver datos bancarios'}
                    </button>
                  </div>
                  {showBankInfo && (
                    <div className="bg-white p-3 rounded-xl border border-amber-200 font-mono text-xs space-y-1 text-slate-800 animate-in fade-in">
                      <p><strong>Tarjeta / Cuenta:</strong> 4152 3141 8058 2036</p>
                      <p><strong>Titular:</strong> Ariana Vianey Ibarra</p>
                      <p className="text-[10px] text-slate-500 font-sans">Realiza tu transferencia por el monto total y envía tu comprobante por WhatsApp al finalizar.</p>
                    </div>
                  )}
                </div>

                {currentUser.isLoggedIn && (
                  <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-600 select-none">
                    <input
                      type="checkbox"
                      checked={savePhoneToProfile}
                      onChange={(e) => setSavePhoneToProfile(e.target.checked)}
                      className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                    <span>Guardar este número en mis datos de contacto para futuras citas y pedidos</span>
                  </label>
                )}

                <textarea
                  placeholder="¿Alguna preferencia o alergia que debamos saber?"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                />

                <div className="space-y-2 pt-1">
                  {currentUser.privacyAcceptedAt ? (
                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2 text-[11px] font-bold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Aviso de Privacidad y Términos aceptados previamente en tu cuenta.</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          id="privacy-app"
                          required
                          checked={privacyAccepted}
                          onChange={(e) => setPrivacyAccepted(e.target.checked)}
                          className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                        />
                        <label htmlFor="privacy-app" className="text-[11px] text-slate-600 cursor-pointer">
                          He leído el <button type="button" onClick={() => setIsPrivacyModalOpen(true)} className="text-slate-900 font-bold underline">Aviso de Privacidad</button> y acepto el tratamiento de mis datos. *
                        </label>
                      </div>

                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          id="health-app"
                          checked={healthConsent}
                          onChange={(e) => setHealthConsent(e.target.checked)}
                          className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                        />
                        <label htmlFor="health-app" className="text-[11px] text-slate-600 cursor-pointer">
                          Autorizo el uso de las alergias o datos de salud que escriba en mis notas. (Opcional)
                        </label>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Policies Card */}
              {activeService && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-around text-[11px] text-slate-600 gap-2">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Plazo de respuesta: <strong>{activeService.providerResponseDeadlineMinutes || 60} min</strong></span>
                  </div>
                  <div className="h-4 w-px bg-slate-200" />
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Cancelaciones con <strong>{activeService.minCancellationHours || 4} horas</strong></span>
                  </div>
                </div>
              )}
            </div>

            {/* Fixed Bottom Footer Button */}
            <div className="p-4 bg-white border-t border-slate-100 shrink-0 space-y-2">
              {missingMsg && (
                <p className="text-[11px] text-amber-700 text-center font-medium">
                  Falta: {missingMsg}
                </p>
              )}

              {bookingError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="flex-1 font-medium">{bookingError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={Boolean(missingMsg) || submitting}
                className={`w-full py-3.5 rounded-2xl text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                style={
                  !missingMsg && !submitting
                    ? {
                        background: `linear-gradient(135deg, ${theme.raw.primaryBtn}, #b45309)`,
                      }
                    : undefined
                }
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                <span>
                  {submitting
                    ? 'Confirmando tu cita...'
                    : `Confirmar cita · ${
                        activeService?.priceType === 'a_cotizar'
                          ? 'A Cotizar'
                          : `${businessProfile.currency}${totalServiceEstimatedPrice.toFixed(2)}`
                      }`}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
