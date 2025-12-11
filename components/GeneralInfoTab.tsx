
import React, { useState, useCallback } from 'react';
import { Calendar, Hash, Truck, User, Info, Upload, Image as ImageIcon, FileText, X, Link, ChevronDown } from 'lucide-react';
import { ColorRow, POData, SizeGroup, Buyer } from '../types';
import { SizeGroupMatrixManager } from './SizeGroupMatrixManager';

interface GeneralInfoTabProps {
  colors: ColorRow[];
  setColors: (val: ColorRow[] | ((prev: ColorRow[]) => ColorRow[])) => void;
  formData: POData;
  setFormData: (val: POData | ((prev: POData) => POData)) => void;
  sizeGroups: SizeGroup[];
  onSizeGroupsChange: (groups: SizeGroup[]) => void;
  availableBuyers: Buyer[];
  styleImage: string | null;
  setStyleImage: (val: string | null) => void;
}

export const GeneralInfoTab: React.FC<GeneralInfoTabProps> = ({ 
  colors, setColors, formData, setFormData, sizeGroups, onSizeGroupsChange, availableBuyers,
  styleImage, setStyleImage
}) => {
  const [techPackFile, setTechPackFile] = useState<string | null>(null);

  // --- Handlers ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setStyleImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTechPackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setTechPackFile(e.target.files[0].name);
      }
  }

  // Wrapper simply passes changes up; Logic for colors/capacity is now in parent
  const handleGroupsChange = useCallback((newGroups: SizeGroup[]) => {
    onSizeGroupsChange(newGroups);
  }, [onSizeGroupsChange]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-10">
      
      {/* SECTION A: Metadata Form */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Info size={18} className="text-gray-400" />
          <h2 className="text-lg font-medium text-[#37352F]">Order Details</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-gray-50/50 p-6 rounded-xl border border-gray-100">
          
          {/* Buyer Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Buyer Name</label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-3 text-gray-400" />
              <select
                name="buyerName"
                value={formData.buyerName} 
                onChange={handleInputChange}
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded text-[#37352F] text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none"
              >
                <option value="" disabled>Select Buyer...</option>
                {availableBuyers.map(buyer => (
                  <option key={buyer.id} value={buyer.name}>{buyer.name}</option>
                ))}
              </select>
              <div className="absolute right-3 top-3 pointer-events-none">
                <ChevronDown size={14} className="text-gray-400" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Factory Ref</label>
            <input 
              type="text" 
              name="factoryRef"
              value={formData.factoryRef}
              onChange={handleInputChange}
              placeholder="e.g. FAC-2024-001"
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-[#37352F] text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Style Number</label>
            <input 
              type="text" 
              name="styleNumber"
              value={formData.styleNumber}
              onChange={handleInputChange}
              placeholder="e.g. SS24-DRESS-01"
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-[#37352F] text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Product ID</label>
            <div className="relative">
              <Hash size={14} className="absolute left-3 top-3 text-gray-400" />
              <input 
                type="text" 
                name="productID"
                value={formData.productID}
                onChange={handleInputChange}
                placeholder="Internal ID"
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded text-[#37352F] text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">PO Number</label>
            <input 
              type="text" 
              name="poNumber"
              value={formData.poNumber}
              onChange={handleInputChange}
              placeholder="PO-998877"
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-[#37352F] text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">PO Date</label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3 top-3 text-gray-400" />
              <input 
                type="date" 
                name="poDate"
                value={formData.poDate}
                onChange={handleInputChange}
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded text-[#37352F] text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ship Date</label>
             <div className="relative">
              <Calendar size={14} className="absolute left-3 top-3 text-gray-400" />
              <input 
                type="date" 
                name="shipDate"
                value={formData.shipDate}
                onChange={handleInputChange}
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded text-[#37352F] text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ship Mode</label>
            <div className="relative">
              <Truck size={14} className="absolute left-3 top-3 text-gray-400" />
              <select 
                name="shipMode"
                value={formData.shipMode}
                onChange={handleInputChange}
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded text-[#37352F] text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none transition-all"
              >
                <option value="Ocean">Ocean Freight</option>
                <option value="Air">Air Freight</option>
                <option value="Ground">Ground / Truck</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: Attachments (Style Image & Tech Pack) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
            <ImageIcon size={18} className="text-gray-400" />
            <h2 className="text-lg font-medium text-[#37352F]">Attachments</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Style Image Upload */}
            <div className="border border-dashed border-gray-300 rounded-lg p-3 flex flex-col items-center justify-center text-center bg-gray-50/50 hover:bg-gray-50 transition-colors relative min-h-[120px] group">
                <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {styleImage ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <img src={styleImage} alt="Style Preview" className="max-h-24 object-contain rounded-md shadow-sm" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                            <span className="text-white text-xs font-medium flex items-center gap-1">
                                <Upload size={14} /> Change Image
                            </span>
                        </div>
                         <button 
                            onClick={(e) => { e.preventDefault(); setStyleImage(null); }}
                            className="absolute top-0 right-0 p-1 bg-white rounded-full shadow-sm text-gray-500 hover:text-red-500 z-20"
                         >
                            <X size={14} />
                         </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400 pointer-events-none">
                        <div className="p-1.5 bg-white rounded-full shadow-sm">
                            <ImageIcon size={18} className="text-gray-300" />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium text-gray-600">Upload Style Image</p>
                            <p className="text-[10px] text-gray-400">PNG, JPG up to 5MB</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Tech Pack Upload */}
            <div className="border border-dashed border-gray-300 rounded-lg p-3 flex flex-col items-center justify-center text-center bg-gray-50/50 hover:bg-gray-50 transition-colors relative min-h-[120px]">
                 <input 
                    type="file" 
                    accept=".pdf,.doc,.docx"
                    onChange={handleTechPackUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                 {techPackFile ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-full shadow-sm">
                            <FileText size={18} />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium text-gray-700">{techPackFile}</p>
                            <p className="text-[10px] text-green-600 font-medium">Ready for upload</p>
                        </div>
                         <button 
                            onClick={(e) => { e.preventDefault(); setTechPackFile(null); }}
                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 z-20"
                         >
                            <X size={14} />
                         </button>
                    </div>
                 ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400 pointer-events-none">
                        <div className="p-1.5 bg-white rounded-full shadow-sm">
                            <FileText size={18} className="text-gray-300" />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium text-gray-600">Upload Tech Pack</p>
                            <p className="text-[10px] text-gray-400">PDF, Excel, Doc</p>
                        </div>
                    </div>
                 )}
            </div>
        </div>
      </div>

      {/* SECTION B: PO Breakdown Grid (Matrix Manager) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
           <Hash size={18} className="text-gray-400" />
           <h2 className="text-lg font-medium text-[#37352F]">PO Breakdown</h2>
        </div>
        
        {/* New Size Group Matrix Component - Fully Controlled */}
        <SizeGroupMatrixManager 
          groups={sizeGroups}
          onGroupsChange={handleGroupsChange}
        />

      </div>

    </div>
  );
}
