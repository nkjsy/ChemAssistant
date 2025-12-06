import React, { useState } from 'react';
import { Molecule, ReactionResult } from '../types';
import MoleculeRenderer from './MoleculeRenderer';
import { simulateReaction } from '../services/geminiService';
import { FlaskConical, ArrowRight, Loader2, Beaker, RotateCcw, Search, Plus, Save, Trash2 } from 'lucide-react';

interface ReactionLabProps {
  savedMolecules: Molecule[];
  onSaveProduct: (molecule: Molecule) => void;
  onDelete: (id: string) => void;
}

const ReactionLab: React.FC<ReactionLabProps> = ({ savedMolecules, onSaveProduct, onDelete }) => {
  const [reactants, setReactants] = useState<Molecule[]>([]);
  const [result, setResult] = useState<ReactionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Save Product State
  const [editingProduct, setEditingProduct] = useState<Molecule | null>(null);
  const [newName, setNewName] = useState('');

  const toggleReactant = (mol: Molecule) => {
    if (reactants.find(r => r.id === mol.id)) {
      setReactants(reactants.filter(r => r.id !== mol.id));
    } else {
      setReactants([...reactants, mol]);
    }
  };

  const handleReact = async () => {
    if (reactants.length === 0) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const reactionResult = await simulateReaction(reactants);
      setResult(reactionResult);
    } catch (e: any) {
      setError(e.message || "Failed to simulate reaction");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setReactants([]);
    setResult(null);
    setError(null);
  };

  const initiateSave = (mol: Molecule) => {
    setEditingProduct(mol);
    setNewName(mol.name);
  };

  const confirmSave = () => {
    if (editingProduct && newName.trim()) {
      onSaveProduct({
        ...editingProduct,
        name: newName.trim(),
        id: `saved-prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      });
      setEditingProduct(null);
    }
  };

  const filteredMolecules = savedMolecules.filter(mol => 
    mol.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Reactant Selection */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-2">
          <Beaker size={16} /> Inventory
        </h3>
        
        {savedMolecules.length > 0 && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search molecules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
            />
          </div>
        )}

        {savedMolecules.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            No molecules created yet. Build some in the editor!
          </div>
        ) : filteredMolecules.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            No matching molecules found.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-2">
            {filteredMolecules.map(mol => {
              const isSelected = !!reactants.find(r => r.id === mol.id);
              return (
                <div 
                  key={mol.id}
                  onClick={() => toggleReactant(mol)}
                  className={`group relative p-2 rounded-lg border-2 cursor-pointer transition-all ${isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 hover:border-indigo-200'}`}
                >
                  <div className="pointer-events-none scale-75 origin-top-left -mb-4">
                     <MoleculeRenderer molecule={mol} width={150} height={100} showControls={false} />
                  </div>
                  <div className="mt-2 text-xs font-semibold text-center truncate px-1">
                    {mol.name}
                  </div>
                  
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(mol.id);
                    }}
                    className="absolute top-1 left-1 p-1 bg-white/90 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm border border-slate-100 z-10"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reaction Stage */}
      <div className="flex-1 bg-white p-6 rounded-xl shadow-md border border-slate-200 flex flex-col min-h-0 relative">
        <div className="flex items-center justify-between mb-4">
           <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
             <FlaskConical className="text-indigo-600" /> Reaction Chamber
           </h2>
           {result && (
             <button onClick={reset} className="text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-1">
               <RotateCcw size={14} /> New Reaction
             </button>
           )}
        </div>

        {!result && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 overflow-y-auto">
            <div className="flex flex-wrap justify-center gap-4 items-center min-h-[100px]">
               {reactants.length === 0 && <span className="text-slate-400 italic">Select reactants from inventory...</span>}
               {reactants.map((r, i) => (
                 <React.Fragment key={r.id}>
                    {i > 0 && <span className="text-2xl text-slate-300 font-bold">+</span>}
                    <div className="bg-slate-50 p-2 rounded border border-slate-200 text-sm font-medium">
                      {r.name}
                    </div>
                 </React.Fragment>
               ))}
            </div>
            
            <button
              onClick={handleReact}
              disabled={reactants.length === 0}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-full font-bold shadow-lg shadow-indigo-200 transition-all transform hover:scale-105 flex items-center gap-2"
            >
              Simulate Reaction
            </button>
          </div>
        )}

        {loading && (
           <div className="flex-1 flex flex-col items-center justify-center text-indigo-600">
             <Loader2 size={48} className="animate-spin mb-4" />
             <p className="font-medium animate-pulse">Consulting the AI Chemist...</p>
           </div>
        )}

        {error && (
          <div className="flex-1 flex items-center justify-center text-red-500">
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="flex-1 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto">
            {/* Equation Header */}
            <div className="bg-slate-900 text-white p-4 rounded-lg shadow-inner text-center font-mono text-lg md:text-xl">
              {result.equation}
            </div>
            
            <p className="text-slate-600 text-center italic">
              {result.explanation}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4 pb-4">
              {result.products.map(prod => (
                <div key={prod.id} className="flex flex-col items-center gap-2 group">
                   <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-2 w-full aspect-[4/3] flex items-center justify-center overflow-hidden relative">
                      <MoleculeRenderer 
                        molecule={prod} 
                        width={250} 
                        height={200} 
                        isAutoLayout={true} 
                      />
                   </div>
                   <div className="flex items-center justify-between w-full px-2">
                      <span className="font-semibold text-slate-700 truncate flex-1" title={prod.name}>{prod.name}</span>
                      <button 
                        onClick={() => initiateSave(prod)}
                        className="ml-2 p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors flex items-center gap-1 text-xs font-medium"
                        title="Add to Inventory"
                      >
                         <Plus size={14} /> Add
                      </button>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Save Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Save className="text-indigo-600" size={20} />
                  Save Product
                </h3>
                
                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Molecule Name</label>
                    <input 
                        type="text" 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        autoFocus
                        placeholder="Enter molecule name"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      This molecule will be added to your inventory for use in future reactions.
                    </p>
                </div>

                <div className="flex justify-end gap-3">
                    <button 
                        onClick={() => setEditingProduct(null)}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmSave}
                        disabled={!newName.trim()}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium transition-colors"
                    >
                        Save to Inventory
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ReactionLab;