
import React, { useState } from 'react';
import { PERIODIC_TABLE, getElementStyle, ElementDef, CATEGORY_COLORS } from '../constants';
import { X } from 'lucide-react';

interface PeriodicTableProps {
  onSelect: (element: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

const PeriodicTable: React.FC<PeriodicTableProps> = ({ onSelect, onClose, isOpen }) => {
  const [hoveredElement, setHoveredElement] = useState<ElementDef | null>(null);

  // Ordered categories for display
  const orderedCategories = [
    'alkali metal', 
    'alkaline earth metal', 
    'transition metal', 
    'post-transition metal', 
    'metalloid', 
    'polyatomic nonmetal', 
    'diatomic nonmetal', 
    'noble gas', 
    'lanthanide', 
    'actinide'
  ];

  return (
    <div 
      className={`fixed top-0 right-0 h-full bg-white shadow-2xl border-l border-slate-200 transform transition-transform duration-300 ease-in-out z-40 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      style={{ width: 'min(90vw, 850px)' }}
    >
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div>
           <h2 className="text-xl font-bold text-slate-800">Periodic Table</h2>
           <p className="text-sm text-slate-500">Select an element to add to the canvas</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6 bg-slate-50/50">
         <div className="relative mx-auto" style={{ width: 'fit-content' }}>
            {/* Grid Container */}
            <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(18, minmax(36px, 1fr))', gridTemplateRows: 'repeat(10, minmax(36px, 1fr))' }}>
               {PERIODIC_TABLE.map((el) => {
                  const style = getElementStyle(el.symbol);
                  return (
                    <button
                      key={el.symbol}
                      onClick={() => {
                          onSelect(el.symbol);
                          // Optional: Close on select? Maybe keep open for multiple adds.
                      }}
                      onMouseEnter={() => setHoveredElement(el)}
                      onMouseLeave={() => setHoveredElement(null)}
                      className="w-9 h-9 md:w-10 md:h-10 flex flex-col items-center justify-center border text-[10px] md:text-xs font-bold leading-none rounded hover:scale-110 hover:z-10 hover:shadow-lg transition-all"
                      style={{ 
                        gridColumn: el.xpos, 
                        gridRow: el.ypos,
                        backgroundColor: style.bg,
                        borderColor: style.border,
                        color: style.text
                      }}
                    >
                      <span>{el.symbol}</span>
                      <span className="text-[8px] opacity-70 font-normal">{el.atomicNumber}</span>
                    </button>
                  );
               })}
            </div>

            {/* Information Panel */}
            {hoveredElement && (
               <div className="absolute left-0 top-0 mt-20 ml-20 pointer-events-none z-20 w-48 bg-slate-900/95 text-white p-4 rounded-xl shadow-xl backdrop-blur border border-slate-700">
                  <div className="flex items-baseline justify-between border-b border-slate-700 pb-2 mb-2">
                     <span className="text-2xl font-bold">{hoveredElement.symbol}</span>
                     <span className="text-sm text-slate-400">{hoveredElement.category}</span>
                  </div>
                  <div className="space-y-1 text-sm">
                     <div className="font-bold text-lg mb-1">{hoveredElement.name}</div>
                     <div className="flex justify-between">
                       <span className="text-slate-400">Atomic Number</span>
                       <span>{hoveredElement.atomicNumber}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-slate-400">Atomic Mass</span>
                       <span>{hoveredElement.mass}</span>
                     </div>
                  </div>
               </div>
            )}
         </div>
         
         {/* Legend */}
         <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-600 max-w-4xl mx-auto">
             {orderedCategories.map(cat => {
                 const style = CATEGORY_COLORS[cat] || CATEGORY_COLORS['unknown'];
                 return (
                    <div key={cat} className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full border" 
                            style={{ 
                               backgroundColor: style.bg,
                               borderColor: style.border
                            }}></div>
                       <span className="capitalize">{cat}</span>
                    </div>
                 );
             })}
         </div>
      </div>
    </div>
  );
};

export default PeriodicTable;