import React, { useState, useRef, useEffect } from 'react';
import {
  ShoppingBag,
  ShieldCheck,
  User,
  Package,
  Layers,
  Sparkles,
  TrendingUp,
  Settings,
  ChevronDown,
  Calendar,
  Bell,
  Truck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AuthModal } from './AuthModal';
import { NotificationDrawer } from './NotificationDrawer';

export const Header: React.FC = () => {
  const {
    theme,
    businessProfile,
    currentUser,
    switchRole,
    cartCount,
    setIsCartDrawerOpen,
    unreadNotificationsCount,
    isNotificationDrawerOpen,
    setIsNotificationDrawerOpen,
    adminTab,
    setAdminTab,
    customerTab,
    setCustomerTab,
    orders,
    products,
    appointments,
    isAuthModalOpen,
    setIsAuthModalOpen,
  } = useApp();

  const [isPageMenuOpen, setIsPageMenuOpen] = useState(false);
  const pageMenuRef = useRef<HTMLDivElement>(null);

  const isAdmin = currentUser.role === 'admin';

  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'pendiente' || o.status === 'en_preparacion'
  ).length;

  const lowStockCount = products.filter((p) => p.stock <= p.minStockAlert).length;

  // Admin pages list with clean icons and names
  const adminPages = [
    {
      id: 'resumen' as const,
      name: 'Dashboard & Métricas',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: 'agenda' as const,
      name: 'Agenda & Eventos',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: 'pedidos' as const,
      name: 'Pedidos & Ventas',
      icon: <ShoppingBag className="w-4 h-4" />,
      badge: pendingOrdersCount,
    },
    {
      id: 'inventario' as const,
      name: 'Gestión de Inventario',
      icon: <Package className="w-4 h-4" />,
      badge: lowStockCount,
    },
    {
      id: 'servicios' as const,
      name: 'Servicios & Eventos',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'catalogo' as const,
      name: 'Catálogo de Productos',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      id: 'banners' as const,
      name: 'Banners & Promos',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'configuracion' as const,
      name: 'Temas & Licencia',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const currentPage = adminPages.find((p) => p.id === adminTab) || adminPages[0];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pageMenuRef.current && !pageMenuRef.current.contains(event.target as Node)) {
        setIsPageMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${theme.headerBgClass}`}>
        {/* Top bar: Business Name on the left, Login/Account Popup button on the right */}
        {(() => {
          const isLightTopBar = theme.id === 'rosaClaro';
          return (
            <div
              className={`px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-xs transition-colors ${isLightTopBar ? 'text-rose-950' : 'text-white'}`}
              style={{ backgroundColor: theme.raw.primaryBtn }}
            >
              {/* Business Name Branding */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-lg font-black text-sm flex items-center justify-center shrink-0 border shadow-2xs overflow-hidden relative ${isLightTopBar ? 'bg-rose-200/60 text-rose-950 border-rose-300' : 'bg-white/10 text-white border-white/20'}`}>
                  {businessProfile.name ? (
                    <span>{businessProfile.name.charAt(0).toUpperCase()}</span>
                  ) : (
                    <div className={`w-3.5 h-3.5 rounded-xs animate-pulse ${isLightTopBar ? 'bg-rose-300/60' : 'bg-white/20'}`} />
                  )}
                  {Boolean(businessProfile.logoUrl && businessProfile.logoUrl.trim()) && (
                    <img
                      src={businessProfile.logoUrl}
                      alt={businessProfile.name || 'Logo'}
                      className="absolute inset-0 w-full h-full object-cover bg-white"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>
                <div className="min-w-0">
                  {businessProfile.name ? (
                    <h1 className={`text-sm sm:text-base font-extrabold tracking-tight truncate leading-tight ${isLightTopBar ? 'text-rose-950' : 'text-white'}`}>
                      {businessProfile.name}
                    </h1>
                  ) : (
                    <div className={`h-4 w-32 rounded animate-pulse my-0.5 ${isLightTopBar ? 'bg-rose-300/60' : 'bg-white/20'}`} />
                  )}
                  {businessProfile.slogan && (
                    <p className={`text-[10px] truncate hidden sm:block ${isLightTopBar ? 'text-rose-800/80' : 'text-slate-300'}`}>
                      {businessProfile.slogan}
                    </p>
                  )}
                </div>
              </div>

              {/* Right side in Top Bar: User Profile / Login Button */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Login / Role Profile Button (opens popup modal) */}
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all shrink-0 active:scale-95 ${
                    isLightTopBar
                      ? 'bg-rose-200/50 hover:bg-rose-300/60 text-rose-950 border-rose-300'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                  }`}
                  title="Abrir inicio de sesión / cambiar perfil"
                >
                  {isAdmin ? (
                    <>
                      <ShieldCheck className={`w-3.5 h-3.5 ${isLightTopBar ? 'text-rose-700' : 'text-indigo-300'}`} />
                      <span className="hidden xs:inline">Admin:</span>
                      <span className={isLightTopBar ? 'text-rose-900 font-bold' : 'text-indigo-100'}>Gerencia</span>
                    </>
                  ) : currentUser.isLoggedIn ? (
                    <>
                      {Boolean(currentUser.photoUrl && currentUser.photoUrl.trim()) ? (
                        <img
                          src={currentUser.photoUrl}
                          alt={currentUser.name}
                          className={`w-4 h-4 rounded-full object-cover border ${isLightTopBar ? 'border-rose-400' : 'border-white/30'}`}
                        />
                      ) : (
                        <User className={`w-3.5 h-3.5 ${isLightTopBar ? 'text-rose-700' : 'text-emerald-300'}`} />
                      )}
                      <span className="truncate max-w-[85px] sm:max-w-[110px]">
                        {currentUser.name || 'Mi Cuenta'}
                      </span>
                    </>
                  ) : (
                    <>
                      <User className={`w-3.5 h-3.5 ${isLightTopBar ? 'text-rose-700' : 'text-white/80'}`} />
                      <span>Acceder</span>
                    </>
                  )}
                  <ChevronDown className={`w-3 h-3 ml-0.5 ${isLightTopBar ? 'text-rose-700/80' : 'text-white/70'}`} />
                </button>
              </div>
            </div>
          );
        })()}

        {/* Discreet secondary sub-bar under top bar: Cart and Notifications */}
        {!isAdmin && (
          <div className="bg-slate-50/95 backdrop-blur-xs border-b border-slate-200/80 px-4 sm:px-6 py-1.5 transition-colors">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium truncate">
                <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">Envíos a domicilio & Barras de snacks para eventos</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Botón discreto de Notificaciones */}
                <button
                  type="button"
                  onClick={() => setIsNotificationDrawerOpen(true)}
                  className="relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 text-xs font-semibold shadow-2xs transition-all active:scale-95"
                  title="Avisos y Notificaciones"
                  aria-label="Abrir centro de notificaciones"
                >
                  <Bell className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[11px] hidden xs:inline">Avisos</span>
                  {unreadNotificationsCount > 0 && (
                    <span className="bg-rose-600 text-white text-[10px] font-black px-1.5 min-w-4 h-4 rounded-full flex items-center justify-center">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>

                {/* Botón discreto de Carrito */}
                <button
                  type="button"
                  onClick={() => setIsCartDrawerOpen(true)}
                  className="relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-950 border border-slate-200 text-xs font-semibold shadow-2xs transition-all active:scale-95"
                  title="Ver Carrito de Compras"
                  aria-label="Abrir carrito"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[11px]">Carrito</span>
                  {cartCount > 0 ? (
                    <span className="bg-rose-600 text-white text-[10px] font-black px-1.5 min-w-4 h-4 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-normal">0</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lower navigation bar: Only for Admin pages selector */}
        {isAdmin && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-13 sm:h-14 flex items-center justify-between gap-3 border-t border-slate-100">
            {/* Admin Single Clean Page Selector */}
            <div className="relative" ref={pageMenuRef}>
              <button
                type="button"
                onClick={() => setIsPageMenuOpen(!isPageMenuOpen)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-900 font-bold text-xs sm:text-sm transition-all shadow-2xs active:scale-98"
              >
                <span className="text-slate-800 flex items-center">
                  {currentPage.icon}
                </span>
                <span>{currentPage.name}</span>
                {currentPage.badge && currentPage.badge > 0 ? (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-600 text-white">
                    {currentPage.badge}
                  </span>
                ) : null}
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                    isPageMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu of Admin Sections */}
              {isPageMenuOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Seleccionar Página / Módulo
                  </div>
                  {adminPages.map((page) => (
                    <button
                      key={page.id}
                      type="button"
                      onClick={() => {
                        setAdminTab(page.id);
                        setIsPageMenuOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs transition-colors rounded-xl ${
                        adminTab === page.id
                          ? 'text-white font-bold shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                      style={
                        adminTab === page.id
                          ? { backgroundColor: theme.raw.primaryBtn, color: theme.raw.primaryBtnText }
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={adminTab === page.id ? 'text-white' : 'text-slate-500'}>
                          {page.icon}
                        </span>
                        <span>{page.name}</span>
                      </div>
                      {page.badge && page.badge > 0 ? (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                            adminTab === page.id
                              ? 'bg-rose-500 text-white'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {page.badge}
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Admin Discreet Notifications Button */}
            <button
              type="button"
              onClick={() => setIsNotificationDrawerOpen(true)}
              className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition-all active:scale-95"
              title="Centro de Notificaciones & Avisos"
              aria-label="Abrir centro de notificaciones"
            >
              <Bell className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden xs:inline text-xs">Avisos</span>
              {unreadNotificationsCount > 0 && (
                <span className="bg-rose-600 text-white text-[10px] font-black px-1.5 min-w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
          </div>
        )}
      </header>

      {/* Auth Modal Popup */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Notification Drawer Center */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
      />
    </>
  );
};
