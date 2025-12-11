
import React, { useState } from 'react';
import { Plus, Trash2, User, Phone, MapPin, Globe, Search } from 'lucide-react';
import { Buyer } from '../types';

interface BuyersDashboardProps {
  buyers: Buyer[];
  onAddBuyer: (buyer: Buyer) => void;
  onDeleteBuyer: (id: string) => void;
}

const INITIAL_FORM_STATE = {
  name: '',
  contactPerson: '',
  phone: '',
  address: '',
  country: ''
};

export const BuyersDashboard: React.FC<BuyersDashboardProps> = ({ buyers, onAddBuyer, onDeleteBuyer }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBuyers = buyers.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBuyer: Buyer = {
      id: `BUY-${Date.now()}`,
      name: formData.name,
      contactPerson: formData.contactPerson,
      phone: formData.phone,
      address: formData.address,
      country: formData.country,
      totalOrders: 0
    };
    onAddBuyer(newBuyer);
    setFormData(INITIAL_FORM_STATE);
    setIsModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-[#37352F]">Buyer Directory</h1>
          <p className="text-sm text-gray-500">Manage client profiles and contact information.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#37352F] text-white rounded-md hover:bg-black transition-colors shadow-sm text-sm font-medium"
        >
          <Plus size={16} /> Add New Buyer
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search buyers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left text-sm border-collapse min-w-[1000px]">
            <thead className="bg-[#F7F7F5] text-xs uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-200 sticky top-0">
              <tr>
                <th className="px-6 py-4">Buyer Name</th>
                <th className="px-6 py-4">Contact Person</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Country</th>
                <th className="px-6 py-4">Address</th>
                <th className="px-6 py-4 text-center">Active Orders</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBuyers.map(buyer => (
                <tr key={buyer.id} className="group hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-[#37352F]">{buyer.name}</td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="flex items-center gap-2">
                       <User size={14} className="text-gray-400" />
                       {buyer.contactPerson}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="flex items-center gap-2">
                       <Phone size={14} className="text-gray-400" />
                       {buyer.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="flex items-center gap-2">
                       <Globe size={14} className="text-gray-400" />
                       {buyer.country}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={buyer.address}>
                    {buyer.address}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                       {buyer.totalOrders}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onDeleteBuyer(buyer.id)}
                      className="text-gray-400 hover:text-red-500 p-1.5 rounded transition-colors"
                      title="Delete Buyer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredBuyers.length === 0 && (
                <tr>
                   <td colSpan={7} className="p-8 text-center text-gray-400">No buyers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Buyer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 space-y-4">
              <h2 className="text-lg font-bold text-[#37352F]">Add New Buyer</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-gray-500 uppercase">Buyer Name</label>
                       <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-blue-500 outline-none" placeholder="e.g. Zara" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-gray-500 uppercase">Contact Person</label>
                       <input required name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-blue-500 outline-none" placeholder="Full Name" />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                       <input required name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-blue-500 outline-none" placeholder="+1..." />
                    </div>
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-gray-500 uppercase">Country</label>
                       <input required name="country" value={formData.country} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-blue-500 outline-none" placeholder="e.g. Spain" />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Full Address</label>
                    <input required name="address" value={formData.address} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-blue-500 outline-none" placeholder="Street, City, Zip" />
                 </div>
                 
                 <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm bg-[#37352F] text-white rounded hover:bg-black">Save Buyer</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
