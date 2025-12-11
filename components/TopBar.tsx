
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Menu, Clock, Globe, DollarSign, TrendingUp, Flower2 } from 'lucide-react';

interface TopBarProps {
  currencyRates: { USD: number; EUR: number; GBP: number; };
  cottonRate: number;
  enabledCities: string[];
}

const CITIES: Record<string, string> = {
  'London': 'Europe/London',
  'New York': 'America/New_York',
  'Los Angeles': 'America/Los_Angeles',
  'Barcelona': 'Europe/Madrid',
  'Dubai': 'Asia/Dubai',
  'Istanbul': 'Europe/Istanbul',
  'Melbourne': 'Australia/Melbourne',
};

const CITY_CODES: Record<string, string> = {
  'London': 'LDN',
  'New York': 'NYC',
  'Los Angeles': 'LA',
  'Barcelona': 'BCN',
  'Dubai': 'DXB',
  'Istanbul': 'IST',
  'Melbourne': 'MEL',
};

const NAV_MENUS = [
  {
    label: 'Orders',
    items: ['All Active Orders', 'Create New Order', 'Drafts', 'Archived History']
  },
  {
    label: 'Sampling',
    items: ['Sampling Status', 'Lab Dips', 'Proto Samples', 'Size Sets', 'Testing Reports']
  },
  {
    label: 'Purchasing',
    items: ['Material Demand', 'Issued POs', 'Supplier Database', 'Pending Approvals']
  },
  {
    label: 'Production',
    items: ['Cutting Status', 'Stitching Floor', 'Finishing & Pack', 'Daily Output Log']
  },
  {
    label: 'Reports',
    items: ['Costing Analysis', 'Shipment Summary', 'Efficiency Report', 'Delay Analysis']
  }
];

export const TopBar: React.FC<TopBarProps> = ({ currencyRates, cottonRate, enabledCities }) => {
  const [now, setNow] = useState(new Date());
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setActiveMenu(null);
        }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        clearInterval(timer);
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Limit to 3 cities for display as per requirement
  const displayedCities = enabledCities.slice(0, 3);

  const formatCityTime = (timezone: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: false, timeZone: timezone
      }).format(now);
    } catch { return '--:--'; }
  };

  const getKarachiTimeData = () => {
      const tz = 'Asia/Karachi';
      try {
          const dateStr = now.toLocaleString('en-US', { timeZone: tz });
          const karachiDate = new Date(dateStr);
          
          const day = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(karachiDate);
          const date = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' }).format(karachiDate).replace(/ /g, '-');
          
          const start = new Date(karachiDate.getFullYear(), 0, 1);
          const diff = karachiDate.getTime() - start.getTime() + (start.getTimezoneOffset() - karachiDate.getTimezoneOffset()) * 60 * 1000;
          const oneDay = 1000 * 60 * 60 * 24;
          const week = Math.ceil((Math.floor(diff / oneDay) + 1) / 7);
          
          const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(karachiDate);

          return { day, date, week, time };
      } catch (e) {
          return { day: '-', date: '-', week: '-', time: '-' };
      }
  };

  const kTime = getKarachiTimeData();

  return (
    <div className="h-12 bg-white/95 backdrop-blur-sm border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-40 relative shadow-[0_1px_3px_rgba(0,0,0,0.02)] no-print font-sans select-none">
        
        {/* Left: Navigation Menus */}
        <div className="flex items-center gap-1 shrink-0 mr-4" ref={menuRef}>
            {NAV_MENUS.map((menu) => (
                <div key={menu.label} className="relative group">
                    <button 
                        onClick={() => setActiveMenu(activeMenu === menu.label ? null : menu.label)}
                        onMouseEnter={() => activeMenu && setActiveMenu(menu.label)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 whitespace-nowrap
                            ${activeMenu === menu.label 
                                ? 'bg-gray-100 text-black' 
                                : 'text-gray-600 hover:bg-gray-50 hover:text-black'}`}
                    >
                        {menu.label}
                    </button>

                    {activeMenu === menu.label && (
                        <div className="absolute top-full left-0 mt-1.5 w-56 bg-white border border-gray-200 rounded-lg shadow-xl py-1.5 animate-in fade-in slide-in-from-top-1 duration-150 overflow-hidden z-50">
                            {menu.items.map((item) => (
                                <button 
                                    key={item}
                                    className="w-full text-left px-4 py-2 text-xs text-gray-600 hover:bg-gray-50 hover:text-black transition-colors flex items-center justify-between group/item"
                                    onClick={() => setActiveMenu(null)}
                                >
                                    <span>{item}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>

        {/* Right: Info Group (Scrollable if needed) */}
        <div className="flex-1 flex items-center justify-end overflow-x-auto hide-scrollbar gap-3">
            
            {/* Currency Pill - Always Visible, Compact */}
            <div className="flex items-center bg-gray-50/50 border border-gray-200 rounded-full px-3 py-1 text-[10px] font-medium tracking-tight gap-3 text-gray-500 whitespace-nowrap shrink-0">
                <div className="flex items-center gap-1">
                    <span className="text-gray-400 font-serif italic">$</span>
                    <span className="text-gray-900 font-bold">{currencyRates.USD.toFixed(2)}</span>
                </div>
                <div className="w-px h-2.5 bg-gray-300"></div>
                <div className="flex items-center gap-1">
                    <span className="text-gray-400 font-serif italic">€</span>
                    <span className="text-gray-900 font-bold">{currencyRates.EUR.toFixed(2)}</span>
                </div>
                <div className="w-px h-2.5 bg-gray-300"></div>
                <div className="flex items-center gap-1">
                    <span className="text-gray-400 font-serif italic">£</span>
                    <span className="text-gray-900 font-bold">{currencyRates.GBP.toFixed(2)}</span>
                </div>
                <div className="w-px h-2.5 bg-gray-300"></div>
                <div className="flex items-center gap-1 text-blue-600">
                    <Flower2 size={10} className="text-blue-400" />
                    <span className="font-bold">{cottonRate.toFixed(2)}</span>
                </div>
            </div>

            {/* World Clock Pill - Visible on larger screens or scroll */}
            {displayedCities.length > 0 && (
                <div className="flex items-center bg-gray-50/50 border border-gray-200 rounded-full px-3 py-1 text-[10px] font-medium tracking-tight gap-3 text-gray-500 whitespace-nowrap shrink-0">
                    {displayedCities.map((city, idx) => (
                        <React.Fragment key={city}>
                            {idx > 0 && <div className="w-px h-2.5 bg-gray-300"></div>}
                            <div className="flex items-center gap-1.5">
                                <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">{CITY_CODES[city] || city.substring(0,3)}</span> 
                                <span className="text-gray-900 font-mono">{formatCityTime(CITIES[city])}</span>
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            )}

            {/* Right: Primary Time (Karachi) - Clean Dark Pill */}
            <div className="bg-[#1a1a1a] text-white pl-3 pr-4 py-1.5 rounded-full text-[10px] font-medium tracking-wide shadow-sm flex items-center gap-2.5 hover:bg-black transition-colors cursor-default border border-gray-800 shrink-0">
                <div className="flex items-center gap-1.5 text-gray-400">
                    <Clock size={12} />
                    <span className="uppercase font-bold tracking-wider text-[9px] text-gray-300">KHI</span>
                </div>
                <div className="h-3 w-px bg-gray-600"></div>
                <div className="flex items-center gap-2">
                    <span className="text-gray-200">{kTime.day}</span>
                    <span className="text-gray-300">{kTime.date}</span>
                    <span className="text-white text-[9px] px-1.5 bg-gray-700/80 rounded font-bold">W{kTime.week}</span>
                    <div className="w-px h-2 bg-gray-600 mx-1"></div>
                    <span className="text-white font-mono font-bold">{kTime.time}</span>
                </div>
            </div>

        </div>

    </div>
  );
};
