import React, { useState } from 'react';
import {
  Sparkles,
  Palette,
  Save,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Flame,
  Coffee,
  Heart,
  Sun,
  UserPlus,
  Trash2,
  Users,
  Mail,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GoogleDriveInput } from '../common/GoogleDriveInput';
import { ThemeId } from '../../types';
import { THEMES } from '../../utils/themes';

export const AdminSettings: React.FC = () => {
  const {
    businessProfile,
    updateBusinessProfile,
    themeId,
    setThemeId,
    theme,
  } = useApp();

  const [name, setName] = useState(businessProfile.name);
  const [logoUrl, setLogoUrl] = useState(businessProfile.logoUrl || '');
  const [slogan, setSlogan] = useState(businessProfile.slogan);
  const [category, setCategory] = useState(businessProfile.category);
  const [currency, setCurrency] = useState(businessProfile.currency);
  const [currencyCode, setCurrencyCode] = useState(businessProfile.currencyCode);
  const [phone, setPhone] = useState(businessProfile.phone);
  const [address, setAddress] = useState(businessProfile.address);
  const [adminEmails, setAdminEmails] = useState<string[]>(
    businessProfile.adminEmails && businessProfile.adminEmails.length > 0
      ? businessProfile.adminEmails
      : ['jblackbourne98@gmail.com', 'jorgeandres980706@gmail.com']
  );
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const [savedSuccess, setSavedSuccess] = useState(false);

  React.useEffect(() => {
    setName(businessProfile.name);
    setLogoUrl(businessProfile.logoUrl || '');
    setSlogan(businessProfile.slogan);
    setCategory(businessProfile.category);
    setCurrency(businessProfile.currency);
    setCurrencyCode(businessProfile.currencyCode);
    setPhone(businessProfile.phone);
    setAddress(businessProfile.address);
    if (businessProfile.adminEmails && businessProfile.adminEmails.length > 0) {
      setAdminEmails(businessProfile.adminEmails);
    }
  }, [businessProfile]);

  const handleAddAdminEmail = () => {
    setEmailError('');
    const clean = newAdminEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@') || !clean.includes('.')) {
      setEmailError('Ingresa un correo electrónico válido');
      return;
    }
    if (adminEmails.some((e) => e.toLowerCase() === clean)) {
      setEmailError('Este correo ya está en la lista de administradores');
      return;
    }
    setAdminEmails([...adminEmails, clean]);
    setNewAdminEmail('');
  };

  const handleRemoveAdminEmail = (emailToRemove: string) => {
    if (adminEmails.length <= 1) {
      setEmailError('Debe existir al menos un administrador en el sistema');
      return;
    }
    setAdminEmails(adminEmails.filter((e) => e.toLowerCase() !== emailToRemove.toLowerCase()));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessProfile({
      name: name.trim(),
      logoUrl: logoUrl.trim(),
      slogan: slogan.trim(),
      category: category.trim(),
      currency: currency.trim() || '$',
      currencyCode: currencyCode.trim() || 'MXN',
      phone: phone.trim(),
      address: address.trim(),
      adminEmails: adminEmails.map((e) => e.trim().toLowerCase()).filter(Boolean),
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const themeList: Array<{ id: ThemeId; icon: React.ReactNode }> = [
    { id: 'default', icon: <Palette className="w-4 h-4" /> },
    { id: 'rosaClaro', icon: <Heart className="w-4 h-4 text-rose-500 fill-rose-500/25" /> },
    { id: 'rosa', icon: <Sparkles className="w-4 h-4 text-pink-500" /> },
    { id: 'crema', icon: <Sun className="w-4 h-4 text-amber-700" /> },
    { id: 'rojo', icon: <Flame className="w-4 h-4 text-rose-500" /> },
    { id: 'cafe', icon: <Coffee className="w-4 h-4 text-amber-800" /> },
    { id: 'naranja', icon: <Sparkles className="w-4 h-4 text-orange-500" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Selector de Temas & Color de Fondo */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1 flex items-center gap-2">
            <Palette className="w-4 h-4 text-slate-700" />
            Temas Visuales y Color de Fondo
          </h3>

        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {themeList.map(({ id, icon }) => {
            const t = THEMES[id];
            const isSelected = themeId === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => setThemeId(id)}
                className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'border-slate-950 bg-slate-50 ring-2 ring-slate-950 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs sm:text-sm truncate">
                    {icon}
                    <span className="truncate">{t.name}</span>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1.5 border-t border-slate-100">
                  <div
                    className="w-4 h-4 rounded-full border border-slate-300 shrink-0"
                    style={{ backgroundColor: t.raw.bg }}
                    title="Fondo"
                  />
                  <div
                    className={`flex-1 py-1 px-2 rounded-lg text-[10px] sm:text-[11px] font-bold text-center shadow-2xs truncate ${t.buttonClass}`}
                  >
                    Botón
                  </div>
                </div>
              </button>
            );
          })}
        </div>


      </div>

      {/* BUSINESS PROFILE CONFIGURATION FORM */}
      <form
        onSubmit={handleSaveProfile}
        className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Identidad del Negocio & Datos Comerciales
            </h3>
          </div>
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              ¡Guardado exitosamente!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Nombre Comercial del Negocio *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Giro o Categoría Comercial
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="font-semibold text-slate-700 block mb-1">
              Eslogan o Frase de Presentación
            </label>
            <input
              type="text"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Símbolo de Moneda (ej. $)
            </label>
            <input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono font-bold"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Código de Moneda (ej. MXN, USD, COP, EUR)
            </label>
            <input
              type="text"
              value={currencyCode}
              onChange={(e) => setCurrencyCode(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Teléfono / WhatsApp (para pedidos y recepción de comprobantes)
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Dirección del Establecimiento
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <div className="sm:col-span-2 pt-2 border-t border-slate-100">
            <GoogleDriveInput
              value={logoUrl}
              onChange={(normalized) => setLogoUrl(normalized)}
              label="Logotipo del Negocio (Google Drive o Enlace Directo)"
              placeholder="https://drive.google.com/file/d/... o https://..."
              helperText="Pega el enlace compartido de Google Drive de tu logotipo para normalizarlo automáticamente y mostrarlo en la barra superior."
            />
          </div>

          {/* Gestión Dinámica de Administradores */}
          <div className="sm:col-span-2 pt-4 border-t border-slate-200">
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/90 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Administradores Autorizados (Acceso Gerencial)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Gestiona quién tiene permisos de administración. Si cambia el dueño o se añade un socio, solo añade su correo aquí sin necesidad de editar ni republicar reglas de Firestore.
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-700 font-mono shrink-0">
                  {adminEmails.length} admin{adminEmails.length === 1 ? '' : 's'}
                </span>
              </div>

              {/* Add Admin Email Input */}
              <div className="flex items-center gap-2 pt-1">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => {
                      setNewAdminEmail(e.target.value);
                      setEmailError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAdminEmail();
                      }
                    }}
                    placeholder="nuevo.administrador@gmail.com"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddAdminEmail}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Añadir</span>
                </button>
              </div>

              {emailError && (
                <p className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200 animate-in fade-in">
                  {emailError}
                </p>
              )}

              {/* Admin Emails List */}
              <div className="space-y-1.5 pt-1">
                {adminEmails.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between gap-2 px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs shadow-2xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="font-semibold text-slate-800 truncate font-mono">{email}</span>
                    </div>
                    {adminEmails.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => handleRemoveAdminEmail(email)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                        title="Quitar acceso de administrador"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium italic">Principal</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all active:scale-95 ${theme.buttonClass}`}
          >
            <Save className="w-4 h-4" />
            <span>Guardar Configuración</span>
          </button>
        </div>
      </form>
    </div>
  );
};
