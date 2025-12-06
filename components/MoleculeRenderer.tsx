import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Molecule, AtomData, BondData, ElementType } from '../types';
import { ELEMENT_COLORS } from '../constants';
import { Atom as AtomIcon } from 'lucide-react';

interface MoleculeRendererProps {
  molecule: Molecule;
  width?: number;
  height?: number;
  interactive?: boolean;
  onUpdate?: (molecule: Molecule) => void;
  isAutoLayout?: boolean; // If true, runs d3 simulation to position atoms
  mode?: 'build' | 'erase';
  onAtomDelete?: (atomId: string) => void;
}

const MoleculeRenderer: React.FC<MoleculeRendererProps> = ({
  molecule,
  width = 300,
  height = 200,
  interactive = false,
  onUpdate,
  isAutoLayout = false,
  mode = 'build',
  onAtomDelete
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  // Local state to track atoms for drag operations if interactive
  const [internalMolecule, setInternalMolecule] = useState<Molecule>(molecule);
  const [draggedAtomId, setDraggedAtomId] = useState<string | null>(null);
  const [selectedAtomId, setSelectedAtomId] = useState<string | null>(null);
  const isDraggingRef = useRef(false);

  // Sync internal state with props
  useEffect(() => {
    if (isAutoLayout && molecule.atoms.length > 0) {
        // Clone atoms to avoid mutating props during simulation
        const simulationAtoms = molecule.atoms.map(a => ({ 
          ...a, 
          // Initialize positions: spread them out slightly to prevent 0,0 stacking
          x: width/2 + (Math.random() - 0.5) * 50, 
          y: height/2 + (Math.random() - 0.5) * 50 
        }));
        
        // Safety: Filter bonds to ensure they connect existing atoms to prevent d3 crash
        const atomIds = new Set(simulationAtoms.map(a => a.id));
        
        // CRITICAL FIX: Map 'sourceAtomId' to 'source' and 'targetAtomId' to 'target'
        // D3 forceLink specifically looks for 'source' and 'target' properties.
        const simulationBonds = molecule.bonds
          .filter(b => atomIds.has(b.sourceAtomId) && atomIds.has(b.targetAtomId))
          .map(b => ({
            ...b,
            source: b.sourceAtomId,
            target: b.targetAtomId
          }));
        
        const simulation = d3.forceSimulation(simulationAtoms as d3.SimulationNodeDatum[])
          .force("charge", d3.forceManyBody().strength(-200))
          .force("link", d3.forceLink(simulationBonds).id((d: any) => d.id).distance(60))
          .force("center", d3.forceCenter(width / 2, height / 2))
          .force("collide", d3.forceCollide(30));

        simulation.on("tick", () => {
          // Update internal state with new positions
          setInternalMolecule(prev => ({
            ...prev,
            atoms: simulationAtoms.map(sa => ({
              id: sa.id,
              element: sa.element,
              x: (sa as any).x,
              y: (sa as any).y
            })),
            // We don't update bonds here because D3 modifies the simulationBonds array in place
            // but we render based on IDs which remain constant.
          }));
        });

        const timer = setTimeout(() => simulation.stop(), 3000);
        return () => {
          simulation.stop();
          clearTimeout(timer);
        };
    } else {
       // Sync state from props if we are not currently dragging
       // This ensures "Add Atom" works while keeping dragging smooth
       if (!draggedAtomId) {
         setInternalMolecule(molecule);
       }
    }
  }, [molecule, isAutoLayout, width, height, draggedAtomId]);

  // Handle Dragging manually (if interactive)
  const handlePointerDown = (e: React.PointerEvent, atomId: string) => {
    if (!interactive) return;
    if (mode === 'erase') return; // Disable dragging in erase mode

    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDraggedAtomId(atomId);
    isDraggingRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!interactive || !draggedAtomId || !svgRef.current) return;
    
    isDraggingRef.current = true;

    const CTM = svgRef.current.getScreenCTM();
    if (!CTM) return;
    
    const x = (e.clientX - CTM.e) / CTM.a;
    const y = (e.clientY - CTM.f) / CTM.d;

    const newAtoms = internalMolecule.atoms.map(a => 
      a.id === draggedAtomId ? { ...a, x, y } : a
    );
    
    const updatedMolecule = { ...internalMolecule, atoms: newAtoms };
    setInternalMolecule(updatedMolecule);
    if (onUpdate) onUpdate(updatedMolecule);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!interactive) return;
    setDraggedAtomId(null);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // Handle Bond Creation (Click two atoms)
  const handleAtomClick = (e: React.MouseEvent, atomId: string) => {
    if (!interactive) return;
    e.stopPropagation();

    if (mode === 'erase') {
      if (onAtomDelete) onAtomDelete(atomId);
      return;
    }

    // Ignore clicks that were actually drags
    if (isDraggingRef.current) {
        return;
    }

    if (selectedAtomId && selectedAtomId !== atomId) {
      // Check if bond exists to modify or create new
      const existingBondIndex = internalMolecule.bonds.findIndex(b => 
        (b.sourceAtomId === selectedAtomId && b.targetAtomId === atomId) ||
        (b.targetAtomId === selectedAtomId && b.sourceAtomId === atomId)
      );

      if (existingBondIndex >= 0) {
        // Cycle Bond Order: 1 -> 2 -> 3 -> 1
        const bond = internalMolecule.bonds[existingBondIndex];
        const newOrder = bond.order === 1 ? 2 : (bond.order === 2 ? 3 : 1);
        
        const updatedBonds = [...internalMolecule.bonds];
        updatedBonds[existingBondIndex] = { ...bond, order: newOrder as 1|2|3 };
        
        const updated = { ...internalMolecule, bonds: updatedBonds };
        setInternalMolecule(updated);
        if (onUpdate) onUpdate(updated);
        // Note: We keep selectedAtomId active to allow repeated clicks to cycle order
      } else {
        // Create new single bond
        const newBond: BondData = {
          id: `bond-${Date.now()}`,
          sourceAtomId: selectedAtomId,
          targetAtomId: atomId,
          order: 1
        };
        const updated = { ...internalMolecule, bonds: [...internalMolecule.bonds, newBond] };
        setInternalMolecule(updated);
        if (onUpdate) onUpdate(updated);
        // Keep selectedAtomId active
      }
    } else {
      setSelectedAtomId(atomId === selectedAtomId ? null : atomId);
    }
  };

  const renderBond = (bond: BondData) => {
    const source = internalMolecule.atoms.find(a => a.id === bond.sourceAtomId);
    const target = internalMolecule.atoms.find(a => a.id === bond.targetAtomId);
    if (!source || !target) return null;

    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return null;

    const nx = -dy / len;
    const ny = dx / len;
    
    const offset = 3.5; // pixels separation for multiple bonds

    const lines = [];
    
    if (bond.order === 1) {
       lines.push({ x1: source.x, y1: source.y, x2: target.x, y2: target.y });
    } else if (bond.order === 2) {
       lines.push({ x1: source.x + nx * offset, y1: source.y + ny * offset, x2: target.x + nx * offset, y2: target.y + ny * offset });
       lines.push({ x1: source.x - nx * offset, y1: source.y - ny * offset, x2: target.x - nx * offset, y2: target.y - ny * offset });
    } else if (bond.order === 3) {
       lines.push({ x1: source.x, y1: source.y, x2: target.x, y2: target.y });
       lines.push({ x1: source.x + nx * offset * 1.8, y1: source.y + ny * offset * 1.8, x2: target.x + nx * offset * 1.8, y2: target.y + ny * offset * 1.8 });
       lines.push({ x1: source.x - nx * offset * 1.8, y1: source.y - ny * offset * 1.8, x2: target.x - nx * offset * 1.8, y2: target.y - ny * offset * 1.8 });
    }

    return (
      <g key={bond.id}>
         {/* Invisible wide hit area to potentially support bond clicking in future */}
         <line x1={source.x} y1={source.y} x2={target.x} y2={target.y} stroke="transparent" strokeWidth="15" />
         {lines.map((l, i) => (
           <line 
             key={i} 
             x1={l.x1} y1={l.y1} 
             x2={l.x2} y2={l.y2} 
             stroke="#94a3b8" 
             strokeWidth="2.5" 
             strokeLinecap="round" 
           />
         ))}
      </g>
    );
  };

  return (
    <div className={`relative bg-white select-none ${interactive ? (mode === 'erase' ? 'cursor-pointer' : 'cursor-crosshair') : ''}`} style={{ width, height }}>
      {!internalMolecule.atoms.length && (
         <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 pointer-events-none">
            <AtomIcon size={48} className="mb-2 opacity-20" />
            <p className="text-sm">Empty Space</p>
         </div>
      )}
      <svg 
        ref={svgRef}
        width={width} 
        height={height}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="block bg-transparent"
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Render Bonds */}
        {internalMolecule.bonds.map(bond => renderBond(bond))}

        {/* Render Atoms */}
        {internalMolecule.atoms.map(atom => {
          const style = ELEMENT_COLORS[atom.element] || ELEMENT_COLORS[ElementType.C];
          const isSelected = selectedAtomId === atom.id;
          const isEraseMode = mode === 'erase';

          return (
            <g 
              key={atom.id} 
              transform={`translate(${atom.x}, ${atom.y})`}
              onPointerDown={(e) => handlePointerDown(e, atom.id)}
              onClick={(e) => handleAtomClick(e, atom.id)}
              style={{ cursor: interactive ? (isEraseMode ? 'pointer' : 'grab') : 'default' }}
              className={`transition-opacity ${isEraseMode ? 'hover:opacity-50' : ''}`}
            >
              <circle
                r={style.radius}
                fill={style.bg}
                stroke={isSelected ? '#6366f1' : style.border}
                strokeWidth={isSelected ? 3 : 2}
                className="transition-colors duration-150"
              />
              <text
                textAnchor="middle"
                dy=".35em"
                fill={style.text}
                fontSize="14px"
                fontWeight="bold"
                pointerEvents="none"
              >
                {atom.element}
              </text>
            </g>
          );
        })}
      </svg>
      {/* Name display for static molecules */}
      {!interactive && (
        <div className="absolute bottom-2 right-2 text-xs text-slate-400 font-mono pointer-events-none">
          {internalMolecule.name || 'Untitled'}
        </div>
      )}
    </div>
  );
};

export default MoleculeRenderer;