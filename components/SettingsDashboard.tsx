
import React, { useState } from 'react';
import { 
  RefreshCw, ShieldAlert, Lock, User, Database, Plus, Trash2, Key, Globe, 
  LayoutTemplate, Building, CreditCard, ChevronRight, Upload, X, Image as ImageIcon,
  Briefcase, Edit2, FileText
} from 'lucide-react';
import { CurrencyAutoUpdaterSettings } from './CurrencyAutoUpdaterSettings';
import { CompanyDetails, Department, DocumentType } from '../types';
import { LOGO_URL, DEPT_CODES, DOC_TYPE_CODES } from '../constants';

interface SystemUser {
  id: string;
  name: string;
  username: string;
  role: string;
  lastActive: string;
}

const INITIAL_USERS: SystemUser[] = [
  { id: 'u1', name: 'Jane Doe', username: 'jane.doe', role: 'Senior Merchandiser', lastActive: 'Now' },
  { id: 'u2', name: 'John Smith', username: 'john.s', role: 'Production Manager', lastActive: '2h ago' },
];

// ISO 9001 Compliant Default Departments
const DEFAULT_DEPARTMENTS: Department[] = [
  { id: 'dep-mr', name: 'Merchandising', code: DEPT_CODES.Merchandising, color: '#003366' },
  { id: 'dep-fb', name: 'Fabric', code: DEPT_CODES.Fabric, color: '#008080' },
  { id: 'dep-sr', name: 'Store', code: DEPT_CODES.Store, color: '#FF6600' },
  { id: 'dep-sm', name: 'Sampling', code: DEPT_CODES.Sampling, color: '#9933CC' },
  { id: 'dep-ts', name: 'Testing', code: DEPT_CODES.Testing, color: '#FFCC00' },
  { id: 'dep-ct', name: 'Cutting', code: DEPT_CODES.Cutting, color: '#CC3300' },
  { id: 'dep-ep', name: 'Embellishment', code: DEPT_CODES.Embellishment, color: '#CC0066' },
  { id: 'dep-st', name: 'Stitching', code: DEPT_CODES.Stitching, color: '#556B2F' },
  { id: 'dep-ws', name: 'Washing', code: DEPT_CODES.Washing, color: '#3399FF' },
  { id: 'dep-pk', name: 'Packing', code: DEPT_CODES.Packing, color: '#333333' },
  { id: 'dep-ex', name: 'Export', code: DEPT_CODES.Export, color: '#66CC33' },
  { id: 'dep-ac', name: 'Accounts', code: DEPT_CODES.Accounts, color: '#8B4513' },
];

// ISO 9001 Compliant Document Types
const DEFAULT_DOC_TYPES: DocumentType[] = [
  { id: 'dt-rp', name: 'Report', code: DOC_TYPE_CODES.Report, color: '#607D8B' },
  { id: 'dt-pl', name: 'Plan', code: DOC_TYPE_CODES.Plan, color: '#009688' },
  { id: 'dt-po', name: 'Purchase Order', code: DOC_TYPE_CODES.PurchaseOrder, color: '#3F51B5' },
  { id: 'dt-wo', name: 'Work Order', code: DOC_TYPE_CODES.WorkOrder, color: '#FF9800' },
  { id: 'dt-mi', name: 'Material Issuance', code: DOC_TYPE_CODES.MaterialIssuance, color: '#795548' },
  { id: 'dt-wi', name: 'Work Instruction', code: DOC_TYPE_CODES.WorkInstruction, color: '#9C27B0' },
  { id: 'dt-cl', name: 'Checklist', code: DOC_TYPE_CODES.Checklist, color: '#E91E63' },
  { id: 'dt-iv', name: 'Invoicing', code: DOC_TYPE_CODES.Invoicing, color: '#4CAF50' },
  { id: 'dt-mm', name: 'Meeting Minutes', code: DOC_TYPE_CODES.MeetingMinutes, color: '#2196F3' },
];

const AVAILABLE_CITIES = [
  'London',
  'New York',
  'Los Angeles',
  'Barcelona',
  'Dubai',
  'Istanbul',
  'Melbourne',
];

interface SettingsDashboardProps {
  taxRate?: number;
  onUpdateTaxRate?: (rate: number) => void;
  // Global Currency Props
  currencyRates?: { USD: number; EUR: number; GBP: number; lastUpdated: string };
  onUpdateCurrencyRates?: (rates: { USD: number; EUR: number; GBP: number; lastUpdated: string }) => void;
  
  // Top Bar Props
  cottonRate?: number;
  onUpdateCottonRate?: (rate: number) => void;
  enabledCities?: string[];
  onUpdateEnabledCities?: (cities: string[]) => void;

  // Company Details
  companyDetails?: CompanyDetails;
  onUpdateCompanyDetails?: (details: CompanyDetails) => void;
}

type SettingSection = 'General' | 'Company' | 'Departments' | 'Users' | 'Market' | 'System';

export const SettingsDashboard: React.FC<SettingsDashboardProps> = ({ 
  taxRate = 5.0, 
  onUpdateTaxRate,
  currencyRates,
  onUpdateCurrencyRates,
  cottonRate = 95.50,
  onUpdateCottonRate,
  enabledCities = [],
  onUpdateEnabledCities,
  companyDetails,
  onUpdateCompanyDetails
}) => {
  const [activeSection, setActiveSection] = useState<SettingSection>('General');
  
  // Reset Logic
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // User Management State
  const [users, setUsers] = useState<SystemUser[]>(INITIAL_USERS);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', username: '', password: '', role: 'Merchandiser' });

  // Departments State
  const [departments, setDepartments] = useState<Department[]>(DEFAULT_DEPARTMENTS);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Partial<Department>>({ name: '', code: '', color: '#000000' });

  // Document Types State
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>(DEFAULT_DOC_TYPES);
  const [isDocTypeModalOpen, setIsDocTypeModalOpen] = useState(false);
  const [editingDocType, setEditingDocType] = useState<Partial<DocumentType>>({ name: '', code: '', color: '#000000' });

  // Company Details Local State (if prop is missing, fallback to empty)
  const safeCompanyDetails = companyDetails || {
      name: '', address: '', phone: '', website: '', logoUrl: null
  };

  const handleReset = () => {
    if (password === 'admin') {
      window.location.reload();
    } else {
      setError('Incorrect password');
    }
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm("Are you sure you want to remove this user?")) {
        setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password) return;
    
    const user: SystemUser = {
        id: `u-${Date.now()}`,
        name: newUser.name,
        username: newUser.username,
        role: newUser.role,
        lastActive: 'Never'
    };
    
    setUsers([...users, user]);
    setNewUser({ name: '', username: '', password: '', role: 'Merchandiser' });
    setIsUserModalOpen(false);
  };

  // Department Handlers
  const handleSaveDepartment = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingDept.name || !editingDept.code) return;

      if (editingDept.id) {
          // Edit
          setDepartments(departments.map(d => d.id === editingDept.id ? { ...d, ...editingDept } as Department : d));
      } else {
          // Add
          const newDept: Department = {
              id: `dep-${Date.now()}`,
              name: editingDept.name,
              code: editingDept.code,
              color: editingDept.color || '#000000'
          };
          setDepartments([...departments, newDept]);
      }
      setIsDeptModalOpen(false);
      setEditingDept({ name: '', code: '', color: '#000000' });
  };

  const handleDeleteDepartment = (id: string) => {
      if(window.confirm("Delete this department?")) {
          setDepartments(departments.filter(d => d.id !== id));
      }
  };

  const openDeptModal = (dept?: Department) => {
      if (dept) {
          setEditingDept(dept);
      } else {
          setEditingDept({ name: '', code: '', color: '#333333' });
      }
      setIsDeptModalOpen(true);
  };

  // Document Type Handlers
  const handleSaveDocType = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingDocType.name || !editingDocType.code) return;

      if (editingDocType.id) {
          // Edit
          setDocumentTypes(documentTypes.map(d => d.id === editingDocType.id ? { ...d, ...editingDocType } as DocumentType : d));
      } else {
          // Add
          const newDoc: DocumentType = {
              id: `dt-${Date.now()}`,
              name: editingDocType.name,
              code: editingDocType.code,
              color: editingDocType.color || '#000000'
          };
          setDocumentTypes([...documentTypes, newDoc]);
      }
      setIsDocTypeModalOpen(false);
      setEditingDocType({ name: '', code: '', color: '#000000' });
  };

  const handleDeleteDocType = (id: string) => {
      if(window.confirm("Delete this document type?")) {
          setDocumentTypes(documentTypes.filter(d => d.id !== id));
      }
  };

  const openDocTypeModal = (docType?: DocumentType) => {
      if (docType) {
          setEditingDocType(docType);
      } else {
          setEditingDocType({ name: '', code: '', color: '#333333' });
      }
      setIsDocTypeModalOpen(true);
  };

  const toggleCity = (city: string) => {
    if (!onUpdateEnabledCities) return;
    if (enabledCities.includes(city)) {
      onUpdateEnabledCities(enabledCities.filter(c => c !== city));
    } else {
      onUpdateEnabledCities([...enabledCities, city]);
    }
  };

  const handleCompanyChange = (field: keyof CompanyDetails, value: string) => {
      if (onUpdateCompanyDetails) {
          onUpdateCompanyDetails({ ...safeCompanyDetails, [field]: value });
      }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0] && onUpdateCompanyDetails) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              onUpdateCompanyDetails({ ...safeCompanyDetails, logoUrl: ev.target?.result as string });
          };
          reader.readAsDataURL(e.target.files[0]);
      }
  };

  const removeLogo = () => {
      if (onUpdateCompanyDetails) {
          onUpdateCompanyDetails({ ...safeCompanyDetails, logoUrl: null });
      }
  };

  const NAV_ITEMS = [
      { id: 'General', label: 'General', icon: LayoutTemplate },
      { id: 'Company', label: 'Company Profile', icon: Building },
      { id: 'Departments', label: 'Departments', icon: Briefcase },
      { id: 'Users', label: 'Users & Access', icon: User },
      { id: 'Market', label: 'Market Data', icon: Globe },
      { id: 'System', label: 'System Data', icon: Database },
  ];

  return (
    <div className="flex h-full bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      
      {/* Sidebar */}
      <div className="w-64 bg-[#F7F7F5] border-r border-[#E0E0E0] flex flex-col py-4">
         <div className="px-4 mb-4">
            <h2 className="text-sm font-bold text-[#37352F]">System Preferences</h2>
         </div>
         <div className="flex-1 space-y-0.5 px-2">
            {NAV_ITEMS.map(item => (
                <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id as SettingSection)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors
                        ${activeSection === item.id ? 'bg-[#EFEFED] text-[#37352F] font-medium' : 'text-gray-600 hover:bg-[#EFEFED]'}`}
                >
                    <item.icon size={16} className={activeSection === item.id ? 'text-[#37352F]' : 'text-gray-400'} />
                    {item.label}
                </button>
            ))}
         </div>
         
         <div className="px-4 pt-4 border-t border-[#E0E0E0] mt-auto">
             <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                    JD
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#37352F] truncate">Jane Doe</p>
                    <p className="text-[10px] text-gray-500 truncate">Senior Merchandiser</p>
                 </div>
             </div>
         </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8">
         <div className="max-w-3xl mx-auto space-y-8">
            
            {/* GENERAL SETTINGS */}
            {activeSection === 'General' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div>
                        <h2 className="text-xl font-bold text-[#37352F] mb-1">General Settings</h2>
                        <p className="text-sm text-gray-500">Configure application defaults and top bar widgets.</p>
                    </div>

                    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-2">Default Sales Tax Rate (%)</label>
                            <input 
                                type="number" 
                                step="0.1"
                                value={taxRate} 
                                onChange={(e) => onUpdateTaxRate && onUpdateTaxRate(parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                            />
                            <p className="text-xs text-gray-400 mt-1">Applied by default to new Purchase Orders.</p>
                        </div>
                    </div>

                    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-gray-700">Top Bar World Clock</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {AVAILABLE_CITIES.map(city => (
                                <label key={city} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors">
                                    <input 
                                        type="checkbox" 
                                        checked={enabledCities.includes(city)}
                                        onChange={() => toggleCity(city)}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">{city}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* COMPANY PROFILE */}
            {activeSection === 'Company' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div>
                        <h2 className="text-xl font-bold text-[#37352F] mb-1">Company Profile</h2>
                        <p className="text-sm text-gray-500">Manage company details used in printables and branding.</p>
                    </div>

                    <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm space-y-6">
                        {/* Logo Upload */}
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center relative group overflow-hidden">
                                {safeCompanyDetails.logoUrl ? (
                                    <img src={safeCompanyDetails.logoUrl} alt="Company Logo" className="w-full h-full object-contain" />
                                ) : (
                                    <ImageIcon size={32} className="text-gray-300" />
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                                    <label htmlFor="logo-upload" className="cursor-pointer text-white text-[10px] uppercase font-bold hover:underline">
                                        Change
                                    </label>
                                    {safeCompanyDetails.logoUrl && (
                                        <button onClick={removeLogo} className="text-red-300 text-[10px] uppercase font-bold hover:text-red-100 hover:underline">
                                            Remove
                                        </button>
                                    )}
                                </div>
                                <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-700">Company Logo</h3>
                                <p className="text-xs text-gray-500 mt-1 max-w-xs">
                                    Upload a PNG or JPG file. This logo will appear on the sidebar and all purchase orders.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Company Name</label>
                                <input 
                                    type="text" 
                                    value={safeCompanyDetails.name} 
                                    onChange={(e) => handleCompanyChange('name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Address</label>
                                <textarea 
                                    rows={3}
                                    value={safeCompanyDetails.address} 
                                    onChange={(e) => handleCompanyChange('address', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Phone</label>
                                    <input 
                                        type="text" 
                                        value={safeCompanyDetails.phone} 
                                        onChange={(e) => handleCompanyChange('phone', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Website</label>
                                    <input 
                                        type="text" 
                                        value={safeCompanyDetails.website} 
                                        onChange={(e) => handleCompanyChange('website', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* DEPARTMENTS SETTINGS */}
            {activeSection === 'Departments' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                    
                    {/* Organization Departments */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-[#37352F] mb-1">Departments</h2>
                                <p className="text-sm text-gray-500">ISO 9001 standardized codes for document control.</p>
                            </div>
                            <button 
                                onClick={() => openDeptModal()}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wide bg-[#37352F] text-white rounded hover:bg-black transition-colors"
                            >
                                <Plus size={12} /> Add Department
                            </button>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 w-20 text-center">Color</th>
                                        <th className="px-6 py-3">Department Name</th>
                                        <th className="px-6 py-3">ISO Code</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {departments.map(dept => (
                                        <tr key={dept.id} className="hover:bg-gray-50 group">
                                            <td className="px-6 py-3 text-center">
                                                <div 
                                                    className="w-6 h-6 rounded-full border border-gray-200 shadow-sm mx-auto" 
                                                    style={{ backgroundColor: dept.color }}
                                                    title={dept.color}
                                                ></div>
                                            </td>
                                            <td className="px-6 py-3 font-medium text-gray-900">{dept.name}</td>
                                            <td className="px-6 py-3">
                                                <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 text-gray-600">
                                                    {dept.code}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openDeptModal(dept)} className="text-gray-400 hover:text-blue-600 p-1">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteDepartment(dept.id)} className="text-gray-400 hover:text-red-500 p-1">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="h-px bg-gray-200"></div>

                    {/* Document Types */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-[#37352F] mb-1">Document Types</h2>
                                <p className="text-sm text-gray-500">ISO 9001 classification codes.</p>
                            </div>
                            <button 
                                onClick={() => openDocTypeModal()}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wide bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <Plus size={12} /> Add Doc Type
                            </button>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 w-16 text-center"></th>
                                        <th className="px-6 py-3">Document Name</th>
                                        <th className="px-6 py-3">ISO Code</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {documentTypes.map(doc => (
                                        <tr key={doc.id} className="hover:bg-gray-50 group">
                                            <td className="px-6 py-3 text-center">
                                                <div 
                                                    className="w-8 h-8 rounded bg-opacity-10 border flex items-center justify-center mx-auto" 
                                                    style={{ backgroundColor: `${doc.color}20`, borderColor: doc.color, color: doc.color }}
                                                >
                                                    <FileText size={16} />
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 font-medium text-gray-900">{doc.name}</td>
                                            <td className="px-6 py-3">
                                                <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 text-gray-600">
                                                    {doc.code}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openDocTypeModal(doc)} className="text-gray-400 hover:text-blue-600 p-1">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteDocType(doc.id)} className="text-gray-400 hover:text-red-500 p-1">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            )}

            {/* USERS SETTINGS */}
            {activeSection === 'Users' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-[#37352F] mb-1">Users & Access</h2>
                            <p className="text-sm text-gray-500">Manage team members and roles.</p>
                        </div>
                        <button 
                            onClick={() => setIsUserModalOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wide bg-[#37352F] text-white rounded hover:bg-black transition-colors"
                        >
                            <Plus size={12} /> Add User
                        </button>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Role</th>
                                    <th className="px-4 py-3 text-right">Last Active</th>
                                    <th className="px-4 py-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900">{user.name}</div>
                                            <div className="text-xs text-gray-500">@{user.username}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs border border-gray-200 font-medium">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-500 text-xs">{user.lastActive}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => handleDeleteUser(user.id)} className="text-gray-400 hover:text-red-500 p-1">
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MARKET DATA */}
            {activeSection === 'Market' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div>
                        <h2 className="text-xl font-bold text-[#37352F] mb-1">Market Data Feed</h2>
                        <p className="text-sm text-gray-500">Configure live currency and commodity rate updates.</p>
                    </div>
                    {currencyRates && onUpdateCurrencyRates && (
                        <CurrencyAutoUpdaterSettings 
                            currentRates={currencyRates}
                            onUpdateRates={onUpdateCurrencyRates}
                            cottonRate={cottonRate}
                            onUpdateCottonRate={onUpdateCottonRate}
                        />
                    )}
                </div>
            )}

            {/* SYSTEM DATA */}
            {activeSection === 'System' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div>
                        <h2 className="text-xl font-bold text-[#37352F] mb-1">System Data</h2>
                        <p className="text-sm text-gray-500">Manage application data and resets.</p>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-red-100 rounded-full text-red-600">
                                <ShieldAlert size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-red-800 mb-1">Reset Application Data</h3>
                                <p className="text-xs text-red-700 leading-relaxed mb-4">
                                    This action is destructive and cannot be undone. It will revert all orders, styles, and settings to their initial state.
                                </p>
                                <button 
                                    onClick={() => setIsResetModalOpen(true)}
                                    className="px-4 py-2 bg-white border border-red-300 text-red-600 font-bold text-xs rounded hover:bg-red-100 transition-colors shadow-sm"
                                >
                                    Reset All Data
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

         </div>
      </div>

      {/* --- MODALS --- */}

      {/* Add User Modal */}
      {isUserModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-[#37352F]">Create New User</h3>
                    <button onClick={() => setIsUserModalOpen(false)}><X size={20} className="text-gray-400" /></button>
                </div>
                <form onSubmit={handleCreateUser} className="space-y-4">
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                       <input required type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-gray-500 uppercase">Username</label>
                       <input required type="text" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
                       <input required type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-gray-500 uppercase">Role</label>
                       <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-blue-500 bg-white">
                          <option value="Merchandiser">Merchandiser</option>
                          <option value="Production Manager">Production Manager</option>
                          <option value="Admin">Admin</option>
                       </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                       <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                       <button type="submit" className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 shadow-sm">Create User</button>
                    </div>
                </form>
             </div>
          </div>
       )}

       {/* Add/Edit Department Modal */}
       {isDeptModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-[#37352F]">{editingDept.id ? 'Edit Department' : 'New Department'}</h3>
                    <button onClick={() => setIsDeptModalOpen(false)}><X size={20} className="text-gray-400" /></button>
                </div>
                <form onSubmit={handleSaveDepartment} className="space-y-4">
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-gray-500 uppercase">Department Name</label>
                       <input 
                          required 
                          type="text" 
                          value={editingDept.name} 
                          onChange={e => setEditingDept({...editingDept, name: e.target.value})} 
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" 
                          placeholder="e.g. Merchandising"
                       />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                           <label className="text-xs font-bold text-gray-500 uppercase">Short Code</label>
                           <input 
                              required 
                              type="text" 
                              value={editingDept.code} 
                              onChange={e => setEditingDept({...editingDept, code: e.target.value.toUpperCase()})} 
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-blue-500 font-mono" 
                              placeholder="MR"
                              maxLength={3}
                           />
                        </div>
                        <div className="space-y-1">
                           <label className="text-xs font-bold text-gray-500 uppercase">Color</label>
                           <div className="flex gap-2">
                               <input 
                                  type="color" 
                                  value={editingDept.color} 
                                  onChange={e => setEditingDept({...editingDept, color: e.target.value})} 
                                  className="h-9 w-12 p-0 border border-gray-300 rounded cursor-pointer" 
                               />
                               <input 
                                  type="text" 
                                  value={editingDept.color} 
                                  onChange={e => setEditingDept({...editingDept, color: e.target.value})} 
                                  className="w-full px-2 py-2 border border-gray-300 rounded text-xs outline-none font-mono" 
                                  placeholder="#000000"
                               />
                           </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-2">
                       <button type="button" onClick={() => setIsDeptModalOpen(false)} className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                       <button type="submit" className="px-3 py-2 text-sm bg-[#37352F] text-white rounded hover:bg-black shadow-sm">Save Department</button>
                    </div>
                </form>
             </div>
          </div>
       )}

       {/* Add/Edit Document Type Modal */}
       {isDocTypeModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-[#37352F]">{editingDocType.id ? 'Edit Document Type' : 'New Document Type'}</h3>
                    <button onClick={() => setIsDocTypeModalOpen(false)}><X size={20} className="text-gray-400" /></button>
                </div>
                <form onSubmit={handleSaveDocType} className="space-y-4">
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-gray-500 uppercase">Document Name</label>
                       <input 
                          required 
                          type="text" 
                          value={editingDocType.name} 
                          onChange={e => setEditingDocType({...editingDocType, name: e.target.value})} 
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" 
                          placeholder="e.g. Invoice"
                       />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                           <label className="text-xs font-bold text-gray-500 uppercase">Short Code</label>
                           <input 
                              required 
                              type="text" 
                              value={editingDocType.code} 
                              onChange={e => setEditingDocType({...editingDocType, code: e.target.value.toUpperCase()})} 
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-blue-500 font-mono" 
                              placeholder="INV"
                              maxLength={4}
                           />
                        </div>
                        <div className="space-y-1">
                           <label className="text-xs font-bold text-gray-500 uppercase">Color Tag</label>
                           <div className="flex gap-2">
                               <input 
                                  type="color" 
                                  value={editingDocType.color} 
                                  onChange={e => setEditingDocType({...editingDocType, color: e.target.value})} 
                                  className="h-9 w-12 p-0 border border-gray-300 rounded cursor-pointer" 
                               />
                               <input 
                                  type="text" 
                                  value={editingDocType.color} 
                                  onChange={e => setEditingDocType({...editingDocType, color: e.target.value})} 
                                  className="w-full px-2 py-2 border border-gray-300 rounded text-xs outline-none font-mono" 
                                  placeholder="#000000"
                               />
                           </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-2">
                       <button type="button" onClick={() => setIsDocTypeModalOpen(false)} className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                       <button type="submit" className="px-3 py-2 text-sm bg-[#37352F] text-white rounded hover:bg-black shadow-sm">Save Doc Type</button>
                    </div>
                </form>
             </div>
          </div>
       )}

       {/* Reset Confirmation Modal */}
       {isResetModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 space-y-4">
                <div className="flex items-center gap-2 text-red-600">
                   <ShieldAlert size={24} />
                   <h3 className="text-lg font-bold">Confirm Reset</h3>
                </div>
                <p className="text-sm text-gray-600">Enter admin password to proceed with factory reset.</p>
                <div className="space-y-1">
                   <input 
                        type="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleReset()}
                        autoFocus
                   />
                   {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                   <button onClick={() => setIsResetModalOpen(false)} className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                   <button onClick={handleReset} className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 shadow-sm">Confirm Reset</button>
                </div>
             </div>
          </div>
       )}

    </div>
  );
};
