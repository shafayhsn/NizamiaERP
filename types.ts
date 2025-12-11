
export enum Tab {
  DASHBOARD = 'DASHBOARD',
  ORDERS = 'ORDERS',
  PLANNING = 'PLANNING',
  SAMPLING = 'SAMPLING',
  COSTING = 'COSTING',
  PURCHASING = 'PURCHASING',
  PRODUCTION = 'PRODUCTION',
  BUYERS = 'BUYERS',
  SUPPLIERS = 'SUPPLIERS',
  BOM = 'BOM',
  FINANCE = 'FINANCE',
  SHIPPING = 'SHIPPING',
  RESOURCES = 'RESOURCES',
  SETTINGS = 'SETTINGS'
}

export interface ISODocumentMetadata {
  documentControlNumber: string;
  revisionLevel: string; // e.g. "1.0"
  docStatus: 'Draft' | 'Current' | 'Obsolete';
}

export interface Department {
  id: string;
  name: string;
  code: string;
  color: string;
}

export interface DocumentType {
  id: string;
  name: string;
  code: string;
  color: string;
}

export interface Buyer {
  id: string;
  name: string;
  country: string;
  totalOrders: number;
  contactPerson: string;
  phone: string;
  address: string;
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  rating: number;
  location: string;
  contactPerson: string;
  phone: string;
  address: string;
  salesTaxId: string;
  productLine: string[];
  creditTerms: string;
}

export interface MasterBOMItem {
  id: string;
  type: 'Fabric' | 'Trim';
  category: string;
  supplier: string;
  brand?: string;
  uom: string;
  isNominated: boolean;
  price: number;
  construction?: string;
  content?: string;
  weight?: number;
  warpShrinkage?: number;
  weftShrinkage?: number;
  code?: string;
  itemName?: string;
  details?: string;
}

export interface ColorRow {
  id: string;
  name: string;
}

export interface SizeGroup {
  id: string;
  groupName: string;
  unitPrice: string;
  currency: string;
  sizes: string[];
  colors: ColorRow[];
  breakdown: Record<string, Record<string, string>>;
}

export interface BOMItem {
  id: string;
  processGroup: 'Fabric' | 'Stitching Trims' | 'Packing Trims' | 'Misc Trims';
  componentName: string;
  supplierRef: string;
  vendor: string;
  sourcingStatus: 'Pending' | 'Sourced' | 'Ordered' | 'Received';
  leadTimeDays: number;
  usageRule: 'Generic' | 'By Color/Wash' | 'By Size Group' | 'By Individual Sizes' | 'Configure your own';
  usageData: Record<string, number>;
  wastagePercent: number;
  isTestingRequired?: boolean;
  poNumber?: string;
}

export interface SampleRow {
  id: string;
  samNumber: string;
  type: string;
  fabric: string;
  shade: string;
  wash: string;
  baseSize: string;
  threadColor: string;
  zipperColor: string;
  lining: string;
  quantity: string;
  deadline: string;
  status: 'Pending' | 'In Progress' | 'Approved' | 'Rejected';
  isTestingRequired: boolean;
}

export interface ScheduleTask {
  id: string;
  processGroup: string;
  milestone: string;
  leadTimeDays: number;
  calculatedDueDate: string;
  status: 'Pending' | 'In Progress' | 'Complete' | 'At Risk';
  owner: string;
}

export interface CapacityInput {
  totalOrderQty: number;
  fabricLeadTime: number;
  trimsLeadTime: number;
  cuttingOutput: number;
  sewingLines: number;
  sewingOutputPerLine: number;
  finishingOutput: number;
}

export interface CriticalPath {
  capacity: CapacityInput;
  schedule: ScheduleTask[];
}

export interface WashingData {
  washPictureRef: string | null;
  washName: string;
  baseColour: string;
  washRecipeNotes: string;
  washVendorName: string;
}

export interface FinishingData {
  finalInspectionStatus: string;
  handFeelStandard: string;
  pressingInstructions: string;
  tagPlacement: string;
  foldingType: string;
  polybagSpec: string;
  assortmentMethod: string;
  cartonMarkings: string;
  maxPiecesPerCarton: number | string;
  packagingSpecSheetRef: string | null;
  finishingApprovalDate: string;
}

export interface FittingData {
  fileName: string | null;
  fitName: string;
  sizeRange: string;
  specsDate: string;
  specsDescription: string;
}

export interface EmbellishmentRecord {
  id: string;
  type: string;
  location: string;
  artworkId: string;
  sizeW: string;
  sizeH: string;
  colorInfo: string;
  vendor: string;
  status: string;
  approvalDate: string;
  instructions: string;
  isTestingRequired: boolean;
}

export interface Order {
  id: string;
  orderID: string;
  poNumber: string;
  styleNo: string;
  buyer: string;
  quantity: number;
  deliveryDate: string;
  status: 'Active' | 'Pending' | 'Shipped' | 'Cancelled' | 'Delayed' | 'Draft' | 'In Production';
  amount: number;
  price: number;
  factoryRef: string;
  styleName: string;
  styleDescription: string;
  fabricName: string;
  fabricDescription: string;
  ppMeetingDate?: string;
  ppMeetingStatus?: string;
  poDate?: string;
  sourcingDate?: string;
  approvalsCompleted?: number;
  approvalsTotal?: number;
  currentStage?: string;
  imageUrl?: string;
  cpNextDueDate?: string;
  cpRiskCount?: number;
  fabricStatus?: string;
  bomStatus?: 'Draft' | 'Released';
  planningNotes?: string;
  skippedStages?: string[];
  sizeGroups?: SizeGroup[];
  colors?: ColorRow[];
  bom?: BOMItem[];
  samplingDetails?: SampleRow[];
  criticalPath?: CriticalPath;
  washing?: Record<string, WashingData>;
  finishing?: FinishingData;
  fitting?: FittingData;
  embellishments?: EmbellishmentRecord[];
  linkedJobId?: string;
}

export interface POData {
  jobNumber: string;
  buyerName: string;
  factoryRef: string;
  styleNumber: string;
  productID: string;
  poNumber: string;
  poDate: string;
  shipDate: string;
  shipMode: string;
}

export interface NewOrderState {
  generalInfo: {
    formData: POData;
    styleImage: string | null;
    colors: ColorRow[];
    sizeGroups: SizeGroup[];
  };
  fitting: FittingData;
  sampling: SampleRow[];
  embellishments: EmbellishmentRecord[];
  washing: Record<string, WashingData>;
  finishing: FinishingData;
  criticalPath: CriticalPath;
  bom: BOMItem[];
  bomStatus: 'Draft' | 'Released';
  planningNotes: string;
  skippedStages: string[];
}

export interface SystemUser {
  id: string;
  name: string;
  username: string;
  role: string;
  lastActive: string;
}

export type PlanStatus = 'Pending Creation' | 'Drafting' | 'In Progress' | 'Approved';

export interface ProductionLog {
  id: string;
  date: string;
  stage: string;
  quantity: number;
  lineId?: string;
}

export interface PurchasingRequest {
  id: string;
  jobId: string;
  materialName: string;
  qty: number;
  unit: string;
  supplier: string;
  status: 'Pending' | 'PO Issued' | 'Received';
  dateRequested: string;
  specs: string;
  breakdown?: string;
  poNumber?: string; // Link to issued PO
  variantMap?: Record<string, number>; // Breakdown for PO explosion
  unitPrice?: number; // Added to store agreed price
  isoMetadata?: ISODocumentMetadata;
}

export interface CuttingPlanDetail {
  id: string;
  materialName: string;
  shrinkageLengthPct: number;
  shrinkageWidthPct: number;
  extraCuttingPct: number;
  startDate: string;
  finishDate: string;
  dailyTarget: number;
  sizeBreakdown: Record<string, Record<string, { base: number, final: number }>>;
}

export interface JobBatch {
  id: string;
  batchName: string;
  styles: Order[];
  totalQty: number;
  status: 'Planning' | 'Ready to Ship' | 'Booked' | 'Shipped' | 'Completed';
  exFactoryDate: string;
  plans: {
    fabric: PlanStatus;
    cutting: PlanStatus;
    trims: PlanStatus;
    process: PlanStatus;
    finishing: PlanStatus;
    sampling: PlanStatus;
    testing: PlanStatus;
  };
  // Store ISO Control Numbers for plans
  planMetadata?: Record<string, ISODocumentMetadata & { generatedDate: string }>;
  purchasingRequests?: PurchasingRequest[];
  cuttingPlanDetails?: CuttingPlanDetail[];
  dailyLogs?: ProductionLog[];
  productionProgress?: Record<string, number>;
  stageSchedules?: Record<string, { startDate: string; endDate: string }>;
}

export interface ExportInvoice {
  id: string;
  jobId: string;
  styleNumber: string;
  invoiceAmount: number;
  currency: 'USD' | 'EUR' | 'GBP';
  shipDate: string;
  paymentTerms: number;
  isoMetadata?: ISODocumentMetadata;
}

export interface DevelopmentSample {
  id: string;
  samNumber: string;
  buyer: string;
  styleNo: string;
  type: string;
  fabric: string;
  shade: string;
  wash: string;
  baseSize: string;
  threadColor: string;
  zipperColor: string;
  lining: string;
  quantity: string;
  deadline: string;
  status: 'Pending' | 'In Progress' | 'Approved' | 'Rejected';
  isTestingRequired: boolean;
  season?: string;
  notes?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'Shipment' | 'Meeting' | 'CP Task' | 'Job Milestone' | 'Custom';
  color: string;
  context?: string;
  isCustom?: boolean;
}

export interface CompanyDetails {
  name: string;
  address: string;
  phone: string;
  website: string;
  logoUrl: string | null;
}

export interface POItemVariant {
  id: string;
  usage: string; // The specific size/color key
  note: string; // Editable note per variant
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface POLineItem {
  id: string;
  materialName: string;
  description: string;
  variants: POItemVariant[];
}

export interface IssuedPurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  dateIssued: string;
  currency: string;
  taxRate: number;
  applyTax: boolean;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  itemCount: number;
  status: 'Issued' | 'Sent' | 'Closed';
  creditTerms: string;
  lines?: POLineItem[]; // Stores the detailed structure
  isoMetadata?: ISODocumentMetadata;
}
