
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Scissors, Calendar, CheckCircle2, Layers, ArrowRight, 
  RefreshCw, X, Info, FileText, Target 
} from 'lucide-react';
import { JobBatch, CuttingPlanDetail } from '../types';
import { generateISODocID, DEPT_CODES, DOC_TYPE_CODES } from '../constants';

interface CuttingPlanGeneratorProps {
  job: JobBatch;
  onClose: () => void;
  onIssue: (details: CuttingPlanDetail[]) => void;
}

// Internal type for state management of the form
interface PlanState {
  startDate: string;
  finishDate: string;
  dailyTarget: number;
  shrinkageLengthPct: number;
  shrinkageWidthPct: number;
  extraCuttingPct: number;
  // Matrix: [ShadeName][SizeName] = BaseQuantity
  quantities: Record<string, Record<string, number>>;
}

export const CuttingPlanGenerator: React.FC<CuttingPlanGeneratorProps> = ({ job, onClose, onIssue }) => {
  const [isIssuing, setIsIssuing] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // To switch between fabrics if multiple exist

  // Generate ISO Control Number for this new Plan
  const controlNumber = useMemo(() => {
      // Seq could be existing plans + 1 if we had a history, default to 1 for demo or job.cuttingPlanDetails.length + 1
      return generateISODocID(job.id, DEPT_CODES.Cutting, DOC_TYPE_CODES.Plan, 1);
  }, [job.id]);

  // --- 1. Data Preparation (Consolidated View) ---
  
  // A. CP Dates
  const cpDates = useMemo(() => {
    const dates: { date: string, label: string }[] = [];
    job.styles.forEach(style => {
      style.criticalPath?.schedule
        .filter(t => t.processGroup === 'Cutting')
        .forEach(t => {
          dates.push({ date: t.calculatedDueDate, label: t.milestone });
        });
    });
    return dates.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [job]);

  // B. Unique Fabrics (The primary keys for our plans)
  const fabrics = useMemo(() => {
    const uniqueFabrics = new Map<string, { 
        id: string, 
        name: string, 
        code: string, 
        desc: string, 
        styles: string[], 
        shades: Set<string>,
        allSizes: Set<string>
    }>();

    job.styles.forEach(style => {
        const styleFabrics = style.bom?.filter(i => i.processGroup === 'Fabric') || [];
        
        styleFabrics.forEach(item => {
            const key = item.componentName;
            if (!uniqueFabrics.has(key)) {
                uniqueFabrics.set(key, {
                    id: item.id,
                    name: item.componentName,
                    code: item.supplierRef || 'N/A',
                    desc: style.fabricDescription || 'N/A',
                    styles: [],
                    shades: new Set(),
                    allSizes: new Set()
                });
            }
            const entry = uniqueFabrics.get(key)!;
            if (!entry.styles.includes(style.styleNo)) entry.styles.push(style.styleNo);
            
            // Collect Shades from this style
            style.colors?.forEach(c => entry.shades.add(c.name));
            
            // Collect Sizes from this style
            style.sizeGroups?.forEach(sg => sg.sizes.forEach(s => entry.allSizes.add(s)));
        });
    });

    return Array.from(uniqueFabrics.values()).map(f => ({
        ...f,
        shades: Array.from(f.shades),
        allSizes: Array.from(f.allSizes).sort((a, b) => {
             // Try to sort numerically
             const na = parseInt(a);
             const nb = parseInt(b);
             if (!isNaN(na) && !isNaN(nb)) return na - nb;
             return a.localeCompare(b);
        })
    }));
  }, [job]);

  // C. Initial State Initialization
  const [plans, setPlans] = useState<Record<string, PlanState>>({});

  useEffect(() => {
    const initialPlans: Record<string, PlanState> = {};
    
    fabrics.forEach(fabric => {
        // Pre-calculate Base Quantities from Orders
        const initialQuantities: Record<string, Record<string, number>> = {};
        
        fabric.shades.forEach(shade => {
            initialQuantities[shade] = {};
            fabric.allSizes.forEach(size => {
                // Sum qty for this Shade+Size across ALL linked styles
                let total = 0;
                job.styles.forEach(style => {
                    const colorId = style.colors?.find(c => c.name === shade)?.id;
                    if (colorId && style.sizeGroups) {
                        style.sizeGroups.forEach(sg => {
                            if (sg.sizes.includes(size)) {
                                total += parseInt(sg.breakdown[colorId]?.[size] || '0');
                            }
                        });
                    }
                });
                initialQuantities[shade][size] = total;
            });
        });

        initialPlans[fabric.name] = {
            startDate: cpDates[0]?.date || new Date().toISOString().split('T')[0],
            finishDate: cpDates[cpDates.length - 1]?.date || '',
            dailyTarget: 0,
            shrinkageLengthPct: 0,
            shrinkageWidthPct: 0,
            extraCuttingPct: 3, // Default allowance
            quantities: initialQuantities
        };
    });
    setPlans(initialPlans);
  }, [fabrics, job, cpDates]);

  // --- Handlers ---

  const currentFabric = fabrics[activeTab];
  const currentPlan = currentFabric ? plans[currentFabric.name] : null;

  // Use callback to prevent dependency loops
  const updatePlanField = useCallback((field: keyof PlanState, value: any) => {
      if (!currentFabric) return;
      setPlans(prev => {
          const prevPlan = prev[currentFabric.name];
          if (prevPlan[field] === value) return prev; // No change
          
          return {
            ...prev,
            [currentFabric.name]: {
                ...prevPlan,
                [field]: value
            }
          };
      });
  }, [currentFabric]);

  const updateQuantity = (shade: string, size: string, val: string) => {
      if (!currentFabric) return;
      const num = parseInt(val) || 0;
      setPlans(prev => ({
          ...prev,
          [currentFabric.name]: {
              ...prev[currentFabric.name],
              quantities: {
                  ...prev[currentFabric.name].quantities,
                  [shade]: {
                      ...prev[currentFabric.name].quantities[shade],
                      [size]: num
                  }
              }
          }
      }));
  };

  // --- Calculations ---

  // 1. Calculate Totals (Live)
  const totals = useMemo(() => {
      if (!currentFabric || !currentPlan) return null;
      
      const shadeTotals: Record<string, { base: number, final: number }> = {};
      const sizeTotals: Record<string, { base: number, final: number }> = {};
      let grandBase = 0;
      let grandFinal = 0;

      // Initialize zeros for all columns
      currentFabric.allSizes.forEach(s => sizeTotals[s] = { base: 0, final: 0 });

      currentFabric.shades.forEach(shade => {
          let sBase = 0;
          let sFinal = 0;
          currentFabric.allSizes.forEach(size => {
              const base = currentPlan.quantities[shade]?.[size] || 0;
              const final = Math.ceil(base * (1 + currentPlan.extraCuttingPct / 100));
              
              sBase += base;
              sFinal += final;

              sizeTotals[size].base += base;
              sizeTotals[size].final += final;
          });
          shadeTotals[shade] = { base: sBase, final: sFinal };
          grandBase += sBase;
          grandFinal += sFinal;
      });

      return { shadeTotals, sizeTotals, grandBase, grandFinal };
  }, [currentFabric, currentPlan]);

  // 2. Auto-Calculate Daily Target
  useEffect(() => {
      if (currentPlan?.startDate && currentPlan?.finishDate && totals) {
          const start = new Date(currentPlan.startDate);
          const end = new Date(currentPlan.finishDate);
          const diffTime = end.getTime() - start.getTime();
          // Ensure non-negative days (at least 1 day if start == end)
          const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1); 
          
          const autoTarget = Math.ceil(totals.grandFinal / diffDays);
          
          if (autoTarget !== currentPlan.dailyTarget) {
               updatePlanField('dailyTarget', autoTarget);
          }
      }
  }, [currentPlan?.startDate, currentPlan?.finishDate, totals?.grandFinal, updatePlanField, currentPlan?.dailyTarget]);


  const handleIssue = () => {
      setIsIssuing(true);
      const details: CuttingPlanDetail[] = fabrics.map(f => {
          const p = plans[f.name];
          
          const sizeBreakdown: Record<string, Record<string, { base: number, final: number }>> = {};
          f.shades.forEach(shade => {
              sizeBreakdown[shade] = {};
              f.allSizes.forEach(size => {
                  const base = p.quantities[shade]?.[size] || 0;
                  const final = Math.ceil(base * (1 + p.extraCuttingPct / 100));
                  sizeBreakdown[shade][size] = { base, final };
              });
          });

          return {
              id: f.id,
              materialName: f.name,
              shrinkageLengthPct: p.shrinkageLengthPct,
              shrinkageWidthPct: p.shrinkageWidthPct,
              extraCuttingPct: p.extraCuttingPct,
              startDate: p.startDate,
              finishDate: p.finishDate,
              dailyTarget: p.dailyTarget,
              sizeBreakdown: sizeBreakdown,
              // We could attach ISO metadata to each plan detail if they were separate docs, but here they are part of one "Plan"
              // The parent Job will hold the main Plan ID.
          };
      });

      setTimeout(() => {
          onIssue(details);
          setIsIssuing(false);
      }, 1200);
  };

  if (!currentFabric || !currentPlan || !totals) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gray-100 w-full max-w-[95vw] h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-gray-200 flex justify-between items-center shrink-0">
           <div className="flex items-center gap-4">
              <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
                 <Scissors size={24} />
              </div>
              <div>
                 <h2 className="text-xl font-bold text-[#37352F]">Cutting Execution Ticket</h2>
                 <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="font-mono font-medium bg-gray-100 px-2 py-0.5 rounded border">{job.id}</span>
                    <span>•</span>
                    <span className="text-[10px] text-gray-400 font-mono">
                        Doc: {controlNumber}
                    </span>
                 </div>
              </div>
           </div>
           <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"><X size={24}/></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
            
            {/* Left Sidebar: Fabric Selector */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto shrink-0">
                <div className="p-4 border-b border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Select Material</h3>
                </div>
                {fabrics.map((f, idx) => (
                    <button
                        key={f.id}
                        onClick={() => setActiveTab(idx)}
                        className={`text-left px-4 py-4 border-b border-gray-50 transition-all group
                            ${activeTab === idx ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}
                    >
                        <div className={`font-bold text-sm mb-1 ${activeTab === idx ? 'text-indigo-900' : 'text-gray-700'}`}>
                            {f.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{f.code}</div>
                        <div className="mt-2 flex gap-1 flex-wrap">
                            {f.styles.map(s => (
                                <span key={s} className="text-[9px] px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-500">
                                    {s}
                                </span>
                            ))}
                        </div>
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* 1. Material Context & CP Dates */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Material Specs */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
                        <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Layers size={16} className="text-gray-400"/> Material Specifications
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Fabric Code</label>
                                <div className="font-medium">{currentFabric.code}</div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Description</label>
                                <div className="font-medium truncate" title={currentFabric.desc}>{currentFabric.desc}</div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Width / Weight</label>
                                <div className="font-medium">Open Width / TBD gsm</div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Linked Styles</label>
                                <div className="font-medium text-blue-600">{currentFabric.styles.length} styles</div>
                            </div>
                        </div>
                    </div>

                    {/* CP Dates */}
                    <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 shadow-sm">
                        <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                            <Calendar size={16}/> CP Targets
                        </h4>
                        <div className="space-y-2">
                            {cpDates.length > 0 ? (
                                <>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-blue-600">Start:</span>
                                        <span className="font-mono font-bold">{cpDates[0].date}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-blue-600">Finish:</span>
                                        <span className="font-mono font-bold">{cpDates[cpDates.length-1].date}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="text-xs text-blue-400 italic">No CP dates found.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Execution Planning Inputs */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Target size={16} className="text-gray-400"/> Execution Parameters
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {/* Schedule */}
                        <div className="lg:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Date</label>
                            <input 
                                type="date" 
                                value={currentPlan.startDate}
                                onChange={(e) => updatePlanField('startDate', e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div className="lg:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Finish Date</label>
                            <input 
                                type="date" 
                                value={currentPlan.finishDate}
                                onChange={(e) => updatePlanField('finishDate', e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div className="lg:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Daily Target</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={currentPlan.dailyTarget}
                                    readOnly // Calculated field
                                    className="w-full border border-gray-200 bg-gray-50 text-gray-600 rounded px-2 py-1.5 text-sm focus:ring-0 outline-none cursor-not-allowed"
                                />
                                <span className="absolute right-2 top-1.5 text-xs text-gray-400">auto/pcs</span>
                            </div>
                        </div>

                        {/* Allowances */}
                        <div className="lg:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Shrinkage L%</label>
                            <div className="flex items-center border border-gray-300 rounded bg-white px-2">
                                <input 
                                    type="number" 
                                    value={currentPlan.shrinkageLengthPct}
                                    onChange={(e) => updatePlanField('shrinkageLengthPct', parseFloat(e.target.value))}
                                    className="w-full py-1.5 text-sm outline-none text-center"
                                />
                                <span className="text-xs text-gray-400">%</span>
                            </div>
                        </div>
                        <div className="lg:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Shrinkage W%</label>
                            <div className="flex items-center border border-gray-300 rounded bg-white px-2">
                                <input 
                                    type="number" 
                                    value={currentPlan.shrinkageWidthPct}
                                    onChange={(e) => updatePlanField('shrinkageWidthPct', parseFloat(e.target.value))}
                                    className="w-full py-1.5 text-sm outline-none text-center"
                                />
                                <span className="text-xs text-gray-400">%</span>
                            </div>
                        </div>
                        <div className="lg:col-span-1">
                            <label className="block text-xs font-bold text-indigo-600 uppercase mb-1">Extra Cut %</label>
                            <div className="flex items-center border border-indigo-300 rounded bg-indigo-50 px-2 shadow-sm">
                                <input 
                                    type="number" 
                                    value={currentPlan.extraCuttingPct}
                                    onChange={(e) => updatePlanField('extraCuttingPct', parseFloat(e.target.value))}
                                    className="w-full py-1.5 text-sm outline-none text-center bg-transparent font-bold text-indigo-700"
                                />
                                <span className="text-xs text-indigo-500">%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. THE MATRIX (Size-Wise Breakdown) */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            <FileText size={16} className="text-gray-400"/> Size-Wise Breakdown Table
                        </h4>
                        <div className="flex gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 border border-gray-300 bg-white rounded"></div>
                                <span className="text-gray-500">Base Qty (Order)</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 bg-indigo-100 border border-indigo-200 rounded"></div>
                                <span className="text-indigo-700 font-bold">Final Cut Qty (With Allowance)</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-center border-collapse">
                            <thead>
                                <tr className="bg-gray-100 text-xs uppercase text-gray-500 font-bold">
                                    <th className="p-3 border-r border-gray-200 sticky left-0 bg-gray-100 w-32 text-left">Shade / Size</th>
                                    {currentFabric.allSizes.map(size => (
                                        <th key={size} className="p-3 border-r border-gray-200 min-w-[100px]">
                                            {size}
                                        </th>
                                    ))}
                                    <th className="p-3 bg-gray-200 border-l border-gray-300 min-w-[100px]">Total</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-gray-100">
                                {currentFabric.shades.map(shade => {
                                    const rowTotal = totals.shadeTotals[shade];
                                    return (
                                        <tr key={shade} className="group hover:bg-gray-50">
                                            <td className="p-3 font-medium text-left border-r border-gray-200 sticky left-0 bg-white group-hover:bg-gray-50">
                                                {shade}
                                            </td>
                                            {currentFabric.allSizes.map(size => {
                                                const base = currentPlan.quantities[shade]?.[size] || 0;
                                                const final = Math.ceil(base * (1 + currentPlan.extraCuttingPct / 100));
                                                
                                                return (
                                                    <td key={size} className="p-2 border-r border-gray-200">
                                                        <div className="flex flex-col gap-1">
                                                            <input 
                                                                type="number" 
                                                                className="w-full text-center border border-gray-200 rounded py-1 text-gray-500 focus:border-indigo-500 outline-none text-xs"
                                                                value={base}
                                                                onChange={(e) => updateQuantity(shade, size, e.target.value)}
                                                            />
                                                            <div className="bg-indigo-50 text-indigo-700 font-bold py-1 rounded text-xs border border-indigo-100">
                                                                {final}
                                                            </div>
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                            {/* Row Total */}
                                            <td className="p-2 bg-gray-50 border-l border-gray-200 font-bold">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-gray-500 text-xs">{rowTotal.base}</span>
                                                    <span className="text-indigo-700">{rowTotal.final}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {/* Column Totals */}
                                <tr className="bg-gray-100 font-bold border-t border-gray-300">
                                    <td className="p-3 text-left sticky left-0 bg-gray-100 border-r border-gray-300">TOTAL</td>
                                    {currentFabric.allSizes.map(size => {
                                        const colTotal = totals.sizeTotals[size];
                                        return (
                                            <td key={size} className="p-2 border-r border-gray-300">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-gray-500 text-xs">{colTotal.base}</span>
                                                    <span className="text-indigo-700">{colTotal.final}</span>
                                                </div>
                                            </td>
                                        );
                                    })}
                                    <td className="p-2 bg-gray-200 border-l border-gray-300">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-gray-600 text-xs">{totals.grandBase}</span>
                                            <span className="text-indigo-800 text-base">{totals.grandFinal}</span>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-white border-t border-gray-200 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2 text-xs text-gray-500">
                <Info size={14} />
                <span>This plan will be issued to the Cutting Department and lock the breakdown.</span>
            </div>
            <div className="flex gap-3">
                <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors">
                    Cancel
                </button>
                <button 
                    onClick={handleIssue}
                    disabled={isIssuing}
                    className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded shadow hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-70"
                >
                    {isIssuing ? <RefreshCw size={16} className="animate-spin"/> : <CheckCircle2 size={16}/>}
                    Issue Approved Cutting Plan
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};
