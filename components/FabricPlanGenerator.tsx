
import React, { useState, useMemo } from 'react';
import { 
  Scissors, AlertTriangle, Calendar, CheckCircle2, 
  ArrowRight, Calculator, RefreshCw, Truck, X, Layers, FileText
} from 'lucide-react';
import { JobBatch, PurchasingRequest, BOMItem } from '../types';
import { generateISODocID, DEPT_CODES, DOC_TYPE_CODES } from '../constants';

interface FabricPlanGeneratorProps {
  job: JobBatch;
  onClose: () => void;
  onIssue: (purchasingRequests: PurchasingRequest[]) => void;
}

interface ConsolidatedItem {
    key: string; // Unique key (name + supplier)
    materialName: string;
    supplier: string;
    baseRequiredQty: number; // Sum of all BOM requirements (without wastage)
    unit: string; // Assumed generic or from first item
    specs: string;
}

interface PlanningInput {
    consumptionLossPct: number;
    markerEfficiencyPct: number;
    safetyStockPct: number;
    cuttingInstructions: string;
}

export const FabricPlanGenerator: React.FC<FabricPlanGeneratorProps> = ({ job, onClose, onIssue }) => {
  const [inputs, setInputs] = useState<Record<string, PlanningInput>>({});
  const [isIssuing, setIsIssuing] = useState(false);

  // Generate a virtual document ID for display
  const planDocId = useMemo(() => {
      // Simulate sequence check (e.g. check how many fabric plans exist in system, here using random/mock)
      return generateISODocID(job.id, DEPT_CODES.Fabric, DOC_TYPE_CODES.Plan, 1);
  }, [job.id]);

  // --- CONSOLIDATION LOGIC ---
  // Merge all fabric items from all styles in the job
  const consolidatedItems: ConsolidatedItem[] = useMemo(() => {
      const map = new Map<string, ConsolidatedItem>();

      job.styles.forEach(style => {
          if (style.bom) {
              style.bom.filter(i => i.processGroup === 'Fabric').forEach(bomItem => {
                  const key = `${bomItem.componentName}-${bomItem.vendor || 'Unknown'}`;
                  
                  // Calculate raw requirement for this style based on its quantity
                  let styleReq = 0;
                  if (bomItem.usageRule === 'Generic') {
                      styleReq = (bomItem.usageData['generic'] || 0) * style.quantity;
                  } else {
                      // Fallback: Average usage * Qty
                      const values = Object.values(bomItem.usageData) as number[];
                      const avg = values.reduce((a,b) => a+b, 0) / (values.length || 1);
                      styleReq = avg * style.quantity;
                  }

                  if (map.has(key)) {
                      const existing = map.get(key)!;
                      existing.baseRequiredQty += styleReq;
                  } else {
                      map.set(key, {
                          key,
                          materialName: bomItem.componentName,
                          supplier: bomItem.vendor || 'Unknown',
                          baseRequiredQty: styleReq,
                          unit: 'Mtr', // Defaulting for demo
                          specs: bomItem.supplierRef || ''
                      });
                  }
              });
          }
      });

      return Array.from(map.values());
  }, [job]);

  // --- CALCULATIONS ---
  const calculateOutput = (item: ConsolidatedItem) => {
      const input = inputs[item.key] || { consumptionLossPct: 0, markerEfficiencyPct: 100, safetyStockPct: 0, cuttingInstructions: '' };
      
      const base = item.baseRequiredQty;
      
      // 1. Apply Consumption Loss (Shrinkage/Testing)
      const withLoss = base * (1 + input.consumptionLossPct / 100);
      
      // 2. Apply Marker Efficiency (The lower the efficiency, the more fabric needed)
      // Req = WithLoss / (Efficiency/100)
      const effDecimal = input.markerEfficiencyPct / 100;
      const withMarker = effDecimal > 0 ? withLoss / effDecimal : withLoss;
      
      // 3. Apply Safety Stock
      const finalQty = withMarker * (1 + input.safetyStockPct / 100);

      return {
          base,
          finalQty,
          variance: finalQty - base
      };
  };

  const handleInputChange = (key: string, field: keyof PlanningInput, value: any) => {
      setInputs(prev => ({
          ...prev,
          [key]: {
              ...(prev[key] || { consumptionLossPct: 0, markerEfficiencyPct: 100, safetyStockPct: 0, cuttingInstructions: '' }),
              [field]: parseFloat(value) || 0
          }
      }));
  };

  const handleIssuePlan = () => {
      setIsIssuing(true);
      
      const requests: PurchasingRequest[] = consolidatedItems.map(item => {
          const calc = calculateOutput(item);
          
          // Each request is a Material Issuance Doc technically, but we group under this Plan ID
          return {
              id: `REQ-${Date.now()}-${Math.floor(Math.random()*1000)}`,
              jobId: job.id,
              materialName: item.materialName,
              qty: Math.ceil(calc.finalQty),
              unit: item.unit,
              supplier: item.supplier,
              status: 'Pending',
              dateRequested: new Date().toISOString().split('T')[0],
              specs: item.specs
          };
      });

      // Simulate network delay
      setTimeout(() => {
          onIssue(requests);
          setIsIssuing(false);
      }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-gray-200 flex justify-between items-center">
           <div>
              <div className="flex items-center gap-2">
                 <Layers size={20} className="text-blue-600" />
                 <h2 className="text-lg font-bold text-[#37352F]">Consolidated Fabric Planning</h2>
              </div>
              <div className="flex items-center gap-4 mt-1">
                 <p className="text-xs text-gray-500">
                    Job: <span className="font-mono font-bold text-gray-700">{job.id}</span>
                 </p>
                 <div className="text-[10px] text-gray-400 font-mono">
                    Doc: {planDocId}
                 </div>
              </div>
           </div>
           <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"><X size={20}/></button>
        </div>

        {/* Main Content: Consolidated Table */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
           <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm border-collapse">
                 <thead className="bg-[#F7F7F5] text-xs uppercase font-bold text-gray-500">
                    <tr>
                       <th className="px-4 py-3 w-64 border-b border-r border-gray-200">Fabric Material</th>
                       <th className="px-4 py-3 w-32 text-right border-b border-r border-gray-200 bg-yellow-50/50">Base Req. (Aggregated)</th>
                       <th className="px-4 py-3 w-32 border-b border-gray-200">Consump. Loss %</th>
                       <th className="px-4 py-3 w-32 border-b border-gray-200">Marker Eff. %</th>
                       <th className="px-4 py-3 w-32 border-b border-r border-gray-200">Safety Stock %</th>
                       <th className="px-4 py-3 w-40 text-right border-b border-gray-200 bg-green-50/50">Final Purchase Qty</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                    {consolidatedItems.map(item => {
                        const calc = calculateOutput(item);
                        const input = inputs[item.key] || { consumptionLossPct: 0, markerEfficiencyPct: 100, safetyStockPct: 0 };

                        return (
                           <tr key={item.key} className="hover:bg-gray-50 transition-colors group">
                              <td className="px-4 py-4 border-r border-gray-100">
                                 <div className="font-medium text-[#37352F]">{item.materialName}</div>
                                 <div className="text-xs text-gray-500">{item.supplier} • {item.specs}</div>
                              </td>
                              <td className="px-4 py-4 text-right font-mono border-r border-gray-100 bg-yellow-50/10">
                                 {item.baseRequiredQty.toLocaleString(undefined, {maximumFractionDigits: 1})} <span className="text-xs text-gray-400">{item.unit}</span>
                              </td>
                              <td className="px-4 py-4">
                                 <div className="flex items-center gap-1 border rounded px-2 py-1 bg-white focus-within:ring-1 ring-blue-500">
                                    <input 
                                       type="number" 
                                       className="w-full outline-none text-sm text-center"
                                       placeholder="0"
                                       value={input.consumptionLossPct}
                                       onChange={(e) => handleInputChange(item.key, 'consumptionLossPct', e.target.value)}
                                    />
                                    <span className="text-xs text-gray-400">%</span>
                                 </div>
                              </td>
                              <td className="px-4 py-4">
                                 <div className="flex items-center gap-1 border rounded px-2 py-1 bg-white focus-within:ring-1 ring-blue-500">
                                    <input 
                                       type="number" 
                                       className="w-full outline-none text-sm text-center"
                                       placeholder="100"
                                       value={input.markerEfficiencyPct}
                                       onChange={(e) => handleInputChange(item.key, 'markerEfficiencyPct', e.target.value)}
                                    />
                                    <span className="text-xs text-gray-400">%</span>
                                 </div>
                              </td>
                              <td className="px-4 py-4 border-r border-gray-100">
                                 <div className="flex items-center gap-1 border rounded px-2 py-1 bg-white focus-within:ring-1 ring-blue-500">
                                    <input 
                                       type="number" 
                                       className="w-full outline-none text-sm text-center"
                                       placeholder="0"
                                       value={input.safetyStockPct}
                                       onChange={(e) => handleInputChange(item.key, 'safetyStockPct', e.target.value)}
                                    />
                                    <span className="text-xs text-gray-400">%</span>
                                 </div>
                              </td>
                              <td className="px-4 py-4 text-right font-mono font-bold text-green-700 bg-green-50/10">
                                 {Math.ceil(calc.finalQty).toLocaleString()} <span className="text-xs font-normal text-green-600">{item.unit}</span>
                                 <div className="text-[10px] font-normal text-gray-400 mt-1">
                                    +{Math.ceil(calc.variance).toLocaleString()} variance
                                 </div>
                              </td>
                           </tr>
                        );
                    })}
                    {consolidatedItems.length === 0 && (
                        <tr><td colSpan={6} className="p-8 text-center text-gray-400 italic">No fabric items found in linked styles.</td></tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
           <div className="flex items-center gap-2 text-xs text-gray-500">
              <AlertTriangle size={14} className="text-orange-500" />
              <span>Issuing this plan will generate Purchase Requests in the Purchasing Dashboard.</span>
           </div>
           <div className="flex gap-3">
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded transition-colors">Cancel</button>
              <button 
                 onClick={handleIssuePlan}
                 disabled={consolidatedItems.length === 0 || isIssuing}
                 className="px-5 py-2 bg-green-700 text-white text-sm font-medium rounded hover:bg-green-800 shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
              >
                 {isIssuing ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                 Confirm & Issue Plan
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};
