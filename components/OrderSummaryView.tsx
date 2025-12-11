
import React from 'react';
import { 
  FileText, Calendar, Hash, Package, AlertCircle, CheckCircle2, 
  Download, Edit2, Info, Layers, Factory, Ruler, FlaskConical, MapPin, Phone
} from 'lucide-react';
import { NewOrderState } from '../types';
import { formatAppDate } from '../constants';

interface OrderSummaryViewProps {
  orderData: NewOrderState;
  onEdit?: () => void;
  onGeneratePDF?: () => void;
}

export const OrderSummaryView: React.FC<OrderSummaryViewProps> = ({ orderData, onEdit, onGeneratePDF }) => {
  const { generalInfo, criticalPath, bom, sampling, finishing, fitting, embellishments } = orderData;
  const { formData, sizeGroups } = generalInfo;

  // --- Helpers ---
  const getTotalQty = () => {
    let total = 0;
    sizeGroups.forEach(group => {
      Object.values(group.breakdown).forEach(row => {
        Object.values(row).forEach(qty => total += Number(qty) || 0);
      });
    });
    return total;
  };

  // Helper for BOM Status Colors
  const getBOMStatusColor = (status: string) => {
    switch (status) {
      case 'Received': return 'bg-green-100 text-green-700 border-green-200 print:border-black print:text-black print:bg-transparent';
      case 'Ordered': return 'bg-blue-100 text-blue-700 border-blue-200 print:border-black print:text-black print:bg-transparent';
      case 'Sourced': return 'bg-yellow-100 text-yellow-700 border-yellow-200 print:border-black print:text-black print:bg-transparent';
      default: return 'bg-gray-100 text-gray-500 border-gray-200 print:border-black print:text-black print:bg-transparent';
    }
  };

  // Consolidate Testing Requirements
  const testingItems = [
    ...bom.filter(i => i.isTestingRequired).map(i => ({ category: 'Material', name: i.componentName, detail: i.vendor })),
    ...sampling.filter(s => s.isTestingRequired).map(s => ({ category: 'Sample', name: s.type, detail: s.samNumber })),
    ...embellishments.filter(e => e.isTestingRequired).map(e => ({ category: 'Embellishment', name: e.type, detail: e.location }))
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-8 bg-white min-h-screen print:p-0 print:max-w-none">
      
      {/* --- PRINT HEADER (Hidden on Screen) --- */}
      <div className="hidden print:flex flex-row justify-between items-start mb-8 border-b-2 border-black pb-4">
         <div className="flex flex-col">
            <h1 className="text-2xl font-bold uppercase tracking-wider text-black">Order Specification Sheet</h1>
            <div className="mt-4 text-sm text-gray-800 space-y-0.5">
               <p className="font-bold text-lg">Nizamia Global Apparel</p>
               <p className="flex items-center gap-2"><MapPin size={12}/> Plot 4, Sector 23, Korangi Industrial Area, Karachi</p>
               <p className="flex items-center gap-2"><Phone size={12}/> +92 21 35000000</p>
            </div>
         </div>
         <div className="text-right">
            <table className="text-sm text-left border-collapse">
               <tbody>
                  <tr>
                     <td className="font-bold pr-4 py-1 text-gray-600">PO Number:</td>
                     <td className="font-mono font-bold text-black text-lg">{formData.poNumber || 'DRAFT'}</td>
                  </tr>
                  <tr>
                     <td className="font-bold pr-4 py-1 text-gray-600">Job Number:</td>
                     <td className="font-mono text-black">{formData.jobNumber}</td>
                  </tr>
                  <tr>
                     <td className="font-bold pr-4 py-1 text-gray-600">Print Date:</td>
                     <td className="text-black">{formatAppDate(new Date().toISOString())}</td>
                  </tr>
               </tbody>
            </table>
         </div>
      </div>

      {/* --- SCREEN HEADER (Hidden on Print) --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200 print:hidden">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <h1 className="text-3xl font-bold text-[#37352F]">Order Summary</h1>
             <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 uppercase tracking-wide">
               {formData.poNumber ? 'PO Confirmed' : 'Draft Order'}
             </span>
           </div>
           <p className="text-sm text-gray-500">
             Job #: <span className="font-mono text-gray-700 font-medium">{formData.jobNumber}</span> • Style: {formData.styleNumber}
           </p>
        </div>
        <div className="flex items-center gap-3 no-print">
          <button 
            onClick={onEdit}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
          >
            <Edit2 size={16} /> Edit Order
          </button>
          <button 
            onClick={onGeneratePDF}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-[#37352F] rounded hover:bg-black transition-colors"
          >
            <Download size={16} /> Print / Save PO
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:block print:space-y-8">
        
        {/* LEFT COLUMN (2 spans on screen, Full on Print) */}
        <div className="lg:col-span-2 space-y-6 print:space-y-8">
           
           {/* General Info Card */}
           <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row print:border-0 print:shadow-none print:rounded-none print:flex-row">
              {/* Image Section */}
              <div className="w-full md:w-48 h-48 bg-gray-100 border-r border-gray-200 relative flex-shrink-0 print:w-40 print:h-40 print:border print:border-gray-300">
                 {generalInfo.styleImage ? (
                    <img src={generalInfo.styleImage} alt="Style" className="w-full h-full object-cover" />
                 ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 text-xs">
                       <Package size={24} className="mb-2 opacity-50" />
                       No Image
                    </div>
                 )}
              </div>

              <div className="flex-1">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2 print:bg-transparent print:border-b-2 print:border-black print:px-0 print:mb-2">
                    <Info size={18} className="text-gray-400 print:hidden" />
                    <h2 className="text-sm font-bold text-[#37352F] uppercase tracking-wide print:text-black print:text-base">Order Metadata</h2>
                </div>
                <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-4 print:p-0 print:gap-x-8 print:gap-y-2">
                    <div>
                        <label className="text-xs text-gray-500 block print:font-bold print:text-black">Buyer</label>
                        <span className="text-sm font-medium text-gray-900">{formData.buyerName}</span>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block print:font-bold print:text-black">Factory Ref</label>
                        <span className="text-sm font-medium text-gray-900">{formData.factoryRef || '-'}</span>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block print:font-bold print:text-black">Style Number</label>
                        <span className="text-sm font-medium text-gray-900">{formData.styleNumber}</span>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block print:font-bold print:text-black">PO Number</label>
                        <span className="text-sm font-medium text-gray-900">{formData.poNumber || '-'}</span>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block print:font-bold print:text-black">PO Date</label>
                        <span className="text-sm font-medium text-gray-900">{formatAppDate(formData.poDate)}</span>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block print:font-bold print:text-black">Ship Date</label>
                        <span className="text-sm font-medium text-gray-900">{formatAppDate(formData.shipDate)}</span>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block print:font-bold print:text-black">Ship Mode</label>
                        <span className="text-sm font-medium text-gray-900">{formData.shipMode}</span>
                    </div>
                    <div className="col-span-2 sm:col-span-3 pt-2 border-t border-gray-100 mt-2 print:border-0 print:mt-0 print:col-span-1">
                        <label className="text-xs text-gray-500 block print:font-bold print:text-black">Total Quantity</label>
                        <span className="text-lg font-bold text-blue-600 print:text-black">{getTotalQty().toLocaleString()} pcs</span>
                    </div>
                </div>
              </div>
           </div>

           {/* PO Breakdown Matrix */}
           <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden print:shadow-none print:border-0 print:rounded-none">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2 print:bg-transparent print:px-0 print:border-b-2 print:border-black print:mb-2">
                 <Hash size={18} className="text-gray-400 print:hidden" />
                 <h2 className="text-sm font-bold text-[#37352F] uppercase tracking-wide print:text-base print:text-black">Size Breakdown</h2>
              </div>
              <div className="p-5 space-y-6 print:p-0 print:space-y-4">
                {sizeGroups.length > 0 ? (
                    sizeGroups.map(group => (
                    <div key={group.id} className="border border-gray-100 rounded-lg overflow-hidden print:border-black print:rounded-none">
                        <div className="bg-gray-50/50 px-3 py-2 text-xs font-bold text-gray-600 uppercase border-b border-gray-100 flex justify-between print:bg-gray-200 print:text-black print:border-black">
                            <span>{group.groupName}</span>
                            <span>{group.unitPrice} {group.currency}</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 print:bg-white print:text-black print:border-b print:border-black">
                                    <th className="px-3 py-2 font-medium print:font-bold">Color</th>
                                    {group.sizes.map(size => (
                                        <th key={size} className="px-2 py-2 text-center font-medium print:font-bold">{size}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 print:divide-black">
                                {group.colors.map(color => (
                                    <tr key={color.id} className="print:border-b print:border-gray-300">
                                        <td className="px-3 py-2 font-medium text-gray-800 print:text-black">{color.name}</td>
                                        {group.sizes.map(size => (
                                        <td key={size} className="px-2 py-2 text-center text-gray-600 print:text-black">
                                            {group.breakdown[color.id]?.[size] || '-'}
                                        </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                            </table>
                        </div>
                    </div>
                    ))
                ) : (
                    <div className="text-sm text-gray-400 text-center py-4">No breakdown defined.</div>
                )}
              </div>
           </div>

           {/* BOM Summary Table */}
           <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden print:shadow-none print:border-0 print:rounded-none">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between print:bg-transparent print:px-0 print:border-b-2 print:border-black print:mb-2">
                 <div className="flex items-center gap-2">
                    <Layers size={18} className="text-gray-400 print:hidden" />
                    <h2 className="text-sm font-bold text-[#37352F] uppercase tracking-wide print:text-base print:text-black">Bill of Materials</h2>
                 </div>
                 <span className="text-xs text-gray-500 print:hidden">{bom.length} items</span>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left border-collapse print:border print:border-black">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500 print:bg-gray-200 print:text-black">
                       <tr>
                          <th className="px-5 py-2 font-medium print:border-r print:border-black">Type</th>
                          <th className="px-5 py-2 font-medium print:border-r print:border-black">Component</th>
                          <th className="px-5 py-2 font-medium print:border-r print:border-black">Supplier</th>
                          <th className="px-5 py-2 font-medium print:border-r print:border-black">PO Number</th>
                          <th className="px-5 py-2 font-medium text-center">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 print:divide-gray-400">
                       {bom.map(item => (
                          <tr key={item.id} className="print:border-b print:border-gray-300">
                             <td className="px-5 py-2 text-xs text-gray-500 print:text-black print:border-r print:border-gray-300">{item.processGroup}</td>
                             <td className="px-5 py-2 font-medium text-gray-800 print:text-black print:border-r print:border-gray-300">{item.componentName || 'Untitled'}</td>
                             <td className="px-5 py-2 text-gray-500 print:text-black print:border-r print:border-gray-300">{item.vendor || '-'}</td>
                             <td className="px-5 py-2 font-mono text-xs text-blue-600 print:text-black print:border-r print:border-gray-300">
                                {item.poNumber || '-'}
                             </td>
                             <td className="px-5 py-2 text-center">
                                <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold border ${getBOMStatusColor(item.sourcingStatus)}`}>
                                   {item.sourcingStatus}
                                </span>
                             </td>
                          </tr>
                       ))}
                       {bom.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-gray-400 text-xs">No BOM items defined.</td></tr>}
                    </tbody>
                 </table>
              </div>
           </div>

        </div>

        {/* RIGHT COLUMN (1 span on screen, Full on Print) */}
        <div className="space-y-6 print:space-y-8 print:grid print:grid-cols-2 print:gap-8">
           
           {/* Critical Path Schedule */}
           <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden print:shadow-none print:border-0 print:rounded-none">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2 print:bg-transparent print:px-0 print:border-b-2 print:border-black print:mb-2">
                 <Calendar size={18} className="text-gray-400 print:hidden" />
                 <h2 className="text-sm font-bold text-[#37352F] uppercase tracking-wide print:text-base print:text-black">Critical Path</h2>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-xs text-left border-collapse print:border print:border-black">
                    <thead className="bg-gray-50 text-gray-500 print:bg-gray-200 print:text-black">
                       <tr>
                          <th className="px-4 py-2 font-medium print:border-r print:border-black">Milestone</th>
                          <th className="px-4 py-2 font-medium print:border-r print:border-black">Due</th>
                          <th className="px-4 py-2 font-medium text-right">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 print:divide-gray-400">
                       {criticalPath.schedule.map(task => (
                          <tr key={task.id} className="print:border-b print:border-gray-300">
                             <td className="px-4 py-2 font-medium text-gray-700 truncate max-w-[120px] print:text-black print:max-w-none print:border-r print:border-gray-300" title={task.milestone}>{task.milestone}</td>
                             <td className="px-4 py-2 text-gray-500 font-mono print:text-black print:border-r print:border-gray-300">{formatAppDate(task.calculatedDueDate)}</td>
                             <td className="px-4 py-2 text-right">
                                <span className="text-[10px] font-bold uppercase print:text-black">
                                   {task.status}
                                </span>
                             </td>
                          </tr>
                       ))}
                       {criticalPath.schedule.length === 0 && <tr><td colSpan={3} className="p-4 text-center text-gray-400">Schedule not generated.</td></tr>}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Testing Requirements (NEW) */}
           <div className="bg-white border border-purple-100 rounded-xl shadow-sm overflow-hidden print:shadow-none print:border-0 print:rounded-none">
              <div className="px-5 py-3 border-b border-purple-50 bg-purple-50/30 flex items-center gap-2 print:bg-transparent print:px-0 print:border-b-2 print:border-black print:mb-2">
                 <FlaskConical size={18} className="text-purple-600 print:hidden" />
                 <h2 className="text-sm font-bold text-[#37352F] uppercase tracking-wide print:text-base print:text-black">Quality Assurance</h2>
              </div>
              <div className="p-0">
                 {testingItems.length > 0 ? (
                    <table className="w-full text-xs text-left border-collapse print:border print:border-black">
                        <thead className="bg-gray-50 text-gray-500 print:bg-gray-200 print:text-black">
                           <tr>
                                <th className="px-4 py-2 font-medium print:border-r print:border-black">Category</th>
                                <th className="px-4 py-2 font-medium print:border-r print:border-black">Item</th>
                                <th className="px-4 py-2 font-medium text-right">Ref</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 print:divide-gray-400">
                            {testingItems.map((item, idx) => (
                                <tr key={idx} className="print:border-b print:border-gray-300">
                                    <td className="px-4 py-2 font-medium text-gray-600 print:text-black print:border-r print:border-gray-300">{item.category}</td>
                                    <td className="px-4 py-2 font-medium text-[#37352F] print:text-black print:border-r print:border-gray-300">{item.name}</td>
                                    <td className="px-4 py-2 text-right text-gray-500 print:text-black">{item.detail || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 ) : (
                    <div className="p-4 text-center text-gray-400 text-xs print:border print:border-black">No specific testing requirements defined.</div>
                 )}
              </div>
           </div>

           {/* Sampling Detailed List */}
           <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden print:shadow-none print:border-0 print:rounded-none">
             <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2 print:bg-transparent print:px-0 print:border-b-2 print:border-black print:mb-2">
                 <Factory size={18} className="text-gray-400 print:hidden" />
                 <h2 className="text-sm font-bold text-[#37352F] uppercase tracking-wide print:text-base print:text-black">Sampling Plan</h2>
              </div>
              <div className="p-0">
                {sampling.length > 0 ? (
                    <table className="w-full text-xs text-left border-collapse print:border print:border-black">
                        <thead className="bg-gray-50 text-gray-500 print:bg-gray-200 print:text-black">
                           <tr>
                                <th className="px-4 py-2 font-medium print:border-r print:border-black">Stage</th>
                                <th className="px-4 py-2 font-medium print:border-r print:border-black">Deadline</th>
                                <th className="px-4 py-2 font-medium text-right">Status</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 print:divide-gray-400">
                            {sampling.map(sample => (
                                <tr key={sample.id} className="print:border-b print:border-gray-300">
                                    <td className="px-4 py-2 font-medium text-gray-700 print:text-black print:border-r print:border-gray-300">{sample.type}</td>
                                    <td className="px-4 py-2 text-gray-500 print:text-black print:border-r print:border-gray-300">{formatAppDate(sample.deadline)}</td>
                                    <td className="px-4 py-2 text-right">
                                        <span className="text-[10px] uppercase font-bold print:text-black">
                                            {sample.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-4 text-center text-gray-400 text-xs print:border print:border-black">No sampling stages defined.</div>
                )}
             </div>
           </div>

           {/* Finishing / Packing / Fit Specs - Grouped for print */}
           <div className="space-y-6 print:break-inside-avoid">
               {/* Finishing / Packing Status */}
               <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-4 print:shadow-none print:border-0 print:rounded-none print:p-0">
                  <div className="flex items-center gap-2 mb-3 print:mb-2 print:border-b-2 print:border-black print:pb-1">
                     <Package size={18} className="text-gray-400 print:hidden" />
                     <h2 className="text-sm font-bold text-[#37352F] uppercase tracking-wide print:text-base print:text-black">Finishing & Packing</h2>
                  </div>
                  
                  <div className="space-y-3 text-xs print:border print:border-black print:p-2">
                     <div className="flex justify-between items-center border-b border-gray-50 pb-2 print:border-gray-300">
                        <span className="text-gray-500 print:text-black font-bold">Fold Type</span>
                        <span className="font-medium text-gray-800 print:text-black">{finishing.foldingType || '-'}</span>
                     </div>
                     <div className="flex justify-between items-center border-b border-gray-50 pb-2 print:border-gray-300">
                        <span className="text-gray-500 print:text-black font-bold">Polybag</span>
                        <span className="font-medium text-gray-800 print:text-black truncate max-w-[150px]">{finishing.polybagSpec || '-'}</span>
                     </div>
                     <div className="flex justify-between items-center border-b border-gray-50 pb-2 print:border-gray-300">
                        <span className="text-gray-500 print:text-black font-bold">Carton Max</span>
                        <span className="font-medium text-gray-800 print:text-black">{finishing.maxPiecesPerCarton ? `${finishing.maxPiecesPerCarton} pcs` : '-'}</span>
                     </div>
                     <div className="flex justify-between items-center pt-1">
                        <span className="text-gray-500 print:text-black font-bold">Final QC</span>
                        <span className="font-bold print:text-black">
                           {finishing.finalInspectionStatus}
                        </span>
                     </div>
                  </div>
               </div>

                {/* Fitting Specs */}
               <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-4 print:shadow-none print:border-0 print:rounded-none print:p-0">
                  <div className="flex items-center gap-2 mb-3 print:mb-2 print:border-b-2 print:border-black print:pb-1">
                     <Ruler size={18} className="text-gray-400 print:hidden" />
                     <h2 className="text-sm font-bold text-[#37352F] uppercase tracking-wide print:text-base print:text-black">Fit Specs</h2>
                  </div>
                  <div className="space-y-2 text-xs print:border print:border-black print:p-2">
                     <div className="flex justify-between">
                         <span className="text-gray-500 print:text-black font-bold">Fit Name:</span>
                         <span className="font-medium print:text-black">{fitting.fitName || '-'}</span>
                     </div>
                     <div className="flex justify-between">
                         <span className="text-gray-500 print:text-black font-bold">Size Range:</span>
                         <span className="font-medium print:text-black">{fitting.sizeRange || '-'}</span>
                     </div>
                     {fitting.fileName && (
                         <div className="mt-2 p-2 bg-blue-50 text-blue-700 rounded text-center border border-blue-100 print:hidden">
                            📄 {fitting.fileName}
                         </div>
                     )}
                  </div>
               </div>
           </div>

        </div>
      </div>
      
      {/* Print Footer */}
      <div className="hidden print:flex justify-between items-end mt-12 pt-4 border-t-2 border-black">
         <div className="text-xs">
            <p>Authorized Signature</p>
            <div className="h-12 border-b border-black w-48 mt-4"></div>
         </div>
         <div className="text-xs text-gray-500">
            Generated by Nizamia ERP
         </div>
      </div>
    </div>
  );
};
