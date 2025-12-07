
import { ElementType } from './types';

// Categories for coloring
type ElementCategory = 'diatomic nonmetal' | 'noble gas' | 'alkali metal' | 'alkaline earth metal' | 'metalloid' | 'polyatomic nonmetal' | 'post-transition metal' | 'transition metal' | 'lanthanide' | 'actinide' | 'unknown';

export interface ElementDef {
  symbol: string;
  name: string;
  atomicNumber: number;
  mass: number;
  category: ElementCategory;
  xpos: number; // 1-18
  ypos: number; // 1-10 (including lanthanides/actinides)
}

// Full Periodic Table Data
export const PERIODIC_TABLE: ElementDef[] = [
  { symbol: 'H', name: 'Hydrogen', atomicNumber: 1, mass: 1.008, category: 'diatomic nonmetal', xpos: 1, ypos: 1 },
  { symbol: 'He', name: 'Helium', atomicNumber: 2, mass: 4.0026, category: 'noble gas', xpos: 18, ypos: 1 },
  { symbol: 'Li', name: 'Lithium', atomicNumber: 3, mass: 6.94, category: 'alkali metal', xpos: 1, ypos: 2 },
  { symbol: 'Be', name: 'Beryllium', atomicNumber: 4, mass: 9.0122, category: 'alkaline earth metal', xpos: 2, ypos: 2 },
  { symbol: 'B', name: 'Boron', atomicNumber: 5, mass: 10.81, category: 'metalloid', xpos: 13, ypos: 2 },
  { symbol: 'C', name: 'Carbon', atomicNumber: 6, mass: 12.011, category: 'polyatomic nonmetal', xpos: 14, ypos: 2 },
  { symbol: 'N', name: 'Nitrogen', atomicNumber: 7, mass: 14.007, category: 'diatomic nonmetal', xpos: 15, ypos: 2 },
  { symbol: 'O', name: 'Oxygen', atomicNumber: 8, mass: 15.999, category: 'diatomic nonmetal', xpos: 16, ypos: 2 },
  { symbol: 'F', name: 'Fluorine', atomicNumber: 9, mass: 18.998, category: 'diatomic nonmetal', xpos: 17, ypos: 2 },
  { symbol: 'Ne', name: 'Neon', atomicNumber: 10, mass: 20.180, category: 'noble gas', xpos: 18, ypos: 2 },
  { symbol: 'Na', name: 'Sodium', atomicNumber: 11, mass: 22.990, category: 'alkali metal', xpos: 1, ypos: 3 },
  { symbol: 'Mg', name: 'Magnesium', atomicNumber: 12, mass: 24.305, category: 'alkaline earth metal', xpos: 2, ypos: 3 },
  { symbol: 'Al', name: 'Aluminium', atomicNumber: 13, mass: 26.982, category: 'post-transition metal', xpos: 13, ypos: 3 },
  { symbol: 'Si', name: 'Silicon', atomicNumber: 14, mass: 28.085, category: 'metalloid', xpos: 14, ypos: 3 },
  { symbol: 'P', name: 'Phosphorus', atomicNumber: 15, mass: 30.974, category: 'polyatomic nonmetal', xpos: 15, ypos: 3 },
  { symbol: 'S', name: 'Sulfur', atomicNumber: 16, mass: 32.06, category: 'polyatomic nonmetal', xpos: 16, ypos: 3 },
  { symbol: 'Cl', name: 'Chlorine', atomicNumber: 17, mass: 35.45, category: 'diatomic nonmetal', xpos: 17, ypos: 3 },
  { symbol: 'Ar', name: 'Argon', atomicNumber: 18, mass: 39.948, category: 'noble gas', xpos: 18, ypos: 3 },
  { symbol: 'K', name: 'Potassium', atomicNumber: 19, mass: 39.098, category: 'alkali metal', xpos: 1, ypos: 4 },
  { symbol: 'Ca', name: 'Calcium', atomicNumber: 20, mass: 40.078, category: 'alkaline earth metal', xpos: 2, ypos: 4 },
  { symbol: 'Sc', name: 'Scandium', atomicNumber: 21, mass: 44.956, category: 'transition metal', xpos: 3, ypos: 4 },
  { symbol: 'Ti', name: 'Titanium', atomicNumber: 22, mass: 47.867, category: 'transition metal', xpos: 4, ypos: 4 },
  { symbol: 'V', name: 'Vanadium', atomicNumber: 23, mass: 50.942, category: 'transition metal', xpos: 5, ypos: 4 },
  { symbol: 'Cr', name: 'Chromium', atomicNumber: 24, mass: 51.996, category: 'transition metal', xpos: 6, ypos: 4 },
  { symbol: 'Mn', name: 'Manganese', atomicNumber: 25, mass: 54.938, category: 'transition metal', xpos: 7, ypos: 4 },
  { symbol: 'Fe', name: 'Iron', atomicNumber: 26, mass: 55.845, category: 'transition metal', xpos: 8, ypos: 4 },
  { symbol: 'Co', name: 'Cobalt', atomicNumber: 27, mass: 58.933, category: 'transition metal', xpos: 9, ypos: 4 },
  { symbol: 'Ni', name: 'Nickel', atomicNumber: 28, mass: 58.693, category: 'transition metal', xpos: 10, ypos: 4 },
  { symbol: 'Cu', name: 'Copper', atomicNumber: 29, mass: 63.546, category: 'transition metal', xpos: 11, ypos: 4 },
  { symbol: 'Zn', name: 'Zinc', atomicNumber: 30, mass: 65.38, category: 'transition metal', xpos: 12, ypos: 4 },
  { symbol: 'Ga', name: 'Gallium', atomicNumber: 31, mass: 69.723, category: 'post-transition metal', xpos: 13, ypos: 4 },
  { symbol: 'Ge', name: 'Germanium', atomicNumber: 32, mass: 72.630, category: 'metalloid', xpos: 14, ypos: 4 },
  { symbol: 'As', name: 'Arsenic', atomicNumber: 33, mass: 74.922, category: 'metalloid', xpos: 15, ypos: 4 },
  { symbol: 'Se', name: 'Selenium', atomicNumber: 34, mass: 78.971, category: 'polyatomic nonmetal', xpos: 16, ypos: 4 },
  { symbol: 'Br', name: 'Bromine', atomicNumber: 35, mass: 79.904, category: 'diatomic nonmetal', xpos: 17, ypos: 4 },
  { symbol: 'Kr', name: 'Krypton', atomicNumber: 36, mass: 83.798, category: 'noble gas', xpos: 18, ypos: 4 },
  { symbol: 'Rb', name: 'Rubidium', atomicNumber: 37, mass: 85.468, category: 'alkali metal', xpos: 1, ypos: 5 },
  { symbol: 'Sr', name: 'Strontium', atomicNumber: 38, mass: 87.62, category: 'alkaline earth metal', xpos: 2, ypos: 5 },
  { symbol: 'Y', name: 'Yttrium', atomicNumber: 39, mass: 88.906, category: 'transition metal', xpos: 3, ypos: 5 },
  { symbol: 'Zr', name: 'Zirconium', atomicNumber: 40, mass: 91.224, category: 'transition metal', xpos: 4, ypos: 5 },
  { symbol: 'Nb', name: 'Niobium', atomicNumber: 41, mass: 92.906, category: 'transition metal', xpos: 5, ypos: 5 },
  { symbol: 'Mo', name: 'Molybdenum', atomicNumber: 42, mass: 95.95, category: 'transition metal', xpos: 6, ypos: 5 },
  { symbol: 'Tc', name: 'Technetium', atomicNumber: 43, mass: 98, category: 'transition metal', xpos: 7, ypos: 5 },
  { symbol: 'Ru', name: 'Ruthenium', atomicNumber: 44, mass: 101.07, category: 'transition metal', xpos: 8, ypos: 5 },
  { symbol: 'Rh', name: 'Rhodium', atomicNumber: 45, mass: 102.91, category: 'transition metal', xpos: 9, ypos: 5 },
  { symbol: 'Pd', name: 'Palladium', atomicNumber: 46, mass: 106.42, category: 'transition metal', xpos: 10, ypos: 5 },
  { symbol: 'Ag', name: 'Silver', atomicNumber: 47, mass: 107.87, category: 'transition metal', xpos: 11, ypos: 5 },
  { symbol: 'Cd', name: 'Cadmium', atomicNumber: 48, mass: 112.41, category: 'transition metal', xpos: 12, ypos: 5 },
  { symbol: 'In', name: 'Indium', atomicNumber: 49, mass: 114.82, category: 'post-transition metal', xpos: 13, ypos: 5 },
  { symbol: 'Sn', name: 'Tin', atomicNumber: 50, mass: 118.71, category: 'post-transition metal', xpos: 14, ypos: 5 },
  { symbol: 'Sb', name: 'Antimony', atomicNumber: 51, mass: 121.76, category: 'metalloid', xpos: 15, ypos: 5 },
  { symbol: 'Te', name: 'Tellurium', atomicNumber: 52, mass: 127.60, category: 'metalloid', xpos: 16, ypos: 5 },
  { symbol: 'I', name: 'Iodine', atomicNumber: 53, mass: 126.90, category: 'diatomic nonmetal', xpos: 17, ypos: 5 },
  { symbol: 'Xe', name: 'Xenon', atomicNumber: 54, mass: 131.29, category: 'noble gas', xpos: 18, ypos: 5 },
  { symbol: 'Cs', name: 'Cesium', atomicNumber: 55, mass: 132.91, category: 'alkali metal', xpos: 1, ypos: 6 },
  { symbol: 'Ba', name: 'Barium', atomicNumber: 56, mass: 137.33, category: 'alkaline earth metal', xpos: 2, ypos: 6 },
  { symbol: 'La', name: 'Lanthanum', atomicNumber: 57, mass: 138.91, category: 'lanthanide', xpos: 3, ypos: 9 }, // Lanthanides
  { symbol: 'Ce', name: 'Cerium', atomicNumber: 58, mass: 140.12, category: 'lanthanide', xpos: 4, ypos: 9 },
  { symbol: 'Pr', name: 'Praseodymium', atomicNumber: 59, mass: 140.91, category: 'lanthanide', xpos: 5, ypos: 9 },
  { symbol: 'Nd', name: 'Neodymium', atomicNumber: 60, mass: 144.24, category: 'lanthanide', xpos: 6, ypos: 9 },
  { symbol: 'Pm', name: 'Promethium', atomicNumber: 61, mass: 145, category: 'lanthanide', xpos: 7, ypos: 9 },
  { symbol: 'Sm', name: 'Samarium', atomicNumber: 62, mass: 150.36, category: 'lanthanide', xpos: 8, ypos: 9 },
  { symbol: 'Eu', name: 'Europium', atomicNumber: 63, mass: 151.96, category: 'lanthanide', xpos: 9, ypos: 9 },
  { symbol: 'Gd', name: 'Gadolinium', atomicNumber: 64, mass: 157.25, category: 'lanthanide', xpos: 10, ypos: 9 },
  { symbol: 'Tb', name: 'Terbium', atomicNumber: 65, mass: 158.93, category: 'lanthanide', xpos: 11, ypos: 9 },
  { symbol: 'Dy', name: 'Dysprosium', atomicNumber: 66, mass: 162.50, category: 'lanthanide', xpos: 12, ypos: 9 },
  { symbol: 'Ho', name: 'Holmium', atomicNumber: 67, mass: 164.93, category: 'lanthanide', xpos: 13, ypos: 9 },
  { symbol: 'Er', name: 'Erbium', atomicNumber: 68, mass: 167.26, category: 'lanthanide', xpos: 14, ypos: 9 },
  { symbol: 'Tm', name: 'Thulium', atomicNumber: 69, mass: 168.93, category: 'lanthanide', xpos: 15, ypos: 9 },
  { symbol: 'Yb', name: 'Ytterbium', atomicNumber: 70, mass: 173.05, category: 'lanthanide', xpos: 16, ypos: 9 },
  { symbol: 'Lu', name: 'Lutetium', atomicNumber: 71, mass: 174.97, category: 'lanthanide', xpos: 17, ypos: 9 },
  { symbol: 'Hf', name: 'Hafnium', atomicNumber: 72, mass: 178.49, category: 'transition metal', xpos: 4, ypos: 6 },
  { symbol: 'Ta', name: 'Tantalum', atomicNumber: 73, mass: 180.95, category: 'transition metal', xpos: 5, ypos: 6 },
  { symbol: 'W', name: 'Tungsten', atomicNumber: 74, mass: 183.84, category: 'transition metal', xpos: 6, ypos: 6 },
  { symbol: 'Re', name: 'Rhenium', atomicNumber: 75, mass: 186.21, category: 'transition metal', xpos: 7, ypos: 6 },
  { symbol: 'Os', name: 'Osmium', atomicNumber: 76, mass: 190.23, category: 'transition metal', xpos: 8, ypos: 6 },
  { symbol: 'Ir', name: 'Iridium', atomicNumber: 77, mass: 192.22, category: 'transition metal', xpos: 9, ypos: 6 },
  { symbol: 'Pt', name: 'Platinum', atomicNumber: 78, mass: 195.08, category: 'transition metal', xpos: 10, ypos: 6 },
  { symbol: 'Au', name: 'Gold', atomicNumber: 79, mass: 196.97, category: 'transition metal', xpos: 11, ypos: 6 },
  { symbol: 'Hg', name: 'Mercury', atomicNumber: 80, mass: 200.59, category: 'transition metal', xpos: 12, ypos: 6 },
  { symbol: 'Tl', name: 'Thallium', atomicNumber: 81, mass: 204.38, category: 'post-transition metal', xpos: 13, ypos: 6 },
  { symbol: 'Pb', name: 'Lead', atomicNumber: 82, mass: 207.2, category: 'post-transition metal', xpos: 14, ypos: 6 },
  { symbol: 'Bi', name: 'Bismuth', atomicNumber: 83, mass: 208.98, category: 'post-transition metal', xpos: 15, ypos: 6 },
  { symbol: 'Po', name: 'Polonium', atomicNumber: 84, mass: 209, category: 'post-transition metal', xpos: 16, ypos: 6 },
  { symbol: 'At', name: 'Astatine', atomicNumber: 85, mass: 210, category: 'metalloid', xpos: 17, ypos: 6 },
  { symbol: 'Rn', name: 'Radon', atomicNumber: 86, mass: 222, category: 'noble gas', xpos: 18, ypos: 6 },
  { symbol: 'Fr', name: 'Francium', atomicNumber: 87, mass: 223, category: 'alkali metal', xpos: 1, ypos: 7 },
  { symbol: 'Ra', name: 'Radium', atomicNumber: 88, mass: 226, category: 'alkaline earth metal', xpos: 2, ypos: 7 },
  { symbol: 'Ac', name: 'Actinium', atomicNumber: 89, mass: 227, category: 'actinide', xpos: 3, ypos: 10 }, // Actinides
  { symbol: 'Th', name: 'Thorium', atomicNumber: 90, mass: 232.04, category: 'actinide', xpos: 4, ypos: 10 },
  { symbol: 'Pa', name: 'Protactinium', atomicNumber: 91, mass: 231.04, category: 'actinide', xpos: 5, ypos: 10 },
  { symbol: 'U', name: 'Uranium', atomicNumber: 92, mass: 238.03, category: 'actinide', xpos: 6, ypos: 10 },
  { symbol: 'Np', name: 'Neptunium', atomicNumber: 93, mass: 237, category: 'actinide', xpos: 7, ypos: 10 },
  { symbol: 'Pu', name: 'Plutonium', atomicNumber: 94, mass: 244, category: 'actinide', xpos: 8, ypos: 10 },
  { symbol: 'Am', name: 'Americium', atomicNumber: 95, mass: 243, category: 'actinide', xpos: 9, ypos: 10 },
  { symbol: 'Cm', name: 'Curium', atomicNumber: 96, mass: 247, category: 'actinide', xpos: 10, ypos: 10 },
  { symbol: 'Bk', name: 'Berkelium', atomicNumber: 97, mass: 247, category: 'actinide', xpos: 11, ypos: 10 },
  { symbol: 'Cf', name: 'Californium', atomicNumber: 98, mass: 251, category: 'actinide', xpos: 12, ypos: 10 },
  { symbol: 'Es', name: 'Einsteinium', atomicNumber: 99, mass: 252, category: 'actinide', xpos: 13, ypos: 10 },
  { symbol: 'Fm', name: 'Fermium', atomicNumber: 100, mass: 257, category: 'actinide', xpos: 14, ypos: 10 },
  { symbol: 'Md', name: 'Mendelevium', atomicNumber: 101, mass: 258, category: 'actinide', xpos: 15, ypos: 10 },
  { symbol: 'No', name: 'Nobelium', atomicNumber: 102, mass: 259, category: 'actinide', xpos: 16, ypos: 10 },
  { symbol: 'Lr', name: 'Lawrencium', atomicNumber: 103, mass: 266, category: 'actinide', xpos: 17, ypos: 10 },
  { symbol: 'Rf', name: 'Rutherfordium', atomicNumber: 104, mass: 267, category: 'transition metal', xpos: 4, ypos: 7 },
  { symbol: 'Db', name: 'Dubnium', atomicNumber: 105, mass: 268, category: 'transition metal', xpos: 5, ypos: 7 },
  { symbol: 'Sg', name: 'Seaborgium', atomicNumber: 106, mass: 269, category: 'transition metal', xpos: 6, ypos: 7 },
  { symbol: 'Bh', name: 'Bohrium', atomicNumber: 107, mass: 270, category: 'transition metal', xpos: 7, ypos: 7 },
  { symbol: 'Hs', name: 'Hassium', atomicNumber: 108, mass: 269, category: 'transition metal', xpos: 8, ypos: 7 },
  { symbol: 'Mt', name: 'Meitnerium', atomicNumber: 109, mass: 278, category: 'unknown', xpos: 9, ypos: 7 },
  { symbol: 'Ds', name: 'Darmstadtium', atomicNumber: 110, mass: 281, category: 'unknown', xpos: 10, ypos: 7 },
  { symbol: 'Rg', name: 'Roentgenium', atomicNumber: 111, mass: 282, category: 'unknown', xpos: 11, ypos: 7 },
  { symbol: 'Cn', name: 'Copernicium', atomicNumber: 112, mass: 285, category: 'transition metal', xpos: 12, ypos: 7 },
  { symbol: 'Nh', name: 'Nihonium', atomicNumber: 113, mass: 286, category: 'unknown', xpos: 13, ypos: 7 },
  { symbol: 'Fl', name: 'Flerovium', atomicNumber: 114, mass: 289, category: 'post-transition metal', xpos: 14, ypos: 7 },
  { symbol: 'Mc', name: 'Moscovium', atomicNumber: 115, mass: 290, category: 'unknown', xpos: 15, ypos: 7 },
  { symbol: 'Lv', name: 'Livermorium', atomicNumber: 116, mass: 293, category: 'unknown', xpos: 16, ypos: 7 },
  { symbol: 'Ts', name: 'Tennessine', atomicNumber: 117, mass: 294, category: 'unknown', xpos: 17, ypos: 7 },
  { symbol: 'Og', name: 'Oganesson', atomicNumber: 118, mass: 294, category: 'unknown', xpos: 18, ypos: 7 },
];

// Lookup Map for O(1) access
export const ELEMENT_DATA_MAP = PERIODIC_TABLE.reduce((acc, el) => {
  acc[el.symbol] = el;
  return acc;
}, {} as Record<string, ElementDef>);

// Common elements list for the toolbar
export const COMMON_ELEMENTS = [
  'H', 'C', 'O', 'N', 'Cl', 'Na', 'S', 'F', 'P', 'Mg', 'K', 'Ca', 'Fe', 'Br', 'I'
];

// Custom colors for specific common elements (matching previous styles)
const CUSTOM_COLORS: Record<string, { bg: string; border: string; text: string; radius: number }> = {
  H: { bg: '#FFFFFF', border: '#94a3b8', text: '#334155', radius: 20 },
  C: { bg: '#334155', border: '#1e293b', text: '#FFFFFF', radius: 25 },
  O: { bg: '#ef4444', border: '#b91c1c', text: '#FFFFFF', radius: 24 },
  N: { bg: '#3b82f6', border: '#1d4ed8', text: '#FFFFFF', radius: 24 },
  Cl: { bg: '#22c55e', border: '#15803d', text: '#FFFFFF', radius: 26 },
  Na: { bg: '#a855f7', border: '#7e22ce', text: '#FFFFFF', radius: 28 },
  S: { bg: '#eab308', border: '#a16207', text: '#FFFFFF', radius: 26 },
  F: { bg: '#14b8a6', border: '#0f766e', text: '#FFFFFF', radius: 22 },
  P: { bg: '#f97316', border: '#c2410c', text: '#FFFFFF', radius: 25 },
  Mg: { bg: '#10b981', border: '#047857', text: '#FFFFFF', radius: 26 },
  K: { bg: '#8b5cf6', border: '#5b21b6', text: '#FFFFFF', radius: 29 },
  Ca: { bg: '#64748b', border: '#334155', text: '#FFFFFF', radius: 28 },
  Fe: { bg: '#f59e0b', border: '#b45309', text: '#FFFFFF', radius: 27 },
  Br: { bg: '#991b1b', border: '#7f1d1d', text: '#FFFFFF', radius: 27 },
  I: { bg: '#4338ca', border: '#312e81', text: '#FFFFFF', radius: 28 },
};

// Category colors for everything else
export const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  'diatomic nonmetal': { bg: '#e2e8f0', border: '#94a3b8', text: '#1e293b' },
  'noble gas': { bg: '#f3e8ff', border: '#d8b4fe', text: '#581c87' },
  'alkali metal': { bg: '#fce7f3', border: '#f9a8d4', text: '#831843' },
  'alkaline earth metal': { bg: '#ffedd5', border: '#fdba74', text: '#9a3412' },
  'metalloid': { bg: '#ccfbf1', border: '#5eead4', text: '#134e4a' },
  'polyatomic nonmetal': { bg: '#f1f5f9', border: '#cbd5e1', text: '#334155' },
  'post-transition metal': { bg: '#dcfce7', border: '#86efac', text: '#14532d' },
  'transition metal': { bg: '#ffedd5', border: '#fdba74', text: '#7c2d12' },
  'lanthanide': { bg: '#f0f9ff', border: '#bae6fd', text: '#0c4a6e' },
  'actinide': { bg: '#fff1f2', border: '#fda4af', text: '#881337' },
  'unknown': { bg: '#f3f4f6', border: '#d1d5db', text: '#374151' },
};

export const getElementStyle = (symbol: string) => {
  // Return custom style if defined (for common elements)
  if (CUSTOM_COLORS[symbol]) {
    return CUSTOM_COLORS[symbol];
  }

  // Fallback to category based style
  const data = ELEMENT_DATA_MAP[symbol];
  if (data && CATEGORY_COLORS[data.category]) {
    const style = CATEGORY_COLORS[data.category];
    // Scale radius slightly by mass/size approximation (simplified)
    const radius = Math.min(32, Math.max(20, 20 + (data.mass / 20)));
    return { ...style, radius };
  }

  // Default fallback
  return { bg: '#e2e8f0', border: '#94a3b8', text: '#475569', radius: 24 };
};

// Deprecated but kept for compatibility with existing import references if any
export const ELEMENT_DATA = ELEMENT_DATA_MAP;
export const ELEMENT_COLORS = CUSTOM_COLORS; // Note: this is incomplete now, use getElementStyle instead

export const CANVAS_SIZE = { width: 600, height: 400 };