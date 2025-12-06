import React, { useState } from 'react';
import { ElementType, Molecule, AtomData } from '../types';
import { ELEMENT_COLORS, CANVAS_SIZE } from '../constants';
import MoleculeRenderer from './MoleculeRenderer';
import { Trash2, Save, Undo, Eraser, MousePointer2 } from 'lucide-react';

interface BuilderProps {
  onSave: (molecule: Molecule) => void;
}

const Builder: React.FC<BuilderProps> = ({ onSave }) => {
  const [currentMolecule, setCurrentMolecule] = useState<Molecule>({
    id: 'temp-builder',
    name: 'New Molecule',
    atoms: [],
    bonds: []
  });

  const [history, setHistory] = useState<Molecule[]>([]);
  const [mode, setMode] = useState<'build' | 'erase'>('build');

  // Helper to save history before making a state change
  const saveHistory = () => {
    setHistory(prev => [...prev, currentMolecule]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setCurrentMolecule(previous);
    setHistory(prev => prev.slice(0, -1));
  };

  const addAtom = (element: ElementType) => {
    saveHistory();
    // Add atom slightly randomised near center
    const newAtom: AtomData = {
      id: `atom-${Date.now()}`,
      element,
      x: CANVAS_SIZE.width / 2 + (Math.random() - 0.5) * 60,
      y: CANVAS_SIZE.height / 2 + (Math.random() - 0.5) * 60
    };
    setCurrentMolecule(prev => ({
      ...prev,
      atoms: [...prev.atoms, newAtom]
    }));
    // Auto switch back to build mode if in erase
    if (mode === 'erase') setMode('build');
  };

  const handleAtomDelete = (atomId: string) => {
    saveHistory();
    setCurrentMolecule(prev => ({
      ...prev,
      atoms: prev.atoms.filter(a => a.id !== atomId),
      bonds: prev.bonds.filter(b => b.sourceAtomId !== atomId && b.targetAtomId !== atomId)
    }));
  };

  const handleMoleculeUpdate = (newMolecule: Molecule) => {
    // Detect if this update was a structural change (bond added via Renderer) to save history
    if (
      newMolecule.atoms.length !== currentMolecule.atoms.length || 
      newMolecule.bonds.length !== currentMolecule.bonds.length
    ) {
      saveHistory();
    }
    setCurrentMolecule(newMolecule);
  };

  const clearCanvas = () => {
    saveHistory();
    setCurrentMolecule({
      id: `temp-${Date.now()}`,
      name: 'New Molecule',
      atoms: [],
      bonds: []
    });
  };

  const handleSave = () => {
    if (currentMolecule.atoms.length === 0) return;
    onSave({ ...currentMolecule, id: `mol-${Date.now()}` });
    clearCanvas();
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Toolbar / Element Palette */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-3">
           <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Elements</h3>
           <div className="flex items-center gap-2">
             <button
               onClick={() => setMode('build')}
               className={`p-1.5 rounded transition-colors ${mode === 'build' ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500' : 'text-slate-400 hover:text-slate-600'}`}
               title="Build Mode"
             >
               <MousePointer2 size={18} />
             </button>
             <button
               onClick={() => setMode('erase')}
               className={`p-1.5 rounded transition-colors ${mode === 'erase' ? 'bg-red-100 text-red-700 ring-2 ring-red-500' : 'text-slate-400 hover:text-slate-600'}`}
               title="Eraser Mode"
             >
               <Eraser size={18} />
             </button>
             <div className="w-px h-5 bg-slate-200 mx-1"></div>
             <button
               onClick={handleUndo}
               disabled={history.length === 0}
               className="p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
               title="Undo"
             >
               <Undo size={18} />
             </button>
           </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {Object.values(ElementType).map((el) => {
             const style = ELEMENT_COLORS[el];
             return (
               <button
                 key={el}
                 onClick={() => addAtom(el)}
                 className="flex items-center justify-center w-10 h-10 rounded-full shadow-sm transition-transform hover:scale-110 active:scale-95 border-2 font-bold"
                 style={{ backgroundColor: style.bg, borderColor: style.border, color: style.text === '#FFFFFF' ? 'white' : style.text }}
                 title={`Add ${el}`}
               >
                 {el}
               </button>
             );
          })}
        </div>
        <p className="text-xs text-slate-400 mt-3">
          {mode === 'build' 
            ? "Click elements to add. Drag atoms to move. Click two atoms sequentially to bond." 
            : "Click on an atom to remove it."}
        </p>
      </div>

      {/* Canvas Area - Centered and Scrollable */}
      <div className="flex-1 flex flex-col relative bg-slate-100/50 rounded-xl border border-slate-200 overflow-hidden">
        <div className="absolute inset-0 overflow-auto flex items-center justify-center p-8">
           <div 
             className="relative bg-white shadow-xl rounded-lg overflow-hidden shrink-0" 
             style={{ width: CANVAS_SIZE.width, height: CANVAS_SIZE.height }}
           >
             <MoleculeRenderer 
               molecule={currentMolecule} 
               width={CANVAS_SIZE.width} 
               height={CANVAS_SIZE.height} 
               interactive={true}
               onUpdate={handleMoleculeUpdate}
               mode={mode}
               onAtomDelete={handleAtomDelete}
             />
             
             {/* Position input on top of SVG using z-10 */}
             <div className="absolute top-4 left-4 z-10">
               <input 
                  type="text" 
                  value={currentMolecule.name}
                  onChange={(e) => setCurrentMolecule(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-white/90 backdrop-blur border border-slate-300 rounded px-2 py-1 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none w-48 shadow-sm"
                  placeholder="Molecule Name"
               />
             </div>
           </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button 
          onClick={clearCanvas}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Trash2 size={18} />
          Clear
        </button>
        <button 
          onClick={handleSave}
          disabled={currentMolecule.atoms.length === 0}
          className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={18} />
          Save Molecule
        </button>
      </div>
    </div>
  );
};

export default Builder;