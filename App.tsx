
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { MainOrdersDashboard } from './components/MainOrdersDashboard';
import { CostingDashboard } from './components/CostingDashboard';
import { SamplingDashboard } from './components/SamplingDashboard';
import { PurchasingDashboard } from './components/PurchasingDashboard';
import { SettingsDashboard } from './components/SettingsDashboard';
import { BuyersDashboard } from './components/BuyersDashboard';
import { SuppliersDashboard } from './components/SuppliersDashboard';
import { BOMManagerDashboard } from './components/BOMManagerDashboard';
import { AIAssistant } from './components/AIAssistant';
import { NewOrderModal } from './components/NewOrderModal';
import { OrderSummaryView } from './components/OrderSummaryView';
import { ProductionFlowDashboard } from './components/ProductionFlowDashboard';
import { IntegratedFinanceDashboard } from './components/IntegratedFinanceDashboard';
import { ExportLogisticsController } from './components/ExportLogisticsController';
import { ResourcesDashboard, ConsumptionCalculatorModal, CBMCalculatorModal, ThreadConsumptionModal, FabricGSMModal, PantoneConverterModal } from './components/ResourcesDashboard';
import { EventsDashboard } from './components/EventsDashboard';
import { CostingSheetGenerator } from './components/CostingSheetGenerator';
import { CatalogueMaker } from './components/CatalogueMaker';
import { TopBar } from './components/TopBar';
import { Tab, Buyer, Supplier, Order, NewOrderState, SystemUser, JobBatch, ExportInvoice, MasterBOMItem, DevelopmentSample, CalendarEvent, CompanyDetails, IssuedPurchaseOrder } from './types';
import { MOCK_ORDERS, MOCK_BUYERS, MOCK_SUPPLIERS, MOCK_MASTER_BOM_ITEMS, LOGO_URL } from './constants';
import { X, Image as ImageIcon } from 'lucide-react';

// Initial Users
const INITIAL_USERS: SystemUser[] = [
  { id: 'u1', name: 'Admin User', username: 'admin', role: 'Administrator', lastActive: 'Now' },
];

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  
  // Data State
  const [buyers, setBuyers] = useState<Buyer[]>(MOCK_BUYERS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS); 
  const [users, setUsers] = useState<SystemUser[]>(INITIAL_USERS);
  const [jobs, setJobs] = useState<JobBatch[]>([]); 
  const [taxRate, setTaxRate] = useState<number>(18.0); 
  const [masterBOMItems, setMasterBOMItems] = useState<MasterBOMItem[]>(MOCK_MASTER_BOM_ITEMS); 
  const [developmentSamples, setDevelopmentSamples] = useState<DevelopmentSample[]>([]);
  const [issuedPOs, setIssuedPOs] = useState<IssuedPurchaseOrder[]>([]); // New state for issued POs
  
  // Company Details State
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>({
    name: 'Nizamia Apparels',
    address: 'Plot# RCC14, Shed Nr 02, Estate Avenue Road, SITE Area, Karachi 75700, Pakistan',
    phone: '+92 21 32564717',
    website: 'www.nizamia.com',
    logoUrl: null
  });

  // Events & Schedule State
  const [customEvents, setCustomEvents] = useState<CalendarEvent[]>([]);
  const [isEventsModalOpen, setIsEventsModalOpen] = useState(false);
  
  // Tools Modal State
  const [activeTool, setActiveTool] = useState<string | null>(null);

  // Finance State
  const [exportInvoices, setExportInvoices] = useState<ExportInvoice[]>([]);

  // Global Currency & Top Bar State
  const [currencyRates, setCurrencyRates] = useState({
    USD: 278.50,
    EUR: 302.10,
    GBP: 355.00,
    lastUpdated: new Date().toISOString()
  });
  const [cottonRate, setCottonRate] = useState<number>(95.50); 
  const [enabledCities, setEnabledCities] = useState<string[]>(['London', 'New York', 'Dubai']);

  // Modal States
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrderData, setEditingOrderData] = useState<NewOrderState | null>(null);
  const [summaryData, setSummaryData] = useState<NewOrderState | null>(null);

  // Helper: Convert flat Order to deep NewOrderState
  const mapOrderToDeepState = (order: Order): NewOrderState => {
      // (Implementation remains same)
      return {
          generalInfo: {
            formData: {
              jobNumber: order.orderID || '',
              buyerName: order.buyer || '',
              factoryRef: order.factoryRef || '',
              styleNumber: order.styleNo || '',
              productID: order.id || '',
              poNumber: order.poNumber || '',
              poDate: order.poDate || '', 
              shipDate: order.deliveryDate || '',
              shipMode: 'Ocean',
            },
            styleImage: order.imageUrl || null,
            colors: order.colors || [],
            sizeGroups: order.sizeGroups || []
          },
          fitting: order.fitting || { fileName: null, fitName: '', sizeRange: '', specsDate: '', specsDescription: '' },
          sampling: order.samplingDetails || [],
          embellishments: order.embellishments || [],
          washing: order.washing || {},
          finishing: order.finishing || { finalInspectionStatus: 'Pending', handFeelStandard: '', pressingInstructions: '', tagPlacement: '', foldingType: 'Flat Pack', polybagSpec: '', assortmentMethod: 'Solid Size / Solid Color', cartonMarkings: '', maxPiecesPerCarton: '', packagingSpecSheetRef: null, finishingApprovalDate: '' },
          criticalPath: order.criticalPath || { capacity: { totalOrderQty: order.quantity || 0, fabricLeadTime: 0, trimsLeadTime: 0, cuttingOutput: 0, sewingLines: 0, sewingOutputPerLine: 0, finishingOutput: 0 }, schedule: [] },
          bom: order.bom || [],
          bomStatus: order.bomStatus || 'Draft',
          planningNotes: order.planningNotes || '',
          skippedStages: order.skippedStages || []
      };
  };

  const handleSaveOrder = (newOrderState: NewOrderState, close: boolean = true) => {
      const existingIndex = orders.findIndex(o => o.orderID === newOrderState.generalInfo.formData.jobNumber);
      const estimatedPrice = parseFloat(newOrderState.generalInfo.sizeGroups?.[0]?.unitPrice || '0') || 0;

      const flatOrder: Order = {
          id: newOrderState.generalInfo.formData.productID || Math.random().toString(36).substr(2, 9),
          orderID: newOrderState.generalInfo.formData.jobNumber,
          poNumber: newOrderState.generalInfo.formData.poNumber,
          poDate: newOrderState.generalInfo.formData.poDate,
          buyer: newOrderState.generalInfo.formData.buyerName || 'Unknown Buyer',
          styleNo: newOrderState.generalInfo.formData.styleNumber,
          styleName: newOrderState.generalInfo.formData.styleNumber,
          quantity: newOrderState.criticalPath.capacity.totalOrderQty,
          deliveryDate: newOrderState.generalInfo.formData.shipDate,
          status: close ? 'Pending' : 'Draft', 
          amount: newOrderState.criticalPath.capacity.totalOrderQty * estimatedPrice, 
          price: estimatedPrice,
          factoryRef: newOrderState.generalInfo.formData.factoryRef,
          cpNextDueDate: newOrderState.criticalPath.schedule.find(s => s.status !== 'Complete')?.calculatedDueDate || '-',
          cpRiskCount: newOrderState.criticalPath.schedule.filter(s => {
              const today = new Date().toISOString().split('T')[0];
              return s.status !== 'Complete' && s.calculatedDueDate < today;
          }).length,
          fabricStatus: 'Pending',
          currentStage: 'Proto Sample',
          imageUrl: newOrderState.generalInfo.styleImage || undefined,
          styleDescription: 'New Style',
          fabricName: newOrderState.bom.find(i => i.processGroup === 'Fabric')?.componentName || 'TBD',
          fabricDescription: '',
          ppMeetingDate: newOrderState.criticalPath.schedule.find(s => s.milestone === 'PP Sample Approval')?.calculatedDueDate,
          ppMeetingStatus: 'Pending',
          sourcingDate: newOrderState.criticalPath.schedule.find(s => s.milestone === 'Fabric Order Placement')?.calculatedDueDate,
          approvalsCompleted: newOrderState.sampling.filter(s => s.status === 'Approved').length,
          approvalsTotal: newOrderState.sampling.length,
          linkedJobId: orders[existingIndex]?.linkedJobId,
          samplingDetails: newOrderState.sampling,
          bom: newOrderState.bom,
          bomStatus: newOrderState.bomStatus,
          criticalPath: newOrderState.criticalPath,
          finishing: newOrderState.finishing,
          sizeGroups: newOrderState.generalInfo.sizeGroups,
          colors: newOrderState.generalInfo.colors,
          fitting: newOrderState.fitting,
          washing: newOrderState.washing,
          embellishments: newOrderState.embellishments,
          planningNotes: newOrderState.planningNotes,
          skippedStages: newOrderState.skippedStages
      };

      if (existingIndex >= 0) {
          const updatedOrders = [...orders];
          updatedOrders[existingIndex] = { ...updatedOrders[existingIndex], ...flatOrder, status: close ? 'Pending' : 'Draft', linkedJobId: updatedOrders[existingIndex].linkedJobId };
          setOrders(updatedOrders);
      } else {
          setOrders([flatOrder, ...orders]);
      }
      
      if (close) {
        setIsOrderModalOpen(false);
        setEditingOrderData(null);
      } else {
        setEditingOrderData(newOrderData => newOrderState);
      }
  };

  const handleBulkImportOrders = (data: { orders: Order[], invoices: ExportInvoice[] }) => {
      setOrders(prev => [...data.orders, ...prev]);
      if (data.invoices.length > 0) {
          setExportInvoices(prev => [...data.invoices, ...prev]);
      }
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.orderID !== orderId));
    setIsOrderModalOpen(false);
    setEditingOrderData(null);
  };

  const handleUpdateOrder = (updatedOrder: Order) => {
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };

  const handleUpdateSingleJob = (updatedJob: JobBatch) => {
      setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
  };

  const handleAddDevSample = (sample: DevelopmentSample) => {
      setDevelopmentSamples(prev => [...prev, sample]);
  };

  const handleUpdateDevSample = (sample: DevelopmentSample) => {
      setDevelopmentSamples(prev => prev.map(s => s.id === sample.id ? sample : s));
  };

  const handleDeleteDevSample = (id: string) => {
      setDevelopmentSamples(prev => prev.filter(s => s.id !== id));
  };

  const handleViewSummary = (order: Order) => {
      const deepState = mapOrderToDeepState(order);
      setSummaryData(deepState);
  };

  const handlePrintSummary = () => {
      const printContent = document.getElementById('printable-summary-area');
      if (!printContent) return;
      const visibleWindow = window.open('', '_blank', 'width=1000,height=800');
      if (visibleWindow) {
          visibleWindow.document.write(`<html><head><title>Order PO Print View</title><script src="https://cdn.tailwindcss.com"></script></head><body class="p-8">${printContent.innerHTML}</body></html>`);
          visibleWindow.document.close();
          visibleWindow.focus();
          setTimeout(() => visibleWindow.print(), 800);
      }
  };

  const handleToolAction = (toolId: string) => {
      if (toolId === 'costing-generator' || toolId === 'fabric-consumption' || toolId === 'cbm' || toolId === 'sewing-thread' || toolId === 'gsm' || toolId === 'pantone-converter' || toolId === 'catalogue-maker') {
          setActiveTool(toolId);
      } else {
          alert("This tool is currently under development.");
      }
  };

  const renderContent = () => {
    if (summaryData) {
        return (
            <div id="printable-summary-area" className="h-full overflow-y-auto relative bg-gray-50 printable-content">
               <button onClick={() => setSummaryData(null)} className="fixed top-28 right-8 z-[60] bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 border border-gray-200 no-print">
                 <X size={24} className="text-gray-600" />
               </button>
               <OrderSummaryView orderData={summaryData} onEdit={() => { setEditingOrderData(summaryData); setSummaryData(null); setIsOrderModalOpen(true); }} onGeneratePDF={handlePrintSummary} />
            </div>
        );
    }

    switch (activeTab) {
      case Tab.DASHBOARD:
        return (
            <Dashboard 
                orders={orders} 
                jobs={jobs} 
                customEvents={customEvents}
                onOpenEvents={() => setIsEventsModalOpen(true)}
            />
        );
      case Tab.ORDERS:
        return <MainOrdersDashboard orders={orders} jobs={jobs} onUpdateJobs={setJobs} onCreateOrder={() => { setEditingOrderData(null); setIsOrderModalOpen(true); }} onRowClick={(id) => { const order = orders.find(o => o.orderID === id); if (order) handleViewSummary(order); }} onBulkImport={handleBulkImportOrders} />;
      case Tab.PLANNING:
        return (
            <div className="flex flex-col h-full space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-[#37352F]">Planning</h1>
                </div>
                <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm flex items-center justify-center p-12 text-center">
                    <div className="max-w-md space-y-2">
                        <h3 className="text-lg font-medium text-gray-900">Planning Module</h3>
                        <p className="text-sm text-gray-500">
                            This section is under construction. Future updates will include Gantt charts and capacity planning tools.
                        </p>
                    </div>
                </div>
            </div>
        );
      case Tab.COSTING:
        return <CostingDashboard />;
      case Tab.SAMPLING:
        return <SamplingDashboard orders={orders} jobs={jobs} onUpdateOrder={handleUpdateOrder} onUpdateJob={handleUpdateSingleJob} developmentSamples={developmentSamples} onAddDevSample={handleAddDevSample} onUpdateDevSample={handleUpdateDevSample} onDeleteDevSample={handleDeleteDevSample} />;
      case Tab.PURCHASING:
        return <PurchasingDashboard 
          orders={orders} 
          jobs={jobs} 
          taxRate={taxRate} 
          companyDetails={companyDetails} 
          currentUser={users[0].name}
          issuedPOs={issuedPOs}
          onUpdateIssuedPOs={setIssuedPOs}
          onUpdateJobs={setJobs} // Added prop
        />;
      case Tab.PRODUCTION:
        return <ProductionFlowDashboard jobs={jobs} onUpdateJob={handleUpdateSingleJob} />;
      case Tab.BUYERS:
        return <BuyersDashboard buyers={buyers} onAddBuyer={(b) => setBuyers([...buyers, b])} onDeleteBuyer={(id) => setBuyers(buyers.filter(b => b.id !== id))} />;
      case Tab.SUPPLIERS:
        return <SuppliersDashboard suppliers={suppliers} onAddSupplier={(s) => setSuppliers([...suppliers, s])} onDeleteSupplier={(id) => setSuppliers(suppliers.filter(s => s.id !== id))} />;
      case Tab.BOM:
        return <BOMManagerDashboard masterItems={masterBOMItems} setMasterItems={setMasterBOMItems} buyers={buyers} suppliers={suppliers} />;
      case Tab.FINANCE:
        return <IntegratedFinanceDashboard currencyRates={currencyRates} exportInvoicesData={exportInvoices} />;
      case Tab.SHIPPING:
        return <ExportLogisticsController jobs={jobs} onUpdateJob={handleUpdateSingleJob} />;
      case Tab.RESOURCES:
        return <ResourcesDashboard onOpenTool={handleToolAction} />;
      case Tab.SETTINGS:
        return (
          <SettingsDashboard 
            taxRate={taxRate} 
            onUpdateTaxRate={setTaxRate} 
            currencyRates={currencyRates} 
            onUpdateCurrencyRates={setCurrencyRates} 
            cottonRate={cottonRate} 
            onUpdateCottonRate={setCottonRate} 
            enabledCities={enabledCities} 
            onUpdateEnabledCities={setEnabledCities}
            companyDetails={companyDetails}
            onUpdateCompanyDetails={setCompanyDetails}
          />
        );
      default:
        return <Dashboard orders={orders} jobs={jobs} customEvents={customEvents} onOpenEvents={() => setIsEventsModalOpen(true)} />;
    }
  };

  return (
    <div className="flex h-screen bg-white font-sans text-[#37352F] overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => { setSummaryData(null); setActiveTab(tab); }} 
        onOpenEvents={() => setIsEventsModalOpen(true)}
        onOpenTool={handleToolAction}
        companyLogo={companyDetails.logoUrl}
      />
      
      <main className="flex-1 overflow-hidden bg-white relative flex flex-col">
        <TopBar currencyRates={currencyRates} cottonRate={cottonRate} enabledCities={enabledCities} />
        {/* Main Content Area - Updated to overflow-hidden to support internal scrolling components */}
        <div className="flex-1 overflow-hidden p-6" id="printable-area-wrapper">
           {renderContent()}
        </div>
      </main>

      {isOrderModalOpen && (
        <NewOrderModal isOpen={isOrderModalOpen} onClose={() => { setIsOrderModalOpen(false); setEditingOrderData(null); }} onSave={handleSaveOrder} onDelete={handleDeleteOrder} initialData={editingOrderData} availableBuyers={buyers} availableSuppliers={suppliers} masterBOMItems={masterBOMItems} />
      )}
      
      {/* EVENTS MODAL */}
      {isEventsModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="bg-white w-full max-w-6xl h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
                <EventsDashboard 
                    orders={orders} 
                    jobs={jobs} 
                    customEvents={customEvents}
                    onUpdateCustomEvents={setCustomEvents}
                    onClose={() => setIsEventsModalOpen(false)}
                />
             </div>
          </div>
      )}

      {/* GLOBAL TOOLS MODALS */}
      {activeTool === 'fabric-consumption' && (
          <ConsumptionCalculatorModal onClose={() => setActiveTool(null)} />
      )}

      {activeTool === 'cbm' && (
          <CBMCalculatorModal onClose={() => setActiveTool(null)} />
      )}

      {activeTool === 'sewing-thread' && (
          <ThreadConsumptionModal onClose={() => setActiveTool(null)} />
      )}

      {activeTool === 'gsm' && (
          <FabricGSMModal onClose={() => setActiveTool(null)} />
      )}

      {activeTool === 'pantone-converter' && (
          <PantoneConverterModal onClose={() => setActiveTool(null)} />
      )}

      {activeTool === 'costing-generator' && (
          <div className="fixed inset-0 z-[150] bg-white animate-in slide-in-from-bottom-10 duration-300">
              <CostingSheetGenerator onBack={() => setActiveTool(null)} />
          </div>
      )}

      {activeTool === 'catalogue-maker' && (
          <CatalogueMaker onClose={() => setActiveTool(null)} />
      )}

      <AIAssistant />
    </div>
  );
};
