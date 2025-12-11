
import React, { useState, useMemo, useCallback } from 'react';
import { 
  X, Loader2, AlertCircle, CheckCircle2, Save, Trash2, Lock, 
  ChevronRight, ChevronLeft, Info, Layers, Scissors, Droplets, 
  Palette, Package, Calendar, FileText, Check, ClipboardList, Ban
} from 'lucide-react';
import { GeneralInfoTab } from './GeneralInfoTab';
import { FittingTab } from './FittingTab';
import { SamplingTab } from './SamplingTab';
import { EmbellishmentTab } from './EmbellishmentTab';
import { WashingTab } from './WashingTab';
import { FinishingTab } from './FinishingTab';
import { CriticalPathTab } from './CriticalPathTab';
import { BOMTab } from './BOMTab';
import { PlanningTab } from './PlanningTab';
import { 
  NewOrderState, POData, ColorRow, SizeGroup, Buyer, Supplier, MasterBOMItem 
} from '../types';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (orderData: NewOrderState, close?: boolean) => void;
  onDelete?: (orderId: string) => void;
  initialData?: NewOrderState | null;
  availableBuyers: Buyer[];
  availableSuppliers: Supplier[];
  masterBOMItems: MasterBOMItem[]; // Added Prop
}

// Initial State Configuration
const INITIAL_STATE: NewOrderState = {
  generalInfo: {
    formData: {
      jobNumber: '',
      buyerName: "",
      factoryRef: '',
      styleNumber: '',
      productID: '',
      poNumber: '',
      poDate: '',
      shipDate: '',
      shipMode: 'Ocean',
    },
    colors: [],
    sizeGroups: [],
    styleImage: null
  },
  fitting: {
    fileName: null,
    fitName: '',
    sizeRange: '',
    specsDate: '',
    specsDescription: ''
  },
  sampling: [],
  embellishments: [],
  washing: {},
  finishing: {
    finalInspectionStatus: 'Pending',
    handFeelStandard: '',
    pressingInstructions: '',
    tagPlacement: '',
    foldingType: 'Flat Pack',
    polybagSpec: '',
    assortmentMethod: 'Solid Size / Solid Color',
    cartonMarkings: '',
    maxPiecesPerCarton: '',
    packagingSpecSheetRef: null,
    finishingApprovalDate: ''
  },
  criticalPath: {
    capacity: {
      totalOrderQty: 0,
      fabricLeadTime: 0,
      trimsLeadTime: 0,
      cuttingOutput: 0,
      sewingLines: 0,
      sewingOutputPerLine: 0,
      finishingOutput: 0,
    },
    schedule: []
  },
  bom: [],
  bomStatus: 'Draft',
  planningNotes: '',
  skippedStages: []
};

// Wizard Step Configuration
const STEPS = [
  { id: 'General Info', label: 'General', description: 'Buyer, Style & Qty', icon: FileText, canSkip: false },
  { id: 'BOM', label: 'BOM', description: 'Fabrics & Trims', icon: Layers, canSkip: true },
  { id: 'Sampling', label: 'Sampling', description: 'Proto to PP', icon: Scissors, canSkip: true },
  { id: 'Fitting', label: 'Fitting', description: 'Measurements', icon: Info, canSkip: true },
  { id: 'Washing', label: 'Wash', description: 'Wet Processing', icon: Droplets, canSkip: true },
  { id: 'Embellishment', label: 'Embellishment', description: 'Prints & Embroidery', icon: Palette, canSkip: true },
  { id: 'Finishing', label: 'Finishing', description: 'Carton & Labels', icon: Package, canSkip: true },
  { id: 'Critical Path', label: 'Critical Path', description: 'T&A Schedule', icon: Calendar, canSkip: true },
  { id: 'Planning', label: 'Remarks', description: 'Internal Notes', icon: ClipboardList, canSkip: true },
];

export const NewOrderModal: React.FC<NewOrderModalProps> = ({ 
  isOpen, onClose, onSave, onDelete, initialData, availableBuyers, availableSuppliers, masterBOMItems 
}) => {
  // Navigation State
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  // Initialize state once on mount
  const [newOrderData, setNewOrderData] = useState<NewOrderState>(() => {
    if (initialData) {
      return initialData;
    }
    const year = new Date().getFullYear();
    const yearShort = year.toString().slice(-2);
    const randomSeq = Math.floor(100 + Math.random() * 900);
    const randomId = `NZ-${randomSeq}-${yearShort}`;
    
    return {
        ...INITIAL_STATE,
        generalInfo: {
            ...INITIAL_STATE.generalInfo,
            formData: {
                ...INITIAL_STATE.generalInfo.formData,
                jobNumber: randomId
            }
        }
    };
  });

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  if (!isOpen) return null;

  // --- Helpers ---

  const calculateProgress = () => {
    let filledPoints = 0;
    const totalPoints = 15; // Increased for Planning tab

    const { generalInfo, bom, sampling, fitting, washing, embellishments, finishing, criticalPath, planningNotes } = newOrderData;

    // General Info (3 points)
    if (generalInfo.formData.buyerName) filledPoints++;
    if (generalInfo.formData.styleNumber) filledPoints++;
    if (generalInfo.sizeGroups.length > 0) filledPoints++;

    // BOM (2 points)
    if (bom.length > 0) filledPoints += 2;

    // Others (1 point each if present/touched)
    if (sampling.length > 0) filledPoints++;
    if (fitting.fitName) filledPoints++;
    if (Object.keys(washing).length > 0) filledPoints++;
    if (embellishments.length > 0) filledPoints++;
    if (finishing.foldingType) filledPoints++;
    if (criticalPath.schedule.length > 0) filledPoints += 2; // Schedule implies effort
    if (planningNotes) filledPoints++;

    // Skipped stages count as "filled" for progress
    filledPoints += newOrderData.skippedStages.length;

    return Math.min(100, Math.round((filledPoints / totalPoints) * 100));
  };

  // --- Handlers ---

  const handleSetFormData = useCallback((val: POData | ((prev: POData) => POData)) => {
    setNewOrderData(prev => {
      const current = prev.generalInfo.formData;
      const next = typeof val === 'function' ? val(current) : val;
      return { ...prev, generalInfo: { ...prev.generalInfo, formData: next } };
    });
  }, []);

  const handleSetColors = useCallback((val: ColorRow[] | ((prev: ColorRow[]) => ColorRow[])) => {
    setNewOrderData(prev => {
      const current = prev.generalInfo.colors;
      const next = typeof val === 'function' ? val(current) : val;
      return { ...prev, generalInfo: { ...prev.generalInfo, colors: next } };
    });
  }, []);

  const handleSetStyleImage = useCallback((val: string | null) => {
    setNewOrderData(prev => ({
        ...prev,
        generalInfo: { ...prev.generalInfo, styleImage: val }
    }));
  }, []);

  const handleSetSizeGroups = useCallback((groups: SizeGroup[]) => {
      setNewOrderData(prev => {
         let totalQty = 0;
         const allColors = new Map<string, string>();
         
         groups.forEach(g => {
             g.colors.forEach(c => {
                if(c.name && c.name !== 'New Color') {
                    allColors.set(c.name, c.id);
                }
             });
             
             Object.values(g.breakdown).forEach(row => {
                 Object.values(row).forEach(qty => totalQty += (Number(qty) || 0));
             });
         });
         
         const uniqueColorRows: ColorRow[] = Array.from(allColors.entries()).map(([name, id]) => ({ id, name }));

         return {
             ...prev,
             generalInfo: { 
                 ...prev.generalInfo, 
                 sizeGroups: groups,
                 colors: uniqueColorRows 
             },
             criticalPath: {
                 ...prev.criticalPath,
                 capacity: {
                     ...prev.criticalPath.capacity,
                     totalOrderQty: totalQty
                 }
             }
         };
      });
  }, []);

  // Live Calculation of Breakdown (For Display Only)
  const orderBreakdown = useMemo(() => {
    let totalPOQuantity = 0;
    const colorQuantities: Record<string, number> = {};
    const sizeQuantities: Record<string, number> = {};

    const groups = newOrderData?.generalInfo?.sizeGroups || [];

    groups.forEach(group => {
      Object.entries(group.breakdown).forEach(([colorId, sizeMap]) => {
        const colorName = group.colors.find(c => c.id === colorId)?.name || 'Unknown';
        Object.entries(sizeMap).forEach(([size, qtyStr]) => {
          const qty = parseInt(qtyStr) || 0;
          totalPOQuantity += qty;
          colorQuantities[colorName] = (colorQuantities[colorName] || 0) + qty;
          sizeQuantities[size] = (sizeQuantities[size] || 0) + qty;
        });
      });
    });

    return { totalPOQuantity, colorQuantities, sizeQuantities };
  }, [newOrderData.generalInfo.sizeGroups]);
  
  const handleSaveProgress = async () => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        onSave(newOrderData, false);
        const now = new Date();
        setLastSaved(`Saved as Draft at ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`);
        setIsSubmitting(false);
    } catch (err) {
        setSubmitError("Failed to save progress");
        setIsSubmitting(false);
    }
  };

  const handleFinalSubmit = async () => {
      setSubmitError(null);
      setIsSubmitting(true);

      if (!newOrderData.generalInfo.formData.styleNumber) {
          setSubmitError("Style Number is required in General Info tab.");
          setIsSubmitting(false);
          return;
      }

      try {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          onSave(newOrderData, true);
          setSubmitSuccess(true);
          setTimeout(() => {
              setSubmitSuccess(false);
              setNewOrderData(INITIAL_STATE);
              onClose();
          }, 1500);
      } catch (err: any) {
          console.error("Submission Error", err);
          setSubmitError(err.message || "An unexpected error occurred.");
      } finally {
          if (!submitSuccess) {
              setIsSubmitting(false);
          }
      }
  };

  const handleConfirmDelete = () => {
     if (deletePassword === 'admin') {
         if (onDelete && newOrderData.generalInfo.formData.jobNumber) {
             onDelete(newOrderData.generalInfo.formData.jobNumber);
         }
         setIsDeleteModalOpen(false);
         onClose(); 
     } else {
         setDeleteError('Incorrect password. Try "admin"');
     }
  };

  const handleReleaseBOM = () => {
      setNewOrderData(prev => ({ ...prev, bomStatus: 'Released' }));
      onSave({ ...newOrderData, bomStatus: 'Released' }, false);
  };

  const toggleSkipStage = (stageId: string) => {
      setNewOrderData(prev => {
          const isSkipped = prev.skippedStages.includes(stageId);
          if (isSkipped) {
              return { ...prev, skippedStages: prev.skippedStages.filter(id => id !== stageId) };
          } else {
              return { ...prev, skippedStages: [...prev.skippedStages, stageId] };
          }
      });
  };

  // --- Wizard Navigation ---
  
  const nextStep = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const goToStep = (index: number) => {
    setCurrentStepIndex(index);
  };

  const currentStep = STEPS[currentStepIndex];
  const isCurrentStageSkipped = newOrderData.skippedStages.includes(currentStep.id);

  const renderContent = () => {
    if (isCurrentStageSkipped) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-12">
                <Ban size={48} className="mb-4 text-gray-200" />
                <h3 className="text-lg font-medium text-gray-500">Stage Not Applicable</h3>
                <p className="text-sm">This stage has been marked as not applicable for this order.</p>
                <button 
                    onClick={() => toggleSkipStage(currentStep.id)}
                    className="mt-4 text-sm text-blue-600 hover:underline"
                >
                    Enable Stage
                </button>
            </div>
        );
    }

    switch (currentStep.id) {
      case 'General Info':
        return (
          <GeneralInfoTab 
            colors={newOrderData.generalInfo.colors} 
            setColors={handleSetColors} 
            formData={newOrderData.generalInfo.formData} 
            setFormData={handleSetFormData} 
            sizeGroups={newOrderData.generalInfo.sizeGroups}
            onSizeGroupsChange={handleSetSizeGroups}
            availableBuyers={availableBuyers}
            styleImage={newOrderData.generalInfo.styleImage}
            setStyleImage={handleSetStyleImage}
          />
        );
      case 'BOM':
        return (
            <BOMTab 
                orderBreakdownData={orderBreakdown} 
                sizeGroups={newOrderData.generalInfo.sizeGroups} 
                data={newOrderData.bom}
                onUpdate={(data) => setNewOrderData(prev => ({ ...prev, bom: data }))}
                availableSuppliers={availableSuppliers}
                bomStatus={newOrderData.bomStatus}
                onReleaseBOM={handleReleaseBOM}
                masterItems={masterBOMItems} // Pass the master list
            />
        );
      case 'Sampling':
        return (
            <SamplingTab 
                data={newOrderData.sampling}
                onUpdate={(data) => setNewOrderData(prev => ({ ...prev, sampling: data }))}
            />
        );
      case 'Fitting':
        return (
            <FittingTab 
                data={newOrderData.fitting}
                onUpdate={(data) => setNewOrderData(prev => ({ ...prev, fitting: data }))}
            />
        );
      case 'Washing':
        return (
            <WashingTab 
                colors={newOrderData.generalInfo.colors} 
                data={newOrderData.washing}
                onUpdate={(data) => setNewOrderData(prev => ({ ...prev, washing: data }))}
            />
        );
      case 'Embellishment':
        return (
            <EmbellishmentTab 
                data={newOrderData.embellishments}
                onUpdate={(data) => setNewOrderData(prev => ({ ...prev, embellishments: data }))}
            />
        );
      case 'Finishing':
        return (
            <FinishingTab 
                data={newOrderData.finishing}
                onUpdate={(data) => setNewOrderData(prev => ({ ...prev, finishing: data }))}
            />
        );
      case 'Critical Path':
        return (
            <CriticalPathTab 
                shipDate={newOrderData.generalInfo.formData.shipDate} 
                poDate={newOrderData.generalInfo.formData.poDate} 
                capacity={newOrderData.criticalPath.capacity}
                schedule={newOrderData.criticalPath.schedule}
                samplingData={newOrderData.sampling}
                onUpdateCapacity={(cap) => setNewOrderData(prev => ({ ...prev, criticalPath: { ...prev.criticalPath, capacity: cap } }))}
                onUpdateSchedule={(sch) => setNewOrderData(prev => ({ ...prev, criticalPath: { ...prev.criticalPath, schedule: sch } }))}
            />
        );
      case 'Planning':
        return (
            <PlanningTab
                notes={newOrderData.planningNotes}
                onUpdate={(notes) => setNewOrderData(prev => ({ ...prev, planningNotes: notes }))}
            />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={!isSubmitting && !isDeleteModalOpen ? onClose : undefined}
      />
      
      <div className="relative bg-white w-full max-w-7xl h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* HEADER AREA */}
        <div className="bg-white border-b border-gray-200 flex-shrink-0">
            {/* Top Bar: Progress & Title */}
            <div className="px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-[#37352F]">Order Setup</h3>
                    <span className="h-4 w-px bg-gray-300 mx-2"></span>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                            <span>Data Completion</span>
                            <span className="text-[#37352F]">{calculateProgress()}%</span>
                        </div>
                        <div className="w-32 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${calculateProgress()}%` }}></div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {lastSaved && <p className="text-[10px] text-green-600 flex items-center gap-1"><CheckCircle2 size={10} /> {lastSaved}</p>}
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Horizontal Stepper */}
            <div className="flex overflow-x-auto border-t border-gray-100 bg-gray-50/50 hide-scrollbar">
                {STEPS.map((step, index) => {
                    const isActive = index === currentStepIndex;
                    const isCompleted = index < currentStepIndex;
                    const isSkipped = newOrderData.skippedStages.includes(step.id);
                    const Icon = step.icon;

                    return (
                        <button
                            key={step.id}
                            onClick={() => !isSubmitting && goToStep(index)}
                            disabled={isSubmitting}
                            className={`flex items-center gap-2 px-6 py-3 border-r border-gray-100 transition-colors whitespace-nowrap min-w-max relative
                                ${isActive ? 'bg-white text-[#37352F] font-semibold border-b-2 border-b-[#37352F]' : 
                                  isSkipped ? 'text-gray-300 bg-gray-50' :
                                  'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
                        >
                            <div className={`
                                w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors
                                ${isActive ? 'bg-[#37352F] border-[#37352F] text-white' : 
                                  isCompleted && !isSkipped ? 'bg-green-500 border-green-500 text-white' : 
                                  'bg-white border-gray-300 text-gray-400'}
                            `}>
                                {isCompleted && !isSkipped ? <Check size={12} /> : (index + 1)}
                            </div>
                            <span className="text-sm">{step.label}</span>
                            {isSkipped && <Ban size={12} className="text-gray-300 ml-1" />}
                        </button>
                    );
                })}
            </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 overflow-hidden flex flex-col bg-white relative">
           {/* Context Header for Current Step */}
           <div className="px-8 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                    {React.createElement(currentStep.icon, { size: 20 })}
                 </div>
                 <div>
                    <h2 className="text-xl font-bold text-[#37352F]">{currentStep.label}</h2>
                    <p className="text-xs text-gray-500">{currentStep.description}</p>
                 </div>
              </div>
              
              {/* Not Applicable Toggle */}
              {currentStep.canSkip && (
                  <label className="flex items-center gap-2 cursor-pointer select-none group">
                      <input 
                          type="checkbox" 
                          checked={isCurrentStageSkipped}
                          onChange={() => toggleSkipStage(currentStep.id)}
                          className="w-4 h-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500 cursor-pointer"
                      />
                      <span className={`text-sm font-medium ${isCurrentStageSkipped ? 'text-gray-400' : 'text-gray-600 group-hover:text-gray-900'}`}>
                          Mark as Not Applicable
                      </span>
                  </label>
              )}
           </div>

           {/* Scrollable Form Area */}
           <div className="flex-1 overflow-y-auto p-8 relative bg-gray-50/30">
              {renderContent()}
           </div>

           {/* Feedback Messages */}
           {(submitError || submitSuccess) && (
              <div className={`px-8 py-3 flex items-center gap-2 text-sm font-medium border-t
                 ${submitError ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}
              `}>
                 {submitError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                 {submitError || "Order submitted successfully! Redirecting..."}
              </div>
           )}

           {/* Footer Actions */}
           <div className="px-8 py-4 border-t border-gray-100 bg-white flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-2">
                 <button 
                    onClick={() => {
                        setDeletePassword('');
                        setDeleteError('');
                        setIsDeleteModalOpen(true);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete Order"
                 >
                    <Trash2 size={18} />
                 </button>
                 <div className="h-6 w-px bg-gray-200 mx-2"></div>
                 <button 
                    onClick={handleSaveProgress}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors shadow-sm flex items-center gap-2"
                 >
                    <Save size={14} /> Save Draft
                 </button>
              </div>

              <div className="flex items-center gap-3">
                 {currentStepIndex > 0 && (
                    <button 
                       onClick={prevStep}
                       disabled={isSubmitting}
                       className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
                    >
                       <ChevronLeft size={16} /> Back
                    </button>
                 )}

                 {currentStepIndex < STEPS.length - 1 ? (
                    <button 
                       onClick={nextStep}
                       disabled={isSubmitting}
                       className="px-6 py-2 text-sm font-medium bg-[#37352F] text-white hover:bg-black rounded-md shadow-sm transition-all flex items-center gap-2"
                    >
                       Continue <ChevronRight size={16} />
                    </button>
                 ) : (
                    <button 
                       onClick={handleFinalSubmit}
                       disabled={isSubmitting || submitSuccess}
                       className={`px-6 py-2 text-sm font-medium text-white rounded-md shadow-sm transition-all flex items-center gap-2
                          ${isSubmitting ? 'bg-gray-800 opacity-80 cursor-wait' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                       {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                       Submit Order
                    </button>
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
          <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
             <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 space-y-4 m-4">
                 <div className="flex items-center gap-2 text-red-600">
                    <Lock size={20} />
                    <h3 className="text-lg font-bold">Secure Deletion</h3>
                 </div>
                 <p className="text-sm text-gray-600">
                    This will permanently delete Order <strong>{newOrderData.generalInfo.formData.jobNumber}</strong>.
                 </p>
                 <div className="space-y-1">
                     <input 
                        type="password"
                        autoFocus
                        placeholder="Admin Password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleConfirmDelete()}
                     />
                     {deleteError && <p className="text-xs text-red-500 font-medium">{deleteError}</p>}
                 </div>
                 <div className="flex justify-end gap-2 pt-2">
                    <button 
                       onClick={() => setIsDeleteModalOpen(false)}
                       className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
                    >
                       Cancel
                    </button>
                    <button 
                       onClick={handleConfirmDelete}
                       className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                       Confirm Delete
                    </button>
                 </div>
             </div>
          </div>
      )}

    </div>
  );
};
