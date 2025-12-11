
import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, AlertTriangle, CheckCircle2, Clock, 
  Plus, ArrowUpRight,
  Package, TrendingUp, AlertCircle, Copy, Trash2, Lock,
  ShoppingBag, ClipboardList, Hash, UploadCloud
} from 'lucide-react';
import { JobManagerDashboard } from './JobManagerDashboard';
import { BulkOrderImportStager } from './BulkOrderImportStager';
import { Order, JobBatch, ExportInvoice } from '../types';
import { formatAppDate } from '../constants';

interface MainOrdersDashboardProps {
  orders: Order[];
  jobs: JobBatch[];
  onUpdateJobs: (jobs: JobBatch[]) => void;
  onCreateOrder: () => void;
  onRowClick: (orderId: string) => void;
  onBulkImport: (data: { orders: Order[], invoices: ExportInvoice[] }) => void;
}

export const MainOrdersDashboard: React.FC<MainOrdersDashboardProps> = ({ 
  orders, jobs, onUpdateJobs, onCreateOrder, onRowClick, onBulkImport
}) => {
  const [currentView, setCurrentView] = useState<'orders' | 'jobs'>('orders');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [buyerFilter, setBuyerFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All'); // All, At Risk, Healthy

  // Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // --- Filtering Logic ---
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const s = searchTerm.toLowerCase();
      const matchesSearch = 
        (order.orderID || '').toLowerCase().includes(s) ||
        (order.styleName || '').toLowerCase().includes(s) ||
        (order.buyer || '').toLowerCase().includes(s);
      
      const matchesBuyer = buyerFilter === 'All' || order.buyer === buyerFilter;
      
      const matchesRisk = 
        riskFilter === 'All' ? true :
        riskFilter === 'At Risk' ? (order.cpRiskCount || 0) > 0 :
        (order.cpRiskCount || 0) === 0;

      return matchesSearch && matchesBuyer && matchesRisk;
    });
  }, [orders, searchTerm, buyerFilter, riskFilter]);

  // --- KPI Calculations ---
  const totalOrders = filteredOrders.length;
  const totalUnits = filteredOrders.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  const ordersAtRisk = filteredOrders.filter(o => (o.cpRiskCount || 0) > 0).length;

  const uniqueBuyers = Array.from(new Set(orders.map(o => o.buyer))).sort();

  // Note: Handle delete and duplicate actions would typically callback to App.tsx
  // For UI demo purposes, we are just console logging
  const handleDuplicate = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    console.log("Duplicate requested for", orderId);
  };

  const initiateDelete = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    setOrderToDelete(orderId);
    setIsDeleteModalOpen(true);
    setDeletePassword('');
    setDeleteError('');
  };

  const confirmDelete = () => {
    if (deletePassword === 'admin') {
        console.log("Delete confirmed for", orderToDelete);
        setIsDeleteModalOpen(false);
        setOrderToDelete(null);
        // Prop callback would go here
    } else {
        setDeleteError('Incorrect password. Try "admin"');
    }
  };

  const calculateDaysLeft = (dateStr?: string) => {
    if (!dateStr) return null;
    const target = new Date(dateStr);
    const now = new Date();
    target.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    const diff = target.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleBulkCommit = (data: { orders: Order[], invoices: ExportInvoice[] }) => {
      onBulkImport(data);
      setIsBulkImportOpen(false); // Close modal on success
  };

  return (
    <div className="flex flex-col h-full space-y-6 relative overflow-hidden">
      
      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-6 border-b border-gray-200 px-1 shrink-0">
        <button
          onClick={() => setCurrentView('orders')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 
            ${currentView === 'orders' ? 'border-[#37352F] text-[#37352F]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <ShoppingBag size={16} /> Purchase Orders
        </button>
        <button
          onClick={() => setCurrentView('jobs')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 
            ${currentView === 'jobs' ? 'border-[#37352F] text-[#37352F]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <ClipboardList size={16} /> Production Jobs
        </button>
      </div>

      {currentView === 'orders' ? (
        <div className="flex flex-col flex-1 overflow-hidden space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between shrink-0">
            <div>
              <h1 className="text-2xl font-semibold text-[#37352F]">Order Management</h1>
              <p className="text-sm text-gray-500 mt-1">Production status, risk analysis, and delivery tracking.</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsBulkImportOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium"
              >
                <UploadCloud size={16} /> Import Order
              </button>
              <button 
                onClick={() => setCurrentView('jobs')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium"
              >
                <ClipboardList size={16} /> Job Management
              </button>
              <button 
                onClick={onCreateOrder}
                className="flex items-center gap-2 px-4 py-2 bg-[#37352F] text-white rounded-md hover:bg-black transition-colors shadow-sm text-sm font-medium"
              >
                <Plus size={16} /> New Order
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
            <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Active Orders</p>
                <h3 className="text-2xl font-bold text-[#37352F] mt-1">{totalOrders}</h3>
                <span className="text-xs text-green-600 flex items-center gap-1 mt-2 font-medium">
                  <TrendingUp size={12} /> +0% this month
                </span>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                <Package size={20} />
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Units</p>
                <h3 className="text-2xl font-bold text-[#37352F] mt-1">{totalUnits.toLocaleString()}</h3>
                <span className="text-xs text-gray-400 mt-2 block">Across all active lines</span>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                <ArrowUpRight size={20} />
              </div>
            </div>

            <div className={`border p-4 rounded-xl shadow-sm flex items-start justify-between transition-colors
              ${ordersAtRisk > 0 ? 'bg-red-50 border-red-100' : 'bg-white border-gray-200'}`}>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wide ${ordersAtRisk > 0 ? 'text-red-600' : 'text-gray-500'}`}>Orders At Risk</p>
                <h3 className={`text-2xl font-bold mt-1 ${ordersAtRisk > 0 ? 'text-red-700' : 'text-[#37352F]'}`}>{ordersAtRisk}</h3>
                <span className={`text-xs mt-2 flex items-center gap-1 font-medium ${ordersAtRisk > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {ordersAtRisk > 0 ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                  {ordersAtRisk > 0 ? 'Critical Path delays' : 'All on track'}
                </span>
              </div>
              <div className={`p-2 rounded-lg ${ordersAtRisk > 0 ? 'bg-red-100 text-red-600' : 'bg-green-50 text-green-600'}`}>
                <AlertCircle size={20} />
              </div>
            </div>
          </div>

          {/* Filters Toolbar */}
          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between shrink-0">
            <div className="relative w-full md:w-96">
                <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search job number, style, or buyer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
            </div>
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                <select 
                  value={buyerFilter}
                  onChange={(e) => setBuyerFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-md outline-none bg-white text-gray-600 focus:border-blue-500 hover:border-gray-300 cursor-pointer"
                >
                  <option value="All">All Buyers</option>
                  {uniqueBuyers.map(b => <option key={b} value={b}>{b}</option>)}
                </select>

                <select 
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-md outline-none bg-white text-gray-600 focus:border-blue-500 hover:border-gray-300 cursor-pointer"
                >
                  <option value="All">Risk Status: All</option>
                  <option value="At Risk">At Risk Only</option>
                  <option value="Healthy">Healthy Only</option>
                </select>
                
                <button className="p-2 border border-gray-200 rounded-md hover:bg-gray-50 text-gray-500">
                  <Filter size={16} />
                </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
            <div className="overflow-auto custom-scrollbar flex-1">
              <table className="w-full text-left text-sm border-collapse min-w-[1000px]">
                <thead className="bg-[#F7F7F5] text-xs uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-200 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 w-20 bg-[#F7F7F5]">Image</th>
                      <th className="px-6 py-4 bg-[#F7F7F5]">Job Number</th>
                      <th className="px-6 py-4 bg-[#F7F7F5]">Factory Ref</th>
                      <th className="px-6 py-4 bg-[#F7F7F5]">Buyer</th>
                      <th className="px-6 py-4 bg-[#F7F7F5]">Style</th>
                      <th className="px-6 py-4 text-right bg-[#F7F7F5]">Qty</th>
                      <th className="px-6 py-4 bg-[#F7F7F5]">Next Action Due</th>
                      <th className="px-6 py-4 bg-[#F7F7F5]">CP Health</th>
                      <th className="px-6 py-4 bg-[#F7F7F5]">Ship Date</th>
                      <th className="px-6 py-4 w-24 bg-[#F7F7F5]">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredOrders.map(order => {
                      const isRisk = (order.cpRiskCount || 0) > 0;
                      // Check if this order is assigned to any job
                      const assignedJob = jobs.find(j => j.styles.some(s => s.id === order.id));
                      const isAssigned = !!assignedJob;
                      
                      const daysLeft = calculateDaysLeft(order.deliveryDate);
                      const isUrgentShip = daysLeft !== null && daysLeft < 7;

                      return (
                        <tr 
                            key={order.orderID} 
                            onClick={() => onRowClick(order.orderID)}
                            className={`group hover:bg-gray-50 transition-colors cursor-pointer ${isRisk ? 'bg-red-50/10' : ''}`}
                        >
                            <td className="px-6 py-3">
                              <div className="w-10 h-10 rounded bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                                  {order.imageUrl ? (
                                    <img src={order.imageUrl} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                      <Package size={16} />
                                    </div>
                                  )}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-[#37352F]">
                              <div className="flex items-center gap-2">
                                 <div 
                                    className={`w-2 h-2 rounded-full shadow-sm ${isAssigned ? 'bg-green-500 shadow-green-200' : 'bg-red-500 shadow-red-200'}`} 
                                    title={isAssigned ? "Assigned to Job" : "Unassigned - Needs Job Assignment"}
                                 ></div>
                                 {isAssigned ? (
                                     <span className="text-blue-700 font-bold">{assignedJob?.id}</span>
                                 ) : (
                                     <span className="text-gray-400 italic">Unassigned</span>
                                 )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                               <span className="font-mono text-xs text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                                 {order.factoryRef || '-'}
                               </span>
                            </td>
                            <td className="px-6 py-4 text-gray-700">
                              {order.buyer}
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              {order.styleName || order.styleNo}
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-gray-700">
                              {order.quantity.toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                  <Clock size={14} className={isRisk ? 'text-red-500' : 'text-gray-400'} />
                                  <span className={isRisk ? 'text-red-600 font-medium' : 'text-gray-600'}>
                                    {order.cpNextDueDate}
                                  </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {isRisk ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                    <AlertTriangle size={12} /> {order.cpRiskCount} Risks
                                  </span>
                              ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                    <CheckCircle2 size={12} /> Healthy
                                  </span>
                              )}
                            </td>
                            {/* Replaced Fabric Status with Ship Date & Days Left */}
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                 <span className="text-sm font-bold text-[#37352F]">
                                    {formatAppDate(order.deliveryDate)}
                                 </span>
                                 {daysLeft !== null && (
                                    <span className={`text-[10px] font-medium mt-0.5 ${isUrgentShip ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                                       {daysLeft} Days Left
                                    </span>
                                 )}
                              </div>
                            </td>
                            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                              {/* Quick Actions - Reveal on Hover */}
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={(e) => handleDuplicate(e, order.orderID)}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                    title="Duplicate Order"
                                  >
                                    <Copy size={14} />
                                  </button>
                                  <button 
                                    onClick={(e) => initiateDelete(e, order.orderID)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                    title="Delete Order (Protected)"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                              </div>
                            </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              {filteredOrders.length === 0 && (
                <div className="p-10 text-center text-gray-400">
                  No orders found. Add a new order to get started.
                </div>
              )}
            </div>
            
            {/* Table Footer */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center shrink-0">
              <span>Showing {filteredOrders.length} of {orders.length} active orders</span>
              <div className="flex gap-4">
                  <button className="hover:text-[#37352F]">Previous</button>
                  <button className="hover:text-[#37352F]">Next</button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <JobManagerDashboard 
            availableOrders={orders} 
            jobs={jobs} 
            onUpdateJobs={onUpdateJobs} 
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 space-y-4">
              <div className="flex items-center gap-2 text-red-600">
                 <Lock size={20} />
                 <h3 className="text-lg font-bold">Secure Deletion</h3>
              </div>
              <p className="text-sm text-gray-600">
                You are about to delete order <strong>{orderToDelete}</strong>. 
                This action cannot be undone. Please enter the admin password to confirm.
              </p>
              
              <input 
                type="password"
                placeholder="Admin Password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && confirmDelete()}
              />
              
              {deleteError && (
                 <p className="text-xs text-red-500 font-medium">{deleteError}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                 <button 
                   onClick={() => setIsDeleteModalOpen(false)}
                   className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={confirmDelete}
                   className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                 >
                   Delete Order
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {isBulkImportOpen && (
          <BulkOrderImportStager 
             onClose={() => setIsBulkImportOpen(false)}
             onCommit={handleBulkCommit}
          />
      )}

    </div>
  );
};
