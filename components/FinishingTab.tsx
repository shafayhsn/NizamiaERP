
import React, { useState } from 'react';
import { Upload, X, Package, ClipboardCheck, AlertTriangle, FileText, Tag, Shirt, Box } from 'lucide-react';
import { FinishingData } from '../types';

interface FinishingTabProps {
  data: FinishingData;
  onUpdate: (data: FinishingData) => void;
}

export const FinishingTab: React.FC<FinishingTabProps> = ({ data, onUpdate }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onUpdate({ ...data, [name]: value });
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
      handleUploadPackagingSpec(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadPackagingSpec(e.target.files[0]);
    }
  };

  const handleUploadPackagingSpec = (file: File) => {
    // Simulate upload
    onUpdate({ ...data, packagingSpecSheetRef: file.name });
  };

  const removeFile = () => {
    onUpdate({ ...data, packagingSpecSheetRef: null });
  };

  const isCriticalStatus = data.finalInspectionStatus === 'Failed' || data.finalInspectionStatus === 'Rework';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-10">
      
      {/* SECTION 1: Presentation & Inspection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
           <ClipboardCheck size={18} className="text-gray-400" />
           <h2 className="text-lg font-medium text-[#37352F]">Presentation & Inspection</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           
           {/* Inspection Status */}
           <div className="space-y-1.5">
             <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Final Inspection Status</label>
             <div className="relative">
                <select 
                  name="finalInspectionStatus"
                  value={data.finalInspectionStatus}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:ring-blue-500 outline-none transition-colors appearance-none
                    ${data.finalInspectionStatus === 'Passed' ? 'bg-green-50 text-green-700 border-green-200' :
                      isCriticalStatus ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-white border-gray-200 text-[#37352F]'
                    }`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Passed">Passed</option>
                  <option value="Failed">Failed</option>
                  <option value="Rework">Rework Required</option>
                  <option value="Conditional">Conditional Approval</option>
                </select>
                {/* Status Indicator Icon inside select */}
                <div className="absolute right-3 top-2.5 pointer-events-none">
                  {data.finalInspectionStatus === 'Passed' && <ClipboardCheck size={14} className="text-green-600" />}
                  {isCriticalStatus && <AlertTriangle size={14} className="text-red-600" />}
                </div>
             </div>
             
             {isCriticalStatus && (
               <div className="flex items-start gap-2 mt-2 p-3 bg-red-50 border border-red-100 rounded-md animate-in slide-in-from-top-1">
                 <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
                 <p className="text-xs text-red-700 leading-relaxed">
                   <strong>Warning:</strong> Production cannot ship until this status is resolved. Please review QC reports immediately.
                 </p>
               </div>
             )}
           </div>

           {/* Approval Date */}
           <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Finishing Approval Date</label>
              <input 
                type="date"
                name="finishingApprovalDate"
                value={data.finishingApprovalDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-[#37352F] text-sm focus:ring-1 focus:ring-blue-500 outline-none"
              />
           </div>

           {/* Hand Feel */}
           <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                Hand Feel Standard
              </label>
              <input 
                type="text"
                name="handFeelStandard"
                value={data.handFeelStandard}
                onChange={handleInputChange}
                placeholder="e.g. Soft Silicone Wash, Dry Hand"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-[#37352F] text-sm focus:ring-1 focus:ring-blue-500 outline-none"
              />
           </div>

           {/* Pressing */}
           <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                 Pressing Instructions
                 <Shirt size={12} className="text-gray-400" />
              </label>
              <input 
                type="text"
                name="pressingInstructions"
                value={data.pressingInstructions}
                onChange={handleInputChange}
                placeholder="e.g. Steam Tunnel, Flat Press seams"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-[#37352F] text-sm focus:ring-1 focus:ring-blue-500 outline-none"
              />
           </div>

           {/* Tag Placement */}
           <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                 Tag & Label Placement
                 <Tag size={12} className="text-gray-400" />
              </label>
              <input 
                type="text"
                name="tagPlacement"
                value={data.tagPlacement}
                onChange={handleInputChange}
                placeholder="e.g. Main label center neck, Care label left side seam 10cm up"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-[#37352F] text-sm focus:ring-1 focus:ring-blue-500 outline-none"
              />
           </div>
        </div>
      </div>

      {/* SECTION 2: Packaging Specifications */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
           <Package size={18} className="text-gray-400" />
           <h2 className="text-lg font-medium text-[#37352F]">Packaging Specifications</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           
           {/* Left: Spec Upload */}
           <div className="lg:col-span-1 space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Packaging Guide / Spec</label>
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative border border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center transition-all min-h-[160px]
                  ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50/50 hover:bg-gray-50'}
                  ${data.packagingSpecSheetRef ? 'bg-white border-solid border-gray-200' : ''}
                `}
              >
                {data.packagingSpecSheetRef ? (
                  <div className="flex flex-col items-center gap-3 w-full animate-in zoom-in-95 duration-200">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shadow-sm">
                      <FileText size={20} />
                    </div>
                    <div className="space-y-0.5 max-w-full px-2">
                      <p className="text-sm font-medium text-gray-700 truncate break-all line-clamp-2">
                        {data.packagingSpecSheetRef}
                      </p>
                      <p className="text-[10px] text-green-600 font-medium">Uploaded</p>
                    </div>
                    <button 
                      onClick={removeFile}
                      className="px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors flex items-center gap-1"
                      title="Remove File"
                    >
                      <X size={12} /> Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <input 
                      type="file" 
                      accept=".pdf,image/*"
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center mb-2 text-gray-400">
                      <Upload size={16} />
                    </div>
                    <h3 className="text-sm font-medium text-gray-700">Upload Spec</h3>
                    <p className="text-[10px] text-gray-400 mt-1 mb-2 max-w-[150px]">
                      PDF or Image
                    </p>
                  </>
                )}
              </div>
           </div>

           {/* Right: Packaging Form */}
           <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Folding Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Folding / Packing Type</label>
                <select 
                  name="foldingType"
                  value={data.foldingType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded text-[#37352F] focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value="Flat Pack">Flat Pack</option>
                  <option value="Hanger Pack">Hanger Pack</option>
                  <option value="Roll Pack">Roll Pack</option>
                  <option value="Blister Pack">Blister Pack</option>
                  <option value="Boxed">Individual Box</option>
                </select>
              </div>

              {/* Assortment */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Assortment Method</label>
                <select 
                  name="assortmentMethod"
                  value={data.assortmentMethod}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded text-[#37352F] focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value="Solid Size / Solid Color">Solid Size / Solid Color</option>
                  <option value="Ratio Pack">Ratio Pack (e.g. 1:2:2:1)</option>
                  <option value="Mixed Color">Mixed Color</option>
                  <option value="Pre-Pack">Pre-Pack</option>
                </select>
              </div>

              {/* Polybag Spec */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Polybag Type & Size</label>
                <input 
                  type="text"
                  name="polybagSpec"
                  value={data.polybagSpec}
                  onChange={handleInputChange}
                  placeholder="e.g. Self-adhesive, Warning Text, 12x18 inch"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-[#37352F] text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Carton Markings */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                   Carton Markings
                   <Box size={12} className="text-gray-400" />
                </label>
                <input 
                  type="text"
                  name="cartonMarkings"
                  value={data.cartonMarkings}
                  onChange={handleInputChange}
                  placeholder="e.g. Side mark, Main mark details"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-[#37352F] text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Max Pieces */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Max Pieces Per Carton</label>
                <input 
                  type="number"
                  name="maxPiecesPerCarton"
                  value={data.maxPiecesPerCarton}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-[#37352F] text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

           </div>
        </div>
      </div>

    </div>
  );
};
