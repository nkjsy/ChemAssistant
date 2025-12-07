import { ElementType } from './types';

export const ELEMENT_DATA: Record<ElementType, { name: string; atomicNumber: number; mass: number }> = {
  [ElementType.H]: { name: 'Hydrogen', atomicNumber: 1, mass: 1.008 },
  [ElementType.C]: { name: 'Carbon', atomicNumber: 6, mass: 12.011 },
  [ElementType.O]: { name: 'Oxygen', atomicNumber: 8, mass: 15.999 },
  [ElementType.N]: { name: 'Nitrogen', atomicNumber: 7, mass: 14.007 },
  [ElementType.Cl]: { name: 'Chlorine', atomicNumber: 17, mass: 35.45 },
  [ElementType.Na]: { name: 'Sodium', atomicNumber: 11, mass: 22.990 },
  [ElementType.S]: { name: 'Sulfur', atomicNumber: 16, mass: 32.06 },
  [ElementType.F]: { name: 'Fluorine', atomicNumber: 9, mass: 18.998 },
  [ElementType.P]: { name: 'Phosphorus', atomicNumber: 15, mass: 30.974 },
  [ElementType.Mg]: { name: 'Magnesium', atomicNumber: 12, mass: 24.305 },
  [ElementType.K]: { name: 'Potassium', atomicNumber: 19, mass: 39.098 },
  [ElementType.Ca]: { name: 'Calcium', atomicNumber: 20, mass: 40.078 },
  [ElementType.Fe]: { name: 'Iron', atomicNumber: 26, mass: 55.845 },
  [ElementType.Br]: { name: 'Bromine', atomicNumber: 35, mass: 79.904 },
  [ElementType.I]: { name: 'Iodine', atomicNumber: 53, mass: 126.90 },
};

export const ELEMENT_COLORS: Record<ElementType, { bg: string; border: string; text: string; radius: number }> = {
  [ElementType.H]: { bg: '#FFFFFF', border: '#94a3b8', text: '#334155', radius: 20 },
  [ElementType.C]: { bg: '#334155', border: '#1e293b', text: '#FFFFFF', radius: 25 },
  [ElementType.O]: { bg: '#ef4444', border: '#b91c1c', text: '#FFFFFF', radius: 24 },
  [ElementType.N]: { bg: '#3b82f6', border: '#1d4ed8', text: '#FFFFFF', radius: 24 },
  [ElementType.Cl]: { bg: '#22c55e', border: '#15803d', text: '#FFFFFF', radius: 26 },
  [ElementType.Na]: { bg: '#a855f7', border: '#7e22ce', text: '#FFFFFF', radius: 28 },
  [ElementType.S]: { bg: '#eab308', border: '#a16207', text: '#FFFFFF', radius: 26 },
  [ElementType.F]: { bg: '#14b8a6', border: '#0f766e', text: '#FFFFFF', radius: 22 },
  
  // New Elements
  [ElementType.P]: { bg: '#f97316', border: '#c2410c', text: '#FFFFFF', radius: 25 }, // Orange
  [ElementType.Mg]: { bg: '#10b981', border: '#047857', text: '#FFFFFF', radius: 26 }, // Emerald
  [ElementType.K]: { bg: '#8b5cf6', border: '#5b21b6', text: '#FFFFFF', radius: 29 }, // Violet
  [ElementType.Ca]: { bg: '#64748b', border: '#334155', text: '#FFFFFF', radius: 28 }, // Slate
  [ElementType.Fe]: { bg: '#f59e0b', border: '#b45309', text: '#FFFFFF', radius: 27 }, // Amber/Rust
  [ElementType.Br]: { bg: '#991b1b', border: '#7f1d1d', text: '#FFFFFF', radius: 27 }, // Dark Red
  [ElementType.I]: { bg: '#4338ca', border: '#312e81', text: '#FFFFFF', radius: 28 }, // Indigo
};

export const CANVAS_SIZE = { width: 600, height: 400 };