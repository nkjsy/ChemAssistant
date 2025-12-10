
import * as d3 from 'd3';
import { Molecule } from '../types';

/**
 * Automatically adjusts the layout of a molecule using a force-directed graph simulation.
 * This approximates a "chemist's drawing" by spreading atoms evenly and enforcing standard bond distances.
 */
export const autoLayoutMolecule = (molecule: Molecule, width: number, height: number): Molecule => {
    if (molecule.atoms.length === 0) return molecule;

    // Clone data to avoid mutating the original state directly during simulation setup
    // Initialize random positions if atoms are at (0,0) or stacked, to allow forces to work
    const nodes = molecule.atoms.map(a => ({ 
        ...a,
        x: (a.x === 0 && a.y === 0) ? width/2 + (Math.random() - 0.5) * 50 : a.x,
        y: (a.x === 0 && a.y === 0) ? height/2 + (Math.random() - 0.5) * 50 : a.y
    }));

    const links = molecule.bonds.map(b => ({ 
        ...b, 
        source: b.sourceAtomId, 
        target: b.targetAtomId 
    }));

    // Configure the simulation forces
    const simulation = d3.forceSimulation(nodes as any)
      .force("charge", d3.forceManyBody().strength(-300)) // Repel atoms from each other
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(60).strength(2)) // Maintain bond distance
      .force("center", d3.forceCenter(width / 2, height / 2).strength(0.05)) // Gently pull to center
      .force("collide", d3.forceCollide(35).iterations(2)) // Prevent atom overlap
      .stop();

    // Run the simulation synchronously
    // 300 ticks is usually sufficient for the system to stabilize
    const ticks = 300;
    for (let i = 0; i < ticks; ++i) simulation.tick();

    // Return new molecule with updated coordinates
    return {
        ...molecule,
        atoms: nodes.map(n => ({
            id: n.id,
            element: n.element,
            // Clamp coordinates to keep atoms roughly within the visible canvas
            x: Math.max(30, Math.min(width - 30, n.x)),
            y: Math.max(30, Math.min(height - 30, n.y))
        })),
        bonds: molecule.bonds // Connectivity remains unchanged
    };
};
