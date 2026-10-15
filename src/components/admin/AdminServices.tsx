import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Clock,
  DollarSign,
  MapPin,
  ShieldCheck,
  Scissors,
  User,
  Users,
  ChevronDown,
  ChevronUp,
  Sliders,
  ListFilter,
  CheckSquare,
  Layers,
} from 'lucide-react';
import { Service, ServiceModality, ConfirmationType, PriceType, ProductOptionGroup, ProductOption } from '../../types';
import { GoogleDriveInput } from '../common/GoogleDriveInput';

export const AdminServices: React.FC = () => {
  const { services, addService, updateService, deleteService, providers, businessProfile, theme } = useApp();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  // Accordion collapsed state per category (default true = collapsed/hidden)
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => {
      const currentlyCollapsed = prev[cat] ?? true;
      return {
        ...prev,
        [cat]: !currentlyCollapsed,
      };
    });
  };

  // Group services by category
  const servicesByCategory = services.reduce((acc, s) => {
    const cat = s.category.trim() || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {} as Record<string, Service[]>);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('');
  const [priceType, setPriceType] = useState<PriceType>('fijo');
  const [price, setPrice] = useState<number>(0);
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [bufferMinutes, setBufferMinutes] = useState<number>(15);

  const [modality, setModality] = useState<ServiceModality>('local');
  const [travelSurcharge, setTravelSurcharge] = useState<number>(0);
  const [travelTimeMinutes, setTravelTimeMinutes] = useState<number>(0);
  const [roundTripTravel, setRoundTripTravel] = useState<boolean>(true);
  const [maxHomeZoneKm, setMaxHomeZoneKm] = useState<number>(10);

  const [confirmationType, setConfirmationType] = useState<ConfirmationType>('automatica');
  const [hybridHoursThreshold, setHybridHoursThreshold] = useState<number>(6);
  const [providerResponseDeadlineMinutes, setProviderResponseDeadlineMinutes] = useState<number>(120);
  const [minCancellationHours, setMinCancellationHours] = useState<number>(4);
  const [minNoticeHours, setMinNoticeHours] = useState<number>(2);
  const [selectedProviderIds, setSelectedProviderIds] = useState<string[]>(
    providers.length > 0 ? [providers[0].id] : []
  );

  // Grupos de opciones personalizables por el cliente
  const [optionGroups, setOptionGroups] = useState<ProductOptionGroup[]>([]);

  const handleAddNewGroup = () => {
    const newGroup: ProductOptionGroup = {
      id: `grp-serv-${Date.now()}`,
      title: '',
      type: 'single',
      required: false,
      options: [
        { id: `opt-${Date.now()}-1`, name: '', priceDelta: 0 },
        { id: `opt-${Date.now()}-2`, name: '', priceDelta: 0 },
      ],
    };
    setOptionGroups((prev) => [...prev, newGroup]);
  };

  const handleUpdateGroup = (groupId: string, updates: Partial<ProductOptionGroup>) => {
    setOptionGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, ...updates } : g))
    );
  };

  const handleRemoveGroup = (groupId: string) => {
    setOptionGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

  const handleAddOption = (groupId: string) => {
    const newOption: ProductOption = {
      id: `opt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: '',
      priceDelta: 0,
    };
    setOptionGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, options: [...g.options, newOption] } : g
      )
    );
  };

  const handleUpdateOption = (
    groupId: string,
    optionId: string,
    updates: Partial<ProductOption>
  ) => {
    setOptionGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          options: g.options.map((opt) =>
            opt.id === optionId ? { ...opt, ...updates } : opt
          ),
        };
      })
    );
  };

  const handleRemoveOption = (groupId: string, optionId: string) => {
    setOptionGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          options: g.options.filter((opt) => opt.id !== optionId),
        };
      })
    );
  };

  const handleLoadPresetGroups = () => {
    const preset: ProductOptionGroup[] = [
      {
        id: `grp-capacidad-${Date.now()}`,
        title: 'Capacidad & Número de Personas',
        type: 'single',
        required: true,
        options: [
          { id: `opt-cap-1`, name: 'Paquete 30 personas', priceDelta: 0 },
          { id: `opt-cap-2`, name: 'Paquete 50 personas', priceDelta: 600 },
          { id: `opt-cap-3`, name: 'Paquete 100 personas', priceDelta: 1600 },
        ],
      },
      {
        id: `grp-botanas-${Date.now()}`,
        title: 'Selección de Botanas para la Barra',
        type: 'multiple',
        required: true,
        maxSelections: 4,
        options: [
          { id: `opt-bot-1`, name: 'Gomitas Enchiladas Surtidas', priceDelta: 0 },
          { id: `opt-bot-2`, name: 'Charola de Fruta con Chamoy y Tajín', priceDelta: 0 },
          { id: `opt-bot-3`, name: 'Papas y Chicharrones Preparados', priceDelta: 0 },
          { id: `opt-bot-4`, name: 'Vasitos de Elote con Queso', priceDelta: 250 },
        ],
      },
      {
        id: `grp-extras-${Date.now()}`,
        title: 'Servicios Extra / Complementos',
        type: 'multiple',
        required: false,
        options: [
          { id: `opt-ext-1`, name: 'Personal de atención 1 hr adicional', priceDelta: 300 },
          { id: `opt-ext-2`, name: 'Desechables y Platos Temáticos', priceDelta: 150 },
          { id: `opt-ext-3`, name: 'Fuente de Chamoy Líquido', priceDelta: 450 },
        ],
      },
    ];
    setOptionGroups(preset);
  };

  const handleOpenNew = () => {
    setEditingServiceId(null);
    setName('');
    setDescription('');
    setImageUrl('');
    setCategory('');
    setPriceType('fijo');
    setPrice(0);
    setDurationMinutes(60);
    setBufferMinutes(15);
    setModality('local');
    setTravelSurcharge(0);
    setTravelTimeMinutes(0);
    setRoundTripTravel(true);
    setMaxHomeZoneKm(10);
    setConfirmationType('automatica');
    setHybridHoursThreshold(6);
    setProviderResponseDeadlineMinutes(120);
    setMinCancellationHours(4);
    setMinNoticeHours(2);
    setSelectedProviderIds(providers.length > 0 ? [providers[0].id] : []);
    setOptionGroups([]);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (serv: Service) => {
    setEditingServiceId(serv.id);
    setName(serv.name);
    setDescription(serv.description);
    setImageUrl(serv.imageUrl);
    setCategory(serv.category);
    setPriceType(serv.priceType);
    setPrice(serv.price);
    setDurationMinutes(serv.durationMinutes);
    setBufferMinutes(serv.bufferMinutes);
    setModality(serv.modality);
    setTravelSurcharge(serv.travelSurcharge);
    setTravelTimeMinutes(serv.travelTimeMinutes);
    setRoundTripTravel(serv.roundTripTravel);
    setMaxHomeZoneKm(serv.maxHomeZoneKm);
    setConfirmationType(serv.confirmationType);
    setHybridHoursThreshold(serv.hybridHoursThreshold || 6);
    setProviderResponseDeadlineMinutes(serv.providerResponseDeadlineMinutes || 120);
    setMinCancellationHours(serv.minCancellationHours || 4);
    setMinNoticeHours(serv.minNoticeHours || 2);
    setSelectedProviderIds(serv.providerIds || (providers.length > 0 ? [providers[0].id] : []));
    setOptionGroups(JSON.parse(JSON.stringify(serv.optionGroups || [])));
    setIsEditorOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // If price type is 'a_cotizar', force confirmation to 'aprobacion'
    const finalConfirmationType = priceType === 'a_cotizar' ? 'aprobacion' : confirmationType;
    const finalPrice = priceType === 'a_cotizar' ? 0 : Number(price);

    const cleanedOptionGroups: ProductOptionGroup[] = optionGroups
      .map((og) => ({
        ...og,
        title: og.title.trim(),
        options: og.options
          .map((opt) => ({
            ...opt,
            name: opt.name.trim(),
            priceDelta: Number(opt.priceDelta) || 0,
          }))
          .filter((opt) => opt.name.length > 0),
      }))
      .filter((og) => og.title.length > 0);

    const payload = {
      name: name.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim() || '/src/assets/images/hero_artisan_banner_1791387671351.jpg',
      category: category.trim(),
      priceType,
      price: finalPrice,
      durationMinutes: Math.max(10, Number(durationMinutes)),
      bufferMinutes: Math.max(0, Number(bufferMinutes)),
      modality,
      travelSurcharge: modality === 'local' ? 0 : Math.max(0, Number(travelSurcharge)),
      travelTimeMinutes: modality === 'local' ? 0 : Math.max(0, Number(travelTimeMinutes)),
      roundTripTravel: modality === 'local' ? false : roundTripTravel,
      maxHomeZoneKm: modality === 'local' ? 0 : Math.max(0, Number(maxHomeZoneKm)),
      confirmationType: finalConfirmationType,
      hybridHoursThreshold: finalConfirmationType === 'hibrida' ? Math.max(1, Number(hybridHoursThreshold)) : 6,
      providerResponseDeadlineMinutes: Math.max(10, Number(providerResponseDeadlineMinutes)),
      minCancellationHours: Math.max(0, Number(minCancellationHours)),
      minNoticeHours: Math.max(1, Number(minNoticeHours)),
      providerIds: selectedProviderIds,
      available: true,
      optionGroups: cleanedOptionGroups,
    };

    if (editingServiceId) {
      updateService(editingServiceId, payload);
    } else {
      addService(payload);
    }

    setIsEditorOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Catálogo de Servicios & Eventos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configura barras de snacks, paquetes para eventos y servicios disponibles para cotización y reserva.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 ${theme.buttonClass}`}
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Servicio</span>
        </button>
      </div>

      {/* Services Grouped by Category */}
      {services.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No hay servicios registrados</h3>
          <p className="text-xs text-slate-500">Crea el primer servicio agendable para que los clientes puedan reservar.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(servicesByCategory).map(([categoryName, catServices]) => {
            const isCollapsed = collapsedCategories[categoryName] ?? true;
            return (
              <div key={categoryName} className="bg-slate-50/70 rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs">
                {/* Category Header (Clickable Collapsible) */}
                <button
                  type="button"
                  onClick={() => toggleCategory(categoryName)}
                  className="w-full px-5 py-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: theme.raw.primaryBtn }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base tracking-tight uppercase">
                        {categoryName}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {catServices.length} {catServices.length === 1 ? 'servicio registrado' : 'servicios registrados'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCollapsed ? (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Category Items Grid */}
                {!isCollapsed && (
                  <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {catServices.map((serv) => (
                      <div key={serv.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between">
                        <div>
                          <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                            <img
                              src={serv.imageUrl}
                              alt={serv.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            <div className="absolute top-2.5 left-2.5 flex items-center gap-1 flex-wrap">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/90 text-slate-900">
                                {serv.category}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white capitalize">
                                {serv.modality}
                              </span>
                            </div>
                          </div>

                          <div className="p-4 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-bold text-slate-900 text-sm leading-snug">{serv.name}</h3>
                              <span className="font-mono font-extrabold text-slate-900 text-sm shrink-0">
                                {serv.priceType === 'a_cotizar'
                                  ? 'A cotizar'
                                  : `${serv.priceType === 'desde' ? 'Desde ' : ''}${businessProfile.currency}${serv.price}`}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2">{serv.description}</p>

                            <div className="pt-2 flex items-center justify-between gap-2 text-[11px] text-slate-600 border-t border-slate-100">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{serv.durationMinutes} min (+{serv.bufferMinutes}p)</span>
                                </div>
                                {serv.modality !== 'local' && (
                                  <div className="flex items-center gap-1 text-amber-700">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>Hasta {serv.maxHomeZoneKm} km</span>
                                  </div>
                                )}
                              </div>
                              {serv.providerIds && serv.providerIds.length > 0 && (
                                <div className="flex items-center gap-1 text-slate-500 font-medium">
                                  <Users className="w-3 h-3 text-slate-400" />
                                  <span>{serv.providerIds.length} personal</span>
                                </div>
                              )}
                            </div>

                            {serv.optionGroups && serv.optionGroups.length > 0 && (
                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                                <span className="inline-flex items-center gap-1.5 font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                                  <Sliders className="w-3 h-3 text-rose-500" />
                                  <span>{serv.optionGroups.length} grupo(s) de personalización para el cliente</span>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                          <span className="text-[10px] uppercase font-bold text-slate-500">
                            Confirmación: {serv.confirmationType}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(serv)}
                              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Editar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setServiceToDelete(serv)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Eliminar servicio"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col text-xs"
          >
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                  {editingServiceId ? 'Editar Servicio o Evento' : 'Crear Nuevo Servicio o Evento'}
                </h3>
                <p className="text-xs text-slate-500">Configura tiempos, modalidad local/domicilio y reglas de agenda.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="text-slate-400 hover:text-slate-800 p-1 text-base font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-slate-600">
                  1. Información Principal
                </h4>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nombre del Servicio *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ej. Masaje Relajante Sueco"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Descripción</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalle de la experiencia y beneficios..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Categoría</label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="ej. Masajes, Faciales"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Tipo de Precio</label>
                    <select
                      value={priceType}
                      onChange={(e) => setPriceType(e.target.value as PriceType)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-slate-900 outline-none"
                    >
                      <option value="fijo">Precio Fijo</option>
                      <option value="desde">Precio "Desde"</option>
                      <option value="a_cotizar">A Cotizar (Requiere Aprobación)</option>
                    </select>
                  </div>
                </div>

                {priceType !== 'a_cotizar' && (
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Precio ({businessProfile.currency}) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Image */}
              <div className="pt-3 border-t border-slate-200">
                <GoogleDriveInput
                  value={imageUrl}
                  onChange={(normalized) => setImageUrl(normalized)}
                  label="Fotografía del Servicio"
                  placeholder="URL o Google Drive..."
                />
              </div>

              {/* Tiempos de Agenda */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-slate-600">
                  2. Tiempos & Agenda
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Duración (minutos) *</label>
                    <input
                      type="number"
                      min="10"
                      required
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Pausa / Limpieza (min)</label>
                    <input
                      type="number"
                      min="0"
                      value={bufferMinutes}
                      onChange={(e) => setBufferMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Modalidad y Domicilio (Ocultos si es 'local') */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-slate-600">
                  3. Modalidad & Domicilio
                </h4>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Modalidad del Servicio</label>
                  <select
                    value={modality}
                    onChange={(e) => setModality(e.target.value as ServiceModality)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold focus:ring-2 focus:ring-slate-900 outline-none"
                  >
                    <option value="local">Solo en Local / Mostrador</option>
                    <option value="domicilio">Solo a Domicilio</option>
                    <option value="ambas">Ambas (Local y Domicilio)</option>
                  </select>
                </div>

                {modality !== 'local' && (
                  <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-amber-900 block mb-1">Recargo Domicilio ($)</label>
                        <input
                          type="number"
                          min="0"
                          value={travelSurcharge}
                          onChange={(e) => setTravelSurcharge(Number(e.target.value))}
                          className="w-full px-3 py-1.5 border border-amber-300 rounded-lg bg-white font-bold outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-amber-900 block mb-1">Tiempo Traslado (min)</label>
                        <input
                          type="number"
                          min="0"
                          value={travelTimeMinutes}
                          onChange={(e) => setTravelTimeMinutes(Number(e.target.value))}
                          className="w-full px-3 py-1.5 border border-amber-300 rounded-lg bg-white font-bold outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 items-center">
                      <div>
                        <label className="font-semibold text-amber-900 block mb-1">Zona Máxima (km)</label>
                        <input
                          type="number"
                          min="1"
                          value={maxHomeZoneKm}
                          onChange={(e) => setMaxHomeZoneKm(Number(e.target.value))}
                          className="w-full px-3 py-1.5 border border-amber-300 rounded-lg bg-white font-bold outline-none"
                        />
                      </div>
                      <div className="pt-5">
                        <label className="flex items-center gap-2 cursor-pointer font-semibold text-amber-950">
                          <input
                            type="checkbox"
                            checked={roundTripTravel}
                            onChange={(e) => setRoundTripTravel(e.target.checked)}
                            className="w-4 h-4 rounded text-amber-600"
                          />
                          <span>Traslado cuenta Ida y Regreso (x2 en agenda)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Reglas de Confirmación y Plazos */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-slate-600">
                  4. Reglas de Confirmación & Plazos
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Tipo de Confirmación</label>
                    <select
                      value={priceType === 'a_cotizar' ? 'aprobacion' : confirmationType}
                      disabled={priceType === 'a_cotizar'}
                      onChange={(e) => setConfirmationType(e.target.value as ConfirmationType)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold focus:ring-2 focus:ring-slate-900 outline-none disabled:bg-slate-100"
                    >
                      <option value="automatica">Automática</option>
                      <option value="aprobacion">Aprobación (Siempre manual)</option>
                      <option value="hibrida">Híbrida (Según horas de anticipación)</option>
                    </select>
                    {priceType === 'a_cotizar' && (
                      <p className="text-[10px] text-amber-700 mt-0.5">Forzado a Aprobación por ser servicio "A cotizar".</p>
                    )}
                  </div>

                  {confirmationType === 'hibrida' && priceType !== 'a_cotizar' && (
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Umbral Híbrido (Horas antes)</label>
                      <input
                        type="number"
                        min="1"
                        value={hybridHoursThreshold}
                        onChange={(e) => setHybridHoursThreshold(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold focus:ring-2 focus:ring-slate-900 outline-none"
                      />
                      <p className="text-[10px] text-slate-500 mt-0.5">Si faltan menos de X horas, requiere aprobación manual.</p>
                    </div>
                  )}

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Límite Respuesta Proveedor (min)</label>
                    <input
                      type="number"
                      min="10"
                      value={providerResponseDeadlineMinutes}
                      onChange={(e) => setProviderResponseDeadlineMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Anticipación Mínima Cancelación (h)</label>
                    <input
                      type="number"
                      min="0"
                      value={minCancellationHours}
                      onChange={(e) => setMinCancellationHours(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Personal / Terapeutas que realizan el servicio */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  5. Personal que lo Realiza
                </h4>
                {providers.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No hay terapeutas registrados en el sistema.</p>
                ) : (
                  <div className="space-y-2">
                    {providers.map((prov) => {
                      const isChecked = selectedProviderIds.includes(prov.id);
                      return (
                        <label
                          key={prov.id}
                          className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isChecked ? 'bg-rose-50/70 border-rose-300 text-slate-900' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProviderIds([...selectedProviderIds, prov.id]);
                              } else {
                                setSelectedProviderIds(selectedProviderIds.filter((id) => id !== prov.id));
                              }
                            }}
                            className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                          />
                          <div className="flex items-center gap-2 min-w-0">
                            {prov.avatarUrl ? (
                              <img src={prov.avatarUrl} alt={prov.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                                {prov.name.charAt(0)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-xs truncate">{prov.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{prov.role}</p>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 6. Grupos de Opciones Personalizables por el Cliente */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-rose-600" />
                      6. Opciones Personalizables por el Cliente
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Permite que el cliente elija complementos, variedades de botanas, capacidad o extras al agendar.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {optionGroups.length === 0 && (
                      <button
                        type="button"
                        onClick={handleLoadPresetGroups}
                        className="px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold transition-all border border-rose-200 flex items-center gap-1 active:scale-95"
                        title="Cargar grupos sugeridos para eventos"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Cargar sugerencias</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleAddNewGroup}
                      className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1 active:scale-95 shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Añadir Grupo</span>
                    </button>
                  </div>
                </div>

                {optionGroups.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500 space-y-1">
                    <p className="font-medium text-xs">No has configurado opciones personalizadas para este servicio.</p>
                    <p className="text-[11px] text-slate-400">
                      Puedes añadir grupos (ej: Capacidad de personas, Sabores de botanas, Personal adicional, Desechables).
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {optionGroups.map((group, groupIdx) => (
                      <div
                        key={group.id}
                        className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 shadow-2xs"
                      >
                        {/* Group Header Controls */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="font-bold text-slate-400 text-xs shrink-0">
                              #{groupIdx + 1}
                            </span>
                            <input
                              type="text"
                              value={group.title}
                              onChange={(e) =>
                                handleUpdateGroup(group.id, { title: e.target.value })
                              }
                              placeholder="Título del grupo (ej: Capacidad de invitados, Sabores para la barra)"
                              className="w-full px-2.5 py-1 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 min-w-0"
                            />
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {/* Single vs Multiple */}
                            <select
                              value={group.type}
                              onChange={(e) => {
                                const newType = e.target.value as 'single' | 'multiple';
                                handleUpdateGroup(group.id, {
                                  type: newType,
                                  maxSelections: newType === 'single' ? undefined : (group.maxSelections || 4),
                                });
                              }}
                              className="px-2 py-1 text-[11px] font-medium bg-white border border-slate-300 rounded"
                            >
                              <option value="single">Selección Única (1 opción)</option>
                              <option value="multiple">Selección Múltiple (Varios)</option>
                            </select>

                            {/* Max selections limit */}
                            {group.type === 'multiple' && (
                              <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                                <span className="text-[11px] font-bold text-amber-900">
                                  Máx:
                                </span>
                                <select
                                  value={group.maxSelections ?? ''}
                                  onChange={(e) => {
                                    const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
                                    handleUpdateGroup(group.id, { maxSelections: val });
                                  }}
                                  className="text-[11px] bg-white border border-amber-300 rounded px-1.5 py-0.5 font-bold text-amber-950"
                                >
                                  <option value="">Sin límite</option>
                                  <option value="2">Máx 2 opciones</option>
                                  <option value="3">Máx 3 opciones</option>
                                  <option value="4">Máx 4 opciones</option>
                                  <option value="5">Máx 5 opciones</option>
                                  <option value="6">Máx 6 opciones</option>
                                </select>
                              </div>
                            )}

                            {/* Required toggle */}
                            <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={group.required}
                                onChange={(e) =>
                                  handleUpdateGroup(group.id, { required: e.target.checked })
                                }
                                className="w-3.5 h-3.5 rounded text-slate-900"
                              />
                              <span>Obligatorio</span>
                            </label>

                            <button
                              type="button"
                              onClick={() => handleRemoveGroup(group.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors shrink-0"
                              title="Eliminar grupo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Options in this group */}
                        <div className="space-y-2">
                          <div className="text-[11px] text-slate-500 font-medium">
                            Opciones que el cliente podrá elegir para este servicio:
                          </div>

                          {group.options.map((opt) => (
                            <div
                              key={opt.id}
                              className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center gap-2"
                            >
                              <div className="flex-1 min-w-0">
                                <input
                                  type="text"
                                  value={opt.name}
                                  onChange={(e) =>
                                    handleUpdateOption(group.id, opt.id, { name: e.target.value })
                                  }
                                  placeholder="Nombre de la opción (ej: Paquete 50 personas, Charola de frutas)"
                                  className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
                                />
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                                  <span className="text-[11px] font-bold text-slate-500">
                                    Precio extra:
                                  </span>
                                  <span className="text-xs font-bold text-slate-500">{businessProfile.currency}</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={opt.priceDelta === 0 ? '' : opt.priceDelta}
                                    onChange={(e) =>
                                      handleUpdateOption(group.id, opt.id, {
                                        priceDelta: parseFloat(e.target.value) || 0,
                                      })
                                    }
                                    placeholder="0"
                                    className="w-16 px-1.5 py-0.5 text-xs font-bold bg-white border border-slate-300 rounded text-right focus:outline-none focus:ring-1 focus:ring-slate-900"
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveOption(group.id, opt.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                  title="Eliminar opción"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() => handleAddOption(group.id)}
                            className="mt-2 text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 py-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Añadir opción al grupo</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs ${theme.buttonClass}`}
              >
                Guardar Servicio
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {serviceToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-slate-200 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">¿Eliminar servicio "{serviceToDelete.name}"?</h3>
            <p className="text-slate-600">Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setServiceToDelete(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteService(serviceToDelete.id);
                  setServiceToDelete(null);
                }}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
