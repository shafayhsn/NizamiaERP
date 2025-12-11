
import React, { useState, useMemo } from 'react';
import { 
  DollarSign, AlertTriangle, Calendar, CheckCircle2, 
  Search, ShoppingCart, Clock, AlertCircle,
  FileText, X, Receipt, Filter, Eye, Hash,
  Link, Printer, CheckSquare, Square, FileStack
} from 'lucide-react';
import { MOCK_SUPPLIERS, LOGO_URL, generateISODocID, DEPT_CODES, DOC_TYPE_CODES } from '../constants';
import { Order, JobBatch, PurchasingRequest, CompanyDetails, IssuedPurchaseOrder, POLineItem, POItemVariant, ISODocumentMetadata } from '../types';
import { formatAppDate } from '../constants';

// --- Types & Interfaces ---

type MaterialStatus = 'Unpurchased' | 'PO Issued' | 'Received';

interface MaterialDemandItem {
  id: string;        // Unique demand ID (from purchasing request ID)
  bomItemId: string; // Placeholder or link
  jobId: string;     // Link to parent Job
  materialName: string;
  specification: string;
  category: string;
  requiredQty: number;
  unit: string;
  unitPrice: number;
  supplierName: string;
  inHouseDueDate: string;
  status: MaterialStatus;
  poNumber?: string;
  breakdown?: string; // New Field for displaying breakdown
  variantMap?: Record<string, number>; // Breakdown data
}

interface DraftItemVariant {
  id: string;
  usage: string; // The breakdown key
  note: string; // Editable note
  qty: number | string; // Editable qty
  rate: number | string; // Editable rate
  unit: string;
}

interface DraftItem {
  id: string;
  sourceIds: string[]; // To track which requests are merged into this line
  materialName: string;
  specification: string;
  variants: DraftItemVariant[];
}

interface DraftPOState {
  poNumber: string;
  supplierName: string;
  currency: string;
  taxRate: number;
  applyTax: boolean; 
  creditTerms: string;
  items: DraftItem[];
}

interface PurchasingDashboardProps {
  orders?: Order[];
  jobs: JobBatch[]; 
  taxRate?: number; 
  companyDetails?: CompanyDetails;
  currentUser?: string;
  issuedPOs: IssuedPurchaseOrder[];
  onUpdateIssuedPOs: (pos: IssuedPurchaseOrder[]) => void;
  onUpdateJobs?: (jobs: JobBatch[]) => void; // Added prop
}

interface PrintOptions {
  original: boolean;
  merchandiser: boolean;
  accounts: boolean;
  store: boolean;
}

const CREDIT_TERMS_OPTIONS = [
  "Cash", "15 Days", "30 Days", "45 Days", "60 Days", "75 Days", "90 Days", "120 Days"
];

// Simple Number to Words Converter (up to millions)
const numberToWords = (num: number, currency: string = 'PKR'): string => {
  const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
  const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];

  // Simplified robust implementation
  const numToText = (n: number): string => {
      if (n === 0) return '';
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
      if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + numToText(n % 100);
      if (n < 1000000) return numToText(Math.floor(n / 1000)) + 'Thousand ' + numToText(n % 1000);
      if (n < 1000000000) return numToText(Math.floor(n / 1000000)) + 'Million ' + numToText(n % 1000000);
      return 'Lots of';
  };

  const whole = Math.floor(num);
  const decimal = Math.round((num - whole) * 100);
  
  let str = numToText(whole);
  // Add Currency Name
  str += " " + currency;
  
  if (decimal > 0) {
      str += ` and ${numToText(decimal)} Cents/Paisa`;
  }
  return str + " Only";
};

export const PurchasingDashboard: React.FC<PurchasingDashboardProps> = ({ 
  orders = [], 
  jobs = [], 
  taxRate = 5.0, 
  companyDetails, 
  currentUser,
  issuedPOs,
  onUpdateIssuedPOs,
  onUpdateJobs
}) => {
  const [activeTab, setActiveTab] = useState<'Demand' | 'POs'>('Demand');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | MaterialStatus>('All');

  // Modal & Notification State
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [draftPO, setDraftPO] = useState<DraftPOState | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Print Modal State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [poToPrint, setPoToPrint] = useState<IssuedPurchaseOrder | null>(null);
  const [printOptions, setPrintOptions] = useState<PrintOptions>({
    original: true,
    merchandiser: false,
    accounts: false,
    store: false
  });

  // --- Dynamic Data Generation ---

  const materialDemand: MaterialDemandItem[] = useMemo(() => {
    const allRequests: MaterialDemandItem[] = [];

    jobs.forEach(job => {
        if (job.purchasingRequests && job.purchasingRequests.length > 0) {
            job.purchasingRequests.forEach(req => {
                allRequests.push({
                    id: req.id,
                    bomItemId: '-', 
                    jobId: job.id,
                    materialName: req.materialName,
                    specification: req.specs || '-',
                    category: 'Material', 
                    requiredQty: req.qty,
                    unit: req.unit,
                    unitPrice: req.unitPrice || 0, // Load persisted price if available
                    supplierName: req.supplier || 'TBD',
                    inHouseDueDate: new Date(new Date(req.dateRequested).setDate(new Date(req.dateRequested).getDate() + 14)).toISOString().split('T')[0], 
                    status: req.status === 'PO Issued' ? 'PO Issued' : 'Unpurchased',
                    poNumber: req.poNumber, // Use actual stored PO number
                    breakdown: req.breakdown,
                    variantMap: req.variantMap
                });
            });
        }
    });

    return allRequests;
  }, [jobs]);

  const [localDemandState, setLocalDemandState] = useState<MaterialDemandItem[]>([]);
  
  useMemo(() => {
     setLocalDemandState(materialDemand);
  }, [materialDemand]);


  // --- Helpers & Logic ---

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getRiskLevel = (item: MaterialDemandItem) => {
    if (item.status !== 'Unpurchased') return 'none';
    if (item.inHouseDueDate === 'TBD') return 'none';
    
    const dueDate = new Date(item.inHouseDueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'critical';
    if (diffDays <= 7) return 'high';
    return 'normal';
  };

  // --- Computed Data ---

  const filteredDemand = useMemo(() => {
    return localDemandState.filter(item => {
      const s = searchTerm.toLowerCase();
      const matchesSearch = 
        (item.materialName || '').toLowerCase().includes(s) ||
        (item.supplierName || '').toLowerCase().includes(s) ||
        (item.jobId || '').toLowerCase().includes(s);
      
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [localDemandState, searchTerm, statusFilter]);
  
  const filteredPOs = useMemo(() => {
    return issuedPOs.filter(po => {
      const s = searchTerm.toLowerCase();
      return (po.poNumber || '').toLowerCase().includes(s) || (po.supplierName || '').toLowerCase().includes(s);
    });
  }, [issuedPOs, searchTerm]);

  const overdueItems = useMemo(() => {
    return localDemandState.filter(item => {
      const risk = getRiskLevel(item);
      return risk === 'critical';
    });
  }, [localDemandState]);
  
  // --- Handlers ---

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const ids = filteredDemand.filter(i => i.status === 'Unpurchased').map(i => i.id);
      setSelectedItems(new Set(ids));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleGeneratePOClick = () => {
    if (selectedItems.size === 0) return;

    const itemsToPurchase = localDemandState.filter(item => selectedItems.has(item.id));
    
    const suppliers = new Set(itemsToPurchase.map(i => i.supplierName));
    if (suppliers.size > 1) {
      alert("Error: Please select items from a single supplier to generate a consolidated Purchase Order.");
      return;
    }

    const supplierName = itemsToPurchase[0].supplierName;
    const poNumber = `PO-${supplierName.substring(0,3).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;

    // Consolidate Items by Name for Draft View
    const consolidatedMap = new Map<string, DraftItem>();

    itemsToPurchase.forEach(item => {
        const key = item.materialName;
        if (!consolidatedMap.has(key)) {
            consolidatedMap.set(key, {
                id: item.id, // Use first ID as ref key
                sourceIds: [item.id],
                materialName: item.materialName,
                specification: item.specification,
                variants: []
            });
        }
        
        const entry = consolidatedMap.get(key)!;
        entry.sourceIds.push(item.id);
        
        // Explode variants into rows
        if (item.variantMap) {
            Object.entries(item.variantMap).forEach(([k, v]) => {
                // Check if this variant usage key already exists for this material, if so, accumulate
                const existingVariant = entry.variants.find(vr => vr.usage === k);
                if (existingVariant) {
                    existingVariant.qty = Number(existingVariant.qty) + (v as number);
                } else {
                    entry.variants.push({
                        id: `var-${key}-${k}-${Math.random()}`,
                        usage: k,
                        note: '', // Default empty note
                        qty: v as number,
                        rate: item.unitPrice || 0, // Default to agreed price
                        unit: item.unit
                    });
                }
            });
        } else {
            // Generic single variant
            const existingGeneric = entry.variants.find(vr => vr.usage === 'Generic');
            if (existingGeneric) {
                existingGeneric.qty = Number(existingGeneric.qty) + item.requiredQty;
            } else {
                entry.variants.push({
                    id: `var-${key}-gen`,
                    usage: '-',
                    note: '',
                    qty: item.requiredQty,
                    rate: item.unitPrice || 0,
                    unit: item.unit
                });
            }
        }
    });

    const draftItems = Array.from(consolidatedMap.values());

    setDraftPO({
      poNumber,
      supplierName,
      currency: 'PKR',
      taxRate: taxRate || 5.0, 
      applyTax: true, 
      creditTerms: '30 Days',
      items: draftItems
    });
    setIsPOModalOpen(true);
  };

  const updateVariant = (itemId: string, variantId: string, field: keyof DraftItemVariant, value: string) => {
    setDraftPO(prev => {
      if (!prev) return null;
      return {
        ...prev,
        items: prev.items.map(item => {
            if (item.id !== itemId) return item;
            return {
                ...item,
                variants: item.variants.map(v => {
                    if (v.id !== variantId) return v;
                    return { ...v, [field]: value };
                })
            };
        })
      };
    });
  };

  const handleConfirmPO = () => {
    if (!draftPO) return;

    let subtotal = 0;
    const finalLines: POLineItem[] = [];

    // Process all items and variants
    draftPO.items.forEach(item => {
        const variants: POItemVariant[] = item.variants.map(v => {
            const qty = Number(v.qty) || 0;
            const rate = Number(v.rate) || 0;
            const amount = qty * rate;
            subtotal += amount;
            
            return {
                id: v.id,
                usage: v.usage,
                note: v.note,
                unit: v.unit,
                quantity: qty,
                rate: rate,
                amount: amount
            };
        });

        finalLines.push({
            id: item.id,
            materialName: item.materialName,
            description: item.specification,
            variants: variants
        });
    });

    const taxAmount = draftPO.applyTax ? (subtotal * (draftPO.taxRate / 100)) : 0;
    const totalAmount = subtotal + taxAmount;

    // ISO Document Control Logic
    // Find associated job ID from selected items (assume primary job if multiple)
    const primaryItem = localDemandState.find(item => selectedItems.has(item.id));
    const linkedJobId = primaryItem ? primaryItem.jobId : '';
    
    const isoMetadata: ISODocumentMetadata = {
        documentControlNumber: generateISODocID(
            linkedJobId, 
            DEPT_CODES.Merchandising, // Default Department for Purchasing initiated here
            DOC_TYPE_CODES.PurchaseOrder, 
            issuedPOs.length + 1 // Sequential logic
        ),
        revisionLevel: '1.0',
        docStatus: 'Current'
    };

    const newPO: IssuedPurchaseOrder = {
      id: Math.random().toString(36).substr(2, 9),
      poNumber: draftPO.poNumber,
      supplierName: draftPO.supplierName,
      dateIssued: new Date().toISOString().split('T')[0],
      currency: draftPO.currency,
      taxRate: draftPO.taxRate,
      applyTax: draftPO.applyTax,
      subtotal,
      taxAmount,
      totalAmount,
      itemCount: draftPO.items.length,
      status: 'Issued',
      creditTerms: draftPO.creditTerms,
      lines: finalLines, // Persist structured data
      isoMetadata // Attach ISO Data
    };

    // 1. Update Issued POs List
    onUpdateIssuedPOs([newPO, ...issuedPOs]);

    // 2. Update Local State & Persist
    const updates = new Map<string, number>(); // sourceId -> avgPrice
    draftPO.items.forEach(item => {
        const totalVal = item.variants.reduce((acc, v) => acc + (Number(v.qty) * Number(v.rate)), 0);
        const totalQ = item.variants.reduce((acc, v) => acc + Number(v.qty), 0);
        const avgPrice = totalQ > 0 ? totalVal / totalQ : 0;
        item.sourceIds.forEach(sid => updates.set(sid, avgPrice));
    });

    setLocalDemandState(prev => prev.map(item => {
      if (selectedItems.has(item.id)) {
        return { 
          ...item, 
          status: 'PO Issued',
          poNumber: draftPO.poNumber,
          unitPrice: updates.get(item.id) || item.unitPrice
        };
      }
      return item;
    }));

    if (onUpdateJobs) {
       const updatedJobs = jobs.map(job => {
          if (!job.purchasingRequests) return job;
          const hasUpdates = job.purchasingRequests.some(req => selectedItems.has(req.id));
          if (!hasUpdates) return job;

          const updatedRequests = job.purchasingRequests.map(req => {
             if (selectedItems.has(req.id)) {
                return { 
                    ...req, 
                    status: 'PO Issued', 
                    poNumber: draftPO.poNumber,
                    unitPrice: updates.get(req.id) || req.unitPrice
                } as PurchasingRequest;
             }
             return req;
          });
          return { ...job, purchasingRequests: updatedRequests };
       });
       onUpdateJobs(updatedJobs);
    }

    setSuccessMessage(`Successfully created ${newPO.poNumber} (Doc No: ${isoMetadata.documentControlNumber})`);
    setTimeout(() => setSuccessMessage(null), 4000);

    setIsPOModalOpen(false);
    setSelectedItems(new Set());
    setDraftPO(null);
    setActiveTab('POs');
  };

  // --- PRINT PO FUNCTIONALITY ---
  const initiatePrint = (po: IssuedPurchaseOrder) => {
    setPoToPrint(po);
    setIsPrintModalOpen(true);
  };

  const executePrint = () => {
    if (!poToPrint) return;
    
    const activeCopies: string[] = [];
    if (printOptions.original) activeCopies.push("ORIGINAL");
    if (printOptions.merchandiser) activeCopies.push("MERCHANDISER'S COPY");
    if (printOptions.accounts) activeCopies.push("ACCOUNTS COPY");
    if (printOptions.store) activeCopies.push("STORE COPY");

    if (activeCopies.length === 0) {
        alert("Please select at least one copy to print.");
        return;
    }

    const printWindow = window.open('', '_blank', 'width=1000,height=900');
    if (!printWindow) return;

    // Use persisted lines if available, otherwise fallback to reconstruction (for old POs)
    let poLines = poToPrint.lines || [];
    
    // Fallback reconstruction logic for older POs without 'lines'
    if (poLines.length === 0) {
        const rawItems = materialDemand.filter(item => item.poNumber === poToPrint.poNumber);
        const grouped = new Map<string, POLineItem>();
        
        rawItems.forEach(item => {
            if (!grouped.has(item.materialName)) {
                grouped.set(item.materialName, {
                    id: item.id,
                    materialName: item.materialName,
                    description: item.specification,
                    variants: []
                });
            }
            const entry = grouped.get(item.materialName)!;
            // Simple generic variant recreation
            entry.variants.push({
                id: item.id,
                usage: '-',
                note: '',
                unit: item.unit,
                quantity: item.requiredQty,
                rate: item.unitPrice,
                amount: item.requiredQty * item.unitPrice
            });
        });
        poLines = Array.from(grouped.values());
    }

    const supplierInfo = MOCK_SUPPLIERS.find(s => s.name === poToPrint.supplierName);
    const supplierAddress = supplierInfo?.address || 'Address on file';
    const supplierPhone = supplierInfo?.phone || '';
    const supplierSalesTax = supplierInfo?.salesTaxId || '1234567890';
    
    const companyName = companyDetails?.name || "Nizamia Apparels";
    const companyAddress = companyDetails?.address || "Plot# RCC14, Shed Nr 02, Estate Avenue Road, SITE Area, Karachi 75700, Pakistan";
    const companyPhone = companyDetails?.phone || "+92 21 2564717";
    const companyLogo = companyDetails?.logoUrl || LOGO_URL;
    
    // Extract job number from the first item if available in demand (heuristic)
    const linkedJob = materialDemand.find(m => m.poNumber === poToPrint.poNumber)?.jobId || 'N/A';

    const f = (n: number) => n.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    const amountInWords = numberToWords(poToPrint.totalAmount, poToPrint.currency);
    const now = new Date();
    const printDate = `${now.toLocaleDateString('en-GB')} at ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;

    const renderTableRows = () => {
        let globalIndex = 1;
        return poLines.map((line) => {
            const rowCount = line.variants.length;
            
            return line.variants.map((variant, vIndex) => `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                    ${vIndex === 0 ? `<td class="py-2 text-center text-gray-700 text-sm align-top border-r border-gray-300 font-bold" rowspan="${rowCount}">${globalIndex++}</td>` : ''}
                    
                    ${vIndex === 0 ? `
                        <td class="py-2 text-left text-gray-800 text-sm align-top border-r border-gray-300 pl-2" rowspan="${rowCount}">
                            <span class="font-bold text-gray-900 block">${line.materialName}</span>
                            <span class="text-xs text-gray-500 italic block mt-1">${line.description}</span>
                        </td>
                    ` : ''}
                    
                    <td class="py-2 text-left text-gray-700 text-sm align-middle border-r border-gray-200 pl-2 font-medium">
                        ${variant.usage}
                    </td>
                    <td class="py-2 text-left text-gray-500 text-xs align-middle border-r border-gray-200 pl-2 italic">
                        ${variant.note || ''}
                    </td>
                    <td class="py-2 text-center text-gray-600 text-sm align-middle border-r border-gray-200 uppercase">
                        ${variant.unit}
                    </td>
                    <td class="py-2 text-right text-gray-800 text-sm align-middle border-r border-gray-200 font-bold pr-2">
                        ${variant.quantity.toLocaleString()}
                    </td>
                    <td class="py-2 text-right text-gray-800 text-sm align-middle border-r border-gray-200 font-medium pr-2">
                        ${f(variant.rate)}
                    </td>
                    <td class="py-2 text-right text-gray-900 text-sm align-middle font-bold pr-2 bg-transparent">
                        ${f(variant.amount)}
                    </td>
                </tr>
            `).join('');
        }).join(``);
    };

    const pagesHtml = activeCopies.map((copyType, index) => `
        <div class="print-page ${index > 0 ? 'page-break' : ''}">
            
            <!-- WATERMARK LAYER (Behind Everything) -->
            <div class="watermark-layer">
                ${copyType.split(' ')[0]} <!-- e.g. ORIGINAL -->
            </div>

            <!-- CONTENT LAYER -->
            <div class="content-layer">
                <!-- HEADER SECTION -->
                <div class="flex justify-between items-start mb-6">
                    <div class="flex items-start gap-4">
                        <img src="${companyLogo}" class="h-10 object-contain" style="max-width: 80px;" />
                        <div class="pt-0">
                            <h1 class="text-2xl font-bold text-[#111] leading-none">${companyName}</h1>
                            <p class="text-[10px] text-gray-600 mt-1 max-w-sm leading-snug">${companyAddress}</p>
                            <p class="text-[10px] text-gray-600 leading-snug">${companyPhone}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <h1 class="text-4xl font-bold text-[#222] tracking-tight">Purchase Order</h1>
                        <p class="text-lg font-bold text-gray-400 uppercase tracking-widest mt-0">${copyType}</p>
                        ${poToPrint.isoMetadata ? `
                            <p class="text-[9px] text-gray-400 font-mono mt-1">
                                ISO Doc: ${poToPrint.isoMetadata.documentControlNumber} &nbsp;|&nbsp; Rev: ${poToPrint.isoMetadata.revisionLevel}
                            </p>
                        ` : ''}
                        <p class="text-[9px] text-gray-500 mt-1">Printed on ${printDate}</p>
                    </div>
                </div>

                <div class="border-b-2 border-black mb-6"></div>

                <!-- INFO GRID -->
                <div class="grid grid-cols-2 gap-12 mb-8 text-sm">
                    
                    <!-- Left Block: Vendor -->
                    <div class="space-y-1">
                        <div class="grid grid-cols-[100px_1fr]">
                            <span class="font-bold text-gray-900">Vendor Name</span>
                            <span class="text-gray-800">${poToPrint.supplierName}</span>
                        </div>
                        <div class="grid grid-cols-[100px_1fr]">
                            <span class="font-bold text-gray-900">Vendor Address</span>
                            <span class="text-gray-800 leading-snug">${supplierAddress}</span>
                        </div>
                        <div class="grid grid-cols-[100px_1fr]">
                            <span class="font-bold text-gray-900">Sales Tax #</span>
                            <span class="text-gray-800">${supplierSalesTax}</span>
                        </div>
                        <div class="grid grid-cols-[100px_1fr]">
                            <span class="font-bold text-gray-900">Job Number</span>
                            <span class="text-gray-800 font-bold">${linkedJob}</span>
                        </div>
                    </div>

                    <!-- Right Block: PO Details -->
                    <div class="space-y-1">
                        <div class="grid grid-cols-[100px_1fr]">
                            <span class="font-bold text-gray-900">PO Number</span>
                            <span class="text-gray-800 font-medium text-lg leading-none">${poToPrint.poNumber}</span>
                        </div>
                        <div class="grid grid-cols-[100px_1fr]">
                            <span class="font-bold text-gray-900">PO Date</span>
                            <span class="text-gray-800">${formatAppDate(poToPrint.dateIssued)}</span>
                        </div>
                        <div class="grid grid-cols-[100px_1fr]">
                            <span class="font-bold text-gray-900">Delivery Date</span>
                            <span class="text-gray-800 text-red-600 font-bold">
                                ${new Date(new Date(poToPrint.dateIssued).setDate(new Date(poToPrint.dateIssued).getDate() + 20)).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'}).replace(/ /g,'-')}
                            </span>
                        </div>
                        <div class="grid grid-cols-[100px_1fr]">
                            <span class="font-bold text-gray-900">Terms</span>
                            <span class="text-gray-800 font-bold">${poToPrint.creditTerms}</span>
                        </div>
                    </div>
                </div>

                <div class="border-b-2 border-black mb-1"></div>

                <!-- DATA TABLE -->
                <div class="mb-4 relative z-10 flex-grow">
                    <table class="w-full border-collapse">
                        <thead>
                            <tr class="text-black">
                                <th class="py-2 text-center text-sm font-bold w-10 border-b-2 border-black">#</th>
                                <th class="py-2 text-left pl-2 text-sm font-bold border-b-2 border-black">Item Description</th>
                                <th class="py-2 text-left pl-2 text-sm font-bold w-24 border-b-2 border-black">Usage</th>
                                <th class="py-2 text-left pl-2 text-sm font-bold w-24 border-b-2 border-black">Note</th>
                                <th class="py-2 text-center text-sm font-bold w-12 border-b-2 border-black">Unit</th>
                                <th class="py-2 text-right pr-2 text-sm font-bold w-20 border-b-2 border-black">Quantity</th>
                                <th class="py-2 text-right pr-2 text-sm font-bold w-20 border-b-2 border-black">Rate</th>
                                <th class="py-2 text-right pr-2 text-sm font-bold w-28 border-b-2 border-black">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${renderTableRows()}
                        </tbody>
                    </table>
                </div>

                <div class="border-t-2 border-black mt-2"></div>

                <!-- FOOTER TOTALS -->
                <div class="flex justify-between items-start mt-4">
                    <div class="w-7/12 pr-8">
                        <div>
                            <p class="text-sm font-bold text-gray-900">Amount in Words</p>
                            <p class="text-sm text-gray-800 font-medium italic mt-0.5 leading-snug">
                                ${amountInWords}
                            </p>
                        </div>
                        
                        <div class="mt-8">
                            <p class="text-[10px] font-bold text-gray-900 uppercase mb-1">Terms & Conditions</p>
                            <ul class="text-[9px] text-gray-600 list-disc pl-3 space-y-0.5 leading-tight">
                                <li>Deliveries must be made between 09:00 AM and 05:00 PM (Mon-Sat).</li>
                                <li>Items must strictly adhere to the approved quality samples.</li>
                                <li>Payment will be processed ${poToPrint.creditTerms} days after GRN (Goods Receipt Note).</li>
                                <li>Partial shipments are accepted only with prior written approval.</li>
                                <li>We reserve the right to return non-compliant goods.</li>
                            </ul>
                        </div>
                    </div>

                    <div class="w-5/12 pl-4">
                        <table class="w-full text-sm">
                            <tr>
                                <td class="text-gray-800 py-1 text-right pr-4">Sub Total</td>
                                <td class="text-right font-mono font-medium">${poToPrint.currency} ${f(poToPrint.subtotal)}</td>
                            </tr>
                            ${poToPrint.applyTax ? `
                            <tr>
                                <td class="text-gray-800 py-1 text-right pr-4">Tax / VAT (${poToPrint.taxRate}%)</td>
                                <td class="text-right font-mono font-medium">${poToPrint.currency} ${f(poToPrint.taxAmount)}</td>
                            </tr>
                            ` : ''}
                            <tr>
                                <td class="py-2 text-right pr-4"><span class="font-bold text-base text-black">Grand Total</span></td>
                                <td class="py-2 text-right"><span class="font-bold text-lg font-mono text-black">${poToPrint.currency} ${f(poToPrint.totalAmount)}</span></td>
                            </tr>
                        </table>
                    </div>
                </div>

                <div class="flex-grow min-h-[100px]"></div>

                <!-- SIGNATURES -->
                <div class="mt-8 pt-4 border-t-2 border-black">
                    <div class="grid grid-cols-4 gap-8 text-left">
                        <div>
                            <p class="text-[10px] font-bold uppercase text-black mb-8">Prepared By</p>
                            <div class="text-[9px] text-gray-500">Merchandising</div>
                        </div>
                        <div>
                            <p class="text-[10px] font-bold uppercase text-black mb-8">Checked By</p>
                            <div class="text-[9px] text-gray-500">Accounts</div>
                        </div>
                        <div>
                            <p class="text-[10px] font-bold uppercase text-black mb-8">Approved By</p>
                            <div class="text-[9px] text-gray-500">Director / GM</div>
                        </div>
                        <div class="text-right">
                            <p class="text-[10px] font-bold uppercase text-black mb-8">Supplier Acceptance</p>
                            <div class="text-[9px] text-gray-500">Sign & Stamp</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>PO_${poToPrint.poNumber}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body { font-family: sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; background: #eee; }
            @page { size: A4; margin: 0; }
            
            .print-page { 
                width: 210mm; 
                min-height: 297mm; 
                margin: 0 auto; 
                background: white; 
                padding: 10mm 15mm; 
                position: relative; 
                display: flex; 
                flex-direction: column; 
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                overflow: hidden; /* Ensure watermark doesn't overflow */
            }
            
            .page-break { page-break-before: always; margin-top: 20px; }
            
            /* Watermark Styling */
            .watermark-layer {
                position: absolute;
                inset: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 0;
                pointer-events: none;
                
                /* Text Style */
                font-size: 130px;
                font-weight: 900;
                color: rgba(220, 220, 220, 0.4); /* Very light gray, transparent */
                transform: rotate(-45deg);
                text-transform: uppercase;
                user-select: none;
                white-space: nowrap;
            }

            .content-layer {
                position: relative;
                z-index: 10;
                height: 100%;
                display: flex;
                flex-direction: column;
            }

            /* Ensure tables are transparent so watermark shows through */
            table, tr, td, th {
                background-color: transparent !important;
            }

            @media print {
                body { background: white; }
                .print-page { box-shadow: none; margin: 0; width: 100%; height: 100%; }
                .page-break { margin-top: 0; }
            }
        </style>
    </head>
    <body>
        ${pagesHtml}
        <script>setTimeout(() => { window.print(); }, 800);</script>
    </body>
    </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setIsPrintModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-[#37352F]">Purchasing & Material Demand</h1>
            <p className="text-sm text-gray-500">Manage material requests generated from approved Job Plans.</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <div className="flex gap-6">
            <button 
              onClick={() => setActiveTab('Demand')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2
                ${activeTab === 'Demand' ? 'border-[#37352F] text-[#37352F]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <ShoppingCart size={16} /> Material Demand
            </button>
            <button 
              onClick={() => setActiveTab('POs')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2
                ${activeTab === 'POs' ? 'border-[#37352F] text-[#37352F]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <Receipt size={16} /> Issued Purchase Orders
            </button>
          </div>
        </div>

        {/* Global Feedback Message */}
        {successMessage && (
           <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 size={18} />
              <span className="text-sm font-medium">{successMessage}</span>
           </div>
        )}

        {/* ... Rest of existing component code remains identical ... */}
        {/* Included abbreviated structure to respect update constraints, 
            focusing on changes. Full logic preserved in actual file replacement. 
            The render logic for Demand Tab and PO Tab and Modals are kept. */}
        {activeTab === 'Demand' ? (
          <>
            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
               <div className="flex gap-4 w-full md:w-auto items-center">
                   <div className="relative w-full md:w-64 lg:w-80">
                      <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search Job, Supplier, or Item..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                   </div>
                   <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-md outline-none bg-white text-gray-600 focus:border-blue-500 hover:border-gray-300 cursor-pointer"
                   >
                      <option value="All">All Statuses</option>
                      <option value="Unpurchased">Unpurchased</option>
                      <option value="PO Issued">PO Issued</option>
                   </select>
               </div>

               <button 
                 onClick={handleGeneratePOClick}
                 disabled={selectedItems.size === 0}
                 className={`flex items-center gap-2 px-5 py-2 rounded-md shadow-sm text-sm font-medium transition-all
                   ${selectedItems.size > 0 
                     ? 'bg-[#37352F] text-white hover:bg-black hover:shadow-md' 
                     : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
               >
                 <ShoppingCart size={16} />
                 Generate Purchase Order {selectedItems.size > 0 && `(${selectedItems.size})`}
               </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex-1 flex flex-col">
              <div className="overflow-x-auto custom-scrollbar flex-1">
                <table className="w-full text-left text-sm border-collapse min-w-[1100px]">
                   <thead className="bg-[#F7F7F5] text-xs uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-200 sticky top-0 z-10">
                      <tr>
                         <th className="px-4 py-4 w-12 text-center">
                           <input 
                             type="checkbox" 
                             onChange={handleSelectAll}
                             className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                           />
                         </th>
                         <th className="px-4 py-4">Job ID</th>
                         <th className="px-4 py-4 w-1/4">Material Name & Spec</th>
                         <th className="px-4 py-4 text-right">Req. Qty</th>
                         <th className="px-4 py-4">Supplier</th>
                         <th className="px-4 py-4">Needed By</th>
                         <th className="px-4 py-4">Status</th>
                         <th className="px-4 py-4 text-center">Linked PO #</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {filteredDemand.map(item => {
                         const risk = getRiskLevel(item);
                         const isSelected = selectedItems.has(item.id);
                         const isHighRisk = (risk === 'critical' || risk === 'high');

                         return (
                           <tr 
                              key={item.id} 
                              className={`group transition-colors
                                 ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                                 ${isHighRisk && item.status === 'Unpurchased' ? 'bg-red-50/60 hover:bg-red-100/80' : ''}
                              `}
                           >
                              <td className="px-4 py-3 text-center">
                                 {item.status === 'Unpurchased' && (
                                   <input 
                                     type="checkbox" 
                                     checked={isSelected}
                                     onChange={() => handleToggleSelect(item.id)}
                                     className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                   />
                                 )}
                              </td>
                              <td className="px-4 py-3">
                                 <span className="font-medium text-gray-700 font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs">{item.jobId}</span>
                              </td>
                              <td className="px-4 py-3">
                                 <div className="flex flex-col">
                                    <span className="font-medium text-[#37352F]">{item.materialName}</span>
                                    <span className="text-xs text-gray-500">{item.specification}</span>
                                    {item.variantMap ? (
                                        <div className="mt-1 flex flex-wrap gap-1">
                                            {Object.entries(item.variantMap).map(([key, val]) => (
                                                <span key={key} className="text-[10px] text-gray-600 bg-gray-100 px-1 rounded border border-gray-200">
                                                    {key}: {val}
                                                </span>
                                            ))}
                                        </div>
                                    ) : item.breakdown && (
                                        <div className="mt-1 text-[10px] text-gray-500 font-mono bg-gray-50 p-1 rounded border border-gray-100 w-fit">
                                            {item.breakdown}
                                        </div>
                                    )}
                                 </div>
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-gray-700">
                                 {item.requiredQty.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-xs text-gray-400">{item.unit}</span>
                              </td>
                              <td className="px-4 py-3 text-gray-600">
                                 {item.supplierName}
                              </td>
                              <td className="px-4 py-3">
                                 <div className="flex items-center gap-2">
                                    {risk === 'critical' && item.status === 'Unpurchased' && <AlertTriangle size={14} className="text-red-500" />}
                                    {risk === 'high' && item.status === 'Unpurchased' && <AlertCircle size={14} className="text-orange-500" />}
                                    <span className={`font-medium 
                                       ${risk === 'critical' && item.status === 'Unpurchased' ? 'text-red-600' : 
                                         risk === 'high' && item.status === 'Unpurchased' ? 'text-orange-600' : 'text-gray-600'}`}>
                                       {item.inHouseDueDate}
                                    </span>
                                 </div>
                              </td>
                              <td className="px-4 py-3">
                                 <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border
                                    ${item.status === 'Received' ? 'bg-green-50 text-green-700 border-green-200' : 
                                      item.status === 'PO Issued' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                      'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                    {item.status}
                                 </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                 {item.poNumber ? (
                                    <div className="flex items-center justify-center gap-1 text-blue-600 bg-blue-50/50 px-2 py-0.5 rounded">
                                       <Link size={10} />
                                       <span className="text-xs font-mono font-medium">{item.poNumber}</span>
                                    </div>
                                 ) : (
                                    <span className="text-gray-300">-</span>
                                 )}
                              </td>
                           </tr>
                         );
                      })}
                      {filteredDemand.length === 0 && (
                          <tr><td colSpan={8} className="p-8 text-center text-gray-400 italic">No materials found.</td></tr>
                      )}
                   </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col space-y-4 animate-in fade-in slide-in-from-right-4">
            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm flex gap-4 items-center">
               <div className="relative w-full md:w-80">
                  <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search PO Number or Supplier..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
               </div>
               <button className="p-2 border border-gray-200 rounded-md hover:bg-gray-50 text-gray-500">
                  <Filter size={16} />
               </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex-1 flex flex-col">
              <div className="overflow-x-auto custom-scrollbar flex-1">
                <table className="w-full text-left text-sm border-collapse min-w-[1000px]">
                   <thead className="bg-[#F7F7F5] text-xs uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-200 sticky top-0 z-10">
                      <tr>
                         <th className="px-6 py-4">PO Number</th>
                         <th className="px-6 py-4">Doc Control No.</th>
                         <th className="px-6 py-4">Supplier</th>
                         <th className="px-6 py-4">Date Issued</th>
                         <th className="px-6 py-4">Credit Terms</th>
                         <th className="px-6 py-4 text-center">Lines</th>
                         <th className="px-6 py-4 text-right">Total Amount</th>
                         <th className="px-6 py-4">Status</th>
                         <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {filteredPOs.map(po => (
                        <tr key={po.id} className="group hover:bg-gray-50 transition-colors">
                           <td className="px-6 py-4 font-mono font-medium text-blue-700">
                              {po.poNumber}
                           </td>
                           <td className="px-6 py-4">
                              {po.isoMetadata ? (
                                  <div className="flex flex-col">
                                      <span className="text-[10px] font-mono bg-gray-100 border border-gray-200 px-1 rounded text-gray-700 w-fit">
                                          {po.isoMetadata.documentControlNumber}
                                      </span>
                                      <span className="text-[9px] text-gray-400 mt-0.5">Rev {po.isoMetadata.revisionLevel}</span>
                                  </div>
                              ) : (
                                  <span className="text-gray-300 text-xs">-</span>
                              )}
                           </td>
                           <td className="px-6 py-4 font-medium text-gray-800">
                              {po.supplierName}
                           </td>
                           <td className="px-6 py-4 text-gray-600">
                              {po.dateIssued}
                           </td>
                           <td className="px-6 py-4 text-gray-600">
                              {po.creditTerms || '-'}
                           </td>
                           <td className="px-6 py-4 text-center text-gray-600">
                              {po.itemCount}
                           </td>
                           <td className="px-6 py-4 text-right font-mono font-medium text-gray-900">
                              {po.currency} {po.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                           </td>
                           <td className="px-6 py-4">
                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border
                                 ${po.status === 'Closed' ? 'bg-green-50 text-green-700 border-green-200' :
                                   po.status === 'Sent' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                   'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                 {po.status}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <button 
                                onClick={() => initiatePrint(po)}
                                className="text-gray-400 hover:text-blue-600 p-1.5 rounded transition-colors hover:bg-blue-50"
                                title="Print PO"
                              >
                                 <Printer size={16} />
                              </button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
                 {filteredPOs.length === 0 && activeTab === 'POs' && (
                     <div className="p-10 text-center text-gray-400">
                         No Issued Purchase Orders.
                     </div>
                 )}
              </div>
            </div>
          </div>
        )}

      {/* PO Generation Modal */}
      {isPOModalOpen && draftPO && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center shadow-sm text-gray-700">
                       <FileText size={20} />
                    </div>
                    <div>
                       <h2 className="text-lg font-bold text-[#37352F]">Generate Purchase Order</h2>
                       <p className="text-xs text-gray-500">ISO-9001 Compliant Document Generation</p>
                    </div>
                 </div>
                 <button onClick={() => setIsPOModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
                    <X size={20} />
                 </button>
              </div>

              {/* ... Rest of modal content ... */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
                 
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="md:col-span-1 space-y-1.5">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">PO Number</label>
                       <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
                          <Hash size={14} className="text-gray-400 mr-2" />
                          <input 
                            type="text" 
                            value={draftPO.poNumber} 
                            onChange={(e) => setDraftPO({ ...draftPO, poNumber: e.target.value })}
                            className="w-full text-sm font-mono font-medium outline-none text-gray-800"
                          />
                       </div>
                    </div>
                    {/* ... other fields remain unchanged ... */}
                    <div className="md:col-span-1 space-y-1.5">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Supplier</label>
                       <select
                         value={draftPO.supplierName}
                         onChange={(e) => setDraftPO({ ...draftPO, supplierName: e.target.value })}
                         className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                       >
                         {MOCK_SUPPLIERS.map(sup => (
                           <option key={sup.id} value={sup.name}>{sup.name}</option>
                         ))}
                         {!MOCK_SUPPLIERS.find(s => s.name === draftPO.supplierName) && (
                            <option value={draftPO.supplierName}>{draftPO.supplierName}</option>
                         )}
                       </select>
                    </div>
                    <div className="md:col-span-1 space-y-1.5">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Credit Terms</label>
                       <div className="relative">
                          <input 
                            list="credit-terms"
                            value={draftPO.creditTerms}
                            onChange={(e) => setDraftPO({ ...draftPO, creditTerms: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="Select or Type..."
                          />
                          <datalist id="credit-terms">
                             {CREDIT_TERMS_OPTIONS.map(opt => <option key={opt} value={opt} />)}
                          </datalist>
                       </div>
                    </div>
                    <div className="md:col-span-1 space-y-1.5">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Currency</label>
                       <select 
                         value={draftPO.currency} 
                         onChange={(e) => setDraftPO({ ...draftPO, currency: e.target.value })}
                         className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                       >
                         <option value="PKR">PKR (Rs)</option>
                         <option value="USD">USD ($)</option>
                         <option value="EUR">EUR (€)</option>
                         <option value="GBP">GBP (£)</option>
                         <option value="CNY">CNY (¥)</option>
                       </select>
                    </div>
                 </div>

                 {/* Detailed Line Items Table (Abbreviated to focus on changes, functionality preserved) */}
                 <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm mb-6">
                    <table className="w-full text-left text-sm">
                       <thead className="bg-gray-100 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">
                          <tr>
                             <th className="px-4 py-3 border-r border-gray-200">Item</th>
                             <th className="px-4 py-3 border-r border-gray-200">Usage</th>
                             <th className="px-4 py-3 border-r border-gray-200 w-48">Note (Edit)</th>
                             <th className="px-4 py-3 border-r border-gray-200 w-16">Unit</th>
                             <th className="px-4 py-3 text-right border-r border-gray-200 w-24">Qty (Edit)</th>
                             <th className="px-4 py-3 text-right border-r border-gray-200 w-24">Rate (Edit)</th>
                             <th className="px-4 py-3 text-right w-32">Total</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100">
                          {draftPO.items.map((item, index) => (
                             <React.Fragment key={item.id}>
                                {item.variants.map((variant, vIndex) => (
                                    <tr key={variant.id} className="group hover:bg-gray-50">
                                        {/* Material Name Cell */}
                                        {vIndex === 0 && (
                                            <td className="px-4 py-3 align-top bg-white border-r border-gray-200" rowSpan={item.variants.length}>
                                                <span className="font-bold text-gray-800 block">{item.materialName}</span>
                                                <span className="text-xs text-gray-500 italic">{item.specification}</span>
                                            </td>
                                        )}
                                        
                                        <td className="px-4 py-3 text-gray-700 align-middle border-r border-gray-200">
                                            <span className="text-xs font-medium">{variant.usage}</span>
                                        </td>
                                        
                                        <td className="px-2 py-2 align-middle border-r border-gray-200">
                                            <input 
                                                type="text" 
                                                value={variant.note}
                                                onChange={(e) => updateVariant(item.id, variant.id, 'note', e.target.value)}
                                                placeholder="e.g. Finish..."
                                                className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:border-blue-500 outline-none"
                                            />
                                        </td>
                                        
                                        <td className="px-4 py-3 text-gray-500 align-middle border-r border-gray-200 text-xs">
                                            {variant.unit}
                                        </td>
                                        
                                        <td className="px-2 py-2 align-middle text-right border-r border-gray-200">
                                            <input 
                                                type="number" 
                                                value={variant.qty}
                                                onChange={(e) => updateVariant(item.id, variant.id, 'qty', e.target.value)}
                                                className="w-full text-right text-xs border border-gray-200 rounded px-2 py-1.5 focus:border-blue-500 outline-none font-mono"
                                            />
                                        </td>
                                        
                                        <td className="px-2 py-2 align-middle text-right border-r border-gray-200">
                                            <input 
                                                type="number" 
                                                value={variant.rate}
                                                onChange={(e) => updateVariant(item.id, variant.id, 'rate', e.target.value)}
                                                step="0.01"
                                                className="w-full text-right text-xs border border-gray-200 rounded px-2 py-1.5 focus:border-blue-500 outline-none font-mono"
                                            />
                                        </td>
                                        
                                        <td className="px-4 py-3 text-right font-bold text-gray-800 align-middle font-mono text-xs bg-gray-50/50">
                                            {((Number(variant.qty) || 0) * (Number(variant.rate) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))}
                             </React.Fragment>
                          ))}
                       </tbody>
                    </table>
                 </div>

                 {/* Totals & Actions */}
                 <div className="flex justify-end">
                    <div className="w-64 space-y-3">
                       {/* Totals calculation display logic remains same */}
                       {(() => {
                           const totalAmount = draftPO.items.reduce((acc, item) => 
                               acc + item.variants.reduce((vAcc, v) => vAcc + (Number(v.qty) * Number(v.rate)), 0)
                           , 0);
                           
                           return (
                               <>
                                   <div className="flex justify-between text-sm text-gray-600">
                                      <span>Subtotal</span>
                                      <span>{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                   </div>
                                   
                                   <div className="flex justify-between items-center text-sm text-gray-600">
                                      <label className="flex items-center gap-2 cursor-pointer select-none">
                                         <input 
                                            type="checkbox"
                                            checked={draftPO.applyTax}
                                            onChange={(e) => setDraftPO({ ...draftPO, applyTax: e.target.checked })}
                                            className="rounded text-blue-600 focus:ring-blue-500"
                                         />
                                         <span>Apply Tax ({draftPO.taxRate}%)</span>
                                      </label>
                                      <span className={draftPO.applyTax ? 'text-gray-800' : 'text-gray-300 line-through'}>
                                        {(totalAmount * (draftPO.taxRate / 100)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                      </span>
                                   </div>

                                   <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t border-gray-200">
                                      <span>Total</span>
                                      <span>
                                         {draftPO.currency} {(totalAmount * (1 + (draftPO.applyTax ? draftPO.taxRate : 0) / 100)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                      </span>
                                   </div>
                               </>
                           );
                       })()}
                       
                       <button 
                         onClick={handleConfirmPO}
                         className="w-full mt-4 py-2.5 bg-[#37352F] text-white font-medium rounded-md hover:bg-black transition-colors shadow-sm flex items-center justify-center gap-2"
                       >
                          <CheckCircle2 size={16} /> Confirm & Issue PO
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Print Options Modal - Kept same */}
      {isPrintModalOpen && poToPrint && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-sm rounded-xl shadow-xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                 <h3 className="text-lg font-bold text-[#37352F]">Print Options</h3>
                 <button onClick={() => setIsPrintModalOpen(false)}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
              </div>
              
              <div className="space-y-3">
                 <p className="text-xs font-bold text-gray-500 uppercase">Select Copies to Print</p>
                 <label className="flex items-center gap-3 p-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" checked={printOptions.original} onChange={e => setPrintOptions({...printOptions, original: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm font-medium text-gray-700">Original Copy</span>
                 </label>
                 <label className="flex items-center gap-3 p-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" checked={printOptions.merchandiser} onChange={e => setPrintOptions({...printOptions, merchandiser: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm font-medium text-gray-700">Merchandiser's Copy</span>
                 </label>
                 <label className="flex items-center gap-3 p-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" checked={printOptions.accounts} onChange={e => setPrintOptions({...printOptions, accounts: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm font-medium text-gray-700">Accounts Copy</span>
                 </label>
                 <label className="flex items-center gap-3 p-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" checked={printOptions.store} onChange={e => setPrintOptions({...printOptions, store: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm font-medium text-gray-700">Store Copy</span>
                 </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                 <button onClick={() => setIsPrintModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                 <button onClick={executePrint} className="px-6 py-2 bg-[#37352F] text-white rounded text-sm font-bold hover:bg-black flex items-center gap-2">
                    <Printer size={16} /> Print Selected
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};
