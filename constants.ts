
import { Order, Buyer, Supplier, Tab, MasterBOMItem } from './types';
import { 
  LayoutDashboard, ShoppingBag, Layers, Calculator, ShoppingCart, 
  Factory, Users, Truck, Package, DollarSign, Settings, FileSpreadsheet,
  Scissors, ClipboardList, BookOpen, CalendarRange, Activity, Tag, Box, Scale, Palette, Image, Calendar
} from 'lucide-react';

export const LOGO_URL = "https://cdn-icons-png.flaticon.com/512/25/25694.png";

// ISO 9001 Codes
export const DEPT_CODES = {
  Merchandising: 'MR',
  Fabric: 'FB',
  Store: 'SR',
  Sampling: 'SM',
  Testing: 'TS',
  Cutting: 'CT',
  Embellishment: 'EP',
  Stitching: 'ST',
  Washing: 'WS',
  Packing: 'PK',
  Export: 'EX',
  Accounts: 'AC'
};

export const DOC_TYPE_CODES = {
  Report: 'RP',
  Plan: 'PL',
  PurchaseOrder: 'PO',
  WorkOrder: 'WO',
  MaterialIssuance: 'MI',
  WorkInstruction: 'WI',
  Checklist: 'CL',
  Invoicing: 'IV',
  MeetingMinutes: 'MM'
};

export const generateISODocID = (jobId: string, deptCode: string, docType: string, sequence: number) => {
   const seq = sequence.toString().padStart(3, '0');
   // Ensure jobId is clean (remove internal prefixes if needed, but per prompt we use the Master Job ID directly)
   // If jobId is empty, use 'GEN' (General)
   const safeJobId = jobId || 'GEN';
   return `${safeJobId} / ${deptCode} / ${docType} / ${seq}`;
};

export const NAV_ITEMS = [
  { id: Tab.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
  { id: Tab.ORDERS, icon: ShoppingBag, label: 'Order Management' },
  { id: Tab.SAMPLING, icon: Layers, label: 'Sample Room' },
  { id: Tab.COSTING, icon: Calculator, label: 'Costing' },
  { id: Tab.PURCHASING, icon: ShoppingCart, label: 'Purchasing' },
  { id: Tab.PLANNING, icon: Calendar, label: 'Planning' },
  { id: Tab.PRODUCTION, icon: Factory, label: 'Production' },
  { id: Tab.BUYERS, icon: Users, label: 'Buyers' },
  { id: Tab.SUPPLIERS, icon: Truck, label: 'Suppliers' },
  { id: Tab.BOM, icon: FileSpreadsheet, label: 'BOM' },
  { id: Tab.FINANCE, icon: DollarSign, label: 'Finance' },
  { id: Tab.SHIPPING, icon: Package, label: 'Shipping' },
  { id: Tab.RESOURCES, icon: BookOpen, label: 'Resources' },
  { id: Tab.SETTINGS, icon: Settings, label: 'Settings' },
];

export const PRODUCTION_TOOLS = [
  {
    id: "fabric-consumption",
    title: "Fabric Consumption",
    icon: Layers,
    color: "text-blue-600",
    bg: "bg-blue-50"
  },
  {
    id: "sewing-thread",
    title: "Sewing Thread",
    icon: Activity,
    color: "text-pink-600",
    bg: "bg-pink-50"
  },
  {
    id: "trims",
    title: "Accessories / Trims",
    icon: Tag,
    color: "text-orange-600",
    bg: "bg-orange-50"
  },
  {
    id: "labour",
    title: "Labour Cost",
    icon: Users,
    color: "text-indigo-600",
    bg: "bg-indigo-50"
  },
  {
    id: "cbm",
    title: "CBM Calc",
    icon: Box,
    color: "text-teal-600",
    bg: "bg-teal-50"
  },
  {
    id: "gsm",
    title: "Fabric GSM",
    icon: Scale,
    color: "text-red-600",
    bg: "bg-red-50"
  },
  {
    id: "pantone-converter",
    title: "Pantone Converter",
    icon: Palette,
    color: "text-rose-600",
    bg: "bg-rose-50"
  },
  {
    id: "catalogue-maker",
    title: "Catalogue Maker",
    icon: Image,
    color: "text-amber-600",
    bg: "bg-amber-50"
  }
];

export const formatAppDate = (dateString?: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-');
};

export const parseCSVDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const cleanStr = dateStr.trim();
  if (cleanStr.match(/^\d{4}-\d{2}-\d{2}$/)) return cleanStr;
  const parts = cleanStr.split(/[-/ ]/);
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    let monthStr = parts[1];
    let year = parts[2];
    if (isNaN(Number(monthStr))) {
        monthStr = monthStr.charAt(0).toUpperCase() + monthStr.slice(1).toLowerCase();
    }
    const monthMap: Record<string, string> = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
      'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12',
      '01': '01', '02': '02', '03': '03', '04': '04', '05': '05', '06': '06',
      '07': '07', '08': '08', '09': '09', '1': '01', '2': '02', '3': '03', 
      '4': '04', '5': '05', '6': '06', '7': '07', '8': '08', '9': '09'
    };
    const month = monthMap[monthStr] || '01';
    const fullYear = year.length === 2 ? `20${year}` : year;
    return `${fullYear}-${month}-${day}`;
  }
  return dateStr; 
};

export const MOCK_BUYERS: Buyer[] = [
  { 
    id: 'B001', 
    name: 'BoohooMan', 
    country: 'United Kingdom', 
    totalOrders: 15, 
    contactPerson: 'Sarah Jenkins', 
    phone: '+44 161 234 5678', 
    address: '49-51 Dale St, Manchester M1 2HF, UK' 
  },
  { 
    id: 'B002', 
    name: 'True Religion', 
    country: 'USA', 
    totalOrders: 8, 
    contactPerson: 'Mike Ross', 
    phone: '+1 323 555 0199', 
    address: '1888 Rosecrans Ave, Manhattan Beach, CA 90266' 
  },
];

export const MOCK_SUPPLIERS: Supplier[] = [
  { 
    id: 'S001', name: 'Artistic Milliners', category: 'Fabric', rating: 5, location: 'Karachi', 
    contactPerson: 'Ahmed Khan', phone: '+92 21 35000000', address: 'Korangi Industrial Area', 
    salesTaxId: 'PK-1234567', productLine: ['Fabric'], creditTerms: '60 Days' 
  },
  { 
    id: 'S002', name: 'YKK Pakistan', category: 'Trims', rating: 5, location: 'Lahore', 
    contactPerson: 'Bilal Ahmed', phone: '+92 42 35000000', address: 'Lahore-Sheikhupura Road', 
    salesTaxId: 'PK-7654321', productLine: ['Stitching Trims'], creditTerms: '30 Days' 
  },
  {
    id: 'S003', name: 'Soorty Enterprises', category: 'Fabric', rating: 5, location: 'Karachi',
    contactPerson: 'Kamran Ali', phone: '+92 21 32000000', address: 'Landhi Industrial Area',
    salesTaxId: 'PK-5544332', productLine: ['Fabric'], creditTerms: '60 Days'
  },
  {
    id: 'S004', name: 'Prym Fashion', category: 'Trims', rating: 5, location: 'Karachi',
    contactPerson: 'Usman Ghani', phone: '+92 21 31112222', address: 'SITE Area, Karachi',
    salesTaxId: 'PK-7788990', productLine: ['Stitching Trims'], creditTerms: '30 Days'
  },
  {
    id: 'S005', name: 'Avery Dennison', category: 'Trims', rating: 5, location: 'Karachi',
    contactPerson: 'Sana Mir', phone: '+92 21 38889999', address: 'Clifton, Karachi',
    salesTaxId: 'PK-1122334', productLine: ['Packing Trims'], creditTerms: '45 Days'
  }
];

export const MOCK_MASTER_BOM_ITEMS: MasterBOMItem[] = [
  { id: 'fab-001', type: 'Fabric', category: 'Denim', supplier: 'Artistic Milliners', brand: 'AM Premium', uom: 'Meters', isNominated: true, price: 850, construction: '3x1 RHT', content: '98% Cotton 2% Elastane', weight: 12, warpShrinkage: 3, weftShrinkage: 12, code: 'AM-12OZ-STR' },
  { id: 'fab-002', type: 'Fabric', category: 'Denim', supplier: 'Soorty Enterprises', brand: 'Soorty Classic', uom: 'Meters', isNominated: false, price: 920, construction: '3x1 RHT', content: '100% Cotton', weight: 14, warpShrinkage: 2, weftShrinkage: 4, code: 'SRT-14OZ-RGD' },
  { id: 'trm-001', type: 'Trim', category: 'Thread', itemName: 'Sewing Thread - Gold', supplier: 'Coats', brand: 'Epic', uom: 'Cones', isNominated: true, price: 450, code: 'THR-GLD-040', details: 'Poly-poly core spun' },
  { id: 'trm-002', type: 'Trim', category: 'Zipper', itemName: 'Metal Zipper #4', supplier: 'YKK Pakistan', brand: 'YKK', uom: 'Pieces', isNominated: true, price: 45, code: 'ZIP-BRS-004', details: 'Brass finish, Auto-lock' },
];

// Helper to create deep dummy data for the CSV rows
const createOrder = (
  idx: number,
  factoryRef: string, 
  styleNo: string, 
  poNumber: string, 
  productId: string, 
  fitName: string, 
  wash: string, 
  poDate: string, 
  shipDate: string, 
  price: number, 
  qty: number
): Order => {
  // Convert CSV dates (DD/MM/YYYY) to ISO (YYYY-MM-DD)
  // Input: 01/11/2025 -> 2025-11-01
  // Input: 12/01/2026 -> 2026-01-12
  const formatIso = (d: string) => {
    const p = d.split('/');
    if(p.length !== 3) return d;
    return `${p[2]}-${p[1]}-${p[0]}`;
  };

  const isoPoDate = formatIso(poDate);
  const isoShipDate = formatIso(shipDate);

  const styleName = `${fitName} - ${wash}`;
  
  return {
    id: productId, // Using Product ID as system ID
    orderID: `JOB-${productId}`,
    poNumber: poNumber,
    styleNo: styleNo,
    buyer: 'BoohooMan',
    quantity: qty,
    deliveryDate: isoShipDate,
    status: 'Active',
    amount: qty * price,
    price: price,
    factoryRef: factoryRef,
    styleName: styleName,
    styleDescription: `Fit: ${fitName}, Wash: ${wash}. 5-pocket western styling.`,
    fabricName: '12oz Stretch Denim',
    fabricDescription: '98% Cotton 2% Elastane - Artistic Milliners',
    ppMeetingDate: isoPoDate, // Approximation
    ppMeetingStatus: 'Completed',
    poDate: isoPoDate,
    sourcingDate: isoPoDate,
    approvalsCompleted: 3,
    approvalsTotal: 5,
    currentStage: 'Bulk Production',
    imageUrl: 'https://images.unsplash.com/photo-1542272617-08f08375810c?auto=format&fit=crop&q=80&w=300&h=300',
    cpNextDueDate: isoShipDate,
    cpRiskCount: 0,
    fabricStatus: 'In House',
    bomStatus: 'Released',
    planningNotes: 'Ensure strict wash standard matching. Air shipment priority.',
    skippedStages: [],
    
    // Deep Data Populated
    sizeGroups: [
      {
        id: `sg-${idx}`,
        groupName: 'Regular',
        unitPrice: price.toString(),
        currency: 'USD',
        sizes: ['28', '30', '32', '34', '36', '38'],
        colors: [{ id: `col-${idx}`, name: wash }],
        breakdown: {
          [`col-${idx}`]: {
            '28': Math.floor(qty * 0.1).toString(),
            '30': Math.floor(qty * 0.2).toString(),
            '32': Math.floor(qty * 0.3).toString(),
            '34': Math.floor(qty * 0.2).toString(),
            '36': Math.floor(qty * 0.1).toString(),
            '38': (qty - (Math.floor(qty*0.1)*2 + Math.floor(qty*0.2)*2 + Math.floor(qty*0.3))).toString() // Balance
          }
        }
      }
    ],
    bom: [
      {
        id: `bom-${idx}-1`, processGroup: 'Fabric', componentName: '12oz Stretch Denim', supplierRef: 'AM-12-STR',
        vendor: 'Artistic Milliners', sourcingStatus: 'Received', leadTimeDays: 25, usageRule: 'Generic', usageData: { 'generic': 1.45 }, wastagePercent: 3, isTestingRequired: true
      },
      {
        id: `bom-${idx}-2`, processGroup: 'Fabric', componentName: 'Pocketing Fabric', supplierRef: 'PC-110',
        vendor: 'Local Textile', sourcingStatus: 'Received', leadTimeDays: 15, usageRule: 'Generic', usageData: { 'generic': 0.25 }, wastagePercent: 2, isTestingRequired: false
      },
      {
        id: `bom-${idx}-3`, processGroup: 'Stitching Trims', componentName: 'Sewing Thread', supplierRef: 'Epic 120',
        vendor: 'Coats', sourcingStatus: 'Ordered', leadTimeDays: 7, usageRule: 'Generic', usageData: { 'generic': 180 }, wastagePercent: 2, isTestingRequired: false
      },
      {
        id: `bom-${idx}-4`, processGroup: 'Stitching Trims', componentName: 'Zipper #4 Brass', supplierRef: 'YKK-45',
        vendor: 'YKK Pakistan', sourcingStatus: 'Ordered', leadTimeDays: 14, usageRule: 'Generic', usageData: { 'generic': 1 }, wastagePercent: 1, isTestingRequired: true
      },
      {
        id: `bom-${idx}-5`, processGroup: 'Stitching Trims', componentName: 'Main Button 27L', supplierRef: 'BTN-Logo',
        vendor: 'Prym Fashion', sourcingStatus: 'Received', leadTimeDays: 20, usageRule: 'Generic', usageData: { 'generic': 1 }, wastagePercent: 1, isTestingRequired: true
      },
      {
        id: `bom-${idx}-6`, processGroup: 'Packing Trims', componentName: 'Main Label', supplierRef: 'LBL-M',
        vendor: 'Avery Dennison', sourcingStatus: 'Received', leadTimeDays: 10, usageRule: 'Generic', usageData: { 'generic': 1 }, wastagePercent: 1, isTestingRequired: false
      },
      {
        id: `bom-${idx}-7`, processGroup: 'Packing Trims', componentName: 'Polybag', supplierRef: 'PB-STD',
        vendor: 'Local Pkg', sourcingStatus: 'Received', leadTimeDays: 10, usageRule: 'Generic', usageData: { 'generic': 1 }, wastagePercent: 1, isTestingRequired: false
      }
    ],
    samplingDetails: [
      {
        id: `sam-${idx}-1`, samNumber: `SAM-${poNumber}-01`, type: 'Proto Sample', fabric: 'Available', shade: 'Base', wash: 'Raw',
        baseSize: '32', threadColor: 'Match', zipperColor: 'Match', lining: 'Match', quantity: '2', deadline: isoPoDate, status: 'Approved', isTestingRequired: false
      },
      {
        id: `sam-${idx}-2`, samNumber: `SAM-${poNumber}-02`, type: 'Fit Sample', fabric: 'Correct', shade: wash, wash: wash,
        baseSize: '32', threadColor: 'Match', zipperColor: 'Match', lining: 'Match', quantity: '1', deadline: isoPoDate, status: 'Approved', isTestingRequired: false
      },
      {
        id: `sam-${idx}-3`, samNumber: `SAM-${poNumber}-03`, type: 'PP Sample', fabric: 'Actual', shade: wash, wash: wash,
        baseSize: '32', threadColor: 'Match', zipperColor: 'Match', lining: 'Match', quantity: '1', deadline: isoPoDate, status: 'In Progress', isTestingRequired: true
      }
    ],
    criticalPath: {
      capacity: {
        totalOrderQty: qty, fabricLeadTime: 25, trimsLeadTime: 15, cuttingOutput: 300, sewingLines: 1, sewingOutputPerLine: 400, finishingOutput: 500
      },
      schedule: [
        { id: '1', processGroup: 'Materials', milestone: 'Fabric In-House', leadTimeDays: 25, calculatedDueDate: '2025-11-25', status: 'Complete', owner: 'Store' },
        { id: '2', processGroup: 'Cutting', milestone: 'Bulk Cutting Start', leadTimeDays: 2, calculatedDueDate: '2025-11-28', status: 'In Progress', owner: 'Cutting Mgr' },
        { id: '3', processGroup: 'Sewing', milestone: 'Sewing Start', leadTimeDays: 0, calculatedDueDate: '2025-12-05', status: 'Pending', owner: 'Floor Mgr' },
        { id: '4', processGroup: 'Finishing', milestone: 'Finishing Start', leadTimeDays: 0, calculatedDueDate: '2025-12-15', status: 'Pending', owner: 'Finishing Mgr' },
        { id: '5', processGroup: 'Shipping', milestone: 'Ex-Factory', leadTimeDays: 0, calculatedDueDate: isoShipDate, status: 'Pending', owner: 'Logistics' }
      ]
    },
    washing: {
      [`col-${idx}`]: {
        washPictureRef: null,
        washName: wash,
        baseColour: 'Indigo',
        washRecipeNotes: 'Standard recipe. Enzyme stone wash with light tinting. Ensure soft hand feel.',
        washVendorName: 'In-House Washing'
      }
    },
    finishing: {
      finalInspectionStatus: 'Pending',
      handFeelStandard: 'Soft',
      pressingInstructions: 'Steam Form',
      tagPlacement: 'Back Neck',
      foldingType: 'Flat Pack',
      polybagSpec: 'Self Adhesive with Warning',
      assortmentMethod: 'Solid Size / Solid Color',
      cartonMarkings: 'Standard Buyer Markings',
      maxPiecesPerCarton: 20,
      packagingSpecSheetRef: null,
      finishingApprovalDate: ''
    },
    fitting: {
      fileName: 'Specs_v1.pdf',
      fitName: fitName,
      sizeRange: '28-38',
      specsDate: isoPoDate,
      specsDescription: 'Follow approved fit sample comments.'
    },
    embellishments: []
  };
};

export const MOCK_ORDERS: Order[] = [
  createOrder(1, 'CDN-1A', 'ZMO-CD6904D0F5', '3402538', 'CMM23639', 'DENJEAN16', 'LIGHT WASH', '01/11/2025', '12/01/2026', 8.65, 300),
  createOrder(2, 'CDN-2A', 'ZMOCD6904CA8E', '3402539', 'CMM23640', 'DENJEAN08', 'BLACK', '01/11/2025', '12/01/2026', 8.75, 300),
  createOrder(3, 'CDN-3A', 'ZMOCD6904C4FB', '3402536', 'CMM23637', 'DENJEAN19', 'BLACK ACID WASH', '01/11/2025', '12/01/2026', 10, 300),
  createOrder(4, 'CDN-4A', 'ZMOCD6904C45C', '3402531', 'CMM23633', 'DENJEAN19', 'BLEACH WASH', '01/11/2025', '12/01/2026', 10.5, 300),
  createOrder(5, 'CDN-5A', 'ZMOCD6904C45C', '3402531', 'CMM23633', 'DENJEAN19', 'WASHED BLACK', '01/11/2025', '12/01/2026', 10.5, 300),
  createOrder(6, 'CDN-6A', 'ZMOCD6904C1B6', '3402535', 'CMM23636', 'DENJEAN19', 'BLEACH WASH', '01/11/2025', '12/01/2026', 9.8, 300),
  createOrder(7, 'CDN-7A', 'ZMO-D6904BF40', '3402534', 'CMM23634', 'DENJEAN09', 'WASHED BLACK', '01/11/2025', '12/01/2026', 8.2, 300),
  createOrder(8, 'CDN-8A', 'ZMOCD6904C28C', '3402532', 'CMM23632', 'DENJEAN21', 'BLEACH WASH', '01/11/2025', '12/01/2026', 8.5, 300),
  createOrder(9, 'CDN-9A', 'ZMOCD6904C28C', '3402532', 'CMM23632', 'DENJEAN21', 'MID WASH', '01/11/2025', '12/01/2026', 8.5, 300),
  createOrder(10, 'CDN-10A', 'ZMO-CD6904C3BC', '3402533', 'CMM23635', 'DENJEAN06', 'ANTIQUE WASH', '01/11/2025', '12/01/2026', 9.3, 300),
  createOrder(11, 'CDN-11A', 'ZMOCD6904D438', '3402537', 'CMM23638', 'DENJEAN09', 'BLEACH WASH', '01/11/2025', '12/01/2026', 10.1, 302),
];
