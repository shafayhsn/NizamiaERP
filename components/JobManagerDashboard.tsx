
import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, Plus, AlertTriangle, Layers, Scissors, 
  Shirt, Tag, Package, Box, Calendar, CheckCircle2, 
  Clock, X, ArrowRight, Eye, Edit2, Trash2, Lock, FlaskConical,
  FileText, ShieldAlert, Printer
} from 'lucide-react';
import { Order, JobBatch, PlanStatus, PurchasingRequest, CuttingPlanDetail } from '../types';
import { FabricPlanGenerator } from './FabricPlanGenerator';
import { CuttingPlanGenerator } from './CuttingPlanGenerator';
import { TestingPlanGenerator } from './TestingPlanGenerator';
import { SamplingPlanGenerator } from './SamplingPlanGenerator';
import { TrimsPlanGenerator } from './TrimsPlanGenerator';
import { ProcessPlanGenerator } from './ProcessPlanGenerator';

// --- CONSTANTS ---

const PLAN_TYPES = [
  { key: 'fabric', label: 'Fabric Plan', icon: Layers, accent: 'text-blue-600', hoverBorder: 'hover:border-blue-300' },
  { key: 'cutting', label: 'Cutting Plan', icon: Scissors, accent: 'text-orange-600', hoverBorder: 'hover:border-orange-300' },
  { key: 'trims', label: 'Trims Plan', icon: Tag, accent: 'text-yellow-600', hoverBorder: 'hover:border-yellow-300' },
  { key: 'process', label: 'Process Plan', icon: Shirt, accent: 'text-indigo-600', hoverBorder: 'hover:border-indigo-300' },
  { key: 'sampling', label: 'Sampling Plan', icon: Calendar, accent: 'text-pink-600', hoverBorder: 'hover:border-pink-300' },
  { key: 'finishing', label: 'Finishing Plan', icon: Box, accent: 'text-green-600', hoverBorder: 'hover:border-green-300' },
  { key: 'testing', label: 'Testing Program', icon: FlaskConical, accent: 'text-purple-600', hoverBorder: 'hover:border-purple-300' },
] as const;

// --- SUB-COMPONENTS ---

interface JobCreationModalProps {
  unassignedOrders: Order[];
  onClose: () => void;
  onCreate: (jobId: string, selectedStyleIds: string[]) => void;
}

const JobCreationModal: React.FC<JobCreationModalProps> = ({ unassignedOrders, onClose, onCreate }) => {
  // Generate random JOB ID, ensure it's read-only for user
  const [jobId] = useState(`NZ-${Math.floor(100 + Math.random() * 900)}-${new Date().getFullYear().toString().slice(-2)}`);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleCreate = () => {
    if (!jobId || selectedIds.size === 0) return;
    onCreate(jobId, Array.from(selectedIds));
  };

  const selectedStyles = unassignedOrders.filter(s => selectedIds.has(s.id));
  const totalQty = selectedStyles.reduce((acc, s) => acc + s.quantity, 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-[#37352F]">Create Production Job</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Master Job Number</label>
            <input 
              type="text" 
              value={jobId}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-gray-100 text-gray-500 cursor-not-allowed outline-none font-mono font-medium focus:ring-0"
              placeholder="e.g. JOB-2025-001"
            />
            <p className="text-[10px] text-gray-400">This system-generated ID is the master key for all linked orders.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase flex justify-between">
              <span>Select Available Orders to Group</span>
              <span className="text-indigo-600">{selectedIds.size} selected</span>
            </label>
            <div className="border border-gray-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-2 w-10"></th>
                    <th className="px-4 py-2">Factory Ref</th>
                    <th className="px-4 py-2">Style</th>
                    <th className="px-4 py-2">Buyer</th>
                    <th className="px-4 py-2 text-right">Qty</th>
                    <th className="px-4 py-2">Delivery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {unassignedOrders.map(order => (
                    <tr 
                      key={order.id} 
                      className={`hover:bg-gray-50 cursor-pointer ${selectedIds.has(order.id) ? 'bg-indigo-50' : ''}`}
                      onClick={() => toggleSelection(order.id)}
                    >
                      <td className="px-4 py-2 text-center">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.has(order.id)}
                          readOnly
                          className="rounded text-indigo-600 focus:ring-indigo-500 pointer-events-none"
                        />
                      </td>
                      <td className="px-4 py-2 font-mono text-xs">{order.factoryRef || '-'}</td>
                      <td className="px-4 py-2 font-medium">{order.styleNo}</td>
                      <td className="px-4 py-2 text-gray-600">{order.buyer}</td>
                      <td className="px-4 py-2 text-right font-mono">{order.quantity.toLocaleString()}</td>
                      <td className="px-4 py-2 text-gray-500 text-xs">{order.deliveryDate}</td>
                    </tr>
                  ))}
                  {unassignedOrders.length === 0 && (
                    <tr><td colSpan={6} className="p-4 text-center text-gray-400">No unassigned orders available.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {unassignedOrders.length === 0 && (
               <p className="text-xs text-orange-500 italic">All active purchase orders have been assigned to jobs.</p>
            )}
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
             <div className="text-sm text-gray-600">Total Job Units:</div>
             <div className="text-xl font-bold text-[#37352F]">{totalQty.toLocaleString()} pcs</div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded transition-colors">Cancel</button>
          <button 
            onClick={handleCreate}
            disabled={selectedIds.size === 0 || !jobId}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Confirm & Create Job
          </button>
        </div>
      </div>
    </div>
  );
};

interface JobEditModalProps {
  job: JobBatch;
  candidateOrders: Order[]; // Includes unassigned + current orders
  onClose: () => void;
  onSave: (updatedJob: JobBatch) => void;
}

const JobEditModal: React.FC<JobEditModalProps> = ({ job, candidateOrders, onClose, onSave }) => {
  // Initialize checked state with currently assigned styles
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(job.styles.map(s => s.id)));

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSave = () => {
    const newStyles = candidateOrders.filter(o => selectedIds.has(o.id));
    const newTotalQty = newStyles.reduce((sum, s) => sum + s.quantity, 0);
    
    onSave({
        ...job,
        styles: newStyles,
        totalQty: newTotalQty
    });
  };

  const selectedCount = selectedIds.size;
  const currentJobStyles = candidateOrders.filter(o => selectedIds.has(o.id));
  const totalUnits = currentJobStyles.reduce((acc, o) => acc + o.quantity, 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div>
             <h2 className="text-lg font-bold text-[#37352F]">Edit Job: {job.id}</h2>
             <p className="text-xs text-gray-500">Add or remove orders from this production batch.</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
           <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">Available Orders (Unassigned or In Job)</span>
              <span className="text-xs font-medium text-indigo-600">{selectedCount} selected</span>
           </div>
           
           <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center">Use</th>
                    <th className="px-4 py-3">Job ID</th>
                    <th className="px-4 py-3">Factory Ref</th>
                    <th className="px-4 py-3">Style</th>
                    <th className="px-4 py-3 text-right">Qty</th>
                    <th className="px-4 py-3 w-20 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {candidateOrders.map(order => {
                     const isCurrentlyInThisJob = job.styles.some(s => s.id === order.id);
                     const isSelected = selectedIds.has(order.id);
                     
                     return (
                        <tr 
                           key={order.id} 
                           className={`cursor-pointer hover:bg-gray-50 transition-colors 
                              ${isSelected ? 'bg-indigo-50/50' : ''}`}
                           onClick={() => toggleSelection(order.id)}
                        >
                           <td className="px-4 py-3 text-center">
                              <input 
                                type="checkbox" 
                                checked={isSelected}
                                readOnly
                                className="rounded text-indigo-600 focus:ring-indigo-500 pointer-events-none"
                              />
                           </td>
                           <td className="px-4 py-3 font-mono text-xs text-gray-600">{order.orderID}</td>
                           <td className="px-4 py-3 font-medium text-[#37352F]">{order.factoryRef || '-'}</td>
                           <td className="px-4 py-3 text-gray-600">{order.styleNo}</td>
                           <td className="px-4 py-3 text-right font-mono">{order.quantity.toLocaleString()}</td>
                           <td className="px-4 py-3 text-center">
                              {isCurrentlyInThisJob ? (
                                 <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                                    LINKED
                                 </span>
                              ) : (
                                 <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
                                    AVAIL
                                 </span>
                              )}
                           </td>
                        </tr>
                     );
                  })}
                  {candidateOrders.length === 0 && (
                     <tr><td colSpan={6} className="p-6 text-center text-gray-400">No eligible orders found.</td></tr>
                  )}
                </tbody>
              </table>
           </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="text-sm">
             Total Units: <span className="font-bold text-[#37352F]">{totalUnits.toLocaleString()}</span>
          </div>
          <div className="flex gap-3">
             <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded transition-colors">Cancel</button>
             <button 
               onClick={handleSave}
               className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 shadow-sm transition-colors"
             >
               Save Changes
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface JobPlanStatusViewProps {
  job: JobBatch;
  onClose: () => void;
  onOpenPlan: (planType: keyof JobBatch['plans']) => void;
  onDeletePlan: (planType: keyof JobBatch['plans']) => void;
}

const JobPlanStatusView: React.FC<JobPlanStatusViewProps> = ({ job, onClose, onOpenPlan, onDeletePlan }) => {
  const [deletePlanKey, setDeletePlanKey] = useState<keyof JobBatch['plans'] | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const activePlans = PLAN_TYPES.filter(type => job.plans[type.key] !== 'Pending Creation');

  const getStatusColor = (status: PlanStatus) => {
    switch (status) {
      case 'Approved': return 'bg-green-50 text-green-700 border-green-200';
      case 'Drafting': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'In Progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-500 border-gray-200';
    }
  };

  const getPlanDetails = (type: keyof JobBatch['plans']) => {
      switch(type) {
          case 'fabric': return `${(job.purchasingRequests || []).filter(r => !job.styles.some(s=>s.bom?.some(b=>['Fabric'].includes(b.processGroup))) ? true : ['Fabric'].includes('Fabric')).length} Requests`; // Simplified metric
          case 'trims': return `Trims Ordered`;
          case 'cutting': return `${(job.cuttingPlanDetails || []).length} Fabrics Planned`;
          case 'process': return `Routing Active`;
          case 'testing': return `Lab Program Active`;
          case 'sampling': return `Samples Issued to Floor`;
          default: return 'Plan Active';
      }
  };

  const handlePrintPlan = (planType: keyof JobBatch['plans']) => {
      const title = PLAN_TYPES.find(p => p.key === planType)?.label || 'Plan';
      const printWindow = window.open('', '_blank', 'width=900,height=800');
      if (!printWindow) return;

      let content = '<p class="text-gray-500 italic">No specific data available for print.</p>';

      if (planType === 'cutting' && job.cuttingPlanDetails) {
          content = `
            <table class="w-full text-sm border-collapse border">
                <thead>
                    <tr class="bg-gray-100 text-xs uppercase">
                        <th class="border p-2">Material</th>
                        <th class="border p-2 text-center">Efficiency</th>
                        <th class="border p-2 text-center">Allowance</th>
                        <th class="border p-2">Schedule</th>
                        <th class="border p-2 text-right">Daily Target</th>
                    </tr>
                </thead>
                <tbody>
                    ${job.cuttingPlanDetails.map(d => `
                        <tr>
                            <td class="border p-2 font-medium">${d.materialName}</td>
                            <td class="border p-2 text-center">-</td>
                            <td class="border p-2 text-center">${d.extraCuttingPct}%</td>
                            <td class="border p-2">${d.startDate} to ${d.finishDate}</td>
                            <td class="border p-2 text-right font-mono">${d.dailyTarget}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
          `;
      } else if ((planType === 'fabric' || planType === 'trims') && job.purchasingRequests) {
          content = `
            <table class="w-full text-sm border-collapse border">
                <thead>
                    <tr class="bg-gray-100 text-xs uppercase">
                        <th class="border p-2">Item Name</th>
                        <th class="border p-2">Specs</th>
                        <th class="border p-2">Supplier</th>
                        <th class="border p-2 text-right">Qty</th>
                        <th class="border p-2 text-center">Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${job.purchasingRequests.map(r => `
                        <tr>
                            <td class="border p-2 font-medium">${r.materialName}</td>
                            <td class="border p-2 text-xs text-gray-500">${r.specs || '-'}</td>
                            <td class="border p-2 text-blue-600">${r.supplier}</td>
                            <td class="border p-2 text-right font-mono">${r.qty} ${r.unit}</td>
                            <td class="border p-2 text-center text-xs uppercase">${r.status}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
          `;
      } else if (planType === 'process' && job.stageSchedules) {
          content = `
            <table class="w-full text-sm border-collapse border">
                <thead>
                    <tr class="bg-gray-100 text-xs uppercase">
                        <th class="border p-2">Stage</th>
                        <th class="border p-2">Start Date</th>
                        <th class="border p-2">End Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(job.stageSchedules).map(([stage, dates]) => `
                        <tr>
                            <td class="border p-2 font-medium">${stage}</td>
                            <td class="border p-2">${(dates as any).startDate}</td>
                            <td class="border p-2">${(dates as any).endDate}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
          `;
      } else if (planType === 'sampling') {
           const samples = job.styles.map(s => (s.samplingDetails || []).map(sd => ({...sd, styleNo: s.styleNo}))).flat();
           content = `
            <table class="w-full text-sm border-collapse border">
                <thead>
                    <tr class="bg-gray-100 text-xs uppercase">
                        <th class="border p-2">Style</th>
                        <th class="border p-2">Type</th>
                        <th class="border p-2">Fabric / Details</th>
                        <th class="border p-2 text-center">Qty</th>
                        <th class="border p-2 text-right">Deadline</th>
                    </tr>
                </thead>
                <tbody>
                    ${samples.map(sam => `
                        <tr>
                            <td class="border p-2 font-medium">${sam.styleNo}</td>
                            <td class="border p-2">${sam.type}</td>
                            <td class="border p-2 text-xs">${sam.fabric} | ${sam.shade}</td>
                            <td class="border p-2 text-center">${sam.quantity}</td>
                            <td class="border p-2 text-right">${sam.deadline}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
           `;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                @media print {
                    .no-print { display: none; }
                }
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 2rem; font-family: sans-serif; }
            </style>
        </head>
        <body class="bg-white text-gray-900">
            <div class="mb-8 border-b-2 border-gray-800 pb-4">
                <div class="flex justify-between items-end">
                    <div>
                        <h1 class="text-3xl font-bold uppercase tracking-tight">${title}</h1>
                        <p class="text-sm text-gray-500 mt-1">Job Batch: <span class="font-mono font-bold text-black">${job.id}</span></p>
                    </div>
                    <div class="text-right text-xs">
                        <p>Printed: ${new Date().toLocaleString()}</p>
                        <p>Nizamia ERP</p>
                    </div>
                </div>
            </div>
            
            <div class="mb-8">
               ${content}
            </div>

            <div class="border-t border-gray-300 pt-4 mt-12 flex justify-between items-end text-xs text-gray-400">
                <div>
                    <p class="font-bold text-black uppercase mb-8">Prepared By</p>
                    <div class="w-48 border-b border-black"></div>
                </div>
                <div>
                    <p class="font-bold text-black uppercase mb-8">Approved By</p>
                    <div class="w-48 border-b border-black"></div>
                </div>
            </div>
            
            <script>
                setTimeout(() => { window.print(); }, 600);
            </script>
        </body>
        </html>
      `);
      printWindow.document.close();
  };

  const handleDelete = () => {
      if (deletePassword === 'admin' && deletePlanKey) {
          onDeletePlan(deletePlanKey);
          setDeletePlanKey(null);
          setDeletePassword('');
          setDeleteError('');
      } else {
          setDeleteError('Incorrect password');
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gray-50 w-full max-w-5xl h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-gray-200 flex justify-between items-start shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#37352F]">{job.batchName}</h2>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-medium border border-gray-200">
                {job.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Job ID: <span className="font-mono">{job.id}</span> • Total Styles: {job.styles.length} • Total Qty: {job.totalQty.toLocaleString()}
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-8">
          
          {/* Section 1: Planning Tools (Buttons) */}
          <div className="space-y-3">
             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                <Plus size={14} /> Available Planning Tools
             </h3>
             <div className="flex flex-wrap gap-3">
                {PLAN_TYPES.map((type) => {
                   const isCreated = job.plans[type.key] !== 'Pending Creation';
                   return (
                      <button
                         key={type.key}
                         onClick={() => onOpenPlan(type.key as any)}
                         className={`group flex items-center gap-3 px-4 py-3 rounded-lg border shadow-sm transition-all bg-white
                            ${isCreated 
                               ? 'border-gray-200 text-gray-400 hover:border-gray-300' 
                               : `border-gray-200 text-gray-600 ${type.hoverBorder} hover:shadow-md`}`}
                      >
                         <div className={`transition-colors ${isCreated ? 'text-gray-400' : type.accent}`}>
                            <type.icon size={18} />
                         </div>
                         <span className={`text-sm font-semibold ${isCreated ? '' : 'group-hover:text-gray-900'}`}>{type.label}</span>
                         {isCreated && <CheckCircle2 size={14} className="ml-1 text-green-500" />}
                      </button>
                   );
                })}
             </div>
          </div>

          {/* Section 2: Active Plans Table */}
          <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
             <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <FileText size={18} className="text-gray-400" />
                <h3 className="text-sm font-bold text-gray-700">Active Plan Registry</h3>
             </div>
             <div className="overflow-auto flex-1">
                <table className="w-full text-left text-sm border-collapse">
                   <thead className="bg-white text-xs text-gray-500 uppercase font-semibold border-b border-gray-100">
                      <tr>
                         <th className="px-6 py-3">Document / Plan</th>
                         <th className="px-6 py-3">Status</th>
                         <th className="px-6 py-3">Last Updated</th>
                         <th className="px-6 py-3">Details</th>
                         <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {activePlans.map(type => (
                         <tr key={type.key} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-800 flex items-center gap-3">
                               <div className={`p-2 rounded-lg bg-gray-50 ${type.accent}`}>
                                  <type.icon size={18} />
                               </div>
                               {type.label}
                            </td>
                            <td className="px-6 py-4">
                               <span className={`px-2 py-1 rounded text-xs font-bold border uppercase ${getStatusColor(job.plans[type.key])}`}>
                                  {job.plans[type.key]}
                               </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-gray-500">
                               Today
                            </td>
                            <td className="px-6 py-4 text-xs text-gray-600">
                               {getPlanDetails(type.key)}
                            </td>
                            <td className="px-6 py-4 text-right">
                               <div className="flex items-center justify-end gap-2">
                                  <button 
                                     onClick={() => handlePrintPlan(type.key as any)}
                                     className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                     title="Print Plan"
                                  >
                                     <Printer size={16} />
                                  </button>
                                  <button 
                                     onClick={() => onOpenPlan(type.key)}
                                     className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                     title="Edit Plan"
                                  >
                                     <Edit2 size={16} />
                                  </button>
                                  <button 
                                     onClick={() => setDeletePlanKey(type.key)}
                                     className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                     title="Delete Plan"
                                  >
                                     <Trash2 size={16} />
                                  </button>
                               </div>
                            </td>
                         </tr>
                      ))}
                      {activePlans.length === 0 && (
                         <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-400 italic">
                               No active plans. Select a tool above to start planning.
                            </td>
                         </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>

        </div>

        {/* Delete Modal Overlay */}
        {deletePlanKey && (
           <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 space-y-4 animate-in zoom-in-95">
                 <div className="flex items-center gap-2 text-red-600">
                    <ShieldAlert size={20} />
                    <h3 className="text-lg font-bold">Confirm Deletion</h3>
                 </div>
                 <p className="text-sm text-gray-600">
                    Are you sure you want to delete the <strong>{PLAN_TYPES.find(p=>p.key===deletePlanKey)?.label}</strong>?
                    <br/>This will clear all generated data for this plan.
                 </p>
                 <input 
                    type="password"
                    autoFocus
                    placeholder="Admin Password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleDelete()}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-red-500"
                 />
                 {deleteError && <p className="text-xs text-red-500 font-medium">{deleteError}</p>}
                 <div className="flex justify-end gap-2 pt-2">
                    <button 
                       onClick={() => setDeletePlanKey(null)}
                       className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
                    >
                       Cancel
                    </button>
                    <button 
                       onClick={handleDelete}
                       className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                       Delete Plan
                    </button>
                 </div>
              </div>
           </div>
        )}

      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

interface JobManagerDashboardProps {
  availableOrders: Order[];
  jobs: JobBatch[]; // Added
  onUpdateJobs: (jobs: JobBatch[]) => void; // Added
}

export const JobManagerDashboard: React.FC<JobManagerDashboardProps> = ({ availableOrders, jobs, onUpdateJobs }) => {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activePlanType, setActivePlanType] = useState<keyof JobBatch['plans'] | null>(null);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  // Delete Logic State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [jobToDeleteId, setJobToDeleteId] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Derive "Unassigned Styles" from passed orders
  // Logic: An order is unassigned if it's not present in any active Job's style list
  const unassignedOrders = availableOrders.filter(order => {
     const isAssigned = jobs.some(job => job.styles.some(style => style.id === order.id));
     return !isAssigned && order.status !== 'Cancelled';
  });

  // Handlers
  const handleCreateBatch = (jobId: string, selectedStyleIds: string[]) => {
    const ordersToMove = availableOrders.filter(o => selectedStyleIds.includes(o.id));
    const newBatch: JobBatch = {
      id: jobId,
      batchName: jobId, // Name is same as ID by default
      styles: ordersToMove, // Stores FULL Order objects
      totalQty: ordersToMove.reduce((sum, s) => sum + s.quantity, 0),
      status: 'Planning',
      exFactoryDate: ordersToMove[0]?.deliveryDate || '',
      plans: {
        fabric: 'Pending Creation',
        cutting: 'Pending Creation',
        trims: 'Pending Creation',
        process: 'Pending Creation',
        finishing: 'Pending Creation',
        sampling: 'Pending Creation',
        testing: 'Pending Creation' // New
      },
      purchasingRequests: [],
      dailyLogs: [] // Initialize daily logs
    };

    onUpdateJobs([...jobs, newBatch]);
    setIsCreateModalOpen(false);
  };

  const handleUpdateJobStyles = (updatedJob: JobBatch) => {
      onUpdateJobs(jobs.map(j => j.id === updatedJob.id ? updatedJob : j));
      setEditingJobId(null);
  };

  const handleDeleteJob = () => {
      if (deletePassword === 'admin') {
          const updatedJobs = jobs.filter(j => j.id !== jobToDeleteId);
          onUpdateJobs(updatedJobs);
          // Reset state
          setIsDeleteModalOpen(false);
          setJobToDeleteId(null);
          setDeletePassword('');
          setDeleteError('');
      } else {
          setDeleteError('Incorrect password. Try "admin"');
      }
  };

  const handleOpenPlan = (planType: keyof JobBatch['plans']) => {
    // Explicitly handle all plan types now
    setActivePlanType(planType);
  };

  const handleDeletePlan = (planType: keyof JobBatch['plans']) => {
      if (!selectedJobId) return;
      
      const updatedJobs = jobs.map(job => {
          if (job.id !== selectedJobId) return job;
          
          const newJob = { ...job };
          // 1. Reset Status
          newJob.plans = { ...newJob.plans, [planType]: 'Pending Creation' };
          
          // 2. Clear Data where safe
          if (planType === 'cutting') {
             newJob.cuttingPlanDetails = [];
          }
          // For fabric/trims, we don't clear purchasingRequests to avoid accidental deletion of shared data
          // without a discriminator.
          
          return newJob;
      });

      onUpdateJobs(updatedJobs);
  };

  // Callback from FabricPlanGenerator
  const handleFabricPlanIssue = (purchasingData: PurchasingRequest[]) => {
      if (!selectedJobId) return;
      
      const updatedJobs = jobs.map(job => {
          if (job.id !== selectedJobId) return job;

          // Filter out duplicates based on material name
          const existingMaterials = new Set((job.purchasingRequests || []).map(r => r.materialName));
          const uniqueNewRequests = purchasingData.filter(req => !existingMaterials.has(req.materialName));

          return {
              ...job,
              plans: { ...job.plans, fabric: 'Approved' as PlanStatus },
              purchasingRequests: [...(job.purchasingRequests || []), ...uniqueNewRequests]
          };
      });
      
      onUpdateJobs(updatedJobs);
      setActivePlanType(null);
  };

  // Callback from TrimsPlanGenerator (Append to purchasingRequests)
  const handleTrimsPlanIssue = (purchasingData: PurchasingRequest[]) => {
      if (!selectedJobId) return;
      
      const updatedJobs = jobs.map(job => {
          if (job.id !== selectedJobId) return job;

          const existingMaterials = new Set((job.purchasingRequests || []).map(r => r.materialName));
          const uniqueNewRequests = purchasingData.filter(req => !existingMaterials.has(req.materialName));

          return {
              ...job,
              plans: { ...job.plans, trims: 'Approved' as PlanStatus },
              purchasingRequests: [...(job.purchasingRequests || []), ...uniqueNewRequests]
          };
      });
      
      onUpdateJobs(updatedJobs);
      setActivePlanType(null);
  };

  // Callback from CuttingPlanGenerator
  const handleCuttingPlanIssue = (details: CuttingPlanDetail[]) => {
      if (!selectedJobId) return;

      const updatedJobs = jobs.map(job => {
          if (job.id !== selectedJobId) return job;
          return {
              ...job,
              plans: { ...job.plans, cutting: 'Approved' as PlanStatus },
              cuttingPlanDetails: details
          };
      });

      onUpdateJobs(updatedJobs);
      setActivePlanType(null);
  };

  // Callback from ProcessPlanGenerator
  const handleProcessPlanIssue = (schedules: Record<string, { startDate: string; endDate: string }>) => {
      if (!selectedJobId) return;
      
      const updatedJobs = jobs.map(job => {
          if (job.id !== selectedJobId) return job;
          return {
              ...job,
              plans: { ...job.plans, process: 'Approved' as PlanStatus },
              stageSchedules: schedules
          };
      });

      onUpdateJobs(updatedJobs);
      setActivePlanType(null);
  };

  // Callback from TestingPlanGenerator
  const handleTestingPlanIssue = () => {
      if (!selectedJobId) return;
      const updatedJobs = jobs.map(job => {
          if (job.id !== selectedJobId) return job;
          return {
              ...job,
              plans: { ...job.plans, testing: 'Approved' as PlanStatus }
          };
      });
      onUpdateJobs(updatedJobs);
      setActivePlanType(null);
  };

  // Callback from SamplingPlanGenerator
  const handleSamplingPlanIssue = (updatedJob: JobBatch) => {
      onUpdateJobs(jobs.map(j => j.id === updatedJob.id ? updatedJob : j));
      setActivePlanType(null);
  };

  const selectedJob = jobs.find(j => j.id === selectedJobId);
  const editingJob = jobs.find(j => j.id === editingJobId);

  return (
    <div className="flex flex-col h-full space-y-6 pb-10">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-[#37352F]">Job Management Hub</h1>
          <p className="text-sm text-gray-500">Group active orders into production jobs and track execution plans.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium"
        >
          <Plus size={16} /> Create / Link New Job
        </button>
      </div>

      {/* Unassigned Styles Alert */}
      {unassignedOrders.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center justify-between animate-in slide-in-from-top-2">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-full">
                <AlertTriangle size={20} />
              </div>
              <div>
                 <h3 className="text-sm font-bold text-orange-800">Action Required: {unassignedOrders.length} Unassigned Orders</h3>
                 <p className="text-xs text-orange-600">These orders have been approved but are not yet linked to a Production Job.</p>
              </div>
           </div>
           <button 
             onClick={() => setIsCreateModalOpen(true)}
             className="text-xs font-medium bg-white border border-orange-200 text-orange-700 px-3 py-1.5 rounded hover:bg-orange-100 transition-colors"
           >
             Assign to Job
           </button>
        </div>
      )}

      {/* Active Jobs Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
          <ClipboardList size={18} className="text-gray-400" />
          <h2 className="text-lg font-medium text-[#37352F]">Active Production Jobs</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F7F7F5] text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-3">Job Number</th>
                <th className="px-6 py-3">Styles Linked</th>
                <th className="px-6 py-3 text-right">Total Units</th>
                <th className="px-6 py-3">Ex-Factory</th>
                <th className="px-6 py-3">Planning Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {jobs.map(job => {
                // Calculate completion of plans (Approved count)
                const planValues = Object.values(job.plans);
                const approvedCount = planValues.filter(s => s === 'Approved').length;
                const progressPct = (approvedCount / planValues.length) * 100;

                return (
                  <tr key={job.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-[#37352F]">{job.id}</div>
                        <div className="text-xs text-gray-500">Master Job Key</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2">
                         {job.styles.slice(0, 3).map((s, i) => (
                           <span key={i} className="w-6 h-6 rounded-full bg-gray-200 border border-white flex items-center justify-center text-[10px] text-gray-600 font-bold" title={s.styleNo}>
                             {(s.styleNo || '?').charAt(0)}
                           </span>
                         ))}
                         {job.styles.length > 3 && (
                           <span className="w-6 h-6 rounded-full bg-gray-100 border border-white flex items-center justify-center text-[8px] text-gray-500">
                             +{job.styles.length - 3}
                           </span>
                         )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{job.styles.length} styles</div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-medium">
                      {job.totalQty.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {job.exFactoryDate}
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-col gap-1 w-32">
                          <div className="flex justify-between text-[10px] text-gray-500 uppercase font-bold">
                            <span>Readiness</span>
                            <span>{Math.round(progressPct)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                             <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progressPct}%` }}></div>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setEditingJobId(job.id)}
                            className="text-gray-400 hover:text-indigo-600 p-1.5 rounded transition-colors"
                            title="Edit Styles in Job"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => setSelectedJobId(job.id)}
                            className="text-xs font-medium bg-white border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 px-3 py-1.5 rounded shadow-sm transition-all flex items-center gap-1"
                          >
                            Manage Plans <ArrowRight size={12} />
                          </button>
                          <button 
                            onClick={() => {
                                setJobToDeleteId(job.id);
                                setIsDeleteModalOpen(true);
                                setDeletePassword('');
                                setDeleteError('');
                            }}
                            className="text-gray-300 hover:text-red-500 p-1.5 rounded transition-colors ml-1"
                            title="Delete Job"
                          >
                            <Trash2 size={16} />
                          </button>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {jobs.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              No active jobs. Create a job batch to get started.
            </div>
          )}
        </div>
      </div>

      {/* --- MODALS --- */}
      
      {isCreateModalOpen && (
        <JobCreationModal 
          unassignedOrders={unassignedOrders}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateBatch}
        />
      )}

      {editingJob && (
         <JobEditModal 
            job={editingJob}
            // Pass both currently unassigned orders AND orders already in this job
            candidateOrders={[...editingJob.styles, ...unassignedOrders]}
            onClose={() => setEditingJobId(null)}
            onSave={handleUpdateJobStyles}
         />
      )}

      {selectedJob && !activePlanType && (
        <JobPlanStatusView 
          job={selectedJob}
          onClose={() => setSelectedJobId(null)}
          onOpenPlan={handleOpenPlan}
          onDeletePlan={handleDeletePlan}
        />
      )}

      {/* FABRIC PLAN MODAL */}
      {selectedJob && activePlanType === 'fabric' && (
          <FabricPlanGenerator 
             job={selectedJob} 
             onClose={() => setActivePlanType(null)}
             onIssue={handleFabricPlanIssue}
          />
      )}

      {/* CUTTING PLAN MODAL */}
      {selectedJob && activePlanType === 'cutting' && (
          <CuttingPlanGenerator 
             job={selectedJob}
             onClose={() => setActivePlanType(null)}
             onIssue={handleCuttingPlanIssue}
          />
      )}

      {/* TRIMS PLAN MODAL */}
      {selectedJob && activePlanType === 'trims' && (
          <TrimsPlanGenerator 
             job={selectedJob}
             onClose={() => setActivePlanType(null)}
             onIssue={handleTrimsPlanIssue}
          />
      )}

      {/* PROCESS PLAN MODAL */}
      {selectedJob && activePlanType === 'process' && (
          <ProcessPlanGenerator 
             job={selectedJob}
             onClose={() => setActivePlanType(null)}
             onIssue={handleProcessPlanIssue}
          />
      )}

      {/* TESTING PLAN MODAL */}
      {selectedJob && activePlanType === 'testing' && (
          <TestingPlanGenerator
             job={selectedJob}
             onClose={() => setActivePlanType(null)}
             onIssue={handleTestingPlanIssue}
          />
      )}

      {/* SAMPLING PLAN MODAL */}
      {selectedJob && activePlanType === 'sampling' && (
          <SamplingPlanGenerator
             job={selectedJob}
             onClose={() => setActivePlanType(null)}
             onIssue={handleSamplingPlanIssue}
          />
      )}

      {/* Delete Job Modal */}
      {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 space-y-4">
                 <div className="flex items-center gap-2 text-red-600">
                    <Lock size={20} />
                    <h3 className="text-lg font-bold">Secure Job Deletion</h3>
                 </div>
                 <p className="text-sm text-gray-600">
                    You are about to delete Job <strong>{jobToDeleteId}</strong>.
                    <br/><br/>
                    This will <strong>unassign</strong> all linked styles and <strong>cancel</strong> any generated purchasing demand.
                 </p>
                 <div className="space-y-1">
                     <input 
                        type="password"
                        autoFocus
                        placeholder="Admin Password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleDeleteJob()}
                     />
                     {deleteError && <p className="text-xs text-red-500 font-medium">{deleteError}</p>}
                 </div>
                 <div className="flex justify-end gap-2 pt-2">
                    <button 
                       onClick={() => setIsDeleteModalOpen(false)}
                       className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
                    >
                       Cancel
                    </button>
                    <button 
                       onClick={handleDeleteJob}
                       className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                       Confirm Delete
                    </button>
                 </div>
             </div>
          </div>
      )}

    </div>
  );
};
