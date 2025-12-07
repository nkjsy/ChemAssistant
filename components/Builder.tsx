import React, { useState } from 'react';
import { ElementType, Molecule, AtomData } from '../types';
import { ELEMENT_COLORS, CANVAS_SIZE } from '../constants';
import MoleculeRenderer from './MoleculeRenderer';
import { autoLayoutMolecule } from '../services/layoutService';
import { Trash2, Save, Undo, Eraser, MousePointer2, FolderOpen, X, Search, Wand2 } from 'lucide-react';

interface BuilderProps {
  onSave: (molecule: Molecule) => void;
  savedMolecules: Molecule[];
  onDelete: (id: string) => void;
}

const Builder: React.FC<BuilderProps> = ({ onSave, savedMolecules, onDelete }) => {
  const [currentMolecule, setCurrentMolecule] = useState<Molecule>({
    id: 'temp-builder',
    name: 'New Molecule',
    atoms: [],
    bonds: []
  });

  const [history, setHistory] = useState<Molecule[]>([]);
  const [mode, setMode] = useState<'build' | 'erase'>('build');
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleBondDelete = (bondId: string) => {
    saveHistory();
    setCurrentMolecule(prev => ({
      ...prev,
      bonds: prev.bonds.filter(b => b.id !== bondId)
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

  const handleAutoLayout = () => {
    if (currentMolecule.atoms.length === 0) return;
    saveHistory();
    const formattedMolecule = autoLayoutMolecule(currentMolecule, CANVAS_SIZE.width, CANVAS_SIZE.height);
    setCurrentMolecule(formattedMolecule);
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

  const handleLoad = (mol: Molecule) => {
    // Deep clone to ensure we have a fresh working copy
    // We keep the ID so we know which molecule we are editing
    const clone = JSON.parse(JSON.stringify(mol));
    setCurrentMolecule(clone);
    setHistory([]); // Clear history when loading new
    setIsLoadModalOpen(false);
  };

  const handleSave = () => {
    if (currentMolecule.atoms.length === 0) return;
    
    let moleculeToSave = { ...currentMolecule };
    
    // Check if this is an existing molecule (already saved previously)
    const original = savedMolecules.find(m => m.id === currentMolecule.id);
    
    // Logic: 
    // If it's a new molecule (temp ID) -> Assign new ID.
    // If it's existing BUT name changed -> Assign new ID (Save As).
    // If it's existing AND name matches -> Keep ID (Overwrite).
    
    if (!original) {
        // New molecule
        moleculeToSave.id = `mol-${Date.now()}`;
    } else if (original.name !== currentMolecule.name) {
        // Name changed, treat as new "Save As"
        moleculeToSave.id = `mol-${Date.now()}`;
    }
    // else: keep existing ID to overwrite

    onSave(moleculeToSave);
    clearCanvas();
  };

  const filteredSavedMolecules = savedMolecules.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
               onClick={handleAutoLayout}
               className="p-1.5 rounded text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
               title="Auto Layout"
             >
               <Wand2 size={18} />
             </button>
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
        <p className="text-xs text-slate-500 mt-3 font-medium bg-slate-50 p-2 rounded border border-slate-100">
          {mode === 'build' 
            ? "💡 Tip: Click elements to add. Drag to move. Click two atoms to bond. Click the target atom repeatedly to cycle single/double/triple bonds." 
            : "Click on an atom or bond to remove it."}
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
               onBondDelete={handleBondDelete}
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
          onClick={() => setIsLoadModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
        >
          <FolderOpen size={18} />
          Load
        </button>
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

      {/* Load Modal */}
      {isLoadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                 <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                   <FolderOpen size={20} className="text-indigo-600"/> 
                   Load Molecule
                 </h3>
                 <button onClick={() => setIsLoadModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                   <X size={20} />
                 </button>
              </div>
              
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search your molecules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                 {savedMolecules.length === 0 ? (
                   <div className="text-center py-12 text-slate-400">
                     No saved molecules found. Create and save some!
                   </div>
                 ) : filteredSavedMolecules.length === 0 ? (
                   <div className="text-center py-12 text-slate-400">
                     No matches found.
                   </div>
                 ) : (
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {filteredSavedMolecules.map(mol => (
                        <div 
                          key={mol.id}
                          onClick={() => handleLoad(mol)}
                          className="group relative p-2 border rounded-lg hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all bg-white"
                        >
                           <div className="aspect-[4/3] flex items-center justify-center bg-slate-50 rounded border border-slate-100 mb-2 overflow-hidden pointer-events-none">
                             <MoleculeRenderer molecule={mol} width={150} height={110} showControls={false} />
                           </div>
                           <div className="text-sm font-medium text-slate-700 truncate text-center group-hover:text-indigo-600">
                             {mol.name}
                           </div>
                           <div className="text-xs text-slate-400 text-center">
                             {mol.atoms.length} atoms
                           </div>
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               onDelete(mol.id);
                             }}
                             className="absolute top-2 right-2 p-1.5 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm border border-slate-100"
                             title="Delete Molecule"
                           >
                             <Trash2 size={16} />
                           </button>
                        </div>
                      ))}
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Builder;