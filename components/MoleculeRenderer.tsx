import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Molecule, AtomData, BondData, ElementType } from '../types';
import { ELEMENT_COLORS } from '../constants';
import { Atom as AtomIcon, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface MoleculeRendererProps {
  molecule: Molecule;
  width?: number;
  height?: number;
  interactive?: boolean;
  onUpdate?: (molecule: Molecule) => void;
  isAutoLayout?: boolean; // If true, runs d3 simulation to position atoms
  mode?: 'build' | 'erase';
  onAtomDelete?: (atomId: string) => void;
  showControls?: boolean;
}

const MoleculeRenderer: React.FC<MoleculeRendererProps> = ({
  molecule,
  width = 300,
  height = 200,
  interactive = false,
  onUpdate,
  isAutoLayout = false,
  mode = 'build',
  onAtomDelete,
  showControls = true
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  const [internalMolecule, setInternalMolecule] = useState<Molecule>(molecule);
  const [draggedAtomId, setDraggedAtomId] = useState<string | null>(null);
  const [selectedAtomId, setSelectedAtomId] = useState<string | null>(null);
  
  // Zoom and Pan State
  const [transform, setTransform] = useState({ k: 1, x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const lastPanRef = useRef<{ x: number, y: number } | null>(null);
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
        
        const atomIds = new Set(simulationAtoms.map(a => a.id));
        
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
          setInternalMolecule(prev => ({
            ...prev,
            atoms: simulationAtoms.map(sa => ({
              id: sa.id,
              element: sa.element,
              x: (sa as any).x,
              y: (sa as any).y
            })),
          }));
        });

        const timer = setTimeout(() => simulation.stop(), 3000);
        return () => {
          simulation.stop();
          clearTimeout(timer);
        };
    } else {
       // Sync state from props if we are not currently dragging
       if (!draggedAtomId) {
         setInternalMolecule(molecule);
       }
    }
  }, [molecule, isAutoLayout, width, height, draggedAtomId]);

  // Zoom Logic
  const handleZoom = (factor: number) => {
    setTransform(prev => {
      const newK = Math.max(0.2, Math.min(5, prev.k * factor));
      const cx = width / 2;
      const cy = height / 2;
      // Convert center to world space using old transform
      const wx = (cx - prev.x) / prev.k;
      const wy = (cy - prev.y) / prev.k;
      // Calculate new x,y to keep world center at screen center
      const newX = cx - wx * newK;
      const newY = cy - wy * newK;
      return { k: newK, x: newX, y: newY };
    });
  };

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTransform({ k: 1, x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Basic wheel zoom
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    handleZoom(factor);
  };

  // Interaction Handlers
  const handleSvgPointerDown = (e: React.PointerEvent) => {
    // Start panning on background click
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsPanning(true);
    lastPanRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleAtomPointerDown = (e: React.PointerEvent, atomId: string) => {
    if (!interactive) return;
    if (mode === 'erase') return; 

    e.stopPropagation(); // Stop background pan
    e.currentTarget.setPointerCapture(e.pointerId);
    setDraggedAtomId(atomId);
    isDraggingRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!svgRef.current) return;
    
    // Drag Atom
    if (interactive && draggedAtomId) {
       isDraggingRef.current = true;
       const CTM = svgRef.current.getScreenCTM();
       if (!CTM) return;
       
       const rawX = (e.clientX - CTM.e) / CTM.a;
       const rawY = (e.clientY - CTM.f) / CTM.d;

       // Apply inverse transform to get model coordinates
       const x = (rawX - transform.x) / transform.k;
       const y = (rawY - transform.y) / transform.k;

       const newAtoms = internalMolecule.atoms.map(a => 
         a.id === draggedAtomId ? { ...a, x, y } : a
       );
       
       const updatedMolecule = { ...internalMolecule, atoms: newAtoms };
       setInternalMolecule(updatedMolecule);
       if (onUpdate) onUpdate(updatedMolecule);
    } 
    // Pan View
    else if (isPanning && lastPanRef.current) {
       const dx = e.clientX - lastPanRef.current.x;
       const dy = e.clientY - lastPanRef.current.y;
       setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
       lastPanRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (interactive) setDraggedAtomId(null);
    setIsPanning(false);
    lastPanRef.current = null;
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
         {/* Invisible wide hit area */}
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
    <div 
      className={`relative bg-white select-none overflow-hidden ${interactive ? (mode === 'erase' ? 'cursor-pointer' : 'cursor-crosshair') : 'cursor-move'}`} 
      style={{ width, height }}
      onWheel={showControls ? handleWheel : undefined}
    >
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
        onPointerDown={handleSvgPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="block bg-transparent"
        viewBox={`0 0 ${width} ${height}`}
      >
        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
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
                onPointerDown={(e) => handleAtomPointerDown(e, atom.id)}
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
        </g>
      </svg>
      
      {/* Zoom Controls */}
      {showControls && (
        <div className="absolute top-2 right-2 flex flex-col gap-1 bg-white/90 rounded-lg shadow border border-slate-200 p-1">
           <button onClick={(e) => { e.stopPropagation(); handleZoom(1.2); }} className="p-1 hover:bg-slate-100 rounded text-slate-600" title="Zoom In">
             <ZoomIn size={16}/>
           </button>
           <button onClick={(e) => { e.stopPropagation(); handleZoom(0.8); }} className="p-1 hover:bg-slate-100 rounded text-slate-600" title="Zoom Out">
             <ZoomOut size={16}/>
           </button>
           <button onClick={handleResetZoom} className="p-1 hover:bg-slate-100 rounded text-slate-600" title="Reset View">
             <Maximize size={16}/>
           </button>
        </div>
      )}

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