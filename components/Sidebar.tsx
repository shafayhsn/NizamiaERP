
import React, { useState, useEffect, useRef } from 'react';
import { NAV_ITEMS, LOGO_URL, PRODUCTION_TOOLS } from '../constants';
import { Tab } from '../types';
import { 
  Wrench, CalendarRange, CheckSquare, User, LogOut, ChevronUp, 
  ChevronsLeft, ChevronsRight 
} from 'lucide-react';

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onOpenEvents: () => void;
  onOpenTool: (toolId: string) => void; // For opening global modals
  companyLogo?: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, onOpenEvents, onOpenTool, companyLogo }) => {
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toolsMenuRef = useRef<HTMLDivElement>(null);

  const handleUserClick = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      alert("Logged out successfully.");
    }
  };

  // Close tools menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (toolsMenuRef.current && !toolsMenuRef.current.contains(event.target as Node)) {
            setIsToolsOpen(false);
        }
    };
    if (isToolsOpen) document.addEventListener('mousedown', handleClickOutside);
    else document.removeEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isToolsOpen]);

  return (
    <div 
      className={`${isCollapsed ? 'w-20' : 'w-64'} h-screen bg-[#F7F7F5] border-r border-[#E0E0E0] flex flex-col flex-shrink-0 no-print relative transition-all duration-300 ease-in-out`}
    >
      {/* Logo Area & Toggle */}
      <div className={`h-14 flex items-center mb-2 pt-4 transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'px-4 justify-between'}`}>
        {!isCollapsed && (
            <div className="flex items-center gap-3 cursor-pointer group overflow-hidden">
                <div className="w-6 h-6 relative overflow-hidden flex-shrink-0">
                    <img 
                        src={companyLogo || LOGO_URL} 
                        alt="Logo" 
                        className={`object-contain w-full h-full transition-opacity duration-300 ${companyLogo ? '' : 'grayscale opacity-80 group-hover:opacity-100'}`}
                    />
                </div>
                <span className="font-medium text-sm text-[#37352F] tracking-wide opacity-90 group-hover:opacity-100 transition-opacity truncate whitespace-nowrap">
                    {companyLogo ? 'Company Home' : 'Nizamia'}
                </span>
            </div>
        )}
        
        {/* Toggle Button */}
        <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
            {isCollapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 overflow-x-hidden scrollbar-none">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-200 group
              ${activeTab === item.id 
                ? 'bg-[#EFEFED] text-[#37352F] font-medium' 
                : 'text-[#6A6963] hover:bg-[#EFEFED] hover:text-[#37352F]'
              } ${isCollapsed ? 'justify-center' : ''}`}
          >
            <item.icon 
              size={18} 
              className={`flex-shrink-0 transition-opacity duration-200 ${activeTab === item.id ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`} 
            />
            
            {!isCollapsed && <span className="truncate transition-opacity duration-300">{item.label}</span>}

            {/* Tooltip for collapsed state */}
            {isCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity duration-200">
                    {item.label}
                    {/* Tiny arrow */}
                    <div className="absolute top-1/2 right-full -translate-y-1/2 -mr-1 border-4 border-transparent border-r-gray-800"></div>
                </div>
            )}
          </button>
        ))}
      </div>

      {/* TOOLS POPUP MENU (Windows Start Menu Style) */}
      {isToolsOpen && (
          <div 
            ref={toolsMenuRef}
            className={`absolute bottom-16 ${isCollapsed ? 'left-16' : 'left-2'} w-60 bg-white border border-gray-200 rounded-lg shadow-xl z-50 animate-in slide-in-from-bottom-2 fade-in duration-200 overflow-hidden`}
          >
             <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Production Tools</span>
                <ChevronUp size={14} className="text-gray-400" />
             </div>
             
             {/* Quick Actions */}
             <div className="p-2 border-b border-gray-100">
                <button 
                   onClick={() => { onOpenTool('costing-generator'); setIsToolsOpen(false); }}
                   className="w-full text-left px-3 py-2 text-sm font-medium text-[#37352F] hover:bg-green-50 hover:text-green-700 rounded-md transition-colors flex items-center gap-2"
                >
                   <span className="w-2 h-2 rounded-full bg-green-500"></span>
                   New Costing Sheet
                </button>
             </div>

             {/* Calculators Grid */}
             <div className="p-2 grid grid-cols-2 gap-1">
                {PRODUCTION_TOOLS.map(tool => (
                   <button
                      key={tool.id}
                      onClick={() => { onOpenTool(tool.id); setIsToolsOpen(false); }}
                      className="flex flex-col items-center justify-center p-2 rounded-md hover:bg-gray-50 transition-colors text-center group"
                   >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${tool.bg} ${tool.color}`}>
                         <tool.icon size={14} />
                      </div>
                      <span className="text-[10px] text-gray-600 group-hover:text-gray-900 font-medium leading-tight">{tool.title}</span>
                   </button>
                ))}
             </div>
          </div>
      )}

      {/* Bottom Shortcuts Bar */}
      <div className="border-t border-[#E0E0E0] bg-[#F7F7F5] p-2 relative z-40">
        <div className={`flex items-center ${isCollapsed ? 'flex-col gap-3 py-2' : 'justify-between px-2 py-2'} transition-all duration-300`}>
           {/* Tools Trigger */}
           <button 
             onClick={() => setIsToolsOpen(!isToolsOpen)}
             className={`p-2 rounded-md transition-all relative group ${isToolsOpen ? 'bg-[#EFEFED] text-blue-600' : 'text-[#6A6963] hover:text-[#37352F] hover:bg-[#EFEFED]'}`}
             title="Tools Menu"
           >
             <Wrench size={18} />
             {isCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">Tools</div>
             )}
           </button>

           {/* Events Shortcut */}
           <button 
             onClick={onOpenEvents}
             className="p-2 text-[#6A6963] hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all group relative"
             title="Events & Schedule"
           >
             <CalendarRange size={18} />
             {isCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">Calendar</div>
             )}
           </button>

           {/* Tasks (Placeholder) */}
           <button 
             className="p-2 text-[#6A6963] hover:text-[#37352F] hover:bg-[#EFEFED] rounded-md transition-all group relative"
             title="Tasks (Coming Soon)"
           >
             <CheckSquare size={18} />
             {isCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">Tasks</div>
             )}
           </button>

           {/* User / Logout */}
           <button 
             onClick={handleUserClick}
             className="p-2 text-[#6A6963] hover:text-red-600 hover:bg-red-50 rounded-md transition-all group relative"
             title="User Profile / Log Out"
           >
             <User size={18} className="group-hover:hidden" />
             <LogOut size={18} className="hidden group-hover:block" />
             {isCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">Profile</div>
             )}
           </button>
        </div>
      </div>
    </div>
  );
};
