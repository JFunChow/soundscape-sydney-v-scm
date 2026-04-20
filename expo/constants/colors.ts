export const Colors = {
  ink: '#050812',
  night: '#0A0D1C',
  deep: '#0E1230',
  slate: '#161B3A',
  mist: '#8A8FB8',
  cloud: '#D7DBFF',
  paper: '#F4F7FB',
  white: '#FFFFFF',
  cyan: '#2FFFE0',
  aqua: '#00E0FF',
  teal: '#21D4B5',
  magenta: '#FF2FB8',
  neon: '#FF4FE3',
  violet: '#7C4BFF',
  coral: '#FF8A65',
  gold: '#FFD166',
  rose: '#FF5D8F',
  border: 'rgba(255,255,255,0.10)',
  overlay: 'rgba(5,8,18,0.72)',
  shadow: 'rgba(0,0,0,0.5)',
};

export const Gradients = {
  appBackground: ['#050812', '#0A0D1C', '#120B28'] as const,
  cardBackground: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)'] as const,
  heroGlow: ['rgba(255,47,184,0.25)', 'rgba(47,255,224,0.10)', 'rgba(0,0,0,0)'] as const,
  accent: ['#2FFFE0', '#00E0FF'] as const,
  neon: ['#FF2FB8', '#7C4BFF', '#00E0FF'] as const,
  sunset: ['#FF2FB8', '#FFD166'] as const,
  deepNight: ['#050812', '#0E0B28', '#1B0B2E'] as const,
};

export default {
  light: {
    text: Colors.ink,
    background: Colors.paper,
    tint: Colors.cyan,
    tabIconDefault: 'rgba(215,219,255,0.45)',
    tabIconSelected: Colors.white,
  },
};
