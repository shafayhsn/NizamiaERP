
import React, { useState } from 'react';
import { 
  Plus, Edit2, Trash2, Save, X, Search, Layers, Scissors, Tag, CheckSquare, Square, DollarSign
} from 'lucide-react';
import { MasterBOMItem, Supplier, Buyer } from '../types';

interface BOMManagerDashboardProps {
  masterItems: MasterBOMItem[];
  setMasterItems: (items: MasterBOMItem[]) => void;
  buyers: Buyer[];
  suppliers: Supplier[];
}

const UOM_OPTIONS = ['Pieces', 'Meters', 'Yards', 'Kgs', 'Oz', 'Dozen'];

export const BOMManagerDashboard: React.FC<BOMManagerDashboardProps> = ({ 
  masterItems, setMasterItems, buyers, suppliers 
}) => {
  const [activeTab, setActiveTab] = useState<'Fabric' | 'Trims'>('Fabric');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterBOMItem | null>(null);

  // Form State
  const initialFormState: Partial<MasterBOMItem> = {
    type: activeTab === 'Fabric' ? 'Fabric' : 'Trim',
    category: '',
    supplier: '',
    brand: '',
    code: '',
    uom: 'Pieces',
    isNominated: false,
    price: 0,
    // Fabric specifics
    construction: '',
    content: '',
    warpShrinkage: 0,
    weftShrinkage: 0,
    weight: 0,
    // Trim specifics
    itemName: '',
    details: ''
  };

  const [formData, setFormData] = useState<Partial<MasterBOMItem>>(initialFormState);

  // --- Handlers ---

  const handleOpenModal = (item?: MasterBOMItem) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({ ...initialFormState, type: activeTab === 'Fabric' ? 'Fabric' : 'Trim' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = () => {
    if (editingItem) {
      setMasterItems(masterItems.map(i => i.id === editingItem.id ? { ...i, ...formData } as MasterBOMItem : i));
    } else {
      const newItem: MasterBOMItem = {
        ...formData,
        id: `bom-${Date.now()}`,
        type: activeTab === 'Fabric' ? 'Fabric' : 'Trim'
      } as MasterBOMItem;
      setMasterItems([...masterItems, newItem]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this item from the Master Library?")) {
      setMasterItems(masterItems.filter(i => i.id !== id));
    }
  };

  // --- Filtering ---
  const filteredItems = masterItems.filter(item => {
    if (item.type !== (activeTab === 'Fabric' ? 'Fabric' : 'Trim')) return false;
    const s = searchTerm.toLowerCase();
    return (
      (item.category || '').toLowerCase().includes(s) ||
      (item.itemName || '').toLowerCase().includes(s) ||
      (item.code || '').toLowerCase().includes(s) ||
      (item.supplier || '').toLowerCase().includes(s)
    );
  });

  return (
    <div className="flex flex-col h-full space-y-6 pb-10">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-[#37352F]">BOM Master Library</h1>
          <p className="text-sm text-gray-500">Manage standard fabrics and trims for order creation.</p>
        </div>
      </div>

      {/* Prominent Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex gap-8">
           <button 
             onClick={() => setActiveTab('Fabric')}
             className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 
               ${activeTab === 'Fabric' ? 'border-[#37352F] text-[#37352F]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
           >
             <Layers size={18} /> Fabric Library
           </button>
           <button 
             onClick={() => setActiveTab('Trims')}
             className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 
               ${activeTab === 'Trims' ? 'border-[#37352F] text-[#37352F]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
           >
             <Scissors size={18} /> Trims Library
           </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
         <div className="relative w-full md:w-96">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input 
               type="text" 
               placeholder={`Search ${activeTab}...`}
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
         </div>
         <button 
           onClick={() => handleOpenModal()}
           className="flex items-center gap-2 px-4 py-2 bg-[#37352F] text-white rounded-md hover:bg-black transition-colors shadow-sm text-sm font-medium"
         >
           <Plus size={16} /> Add {activeTab} Item
         </button>
      </div>

      {/* Tables */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex-1 flex flex-col">
         <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left text-sm border-collapse">
               <thead className="bg-[#F7F7F5] text-xs font-semibold text-gray-500 uppercase sticky top-0 z-10 shadow-sm">
                  <tr>
                     {activeTab === 'Fabric' ? (
                       <>
                         <th className="px-4 py-3">Category</th>
                         <th className="px-4 py-3">Code</th>
                         <th className="px-4 py-3">Construction</th>
                         <th className="px-4 py-3">Content</th>
                         <th className="px-4 py-3 text-center">Weight</th>
                         <th className="px-4 py-3 text-center">Shrinkage (L x W)</th>
                         <th className="px-4 py-3">Supplier</th>
                         <th className="px-4 py-3">Brand</th>
                         <th className="px-4 py-3 text-right">Price (PKR)</th>
                         <th className="px-4 py-3 text-center">Nominated</th>
                       </>
                     ) : (
                       <>
                         <th className="px-4 py-3">Category</th>
                         <th className="px-4 py-3">Item Name</th>
                         <th className="px-4 py-3">Code</th>
                         <th className="px-4 py-3">Details</th>
                         <th className="px-4 py-3">UOM</th>
                         <th className="px-4 py-3">Supplier</th>
                         <th className="px-4 py-3">Brand</th>
                         <th className="px-4 py-3 text-right">Price (PKR)</th>
                         <th className="px-4 py-3 text-center">Nominated</th>
                       </>
                     )}
                     <th className="px-4 py-3 text-center w-20">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {filteredItems.map(item => (
                     <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                        {activeTab === 'Fabric' ? (
                          <>
                            <td className="px-4 py-3 font-medium text-[#37352F]">{item.category}</td>
                            <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.code}</td>
                            <td className="px-4 py-3">{item.construction}</td>
                            <td className="px-4 py-3 text-gray-600">{item.content}</td>
                            <td className="px-4 py-3 text-center">{item.weight}</td>
                            <td className="px-4 py-3 text-center text-xs text-gray-500">{item.warpShrinkage}% x {item.weftShrinkage}%</td>
                            <td className="px-4 py-3 text-blue-600">{item.supplier}</td>
                            <td className="px-4 py-3 text-gray-600">{item.brand}</td>
                            <td className="px-4 py-3 text-right font-mono font-medium">{item.price?.toLocaleString()}</td>
                            <td className="px-4 py-3 text-center">
                               {item.isNominated ? <span className="text-green-600 text-xs font-bold">YES</span> : <span className="text-gray-300">-</span>}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 font-medium text-[#37352F]">{item.category}</td>
                            <td className="px-4 py-3">{item.itemName}</td>
                            <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.code}</td>
                            <td className="px-4 py-3 text-gray-600 truncate max-w-[150px]" title={item.details}>{item.details}</td>
                            <td className="px-4 py-3 text-xs">{item.uom}</td>
                            <td className="px-4 py-3 text-blue-600">{item.supplier}</td>
                            <td className="px-4 py-3 text-gray-600">{item.brand}</td>
                            <td className="px-4 py-3 text-right font-mono font-medium">{item.price?.toLocaleString()}</td>
                            <td className="px-4 py-3 text-center">
                               {item.isNominated ? <span className="text-green-600 text-xs font-bold">YES</span> : <span className="text-gray-300">-</span>}
                            </td>
                          </>
                        )}
                        <td className="px-4 py-3 text-center">
                           <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleOpenModal(item)} className="text-gray-400 hover:text-blue-600">
                                 <Edit2 size={16} />
                              </button>
                              <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-600">
                                 <Trash2 size={16} />
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
                  {filteredItems.length === 0 && (
                     <tr><td colSpan={11} className="p-8 text-center text-gray-400 italic">No items found.</td></tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {isModalOpen && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl flex flex-col overflow-hidden">
               
               <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-[#37352F]">
                     {editingItem ? 'Edit' : 'Add'} {activeTab} Item
                  </h2>
                  <button onClick={handleCloseModal}><X size={20} className="text-gray-400 hover:text-gray-600"/></button>
               </div>

               <div className="p-6 overflow-y-auto max-h-[70vh]">
                  <div className="grid grid-cols-2 gap-6">
                     
                     {/* Common Fields */}
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                        <input className="w-full px-3 py-2 border rounded text-sm" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. Denim, Zipper" />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase">Item Code / Ref</label>
                        <input className="w-full px-3 py-2 border rounded text-sm" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="Internal or Supplier Code" />
                     </div>

                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase">Supplier</label>
                        <select className="w-full px-3 py-2 border rounded text-sm bg-white" value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})}>
                           <option value="">Select Supplier...</option>
                           {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                        </select>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase">Brand / Buyer</label>
                        <select className="w-full px-3 py-2 border rounded text-sm bg-white" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})}>
                           <option value="">Select Brand...</option>
                           {buyers.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                        </select>
                     </div>

                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase">Unit (UOM)</label>
                        <select className="w-full px-3 py-2 border rounded text-sm bg-white" value={formData.uom} onChange={e => setFormData({...formData, uom: e.target.value})}>
                           {UOM_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase">Price (PKR)</label>
                        <div className="relative">
                           <DollarSign size={14} className="absolute left-3 top-2.5 text-gray-400" />
                           <input type="number" className="w-full pl-9 pr-3 py-2 border rounded text-sm" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} placeholder="0.00" />
                        </div>
                     </div>

                     {/* FABRIC SPECIFIC */}
                     {activeTab === 'Fabric' && (
                        <>
                           <div className="space-y-1.5">
                              <label className="text-xs font-bold text-gray-500 uppercase">Construction</label>
                              <input className="w-full px-3 py-2 border rounded text-sm" value={formData.construction} onChange={e => setFormData({...formData, construction: e.target.value})} placeholder="e.g. 3x1 RHT" />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-xs font-bold text-gray-500 uppercase">Content</label>
                              <input className="w-full px-3 py-2 border rounded text-sm" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} placeholder="e.g. 98% Cotton 2% Elastane" />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-xs font-bold text-gray-500 uppercase">Weight</label>
                              <input type="number" className="w-full px-3 py-2 border rounded text-sm" value={formData.weight} onChange={e => setFormData({...formData, weight: parseFloat(e.target.value)})} placeholder="0" />
                           </div>
                           <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1.5">
                                 <label className="text-xs font-bold text-gray-500 uppercase">Warp Shrink %</label>
                                 <input type="number" className="w-full px-3 py-2 border rounded text-sm" value={formData.warpShrinkage} onChange={e => setFormData({...formData, warpShrinkage: parseFloat(e.target.value)})} />
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-xs font-bold text-gray-500 uppercase">Weft Shrink %</label>
                                 <input type="number" className="w-full px-3 py-2 border rounded text-sm" value={formData.weftShrinkage} onChange={e => setFormData({...formData, weftShrinkage: parseFloat(e.target.value)})} />
                              </div>
                           </div>
                        </>
                     )}

                     {/* TRIMS SPECIFIC */}
                     {activeTab === 'Trims' && (
                        <>
                           <div className="space-y-1.5">
                              <label className="text-xs font-bold text-gray-500 uppercase">Item Name</label>
                              <input className="w-full px-3 py-2 border rounded text-sm" value={formData.itemName} onChange={e => setFormData({...formData, itemName: e.target.value})} placeholder="e.g. Main Button" />
                           </div>
                           <div className="col-span-2 space-y-1.5">
                              <label className="text-xs font-bold text-gray-500 uppercase">Details / Specs</label>
                              <textarea rows={2} className="w-full px-3 py-2 border rounded text-sm" value={formData.details} onChange={e => setFormData({...formData, details: e.target.value})} placeholder="Size, Finish, Color..." />
                           </div>
                        </>
                     )}

                     {/* NOMINATION */}
                     <div className="col-span-2 flex items-center gap-2 pt-2">
                        <div 
                           onClick={() => setFormData({...formData, isNominated: !formData.isNominated})}
                           className="flex items-center gap-2 cursor-pointer select-none"
                        >
                           {formData.isNominated ? <CheckSquare size={18} className="text-blue-600"/> : <Square size={18} className="text-gray-400"/>}
                           <span className="text-sm font-medium text-gray-700">Nominated Supplier</span>
                        </div>
                     </div>

                  </div>
               </div>

               <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                  <button onClick={handleCloseModal} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                  <button 
                     onClick={handleSave}
                     className="px-6 py-2 bg-[#37352F] text-white text-sm font-medium rounded hover:bg-black"
                  >
                     Save Item
                  </button>
               </div>

            </div>
         </div>
      )}

    </div>
  );
};
