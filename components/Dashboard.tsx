
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle2, Clock, PieChart, Package, DollarSign, CalendarRange } from 'lucide-react';
import { Order, JobBatch, CalendarEvent } from '../types';
import { formatAppDate } from '../constants';

interface DashboardProps {
  orders: Order[];
  jobs: JobBatch[];
  customEvents: CalendarEvent[]; // Added for summary
  onOpenEvents: () => void;      // Trigger for modal
}

const StatCard = ({ label, value, icon: Icon, trend, colorClass, onClick }: { label: string, value: string, icon: any, trend?: string, colorClass?: string, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={`p-4 rounded-lg border border-[#E0E0E0] bg-white shadow-sm hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer group' : ''}`}
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-gray-500 font-medium">{label}</span>
      <Icon size={16} className={`text-gray-400 ${onClick ? 'group-hover:text-blue-600 transition-colors' : ''}`} />
    </div>
    <div className={`text-2xl font-semibold ${colorClass || 'text-[#37352F]'}`}>{value}</div>
    {trend && <div className="text-xs text-gray-400 mt-1 font-medium">{trend}</div>}
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ orders, jobs, customEvents, onOpenEvents }) => {
  // --- 1. KPI Calculations ---
  
  // Revenue
  const totalRevenue = useMemo(() => {
    return orders.reduce((acc, order) => {
      const amt = order.amount > 0 ? order.amount : (order.quantity * (order.price || 0));
      return acc + amt;
    }, 0);
  }, [orders]);

  // Active Orders
  const activeOrdersCount = orders.filter(o => o.status !== 'Shipped' && o.status !== 'Cancelled').length;
  
  // Total Units
  const totalUnits = orders.reduce((acc, o) => acc + o.quantity, 0);

  // Risks
  const riskCount = orders.filter(o => (o.cpRiskCount || 0) > 0 || (o.status === 'Delayed')).length;

  // Events for Today (Summary)
  const todaysEventCount = useMemo(() => {
      const todayStr = new Date().toISOString().split('T')[0];
      let count = 0;
      
      // Orders: Delivery or CP Task due today
      orders.forEach(o => {
          if (o.deliveryDate === todayStr) count++;
          o.criticalPath?.schedule.forEach(t => {
              if (t.calculatedDueDate === todayStr && t.status !== 'Complete') count++;
          });
      });

      // Jobs: Ex-Factory today
      jobs.forEach(j => {
          if (j.exFactoryDate === todayStr) count++;
      });

      // Custom Events
      customEvents.forEach(e => {
          if (e.date === todayStr) count++;
      });

      return count;
  }, [orders, jobs, customEvents]);

  // --- 2. Chart Data ---
  const chartData = useMemo(() => {
    const buyerMap = new Map<string, { name: string, amount: number, qty: number }>();

    orders.forEach(order => {
      const buyer = order.buyer || 'Unknown';
      if (!buyerMap.has(buyer)) {
        buyerMap.set(buyer, { name: buyer, amount: 0, qty: 0 });
      }
      const entry = buyerMap.get(buyer)!;
      const amt = order.amount > 0 ? order.amount : (order.quantity * (order.price || 0));
      entry.amount += amt;
      entry.qty += order.quantity;
    });

    return Array.from(buyerMap.values()).sort((a, b) => b.amount - a.amount).slice(0, 10);
  }, [orders]);

  // --- 3. Recent Activity Feed ---
  const recentActivity = useMemo(() => {
    return orders.slice(0, 5).map(order => ({
      id: order.id,
      text: `Order ${order.orderID} (${order.styleNo})`,
      subtext: `${order.buyer} • ${order.quantity.toLocaleString()} units`,
      status: order.status,
      date: order.poDate ? formatAppDate(order.poDate) : 'Just now'
    }));
  }, [orders]);

  const hasData = orders.length > 0;

  return (
    <div className="space-y-6 pb-10 h-full overflow-y-auto pr-2 custom-scrollbar">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold text-[#37352F]">Dashboard</h1>
        <p className="text-gray-500 text-sm">Overview of production, sales, and active jobs.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard 
          label="Total Revenue" 
          value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} 
          icon={DollarSign} 
          trend="Based on active POs"
        />
        <StatCard 
          label="Active Orders" 
          value={activeOrdersCount.toString()} 
          icon={Clock} 
          trend={`${orders.length} total historical`}
        />
        <StatCard 
          label="Total Production" 
          value={totalUnits.toLocaleString()} 
          icon={Package} 
          trend="Scheduled Qty"
        />
        <StatCard 
          label="Risk Alerts" 
          value={riskCount.toString()} 
          icon={AlertCircle} 
          colorClass={riskCount > 0 ? 'text-red-600' : 'text-green-600'}
          trend={riskCount > 0 ? 'Requires attention' : 'Production healthy'}
        />
        {/* Events Thumbnail Card */}
        <StatCard 
          label="Schedule" 
          value={`${todaysEventCount} Events`} 
          icon={CalendarRange} 
          trend="Today"
          colorClass="text-blue-600"
          onClick={onOpenEvents}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-80">
        
        {/* Revenue Chart */}
        <div className="border border-[#E0E0E0] bg-white rounded-lg p-4 flex flex-col">
           <h3 className="text-sm font-medium text-gray-600 mb-4">Revenue by Buyer (Top 10)</h3>
           <div className="flex-1 min-h-0">
             {hasData ? (
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} tickFormatter={(value) => `$${value/1000}k`} />
                    <Tooltip 
                      cursor={{fill: '#F9FAFB'}}
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="amount" fill="#37352F" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
               </ResponsiveContainer>
             ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <PieChart size={32} className="mb-2 opacity-50" />
                    <span className="text-xs">No revenue data available</span>
                </div>
             )}
           </div>
        </div>

        {/* Volume Chart */}
        <div className="border border-[#E0E0E0] bg-white rounded-lg p-4 flex flex-col">
           <h3 className="text-sm font-medium text-gray-600 mb-4">Volume by Buyer (Units)</h3>
           <div className="flex-1 min-h-0">
             {hasData ? (
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Line type="monotone" dataKey="qty" stroke="#37352F" strokeWidth={2} dot={{r: 4, fill: '#37352F'}} />
                  </LineChart>
               </ResponsiveContainer>
             ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <TrendingUp size={32} className="mb-2 opacity-50" />
                    <span className="text-xs">No volume data available</span>
                </div>
             )}
           </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="border border-[#E0E0E0] bg-white rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-4">Recent Orders & Updates</h3>
        <div className="space-y-3">
            {hasData ? (
              recentActivity.map((item, i) => (
                <div key={item.id} className="flex items-center justify-between text-sm group hover:bg-gray-50 p-2 rounded transition-colors">
                    <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full 
                          ${item.status === 'Pending' ? 'bg-yellow-400' : 
                            item.status === 'Active' ? 'bg-blue-400' : 
                            item.status === 'Shipped' ? 'bg-green-400' : 'bg-gray-300'}`}>
                        </span>
                        <div className="flex flex-col">
                           <span className="text-[#37352F] font-medium">{item.text}</span>
                           <span className="text-xs text-gray-400">{item.subtext}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-xs font-bold text-gray-600">{item.status}</span>
                       <span className="text-gray-400 text-[10px]">{item.date}</span>
                    </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 text-sm py-4">No recent activity.</div>
            )}
        </div>
      </div>
    </div>
  );
};
