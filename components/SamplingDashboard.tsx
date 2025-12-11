
import React, { useMemo, useState } from 'react';
import { 
  AlertTriangle, Layers, 
  Clock, CheckCircle2, ChevronRight, X, Ruler, Palette, Shirt,
  Plus, Beaker, FileText, Calendar, Trash2, Edit2, LayoutGrid
} from 'lucide-react';
import { Order, SampleRow, JobBatch, DevelopmentSample } from '../types';

// --- Types ---

// Combined type for the dashboard list that includes context from the parent order
interface ExtendedSampleRow extends SampleRow {
  jobId: string;
  buyer: string;
  styleNo: string;
  originalOrder: Order;
  jobInstance: JobBatch; // Reference to the parent job for updates
}

interface SamplingDashboardProps {
  orders?: Order[];
  jobs?: JobBatch[];
  onUpdateOrder?: (order: Order) => void;
  onUpdateJob?: (job: JobBatch) => void; 
  // Development Sampling Props
  developmentSamples?: DevelopmentSample[];
  onAddDevSample?: (sample: DevelopmentSample) => void;
  onUpdateDevSample?: (sample: DevelopmentSample) => void;
  onDeleteDevSample?: (id: string) => void;
}

// --- SUB-COMPONENT: Development Sample Modal ---
const DevelopmentSampleModal = ({
    isOpen,
    onClose,
    onSave,
    sampleToEdit
}: {
    isOpen: boolean,
    onClose: () => void,
    onSave: (sample: DevelopmentSample) => void,
    sampleToEdit: DevelopmentSample | null
}) => {
    const [formData, setFormData] = useState<Partial<DevelopmentSample>>(() => {
        if (sampleToEdit) return sampleToEdit;
        const year = new Date().getFullYear().toString().slice(-2);
        const random = Math.floor(100 + Math.random() * 900);
        return {
            samNumber: `NDS-${random}-${year}`, // New NDS format
            status: 'Pending',
            isTestingRequired: false,
            quantity: '1',
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
    });

    if (!isOpen) return null;

    const handleSave = () => {
        if (!formData.buyer || !formData.styleNo || !formData.type) {
            alert("Please fill required fields: Buyer, Style No, and Sample Type.");
            return;
        }
        
        const sample: DevelopmentSample = {
            id: sampleToEdit?.id || `dev-${Date.now()}`,
            samNumber: formData.samNumber || '',
            buyer: formData.buyer,
            styleNo: formData.styleNo,
            type: formData.type,
            fabric: formData.fabric || '',
            shade: formData.shade || '',
            wash: formData.wash || '',
            baseSize: formData.baseSize || '',
            threadColor: formData.threadColor || '',
            zipperColor: formData.zipperColor || '',
            lining: formData.lining || '',
            quantity: formData.quantity || '1',
            deadline: formData.deadline || '',
            status: formData.status as any,
            isTestingRequired: formData.isTestingRequired,
            season: formData.season,
            notes: formData.notes
        };
        onSave(sample);
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-[#37352F]">
                            {sampleToEdit ? 'Edit Development Sample' : 'New Development Sample'}
                        </h2>
                        <p className="text-xs text-gray-500">Standalone sampling request (Not linked to Orders)</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full"><X size={20}/></button>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Section 1: General Info */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wide flex items-center gap-2">
                            <FileText size={14} /> General Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Sample ID (Auto)</label>
                                <input disabled value={formData.samNumber} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded text-sm text-gray-600" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Buyer *</label>
                                <input 
                                    value={formData.buyer || ''} 
                                    onChange={e => setFormData({...formData, buyer: e.target.value})} 
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-purple-500 outline-none" 
                                    placeholder="e.g. Future Client"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Style Number *</label>
                                <input 
                                    value={formData.styleNo || ''} 
                                    onChange={e => setFormData({...formData, styleNo: e.target.value})} 
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-purple-500 outline-none" 
                                    placeholder="e.g. DEV-2025-01"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Season</label>
                                <input 
                                    value={formData.season || ''} 
                                    onChange={e => setFormData({...formData, season: e.target.value})} 
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-purple-500 outline-none" 
                                    placeholder="e.g. SS25"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Specs */}
                    <div className="space-y-3 pt-2 border-t border-gray-100">
                        <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wide flex items-center gap-2">
                            <Ruler size={14} /> Sample Specifications
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Sample Type *</label>
                                <input 
                                    list="sample-types"
                                    value={formData.type || ''} 
                                    onChange={e => setFormData({...formData, type: e.target.value})} 
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-purple-500 outline-none" 
                                    placeholder="Select or Type..."
                                />
                                <datalist id="sample-types">
                                    <option value="Proto Sample"/>
                                    <option value="Salesman Sample"/>
                                    <option value="Fit Sample"/>
                                    <option value="Showroom Sample"/>
                                </datalist>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Quantity</label>
                                <input 
                                    type="number"
                                    value={formData.quantity || ''} 
                                    onChange={e => setFormData({...formData, quantity: e.target.value})} 
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-purple-500 outline-none" 
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Deadline</label>
                                <input 
                                    type="date"
                                    value={formData.deadline || ''} 
                                    onChange={e => setFormData({...formData, deadline: e.target.value})} 
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-purple-500 outline-none" 
                                />
                            </div>
                            
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Fabric</label>
                                <input 
                                    value={formData.fabric || ''} 
                                    onChange={e => setFormData({...formData, fabric: e.target.value})} 
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-purple-500 outline-none" 
                                    placeholder="Fabric details..."
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Color/Shade</label>
                                <input 
                                    value={formData.shade || ''} 
                                    onChange={e => setFormData({...formData, shade: e.target.value})} 
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-purple-500 outline-none" 
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Wash</label>
                                <input 
                                    value={formData.wash || ''} 
                                    onChange={e => setFormData({...formData, wash: e.target.value})} 
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-purple-500 outline-none" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Notes */}
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                        <label className="text-xs font-bold text-gray-500 uppercase">Development Notes</label>
                        <textarea 
                            rows={3}
                            value={formData.notes || ''}
                            onChange={e => setFormData({...formData, notes: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-purple-500 outline-none resize-none"
                            placeholder="Specific instructions for the sample room..."
                        />
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                    <button onClick={handleSave} className="px-6 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 shadow-sm font-medium">Save Sample</button>
                </div>
            </div>
        </div>
    );
};

export const SamplingDashboard: React.FC<SamplingDashboardProps> = ({ 
    orders = [], 
    jobs = [], 
    onUpdateJob,
    developmentSamples = [],
    onAddDevSample,
    onUpdateDevSample,
    onDeleteDevSample
}) => {
  const [activeView, setActiveView] = useState<'Summary' | 'Job' | 'Development'>('Summary');
  const [selectedSample, setSelectedSample] = useState<ExtendedSampleRow | null>(null);
  
  // Dev Sample State
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);
  const [editingDevSample, setEditingDevSample] = useState<DevelopmentSample | null>(null);

  // --- Data Logic (Job Sampling) ---
  const allJobSamples: ExtendedSampleRow[] = useMemo(() => {
    const validSamples: ExtendedSampleRow[] = [];
    const jobsWithPlan = jobs.filter(j => j.plans.sampling === 'Approved');

    jobsWithPlan.forEach(job => {
        job.styles.forEach(style => {
            if (style.samplingDetails && style.samplingDetails.length > 0) {
                style.samplingDetails.forEach(s => {
                    validSamples.push({
                        ...s,
                        jobId: job.id,
                        buyer: style.buyer,
                        styleNo: style.styleNo,
                        originalOrder: style,
                        jobInstance: job
                    });
                });
            }
        });
    });

    return validSamples.sort((a, b) => {
        if (a.status === 'In Progress' && b.status !== 'In Progress') return -1;
        if (a.status !== 'In Progress' && b.status === 'In Progress') return 1;
        if (a.deadline && b.deadline) return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        return 0;
    });
  }, [jobs]);

  // --- Data Logic (Summary View) ---
  const summaryData = useMemo(() => {
      const combined = [
          ...allJobSamples.map(s => ({
              id: s.id,
              source: 'Job' as const,
              ref: s.jobId,
              samId: s.samNumber,
              buyer: s.buyer,
              style: s.styleNo,
              type: s.type,
              deadline: s.deadline,
              status: s.status,
              originalData: s
          })),
          ...developmentSamples.map(s => ({
              id: s.id,
              source: 'Development' as const,
              ref: 'R&D',
              samId: s.samNumber,
              buyer: s.buyer,
              style: s.styleNo,
              type: s.type,
              deadline: s.deadline,
              status: s.status,
              originalData: s
          }))
      ];

      return combined.sort((a, b) => {
          // Priority: In Progress -> Pending -> Others
          const scoreA = a.status === 'In Progress' ? 2 : a.status === 'Pending' ? 1 : 0;
          const scoreB = b.status === 'In Progress' ? 2 : b.status === 'Pending' ? 1 : 0;
          if (scoreA !== scoreB) return scoreB - scoreA;
          
          // Then by Deadline
          if (a.deadline && b.deadline) return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          return 0;
      });
  }, [allJobSamples, developmentSamples]);

  // Handle Status Update (Job Sampling)
  const handleStatusChange = (sample: ExtendedSampleRow, newStatus: string) => {
    if (!onUpdateJob) return;
    const job = sample.jobInstance;
    const updatedStyles = job.styles.map(style => {
        if (style.id !== sample.originalOrder.id) return style;
        const updatedSamplingDetails = style.samplingDetails?.map(row => 
            row.id === sample.id ? { ...row, status: newStatus as any } : row
        );
        return { ...style, samplingDetails: updatedSamplingDetails };
    });
    const updatedJob: JobBatch = { ...job, styles: updatedStyles };
    onUpdateJob(updatedJob);
    if (selectedSample && selectedSample.id === sample.id) {
        setSelectedSample({ ...selectedSample, status: newStatus as any });
    }
  };

  // --- KPI Calculations ---
  const activeJobCount = allJobSamples.filter(s => s.status === 'In Progress').length;
  const activeDevCount = developmentSamples.filter(s => s.status === 'Pending' || s.status === 'In Progress').length;

  return (
    <div className="flex flex-col h-full space-y-6 relative">
      
      {/* Header & Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold text-[#37352F]">Sample Room</h1>
          {/* Compact Stats Strip */}
          <div className="flex items-center gap-4 text-sm">
             <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-blue-700 font-medium">
                <Layers size={14} />
                <span>Active Job Sampling: <strong>{activeJobCount}</strong></span>
             </div>
             <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 border border-purple-100 rounded-full text-purple-700 font-medium">
                <Beaker size={14} />
                <span>Active R&D Sampling: <strong>{activeDevCount}</strong></span>
             </div>
          </div>
        </div>
        
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button 
                onClick={() => setActiveView('Summary')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2
                    ${activeView === 'Summary' ? 'bg-white text-[#37352F] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <LayoutGrid size={16} /> Summary
            </button>
            <button 
                onClick={() => setActiveView('Job')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2
                    ${activeView === 'Job' ? 'bg-white text-[#37352F] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <Layers size={16} /> Job Sampling
            </button>
            <button 
                onClick={() => setActiveView('Development')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2
                    ${activeView === 'Development' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <Beaker size={16} /> Development Sampling
            </button>
        </div>
      </div>

      {activeView === 'Summary' && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="overflow-x-auto custom-scrollbar flex-1">
                <table className="w-full text-left text-sm border-collapse min-w-[1000px]">
                   <thead className="bg-[#F7F7F5] text-xs uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-200 sticky top-0 z-10">
                      <tr>
                         <th className="px-6 py-4 w-32">Source</th>
                         <th className="px-6 py-4">Sample ID</th>
                         <th className="px-6 py-4">Buyer / Style</th>
                         <th className="px-6 py-4">Sample Type</th>
                         <th className="px-6 py-4">Deadline</th>
                         <th className="px-6 py-4">Status</th>
                         <th className="px-6 py-4 w-10"></th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {summaryData.map(row => (
                         <tr 
                            key={row.id} 
                            onClick={() => {
                               if (row.source === 'Job') setSelectedSample(row.originalData as ExtendedSampleRow);
                               else {
                                   setEditingDevSample(row.originalData as DevelopmentSample);
                                   setIsDevModalOpen(true);
                               }
                            }}
                            className="hover:bg-gray-50 transition-colors cursor-pointer group"
                         >
                            <td className="px-6 py-4">
                               {row.source === 'Job' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wide">
                                     <Layers size={10} /> Prod Job
                                  </span>
                               ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100 uppercase tracking-wide">
                                     <Beaker size={10} /> R&D Dev
                                  </span>
                               )}
                            </td>
                            <td className="px-6 py-4 font-mono font-medium text-gray-500">
                               {row.samId}
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex flex-col">
                                  <span className="font-medium text-[#37352F]">{row.buyer}</span>
                                  <span className="text-xs text-gray-500">{row.style}</span>
                               </div>
                            </td>
                            <td className="px-6 py-4 text-gray-700 font-medium">
                               {row.type}
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-2">
                                  <span className="font-mono text-gray-600">{row.deadline}</span>
                                  {row.deadline && new Date(row.deadline) < new Date() && row.status !== 'Approved' && (
                                     <AlertTriangle size={14} className="text-red-500" />
                                  )}
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border
                                  ${row.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                    row.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                                    'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                  {row.status}
                               </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                               <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500" />
                            </td>
                         </tr>
                      ))}
                      {summaryData.length === 0 && (
                         <tr><td colSpan={7} className="p-12 text-center text-gray-400 italic">No active samples found in the system.</td></tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
      )}

      {activeView === 'Job' && (
        <>
            {/* Job Sampling View */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto custom-scrollbar flex-1">
                    <table className="w-full text-left text-sm border-collapse min-w-[1000px]">
                        <thead className="bg-[#F7F7F5] text-xs uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-200 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4">Job No.</th>
                                <th className="px-6 py-4">Sample ID</th>
                                <th className="px-6 py-4">Buyer</th>
                                <th className="px-6 py-4">Style No.</th>
                                <th className="px-6 py-4">Sample Type</th>
                                <th className="px-6 py-4">Due Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {allJobSamples.map(sample => {
                                const isOverdue = sample.status !== 'Approved' && sample.deadline && new Date(sample.deadline) < new Date();
                                return (
                                    <tr 
                                        key={sample.id} 
                                        onClick={() => setSelectedSample(sample)}
                                        className={`group transition-colors cursor-pointer hover:bg-gray-50`}
                                    >
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold font-mono bg-blue-50 text-blue-700 border border-blue-100">
                                            {sample.jobId}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono font-medium text-gray-500">{sample.samNumber}</td>
                                        <td className="px-6 py-4 font-medium text-[#37352F]">{sample.buyer}</td>
                                        <td className="px-6 py-4 text-gray-600">{sample.styleNo}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-block px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-700 shadow-sm">{sample.type}</span>
                                        </td>
                                        <td className={`px-6 py-4 font-medium ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>{sample.deadline}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded border
                                                ${sample.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                                sample.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                sample.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                                                'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                                {sample.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500" />
                                        </td>
                                    </tr>
                                );
                            })}
                            {allJobSamples.length === 0 && (
                                <tr><td colSpan={8} className="p-12 text-center text-gray-400 italic">No issued sampling plans found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500">
                    Showing {allJobSamples.length} samples
                </div>
            </div>
        </>
      )}

      {activeView === 'Development' && (
        <>
            {/* Development Sampling View */}
            <div className="flex justify-end">
                <button 
                    onClick={() => {
                        setEditingDevSample(null);
                        setIsDevModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors shadow-sm font-medium text-sm"
                >
                    <Plus size={16} /> New Development Sample
                </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto custom-scrollbar flex-1">
                    <table className="w-full text-left text-sm border-collapse min-w-[1000px]">
                        <thead className="bg-purple-50 text-xs uppercase tracking-wider text-purple-900 font-semibold border-b border-purple-100 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4">Sample ID</th>
                                <th className="px-6 py-4">Buyer</th>
                                <th className="px-6 py-4">Style No.</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Fabric</th>
                                <th className="px-6 py-4">Deadline</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {developmentSamples.map(sample => (
                                <tr key={sample.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4 font-mono font-bold text-purple-700">{sample.samNumber}</td>
                                    <td className="px-6 py-4 font-medium text-[#37352F]">{sample.buyer}</td>
                                    <td className="px-6 py-4 text-gray-600">{sample.styleNo}</td>
                                    <td className="px-6 py-4 text-gray-600">{sample.type}</td>
                                    <td className="px-6 py-4 text-gray-500 text-xs">{sample.fabric} / {sample.shade}</td>
                                    <td className="px-6 py-4 font-mono text-gray-600">{sample.deadline}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border
                                            ${sample.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                            {sample.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => {
                                                    setEditingDevSample(sample);
                                                    setIsDevModalOpen(true);
                                                }}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => onDeleteDevSample && onDeleteDevSample(sample.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {developmentSamples.length === 0 && (
                                <tr><td colSpan={8} className="p-12 text-center text-gray-400 italic">
                                    No development samples. Click "New Development Sample" to start.
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
      )}

      {/* Detail Modal (Job Sampling) */}
      {selectedSample && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl flex flex-col overflow-hidden">
               <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-start">
                  <div>
                     <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-mono rounded">{selectedSample.samNumber}</span>
                        <span className="text-lg font-bold text-[#37352F]">{selectedSample.type}</span>
                     </div>
                     <p className="text-xs text-gray-500">
                        Linked to Job: <span className="font-mono font-medium text-gray-700">{selectedSample.jobId}</span>
                     </p>
                  </div>
                  <button onClick={() => setSelectedSample(null)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                     <X size={20} />
                  </button>
               </div>
               <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide border-b border-gray-100 pb-1">Fabrication</h4>
                        <div className="space-y-3">
                           <div>
                              <label className="text-xs text-gray-500 block">Fabric</label>
                              <div className="font-medium text-sm text-[#37352F]">{selectedSample.fabric || '-'}</div>
                           </div>
                           <div>
                              <label className="text-xs text-gray-500 block">Shade / Color</label>
                              <div className="font-medium text-sm text-[#37352F] flex items-center gap-2">
                                 <Palette size={14} className="text-gray-400" />
                                 {selectedSample.shade || '-'}
                              </div>
                           </div>
                           <div>
                              <label className="text-xs text-gray-500 block">Wash Instruction</label>
                              <div className="font-medium text-sm text-[#37352F]">{selectedSample.wash || '-'}</div>
                           </div>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide border-b border-gray-100 pb-1">Construction</h4>
                        <div className="space-y-3">
                           <div>
                              <label className="text-xs text-gray-500 block">Base Size</label>
                              <div className="font-medium text-sm text-[#37352F] flex items-center gap-2">
                                 <Ruler size={14} className="text-gray-400" />
                                 {selectedSample.baseSize || '-'}
                              </div>
                           </div>
                           <div>
                              <label className="text-xs text-gray-500 block">Required Qty</label>
                              <div className="font-medium text-sm text-[#37352F] flex items-center gap-2">
                                 <Shirt size={14} className="text-gray-400" />
                                 {selectedSample.quantity} pcs
                              </div>
                           </div>
                           <div>
                              <label className="text-xs text-gray-500 block">Deadline</label>
                              <div className="font-medium text-sm text-[#37352F]">{selectedSample.deadline || 'TBD'}</div>
                           </div>
                        </div>
                     </div>
                  </div>
                  {/* Status Update (Interactive) */}
                  <div className="pt-4 border-t border-gray-100">
                      <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Update Stage Status</label>
                      <div className="flex gap-2">
                         {['Pending', 'In Progress', 'Approved', 'Rejected'].map(status => (
                            <button
                               key={status}
                               onClick={() => handleStatusChange(selectedSample, status)}
                               className={`px-4 py-2 text-xs font-medium rounded-md border transition-all
                                  ${selectedSample.status === status 
                                     ? 'bg-[#37352F] text-white border-[#37352F] shadow-sm' 
                                     : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                            >
                               {status}
                            </button>
                         ))}
                      </div>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* Development Sample Modal */}
      <DevelopmentSampleModal 
         isOpen={isDevModalOpen}
         onClose={() => setIsDevModalOpen(false)}
         onSave={(sample) => {
             if (editingDevSample) {
                 if (onUpdateDevSample) onUpdateDevSample(sample);
             } else {
                 if (onAddDevSample) onAddDevSample(sample);
             }
             setIsDevModalOpen(false);
         }}
         sampleToEdit={editingDevSample}
      />

    </div>
  );
};
