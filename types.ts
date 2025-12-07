
// Common elements for the quick-access bar
export const ElementType = {
  H: 'H',
  C: 'C',
  O: 'O',
  N: 'N',
  Cl: 'Cl',
  Na: 'Na',
  S: 'S',
  F: 'F',
  P: 'P',
  Mg: 'Mg',
  K: 'K',
  Ca: 'Ca',
  Fe: 'Fe',
  Br: 'Br',
  I: 'I'
} as const;

// Allow any string to support all 118 elements
export type ElementType = typeof ElementType[keyof typeof ElementType] | string;

export interface AtomData {
  id: string;
  element: ElementType;
  x: number;
  y: number;
}

export interface BondData {
  id: string;
  sourceAtomId: string;
  targetAtomId: string;
  order: 1 | 2 | 3;
}

export interface Molecule {
  id: string;
  name: string;
  atoms: AtomData[];
  bonds: BondData[];
  formula?: string; // e.g., "H2O"
}

export interface ReactionResult {
  equation: string; // Balanced string representation
  explanation: string;
  products: Molecule[]; // Generated molecules
}

// For Gemini Interaction
export interface GeminiAtom {
  element: string;
  id: string;
}

export interface GeminiBond {
  source: string;
  target: string;
  order: number;
}

export interface GeminiMolecule {
  name: string;
  atoms: GeminiAtom[];
  bonds: GeminiBond[];
}
