// src/constants/index.js

export const COLORS = {
  primary:       '#1a237e',
  primaryLight:  '#3949ab',
  primaryDark:   '#0d1757',
  accent:        '#ff6f00',
  accentLight:   '#ffa040',
  success:       '#2e7d32',
  successLight:  '#e8f5e9',
  warning:       '#f57f17',
  warningLight:  '#fff8e1',
  danger:        '#c62828',
  dangerLight:   '#ffebee',
  info:          '#1565c0',
  infoLight:     '#e3f2fd',
  white:         '#ffffff',
  background:    '#f0f2f5',
  card:          '#ffffff',
  border:        '#e0e0e0',
  text:          '#212121',
  textLight:     '#757575',
  textMuted:     '#9e9e9e',
};

export const FONTS = {
  regular:  '400',
  medium:   '500',
  semibold: '600',
  bold:     '700',
  extrabold:'800',
};

export const RADIUS = {
  sm:   8,
  md:  12,
  lg:  16,
  xl:  24,
  full: 999,
};

export const SHADOW = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
};

// ── Backend URL ───────────────────────────────────────────────────────────────
// Change this to your machine's local IP when running the Flask backend
//change this later
export const API_BASE_URL = 'http://localhost:5000';


// ── Storage keys ─────────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  TOKEN:   'gigshield_token',
  USER_ID: 'gigshield_user_id',
  USER:    'gigshield_user',
};

// ── Platform options for registration ────────────────────────────────────────
export const PLATFORMS = ['Swiggy', 'Zomato', 'Zepto', 'Blinkit', 'Amazon', 'Flipkart', 'Dunzo', 'Other'];

// ── Disruption thresholds (mirrors backend) ───────────────────────────────────
export const THRESHOLDS = {
  rain:   { value: 50,  unit: 'mm',  label: 'Heavy Rain' },
  heat:   { value: 45,  unit: '°C',  label: 'Heatwave' },
  aqi:    { value: 400, unit: 'AQI', label: 'Severe Pollution' },
};