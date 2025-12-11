
import React from 'react';
import { Plus, Trash2, Hash, FlaskConical } from 'lucide-react';
import { SampleRow } from '../types';

interface SamplingTabProps {
  data: SampleRow[];
  onUpdate: (data: SampleRow[]) => void;
}

export const SamplingTab: React.FC<SamplingTabProps> = ({ data, onUpdate }) => {
  // Helper to generate a random SAM ID
  const generateSamId = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `SAM-${year}-${random}`;
  };

  const sampleTypes = [
    "Proto Sample",
    "Fit Sample",
    "Salesman Sample (SMS)",
    "Size Set",
    "Pre-Production (PP)",
    "Top of Production (TOP)",
    "Photo Sample",
    "Shipment Sample"
  ];

  const handleAddRow = () => {
    const newRow: SampleRow = {
      id: Math.random().toString(36).substr(2, 9),
      samNumber: generateSamId(),
      type: '',
      fabric: '',
      shade: '',
      wash: '',
      baseSize: '',
      threadColor: '',
      zipperColor: '',
      lining: '',
      quantity: '',
      deadline: '',
      status: 'Pending',
      isTestingRequired: false
    };
    onUpdate([...data, newRow]);
  };

  const handleDeleteRow = (id: string) => {
    onUpdate(data.filter(r => r.id !== id));
  };

  const updateRow = (id: string, field: keyof SampleRow, value: any) => {
    onUpdate(data.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-10">
      
      {/* Header & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-medium text-[#37352F]">Sampling Plan Matrix</h2>
          <p className="text-sm text-gray-500">Define construction and logistics for each sample stage. SAM# is auto-generated.</p>
        </div>
        <button 
          onClick={handleAddRow}
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-[#37352F] hover:bg-black rounded shadow-sm transition-all"
        >
          <Plus size={14} /> Add Sample Stage
        </button>
      </div>

      {/* Main Table Container */}
      <div className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar pb-2">
          <table className="w-full text-sm text-left border-collapse min-w-[1300px]">
            <thead className="bg-[#F7F7F5] text-xs uppercase tracking-wider text-gray-500 font-semibold">
              <tr>
                {/* SAM # Column (Sticky) */}
                <th className="p-3 border-b border-r border-gray-200 min-w-[130px] sticky left-0 bg-[#F7F7F5] z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center gap-1">
                     <Hash size={12} /> SAM #
                  </div>
                </th>
                
                <th className="p-3 border-b border-gray-200 min-w-[180px]">Sample Type</th>
                <th className="p-3 border-b border-gray-200 min-w-[160px]">Fabric</th>
                <th className="p-3 border-b border-gray-200 min-w-[120px]">Shade</th>
                <th className="p-3 border-b border-gray-200 min-w-[120px]">Wash</th>
                <th className="p-3 border-b border-gray-200 min-w-[80px]">Base Size</th>
                <th className="p-3 border-b border-gray-200 min-w-[120px]">Thread Col.</th>
                <th className="p-3 border-b border-gray-200 min-w-[120px]">Zipper Col.</th>
                <th className="p-3 border-b border-gray-200 min-w-[120px]">Lining</th>
                <th className="p-3 border-b border-gray-200 min-w-[80px]">Qty</th>
                <th className="p-3 border-b border-gray-200 min-w-[130px]">Deadline</th>
                <th className="p-3 border-b border-gray-200 min-w-[80px] text-center">Lab Test</th>
                <th className="p-3 border-b border-gray-200 min-w-[140px]">Status</th>
                <th className="p-3 border-b border-gray-200 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((row) => (
                <tr key={row.id} className="group hover:bg-gray-50 transition-colors">
                  
                  {/* SAM # (Sticky Cell) */}
                  <td className="p-2 border-r border-gray-200 sticky left-0 bg-white group-hover:bg-gray-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                    <div className="px-2 py-1.5 text-xs font-mono font-medium text-blue-600 bg-blue-50/50 rounded border border-blue-100/50 inline-block w-full text-center select-all">
                      {row.samNumber}
                    </div>
                  </td>

                  {/* Sample Type */}
                  <td className="p-2">
                    <input 
                      list={`types-${row.id}`}
                      type="text" 
                      value={row.type}
                      onChange={(e) => updateRow(row.id, 'type', e.target.value)}
                      placeholder="Select Stage..."
                      className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded outline-none font-medium text-[#37352F]"
                    />
                    <datalist id={`types-${row.id}`}>
                      {sampleTypes.map(type => <option key={type} value={type} />)}
                    </datalist>
                  </td>

                  {/* Fabric */}
                  <td className="p-2">
                    <input 
                      type="text" 
                      value={row.fabric}
                      onChange={(e) => updateRow(row.id, 'fabric', e.target.value)}
                      className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:bg-white hover:border-gray-200 focus:bg-white focus:border-blue-500 rounded outline-none"
                      placeholder="Fabric details..."
                    />
                  </td>

                  {/* Shade */}
                  <td className="p-2">
                    <input 
                      type="text" 
                      value={row.shade}
                      onChange={(e) => updateRow(row.id, 'shade', e.target.value)}
                      className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:bg-white hover:border-gray-200 focus:bg-white focus:border-blue-500 rounded outline-none"
                    />
                  </td>

                  {/* Wash */}
                  <td className="p-2">
                    <input 
                      type="text" 
                      value={row.wash}
                      onChange={(e) => updateRow(row.id, 'wash', e.target.value)}
                      className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:bg-white hover:border-gray-200 focus:bg-white focus:border-blue-500 rounded outline-none"
                    />
                  </td>

                  {/* Base Size */}
                  <td className="p-2">
                    <input 
                      type="text" 
                      value={row.baseSize}
                      onChange={(e) => updateRow(row.id, 'baseSize', e.target.value)}
                      className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:bg-white hover:border-gray-200 focus:bg-white focus:border-blue-500 rounded outline-none text-center"
                    />
                  </td>

                  {/* Thread Color */}
                  <td className="p-2">
                    <input 
                      type="text" 
                      value={row.threadColor}
                      onChange={(e) => updateRow(row.id, 'threadColor', e.target.value)}
                      className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:bg-white hover:border-gray-200 focus:bg-white focus:border-blue-500 rounded outline-none"
                    />
                  </td>

                   {/* Zipper Color */}
                   <td className="p-2">
                    <input 
                      type="text" 
                      value={row.zipperColor}
                      onChange={(e) => updateRow(row.id, 'zipperColor', e.target.value)}
                      className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:bg-white hover:border-gray-200 focus:bg-white focus:border-blue-500 rounded outline-none"
                    />
                  </td>

                  {/* Lining */}
                  <td className="p-2">
                    <input 
                      type="text" 
                      value={row.lining}
                      onChange={(e) => updateRow(row.id, 'lining', e.target.value)}
                      className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:bg-white hover:border-gray-200 focus:bg-white focus:border-blue-500 rounded outline-none"
                    />
                  </td>

                  {/* Quantity */}
                  <td className="p-2">
                    <input 
                      type="number" 
                      value={row.quantity}
                      onChange={(e) => updateRow(row.id, 'quantity', e.target.value)}
                      className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:bg-white hover:border-gray-200 focus:bg-white focus:border-blue-500 rounded outline-none text-center"
                      placeholder="0"
                    />
                  </td>

                  {/* Deadline */}
                  <td className="p-2">
                    <div className="relative group/date">
                      <input 
                        type="date" 
                        value={row.deadline}
                        onChange={(e) => updateRow(row.id, 'deadline', e.target.value)}
                        className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:bg-white hover:border-gray-200 focus:bg-white focus:border-blue-500 rounded outline-none text-xs"
                      />
                    </div>
                  </td>

                  {/* Lab Test */}
                  <td className="p-2 text-center">
                     <button 
                        onClick={() => updateRow(row.id, 'isTestingRequired', !row.isTestingRequired)}
                        className={`p-1.5 rounded transition-all
                          ${row.isTestingRequired ? 'bg-purple-100 text-purple-600' : 'text-gray-300 hover:bg-gray-100'}`}
                        title={row.isTestingRequired ? "Test Report Required" : "No Test"}
                     >
                        <FlaskConical size={14} />
                     </button>
                  </td>

                  {/* Status */}
                  <td className="p-2">
                    <select 
                      value={row.status}
                      onChange={(e) => updateRow(row.id, 'status', e.target.value as any)}
                      className={`w-full px-2 py-1 text-xs font-medium border rounded appearance-none cursor-pointer outline-none ${getStatusColor(row.status)}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>

                  {/* Action */}
                  <td className="p-2 text-center">
                    <button 
                      onClick={() => handleDeleteRow(row.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Row"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              
              {data.length === 0 && (
                 <tr>
                   <td colSpan={14} className="p-8 text-center text-gray-400 text-sm">
                     No sample stages defined. Click "Add Sample Stage" to begin.
                   </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
