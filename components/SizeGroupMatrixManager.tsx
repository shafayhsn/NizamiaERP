
import React, { useState } from 'react';
import { Plus, Trash2, Layers, DollarSign, Settings, X } from 'lucide-react';
import { SizeGroup } from '../types';

interface SizeGroupMatrixManagerProps {
  groups: SizeGroup[];
  onGroupsChange: (groups: SizeGroup[]) => void;
}

// Updated to standard Waist Sizes for Denim
const PREDEFINED_SIZES = ['28', '29', '30', '31', '32', '33', '34', '36', '38', '40', '42', '44'];

export const SizeGroupMatrixManager: React.FC<SizeGroupMatrixManagerProps> = ({ 
  groups,
  onGroupsChange
}) => {
  
  const [managingSizesGroupId, setManagingSizesGroupId] = useState<string | null>(null);
  const [customSizeInput, setCustomSizeInput] = useState('');

  // --- Group Actions ---

  const addGroup = () => {
    const newGroup: SizeGroup = {
      id: `group-${Date.now()}`,
      groupName: 'New Size Group',
      unitPrice: '',
      currency: 'USD',
      sizes: ['30', '32', '34', '36'], // Default denim run
      colors: [{ id: `c-${Date.now()}`, name: 'New Color' }],
      breakdown: {}
    };
    onGroupsChange([...groups, newGroup]);
  };

  const removeGroup = (groupId: string) => {
    if (window.confirm("Are you sure you want to delete this size group?")) {
      onGroupsChange(groups.filter(g => g.id !== groupId));
    }
  };

  const updateGroupField = (groupId: string, field: keyof SizeGroup, value: string) => {
    onGroupsChange(groups.map(g => g.id === groupId ? { ...g, [field]: value } : g));
  };

  // --- Size Management ---

  const toggleSize = (groupId: string, size: string) => {
    const updated = groups.map(g => {
      if (g.id !== groupId) return g;
      const exists = g.sizes.includes(size);
      let newSizes;
      if (exists) {
        newSizes = g.sizes.filter(s => s !== size);
      } else {
        const combined = [...g.sizes, size];
        newSizes = combined.sort((a, b) => {
           // Try to sort numerically if possible for waist sizes
           const numA = parseInt(a);
           const numB = parseInt(b);
           if (!isNaN(numA) && !isNaN(numB)) return numA - numB;

           const idxA = PREDEFINED_SIZES.indexOf(a);
           const idxB = PREDEFINED_SIZES.indexOf(b);
           if (idxA !== -1 && idxB !== -1) return idxA - idxB;
           if (idxA !== -1) return -1;
           if (idxB !== -1) return 1;
           return 0;
        });
      }
      return { ...g, sizes: newSizes };
    });
    onGroupsChange(updated);
  };

  const removeSize = (groupId: string, size: string) => {
    const updated = groups.map(g => {
      if (g.id !== groupId) return g;
      return { ...g, sizes: g.sizes.filter(s => s !== size) };
    });
    onGroupsChange(updated);
  };

  const addCustomSize = (groupId: string) => {
    if (!customSizeInput.trim()) return;
    const updated = groups.map(g => {
        if (g.id !== groupId) return g;
        if (g.sizes.includes(customSizeInput.trim())) return g;
        return { ...g, sizes: [...g.sizes, customSizeInput.trim()] };
    });
    onGroupsChange(updated);
    setCustomSizeInput('');
  };

  // --- Matrix Manipulation ---

  const addColorToGroup = (groupId: string) => {
    const updated = groups.map(g => {
      if (g.id !== groupId) return g;
      const newColorId = `c-${Math.random().toString(36).substr(2, 9)}`;
      return { 
        ...g, 
        colors: [...g.colors, { id: newColorId, name: 'New Color' }] 
      };
    });
    onGroupsChange(updated);
  };

  const updateColorName = (groupId: string, colorId: string, name: string) => {
    const updated = groups.map(g => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        colors: g.colors.map(c => c.id === colorId ? { ...c, name } : c)
      };
    });
    onGroupsChange(updated);
  };

  const removeColor = (groupId: string, colorId: string) => {
    const updated = groups.map(g => {
      if (g.id !== groupId) return g;
      const newBreakdown = { ...g.breakdown };
      delete newBreakdown[colorId];
      return {
        ...g,
        colors: g.colors.filter(c => c.id !== colorId),
        breakdown: newBreakdown
      };
    });
    onGroupsChange(updated);
  };

  const updateQty = (groupId: string, colorId: string, size: string, value: string) => {
    const updated = groups.map(g => {
      if (g.id !== groupId) return g;
      
      const prevRow = g.breakdown[colorId] || {};
      return {
        ...g,
        breakdown: {
          ...g.breakdown,
          [colorId]: {
            ...prevRow,
            [size]: value
          }
        }
      };
    });
    onGroupsChange(updated);
  };

  // --- Calculations ---

  const getGroupTotalQty = (group: SizeGroup) => {
    let total = 0;
    Object.values(group.breakdown).forEach(row => {
      Object.values(row).forEach(qty => {
        total += (Number(qty) || 0);
      });
    });
    return total;
  };

  const getGroupTotalValue = (group: SizeGroup) => {
    const qty = getGroupTotalQty(group);
    const price = parseFloat(group.unitPrice) || 0;
    return qty * price;
  };

  return (
    <div className="space-y-8">
      {groups.length === 0 && (
         <div className="text-center p-8 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 text-sm mb-2">No size groups defined for this order.</p>
            <p className="text-xs text-gray-400">Add a group to start entering quantities.</p>
         </div>
      )}

      {groups.map((group, index) => (
        <div key={group.id} className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* Group Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <div className="flex items-center gap-3 flex-1">
               <Layers size={18} className="text-gray-400" />
               <input 
                 type="text" 
                 value={group.groupName}
                 onChange={(e) => updateGroupField(group.id, 'groupName', e.target.value)}
                 className="bg-transparent border-b border-dashed border-gray-300 hover:border-blue-400 focus:border-blue-600 focus:ring-0 outline-none font-semibold text-[#37352F] text-base px-1 py-0.5 min-w-[150px]"
                 placeholder="Group Name (e.g. Adults)"
               />
               <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap">Group {index + 1}</span>
             </div>

             <div className="flex items-center gap-4">
               {/* Unit Price Field */}
               <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded border border-gray-200 shadow-sm focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
                  <span className="text-xs font-medium text-gray-500 uppercase">Unit Price</span>
                  <div className="h-4 w-px bg-gray-200"></div>
                  <DollarSign size={14} className="text-gray-400" />
                  <input 
                    type="number"
                    min="0"
                    step="0.01"
                    value={group.unitPrice}
                    onChange={(e) => updateGroupField(group.id, 'unitPrice', e.target.value)}
                    className="w-20 outline-none text-sm font-semibold text-[#37352F] placeholder:font-normal"
                    placeholder="0.00"
                  />
                  <span className="text-xs text-gray-400">USD</span>
               </div>

               <button 
                 onClick={() => removeGroup(group.id)}
                 className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded transition-colors"
                 title="Delete Group"
               >
                 <Trash2 size={16} />
               </button>
             </div>
          </div>

          {/* Controls Toolbar */}
          <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between bg-white relative z-10">
            <div className="flex gap-2">
              <button 
                onClick={() => addColorToGroup(group.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded shadow-sm transition-all"
              >
                <Plus size={14} /> Add Color
              </button>
              <button 
                onClick={() => setManagingSizesGroupId(managingSizesGroupId === group.id ? null : group.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded shadow-sm transition-all
                  ${managingSizesGroupId === group.id 
                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                    : 'text-gray-700 bg-white hover:bg-gray-50 border-gray-200'}`}
              >
                <Settings size={14} /> Manage Sizes
              </button>
            </div>
            
            {/* Live Totals */}
            <div className="flex gap-4 text-xs">
               <span className="text-gray-500">Total Qty: <strong className="text-gray-800">{getGroupTotalQty(group).toLocaleString()}</strong></span>
               <span className="text-gray-500">Total Value: <strong className="text-gray-800">${getGroupTotalValue(group).toLocaleString()}</strong></span>
            </div>
          </div>

          {/* Size Management Panel (Expandable) */}
          {managingSizesGroupId === group.id && (
            <div className="bg-gray-50 border-b border-gray-200 p-4 animate-in slide-in-from-top-2">
               <div className="flex items-center justify-between mb-3">
                 <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wide">Configure Sizes</h4>
                 <button onClick={() => setManagingSizesGroupId(null)} className="text-gray-400 hover:text-gray-600"><X size={14}/></button>
               </div>
               
               {/* Active Sizes List - Delete Enabled */}
               <div className="mb-4">
                  <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wide mb-2 block">Active Sizes</span>
                  <div className="flex flex-wrap gap-2">
                    {group.sizes.map(size => (
                      <div key={size} className="flex items-center gap-1 bg-white border border-gray-300 rounded px-2 py-1 shadow-sm group/tag">
                        <span className="text-xs font-medium text-gray-700">{size}</span>
                        <button 
                          onClick={() => removeSize(group.id, size)}
                          className="text-gray-400 hover:text-red-500 transition-colors ml-1 p-0.5 rounded-full hover:bg-red-50"
                          title={`Remove ${size}`}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {group.sizes.length === 0 && <span className="text-xs text-gray-400 italic">No sizes active. Add standard or custom sizes below.</span>}
                  </div>
               </div>

               <hr className="border-gray-200 mb-4" />
               
               {/* Preset Sizes */}
               <h5 className="text-[10px] font-bold uppercase text-gray-400 tracking-wide mb-2">Quick Add Presets (Waist)</h5>
               <div className="flex flex-wrap gap-2 mb-4">
                  {PREDEFINED_SIZES.map(size => {
                    const isSelected = group.sizes.includes(size);
                    return (
                      <button
                        key={size}
                        onClick={() => toggleSize(group.id, size)}
                        className={`px-3 py-1.5 text-xs font-medium rounded border transition-all
                          ${isSelected 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                      >
                        {size}
                      </button>
                    );
                  })}
               </div>

               {/* Custom Size Input */}
               <h5 className="text-[10px] font-bold uppercase text-gray-400 tracking-wide mb-2">Add Custom Size</h5>
               <div className="flex items-center gap-2 max-w-xs">
                  <input 
                    type="text" 
                    value={customSizeInput}
                    onChange={(e) => setCustomSizeInput(e.target.value)}
                    placeholder="e.g. 33L, 34W"
                    className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded focus:border-blue-500 outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && addCustomSize(group.id)}
                  />
                  <button 
                    onClick={() => addCustomSize(group.id)}
                    className="px-3 py-1.5 text-xs font-medium bg-gray-800 text-white rounded hover:bg-black transition-colors"
                  >
                    Add
                  </button>
               </div>
            </div>
          )}

          {/* The Matrix */}
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm border-collapse min-w-max">
              <thead>
                <tr className="bg-[#F7F7F5] border-b border-gray-200 text-xs text-gray-500 uppercase">
                  <th className="p-3 border-r border-gray-200 sticky left-0 bg-[#F7F7F5] z-10 w-48 text-left font-semibold">
                    Color Name
                  </th>
                  {group.sizes.length > 0 ? (
                    group.sizes.map(size => (
                      <th key={size} className="p-2 border-r border-gray-200 text-center font-semibold min-w-[80px]">
                        {size}
                      </th>
                    ))
                  ) : (
                     <th className="p-4 text-center text-gray-400 font-normal italic bg-white">
                        No sizes selected. Click "Manage Sizes" to configure.
                     </th>
                  )}
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {group.colors.map(color => (
                  <tr key={color.id} className="group hover:bg-gray-50">
                    <td className="p-2 border-r border-gray-200 sticky left-0 bg-white group-hover:bg-gray-50 z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-200 border border-gray-300"></div>
                        <input 
                          type="text" 
                          value={color.name}
                          onChange={(e) => updateColorName(group.id, color.id, e.target.value)}
                          className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-0 outline-none px-1 py-1 font-medium text-[#37352F]"
                          placeholder="Color Name"
                        />
                      </div>
                    </td>
                    
                    {group.sizes.map(size => {
                      const qty = group.breakdown[color.id]?.[size] || '';
                      return (
                        <td key={`${color.id}-${size}`} className="p-1 border-r border-gray-200">
                          <input 
                            type="number" 
                            min="0"
                            value={qty}
                            onChange={(e) => updateQty(group.id, color.id, size, e.target.value)}
                            className="w-full text-center bg-transparent rounded hover:bg-white focus:bg-white border border-transparent hover:border-gray-200 focus:border-blue-500 outline-none py-1.5 text-gray-700 font-medium"
                            placeholder="-"
                          />
                        </td>
                      );
                    })}

                    {group.sizes.length === 0 && <td className="bg-gray-50/50"></td>}

                    <td className="p-2 text-center">
                       <button 
                        onClick={() => removeColor(group.id, color.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {group.colors.length === 0 && (
                   <tr>
                     <td colSpan={group.sizes.length + 2} className="p-8 text-center text-gray-400 text-sm">
                       No colors added. Click "Add Color" to start.
                     </td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Add Group Button */}
      <button 
        onClick={addGroup}
        className="w-full py-4 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-medium"
      >
        <Plus size={18} /> Add New Size Group
      </button>

    </div>
  );
};
