export const Colors = {
  ink: '#08131F',
  night: '#0B1724',
  slate: '#13273A',
  mist: '#8CA3B8',
  cloud: '#DCE7F2',
  paper: '#F4F7FB',
  white: '#FFFFFF',
  cyan: '#63E6FF',
  aqua: '#2EC5FF',
  teal: '#21D4B5',
  coral: '#FF8A65',
  gold: '#FFD166',
  rose: '#FF5D8F',
  border: 'rgba(255,255,255,0.12)',
  overlay: 'rgba(6, 16, 26, 0.72)',
  shadow: 'rgba(5, 16, 28, 0.24)',
};

export const Gradients = {
  appBackground: ['#07111C', '#0C1D2E', '#132B3E'] as const,
  cardBackground: ['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.08)'] as const,
  heroGlow: ['rgba(99,230,255,0.22)', 'rgba(33,212,181,0.06)', 'rgba(0,0,0,0)'] as const,
  accent: ['#63E6FF', '#21D4B5'] as const,
  sunset: ['#FF8A65', '#FFD166'] as const,
};

export default {
  light: {
    text: Colors.ink,
    background: Colors.paper,
    tint: Colors.aqua,
    tabIconDefault: 'rgba(220,231,242,0.58)',
    tabIconSelected: Colors.white,
  },
};
