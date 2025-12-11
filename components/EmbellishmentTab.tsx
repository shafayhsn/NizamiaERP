
import React from 'react';
import { Plus, Trash2, Palette, Layers, FlaskConical } from 'lucide-react';
import { EmbellishmentRecord } from '../types';

interface EmbellishmentTabProps {
  data: EmbellishmentRecord[];
  onUpdate: (data: EmbellishmentRecord[]) => void;
}

export const EmbellishmentTab: React.FC<EmbellishmentTabProps> = ({ data, onUpdate }) => {

  const addEmbellishment = () => {
    const newRecord: EmbellishmentRecord = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'Screen Print', // Default
      location: '',
      artworkId: '',
      sizeW: '',
      sizeH: '',
      colorInfo: '',
      vendor: '',
      status: 'Pending',
      approvalDate: '',
      instructions: '',
      isTestingRequired: false
    };
    onUpdate([...data, newRecord]);
  };

  const removeEmbellishment = (id: string) => {
    onUpdate(data.filter(record => record.id !== id));
  };

  const handleFieldChange = (id: string, field: keyof EmbellishmentRecord, value: any) => {
    onUpdate(data.map(record => 
      record.id === id ? { ...record, [field]: value } : record
    ));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-10">
      
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
           <Palette size={18} className="text-gray-400" />
           <h2 className="text-lg font-medium text-[#37352F]">Embellishment Details</h2>
        </div>
        <button 
          onClick={addEmbellishment}
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-[#37352F] hover:bg-black rounded shadow-sm transition-all transform active:scale-95"
        >
          <Plus size={14} /> Add New Embellishment
        </button>
      </div>

      {/* Dynamic List */}
      <div className="space-y-6">
        {data.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-12 flex flex-col items-center justify-center text-center bg-gray-50/50">
             <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 text-gray-300">
                <Layers size={24} />
             </div>
             <h3 className="text-sm font-medium text-gray-900">No Embellishments Added</h3>
             <p className="text-xs text-gray-500 mt-1 mb-4 max-w-xs">
               Add prints, embroidery, heat transfers, or other artwork details to this order.
             </p>
             <button 
                onClick={addEmbellishment}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
             >
                + Add First Record
             </button>
          </div>
        ) : (
          data.map((record, index) => (
            <div 
              key={record.id} 
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              {/* Card Header */}
              <div className="bg-gray-50/80 border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold">
                     {index + 1}
                   </span>
                   <span className="text-sm font-semibold text-[#37352F]">
                     {record.type || 'New Embellishment'}
                   </span>
                   {record.location && (
                     <span className="text-xs text-gray-400 border-l border-gray-300 pl-3">
                       {record.location}
                     </span>
                   )}
                </div>
                <button 
                  onClick={() => removeEmbellishment(record.id)}
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
                  title="Remove Embellishment"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Card Body - Grid Form */}
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Type</label>
                  <select 
                    value={record.type}
                    onChange={(e) => handleFieldChange(record.id, 'type', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded focus:bg-white focus:border-blue-500 outline-none"
                  >
                    <option value="Screen Print">Screen Print</option>
                    <option value="Embroidery">Embroidery</option>
                    <option value="Heat Transfer">Heat Transfer</option>
                    <option value="Applique">Applique</option>
                    <option value="Sequin">Sequin</option>
                    <option value="Foil Print">Foil Print</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Location */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Placement / Location</label>
                  <input 
                    type="text" 
                    value={record.location}
                    onChange={(e) => handleFieldChange(record.id, 'location', e.target.value)}
                    placeholder="e.g. Chest Center"
                    className="w-full px-2 py-1.5 text-sm bg-white border border-gray-200 rounded focus:border-blue-500 outline-none"
                  />
                </div>

                {/* Vendor */}
                <div className="flex flex-col gap-1.5 lg:col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Vendor / Supplier</label>
                  <input 
                    type="text" 
                    value={record.vendor}
                    onChange={(e) => handleFieldChange(record.id, 'vendor', e.target.value)}
                    placeholder="e.g. Best Prints Ltd."
                    className="w-full px-2 py-1.5 text-sm bg-white border border-gray-200 rounded focus:border-blue-500 outline-none"
                  />
                </div>

                {/* Artwork ID */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Artwork ID / Ref</label>
                  <input 
                    type="text" 
                    value={record.artworkId}
                    onChange={(e) => handleFieldChange(record.id, 'artworkId', e.target.value)}
                    placeholder="ART-2024-X"
                    className="w-full px-2 py-1.5 text-sm bg-white border border-gray-200 rounded focus:border-blue-500 outline-none"
                  />
                </div>

                 {/* Dimensions */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Dimensions (cm)</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={record.sizeW}
                      onChange={(e) => handleFieldChange(record.id, 'sizeW', e.target.value)}
                      placeholder="W"
                      className="w-full px-2 py-1.5 text-sm bg-white border border-gray-200 rounded focus:border-blue-500 outline-none"
                    />
                    <span className="text-gray-400 text-xs">x</span>
                    <input 
                      type="number" 
                      value={record.sizeH}
                      onChange={(e) => handleFieldChange(record.id, 'sizeH', e.target.value)}
                      placeholder="H"
                      className="w-full px-2 py-1.5 text-sm bg-white border border-gray-200 rounded focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                {/* Color Info */}
                <div className="flex flex-col gap-1.5 lg:col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Color / Thread Info</label>
                  <input 
                    type="text" 
                    value={record.colorInfo}
                    onChange={(e) => handleFieldChange(record.id, 'colorInfo', e.target.value)}
                    placeholder="e.g. Pantone 19-4052, White Base"
                    className="w-full px-2 py-1.5 text-sm bg-white border border-gray-200 rounded focus:border-blue-500 outline-none"
                  />
                </div>

                {/* Status */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Sample Status</label>
                  <select 
                    value={record.status}
                    onChange={(e) => handleFieldChange(record.id, 'status', e.target.value)}
                    className={`w-full px-2 py-1.5 text-sm border rounded focus:border-blue-500 outline-none
                      ${record.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' : 
                        record.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' : 
                        'bg-white border-gray-200'}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Commented">Commented</option>
                  </select>
                </div>

                {/* Approval Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Approval Date</label>
                  <input 
                    type="date" 
                    value={record.approvalDate}
                    onChange={(e) => handleFieldChange(record.id, 'approvalDate', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm bg-white border border-gray-200 rounded focus:border-blue-500 outline-none"
                  />
                </div>

                 {/* Instructions */}
                <div className="flex flex-col gap-1.5 md:col-span-2 lg:col-span-4">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Special Instructions / Comments</label>
                  <textarea 
                    rows={2}
                    value={record.instructions}
                    onChange={(e) => handleFieldChange(record.id, 'instructions', e.target.value)}
                    placeholder="Enter any specific technical instructions, placement notes, or quality comments..."
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded focus:border-blue-500 outline-none resize-none"
                  />
                </div>

                {/* Testing Toggle */}
                <div className="flex items-center gap-2 mt-2 md:col-span-2 lg:col-span-4">
                   <div 
                      onClick={() => handleFieldChange(record.id, 'isTestingRequired', !record.isTestingRequired)}
                      className={`flex items-center gap-2 cursor-pointer select-none px-3 py-1.5 rounded-full border transition-all
                         ${record.isTestingRequired ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                   >
                      <FlaskConical size={14} />
                      <span className="text-xs font-bold uppercase">Requires Lab Test</span>
                      <div className={`w-8 h-4 rounded-full p-0.5 ml-2 transition-colors ${record.isTestingRequired ? 'bg-purple-600' : 'bg-gray-300'}`}>
                         <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${record.isTestingRequired ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      </div>
                   </div>
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
