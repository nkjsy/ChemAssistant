import React, { useState, useEffect } from 'react';
import { Molecule } from './types';
import Builder from './components/Builder';
import ReactionLab from './components/ReactionLab';
import { Atom, FlaskConical, Github } from 'lucide-react';

enum Tab {
  BUILDER = 'builder',
  LAB = 'lab'
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.BUILDER);
  const [savedMolecules, setSavedMolecules] = useState<Molecule[]>([]);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  useEffect(() => {
    // Check for API key availability roughly
    if (!process.env.API_KEY) {
       console.warn("API Key is missing from environment variables.");
       setApiKeyMissing(true);
    }
  }, []);

  const handleSaveMolecule = (mol: Molecule) => {
    setSavedMolecules(prev => [...prev, mol]);
    // Optional: Switch to lab automatically after save?
    // setActiveTab(Tab.LAB); 
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Atom className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">ChemReact <span className="text-indigo-600">AI</span></h1>
          </div>

          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab(Tab.BUILDER)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === Tab.BUILDER ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <span className="flex items-center gap-2"><Atom size={16}/> Builder</span>
            </button>
            <button
              onClick={() => setActiveTab(Tab.LAB)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === Tab.LAB ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <span className="flex items-center gap-2"><FlaskConical size={16}/> Reaction Lab</span>
            </button>
          </nav>

          <div className="w-10">
             {/* Spacer for centering nav roughly */}
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 overflow-hidden">
        {apiKeyMissing && (
           <div className="mb-4 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm">
             <strong>Warning:</strong> API_KEY is missing. The Reaction Lab will not function correctly without a valid Gemini API key.
           </div>
        )}

        <div className="h-[calc(100vh-8rem)]">
          {activeTab === Tab.BUILDER ? (
            <Builder onSave={handleSaveMolecule} />
          ) : (
            <ReactionLab savedMolecules={savedMolecules} onSaveProduct={handleSaveMolecule} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;