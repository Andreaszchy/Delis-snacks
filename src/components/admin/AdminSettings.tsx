import React, { useState } from 'react';
import {
  Sparkles,
  Palette,
  Save,
  CheckCircle2,
  Building2,
  Flame,
  Coffee,
  Heart,
  Sun,
  ShieldCheck,
  Users,
  UserPlus,
  Trash2,
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
  const [adminEmails, setAdminEmails] = useState<string[]>(businessProfile.adminEmails || []);
  const [newAdminEmail, setNewAdminEmail] = useState('');

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
    setAdminEmails(businessProfile.adminEmails || []);
  }, [businessProfile]);

  const handleAddAdminEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newAdminEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) return;
    if (adminEmails.includes(clean)) {
      setNewAdminEmail('');
      return;
    }
    const updated = [...adminEmails, clean];
    setAdminEmails(updated);
    updateBusinessProfile({ adminEmails: updated });
    setNewAdminEmail('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleRemoveAdminEmail = (emailToRemove: string) => {
    const updated = adminEmails.filter((e) => e !== emailToRemove);
    setAdminEmails(updated);
    updateBusinessProfile({ adminEmails: updated });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
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
      adminEmails,
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
                <div className="flex items-center justify-between">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-2xs"
                    style={{ backgroundColor: t.raw.primaryBtn }}
                  >
                    {icon}
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-slate-950 animate-pulse" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900 capitalize">{id}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Perfil del Negocio */}
      <form onSubmit={handleSaveProfile} className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Información del Negocio
              </h3>
              <p className="text-xs text-slate-500">
                Personaliza el nombre, eslogan y datos de contacto de tu marca.
              </p>
            </div>
          </div>

          {savedSuccess && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Guardado</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Nombre del Negocio
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Categoría Principal
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Eslogan o Descripción Breve
            </label>
            <input
              type="text"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Teléfono / WhatsApp de Contacto
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Moneda y Código
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="$"
                className="px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium text-center"
              />
              <input
                type="text"
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value)}
                placeholder="MXN"
                className="col-span-2 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium uppercase"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Dirección o Cobertura
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
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

      {/* Gestión de Administradores & Roles (100% Base de Datos Firestore) */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Administradores & Roles (Base de Datos)
            </h3>
            <p className="text-xs text-slate-500">
              Gestión dinámica de accesos gerenciales en Firestore. Los roles se leen en tiempo real sin correos fijos en el código.
            </p>
          </div>
        </div>

        <form onSubmit={handleAddAdminEmail} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              placeholder="nuevo.administrador@correo.com"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Autorizar Administrador</span>
          </button>
        </form>

        <div className="space-y-2 pt-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Cuentas con Privilegios de Administración ({adminEmails.length})
          </span>

          {adminEmails.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
              No hay administradores adicionales configurados en la base de datos.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {adminEmails.map((email) => (
                <div
                  key={email}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-200 text-xs font-medium text-indigo-950"
                >
                  <div className="flex items-center gap-2 truncate">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="truncate">{email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAdminEmail(email)}
                    className="p-1 rounded-lg text-rose-600 hover:bg-rose-100 transition-colors ml-2 shrink-0"
                    title="Remover permisos de administrador"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
