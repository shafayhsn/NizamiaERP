
import React, { useState, useMemo } from 'react';
import { 
  Plus, Trash2, Settings, X, ChevronDown, AlertCircle, Calculator, 
  FlaskConical, Layers, Search, Filter, CheckSquare, Square, Copy,
  ArrowRight, GripVertical, Printer, FileText
} from 'lucide-react';
import { SizeGroup, BOMItem, Supplier, MasterBOMItem } from '../types';

interface OrderBreakdownData {
  totalPOQuantity: number;
  colorQuantities: Record<string, number>;
  sizeQuantities: Record<string, number>;
}

interface BOMTabProps {
  orderBreakdownData: OrderBreakdownData;
  sizeGroups: SizeGroup[];
  data: BOMItem[];
  onUpdate: (data: BOMItem[]) => void;
  availableSuppliers: Supplier[];
  bomStatus: 'Draft' | 'Released';
  onReleaseBOM: () => void;
  masterItems: MasterBOMItem[];
}

// --- BULK ADD MODAL ---
const BulkItemSelectorModal = ({ 
  isOpen, 
  onClose, 
  masterItems, 
  group, 
  onConfirm 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  masterItems: MasterBOMItem[]; 
  group: string; 
  onConfirm: (items: MasterBOMItem[]) => void; 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBuyer, setFilterBuyer] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter Logic
  const filteredItems = useMemo(() => {
    return masterItems.filter(item => {
      // Type Check: Fabric section only gets Fabric, everything else gets Trims
      const isFabricSection = group === 'Fabric';
      const isFabricItem = item.type === 'Fabric';
      
      if (isFabricSection && !isFabricItem) return false;
      if (!isFabricSection && isFabricItem) return false;

      // Search
      const s = searchTerm.toLowerCase();
      const matchesSearch = 
        (item.itemName || '').toLowerCase().includes(s) || 
        (item.category || '').toLowerCase().includes(s) ||
        (item.supplier || '').toLowerCase().includes(s) ||
        (item.code || '').toLowerCase().includes(s) ||
        (item.brand || '').toLowerCase().includes(s);

      // Category Filter
      const matchesCategory = filterCategory === 'All' || item.category === filterCategory;

      // Buyer/Brand Filter
      const matchesBuyer = filterBuyer === 'All' || item.brand === filterBuyer;

      return matchesSearch && matchesCategory && matchesBuyer;
    });
  }, [masterItems, group, searchTerm, filterCategory, filterBuyer]);

  // Derive unique options based on current group type (Fabric vs Trim)
  const availableCategories = useMemo(() => {
      const typeFiltered = masterItems.filter(i => group === 'Fabric' ? i.type === 'Fabric' : i.type !== 'Fabric');
      return Array.from(new Set(typeFiltered.map(i => i.category))).sort();
  }, [masterItems, group]);

  const availableBuyers = useMemo(() => {
      const typeFiltered = masterItems.filter(i => group === 'Fabric' ? i.type === 'Fabric' : i.type !== 'Fabric');
      return Array.from(new Set(typeFiltered.map(i => i.brand))).sort();
  }, [masterItems, group]);

  // Handlers
  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleConfirm = () => {
    const selected = masterItems.filter(i => selectedIds.has(i.id));
    onConfirm(selected);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
       <div className="bg-white w-full max-w-4xl h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
             <div>
                <h2 className="text-lg font-bold text-[#37352F]">
                    Bulk Add {group === 'Fabric' ? 'Fabrics' : 'Trims'}
                    <span className="text-gray-400 font-normal ml-2 text-sm">to {group}</span>
                </h2>
                <p className="text-xs text-gray-500">Select items from the Master Library to import.</p>
             </div>
             <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-200 rounded-full"><X size={20}/></button>
          </div>

          {/* Toolbar */}
          <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 bg-white">
             <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search by name, code, or supplier..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
             </div>
             <div className="flex gap-2">
                <select 
                  value={filterCategory} 
                  onChange={e => setFilterCategory(e.target.value)}
                  className="border rounded px-3 py-2 text-sm outline-none bg-white min-w-[150px]"
                >
                    <option value="All">All Categories</option>
                    {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select 
                  value={filterBuyer} 
                  onChange={e => setFilterBuyer(e.target.value)}
                  className="border rounded px-3 py-2 text-sm outline-none bg-white min-w-[150px]"
                >
                    <option value="All">All Buyers/Brands</option>
                    {availableBuyers.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
             </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto p-0 bg-gray-50/30">
             <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-gray-100 text-xs font-bold text-gray-500 uppercase sticky top-0 z-10 shadow-sm">
                   <tr>
                      <th className="px-4 py-3 w-12 text-center bg-gray-100">
                         <input 
                           type="checkbox" 
                           onChange={(e) => {
                              if (e.target.checked) setSelectedIds(new Set(filteredItems.map(i => i.id)));
                              else setSelectedIds(new Set());
                           }}
                           checked={filteredItems.length > 0 && selectedIds.size === filteredItems.length}
                           className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                         />
                      </th>
                      <th className="px-4 py-3 bg-gray-100">Item Name / Details</th>
                      <th className="px-4 py-3 bg-gray-100">Category</th>
                      <th className="px-4 py-3 bg-gray-100">Supplier</th>
                      <th className="px-4 py-3 bg-gray-100">Code</th>
                      <th className="px-4 py-3 text-right bg-gray-100">Price</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                   {filteredItems.map(item => (
                      <tr 
                        key={item.id} 
                        className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedIds.has(item.id) ? 'bg-blue-50' : ''}`} 
                        onClick={() => toggleSelection(item.id)}
                      >
                         <td className="px-4 py-3 text-center">
                            <input 
                                type="checkbox" 
                                checked={selectedIds.has(item.id)} 
                                readOnly 
                                className="pointer-events-none rounded border-gray-300 text-blue-600" 
                            />
                         </td>
                         <td className="px-4 py-3 font-medium text-gray-800">
                            {item.type === 'Fabric' ? `${item.construction} - ${item.content}` : item.itemName}
                            {item.isNominated && (
                                <span className="ml-2 text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded border border-green-200 font-bold uppercase">
                                    Nominated
                                </span>
                            )}
                         </td>
                         <td className="px-4 py-3 text-gray-600">{item.category}</td>
                         <td className="px-4 py-3 text-blue-600">{item.supplier}</td>
                         <td className="px-4 py-3 font-mono text-xs text-gray-500">{item.code}</td>
                         <td className="px-4 py-3 text-right font-mono">{item.price}</td>
                      </tr>
                   ))}
                   {filteredItems.length === 0 && (
                       <tr><td colSpan={6} className="p-10 text-center text-gray-400 italic">No items match your filters.</td></tr>
                   )}
                </tbody>
             </table>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-between items-center shadow-lg z-20">
             <div className="text-sm text-gray-600">
                <span className="font-bold text-gray-900">{selectedIds.size}</span> items selected
             </div>
             <div className="flex gap-3">
                <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">Cancel</button>
                <button 
                    onClick={handleConfirm} 
                    disabled={selectedIds.size === 0}
                    className="px-6 py-2 bg-[#37352F] text-white text-sm font-medium rounded hover:bg-black shadow-sm disabled:opacity-50 transition-colors"
                >
                    Add Selected Items
                </button>
             </div>
          </div>
       </div>
    </div>
  );
};

export const BOMTab: React.FC<BOMTabProps> = ({ 
  orderBreakdownData, sizeGroups, data, onUpdate, availableSuppliers,
  bomStatus, onReleaseBOM, masterItems
}) => {
  // State for Matrix Editor Modal - Storing ID instead of full object to sync updates
  const [activeMatrixItemId, setActiveMatrixItemId] = useState<string | null>(null);
  
  // Custom Configuration State
  const [selectedSizesForGroup, setSelectedSizesForGroup] = useState<Set<string>>(new Set());

  // State for Bulk Add Modal
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkModalGroup, setBulkModalGroup] = useState<BOMItem['processGroup']>('Fabric');

  // Derived Active Item
  const activeItem = useMemo(() => {
      return data.find(i => i.id === activeMatrixItemId) || null;
  }, [data, activeMatrixItemId]);

  // --- Actions ---

  const addItem = (group: BOMItem['processGroup']) => {
    const newItem: BOMItem = {
      id: Math.random().toString(36).substr(2, 9),
      processGroup: group,
      componentName: '',
      supplierRef: '',
      vendor: '',
      sourcingStatus: 'Pending',
      leadTimeDays: 0,
      usageRule: 'Generic',
      usageData: { 'generic': 0 },
      wastagePercent: 3,
      isTestingRequired: false
    };
    onUpdate([...data, newItem]);
  };

  const removeItem = (id: string) => {
    onUpdate(data.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof BOMItem, value: any) => {
    onUpdate(data.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  // Safe update for usageData specifically to preserve keys
  const updateUsageData = (id: string, key: string, value: number) => {
      const item = data.find(i => i.id === id);
      if (!item) return;
      
      const newUsageData = { ...item.usageData, [key]: value };
      updateItem(id, 'usageData', newUsageData);
  };

  const handleMasterItemSelect = (id: string, masterId: string) => {
    const selectedMaster = masterItems.find(m => m.id === masterId);
    if (!selectedMaster) return;

    onUpdate(data.map(i => {
      if (i.id !== id) return i;
      return {
        ...i,
        componentName: selectedMaster.type === 'Fabric' 
           ? `${selectedMaster.category} - ${selectedMaster.construction}` 
           : selectedMaster.itemName || selectedMaster.category || '',
        supplierRef: selectedMaster.code || '',
        vendor: selectedMaster.supplier || '',
      };
    }));
  };

  // --- Bulk Add Handlers ---

  const openBulkModal = (group: BOMItem['processGroup']) => {
      setBulkModalGroup(group);
      setIsBulkModalOpen(true);
  };

  const handleBulkConfirm = (selectedItems: MasterBOMItem[]) => {
      const newItems: BOMItem[] = selectedItems.map(m => ({
          id: Math.random().toString(36).substr(2, 9),
          processGroup: bulkModalGroup,
          componentName: m.type === 'Fabric' 
             ? `${m.category} - ${m.construction}` 
             : m.itemName || m.category || '',
          supplierRef: m.code || '',
          vendor: m.supplier || '',
          sourcingStatus: 'Pending',
          leadTimeDays: 0,
          usageRule: 'Generic',
          usageData: { 'generic': 0 },
          wastagePercent: 3,
          isTestingRequired: false
      }));

      onUpdate([...data, ...newItems]);
      setIsBulkModalOpen(false);
  };

  // --- Calculations ---

  const getAllSizes = () => {
      const sizes = new Set<string>();
      sizeGroups.forEach(g => g.sizes.forEach(s => sizes.add(s)));
      return Array.from(sizes).sort((a,b) => {
          const numA = parseInt(a);
          const numB = parseInt(b);
          if(!isNaN(numA) && !isNaN(numB)) return numA - numB;
          return a.localeCompare(b);
      });
  };

  const calculateRequiredQty = (item: BOMItem) => {
    let baseQty = 0;
    
    if (item.usageRule === 'Generic') {
      baseQty = (item.usageData['generic'] || 0) * orderBreakdownData.totalPOQuantity;
    } 
    else if (item.usageRule === 'By Color/Wash') {
      Object.entries(item.usageData).forEach(([colorName, consump]) => {
        const qty = orderBreakdownData.colorQuantities[colorName] || 0;
        baseQty += qty * consump;
      });
    } 
    else if (item.usageRule === 'By Size Group') {
      Object.entries(item.usageData).forEach(([sizeGroup, consump]) => {
        const group = sizeGroups.find(g => g.groupName === sizeGroup);
        if (group) {
           let groupTotal = 0;
           Object.values(group.breakdown).forEach(row => {
              Object.values(row).forEach(q => groupTotal += (Number(q) || 0));
           });
           baseQty += groupTotal * consump;
        }
      });
    }
    else if (item.usageRule === 'By Individual Sizes') {
        Object.entries(item.usageData).forEach(([size, consump]) => {
            const qty = orderBreakdownData.sizeQuantities[size] || 0;
            baseQty += qty * consump;
        });
    }
    else if (item.usageRule === 'Configure your own') {
        // usageData keys are comma separated size strings e.g., "32, 34"
        Object.entries(item.usageData).forEach(([sizeKey, consump]) => {
            const sizesInGroup = sizeKey.split(',').map(s => s.trim());
            let groupQty = 0;
            sizesInGroup.forEach(s => {
                groupQty += (orderBreakdownData.sizeQuantities[s] || 0);
            });
            baseQty += groupQty * consump;
        });
    }
    
    // Add Wastage
    return baseQty * (1 + (item.wastagePercent / 100));
  };

  // Custom Grouping Logic
  const handleCreateCustomGroup = () => {
      if (!activeItem || selectedSizesForGroup.size === 0) return;
      const key = Array.from(selectedSizesForGroup).sort().join(', ');
      
      // Update item with new key
      updateUsageData(activeItem.id, key, 0);
      
      // Clear selection
      setSelectedSizesForGroup(new Set());
  };

  const toggleSizeSelection = (size: string) => {
      const newSet = new Set(selectedSizesForGroup);
      if (newSet.has(size)) newSet.delete(size);
      else newSet.add(size);
      setSelectedSizesForGroup(newSet);
  };

  const handleGenerateMaterialSummary = () => {
    const printWindow = window.open('', '_blank', 'width=1100,height=800');
    if (!printWindow) return;

    const groups = ['Fabric', 'Stitching Trims', 'Packing Trims', 'Misc Trims'];
    const dateStr = new Date().toLocaleDateString();

    const generateTableForGroup = (group: string) => {
      const items = data.filter(d => d.processGroup === group);
      if (items.length === 0) return '';

      return `
        <div class="mb-6 break-inside-avoid">
          <div class="bg-gray-100 p-2 font-bold text-sm uppercase mb-2 border-b-2 border-black">${group}</div>
          <table class="w-full text-xs border-collapse">
            <thead>
              <tr class="bg-gray-50 border-b border-black">
                <th class="p-2 text-left w-1/4">Item / Component</th>
                <th class="p-2 text-left w-1/6">Supplier & Ref</th>
                <th class="p-2 text-center w-24">Usage Rule</th>
                <th class="p-2 text-left">Consumption Breakdown <span class="font-normal text-gray-500">(Consump → Req Qty)</span></th>
                <th class="p-2 text-center w-16">Wst %</th>
                <th class="p-2 text-right w-24">Total Req</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => {
                const wastageMultiplier = 1 + (item.wastagePercent / 100);
                
                // Detailed Breakdown String with Calculated Quantities
                let breakdownStr = '';
                
                if (item.usageRule === 'Generic') {
                  const val = item.usageData['generic'] || 0;
                  const totalReq = val * orderBreakdownData.totalPOQuantity * wastageMultiplier;
                  breakdownStr = `
                    <div class="flex justify-between items-center text-[11px]">
                        <span><span class="font-mono font-bold">${val}</span> / pc</span>
                        <span class="text-gray-500 font-mono text-[10px] bg-gray-50 px-1 rounded">Avg Req: ${Math.ceil(totalReq).toLocaleString()}</span>
                    </div>`;
                } else {
                  // Format non-generic usage as separate rows with calculations
                  breakdownStr = Object.entries(item.usageData)
                    .map(([key, val]) => {
                        // Calculate Applicable Quantity based on Rule
                        let applicableOrderQty = 0;
                        
                        if (item.usageRule === 'By Color/Wash') {
                             applicableOrderQty = orderBreakdownData.colorQuantities[key] || 0;
                        } else if (item.usageRule === 'By Size Group') {
                             const groupObj = sizeGroups.find(g => g.groupName === key);
                             if (groupObj) {
                                 Object.values(groupObj.breakdown).forEach(row => {
                                    Object.values(row).forEach(q => applicableOrderQty += (Number(q) || 0));
                                 });
                             }
                        } else if (item.usageRule === 'By Individual Sizes') {
                             applicableOrderQty = orderBreakdownData.sizeQuantities[key] || 0;
                        } else if (item.usageRule === 'Configure your own') {
                             const sizesInGroup = key.split(',').map(s => s.trim());
                             sizesInGroup.forEach(s => {
                                 applicableOrderQty += (orderBreakdownData.sizeQuantities[s] || 0);
                             });
                        }

                        // Fix: Ensure val is treated as number for arithmetic
                        const lineReq = (applicableOrderQty * (val as number)) * wastageMultiplier;

                        return `
                          <div class="flex justify-between border-b border-dashed border-gray-200 py-1 last:border-0 text-[11px]">
                            <span class="mr-2">
                                <span class="text-gray-600 mr-1">${key}:</span> 
                                <span class="font-mono font-bold text-black">${val}</span>
                            </span> 
                            <span class="font-mono text-gray-600 text-[10px] bg-gray-50 px-1 rounded">
                                ${Math.ceil(lineReq).toLocaleString()}
                            </span>
                          </div>`;
                    })
                    .join('');
                }

                return `
                  <tr class="border-b border-gray-200">
                    <td class="p-2 align-top font-medium">${item.componentName || '-'}</td>
                    <td class="p-2 align-top text-gray-600">${item.vendor}<br/><span class="text-[10px]">${item.supplierRef}</span></td>
                    <td class="p-2 align-top text-center text-[10px] uppercase text-gray-500">${item.usageRule.replace('By ', '')}</td>
                    <td class="p-2 align-top text-gray-700">${breakdownStr}</td>
                    <td class="p-2 align-top text-center">${item.wastagePercent}%</td>
                    <td class="p-2 align-top text-right font-bold">${Math.ceil(calculateRequiredQty(item)).toLocaleString()}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    };

    const content = groups.map(generateTableForGroup).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Material Requirement Summary</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @media print {
            body { font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 2rem; }
            .break-inside-avoid { break-inside: avoid; }
          }
          body { font-family: 'Inter', sans-serif; padding: 2rem; color: #111; }
        </style>
      </head>
      <body>
        <div class="mb-8 border-b-2 border-black pb-4 flex justify-between items-end">
           <div>
              <h1 class="text-2xl font-bold uppercase tracking-wide">Material Requirement Summary</h1>
              <p class="text-sm text-gray-500">Checkpoint Report - Bill of Materials</p>
           </div>
           <div class="text-right text-xs">
              <p class="font-bold">Printed: ${dateStr}</p>
              <p>Nizamia Apparels</p>
           </div>
        </div>

        <div class="grid grid-cols-4 gap-4 mb-8 bg-gray-50 p-4 rounded border border-gray-200 text-sm">
           <div>
              <span class="block text-gray-500 text-xs uppercase font-bold">Total Order Qty</span>
              <span class="font-mono text-lg font-bold">${orderBreakdownData.totalPOQuantity.toLocaleString()} pcs</span>
           </div>
           <div>
              <span class="block text-gray-500 text-xs uppercase font-bold">Size Range</span>
              <span class="font-mono">${sizeGroups.length > 0 ? sizeGroups.map(g => g.groupName).join(', ') : '-'}</span>
           </div>
           <div>
              <span class="block text-gray-500 text-xs uppercase font-bold">Colorways</span>
              <span class="font-mono">${Object.keys(orderBreakdownData.colorQuantities).length}</span>
           </div>
           <div>
              <span class="block text-gray-500 text-xs uppercase font-bold">Items Count</span>
              <span class="font-mono">${data.length}</span>
           </div>
        </div>

        ${content}

        <div class="mt-12 pt-8 border-t border-gray-300 flex justify-between text-xs text-gray-500">
           <div class="text-center w-48">
              <div class="border-b border-black mb-2 h-8"></div>
              <p class="font-bold text-black uppercase">Merchandiser</p>
           </div>
           <div class="text-center w-48">
              <div class="border-b border-black mb-2 h-8"></div>
              <p class="font-bold text-black uppercase">Production Manager</p>
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

  const groups = ['Fabric', 'Stitching Trims', 'Packing Trims', 'Misc Trims'] as const;
  const allSizesList = getAllSizes();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-10 relative">
      
      {groups.map(group => {
        const items = data.filter(d => d.processGroup === group);
        
        return (
          <div key={group} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {/* Group Header */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                 {group === 'Fabric' ? <Layers size={18} className="text-gray-500" /> : <Settings size={18} className="text-gray-500" />}
                 <h3 className="font-bold text-[#37352F] text-sm uppercase tracking-wide">{group}</h3>
                 <span className="bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-bold">{items.length}</span>
              </div>
              <div className="flex gap-2">
                 <button 
                    onClick={() => openBulkModal(group)}
                    className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded transition-colors border border-blue-100"
                 >
                    <Copy size={14} /> Bulk Add
                 </button>
                 <button 
                    onClick={() => addItem(group)}
                    className="flex items-center gap-1 text-xs font-medium text-[#37352F] bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded transition-colors"
                 >
                    <Plus size={14} /> Add Item
                 </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse min-w-[1000px]">
                <thead className="bg-white text-xs text-gray-500 uppercase font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 w-[25%]">Item / Component</th>
                    <th className="px-4 py-3 w-[20%]">Supplier & Ref</th>
                    <th className="px-4 py-3 w-[20%]">Consumption</th>
                    <th className="px-4 py-3 w-[10%] text-center">Wst %</th>
                    <th className="px-4 py-3 w-[10%] text-right bg-gray-50">Total Req</th>
                    <th className="px-4 py-3 w-[5%] text-center">Test</th>
                    <th className="px-4 py-3 w-[5%] text-center">Status</th>
                    <th className="px-4 py-3 w-[5%]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.map(item => (
                    <tr key={item.id} className="group hover:bg-gray-50 transition-colors">
                      
                      {/* Item Name (Auto-Complete) */}
                      <td className="px-4 py-2 align-top">
                        <input 
                          list={`master-list-${group}`}
                          type="text" 
                          value={item.componentName}
                          onChange={(e) => {
                             updateItem(item.id, 'componentName', e.target.value);
                             // Attempt to match master data by exact name
                             const match = masterItems.find(m => (m.type === 'Fabric' ? `${m.category} - ${m.construction}` : m.itemName) === e.target.value);
                             if (match) handleMasterItemSelect(item.id, match.id);
                          }}
                          placeholder="Search Master Item..."
                          className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-gray-200 focus:border-blue-500 rounded outline-none font-medium text-[#37352F] transition-all"
                        />
                        <datalist id={`master-list-${group}`}>
                           {masterItems
                              .filter(m => (group === 'Fabric' ? m.type === 'Fabric' : m.type === 'Trim'))
                              .map(m => (
                                 <option key={m.id} value={m.type === 'Fabric' ? `${m.category} - ${m.construction}` : m.itemName} />
                           ))}
                        </datalist>
                      </td>

                      {/* Supplier & Ref */}
                      <td className="px-4 py-2 align-top">
                         <div className="flex flex-col gap-1">
                            <select 
                               value={item.vendor}
                               onChange={(e) => updateItem(item.id, 'vendor', e.target.value)}
                               className="text-xs w-full bg-transparent outline-none text-blue-600 font-medium cursor-pointer hover:bg-gray-100 rounded px-1"
                            >
                               <option value="">Select Vendor...</option>
                               {availableSuppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                            </select>
                            <input 
                               type="text" 
                               value={item.supplierRef}
                               onChange={(e) => updateItem(item.id, 'supplierRef', e.target.value)}
                               placeholder="Ref Code"
                               className="text-xs w-full bg-transparent border-none p-0 px-1 text-gray-500 placeholder:text-gray-300 focus:ring-0"
                            />
                         </div>
                      </td>

                      {/* Consumption Logic */}
                      <td className="px-4 py-2 align-top">
                         <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                               <select 
                                  value={item.usageRule}
                                  onChange={(e) => updateItem(item.id, 'usageRule', e.target.value)}
                                  className="text-[10px] uppercase font-bold text-gray-500 bg-gray-100 rounded px-1 py-0.5 border border-transparent hover:border-gray-300 cursor-pointer outline-none w-full"
                               >
                                  <option value="Generic">Generic</option>
                                  <option value="By Color/Wash">By Colour</option>
                                  <option value="By Size Group">By Size Group</option>
                                  <option value="By Individual Sizes">By Individual Sizes</option>
                                  <option value="Configure your own">Configure your own</option>
                               </select>
                            </div>
                            
                            {item.usageRule === 'Generic' ? (
                               <div className="relative">
                                  <input 
                                    type="number" 
                                    step="0.01"
                                    value={item.usageData['generic'] || ''} // Handle empty vs 0
                                    onChange={(e) => updateUsageData(item.id, 'generic', parseFloat(e.target.value))}
                                    className="w-full border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-blue-500 font-mono"
                                  />
                                  <span className="absolute right-2 top-1.5 text-xs text-gray-400">/pc</span>
                               </div>
                            ) : (
                               <button 
                                  onClick={() => { setActiveMatrixItemId(item.id); setSelectedSizesForGroup(new Set()); }}
                                  className="w-full border border-blue-200 bg-blue-50 text-blue-700 rounded px-2 py-1 text-xs font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                               >
                                  <Settings size={12} /> Edit Config
                               </button>
                            )}
                         </div>
                      </td>

                      {/* Wastage */}
                      <td className="px-4 py-2 align-top">
                         <div className="flex items-center justify-center h-full pt-1">
                            <input 
                               type="number"
                               value={item.wastagePercent}
                               onChange={(e) => updateItem(item.id, 'wastagePercent', parseFloat(e.target.value))}
                               className="w-12 text-center border border-gray-200 rounded py-1 text-sm outline-none focus:border-blue-500"
                            />
                         </div>
                      </td>

                      {/* Total Req (Calculated) */}
                      <td className="px-4 py-2 align-top bg-gray-50/50">
                         <div className="flex items-center justify-end h-full pt-2">
                            <span className="font-mono font-bold text-[#37352F]">
                               {Math.ceil(calculateRequiredQty(item)).toLocaleString()}
                            </span>
                         </div>
                      </td>

                      {/* Test Toggle */}
                      <td className="px-4 py-2 align-top text-center">
                         <button 
                            onClick={() => updateItem(item.id, 'isTestingRequired', !item.isTestingRequired)}
                            className={`p-1.5 rounded transition-all mt-1
                               ${item.isTestingRequired ? 'bg-purple-100 text-purple-600' : 'text-gray-300 hover:bg-gray-100'}`}
                            title={item.isTestingRequired ? "Testing Required" : "No Test"}
                         >
                            <FlaskConical size={16} />
                         </button>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-2 align-top text-center">
                         <div className="pt-2">
                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border
                               ${item.sourcingStatus === 'Sourced' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                               {item.sourcingStatus}
                            </span>
                         </div>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-2 align-top text-right">
                         <button 
                            onClick={() => removeItem(item.id)}
                            className="text-gray-300 hover:text-red-500 p-1.5 rounded transition-colors mt-1 opacity-0 group-hover:opacity-100"
                         >
                            <Trash2 size={16} />
                         </button>
                      </td>

                    </tr>
                  ))}
                  {items.length === 0 && (
                     <tr>
                        <td colSpan={8} className="p-8 text-center text-gray-400 text-xs italic">
                           No items in {group}. Use "Add Item" or "Bulk Add" to start.
                        </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* MATRIX EDITOR MODAL */}
      {activeItem && (
         <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[85vh] flex flex-col">
               
               {/* Modal Header */}
               <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center shrink-0">
                  <div>
                     <h3 className="text-sm font-bold text-[#37352F]">{activeItem.componentName}</h3>
                     <p className="text-xs text-gray-500">Configuration Mode: <span className="font-bold text-blue-600">{activeItem.usageRule}</span></p>
                  </div>
                  <button onClick={() => setActiveMatrixItemId(null)} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
               </div>
               
               <div className="flex-1 overflow-hidden flex">
                  
                  {/* LEFT SIDE: Group Builder (Only for Configure your own) */}
                  {activeItem.usageRule === 'Configure your own' && (
                      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col p-4 shrink-0">
                          <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                              <CheckSquare size={14} /> Available Sizes
                          </h4>
                          <div className="flex-1 overflow-y-auto space-y-1 mb-4">
                              {allSizesList.map(size => {
                                  // Check if size is already used in a group
                                  const isUsed = Object.keys(activeItem.usageData).some(k => k.split(', ').includes(size));
                                  const isSelected = selectedSizesForGroup.has(size);
                                  
                                  return (
                                      <div 
                                          key={size}
                                          onClick={() => !isUsed && toggleSizeSelection(size)}
                                          className={`flex items-center gap-3 px-3 py-2 rounded border cursor-pointer transition-all
                                              ${isUsed ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 
                                                isSelected ? 'bg-blue-50 border-blue-300 text-blue-800' : 'bg-white border-gray-200 hover:border-blue-200'}`}
                                      >
                                          {isSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                                          <span className="text-sm font-medium">{size}</span>
                                          {isUsed && <span className="text-[9px] ml-auto bg-gray-200 px-1 rounded">Used</span>}
                                      </div>
                                  );
                              })}
                          </div>
                          <button 
                              onClick={handleCreateCustomGroup}
                              disabled={selectedSizesForGroup.size === 0}
                              className="w-full py-2 bg-[#37352F] text-white text-xs font-bold rounded shadow-sm hover:bg-black disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                          >
                              <ArrowRight size={14} /> Create Group ({selectedSizesForGroup.size})
                          </button>
                      </div>
                  )}

                  {/* RIGHT SIDE / MAIN AREA: Inputs Table */}
                  <div className="flex-1 overflow-y-auto p-0">
                      <table className="w-full text-sm text-left">
                         <thead className="bg-white text-xs text-gray-500 uppercase font-semibold border-b border-gray-100 sticky top-0 z-10">
                            <tr>
                               <th className="px-6 py-3 bg-white">
                                   {activeItem.usageRule === 'By Color/Wash' ? 'Colorway' : 
                                    activeItem.usageRule === 'By Size Group' ? 'Size Group' :
                                    activeItem.usageRule === 'By Individual Sizes' ? 'Size' :
                                    'Custom Size Group'}
                               </th>
                               <th className="px-6 py-3 bg-white text-right">Applicable Qty</th>
                               <th className="px-6 py-3 bg-white text-right w-40">Consumption</th>
                               {activeItem.usageRule === 'Configure your own' && <th className="px-4 py-3 bg-white w-10"></th>}
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100">
                            {/* LOGIC BRANCHING */}
                            
                            {/* CASE 1: By Color/Wash */}
                            {activeItem.usageRule === 'By Color/Wash' && Object.entries(orderBreakdownData.colorQuantities).map(([color, qty]) => (
                               <tr key={color}>
                                  <td className="px-6 py-3 font-medium text-gray-700">{color}</td>
                                  <td className="px-6 py-3 text-right text-gray-500">{qty}</td>
                                  <td className="px-6 py-3">
                                     <input 
                                        type="number" step="0.01"
                                        className="w-full border rounded px-2 py-1 text-right outline-none focus:border-blue-500"
                                        value={activeItem.usageData[color] || ''}
                                        onChange={(e) => updateUsageData(activeItem.id, color, parseFloat(e.target.value))}
                                     />
                                  </td>
                               </tr>
                            ))}

                            {/* CASE 2: By Size Group */}
                            {activeItem.usageRule === 'By Size Group' && sizeGroups.map(group => {
                               let groupTotal = 0;
                               Object.values(group.breakdown).forEach(row => {
                                  Object.values(row).forEach(q => groupTotal += (Number(q) || 0));
                               });
                               return (
                                  <tr key={group.id}>
                                     <td className="px-6 py-3 font-medium text-gray-700">{group.groupName}</td>
                                     <td className="px-6 py-3 text-right text-gray-500">{groupTotal}</td>
                                     <td className="px-6 py-3">
                                        <input 
                                           type="number" step="0.01"
                                           className="w-full border rounded px-2 py-1 text-right outline-none focus:border-blue-500"
                                           value={activeItem.usageData[group.groupName] || ''}
                                           onChange={(e) => updateUsageData(activeItem.id, group.groupName, parseFloat(e.target.value))}
                                        />
                                     </td>
                                  </tr>
                               );
                            })}

                            {/* CASE 3: By Individual Sizes */}
                            {activeItem.usageRule === 'By Individual Sizes' && allSizesList.map(size => (
                                <tr key={size}>
                                    <td className="px-6 py-3 font-medium text-gray-700">{size}</td>
                                    <td className="px-6 py-3 text-right text-gray-500">{orderBreakdownData.sizeQuantities[size] || 0}</td>
                                    <td className="px-6 py-3">
                                        <input 
                                           type="number" step="0.01"
                                           className="w-full border rounded px-2 py-1 text-right outline-none focus:border-blue-500"
                                           value={activeItem.usageData[size] || ''}
                                           onChange={(e) => updateUsageData(activeItem.id, size, parseFloat(e.target.value))}
                                        />
                                    </td>
                                </tr>
                            ))}

                            {/* CASE 4: Configure your own */}
                            {activeItem.usageRule === 'Configure your own' && Object.entries(activeItem.usageData).map(([key, val]) => {
                                const sizesInGroup = key.split(',').map(s => s.trim());
                                let groupTotal = 0;
                                sizesInGroup.forEach(s => groupTotal += (orderBreakdownData.sizeQuantities[s] || 0));

                                return (
                                    <tr key={key}>
                                        <td className="px-6 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {sizesInGroup.map(s => (
                                                    <span key={s} className="text-xs bg-gray-100 border border-gray-300 px-1.5 rounded font-medium text-gray-700">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-right text-gray-500">{groupTotal}</td>
                                        <td className="px-6 py-3">
                                            <input 
                                               type="number" step="0.01"
                                               className="w-full border rounded px-2 py-1 text-right outline-none focus:border-blue-500"
                                               value={val || ''}
                                               onChange={(e) => updateUsageData(activeItem.id, key, parseFloat(e.target.value))}
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button 
                                                onClick={() => {
                                                    const newData = { ...activeItem.usageData };
                                                    delete newData[key];
                                                    updateItem(activeItem.id, 'usageData', newData);
                                                }}
                                                className="text-gray-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            
                            {activeItem.usageRule === 'Configure your own' && Object.keys(activeItem.usageData).length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-400 italic">
                                        Use the panel on the left to select sizes and create a custom consumption group.
                                    </td>
                                </tr>
                            )}

                         </tbody>
                      </table>
                  </div>
               </div>
               
               <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end shrink-0">
                  <button 
                     onClick={() => setActiveMatrixItemId(null)}
                     className="px-6 py-2 bg-[#37352F] text-white text-sm font-medium rounded hover:bg-black shadow-sm"
                  >
                     Done
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* BULK ADD MODAL */}
      <BulkItemSelectorModal 
         isOpen={isBulkModalOpen}
         onClose={() => setIsBulkModalOpen(false)}
         masterItems={masterItems}
         group={bulkModalGroup}
         onConfirm={handleBulkConfirm}
      />

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
         <div className="flex items-center gap-2 text-xs text-gray-500">
            <AlertCircle size={14} className="text-orange-500" />
            <span>Ensure all consumptions include process loss before release.</span>
         </div>
         <div className="flex gap-3">
            <button 
               onClick={handleGenerateMaterialSummary}
               className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2"
            >
               <FileText size={16} /> Material Summary
            </button>
            
            {bomStatus === 'Draft' ? (
                <button 
                   onClick={onReleaseBOM}
                   className="px-6 py-2 bg-[#37352F] text-white text-sm font-medium rounded shadow-sm hover:bg-black transition-all flex items-center gap-2"
                >
                   <Calculator size={16} /> Release BOM for Costing
                </button>
             ) : (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded border border-green-200">
                   <CheckSquare size={16} />
                   <span className="text-sm font-bold">BOM Released</span>
                </div>
             )}
         </div>
      </div>

    </div>
  );
};
