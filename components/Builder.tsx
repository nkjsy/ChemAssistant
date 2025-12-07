
import React, { useState } from 'react';
import { ElementType, Molecule, AtomData } from '../types';
import { getElementStyle, ELEMENT_DATA_MAP, CANVAS_SIZE, COMMON_ELEMENTS } from '../constants';
import MoleculeRenderer from './MoleculeRenderer';
import { autoLayoutMolecule } from '../services/layoutService';
import { identifyMolecule } from '../services/geminiService';
import PeriodicTable from './PeriodicTable';
import { Trash2, Save, Undo, Eraser, MousePointer2, FolderOpen, X, Search, Wand2, TableProperties, Loader2 } from 'lucide-react';

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
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isPeriodicTableOpen, setIsPeriodicTableOpen] = useState(false);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [saveName, setSaveName] = useState('');
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

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
      id: `atom-${Date.now()}-${Math.floor(Math.random()*1000)}`,
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

  const generateFormula = (atoms: AtomData[]) => {
    if (atoms.length === 0) return '';
    const counts: Record<string, number> = {};
    atoms.forEach(a => {
      counts[a.element] = (counts[a.element] || 0) + 1;
    });
    
    // Sort logic: C, H, then alphabetical (Simplified Hill System)
    const elements = Object.keys(counts).sort((a, b) => {
      if (a === 'C') return -1;
      if (b === 'C') return 1;
      if (a === 'H' && b !== 'C') return -1;
      if (b === 'H' && a !== 'C') return 1;
      return a.localeCompare(b);
    });
    
    return elements.map(el => `${el}${counts[el] > 1 ? counts[el] : ''}`).join('');
  };

  const initiateSave = async () => {
    if (currentMolecule.atoms.length === 0) return;

    let suggestion = currentMolecule.name;
    // Suggest identify if name is still default
    if (suggestion === 'New Molecule' || !suggestion.trim()) {
       setIsIdentifying(true);
       try {
         const name = await identifyMolecule(currentMolecule);
         if (name && name !== 'Unknown Structure') {
           suggestion = name;
         } else {
           suggestion = generateFormula(currentMolecule.atoms);
         }
       } catch (error) {
         suggestion = generateFormula(currentMolecule.atoms);
       } finally {
         setIsIdentifying(false);
       }
    }
    setSaveName(suggestion);
    setIsSaveModalOpen(true);
  };

  const confirmSave = () => {
    let moleculeToSave = { ...currentMolecule, name: saveName };
    
    // Check if this is an existing molecule (already saved previously)
    const original = savedMolecules.find(m => m.id === currentMolecule.id);
    
    // Logic: 
    // If it's a new molecule (temp ID) -> Assign new ID.
    // If it's existing BUT name changed -> Assign new ID (Save As).
    // If it's existing AND name matches -> Keep ID (Overwrite).
    
    if (!original) {
        // New molecule
        moleculeToSave.id = `mol-${Date.now()}`;
    } else if (original.name !== saveName) {
        // Name changed, treat as new "Save As"
        moleculeToSave.id = `mol-${Date.now()}`;
    }
    // else: keep existing ID to overwrite

    onSave(moleculeToSave);
    setIsSaveModalOpen(false);
    clearCanvas();
  };

  const filteredSavedMolecules = savedMolecules.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full gap-4 relative overflow-hidden">
      {/* Main Builder Content */}
      <div className="flex flex-col flex-1 h-full gap-4 min-w-0 transition-all">
        {/* Toolbar / Element Palette */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 z-20 relative">
          <div className="flex items-center justify-between mb-3">
             <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Builder Tools</h3>
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
               <div className="w-px h-5 bg-slate-200 mx-1"></div>
               <button
                 onClick={() => setIsPeriodicTableOpen(true)}
                 className="p-1.5 rounded text-indigo-600 bg-indigo-50 hover:bg-indigo-100 ring-1 ring-indigo-200 transition-colors flex items-center gap-2 px-3"
                 title="Open Periodic Table"
               >
                 <TableProperties size={18} />
                 <span className="text-xs font-semibold">Periodic Table</span>
               </button>
             </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {COMMON_ELEMENTS.map((el) => {
               const style = getElementStyle(el);
               const data = ELEMENT_DATA_MAP[el];
               const isHovered = hoveredElement === el;
               
               return (
                 <div key={el} className="relative">
                   <button
                     onClick={() => addAtom(el)}
                     onMouseEnter={() => setHoveredElement(el)}
                     onMouseLeave={() => setHoveredElement(null)}
                     className="flex items-center justify-center w-10 h-10 rounded-full shadow-sm transition-transform hover:scale-110 active:scale-95 border-2 font-bold relative z-10"
                     style={{ backgroundColor: style.bg, borderColor: style.border, color: style.text }}
                   >
                     {el}
                   </button>
                   {isHovered && data && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 p-3 bg-slate-900/95 text-white text-xs rounded-lg shadow-xl pointer-events-none z-50 backdrop-blur-sm border border-slate-700 animate-in fade-in zoom-in-95 duration-150">
                          <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-2">
                              <span className="font-bold text-sm">{data.name}</span>
                              <span className="font-mono text-lg font-bold text-slate-400">{el}</span>
                          </div>
                           <div className="space-y-1">
                             <div className="flex justify-between">
                               <span className="text-slate-400">Atomic No.</span>
                               <span className="font-mono">{data.atomicNumber}</span>
                             </div>
                             <div className="flex justify-between">
                               <span className="text-slate-400">Mass</span>
                               <span className="font-mono">{data.mass}</span>
                             </div>
                          </div>
                          {/* Arrow */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900/95"></div>
                      </div>
                   )}
                 </div>
               );
            })}
          </div>
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
               
               {/* Position input on top of SVG using z-40 to be above the SVG's z-20 */}
               <div className="absolute top-4 left-4 z-40">
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
            onClick={initiateSave}
            disabled={currentMolecule.atoms.length === 0 || isIdentifying}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isIdentifying ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {isIdentifying ? 'Identifying...' : 'Save Molecule'}
          </button>
        </div>
      </div>

      {/* Periodic Table Sidebar */}
      <PeriodicTable 
        isOpen={isPeriodicTableOpen} 
        onClose={() => setIsPeriodicTableOpen(false)}
        onSelect={(element) => {
          addAtom(element);
          // Optional: Keep open or close. Let's keep open for rapid addition.
        }}
      />

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
                             <MoleculeRenderer 
                               molecule={mol} 
                               width={150} 
                               height={110} 
                               showControls={false} 
                               autoFit={true}
                             />
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

      {/* Save Confirmation Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Save className="text-indigo-600" size={20} />
                  Save Molecule
                </h3>
                
                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Molecule Name</label>
                    <input 
                        type="text" 
                        value={saveName}
                        onChange={(e) => setSaveName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        autoFocus
                        placeholder="e.g. Water"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Give your creation a name to find it easily in the inventory.
                    </p>
                </div>

                <div className="flex justify-end gap-3">
                    <button 
                        onClick={() => setIsSaveModalOpen(false)}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmSave}
                        disabled={!saveName.trim()}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium transition-colors"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Builder;
