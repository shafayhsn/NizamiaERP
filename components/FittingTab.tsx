
import React, { useState } from 'react';
import { Upload, FileText, X, FileSpreadsheet, Ruler, Type, Info, Calendar } from 'lucide-react';
import { FittingData } from '../types';

interface FittingTabProps {
  data: FittingData;
  onUpdate: (data: FittingData) => void;
}

export const FittingTab: React.FC<FittingTabProps> = ({ data, onUpdate }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onUpdate({ ...data, [name]: value });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    // Simulate upload logic
    onUpdate({ ...data, fileName: file.name });
  };

  const removeFile = () => {
    onUpdate({ ...data, fileName: null });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-8">
      
      {/* Header */}
      <div className="flex items-center gap-2">
        <Ruler size={18} className="text-gray-400" />
        <h2 className="text-lg font-medium text-[#37352F]">Specification Sheet & Fit Details</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: File Upload */}
        <div className="lg:col-span-1 space-y-2">
           <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
             Specification Sheet
           </label>
           
           <div 
             onDragOver={handleDragOver}
             onDragLeave={handleDragLeave}
             onDrop={handleDrop}
             className={`
               relative border border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center transition-all min-h-[140px]
               ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50/50 hover:bg-gray-50'}
               ${data.fileName ? 'bg-white border-solid border-gray-200' : ''}
             `}
           >
             {data.fileName ? (
               <div className="flex flex-col items-center gap-2 w-full animate-in zoom-in-95 duration-200">
                 <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                    {data.fileName.endsWith('.xlsx') || data.fileName.endsWith('.xls') ? 
                      <FileSpreadsheet size={20} /> : <FileText size={20} />
                    }
                 </div>
                 <div className="space-y-0.5 max-w-full px-2">
                   <p className="text-sm font-medium text-gray-700 truncate break-all line-clamp-2">{data.fileName}</p>
                   <p className="text-[10px] text-green-600 font-medium">Upload Complete</p>
                 </div>
                 <button 
                   onClick={removeFile}
                   className="mt-1 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-full transition-colors flex items-center gap-1"
                   title="Remove File"
                 >
                   <X size={12} /> Remove
                 </button>
               </div>
             ) : (
               <>
                 <input 
                   type="file" 
                   accept=".pdf,.xlsx,.xls"
                   onChange={handleFileSelect}
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                 />
                 <div className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center mb-2 text-gray-400">
                   <Upload size={16} />
                 </div>
                 <h3 className="text-sm font-medium text-gray-700">Upload Spec Sheet</h3>
                 <p className="text-[10px] text-gray-400 mt-1 mb-2 max-w-[150px]">
                   Drag and drop PDF or Excel
                 </p>
               </>
             )}
           </div>
           <p className="text-[10px] text-gray-400 px-1">
             Supported formats: PDF, Excel (.xlsx, .xls)
           </p>
        </div>

        {/* Right Column: Metadata Form */}
        <div className="lg:col-span-2 space-y-4">
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Fit Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                   Name of Fit
                </label>
                <div className="relative">
                  <Type size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input 
                    type="text"
                    name="fitName"
                    value={data.fitName}
                    onChange={handleInputChange}
                    placeholder="e.g. Base Size Fit - Rev 1"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded text-[#37352F] text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Specs Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                   Date of Specs
                </label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input 
                    type="date"
                    name="specsDate"
                    value={data.specsDate}
                    onChange={handleInputChange}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded text-[#37352F] text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Size Range */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                   Size Range Scope
                </label>
                <div className="relative">
                  <Ruler size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input 
                    type="text"
                    name="sizeRange"
                    value={data.sizeRange}
                    onChange={handleInputChange}
                    placeholder="e.g. XS - XXL (Full Grade)"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded text-[#37352F] text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
           </div>

           {/* Specs Description */}
           <div className="space-y-1.5">
             <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                Specs Description & Notes
             </label>
             <div className="relative">
                <Info size={14} className="absolute left-3 top-3 text-gray-400" />
                <textarea 
                  name="specsDescription"
                  value={data.specsDescription}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Enter detailed notes regarding measurements, tolerance, or specific fit adjustments required..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded text-[#37352F] text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                />
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};
