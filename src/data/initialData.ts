import { BusinessProfile, Ingredient, Order, Product, PromoBanner, Provider, DaySchedule, Service, Appointment } from '../types';

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'serv-barra-eventos',
    name: 'Mesa de Snacks para Fiestas y Eventos',
    description: 'Montaje completo de mesa con variedad de elotes en vaso, charolas de fruta fresca con chamoy artesanal, gomitas enchiladas y botanas crujientes.',
    imageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=1200&auto=format&fit=crop&q=80',
    category: 'Eventos & Banquetes',
    price: 1500,
    priceType: 'desde',
    durationMinutes: 120,
    bufferMinutes: 30,
    modality: 'domicilio',
    travelSurcharge: 100,
    travelTimeMinutes: 30,
    roundTripTravel: true,
    maxHomeZoneKm: 30,
    confirmationType: 'automatica',
    hybridHoursThreshold: 6,
    providerResponseDeadlineMinutes: 120,
    minCancellationHours: 24,
    minNoticeHours: 12,
    providerIds: ['prov-1'],
    available: true,
    optionGroups: [
      {
        id: 'optgrp-invitados',
        title: 'Capacidad & Número de Personas',
        type: 'single',
        required: true,
        options: [
          { id: 'opt-30p', name: 'Paquete Básico (30 personas)', priceDelta: 0 },
          { id: 'opt-50p', name: 'Paquete Mediano (50 personas)', priceDelta: 600 },
          { id: 'opt-100p', name: 'Paquete Grande (100 personas)', priceDelta: 1600 },
        ],
      },
      {
        id: 'optgrp-variedad',
        title: 'Selecciona las Botanas y Dulces para tu Barra',
        type: 'multiple',
        required: true,
        maxSelections: 4,
        options: [
          { id: 'opt-gomitas-delis', name: 'Gomitas Enchiladas Surtidas', priceDelta: 0 },
          { id: 'opt-fruta-chamoy', name: 'Charola de Fruta con Chamoy y Tajín', priceDelta: 0 },
          { id: 'opt-chicharrones', name: 'Papas y Chicharrones Preparados', priceDelta: 0 },
          { id: 'opt-elotes-vaso', name: 'Vasitos de Elote con Mayonesa y Queso', priceDelta: 250 },
          { id: 'opt-manzanas-chamoy', name: 'Manzanas Cubiertas de Chamoy Delis', priceDelta: 180 },
        ],
      },
      {
        id: 'optgrp-extras-servicio',
        title: 'Complementos y Servicios Adicionales',
        type: 'multiple',
        required: false,
        options: [
          { id: 'opt-operador-extra', name: 'Personal de atención por 1 hr extra', priceDelta: 300 },
          { id: 'opt-desechables-lujo', name: 'Platitos y Servilletas Temáticas de Lujo', priceDelta: 150 },
          { id: 'opt-fuente-chamoy', name: 'Fuente de Chamoy Líquido Delis', priceDelta: 450 },
        ],
      },
    ],
  },
];

export const INITIAL_APPOINTMENTS: Appointment[] = [];

export const INITIAL_WEEKLY_SCHEDULE: DaySchedule[] = [
  { dayOfWeek: 0, enabled: true, startTime: '10:00', endTime: '23:00' }, // Domingo
  { dayOfWeek: 1, enabled: true, startTime: '11:00', endTime: '22:00', breakStartTime: '15:00', breakEndTime: '16:00' }, // Lunes
  { dayOfWeek: 2, enabled: true, startTime: '11:00', endTime: '22:00', breakStartTime: '15:00', breakEndTime: '16:00' }, // Martes
  { dayOfWeek: 3, enabled: true, startTime: '11:00', endTime: '22:00', breakStartTime: '15:00', breakEndTime: '16:00' }, // Miércoles
  { dayOfWeek: 4, enabled: true, startTime: '11:00', endTime: '23:00', breakStartTime: '15:00', breakEndTime: '16:00' }, // Jueves
  { dayOfWeek: 5, enabled: true, startTime: '11:00', endTime: '23:30', breakStartTime: '15:00', breakEndTime: '16:00' }, // Viernes
  { dayOfWeek: 6, enabled: true, startTime: '10:00', endTime: '23:30' }, // Sábado
];

export const INITIAL_PROVIDERS: Provider[] = [
  {
    id: 'prov-1',
    name: 'Equipo Delis Snacks',
    role: 'Atención al Cliente & Eventos',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    active: true,
    weeklySchedule: INITIAL_WEEKLY_SCHEDULE,
  },
];

export const INITIAL_BUSINESS_PROFILE: BusinessProfile = {
  name: 'Delis Snacks',
  slogan: 'Botanas mexicanas, gomitas enchiladas, fruta con chile y barras de snacks para eventos',
  logoUrl: '',
  category: 'Botanas & Snacks Mexicanos',
  currency: '$',
  currencyCode: 'MXN',
  phone: '+52 669 593 4225',
  address: 'CDMX & Área Metropolitana (Envíos locales y barras para eventos)',
  currentTheme: 'rojo',
  enableStockControl: true,
  licenseCode: 'LIC-DELISSNACKS-2026',
  customBackgroundColor: '',
  adminEmails: ['jblackbourne98@gmail.com', 'jorgeandres980706@gmail.com'],
};

// Sabores de gomitas y dulces enchilados para "¡Ármala a tu gusto!"
const GOMITAS_OPTIONS = [
  { id: 'opt-gusanitos', name: 'Gusanitos', priceDelta: 0 },
  { id: 'opt-panditas', name: 'Panditas', priceDelta: 0 },
  { id: 'opt-aros-durazno', name: 'Aros de durazno', priceDelta: 0 },
  { id: 'opt-aros-manzana', name: 'Aros de manzana', priceDelta: 0 },
  { id: 'opt-sandias', name: 'Sandías', priceDelta: 0 },
  { id: 'opt-manguitos', name: 'Manguitos', priceDelta: 0 },
  { id: 'opt-tiritas', name: 'Tiritas aciditas', priceDelta: 0 },
  { id: 'opt-corazones', name: 'Corazones', priceDelta: 0 },
  { id: 'opt-aciduladitos', name: 'Aciduladitos', priceDelta: 0 },
  { id: 'opt-tamarindos', name: 'Tamarindos', priceDelta: 0 },
  { id: 'opt-cherry-sours', name: 'Cherry sours', priceDelta: 0 },
  { id: 'opt-bolitas-chamoy', name: 'Bolitas de chamoy', priceDelta: 0 },
  { id: 'opt-tiburones', name: 'Tiburones', priceDelta: 0 },
];

const CHILE_OPTIONS = [
  { id: 'opt-chile-regular', name: 'Equilibrado (Dulce, acidito y chilito Delis)', priceDelta: 0 },
  { id: 'opt-chile-extra', name: 'Extra Chamoy y Chile en Polvo', priceDelta: 5 },
  { id: 'opt-chile-ligero', name: 'Toque Ligero (Poco picante)', priceDelta: 0 },
  { id: 'opt-chile-fuego', name: 'Fuego Intenso (Extra picosito)', priceDelta: 5 },
];

export const INITIAL_PRODUCTS: Product[] = [
  // --- GOMITAS Y DULCES ENCHILADOS ---
  {
    id: 'prod-delis-bolsa-50g',
    name: 'Bolsa de Gomitas Enchiladas (50 gr)',
    description: 'Bolsita individual de 50 gr de gomitas y dulces con delicioso toque acidito, chamoy artesanal Delis Snacks y chile en polvo. ¡Ármala a tu gusto!',
    category: 'Gomitas y Dulces',
    type: 'comida',
    price: 20,
    costPrice: 9,
    stock: 120,
    minStockAlert: 15,
    imageUrl: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=600&auto=format&fit=crop&q=80',
    available: true,
    badge: 'MÁS VENDIDO',
    optionGroups: [
      {
        id: 'group-sabores-50',
        title: '¡Ármala a tu gusto! Elige hasta 3 sabores',
        type: 'multiple',
        required: false,
        maxSelections: 3,
        options: GOMITAS_OPTIONS,
      },
      {
        id: 'group-chile-50',
        title: 'Nivel de Chile & Chamoy',
        type: 'single',
        required: false,
        options: CHILE_OPTIONS,
      },
    ],
  },
  {
    id: 'prod-delis-bolsa-100g',
    name: 'Bolsa de Gomitas Enchiladas (100 gr)',
    description: 'Bolsa de 100 gr con la combinación perfecta de dulce, ácido y picante. Tus antojos callejeros preparados con la receta especial Delis Snacks.',
    category: 'Gomitas y Dulces',
    type: 'comida',
    price: 35,
    costPrice: 15,
    stock: 90,
    minStockAlert: 15,
    imageUrl: 'https://images.unsplash.com/photo-1575224300306-1b8da36134ec?w=600&auto=format&fit=crop&q=80',
    available: true,
    badge: 'FAVORITO',
    optionGroups: [
      {
        id: 'group-sabores-100',
        title: '¡Ármala a tu gusto! Elige hasta 4 sabores',
        type: 'multiple',
        required: false,
        maxSelections: 4,
        options: GOMITAS_OPTIONS,
      },
      {
        id: 'group-chile-100',
        title: 'Nivel de Chile & Chamoy',
        type: 'single',
        required: false,
        options: CHILE_OPTIONS,
      },
    ],
  },
  {
    id: 'prod-delis-frasco-180g',
    name: 'Frasco de Gomitas Enchiladas (180 gr)',
    description: 'Práctico frasco hermético reutilizable de 180 gr con abundantes gomitas bañadas en chamoy y chile en polvo. Ideal para regalar o botanear.',
    category: 'Gomitas y Dulces',
    type: 'comida',
    price: 85,
    costPrice: 38,
    stock: 55,
    minStockAlert: 10,
    imageUrl: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=600&auto=format&fit=crop&q=80',
    available: true,
    badge: 'REUTILIZABLE',
    optionGroups: [
      {
        id: 'group-sabores-180',
        title: '¡Ármala a tu gusto! Elige hasta 4 sabores',
        type: 'multiple',
        required: false,
        maxSelections: 4,
        options: GOMITAS_OPTIONS,
      },
      {
        id: 'group-chile-180',
        title: 'Nivel de Chile & Chamoy',
        type: 'single',
        required: false,
        options: CHILE_OPTIONS,
      },
    ],
  },
  {
    id: 'prod-delis-charola-400g',
    name: 'Charola Botanera de Gomitas (400 gr)',
    description: 'Gran charola surtida de 400 gr con divisiones para botanear en fiestas y reuniones. ¡Combina todos tus antojos favoritos!',
    category: 'Gomitas y Dulces',
    type: 'comida',
    price: 130,
    costPrice: 58,
    stock: 40,
    minStockAlert: 8,
    imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&auto=format&fit=crop&q=80',
    available: true,
    badge: 'PARA COMPARTIR',
    optionGroups: [
      {
        id: 'group-sabores-400',
        title: '¡Ármala a tu gusto! Elige hasta 4 sabores',
        type: 'multiple',
        required: false,
        maxSelections: 4,
        options: GOMITAS_OPTIONS,
      },
      {
        id: 'group-chile-400',
        title: 'Nivel de Chile & Chamoy',
        type: 'single',
        required: false,
        options: CHILE_OPTIONS,
      },
    ],
  },

  // --- MENÚ FRUTA ENCHILADA ---
  {
    id: 'prod-delis-manzana-forrada',
    name: 'Manzana Forrada Tradicional',
    description: 'Manzana verde crujiente forrada con auténtica pulpa de tamarindo, chamoy y chile en polvo, con una porción de chamoy Delis Snacks.',
    category: 'Fruta Enchilada',
    type: 'comida',
    price: 45,
    costPrice: 19,
    stock: 50,
    minStockAlert: 10,
    imageUrl: 'https://images.unsplash.com/photo-1619895092538-128341789043?w=600&auto=format&fit=crop&q=80',
    available: true,
    badge: 'CLÁSICO',
    optionGroups: [
      {
        id: 'group-chile-manzana',
        title: 'Nivel de picor',
        type: 'single',
        required: false,
        options: [
          { id: 'opt-manzana-reg', name: 'Chamoy tradicional y chilito en polvo', priceDelta: 0 },
          { id: 'opt-manzana-extra', name: 'Extra porción de chamoy Delis Snacks (+$5)', priceDelta: 5 },
        ],
      },
    ],
  },
  {
    id: 'prod-delis-manzana-preparada',
    name: 'Manzana Forrada Preparada',
    description: 'Manzana verde forrada de tamarindo, acompañada de cacahuates crujientes, churros de maíz y 2 tipos de gomitas enchiladas (50 gr).',
    category: 'Fruta Enchilada',
    type: 'comida',
    price: 75,
    costPrice: 32,
    stock: 40,
    minStockAlert: 10,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    available: true,
    badge: 'ESPECIALIDAD',
    optionGroups: [
      {
        id: 'group-gomitas-prep',
        title: 'Elige tus 2 tipos de gomitas enchiladas (50 gr)',
        type: 'multiple',
        required: false,
        maxSelections: 2,
        options: GOMITAS_OPTIONS,
      },
      {
        id: 'group-cacahuates-prep',
        title: 'Tipo de Cacahuates',
        type: 'single',
        required: false,
        options: [
          { id: 'opt-cac-jap', name: 'Cacahuates Japoneses', priceDelta: 0 },
          { id: 'opt-cac-ench', name: 'Cacahuates Enchilados', priceDelta: 0 },
          { id: 'opt-cac-mix', name: 'Mixtos (Japoneses + Enchilados)', priceDelta: 0 },
        ],
      },
    ],
  },
  {
    id: 'prod-delis-sandileta',
    name: 'Sandileta Delis',
    description: 'Sandía fresca forrada en dulce Fruit by the Foot, chamoy Delis Snacks y chile en polvo, acompañada de limón y una porción de chamoy.',
    category: 'Fruta Enchilada',
    type: 'comida',
    price: 75,
    costPrice: 30,
    stock: 45,
    minStockAlert: 10,
    imageUrl: 'https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?w=600&auto=format&fit=crop&q=80',
    available: true,
    badge: 'FAVORITA',
    optionGroups: [],
  },
  {
    id: 'prod-delis-uvas-forradas',
    name: 'Uvas Forradas en Tamarindo',
    description: 'Uvas frescas forradas en pulpa de tamarindo con chamoy y chile en polvo, acompañadas de una porción de chamoy Delis Snacks.',
    category: 'Fruta Enchilada',
    type: 'comida',
    price: 55,
    costPrice: 24,
    stock: 50,
    minStockAlert: 10,
    imageUrl: 'https://images.unsplash.com/photo-1596363505729-4190a9506133?w=600&auto=format&fit=crop&q=80',
    available: true,
    badge: 'TOP SNACK',
    optionGroups: [
      {
        id: 'group-uvas-cantidad',
        title: 'Presentación / Cantidad de uvas',
        type: 'single',
        required: true,
        options: [
          { id: 'opt-uvas-8', name: '8 uvas forradas ($55)', priceDelta: 0 },
          { id: 'opt-uvas-12', name: '12 uvas forradas ($80)', priceDelta: 25 },
          { id: 'opt-uvas-16', name: '16 uvas forradas ($105)', priceDelta: 50 },
          { id: 'opt-uvas-20', name: '20 uvas forradas ($130)', priceDelta: 75 },
        ],
      },
    ],
  },

  // --- BARRA DE SNACKS PARA EVENTOS ---
  {
    id: 'prod-delis-barra-eventos',
    name: 'Barra de Snacks para Eventos',
    description: 'Barra interactiva de snacks mexicanos: elotes en vaso, fruta picada con chile, cacahuates variados, gomitas y dulces enchilados. Tus invitados eligen y se sirven a su gusto. Ideal para cumpleaños, baby showers, reuniones, eventos escolares y empresariales.',
    category: 'Barra para Eventos',
    type: 'comida',
    price: 0,
    costPrice: 0,
    stock: 999,
    minStockAlert: 1,
    imageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600&auto=format&fit=crop&q=80',
    available: true,
    badge: 'EVENTOS',
    optionGroups: [
      {
        id: 'group-evento-tipo',
        title: 'Tipo de Evento o Celebración',
        type: 'single',
        required: true,
        options: [
          { id: 'opt-ev-cumple', name: 'Fiesta de Cumpleaños', priceDelta: 0 },
          { id: 'opt-ev-baby', name: 'Baby Shower', priceDelta: 0 },
          { id: 'opt-ev-reunion', name: 'Reunión Familiar / Amigos', priceDelta: 0 },
          { id: 'opt-ev-escolar', name: 'Evento Escolar / Graduación', priceDelta: 0 },
          { id: 'opt-ev-empresarial', name: 'Evento Empresarial / Corporativo', priceDelta: 0 },
        ],
      },
      {
        id: 'group-evento-invitados',
        title: 'Cantidad estimada de invitados',
        type: 'single',
        required: false,
        options: [
          { id: 'opt-inv-20', name: '20 a 30 invitados', priceDelta: 0 },
          { id: 'opt-inv-50', name: '30 a 50 invitados', priceDelta: 0 },
          { id: 'opt-inv-80', name: '50 a 80 invitados', priceDelta: 0 },
          { id: 'opt-inv-100', name: 'Más de 80 invitados', priceDelta: 0 },
        ],
      },
    ],
  },
];

export const INITIAL_BANNERS: PromoBanner[] = [
  {
    id: 'ban-delis-1',
    title: '¡Antojos que Conquistan Tu Paladar!',
    subtitle: 'Lo dulce, ácido y picante de las auténticas botanas mexicanas.',
    badge: 'NOVEDAD',
    imageUrl: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=1200&auto=format&fit=crop&q=80',
    active: true,
    tagline: 'Delis Snacks',
  },
  {
    id: 'ban-delis-2',
    title: '¡Ármala a tu gusto!',
    subtitle: 'Bolsas, frascos y charolas de gomitas enchiladas con tus sabores preferidos.',
    badge: 'PROMOCIÓN',
    imageUrl: 'https://images.unsplash.com/photo-1575224300306-1b8da36134ec?w=1200&auto=format&fit=crop&q=80',
    active: true,
    tagline: 'Personaliza tu mezcla',
  },
  {
    id: 'ban-delis-3',
    title: 'Barra de Snacks para Eventos',
    subtitle: 'Elotes en vaso, fruta con chile, cacahuates y gomitas enchiladas para tus fiestas.',
    badge: 'ANUNCIO',
    imageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=1200&auto=format&fit=crop&q=80',
    active: true,
    tagline: 'Cumpleaños, baby showers y reuniones',
    targetType: 'service',
    targetServiceId: 'serv-barra-eventos',
  },
];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_INGREDIENTS: Ingredient[] = [
  { id: 'ing-chamoy', name: 'Chamoy Especial Delis Snacks', unit: 'l', stock: 25, minStockAlert: 5, costPerUnit: 45, category: 'Salsas & Chiles', supplier: 'Elaboración Delis' },
  { id: 'ing-chile-polvo', name: 'Chile en Polvo Acidito', unit: 'kg', stock: 15, minStockAlert: 3, costPerUnit: 60, category: 'Salsas & Chiles', supplier: 'Distribuidora Central' },
  { id: 'ing-pulpa-tamarindo', name: 'Pulpa de Tamarindo Artesanal', unit: 'kg', stock: 20, minStockAlert: 4, costPerUnit: 50, category: 'Bases & Pulpa', supplier: 'Productores Morelos' },
  { id: 'ing-manzanas', name: 'Manzanas Verdes Granny Smith', unit: 'unidad', stock: 95, minStockAlert: 20, costPerUnit: 8, category: 'Fruta Fresca', supplier: 'Central de Abastos' },
  { id: 'ing-sandia', name: 'Sandía Fresca', unit: 'kg', stock: 35, minStockAlert: 10, costPerUnit: 14, category: 'Fruta Fresca', supplier: 'Central de Abastos' },
  { id: 'ing-uvas', name: 'Uvas Frescas sin Semilla', unit: 'kg', stock: 20, minStockAlert: 5, costPerUnit: 65, category: 'Fruta Fresca', supplier: 'Central de Abastos' },
  { id: 'ing-fruit-foot', name: 'Dulce Fruit by the Foot', unit: 'unidad', stock: 60, minStockAlert: 15, costPerUnit: 12, category: 'Dulces Especiales', supplier: 'Importadora' },
  { id: 'ing-cacahuates-jap', name: 'Cacahuates Japoneses', unit: 'kg', stock: 18, minStockAlert: 5, costPerUnit: 35, category: 'Semillas & Botanas', supplier: 'Distribuidora Botanas' },
  { id: 'ing-cacahuates-ench', name: 'Cacahuates Enchilados', unit: 'kg', stock: 18, minStockAlert: 5, costPerUnit: 38, category: 'Semillas & Botanas', supplier: 'Distribuidora Botanas' },
  { id: 'ing-churros-maiz', name: 'Churros de Maíz Crujientes', unit: 'kg', stock: 15, minStockAlert: 4, costPerUnit: 30, category: 'Semillas & Botanas', supplier: 'Distribuidora Botanas' },
  { id: 'ing-elotes', name: 'Grano de Elote Dulce / Tierno', unit: 'kg', stock: 25, minStockAlert: 6, costPerUnit: 25, category: 'Barra Eventos', supplier: 'Agro Alimentos' },
  { id: 'ing-gomitas-gusanitos', name: 'Gomitas Gusanitos', unit: 'kg', stock: 10, minStockAlert: 2, costPerUnit: 55, category: 'Gomitas', supplier: 'Dulces Mayoreo' },
  { id: 'ing-gomitas-panditas', name: 'Gomitas Panditas', unit: 'kg', stock: 12, minStockAlert: 2, costPerUnit: 55, category: 'Gomitas', supplier: 'Dulces Mayoreo' },
  { id: 'ing-gomitas-manguitos', name: 'Gomitas Manguitos con Chile', unit: 'kg', stock: 12, minStockAlert: 2, costPerUnit: 60, category: 'Gomitas', supplier: 'Dulces Mayoreo' },
  { id: 'ing-gomitas-sandias', name: 'Gomitas Sandías', unit: 'kg', stock: 10, minStockAlert: 2, costPerUnit: 55, category: 'Gomitas', supplier: 'Dulces Mayoreo' },
  { id: 'ing-bolsas-50', name: 'Bolsitas para 50 gr', unit: 'unidad', stock: 250, minStockAlert: 50, costPerUnit: 0.8, category: 'Empaques', supplier: 'Empaques del Centro' },
  { id: 'ing-bolsas-100', name: 'Bolsitas para 100 gr', unit: 'unidad', stock: 200, minStockAlert: 40, costPerUnit: 1.2, category: 'Empaques', supplier: 'Empaques del Centro' },
  { id: 'ing-frascos-180', name: 'Frascos Herméticos 180 gr', unit: 'unidad', stock: 70, minStockAlert: 20, costPerUnit: 8.5, category: 'Empaques', supplier: 'Envases y Plásticos' },
  { id: 'ing-charolas-400', name: 'Charolas Botaneras 400 gr', unit: 'unidad', stock: 60, minStockAlert: 15, costPerUnit: 7.0, category: 'Empaques', supplier: 'Envases y Plásticos' },
];
