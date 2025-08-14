import React, { useState, useEffect } from 'react';
import {
  Box as CBox,
  Button,
  Flex as CFlex,
  Text as CText,
  useColorModeValue,
  SimpleGrid,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Stack,
  InputGroup,
  InputLeftElement,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Checkbox,
  CheckboxGroup,
  VStack,
  HStack,
  Divider,
  Heading,
  Image,
  Progress,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Checkbox as ChakraCheckbox,
  RadioGroup,
  Radio,
} from '@chakra-ui/react';
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdSearch, 
  MdBuild, 
  MdCheckCircle,
  MdPending,
  MdCancel,
  MdAttachMoney,
  MdCalendarToday,
  MdPerson,
  MdDirectionsBike,
  MdCheck,
  MdClose,
  MdReceipt,
  MdArrowDropDown
} from 'react-icons/md';
import Card from 'components/card/Card';
import MiniStatistics from 'components/card/MiniStatistics';
import apiService from 'services/apiService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

export default function ServiceTracking() {
  const brandColor = useColorModeValue('brand.500', 'white');
  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  const cardBg = useColorModeValue('white', 'gray.700');
  const modalBg = useColorModeValue('white', 'gray.800');
  const modalOverlayBg = useColorModeValue('blackAlpha.600', 'blackAlpha.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');
  const blueBg = useColorModeValue('blue.50', 'blue.900');
  const grayBg = useColorModeValue('gray.50', 'gray.900');
  const greenBg = useColorModeValue('green.50', 'green.900');

  // Fatura popup renkleri (Invoice modal colors)
  const invoiceModalBg = useColorModeValue('white', 'gray.900');
  const invoiceBorderColor = useColorModeValue('gray.200', 'gray.700');
  const invoiceTextColor = useColorModeValue('gray.900', 'gray.100');
  const invoiceSubTextColor = useColorModeValue('gray.500', 'gray.400');
  const invoiceTableHeaderColor = useColorModeValue('gray.700', 'gray.200');
  const invoiceTableRowBorder = useColorModeValue('gray.100', 'gray.800');
  const invoiceTotalColor = useColorModeValue('brand.700', 'brand.200');
  
  // Additional dark mode color definitions
  const inputBg = useColorModeValue('white', 'gray.700');
  const inputTextColor = useColorModeValue('gray.800', 'gray.100');
  const inputBorderColor = useColorModeValue('gray.200', 'gray.600');
  const selectBg = useColorModeValue('white', 'gray.700');
  const optionBg = useColorModeValue('white', 'gray.700');
  const optionTextColor = useColorModeValue('black', 'white');
  const menuButtonHoverBg = useColorModeValue("gray.100", "gray.600");
  const menuButtonActiveBg = useColorModeValue("gray.200", "gray.500");
  const cancelButtonColor = useColorModeValue('gray.600', 'gray.300');
  const cancelButtonHoverBg = useColorModeValue('gray.100', 'gray.700');
  
  // Progress bar colors for analysis tab
  const progressBarBg = useColorModeValue("gray.200", "gray.700");
  
  // Status card colors
  const yellowCardBg = useColorModeValue("yellow.50", "yellow.900");
  const yellowCardBorder = useColorModeValue("yellow.200", "yellow.700");
  const blueCardBg = useColorModeValue("blue.50", "blue.900");
  const blueCardBorder = useColorModeValue("blue.200", "blue.700");
  const greenCardBg = useColorModeValue("green.50", "green.900");
  const greenCardBorder = useColorModeValue("green.200", "green.700");
  const brandCardBg = useColorModeValue("brand.50", "brand.900");
  const brandCardBorder = useColorModeValue("brand.200", "brand.700");
  
  // Operations dropdown colors
  const operationsSelectedBg = useColorModeValue("green.100", "green.800");
  const operationsSelectedColor = useColorModeValue("green.800", "green.100");
  const operationsSelectedHoverBg = useColorModeValue("green.200", "green.700");
  const operationsListBg = useColorModeValue("green.50", "gray.800");
  const operationsListBorder = useColorModeValue("green.200", "gray.700");
  const operationsItemBg = useColorModeValue("green.100", "green.900");
  const operationsItemBorder = useColorModeValue("green.300", "green.700");
  const operationsItemText = useColorModeValue("green.800", "green.100");
  const operationsTotalBg = useColorModeValue("green.200", "green.800");
  const operationsTotalText = useColorModeValue("green.800", "green.100");
  
  // Scrollbar colors
  const scrollbarTrack = useColorModeValue('#f1f1f1', '#2d3748');
  const scrollbarThumb = useColorModeValue('#888', '#4a5568');
  const scrollbarThumbHover = useColorModeValue('#555', '#2d3748');
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedService, setSelectedService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState(0);
  const [invoiceService, setInvoiceService] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [printInvoiceService, setPrintInvoiceService] = useState(null);
  const [servicePrices, setServicePrices] = useState({});
  const [priceSearchTerm, setPriceSearchTerm] = useState('');

  // MotoEtiler servis kayıtları - Database'den çekilecek
  const [serviceRecords, setServiceRecords] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);

  // Service types will come from workTypes database

  // Service prices will come from workTypes database
  
  // Helper function to get price from workTypes
  const getWorkTypePrice = (serviceName) => {
    const workType = workTypes.find(wt => wt.name === serviceName);
    return workType ? workType.basePrice : 0;
  };

  // Technician selection removed as requested

  // Real API data management
  const [availableParts, setAvailableParts] = useState([]);
  const [vespaModels, setVespaModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Part stock cache (by part id): { [id]: { storeQty, warehouseQty, stockNote } }
  const [partStockById, setPartStockById] = useState({});

  // Load data from API
  useEffect(() => {
    loadData();
  }, []);

  // (moved below state declarations)

  

  const loadWorkTypes = async () => {
    try {
      console.log('🔄 Loading work types...');
      setLoadingWorkTypes(true);
      const response = await apiService.getWorkTypes();
      console.log('📡 API Response:', response);
      const workTypesData = response.work_types || [];
      console.log('📋 Work types data:', workTypesData.length, 'items');
      
      // Transform data for frontend compatibility
      const transformedWorkTypes = workTypesData.map(wt => ({
        id: wt.id,
        name: wt.name,
        basePrice: wt.base_price,
        description: wt.description,
        category: wt.category,
        estimatedDuration: wt.estimated_duration,
        isActive: wt.is_active
      }));
      
      setWorkTypes(transformedWorkTypes);
      
      // Populate servicePrices from workTypes data
      const pricesObject = {};
      transformedWorkTypes.forEach(wt => {
        pricesObject[wt.name] = wt.basePrice;
      });
      setServicePrices(pricesObject);
      console.log('✅ Service prices populated:', pricesObject);
    } catch (error) {
      console.error('❌ Error loading work types:', error);
    } finally {
      setLoadingWorkTypes(false);
    }
  };

  // Work Type CRUD Functions
  const handleEditWorkType = (workType) => {
    setEditingWorkType(workType);
    setWorkTypeFormData({
      name: workType.name,
      base_price: workType.basePrice,
      description: workType.description || '',
      category: workType.category || '',
      estimated_duration: workType.estimatedDuration || 30
    });
    setIsWorkTypeModalOpen(true);
  };

  const handleDeleteWorkType = async (workTypeId) => {
    if (window.confirm('Bu işlem türünü silmek istediğinizden emin misiniz?')) {
      try {
        await apiService.deleteWorkType(workTypeId);
        await loadWorkTypes(); // Reload data
        alert('İşlem türü başarıyla silindi.');
      } catch (error) {
        console.error('Error deleting work type:', error);
        alert('İşlem türü silinirken hata oluştu.');
      }
    }
  };

  const handleSaveWorkType = async () => {
    try {
      const data = {
        name: workTypeFormData.name,
        base_price: parseFloat(workTypeFormData.base_price),
        description: workTypeFormData.description,
        category: workTypeFormData.category,
        estimated_duration: parseInt(workTypeFormData.estimated_duration)
      };

      if (editingWorkType) {
        // Update existing
        await apiService.updateWorkType(editingWorkType.id, data);
        alert('İşlem türü başarıyla güncellendi.');
      } else {
        // Create new
        await apiService.createWorkType(data);
        alert('Yeni işlem türü başarıyla eklendi.');
      }

      // Reset form and close modal
      setWorkTypeFormData({
        name: '',
        base_price: '',
        description: '',
        category: '',
        estimated_duration: 30
      });
      setEditingWorkType(null);
      setIsWorkTypeModalOpen(false);
      
      // Reload data
      await loadWorkTypes();
    } catch (error) {
      console.error('Error saving work type:', error);
      const msg = (error && error.message) || '';
      if (msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('duplicate')) {
        alert('Bu isimde bir işlem türü zaten mevcut. Lütfen farklı bir ad deneyin.');
      } else {
        alert('İşlem türü kaydedilirken hata oluştu: ' + msg);
      }
    }
  };

  const handleWorkTypeModalClose = () => {
    setWorkTypeFormData({
      name: '',
      base_price: '',
      description: '',
      category: '',
      estimated_duration: 30
    });
    setEditingWorkType(null);
    setIsWorkTypeModalOpen(false);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load parts from API
      const partsResponse = await apiService.getParts(1, 200);
      const partsRaw = partsResponse?.parts || partsResponse?.results || partsResponse || [];
      const transformedParts = partsRaw.map(part => ({
        id: part.id,
        name: part.part_name,
        price: part.sale_price_tl || part.sale_price || 0,
        category: part.category_name || '-',
        partCode: part.part_code,
        description: part.description || '',
        image: part.image_path || ''
      })) || [];
      
      console.log('📋 Parts loaded:', transformedParts.length, 'items');
      
      setAvailableParts(transformedParts);

      // Load Vespa models from API
      const modelsResponse = await apiService.getVespaModels();
      console.log('📋 Vespa models response:', modelsResponse);
      
      const modelsArray = Array.isArray(modelsResponse)
        ? modelsResponse
        : (modelsResponse?.vespa_models || modelsResponse?.models || []);
      
      console.log('📋 Models array:', modelsArray);
      
      // Keep the full model objects with id and name
      const transformedModels = modelsArray.map(model => ({
        id: model.id,
        model_name: model.model_name || model.name
      }));
      
      console.log('📋 Transformed models:', transformedModels);
      setVespaModels(transformedModels);

      // Load work types from API
      await loadWorkTypes();

      // Load service records from API
      await loadServiceRecords();

      // Load customers from API  
      await loadCustomers();

    } catch (error) {
      console.error('Error loading data:', error);
      setError('Veriler yüklenirken hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load service records from database
  const loadServiceRecords = async () => {
    try {
      console.log('🔄 Loading service records...');
      console.log('🔗 API Base URL:', 'http://localhost:8000/api');
      setLoadingServices(true);
      
      // First, let's test the direct endpoint
      try {
        console.log('🧪 Testing direct /api/services/ endpoint...');
        const directResponse = await fetch('http://localhost:8000/api/services/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        console.log('📡 Direct fetch status:', directResponse.status);
        console.log('📡 Direct fetch ok:', directResponse.ok);
        
        if (directResponse.ok) {
          const directData = await directResponse.json();
          console.log('📡 Direct fetch response:', directData);
        } else {
          console.log('❌ Direct fetch failed with status:', await directResponse.text());
        }
      } catch (directError) {
        console.error('❌ Direct fetch error:', directError);
      }
      
      // Now try the API service
      const response = await apiService.getServices(1, 100); // Get first 100 records
      console.log('📡 Service records API Response:', response);
      console.log('📡 Response keys:', Object.keys(response));
      console.log('📡 Response type:', typeof response);
      
      // Try different possible response structures
      const servicesData = response?.services || response?.results || response?.data || response || [];
      console.log('📋 Service records data:', servicesData.length, 'items');
      console.log('📋 First service sample:', servicesData[0]);
      
      // Check if we actually have data
      if (!Array.isArray(servicesData) || servicesData.length === 0) {
        console.log('⚠️ No service records found in response');
        setServiceRecords([]);
        return;
      }
      
      // Transform data for frontend compatibility - backend already provides all joined data
      const transformedServices = servicesData.map(service => ({
        id: service.id,
        serviceNumber: service.service_number || '',
        customerId: service.customer_vespa_id || service.customer_id || '',
        customerName: service.customer_name || 'Müşteri Bilgisi Yok',
        vespaModel: service.model_name || 'Model Bilgisi Yok',
        plateNumber: service.license_plate || 'Plaka Bilgisi Yok',
        serviceDate: service.service_date,
        serviceType: service.service_type,
        status: (service.status || '').toLowerCase(),
        technicianName: service.technician_name || 'Mehmet Öztürk',
        totalCost: service.total_cost || 0,
        laborCost: service.labor_cost || 0,
        partsCost: service.parts_cost || 0,
        description: service.description || '',
        customerComplaints: service.customer_complaints || '',
        workDone: service.work_done || '',
        customerPhone: service.customer_phone || '',
        startDate: service.start_date || null,
        completionDate: service.completion_date || null,
        usedParts: service.used_parts || [],
        nextServiceDate: service.next_service_date || null,
        mileage: service.mileage_at_service || 0
      }));
      
      console.log('✅ Transformed service records:', transformedServices);
      setServiceRecords(transformedServices);
    } catch (error) {
      console.error('❌ Error loading service records:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Full error:', error);
      
      // Try alternative API endpoints if main one fails
      const alternativeEndpoints = [
        'http://localhost:8000/api/services/',
      ];
      
      for (const endpoint of alternativeEndpoints) {
        try {
          console.log(`🔄 Trying alternative endpoint: ${endpoint}`);
          const alternativeResponse = await fetch(endpoint);
          console.log(`📡 Alternative endpoint ${endpoint} status:`, alternativeResponse.status);
          
          if (alternativeResponse.ok) {
            const alternativeData = await alternativeResponse.json();
            console.log('📡 Alternative API Response:', alternativeData);
            
            const altServicesData = alternativeData.services || alternativeData.results || alternativeData || [];
            console.log('📋 Alternative service records:', altServicesData.length, 'items');
            
            if (altServicesData.length > 0) {
              console.log('📋 Sample alternative data:', altServicesData[0]);
              
              // Transform the data
              const transformedAltServices = altServicesData.map(service => ({
                id: service.id,
                serviceNumber: service.service_number || '',
                customerId: service.customer_vespa_id || service.customer_id || '',
                customerName: service.customer_name || 'Müşteri Bilgisi Yok',
                vespaModel: service.model_name || 'Model Bilgisi Yok',
                plateNumber: service.license_plate || 'Plaka Bilgisi Yok',
                serviceDate: service.service_date,
                serviceType: service.service_type,
                status: service.status,
                technicianName: service.technician_name || 'Mehmet Öztürk',
                totalCost: service.total_cost || 0,
                laborCost: service.labor_cost || 0,
                partsCost: service.parts_cost || 0,
                description: service.description || '',
                customerComplaints: service.customer_complaints || '',
                workDone: service.work_done || '',
                customerPhone: service.customer_phone || '',
                startDate: service.start_date || null,
                completionDate: service.completion_date || null,
                mileage: service.mileage_at_service || 0
              }));
              
              setServiceRecords(transformedAltServices);
              console.log('✅ Using alternative endpoint data');
              return;
            }
          }
        } catch (altError) {
          console.error(`❌ Alternative endpoint ${endpoint} failed:`, altError);
        }
      }
      
      // If all endpoints fail, use mock data for testing
      console.log('⚠️ All API endpoints failed, using mock data for testing');
      const mockServiceData = [
        {
          id: 1,
          serviceNumber: 'SRV2024001001',
          customerId: 1,
          customerName: 'Ahmet Yılmaz',
          vespaModel: 'Primavera 150',
          plateNumber: '34ABC123',
          serviceDate: '2024-06-15',
          serviceType: 'Periyodik Bakım',
          status: 'COMPLETED',
          technicianName: 'Mehmet Öztürk',
          totalCost: 350,
          laborCost: 350,
          partsCost: 0,
          description: '8000 km periyodik bakım',
          customerComplaints: 'Motor sesinde artış',
          workDone: 'Motor yağı değişimi',
          customerPhone: '5551234567',
          mileage: 8000
        },
        {
          id: 2,
          serviceNumber: 'SRV2024071002',
          customerId: 2,
          customerName: 'Ayşe Demir',
          vespaModel: 'GTS 300',
          plateNumber: '06DEF456',
          serviceDate: '2024-07-10',
          serviceType: 'Fren Bakımı',
          status: 'COMPLETED',
          technicianName: 'Mehmet Öztürk',
          totalCost: 280,
          laborCost: 280,
          partsCost: 0,
          description: 'Fren sistemi revizyonu',
          customerComplaints: 'Fren etkisi azaldı, ses yapıyor',
          workDone: 'Ön-arka balata değişimi',
          customerPhone: '5559876543',
          mileage: 15600
        }
      ];
      
      setServiceRecords(mockServiceData);
      console.log('📋 Mock data loaded:', mockServiceData.length, 'services');
    } finally {
      setLoadingServices(false);
    }
  };

  // Müşteri verileri
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Load customers from API
  const loadCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const response = await apiService.getCustomers(1, 100); // Load first 100 customers
      
      // Transform API response and load vespa data for each customer
      const transformedCustomers = await Promise.all(
        (response.customers || []).map(async (customer) => {
          let vespaModel = 'Model Bilinmiyor';
          let plateNumber = 'Plaka Bilinmiyor';
          let currentMileage = 0;

          // Try to load customer's vespa data
          try {
            if (customer.vespa_count > 0) {
              const vespaResponse = await apiService.getCustomerVespas(customer.id);
              if (vespaResponse.vespas && vespaResponse.vespas.length > 0) {
                const firstVespa = vespaResponse.vespas[0];
                vespaModel = firstVespa.model_name || 'Model Bilinmiyor';
                plateNumber = firstVespa.license_plate || 'Plaka Bilinmiyor';
                currentMileage = firstVespa.current_mileage || 0;
              }
            }
          } catch (vespaError) {
            console.error(`Error loading vespa data for customer ${customer.id}:`, vespaError);
          }

          return {
            id: customer.id,
            name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim(),
            email: customer.email,
            phone: customer.phone,
            vespaModel,
            plateNumber,
            current_mileage: currentMileage
          };
        })
      );
      
      setCustomers(transformedCustomers);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerServiceHistory, setCustomerServiceHistory] = useState([]);
  const [workItems, setWorkItems] = useState([]);

  // İşlem türleri - Database'den çekiliyor
  const [workTypes, setWorkTypes] = useState([]);
  const [loadingWorkTypes, setLoadingWorkTypes] = useState(false);
  
  // Work Type Modal States
  const [isWorkTypeModalOpen, setIsWorkTypeModalOpen] = useState(false);
  const [editingWorkType, setEditingWorkType] = useState(null);
  const [workTypeFormData, setWorkTypeFormData] = useState({
    name: '',
    base_price: '',
    description: '',
    category: '',
    estimated_duration: 30
  });

  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    vespaModel: '',
    plateNumber: '',
    serviceDate: '',
    serviceType: '',
    status: 'pending',
    description: '',
    usedParts: [],
    laborCost: 0,
    mileage: 0,
    nextServiceDate: '',
    customerComplaints: '',
    workDone: '',
    technicianName: ''
  });

  const [selectedParts, setSelectedParts] = useState([]);

  // Walk-in customer support
  const [isWalkInCustomer, setIsWalkInCustomer] = useState(false);
  const [walkInCustomerData, setWalkInCustomerData] = useState({
    name: '',
    phone: '',
    vespaModel: '',
    plateNumber: '',
    email: ''
  });

  // Parts search
  const [partsSearchTerm, setPartsSearchTerm] = useState('');

  // When model changes, load only compatible parts from backend
  const modelName = (isWalkInCustomer ? (walkInCustomerData?.vespaModel || '') : (selectedCustomer?.vespaModel || ''));
  useEffect(() => {
    if (!modelName || !Array.isArray(vespaModels) || vespaModels.length === 0) return;
    const modelObj = vespaModels.find(m => (m.model_name || m.name) === modelName);
    if (!modelObj?.id) return;

    (async () => {
      try {
        const partsResponse = await apiService.getPartsByModel(modelObj.id);
        const partsRaw = partsResponse?.parts || partsResponse?.results || (Array.isArray(partsResponse) ? partsResponse : []) || [];
        const transformedParts = partsRaw.map(part => ({
          id: part.id,
          name: part.part_name || part.name,
          price: part.sale_price_tl || part.sale_price || 0,
          category: part.category_name || part.category || '-',
          partCode: part.part_code,
          description: part.description || '',
          image: part.image_path || ''
        }));
        setAvailableParts(transformedParts);
        setPartStockById({});
      } catch (e) {
        // keep previous parts if fetch fails
      }
    })();
  }, [modelName, vespaModels]);

  // Prefetch stock for visible parts (model + search) after dependencies are initialized
  useEffect(() => {
    const modelName = isWalkInCustomer ? (walkInCustomerData?.vespaModel || '') : (selectedCustomer?.vespaModel || '');
    if (!modelName) return;
    const visibleParts = getPartsForModel(modelName, partsSearchTerm);
    const idsToFetch = visibleParts.map(p => p.id).filter(id => !partStockById[id]);
    if (idsToFetch.length === 0) return;

    (async () => {
      for (const pid of idsToFetch) {
        try {
          const res = await apiService.getPartLocations(pid);
          // Debug once per part
          // console.log('📦 Part locations', pid, res);
          const locations = res?.locations || Array.isArray(res) ? (Array.isArray(res) ? res : res.locations) : [];
          const getType = (l) => (l.location_type || l.type || l.locationType || (l.location && l.location.type) || '').toString().toUpperCase();
          const getQty = (l) => Number(l.available_qty ?? l.available_quantity ?? l.current_stock ?? l.stock ?? l.qty ?? l.quantity ?? 0);
          const storeQty = locations.filter(l => getType(l) === 'STORE').reduce((s, l) => s + getQty(l), 0);
          const depotQty = locations.filter(l => getType(l) !== 'STORE').reduce((s, l) => s + getQty(l), 0);
          let note = '';
          if (storeQty <= 0 && depotQty > 0) note = 'Mağazada yok, depoda mevcut';
          else if (storeQty <= 0 && depotQty <= 0) note = 'Stok yok';
          else if (storeQty > 0 && depotQty > 0 && storeQty < 3) note = 'Mağaza düşük stok, depo mevcut';
          setPartStockById(prev => ({ ...prev, [pid]: { storeQty, warehouseQty: depotQty, stockNote: note } }));
        } catch (e) {
          // ignore fetch failure for stock
        }
      }
    })();
  }, [isWalkInCustomer, walkInCustomerData?.vespaModel, selectedCustomer, partsSearchTerm]);

  const [editingPrice, setEditingPrice] = useState(null);
  const [editPrice, setEditPrice] = useState('');

  // Servis türüne göre otomatik fiyat hesaplama
  const calculateServiceCost = (serviceType, parts = []) => {
    const basePrice = getWorkTypePrice(serviceType);
    const partsCost = parts.reduce((total, part) => total + (part.cost * part.quantity), 0);
    return basePrice + partsCost;
  };

  // Servis türü değiştiğinde: mevcut ekstra işçiliği koru
  const handleServiceTypeChange = (serviceType) => {
    const newServiceFee = getWorkTypePrice(serviceType);
    setFormData(prev => {
      const prevServiceFee = getWorkTypePrice(prev.serviceType);
      const previousExtraLabor = Math.max(0, (prev.laborCost || 0) - (prevServiceFee || 0));
      return {
      ...prev,
      serviceType,
        laborCost: newServiceFee + previousExtraLabor,
      };
    });
  };

  const filteredServices = serviceRecords.filter(service => {
    const matchesSearch = service.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.serviceType?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter logic: 
    // "all" -> show pending and in_progress (active services)
    // "completed" -> show only completed
    // specific status -> show that status only
    let matchesStatus;
    if (filterStatus === 'all') {
      matchesStatus = service.status === 'pending' || service.status === 'in_progress';
    } else {
      matchesStatus = service.status === filterStatus;
    }
    
    return matchesSearch && matchesStatus;
  });

  const handleAddService = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    setSelectedService(null);
    setSelectedCustomer(null);
    setCustomerServiceHistory([]);
    setWorkItems([]);
    setIsWalkInCustomer(false);
    setWalkInCustomerData({
      name: '',
      phone: '',
      vespaModel: '',
      plateNumber: '',
      email: ''
    });
    setFormData({
      customerId: '',
      customerName: '',
      vespaModel: '',
      plateNumber: '',
      serviceDate: todayStr, // otomatik bugün
      serviceType: '',
      status: 'pending',
      description: '',
      usedParts: [],
      laborCost: 0,
      mileage: 0,
      nextServiceDate: '',
      customerComplaints: '',
      workDone: '',
      technicianName: ''
    });
    setSelectedParts([]);
    setPartsSearchTerm('');
    onOpen();
  };

  const handleEditService = async (service) => {
    setSelectedService(service);
    
    try {
      // API'den detaylı servis bilgilerini çek
      console.log('🔍 Loading detailed service info for ID:', service.id);
      const detailedServiceResponse = await apiService.getService(service.id);
      const detailedService = detailedServiceResponse.service || detailedServiceResponse;
      
      console.log('📋 Detailed service data:', detailedService);
    
    // Müşteri bilgilerini ayarla
    const customer = customers.find(c => c.id === service.customerId);
    if (customer) {
      setSelectedCustomer(customer);
      const history = serviceRecords.filter(record => record.customerId === customer.id);
      setCustomerServiceHistory(history);
    }
    
      const serviceTypeValue = detailedService.service_type || service.serviceType;
      setFormData({
        customerId: service.customerId,
        customerName: service.customerName,
        vespaModel: service.vespaModel,
        plateNumber: service.plateNumber,
        serviceDate: service.serviceDate,
        serviceType: serviceTypeValue,
        status: service.status,
        description: detailedService.description || service.description,
        usedParts: detailedService.parts || service.usedParts || [],
        laborCost: detailedService.labor_cost || service.laborCost || getWorkTypePrice(serviceTypeValue),
        mileage: detailedService.mileage_at_service || service.mileage,
        nextServiceDate: detailedService.next_service_date || service.nextServiceDate,
        customerComplaints: detailedService.customer_complaints || service.customer_complaints || '',
        workDone: detailedService.work_done || service.work_done || '',
        technicianName: detailedService.technician_name || service.technician_name || ''
      });
      
      // Kullanılan parçaları yükle ve formatla (sadece geçerli olanları)
      const serviceParts = detailedService.parts || [];
      const formattedParts = serviceParts
        .filter(part => {
          // Check if part still exists in available parts
          const partExists = availableParts.find(p => p.id === (part.part_id || part.id));
          if (!partExists) {
            console.warn(`⚠️ Skipping deleted part: ID ${part.part_id || part.id} (${part.part_name})`);
            return false;
          }
          return true;
        })
        .map(part => ({
          id: part.part_id || part.id,
          name: part.part_name,
          price: part.unit_price,
          quantity: part.quantity,
          cost: part.total_price || (part.unit_price * part.quantity)
        }));
      setSelectedParts(formattedParts);
      
      // Work items - backend'den gelen work_items listesi varsa onu kullan
      if (Array.isArray(detailedService.work_items)) {
        setWorkItems(detailedService.work_items.map(wi => ({
          id: wi.work_type_id,
          name: wi.name,
          basePrice: wi.base_price,
          quantity: wi.quantity || 1
        })));
      } else {
        setWorkItems([]);
      }
      
      console.log('✅ Service edit form loaded with parts:', formattedParts);
      
    } catch (error) {
      console.error('❌ Error loading detailed service info:', error);
      // Fallback to basic service data
    setFormData({
      customerId: service.customerId,
      customerName: service.customerName,
      vespaModel: service.vespaModel,
      plateNumber: service.plateNumber,
      serviceDate: service.serviceDate,
      serviceType: service.serviceType,
      status: service.status,
      description: service.description,
        usedParts: service.usedParts || [],
      laborCost: service.laborCost,
      mileage: service.mileage,
        nextServiceDate: service.nextServiceDate,
        customerComplaints: service.customer_complaints || '',
        workDone: service.work_done || '',
        technicianName: service.technician_name || ''
      });
      
      setSelectedParts([]);
      setWorkItems([]);
    }
    
    onOpen();
  };

  const handleSaveService = async () => {
    try {
      const serviceCost = getWorkTypePrice(formData.serviceType);
      const workCost = workItems.reduce((sum, item) => sum + (item.basePrice * item.quantity), 0);
      const partsCost = selectedParts.reduce((sum, part) => sum + part.cost, 0);
      const totalCost = serviceCost + workCost + partsCost + (formData.laborCost || 0);

      let customerVespaId = null;

      if (isWalkInCustomer) {
        // Create walk-in customer and vespa record
        try {
          // Validate walk-in customer data
          if (!walkInCustomerData.name || !walkInCustomerData.phone || !walkInCustomerData.plateNumber) {
            alert('Lütfen müşteri adı, telefon ve plaka bilgilerini giriniz.');
            return;
          }

          // Find vespa model ID by name
          const vespaModelsResponse = await apiService.getVespaModels();
          const vespaModelsArray = Array.isArray(vespaModelsResponse)
            ? vespaModelsResponse
            : (vespaModelsResponse?.vespa_models || vespaModelsResponse?.models || []);
          
          const selectedModel = vespaModelsArray.find(model => 
            (model.model_name || model.name) === walkInCustomerData.vespaModel
          );
          
          if (!selectedModel) {
            alert('Lütfen geçerli bir vespa modeli seçiniz.');
            return;
          }

          // Create customer with vespa data
          const customerData = {
            first_name: walkInCustomerData.name.split(' ')[0] || walkInCustomerData.name,
            last_name: walkInCustomerData.name.split(' ').slice(1).join(' ') || '',
            phone: walkInCustomerData.phone,
            email: walkInCustomerData.email || '',
            customer_type: 'WALK_IN',
            notes: 'Düzenli olmayan müşteri - servis kaydı',
            vespa: {
              vespa_model_id: selectedModel.id,
              license_plate: walkInCustomerData.plateNumber,
              current_mileage: formData.mileage || 0
            }
          };

          console.log('🔄 Creating walk-in customer:', customerData);
          const customerResponse = await apiService.createCustomer(customerData);
          console.log('✅ Walk-in customer created:', customerResponse);

          // Get the created customer's vespa ID
          const vespaResponse = await apiService.getCustomerVespas(customerResponse.customer.id);
          if (vespaResponse.vespas && vespaResponse.vespas.length > 0) {
            customerVespaId = vespaResponse.vespas[0].id;
          } else {
            throw new Error('Müşteri vespa kaydı oluşturulamadı');
          }

        } catch (error) {
          console.error('❌ Error creating walk-in customer:', error);
          alert('Müşteri kaydı oluşturulurken hata oluştu: ' + error.message);
          return;
        }
      } else {
        // For existing customers, we need to get the customer_vespa_id
        if (formData.customerId && selectedCustomer) {
          // Try to find the customer's vespa record by matching the plate number
          try {
            const vespaResponse = await apiService.getCustomerVespas(formData.customerId);
            if (vespaResponse.vespas && vespaResponse.vespas.length > 0) {
              // Find the vespa with matching plate number, or use the first one
              const matchingVespa = vespaResponse.vespas.find(v => v.license_plate === formData.plateNumber);
              customerVespaId = matchingVespa ? matchingVespa.id : vespaResponse.vespas[0].id;
            }
          } catch (vespaError) {
            console.error('Error getting customer vespa:', vespaError);
            alert('Müşterinin vespa bilgileri alınamadı. Lütfen tekrar deneyin.');
            return;
          }
        } else {
          alert('Lütfen bir müşteri seçiniz.');
          return;
        }
      }

      const serviceData = {
        customer_vespa_id: customerVespaId,
        service_type: formData.serviceType,
        service_date: formData.serviceDate || new Date().toISOString().split('T')[0],
        mileage_at_service: formData.mileage || 0,
        description: selectedService ? 
          (formData.description || `${formData.serviceType} - MotoEtiler servis hizmeti`) :
          `${formData.serviceType} - MotoEtiler servis hizmeti`,
        customer_complaints: formData.customerComplaints || '',
        work_done: formData.workDone || '',
        labor_cost: formData.laborCost || 0,
        technician_name: formData.technicianName || '',
        start_date: new Date().toISOString(),
        // Additional fields for frontend compatibility
        parts_cost: partsCost,
        total_cost: totalCost,
        next_service_date: formData.nextServiceDate || null,
        used_parts: selectedParts.map(part => {
          // Validate part exists in availableParts
          const partExists = availableParts.find(p => p.id === part.id);
          if (!partExists) {
            console.error(`❌ ERROR: Part ID ${part.id} not found in available parts!`);
            throw new Error(`Parça ID ${part.id} bulunamadı. Lütfen geçerli parçaları seçin.`);
          }
          
          return {
          part_id: part.id,
          quantity: part.quantity,
          cost: part.cost
          };
        }),
        work_items: workItems.map(item => ({
          work_type_id: item.id,
          quantity: item.quantity,
          cost: item.basePrice * item.quantity
        }))
      };

      if (selectedService) {
        // Update existing service
        console.log('🔄 Updating service:', selectedService.id, serviceData);
        const response = await apiService.updateService(selectedService.id, serviceData);
        console.log('✅ Service updated successfully:', response);
        alert('Servis başarıyla güncellendi!');
      } else {
        // Create new service
        console.log('🔄 Creating new service:', serviceData);
        const response = await apiService.createService(serviceData);
        console.log('✅ Service created successfully:', response);
        alert('Servis başarıyla kaydedildi!');
      }
      
      // Reload service records from database
      await loadServiceRecords();
      
      // Form sıfırlama
      setFormData({
        customerId: '',
        customerName: '',
        vespaModel: '',
        plateNumber: '',
        serviceDate: '',
        serviceType: '',
        status: 'pending',
        description: '',
        usedParts: [],
        laborCost: 0,
        mileage: 0,
        nextServiceDate: '',
        customerComplaints: '',
        workDone: '',
        technicianName: ''
      });
      setSelectedService(null);
      setSelectedCustomer(null);
      setCustomerServiceHistory([]);
      setWorkItems([]);
      setSelectedParts([]);
      
      onClose();
      
    } catch (error) {
      console.error('❌ Error saving service:', error);
      alert('Servis kaydedilirken hata oluştu: ' + error.message);
    }
  };

  // Silme onayı için state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const cancelRef = React.useRef();

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };
  const handleDeleteConfirm = async () => {
    try {
      // TODO: Implement actual API delete when available
      // await apiService.deleteService(deleteId);
      
      // For now, just remove from local state
      console.log('⚠️ Service deletion only removes from local state - API delete not implemented');
      setServiceRecords(serviceRecords.filter(service => service.id !== deleteId));
      alert('Servis geçici olarak listeden kaldırıldı. Database API silinmesi henüz desteklenmiyor.');
      
      setIsDeleteOpen(false);
      setDeleteId(null);
    } catch (error) {
      console.error('❌ Error deleting service:', error);
      alert('Servis silinirken hata oluştu: ' + error.message);
    }
  };

  // Servisi tamamla
  const handleMarkCompleted = async (service) => {
    try {
      const payload = {
        service_type: service.serviceType,
        service_date: service.serviceDate,
        mileage_at_service: service.mileage,
        technician_name: service.technicianName,
        description: service.description,
        customer_complaints: service.customerComplaints,
        work_done: service.workDone,
        labor_cost: service.laborCost,
        status: 'COMPLETED',
        completion_date: new Date().toISOString(),
        used_parts: (service.usedParts || []).map(p => ({ part_id: p.part_id || p.id, quantity: p.quantity, cost: p.cost || (p.unit_price * p.quantity) })),
        work_items: (service.workItems || []).map(w => ({ work_type_id: w.work_type_id || w.id, quantity: w.quantity, cost: (w.base_price || w.basePrice) * (w.quantity || 1) }))
      };
      await apiService.updateService(service.id, payload);
      // UI'ı güncelle
      setServiceRecords(prev => prev.map(s => s.id === service.id ? { ...s, status: 'completed', completionDate: new Date().toISOString() } : s));
    } catch (e) {
      alert('Durum güncellenemedi: ' + (e.message || e));
    }
  };
  const handleDeleteCancel = () => {
    setIsDeleteOpen(false);
    setDeleteId(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'in_progress': return 'blue';
      case 'pending': return 'yellow';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Tamamlandı';
      case 'in_progress': return 'Devam Ediyor';
      case 'pending': return 'Beklemede';
      case 'cancelled': return 'İptal Edildi';
      default: return 'Bilinmiyor';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return MdCheckCircle;
      case 'in_progress': return MdBuild;
      case 'pending': return MdPending;
      case 'cancelled': return MdCancel;
      default: return MdPending;
    }
  };

  const calculateTotalRevenue = () => {
    return serviceRecords
      .filter(service => service.status === 'completed')
      .reduce((sum, service) => sum + service.totalCost, 0);
  };

  const getPendingServices = () => {
    return serviceRecords.filter(service => service.status === 'pending').length;
  };

  const getInProgressServices = () => {
    return serviceRecords.filter(service => service.status === 'in_progress').length;
  };

  const getCompletedServices = () => {
    return serviceRecords.filter(service => service.status === 'completed').length;
  };

  const handlePartSelection = (partId, isSelected) => {
    const part = availableParts.find(p => p.id === partId);
    
    if (isSelected) {
      if (part) {
      setSelectedParts([...selectedParts, { ...part, quantity: 1, selected: true, cost: part.price }]);
      }
    } else {
      setSelectedParts(selectedParts.filter(p => p.id !== partId));
    }
  };

  // Get parts for selected model (filtering accessories and model compatibility)
  const getPartsForModel = (modelName, searchTerm = '') => {
    if (!modelName) return [];
    
    // Filter out accessories and return only parts compatible with the model
    let filteredParts = availableParts.filter(part => {
      // Exclude accessories (only include PART type)
      const isPartNotAccessory = !part.category || 
        !part.category.toLowerCase().includes('kask') &&
        !part.category.toLowerCase().includes('çanta') &&
        !part.category.toLowerCase().includes('eldiven') &&
        !part.category.toLowerCase().includes('kilit') &&
        !part.category.toLowerCase().includes('aksesuar') &&
        !part.category.toLowerCase().includes('dayama') &&
        !part.category.toLowerCase().includes('cam') &&
        part.category !== 'Kasklar' &&
        part.category !== 'Çantalar' &&
        part.category !== 'Eldiven' &&
        part.category !== 'Kilitler' &&
        part.category !== 'Sırt Dayama' &&
        part.category !== 'Cam Aksesuar' &&
        part.category !== 'Çanta Demiri';
      
      // For now, return all non-accessory parts
      // TODO: Later implement model compatibility check using part_model_compatibility table
      return isPartNotAccessory;
    });

    // Apply search filter if search term is provided
    if (searchTerm.trim()) {
      filteredParts = filteredParts.filter(part =>
        part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.partCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    console.log(`🔧 Filtered parts for ${modelName} with search "${searchTerm}":`, filteredParts.length, 'parts');
    return filteredParts;
  };

  const updatePartQuantity = (partId, quantity) => {
    setSelectedParts(selectedParts.map(part => 
      part.id === partId 
        ? { ...part, quantity: quantity, cost: part.price * quantity }
        : part
    ));
  };

  // Fiyat listesi yönetimi
  const handleEditPrice = (serviceType, currentPrice) => {
    setEditingPrice(serviceType);
    setEditPrice(currentPrice.toString());
  };

  const handleSavePrice = async () => {
    if (editingPrice && editPrice) {
      try {
        // Find the work type by name
        const workType = workTypes.find(wt => wt.name === editingPrice);
        if (workType) {
          // Update via API
          await apiService.updateWorkType(workType.id, {
            base_price: parseFloat(editPrice)
          });
          
          // Reload work types to refresh the data
          await loadWorkTypes();
          
          alert('Fiyat başarıyla güncellendi.');
        }
      } catch (error) {
        console.error('Error updating price:', error);
        alert('Fiyat güncellenirken hata oluştu.');
      } finally {
      setEditingPrice(null);
      setEditPrice('');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingPrice(null);
    setEditPrice('');
  };

  const filteredPrices = Object.entries(servicePrices).filter(([serviceType]) =>
    serviceType.toLowerCase().includes(priceSearchTerm.toLowerCase())
  );

  // Müşteri seçimi fonksiyonları
  const handleCustomerSelect = async (customerId) => {
    const customer = customers.find(c => c.id === parseInt(customerId));
    setSelectedCustomer(customer);
    
    if (customer) {
      // Otomatik 6 ay sonrası tarih hesapla
      const today = new Date();
      const sixMonthsLater = new Date(today);
      sixMonthsLater.setMonth(today.getMonth() + 6);
      const nextServiceDate = sixMonthsLater.toISOString().split('T')[0];

      // Müşteri bilgilerini forma aktar
      setFormData(prev => ({
        ...prev,
        customerId: customer.id,
        customerName: customer.name,
        vespaModel: customer.vespaModel,
        plateNumber: customer.plateNumber,
        mileage: customer.current_mileage || 0,  // Müşterinin mevcut kilometresini otomatik doldur
        nextServiceDate: nextServiceDate  // Otomatik 6 ay sonrası
      }));

      // Müşterinin servis geçmişini yükle
      try {
        // Filter existing service records for this customer
        const customerHistory = serviceRecords.filter(record => 
          record.customerId === customer.id
        ).sort((a, b) => new Date(b.serviceDate) - new Date(a.serviceDate));
        
        setCustomerServiceHistory(customerHistory);
      } catch (historyError) {
        console.error('Error loading customer service history:', historyError);
      setCustomerServiceHistory([]);
      }

      // API'den müşterinin vespa bilgilerini çek (mevcut kilometre için)
      try {
        const vespaResponse = await apiService.getCustomerVespas(customer.id);
        if (vespaResponse.vespas && vespaResponse.vespas.length > 0) {
          const firstVespa = vespaResponse.vespas[0];
          setFormData(prev => ({
            ...prev,
            mileage: firstVespa.current_mileage || 0
          }));
        }
      } catch (error) {
        console.error('Error loading customer vespa data:', error);
      }
    }
  };

  // İşlem türü seçimi
  const handleWorkItemAdd = (workType) => {
    const exists = workItems.find(item => item.name === workType.name);
    if (!exists) {
      setWorkItems([...workItems, { ...workType, quantity: 1 }]);
    }
  };

  const handleWorkItemRemove = (workName) => {
    setWorkItems(workItems.filter(item => item.name !== workName));
  };

  const handleWorkItemQuantityChange = (workName, quantity) => {
    setWorkItems(workItems.map(item => 
      item.name === workName 
        ? { ...item, quantity: quantity }
        : item
    ));
  };

  // Toplam maliyet hesaplama (çift sayımı engelle)
  // laborCost: Servis türü ücreti + varsa ek işçilik
  // workItems: Ek iş kalemleri
  // parts: Kullanılan parçalar
  const calculateTotalCost = () => {
    const workCost = workItems.reduce((sum, item) => sum + (item.basePrice * (item.quantity || 1)), 0);
    const partsCost = selectedParts.reduce((sum, part) => sum + (part.cost || 0), 0);
    const laborCost = formData.laborCost || 0;
    return laborCost + workCost + partsCost;
  };

  const handlePrintInvoice = () => {
    setPrintInvoiceService(invoiceService);
    setTimeout(() => {
      const printStyles = `
        <style>
          @media print {
            body * { visibility: hidden !important; }
            .print-fatura, .print-fatura * { visibility: visible !important; }
            .print-fatura { 
              position: absolute !important; 
              left: 0 !important; 
              top: 0 !important; 
              width: 100% !important; 
              background: white !important;
              color: black !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            .chakra-modal__overlay { display: none !important; }
            .chakra-modal__content { display: none !important; }
            table { width: 100% !important; border-collapse: collapse !important; }
            th, td { border: 1px solid #444 !important; padding: 4px !important; font-size: 12px !important; }
          }
        </style>
      `;
      const existingStyles = document.head.querySelector('#print-styles');
      if (existingStyles) existingStyles.remove();
      const styleElement = document.createElement('div');
      styleElement.id = 'print-styles';
      styleElement.innerHTML = printStyles;
      document.head.appendChild(styleElement);
      window.print();
      setTimeout(() => {
        const printStylesElement = document.head.querySelector('#print-styles');
        if (printStylesElement) printStylesElement.remove();
        setPrintInvoiceService(null);
      }, 1000);
    }, 100);
  };

  // PDF fatura oluşturma fonksiyonu
  const generateInvoicePDF = (invoice, customer) => {
    const doc = new jsPDF();
    // Firma Bilgileri
    doc.setFontSize(16);
    doc.text('MOTOETİLER VESPA SERVİS', 14, 20);
    doc.setFontSize(10);
    doc.text('Adres: Nispetiye Mah. X Cad. No:1, Beşiktaş/İstanbul', 14, 26);
    doc.text('Tel: 0212 000 00 00', 14, 31);
    doc.text('Vergi Dairesi: Beşiktaş', 14, 36);
    doc.text('Vergi No: 1234567890', 14, 41);
    // Fatura Başlığı ve Bilgileri
    doc.setFontSize(14);
    doc.text('SERVİS FATURASI', 150, 20, { align: 'right' });
    doc.setFontSize(10);
    doc.text(`Fatura No: 2024-0001`, 150, 26, { align: 'right' });
    doc.text(`Tarih: ${invoice.serviceDate || new Date().toLocaleDateString()}`, 150, 31, { align: 'right' });
    // Müşteri ve Araç Bilgileri
    doc.setFontSize(11);
    doc.text(`Müşteri: ${invoice.customerName}`, 14, 50);
    doc.text(`Telefon: ${customer?.phone || ''}`, 14, 55);
    doc.text(`Email: ${customer?.email || ''}`, 14, 60);
    doc.text(`Araç: ${invoice.vespaModel} - ${invoice.plateNumber}`, 14, 65);
    doc.text(`Kilometre: ${invoice.mileage} km`, 14, 70);
    // Tablo
    const tableBody = [
      ...(invoice.usedParts || []).map((part, idx) => [
        idx + 1,
        part.name,
        part.quantity,
        `₺${part.price}`,
        '%20',
        `₺${part.cost * part.quantity}`,
      ]),
      [
        (invoice.usedParts?.length || 0) + 1,
        'İşçilik Bedeli',
        1,
        `₺${invoice.laborCost}`,
        '%20',
        `₺${invoice.laborCost}`,
      ],
    ];
    autoTable(doc, {
      head: [['Sıra', 'Açıklama', 'Miktar', 'Birim Fiyat', 'KDV', 'Tutar']],
      body: tableBody,
      startY: 80,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 },
    });
    // Toplamlar
    let finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`Mal Hizmet Toplamı: ₺${invoice.totalCost}`, 150, finalY, { align: 'right' });
    doc.text(`KDV (%20): ₺${invoice.totalCost * 0.20}`, 150, finalY + 7, { align: 'right' });
    doc.setFontSize(14);
    doc.text(`Genel Toplam: ₺${invoice.totalCost * 1.20}`, 150, finalY + 15, { align: 'right' });
    // İmza Alanları
    doc.setFontSize(10);
    doc.text('Düzenleyen (Servis Yetkilisi):', 14, finalY + 30);
    doc.text('_________________________', 14, finalY + 35);
    doc.text('Müşteri (Araç Sahibi):', 120, finalY + 30);
    doc.text('_________________________', 120, finalY + 35);
    // Dipnot
    doc.setFontSize(9);
    doc.text('Teşekkür ederiz. Faturanızı e-arşivden sorgulayabilirsiniz.', 14, finalY + 50);
    doc.text('Banka: VAKIFBANK IBAN: TR00 0000 0000 0000 0000 0000 00', 14, finalY + 55);
    doc.save('fatura.pdf');
  };

  const invoiceStyles = StyleSheet.create({
    page: { padding: 32, fontSize: 11, fontFamily: 'Helvetica' },
    header: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
    section: { marginBottom: 12 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
    label: { fontWeight: 'bold' },
    table: { display: 'table', width: 'auto', marginVertical: 8 },
    tableRow: { flexDirection: 'row' },
    tableColHeader: { width: '16%', border: '1px solid #222', backgroundColor: '#eee', padding: 4, fontWeight: 'bold', textAlign: 'center' },
    tableCol: { width: '16%', border: '1px solid #222', padding: 4, textAlign: 'center' },
    tableColWide: { width: '36%', border: '1px solid #222', padding: 4, textAlign: 'left' },
    totalRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
    totalLabel: { fontWeight: 'bold', fontSize: 12, marginRight: 8 },
    totalValue: { fontWeight: 'bold', fontSize: 12 },
    signatureRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 32 },
    signatureBox: { width: '40%', textAlign: 'center' },
    signatureLine: { borderBottom: '1px solid #222', marginVertical: 16, height: 1 },
    note: { fontSize: 9, marginTop: 16, color: '#444' },
  });

  const InvoicePDF = ({ invoice, customer }) => (
    <Document>
      <Page size="A4" style={invoiceStyles.page}>
        <Text style={invoiceStyles.header}>MOTOETİLER VESPA SERVİS FATURASI</Text>
        <View style={invoiceStyles.section}>
          <Text>Adres: Nispetiye Mah. X Cad. No:1, Beşiktaş/İstanbul</Text>
          <Text>Tel: 0212 000 00 00</Text>
          <Text>Vergi Dairesi: Beşiktaş</Text>
          <Text>Vergi No: 1234567890</Text>
        </View>
        <View style={invoiceStyles.section}>
          <View style={invoiceStyles.row}>
            <Text style={invoiceStyles.label}>Fatura No:</Text>
            <Text>2024-0001</Text>
          </View>
          <View style={invoiceStyles.row}>
            <Text style={invoiceStyles.label}>Tarih:</Text>
            <Text>{invoice?.serviceDate || new Date().toLocaleDateString()}</Text>
          </View>
        </View>
        <View style={invoiceStyles.section}>
          <Text style={invoiceStyles.label}>Müşteri Bilgileri</Text>
          <Text>Ad: {invoice?.customerName}</Text>
          <Text>Telefon: {customer?.phone || ''}</Text>
          <Text>Email: {customer?.email || ''}</Text>
        </View>
        <View style={invoiceStyles.section}>
          <Text style={invoiceStyles.label}>Araç Bilgileri</Text>
          <Text>Model: {invoice?.vespaModel}</Text>
          <Text>Plaka: {invoice?.plateNumber}</Text>
          <Text>Kilometre: {invoice?.mileage} km</Text>
        </View>
        <View style={invoiceStyles.table}>
          <View style={invoiceStyles.tableRow}>
            <Text style={invoiceStyles.tableColHeader}>Sıra</Text>
            <Text style={invoiceStyles.tableColWide}>Açıklama</Text>
            <Text style={invoiceStyles.tableColHeader}>Miktar</Text>
            <Text style={invoiceStyles.tableColHeader}>Birim Fiyat</Text>
            <Text style={invoiceStyles.tableColHeader}>KDV</Text>
            <Text style={invoiceStyles.tableColHeader}>Tutar</Text>
          </View>
          {(invoice?.usedParts || []).map((part, idx) => (
            <View style={invoiceStyles.tableRow} key={idx}>
              <Text style={invoiceStyles.tableCol}>{idx + 1}</Text>
              <Text style={invoiceStyles.tableColWide}>{part.name}</Text>
              <Text style={invoiceStyles.tableCol}>{part.quantity}</Text>
              <Text style={invoiceStyles.tableCol}>₺{part.price}</Text>
              <Text style={invoiceStyles.tableCol}>%20</Text>
              <Text style={invoiceStyles.tableCol}>₺{part.cost * part.quantity}</Text>
            </View>
          ))}
          <View style={invoiceStyles.tableRow}>
            <Text style={invoiceStyles.tableCol}>{(invoice?.usedParts?.length || 0) + 1}</Text>
            <Text style={invoiceStyles.tableColWide}>İşçilik Bedeli</Text>
            <Text style={invoiceStyles.tableCol}>1</Text>
            <Text style={invoiceStyles.tableCol}>₺{invoice?.laborCost}</Text>
            <Text style={invoiceStyles.tableCol}>%20</Text>
            <Text style={invoiceStyles.tableCol}>₺{invoice?.laborCost}</Text>
          </View>
        </View>
        <View style={invoiceStyles.totalRow}>
          <Text style={invoiceStyles.totalLabel}>Mal Hizmet Toplamı:</Text>
          <Text style={invoiceStyles.totalValue}>₺{invoice.totalCost}</Text>
        </View>
        <View style={invoiceStyles.totalRow}>
          <Text style={invoiceStyles.totalLabel}>KDV (%20):</Text>
          <Text style={invoiceStyles.totalValue}>₺{invoice.totalCost * 0.20}</Text>
        </View>
        <View style={invoiceStyles.totalRow}>
          <Text style={[invoiceStyles.totalLabel, { fontSize: 14 }]}>Genel Toplam:</Text>
          <Text style={[invoiceStyles.totalValue, { fontSize: 14 }]}>₺{invoice.totalCost * 1.20}</Text>
        </View>
        <View style={invoiceStyles.signatureRow}>
          <View style={invoiceStyles.signatureBox}>
            <Text>Düzenleyen (Servis Yetkilisi):</Text>
            <View style={invoiceStyles.signatureLine} />
            <Text>Ad Soyad / İmza</Text>
          </View>
          <View style={invoiceStyles.signatureBox}>
            <Text>Müşteri (Araç Sahibi):</Text>
            <View style={invoiceStyles.signatureLine} />
            <Text>Ad Soyad / İmza</Text>
          </View>
        </View>
        <Text style={invoiceStyles.note}>Teşekkür ederiz. Faturanızı e-arşivden sorgulayabilirsiniz.</Text>
        <Text style={invoiceStyles.note}>Banka: VAKIFBANK IBAN: TR00 0000 0000 0000 0000 0000 00</Text>
      </Page>
    </Document>
  );

  // Tablo render'ının üstüne ekle:
  const getServiceTotal = (service) =>
    (service.totalCost !== undefined
      ? service.totalCost
      : (service.serviceCost || 0) +
        (service.workCost || 0) +
        (service.partsCost || 0) +
        (service.laborCost || 0)
    );

  return (
    <CBox pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Header */}
      <CFlex justify="center" align="center" mb="20px">
        <CText fontSize="2xl" fontWeight="bold" color={brandColor}>
          MotoEtiler Servis Yönetimi
        </CText>
      </CFlex>

      {/* Loading State */}
      {(loading || loadingServices) && (
        <CFlex justify="center" align="center" mb="20px">
          <CText fontSize="lg" color={textColor}>
            🔄 Veriler yükleniyor... (Konsolu kontrol edin)
          </CText>
        </CFlex>
      )}

      {/* Error State */}
      {error && (
        <Alert status="error" mb="20px" borderRadius="12px">
          <AlertIcon />
          <CBox>
            <AlertTitle>API Bağlantı Hatası</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </CBox>
        </Alert>
      )}

      {/* Statistics Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="20px" mb="20px">
        <MiniStatistics
          startContent={
            <Icon as={MdBuild} w="56px" h="56px" bg={boxBg} borderRadius="16px" p="12px" />
          }
          name="Toplam Servis"
          value={serviceRecords.length.toString()}
        />
        <MiniStatistics
          startContent={
            <Icon as={MdPending} w="56px" h="56px" bg={boxBg} borderRadius="16px" p="12px" />
          }
          name="Bekleyen Servisler"
          value={getPendingServices().toString()}
        />
        <MiniStatistics
          startContent={
            <Icon as={MdCheckCircle} w="56px" h="56px" bg={boxBg} borderRadius="16px" p="12px" />
          }
          name="Tamamlanan"
          value={getCompletedServices().toString()}
        />
        <MiniStatistics
          startContent={
            <Icon as={MdAttachMoney} w="56px" h="56px" bg={boxBg} borderRadius="16px" p="12px" />
          }
          name="Toplam Gelir"
          value={`₺${calculateTotalRevenue().toLocaleString()}`}
        />
      </SimpleGrid>

      {/* Pending Services Alert */}
      {getPendingServices() > 0 && (
        <Alert status="info" mb="20px" borderRadius="12px">
          <AlertIcon />
          <CBox>
            <AlertTitle>Bekleyen Servisler</AlertTitle>
            <AlertDescription>
              {getPendingServices()} servis işlemi beklemede. Teknisyen ataması yapılması gerekiyor.
            </AlertDescription>
          </CBox>
        </Alert>
      )}

      {/* Main Content */}
      <Card>
        <Tabs index={activeTab} onChange={setActiveTab}>
          <CFlex justify="center" w="100%">
            <TabList>
              <Tab>Servis Kayıtları</Tab>
              <Tab>Servis Geçmişi</Tab>
              <Tab>Servis Analizi</Tab>
              <Tab>İşlem Yönetimi</Tab>
            </TabList>
          </CFlex>

          <TabPanels>
            {/* Service Records Tab */}
            <TabPanel>
              <CFlex justify="space-between" align="center" mb="20px">
                <CText fontSize="2xl" fontWeight="bold" color={brandColor}>
                  Servis Takibi
                </CText>
                <Button
                  leftIcon={<MdAdd />}
                  colorScheme="brand"
                  onClick={handleAddService}
                >
                  Yeni Servis Ekle
                </Button>
              </CFlex>

              {/* Search and Filter */}
              <Stack direction={{ base: 'column', md: 'row' }} spacing={4} mb="20px">
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={MdSearch} color="gray.300" />
                  </InputLeftElement>
                  <Input
                    placeholder="Servis ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    bg={inputBg}
                    color={inputTextColor}
                    borderColor={inputBorderColor}
                  />
                </InputGroup>
                <Select
                  placeholder="Durum filtresi"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  w={{ base: '100%', md: '200px' }}
                  bg={inputBg}
                  color={inputTextColor}
                  borderColor={inputBorderColor}
                >
                  <option value="all" style={{ backgroundColor: optionBg, color: optionTextColor }}>Tümü</option>
                  <option value="pending" style={{ backgroundColor: optionBg, color: optionTextColor }}>Beklemede</option>
                  <option value="in_progress" style={{ backgroundColor: optionBg, color: optionTextColor }}>Devam Ediyor</option>
                  <option value="completed" style={{ backgroundColor: optionBg, color: optionTextColor }}>Tamamlandı</option>
                  <option value="cancelled" style={{ backgroundColor: optionBg, color: optionTextColor }}>İptal Edildi</option>
                </Select>
              </Stack>

              {/* Services Table */}
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Müşteri</Th>
                      <Th>Araç</Th>
                      <Th>Servis Türü</Th>
                      <Th>Tarih</Th>
                      <Th>Durum</Th>
                      <Th>Tutar</Th>
                      <Th>İşlemler</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredServices.map((service) => (
                      <Tr key={service.id}>
                        <Td>
                          <CBox>
                            <CText fontWeight="bold">{service.customerName}</CText>
                            <CText fontSize="sm" color="gray.500">
                              {service.plateNumber}
                            </CText>
                          </CBox>
                        </Td>
                        <Td>
                          <CBox>
                            <CText>{service.vespaModel}</CText>
                            <CText fontSize="sm" color="gray.500">
                              {service.mileage} km
                            </CText>
                          </CBox>
                        </Td>
                        <Td>{service.serviceType}</Td>
                        <Td>{service.serviceDate}</Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(service.status)}>
                            {getStatusText(service.status)}
                          </Badge>
                        </Td>
                        <Td>₺{getServiceTotal(service).toLocaleString()}</Td>
                        <Td>
                          <Stack direction="row" spacing={1}>
                            <IconButton
                              icon={<MdEdit />}
                              size="sm"
                              colorScheme="blue"
                              onClick={() => handleEditService(service)}
                            />
                            <IconButton
                              icon={<MdDelete />}
                              size="sm"
                              colorScheme="red"
                              onClick={() => handleDeleteClick(service.id)}
                            />
                            {service.status !== 'completed' && (
                              <IconButton
                                icon={<MdCheck />}
                                size="sm"
                                colorScheme="green"
                                onClick={() => handleMarkCompleted(service)}
                                title="Tamamla"
                              />
                            )}
                            {service.status === 'completed' && (
                              <IconButton
                                icon={<MdReceipt />}
                                size="sm"
                                colorScheme="green"
                                onClick={async () => {
                                  try {
                                    const detailedResponse = await apiService.getService(service.id);
                                    const detailed = detailedResponse?.service || detailedResponse || {};
                                    const parts = (detailed.parts || []).map(part => ({
                                      id: part.part_id || part.id,
                                      name: part.part_name,
                                      quantity: part.quantity,
                                      price: part.unit_price,
                                      cost: part.total_price || (part.unit_price * part.quantity)
                                    }));
                                    const workItemsSafe = Array.isArray(detailed.work_items) ? detailed.work_items : [];
                                    const workItemsMapped = workItemsSafe.map(wi => ({
                                      id: wi.work_type_id,
                                      name: wi.name,
                                      quantity: wi.quantity || 1,
                                      basePrice: wi.unit_price || wi.base_price || 0
                                    }));
                                    const invoiceData = {
                                      ...service,
                                      customerName: service.customerName || detailed?.customer?.name,
                                      vespaModel: service.vespaModel || detailed?.vespa?.model_name,
                                      plateNumber: service.plateNumber || detailed?.vespa?.license_plate,
                                      mileage: service.mileage || detailed?.mileage_at_service,
                                      serviceDate: service.serviceDate || detailed?.service_date,
                                      serviceType: service.serviceType || detailed?.service_type,
                                      laborCost: detailed?.labor_cost ?? service.laborCost ?? 0,
                                      totalCost: detailed?.total_cost ?? service.totalCost ?? 0,
                                      usedParts: parts,
                                      workItems: workItemsMapped,
                                    };
                                    setInvoiceService(invoiceData);
                                    setIsInvoiceOpen(true);
                                  } catch (e) {
                                    setInvoiceService(service);
                                    setIsInvoiceOpen(true);
                                  }
                                }}
                                title="Fatura Görüntüle"
                              />
                            )}
                          </Stack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>

              {filteredServices.length === 0 && (
                <CBox textAlign="center" py="40px">
                  <CText fontSize="lg" color="gray.500">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Arama kriterlerinize uygun servis bulunamadı.'
                      : 'Henüz servis kaydı eklenmemiş.'
                    }
                  </CText>
                </CBox>
              )}
            </TabPanel>

            {/* Service History Tab */}
            <TabPanel>
              <CText fontSize="2xl" fontWeight="bold" color={brandColor} mb="20px">
                Servis Geçmişi
              </CText>
              
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="20px">
                {serviceRecords.slice(-6).reverse().map(service => {
                  return (
                    <Card key={service.id}>
                      <CBox p="6">
                        <Heading size="md" mb="4">{service.customerName}</Heading>
                        <Stack spacing={2}>
                          <HStack justify="space-between">
                            <CText>Servis Türü:</CText>
                            <CText fontWeight="bold">{service.serviceType}</CText>
                          </HStack>
                          <HStack justify="space-between">
                            <CText>Durum:</CText>
                            <Badge colorScheme={getStatusColor(service.status)}>
                              {getStatusText(service.status)}
                            </Badge>
                          </HStack>
                          <HStack justify="space-between">
                            <CText>Tutar:</CText>
                            <CText fontWeight="bold" color={brandColor}>₺{service.totalCost.toLocaleString()}</CText>
                          </HStack>
                          <HStack justify="space-between">
                            <CText>Tarih:</CText>
                            <CText fontSize="sm">{service.serviceDate}</CText>
                          </HStack>
                        </Stack>
                      </CBox>
                    </Card>
                  );
                })}
              </SimpleGrid>
            </TabPanel>

            {/* Service Analysis Tab */}
            <TabPanel>
              <CText fontSize="2xl" fontWeight="bold" color={brandColor} mb="20px">
                Servis Analizi
              </CText>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} gap="20px">
                <Card>
                  <CBox mb="4">
                    <CText fontSize="lg" fontWeight="bold" color={textColor}>Servis Türü Dağılımı</CText>
                    <CText fontSize="sm" color={secondaryTextColor}>Gelir bazında servis türü analizi</CText>
                  </CBox>
                  {workTypes.map(workType => {
                    const typeServices = serviceRecords.filter(service => service.serviceType === workType.name);
                    const typeRevenue = typeServices.reduce((sum, service) => sum + service.totalCost, 0);
                    const totalRevenue = calculateTotalRevenue();
                    const percentage = totalRevenue > 0 ? (typeRevenue / totalRevenue) * 100 : 0;
                    
                    // Sadece gerçek data olan servis türlerini göster
                    if (typeRevenue === 0) return null;
                    
                    return (
                      <CBox key={workType.name} mb="10px">
                        <CFlex justify="space-between" mb="2" align="center">
                          <CText fontSize="sm" color={textColor} fontWeight="medium">{workType.name}</CText>
                          <CText fontSize="sm" color={textColor} fontWeight="bold">₺{typeRevenue.toLocaleString()}</CText>
                        </CFlex>
                        <CFlex align="center" gap="3">
                          <Progress
                            value={percentage}
                            colorScheme="brand"
                            size="sm"
                            borderRadius="md" 
                            flex="1"
                            maxW="200px"
                            bg={progressBarBg}
                          />
                          <CText fontSize="xs" color={secondaryTextColor} minW="35px" textAlign="right">
                            {percentage.toFixed(1)}%
                          </CText>
                        </CFlex>
                      </CBox>
                    );
                  })}
                </Card>

                <Card>
                  <CBox mb="4">
                    <CText fontSize="lg" fontWeight="bold" color={textColor}>Servis Durumu Özeti</CText>
                    <CText fontSize="sm" color={secondaryTextColor}>Anlık servis istatistikleri</CText>
                  </CBox>
                  <Stack spacing={4}>
                    <CBox p="3" bg={yellowCardBg} borderRadius="md" border="1px solid" borderColor={yellowCardBorder}>
                      <CFlex justify="space-between" align="center">
                        <CText color={textColor} fontSize="sm">Bekleyen Servisler</CText>
                        <CText fontWeight="bold" color="yellow.500" fontSize="lg">
                          {getPendingServices()}
                        </CText>
                      </CFlex>
                    </CBox>
                    <CBox p="3" bg={blueCardBg} borderRadius="md" border="1px solid" borderColor={blueCardBorder}>
                      <CFlex justify="space-between" align="center">
                        <CText color={textColor} fontSize="sm">Devam Eden Servisler</CText>
                        <CText fontWeight="bold" color="blue.500" fontSize="lg">
                          {getInProgressServices()}
                        </CText>
                      </CFlex>
                    </CBox>
                    <CBox p="3" bg={greenCardBg} borderRadius="md" border="1px solid" borderColor={greenCardBorder}>
                      <CFlex justify="space-between" align="center">
                        <CText color={textColor} fontSize="sm">Tamamlanan Servisler</CText>
                        <CText fontWeight="bold" color="green.500" fontSize="lg">
                          {getCompletedServices()}
                        </CText>
                      </CFlex>
                    </CBox>
                    <Divider borderColor={borderColor} />
                    <CBox p="3" bg={brandCardBg} borderRadius="md" border="1px solid" borderColor={brandCardBorder}>
                      <CFlex justify="space-between" align="center">
                        <CText color={textColor} fontSize="sm" fontWeight="medium">💰 Toplam Gelir</CText>
                        <CText fontWeight="bold" color={brandColor} fontSize="xl">
                          ₺{calculateTotalRevenue().toLocaleString()}
                        </CText>
                      </CFlex>
                    </CBox>
                  </Stack>
                </Card>
              </SimpleGrid>
            </TabPanel>

            {/* İşlem Yönetimi Tab */}
            <TabPanel>
              <CFlex justify="space-between" align="center" mb="20px">
                <CText fontSize="2xl" fontWeight="bold" color={brandColor}>
                  İşlem Türleri Yönetimi
                </CText>
                <Button
                  leftIcon={<MdAdd />}
                  colorScheme="brand"
                  onClick={() => setIsWorkTypeModalOpen(true)}
                >
                  Yeni İşlem Türü Ekle
                </Button>
              </CFlex>

              {/* İşlem türleri tablosu */}
              <Card>
                <CBox p="6">
                  {loadingWorkTypes ? (
                    <CFlex justify="center" align="center" h="200px">
                      <CText color={textColor}>İşlem türleri yükleniyor...</CText>
                    </CFlex>
                  ) : workTypes.length === 0 ? (
                    <CFlex justify="center" align="center" h="200px" direction="column">
                      <CText color={textColor} fontSize="lg" mb={2}>Henüz işlem türü bulunmamaktadır</CText>
                      <CText color={secondaryTextColor} fontSize="sm">Yeni işlem türü eklemek için yukarıdaki butonu kullanın</CText>
                    </CFlex>
                  ) : (
                    <CFlex justify="center" w="100%">
                      <TableContainer maxW="1200px" w="100%">
                        <Table variant="simple" size="md">
                          <Thead>
                            <Tr bg={cardBg}>
                              <Th color={textColor} textAlign="center" fontSize="sm">İşlem Adı</Th>
                              <Th color={textColor} textAlign="center" fontSize="sm">Kategori</Th>
                              <Th color={textColor} textAlign="center" fontSize="sm">Temel Fiyat</Th>
                              <Th color={textColor} textAlign="center" fontSize="sm">Süre (dk)</Th>
                              <Th color={textColor} textAlign="center" fontSize="sm">Açıklama</Th>
                              <Th color={textColor} textAlign="center" fontSize="sm">İşlemler</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {workTypes.map(workType => (
                              <Tr key={workType.id} _hover={{ bg: cardBg }} transition="all 0.2s">
                                <Td color={textColor} fontWeight="medium" textAlign="center">{workType.name}</Td>
                                <Td textAlign="center">
                                  <Badge 
                                    colorScheme={
                                      workType.category === 'Bakım' ? 'green' :
                                      workType.category === 'Onarım' ? 'red' :
                                      workType.category === 'Kontrol' ? 'blue' : 'gray'
                                    }
                                    px={3}
                                    py={1}
                                    borderRadius="md"
                                  >
                                    {workType.category}
                                  </Badge>
                                </Td>
                                <Td color={textColor} textAlign="center" fontWeight="semibold">
                                  ₺{workType.basePrice?.toLocaleString()}
                                </Td>
                                <Td color={textColor} textAlign="center">{workType.estimatedDuration} dk</Td>
                                <Td color={textColor} maxW="250px" isTruncated textAlign="center">
                                  {workType.description || '-'}
                                </Td>
                                <Td textAlign="center">
                                  <HStack spacing={2} justify="center">
                                    <IconButton
                                      icon={<MdEdit />}
                                      size="sm"
                                      colorScheme="blue"
                                      variant="outline"
                                      onClick={() => handleEditWorkType(workType)}
                                      aria-label="Düzenle"
                                      _hover={{ transform: "scale(1.05)" }}
                                    />
                                    <IconButton
                                      icon={<MdDelete />}
                                      size="sm"
                                      colorScheme="red"
                                      variant="outline"
                                      onClick={() => handleDeleteWorkType(workType.id)}
                                      aria-label="Sil"
                                      _hover={{ transform: "scale(1.05)" }}
                                    />
                                  </HStack>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    </CFlex>
                  )}
                </CBox>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>

      {/* Add/Edit Service Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay bg={modalOverlayBg} />
        <ModalContent bg={modalBg} borderRadius="15px" border="1px solid" borderColor={borderColor}>
          <ModalHeader color={brandColor} borderBottom="1px solid" borderColor={borderColor}>
            <CText fontSize="xl" fontWeight="bold">
              {selectedService ? 'Servis Düzenle' : 'Yeni Servis Ekle'}
            </CText>
          </ModalHeader>
          <ModalCloseButton color={textColor} />
          <ModalBody>
            <Stack spacing={4}>
              {/* Müşteri Türü Seçimi */}
              <FormControl>
                <FormLabel color={textColor} fontSize="md" fontWeight="semibold">Müşteri Türü</FormLabel>
                <CBox p="3" bg={inputBg} borderRadius="md" border="1px solid" borderColor={inputBorderColor}>
                  <RadioGroup 
                    value={isWalkInCustomer ? "walkin" : "registered"} 
                    onChange={(value) => {
                      setIsWalkInCustomer(value === "walkin");
                      if (value === "walkin") {
                        setSelectedCustomer(null);
                        setFormData(prev => ({...prev, customerId: ''}));
                      } else {
                        setWalkInCustomerData({
                          name: '',
                          phone: '',
                          vespaModel: '',
                          plateNumber: '',
                          email: ''
                        });
                      }
                    }}
                  >
                    <HStack spacing={8} justify="center">
                      <Radio 
                        value="registered" 
                        colorScheme="brand"
                        size="lg"
                        _checked={{
                          bg: brandColor,
                          borderColor: brandColor,
                          color: "white"
                        }}
                        _focus={{
                          boxShadow: `0 0 0 3px ${brandColor}40`
                        }}
                      >
                        <CText color={textColor} fontWeight="medium" ml={2}>
                          📋 Kayıtlı Müşteri
                        </CText>
                      </Radio>
                      <Radio 
                        value="walkin" 
                        colorScheme="orange"
                        size="lg"
                        _checked={{
                          bg: "orange.500",
                          borderColor: "orange.500",
                          color: "white"
                        }}
                        _focus={{
                          boxShadow: "0 0 0 3px orange.200"
                        }}
                      >
                        <CText color={textColor} fontWeight="medium" ml={2}>
                          🚶 Düzenli Olmayan Müşteri
                        </CText>
                      </Radio>
                    </HStack>
                  </RadioGroup>
                </CBox>
              </FormControl>

              {/* Walk-in Customer Form */}
              {isWalkInCustomer && (
                <CBox p="4" bg={blueBg} borderRadius="md" border="1px solid" borderColor={borderColor}>
                  <CText fontWeight="bold" mb="4" color={brandColor} fontSize="md">
                    🆕 Yeni Müşteri Bilgileri:
                  </CText>
                  <Stack spacing={3}>
                    <HStack spacing={4}>
              <FormControl isRequired>
                        <FormLabel color={textColor} fontSize="sm" fontWeight="medium">Ad Soyad</FormLabel>
                        <Input
                          value={walkInCustomerData.name}
                          onChange={(e) => setWalkInCustomerData({...walkInCustomerData, name: e.target.value})}
                          placeholder="Müşteri adı soyadı"
                          bg={inputBg}
                          color={inputTextColor}
                          borderColor={inputBorderColor}
                          _placeholder={{ color: secondaryTextColor }}
                          _hover={{ borderColor: brandColor }}
                          _focus={{ 
                            borderColor: brandColor,
                            boxShadow: `0 0 0 1px ${brandColor}`
                          }}
                          size="sm"
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel color={textColor} fontSize="sm" fontWeight="medium">Telefon</FormLabel>
                        <Input
                          value={walkInCustomerData.phone}
                          onChange={(e) => setWalkInCustomerData({...walkInCustomerData, phone: e.target.value})}
                          placeholder="0555 123 45 67"
                          bg={inputBg}
                          color={inputTextColor}
                          borderColor={inputBorderColor}
                          _placeholder={{ color: secondaryTextColor }}
                          _hover={{ borderColor: brandColor }}
                          _focus={{ 
                            borderColor: brandColor,
                            boxShadow: `0 0 0 1px ${brandColor}`
                          }}
                          size="sm"
                        />
                      </FormControl>
                    </HStack>
                    <HStack spacing={4}>
                      <FormControl isRequired>
                        <FormLabel color={textColor} fontSize="sm" fontWeight="medium">Vespa Modeli</FormLabel>
                        <Select
                          value={walkInCustomerData.vespaModel}
                          onChange={(e) => setWalkInCustomerData({...walkInCustomerData, vespaModel: e.target.value})}
                          placeholder="Model seçin"
                          bg={inputBg}
                          color={inputTextColor}
                          borderColor={inputBorderColor}
                          _hover={{ borderColor: brandColor }}
                          _focus={{ 
                            borderColor: brandColor,
                            boxShadow: `0 0 0 1px ${brandColor}`
                          }}
                          size="sm"
                          sx={{
                            '> option': {
                              backgroundColor: inputBg,
                              color: inputTextColor,
                            },
                            '& option:hover': {
                              backgroundColor: cardBg,
                            }
                          }}
                        >
                          {vespaModels.map((model, index) => (
                            <option 
                              key={model.id || index} 
                              value={model.model_name}
                              style={{ 
                                backgroundColor: inputBg, 
                                color: inputTextColor 
                              }}
                            >
                              {model.model_name}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel color={textColor} fontSize="sm" fontWeight="medium">Plaka</FormLabel>
                        <Input
                          value={walkInCustomerData.plateNumber}
                          onChange={(e) => {
                            const upperValue = e.target.value.toUpperCase();
                            setWalkInCustomerData({...walkInCustomerData, plateNumber: upperValue});
                          }}
                          placeholder="34 ABC 123"
                          bg={inputBg}
                          color={inputTextColor}
                          borderColor={inputBorderColor}
                          _placeholder={{ color: secondaryTextColor }}
                          _hover={{ borderColor: brandColor }}
                          _focus={{ 
                            borderColor: brandColor,
                            boxShadow: `0 0 0 1px ${brandColor}`
                          }}
                          size="sm"
                          textTransform="uppercase"
                        />
                      </FormControl>
                    </HStack>
                    <FormControl>
                      <FormLabel color={textColor} fontSize="sm" fontWeight="medium">E-posta (Opsiyonel)</FormLabel>
                      <Input
                        value={walkInCustomerData.email}
                        onChange={(e) => setWalkInCustomerData({...walkInCustomerData, email: e.target.value})}
                        placeholder="ornek@email.com"
                        type="email"
                        bg={inputBg}
                        color={inputTextColor}
                        borderColor={inputBorderColor}
                        _placeholder={{ color: secondaryTextColor }}
                        _hover={{ borderColor: brandColor }}
                        _focus={{ 
                          borderColor: brandColor,
                          boxShadow: `0 0 0 1px ${brandColor}`
                        }}
                        size="sm"
                      />
                    </FormControl>
                  </Stack>
                </CBox>
              )}

              {/* Müşteri Seçimi - Sadece kayıtlı müşteriler için */}
              {!isWalkInCustomer && (
                <FormControl isRequired>
                  <FormLabel color={textColor} fontSize="md" fontWeight="semibold">Müşteri Seçimi</FormLabel>
                <Select
                  value={formData.customerId}
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                  placeholder={loadingCustomers ? "Müşteriler yükleniyor..." : "Müşteri seçin"}
                  bg={inputBg}
                  color={inputTextColor}
                  borderColor={inputBorderColor}
                    _hover={{ borderColor: brandColor }}
                    _focus={{ 
                      borderColor: brandColor,
                      boxShadow: `0 0 0 1px ${brandColor}`
                    }}
                    _placeholder={{ color: secondaryTextColor }}
                  disabled={loadingCustomers}
                    sx={{
                      '> option': {
                        backgroundColor: inputBg,
                        color: inputTextColor,
                      },
                      '& option:hover': {
                        backgroundColor: cardBg,
                      }
                    }}
                >
                  {customers.map(customer => (
                      <option 
                        key={customer.id} 
                        value={customer.id} 
                        style={{ 
                          backgroundColor: inputBg, 
                          color: inputTextColor 
                        }}
                      >
                      {customer.name} - {customer.vespaModel} ({customer.plateNumber})
                    </option>
                  ))}
                </Select>
                {loadingCustomers && (
                    <CText fontSize="xs" color={secondaryTextColor} mt={1}>
                    Müşteri listesi yükleniyor...
                  </CText>
                )}
              </FormControl>
              )}

              {/* Müşteri Bilgileri */}
              {selectedCustomer && !isWalkInCustomer && (
                <CBox p="4" bg={blueBg} borderRadius="md" border="1px solid" borderColor={borderColor}>
                  <CText fontWeight="bold" mb="2" color={brandColor}>Müşteri Bilgileri:</CText>
                  <Stack spacing={1}>
                    <CText color={textColor}><strong>Ad:</strong> {selectedCustomer.name}</CText>
                    <CText color={textColor}><strong>Telefon:</strong> {selectedCustomer.phone}</CText>
                    <CText color={textColor}><strong>Model:</strong> {selectedCustomer.vespaModel}</CText>
                    <CText color={textColor}><strong>Plaka:</strong> {selectedCustomer.plateNumber}</CText>
                    <CText color={textColor}><strong>Mevcut KM:</strong> {selectedCustomer.current_mileage || 0} km</CText>
                  </Stack>
                </CBox>
              )}

              {/* Müşteri Servis Geçmişi */}
              {selectedCustomer && !isWalkInCustomer && (
                <CBox p="4" bg={grayBg} borderRadius="md" border="1px solid" borderColor={borderColor}>
                  <CText fontWeight="bold" mb="2" color={brandColor}>Servis Geçmişi:</CText>
                  {customerServiceHistory.length > 0 ? (
                  <Stack spacing={2}>
                    {customerServiceHistory.slice(-3).map(service => (
                      <CBox key={service.id} p="2" bg={cardBg} borderRadius="md" border="1px solid" borderColor={borderColor}>
                        <CText fontSize="sm" color={textColor}>
                          <strong>{service.serviceDate}</strong> - {service.serviceType} <span style={{color:'#888', fontSize: '12px'}}>({service.mileage} km)</span>
                        </CText>
                        <CText fontSize="xs" color={secondaryTextColor}>{service.description}</CText>
                      </CBox>
                    ))}
                  </Stack>
                  ) : (
                    <CBox p="3" bg="gray.50" borderRadius="md" textAlign="center">
                      <CText fontSize="sm" color="gray.500" fontStyle="italic">
                        📝 Bu müşterinin daha önce servis kaydı bulunmamaktadır.
                      </CText>
                    </CBox>
                  )}
                </CBox>
              )}

              <Stack direction="row" spacing={4}>
                <FormControl isRequired>
                  <FormLabel color={textColor}>Kilometre</FormLabel>
                  <NumberInput
                    value={formData.mileage}
                    onChange={(value) => setFormData({...formData, mileage: parseInt(value) || 0})}
                    min={0}
                  >
                    <NumberInputField bg={inputBg} color={inputTextColor} borderColor={inputBorderColor} />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color={textColor}>Servis Tarihi</FormLabel>
                  <Input
                    type="date"
                    value={formData.serviceDate}
                    onChange={(e) => setFormData({...formData, serviceDate: e.target.value})}
                    bg={inputBg}
                    color={inputTextColor}
                    borderColor={inputBorderColor}
                  />
                </FormControl>
              </Stack>

              <Stack direction="row" spacing={4}>
                <FormControl isRequired>
                  <FormLabel color={textColor}>Servis Türü</FormLabel>
                  <Select
                    value={formData.serviceType || ''}
                    onChange={(e) => handleServiceTypeChange(e.target.value)}
                    placeholder="Servis türü seçin"
                    bg={inputBg}
                    color={inputTextColor}
                    borderColor={inputBorderColor}
                  >
                    {workTypes.map(workType => (
                      <option key={workType.id} value={workType.name} style={{ backgroundColor: optionBg, color: optionTextColor }}>{workType.name}</option>
                    ))}
                  </Select>
                </FormControl>


              </Stack>

              {/* Yapılacak İşlemler */}
              <FormControl mb={4}>
                <FormLabel color={textColor}>Yapılacak İşlemler</FormLabel>
                <Menu closeOnSelect={false} isLazy matchWidth>
                  <MenuButton
                    as={Button}
                    w="100%"
                    h="40px"
                    textAlign="left"
                    fontWeight="normal"
                    bg={inputBg}
                    color={inputTextColor}
                    borderColor={inputBorderColor}
                    borderWidth="1px"
                              borderRadius="md"
                    _hover={{ bg: menuButtonHoverBg, borderColor: inputBorderColor }}
                    _active={{ bg: menuButtonActiveBg, borderColor: inputBorderColor }}
                    _focus={{ boxShadow: "outline", borderColor: "brand.500" }}
                    justifyContent="space-between"
                    rightIcon={<Icon as={MdArrowDropDown} />}
                    px={3}
                  >
                    {workItems.length === 0 
                      ? "İşlem türü seçin"
                      : `${workItems.length} işlem seçildi`
                    }
                  </MenuButton>
                  <MenuList 
                    w="100%" 
                    maxW="100%"
                    minW="100%" 
                    maxH="300px" 
                    overflowY="auto"
                    bg={inputBg}
                    borderColor={inputBorderColor}
                    borderWidth="1px"
                    borderRadius="md"
                    boxShadow="lg"
                    zIndex={1500}
                    mt={1}
                    p={0}
                    css={{
                      '&::-webkit-scrollbar': {
                        width: '8px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: scrollbarTrack,
                        borderRadius: '4px',
                        margin: '4px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: scrollbarThumb,
                        borderRadius: '4px',
                        border: '2px solid transparent',
                        backgroundClip: 'content-box',
                      },
                      '&::-webkit-scrollbar-thumb:hover': {
                        background: scrollbarThumbHover,
                        backgroundClip: 'content-box',
                      },
                    }}
                  >
                    {(workTypes || []).map(item => {
                      const isSelected = workItems.some(w => w.name === item.name);
                      return (
                        <MenuItem
                          key={item.name}
                          onClick={() => {
                            if (isSelected) {
                              setWorkItems(workItems.filter(w => w.name !== item.name));
                            } else {
                              setWorkItems([...workItems, { ...item, quantity: 1 }]);
                            }
                          }}
                          bg={isSelected ? operationsSelectedBg : 'transparent'}
                          color={isSelected ? operationsSelectedColor : textColor}
                          _hover={{ 
                            bg: isSelected ? operationsSelectedHoverBg : menuButtonHoverBg 
                          }}
                          _focus={{ 
                            bg: isSelected ? operationsSelectedHoverBg : menuButtonHoverBg 
                          }}
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                          px={4}
                          py={3}
                          h="48px"
                          fontWeight={isSelected ? "bold" : "normal"}
                          borderRadius="none"
                          transition="all 0.2s"
                        >
                          <CText fontSize="sm">
                            {isSelected ? "✅ " : ""}{item.name}
                          </CText>
                          <CText fontSize="sm" color={isSelected ? operationsSelectedColor : secondaryTextColor}>
                            ₺{item.basePrice}
                          </CText>
                        </MenuItem>
                      );
                    })}
                  </MenuList>
                </Menu>
                
                {/* Seçilen İşlemler Listesi */}
                {workItems.length > 0 && (
                  <CBox mt={3} p={3} bg={operationsListBg} borderRadius="md" border="1px solid" borderColor={operationsListBorder}>
                    <CFlex justify="space-between" align="center" mb={2}>
                      <CText fontWeight="bold" fontSize="sm" color={operationsItemText}>
                        ✅ Seçilen İşlemler ({workItems.length})
                      </CText>
                      <Button
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => setWorkItems([])}
                      >
                        Tümünü Temizle
                      </Button>
                    </CFlex>
                    <Stack spacing={2}>
                      {workItems.map(item => (
                        <CFlex key={item.name} justify="space-between" align="center" p={2} bg={operationsItemBg} borderRadius="md" border="1px solid" borderColor={operationsItemBorder}>
                          <CText fontSize="sm" color={operationsItemText} fontWeight="medium">
                            {item.name}
                          </CText>
                          <CFlex align="center" gap={2}>
                            <CText fontSize="sm" color={operationsItemText} fontWeight="semibold">
                              ₺{item.basePrice}
                            </CText>
                            <Button
                              size="xs"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => setWorkItems(workItems.filter(w => w.name !== item.name))}
                            >
                              ❌
                            </Button>
                          </CFlex>
                        </CFlex>
                      ))}
                      <Divider borderColor={operationsItemBorder} />
                      <CFlex justify="space-between" align="center" fontWeight="bold" p={2} bg={operationsTotalBg} borderRadius="md">
                        <CText color={operationsTotalText}>Toplam İşlem:</CText>
                        <CText color={operationsTotalText} fontSize="lg">₺{workItems.reduce((sum, item) => sum + item.basePrice, 0)}</CText>
                      </CFlex>
                    </Stack>
                  </CBox>
                )}
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Durum</FormLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  bg={inputBg}
                  color={inputTextColor}
                  borderColor={inputBorderColor}
                >
                  <option value="pending" style={{ backgroundColor: optionBg, color: optionTextColor }}>Beklemede</option>
                  <option value="in_progress" style={{ backgroundColor: optionBg, color: optionTextColor }}>Devam Ediyor</option>
                  <option value="completed" style={{ backgroundColor: optionBg, color: optionTextColor }}>Tamamlandı</option>
                  <option value="cancelled" style={{ backgroundColor: optionBg, color: optionTextColor }}>İptal Edildi</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Açıklama</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Servis detayları"
                  rows={3}
                  bg={inputBg}
                  color={inputTextColor}
                  borderColor={inputBorderColor}
                  _placeholder={{ color: 'gray.400' }}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>İşçilik Ücreti (₺)</FormLabel>
                <NumberInput
                  value={formData.laborCost}
                  onChange={(value) => setFormData({...formData, laborCost: parseFloat(value) || 0})}
                  min={0}
                >
                  <NumberInputField bg={inputBg} color={inputTextColor} borderColor={inputBorderColor} />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              {/* Kullanılan Parçalar */}
              <FormControl mb={4}>
                <FormLabel color={textColor} fontSize="md" fontWeight="semibold">
                  🔧 Kullanılan Parçalar ({
                    isWalkInCustomer 
                      ? (walkInCustomerData.vespaModel || 'Model Seç') 
                      : (selectedCustomer ? selectedCustomer.vespaModel : 'Müşteri Seç')
                  })
                </FormLabel>
                
                {/* Available Parts Selection */}
                {((selectedCustomer && !isWalkInCustomer) || (isWalkInCustomer && walkInCustomerData.vespaModel)) && (
                  <CBox mb={4} border="1px" borderColor={borderColor} borderRadius="md">
                    <CBox p={3} bg={cardBg} borderTopRadius="md" borderBottom="1px solid" borderColor={borderColor}>
                      <CFlex justify="space-between" align="center">
                        <CText fontWeight="semibold" color={brandColor} fontSize="sm">
                          📦 Mevcut Parçalar - Seçim Yapın
                        </CText>
                        <CBox w="200px">
                          <InputGroup size="sm">
                            <InputLeftElement pointerEvents="none">
                              <Icon as={MdSearch} color="gray.400" />
                            </InputLeftElement>
                            <Input
                              placeholder="Parça ara..."
                              value={partsSearchTerm}
                              onChange={(e) => setPartsSearchTerm(e.target.value)}
                              bg={inputBg}
                              color={inputTextColor}
                              borderColor={inputBorderColor}
                              _placeholder={{ color: secondaryTextColor }}
                              _focus={{ 
                                borderColor: brandColor,
                                boxShadow: `0 0 0 1px ${brandColor}`
                              }}
                            />
                          </InputGroup>
                        </CBox>
                      </CFlex>
                    </CBox>
                    <CBox p={3} maxH="200px" overflowY="auto">
                    <VStack align="start" spacing={2}>
                        {(() => {
                          const modelName = isWalkInCustomer ? (walkInCustomerData?.vespaModel || '') : (selectedCustomer?.vespaModel || '');
                          const list = getPartsForModel(modelName, partsSearchTerm);
                          // trigger background stock fetches (fire-and-forget)
                          list.forEach(async p => {
                            if (partStockById[p.id]) return;
                            try {
                              const locs = await apiService.getPartLocations(p.id);
                              const locations = locs.locations || [];
                              const store = locations.find(l => (l.location_type || l.type) === 'STORE');
                              const others = locations.filter(l => (l.location_type || l.type) !== 'STORE');
                              const storeStock = store ? (store.available_qty ?? store.quantity ?? 0) : 0;
                              const depotStock = others.reduce((s, l) => s + (l.available_qty ?? l.quantity ?? 0), 0);
                              let note = '';
                              if (storeStock <= 0 && depotStock > 0) note = 'Mağazada yok, depoda mevcut';
                              else if (storeStock <= 0 && depotStock <= 0) note = 'Stok yok';
                              else if (storeStock > 0 && depotStock > 0 && storeStock < 3) note = 'Mağaza düşük stok, depo mevcut';
                              setPartStockById(prev => ({ ...prev, [p.id]: { storeQty: storeStock, warehouseQty: depotStock, stockNote: note } }));
                            } catch {}
                          });
                          return list.map(part => {
                            const stock = partStockById[part.id] || {};
                        const selectedPart = selectedParts.find(p => p.id === part.id);
                        const isSelected = !!selectedPart;
                        
                        return (
                            <HStack key={part.id} w="100%" justify="space-between" p={2} borderRadius="md" _hover={{bg: cardBg}} transition="all 0.2s">
                            <Checkbox
                              isChecked={isSelected}
                              onChange={(e) => handlePartSelection(part.id, e.target.checked)}
                                colorScheme="brand"
                              >
                                <HStack spacing={3}>
                                  <CBox w="40px" h="40px" bg={inputBg} borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                                    <CText fontSize="lg">🔩</CText>
                                  </CBox>
                                <VStack align="start" spacing={0}>
                                    <CText fontWeight="medium" color={textColor}>{part.name}</CText>
                                    <CText fontSize="sm" color={secondaryTextColor}>₺{part.price?.toLocaleString()}</CText>
                                    {(stock.storeQty !== undefined || stock.warehouseQty !== undefined) && (
                                      <CText fontSize="xs" color={secondaryTextColor}>
                                        Mağaza: <b>{stock.storeQty ?? '-'}</b> | Depo: <b>{stock.warehouseQty ?? '-'}</b>
                                      </CText>
                                    )}
                                    {stock.stockNote && (
                                      <Badge colorScheme={stock.stockNote.includes('yok') ? 'red' : 'orange'} fontSize="0.65rem" mt={1}>
                                        {stock.stockNote}
                                      </Badge>
                                    )}
                                </VStack>
                              </HStack>
                            </Checkbox>
                            {isSelected && (
                              <NumberInput
                                size="sm"
                                w="80px"
                                value={selectedPart.quantity}
                                onChange={(value) => updatePartQuantity(part.id, parseInt(value) || 1)}
                                min={1}
                              >
                                  <NumberInputField bg={inputBg} borderColor={inputBorderColor} />
                                <NumberInputStepper>
                                  <NumberIncrementStepper />
                                  <NumberDecrementStepper />
                                </NumberInputStepper>
                              </NumberInput>
                            )}
                          </HStack>
                        );
                          });
                        })()}
                    </VStack>
                    </CBox>
                  </CBox>
                )}

                {/* Selected Parts Display */}
                {selectedParts.length > 0 && (
                  <CBox border="1px" borderColor={borderColor} borderRadius="md" bg={cardBg}>
                    <CBox p={3} bg={blueBg} borderTopRadius="md" borderBottom="1px solid" borderColor={borderColor}>
                      <CText fontWeight="semibold" color={brandColor} fontSize="sm">
                        ✅ Seçilen Parçalar ({selectedParts.length} adet)
                      </CText>
                </CBox>
                    <Stack spacing={2} p={3}>
                      {selectedParts.map((part, index) => (
                        <CFlex key={part.id || index} justify="space-between" align="center" p={3} bg={inputBg} borderRadius="md" border="1px solid" borderColor={inputBorderColor}>
                          <CFlex align="center" flex="1">
                            <CBox w="40px" h="40px" bg={brandColor} borderRadius="md" display="flex" alignItems="center" justifyContent="center" mr={3}>
                              <CText fontSize="lg" color="white">🔩</CText>
                            </CBox>
                            <VStack align="start" spacing={0} flex="1">
                              <CText fontWeight="semibold" color={textColor} fontSize="sm">
                                {part.name}
                              </CText>
                              <HStack spacing={4}>
                                <CText fontSize="xs" color={secondaryTextColor}>
                                  Miktar: {part.quantity}
                                </CText>
                                <CText fontSize="xs" color={secondaryTextColor}>
                                  Birim: ₺{part.price?.toLocaleString()}
                                </CText>
                              </HStack>
                            </VStack>
                          </CFlex>
                          <CFlex align="center" gap={2}>
                            <CText fontSize="sm" color={textColor} fontWeight="semibold">
                              ₺{part.cost?.toLocaleString()}
                            </CText>
                            <Button
                              size="xs"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => setSelectedParts(selectedParts.filter(p => p.id !== part.id))}
                            >
                              ❌
                            </Button>
                          </CFlex>
                        </CFlex>
                      ))}
                      <Divider borderColor={borderColor} />
                      <CFlex justify="space-between" align="center" fontWeight="bold" p={2} bg={grayBg} borderRadius="md">
                        <CText color={textColor}>Toplam Parça:</CText>
                        <CText color={brandColor} fontSize="lg">₺{selectedParts.reduce((sum, part) => sum + part.cost, 0).toLocaleString()}</CText>
                      </CFlex>
                    </Stack>
                  </CBox>
                )}

                {/* No Model Selected Message */}
                {!((selectedCustomer && !isWalkInCustomer) || (isWalkInCustomer && walkInCustomerData.vespaModel)) && (
                  <CBox p={4} bg={grayBg} borderRadius="md" border="1px solid" borderColor={borderColor} textAlign="center">
                    <CText color={secondaryTextColor} fontSize="sm">
                      {isWalkInCustomer ? "Önce vespa modeli seçiniz" : "Önce müşteri seçiniz"}
                    </CText>
                  </CBox>
                )}
              </FormControl>

              {/* Müşteri Şikayetleri */}
              <FormControl>
                <FormLabel color={textColor}>Müşteri Şikayetleri</FormLabel>
                <Textarea
                  value={formData.customerComplaints}
                  onChange={(e) => setFormData({...formData, customerComplaints: e.target.value})}
                  placeholder="Müşterinin bildirdiği sorunlar..."
                  bg={inputBg}
                  color={inputTextColor}
                  borderColor={inputBorderColor}
                  rows={3}
                />
              </FormControl>

              {/* Yapılan İşler */}
              <FormControl>
                <FormLabel color={textColor}>Yapılan İşler</FormLabel>
                <Textarea
                  value={formData.workDone}
                  onChange={(e) => setFormData({...formData, workDone: e.target.value})}
                  placeholder="Serviste yapılan işlerin detayı..."
                  bg={inputBg}
                  color={inputTextColor}
                  borderColor={inputBorderColor}
                  rows={3}
                />
              </FormControl>

              {/* Teknisyen Adı */}
              <FormControl>
                <FormLabel color={textColor}>Teknisyen Adı</FormLabel>
                <Input
                  value={formData.technicianName}
                  onChange={(e) => setFormData({...formData, technicianName: e.target.value})}
                  placeholder="Servisi yapan teknisyen adı..."
                  bg={inputBg}
                  color={inputTextColor}
                  borderColor={inputBorderColor}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Sonraki Servis Tarihi</FormLabel>
                <Input
                  type="date"
                  value={formData.nextServiceDate}
                  onChange={(e) => setFormData({...formData, nextServiceDate: e.target.value})}
                  bg={inputBg}
                  color={inputTextColor}
                  borderColor={inputBorderColor}
                  w="100%"
                  minW="200px"
                />
              </FormControl>

              {/* Maliyet Hesaplama */}
              <CBox p="4" bg={grayBg} borderRadius="md" border="1px solid" borderColor={borderColor}>
                <CText fontWeight="bold" mb="2" color={brandColor}>Maliyet Özeti:</CText>
                <Stack spacing={1}>
                  {(() => {
                    const extraLabor = Math.max(0, (formData.laborCost || 0));
                    const operationsTotal = workItems.reduce((sum, item) => sum + (item.basePrice * (item.quantity || 1)), 0);
                    const partsTotal = selectedParts.reduce((sum, part) => sum + (part.cost || 0), 0);
                    return (
                      <>
                  <HStack justify="space-between">
                    <CText color={textColor}>İşlemler:</CText>
                          <CText color={textColor}>₺{operationsTotal.toLocaleString()}</CText>
                  </HStack>
                  <HStack justify="space-between">
                    <CText color={textColor}>Parçalar:</CText>
                          <CText color={textColor}>₺{partsTotal.toLocaleString()}</CText>
                  </HStack>
                  <HStack justify="space-between">
                          <CText color={textColor}>İşçilik:</CText>
                          <CText color={textColor}>₺{extraLabor.toLocaleString()}</CText>
                  </HStack>
                      </>
                    );
                  })()}
                  <Divider borderColor={borderColor} />
                  <HStack justify="space-between">
                    <CText fontWeight="bold" fontSize="lg" color={brandColor}>Toplam:</CText>
                    <CText fontWeight="bold" fontSize="lg" color={brandColor}>₺{calculateTotalCost().toLocaleString()}</CText>
                  </HStack>
                </Stack>
              </CBox>
              {selectedParts.length > 0 && (
                <CBox mt="2">
                  <CText fontWeight="bold" mb="1">Seçilen Parçalar:</CText>
                  <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2}>
                    {selectedParts.map(part => (
                      <HStack key={part.id} spacing={2} border="1px solid" borderColor={borderColor} borderRadius="md" p="2" minH="48px" bg={cardBg}>
                        <Image
                          src={part.images?.thumbnail || part.images?.main || 'https://via.placeholder.com/24x24?text=No+Image'}
                          alt={part.name}
                          boxSize="32px"
                          objectFit="contain"
                          borderRadius="md"
                          fallbackSrc="https://via.placeholder.com/24x24?text=No+Image" />
                        <CText fontSize="sm">{part.name} x{part.quantity}</CText>
                      </HStack>
                    ))}
                  </SimpleGrid>
                </CBox>
              )}
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button 
              variant="ghost" 
              mr={3} 
              onClick={onClose}
              color={cancelButtonColor}
              _hover={{ bg: cancelButtonHoverBg }}
            >
              İptal
            </Button>
            <Button colorScheme="brand" onClick={handleSaveService}>
              {selectedService ? 'Güncelle' : 'Ekle'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>



      {/* Fatura Modal */}
      <Modal isOpen={isInvoiceOpen} onClose={() => setIsInvoiceOpen(false)} size="xl">
        <ModalOverlay bg={modalOverlayBg} />
        <ModalContent bg={invoiceModalBg} borderRadius="15px" border="1px solid" borderColor={invoiceBorderColor} className="print-area">
          <ModalHeader color={brandColor} borderBottom="1px solid" borderColor={invoiceBorderColor}>
            <CText fontSize="xl" fontWeight="bold">
              Servis Faturası
            </CText>
          </ModalHeader>
          <ModalCloseButton color={textColor} />
          <ModalBody className="print-area">
            {/* Fatura içeriği */}
            {invoiceService && (
              <>
                {/* Şirket Bilgileri */}
                <CBox mb={4} textAlign="center">
                  <Heading size="lg" color={invoiceTextColor}>MotoEtiler</Heading>
                  <CText color={invoiceSubTextColor}>Vespa Servis & Yedek Parça</CText>
                  <CText color={invoiceSubTextColor}>Etiler Mah. Nispetiye Cad. No:15 Beşiktaş/İstanbul</CText>
                  <CText color={invoiceSubTextColor}>Tel: +90 212 123 45 67 | Email: info@motoetiler.com</CText>
                </CBox>
                
                <Divider borderColor={invoiceBorderColor} mb={4} />
                
                {/* Müşteri ve Servis Bilgileri */}
                <SimpleGrid columns={2} spacing={4} mb={4}>
                  <CBox>
                    <CText fontWeight="bold" fontSize="md" mb={1} color={invoiceTextColor}>Müşteri</CText>
                    <CText color={invoiceTextColor}>Ad: <b>{invoiceService.customerName}</b></CText>
                    <CText color={invoiceTextColor}>Araç: <b>{invoiceService.vespaModel}</b></CText>
                    <CText color={invoiceTextColor}>Plaka: <b>{invoiceService.plateNumber}</b></CText>
                  </CBox>
                  <CBox>
                    <CText fontWeight="bold" fontSize="md" mb={1} color={invoiceTextColor}>Servis</CText>
                    <CText color={invoiceTextColor}>Tarih: <b>{printInvoiceService?.serviceDate || invoiceService?.serviceDate}</b></CText>
                    <CText color={invoiceTextColor}>Tür: <b>{printInvoiceService?.serviceType || invoiceService?.serviceType}</b></CText>
                  </CBox>
                </SimpleGrid>
                
                {/* İşlemler Tablosu */}
                <CText fontWeight="bold" fontSize="lg" mt={4} mb={2}>İşlemler</CText>
                <Table size="sm" variant="simple" mb={4}>
                  <Thead>
                    <Tr>
                      <Th>İŞLEM</Th>
                      <Th>ADET</Th>
                      <Th isNumeric>TUTAR</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {(printInvoiceService?.workItems || invoiceService?.workItems || []).map((item, idx) => (
                      <Tr key={idx}>
                        <Td>{item.name}</Td>
                        <Td>{item.quantity}</Td>
                        <Td isNumeric>₺{(item.basePrice * item.quantity).toLocaleString()}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
                
                {/* Parçalar Tablosu */}
                <CText fontWeight="bold" fontSize="lg" mt={4} mb={2}>Parçalar</CText>
                <Table size="sm" variant="simple" mb={4}>
                  <Thead>
                    <Tr>
                      <Th>PARÇA</Th>
                      <Th>ADET</Th>
                      <Th isNumeric>TUTAR</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {(printInvoiceService?.usedParts || invoiceService?.usedParts || []).map((part, idx) => (
                      <Tr key={idx}>
                        <Td>{part.name}</Td>
                        <Td>{part.quantity}</Td>
                        <Td isNumeric>₺{(part.cost ?? (part.price * part.quantity) ?? 0).toLocaleString()}</Td>
                      </Tr>
                    ))}
                    {/* İşçilik satırı */}
                    <Tr>
                      <Td fontWeight="medium">İşçilik</Td>
                      <Td></Td>
                      <Td fontWeight="bold" isNumeric>₺{(printInvoiceService?.laborCost || invoiceService?.laborCost || 0).toLocaleString()}</Td>
                    </Tr>
                  </Tbody>
                </Table>
                
                {/* Toplam */}
                <Divider my={2} />
                <CFlex justify="center" align="center" mt={2} mb={2}>
                  <CText fontWeight="bold" fontSize="2xl" color={invoiceTotalColor} mr={4}>Toplam</CText>
                  <CText fontWeight="extrabold" fontSize="2xl" color={invoiceTotalColor}>
                    ₺{(printInvoiceService?.totalCost || invoiceService?.totalCost || 0).toLocaleString()}
                  </CText>
                </CFlex>
                <Button onClick={handlePrintInvoice} colorScheme="blue" size="md" mt={2}>
                  Yazdır
                </Button>
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Kurumsal fatura sadece yazdırmada, tam sayfa ve profesyonel görünümde */}
      <CBox
        className="print-fatura"
        style={{ display: 'none' }}
        sx={{ '@media print': { display: 'block !important' } }}
      >
        {(printInvoiceService || invoiceService) && (
          <CBox p={0} m={0} w="100%" h="100%">
            <CFlex justify="space-between" align="flex-start" mb={2}>
              <CBox>
                {/* Logo sadece varsa göster */}
                {/* {logoUrl && <Image src={logoUrl} h="40px" mb={1} />} */}
                <CText fontWeight="bold" fontSize="lg">MOTOETİLER VESPA SERVİS</CText>
                <CText fontSize="sm">Adres: Nispetiye Mah. X Cad. No:1, Beşiktaş/İstanbul</CText>
                <CText fontSize="sm">Tel: 0212 000 00 00</CText>
                <CText fontSize="sm">Vergi Dairesi: Beşiktaş</CText>
                <CText fontSize="sm">Vergi No: 1234567890</CText>
              </CBox>
              <CBox textAlign="right">
                <CText fontWeight="bold" fontSize="xl">SERVİS FATURASI</CText>
                <CText fontSize="sm">Fatura No: 2024-0001</CText>
                <CText fontSize="sm">Tarih: {printInvoiceService?.serviceDate || invoiceService?.serviceDate || new Date().toLocaleDateString()}</CText>
                <CText fontSize="sm">Senaryo: SATIS</CText>
                <CText fontSize="sm">VKN: 1234567890</CText>
                <CText fontSize="sm">Mersis No: 1234567890123456</CText>
                <CText fontSize="sm">ETTN: 123e4567-e89b-12d3-a456-426614174000</CText>
              </CBox>
            </CFlex>
            <Divider my={2} />
            <CFlex mb={2} gap={8} align="flex-start">
              <CBox minW="180px">
                <CText fontWeight="bold" fontSize="md" mb={1}>Müşteri Bilgileri</CText>
                <CText><b>Ad:</b> {printInvoiceService?.customerName || invoiceService?.customerName}</CText>
                <CText><b>Telefon:</b> {selectedCustomer?.phone}</CText>
                <CText><b>Email:</b> {selectedCustomer?.email}</CText>
              </CBox>
              <CBox minW="180px">
                <CText fontWeight="bold" fontSize="md" mb={1}>Araç Bilgileri</CText>
                <CText><b>Model:</b> {printInvoiceService?.vespaModel || invoiceService?.vespaModel}</CText>
                <CText><b>Plaka:</b> {printInvoiceService?.plateNumber || invoiceService?.plateNumber}</CText>
                <CText><b>Kilometre:</b> {printInvoiceService?.mileage || invoiceService?.mileage} km</CText>
              </CBox>
            </CFlex>
            <Divider my={2} />
            <Table variant="simple" size="sm" borderWidth="1px" borderColor="#444" sx={{ '@media print': { border: '1px solid #444' } }}>
              <Thead>
                <Tr>
                  <Th>Sıra</Th>
                  <Th>Açıklama</Th>
                  <Th>Miktar</Th>
                  <Th>Birim Fiyat</Th>
                  <Th>KDV</Th>
                  <Th isNumeric>Tutar</Th>
                </Tr>
              </Thead>
              <Tbody>
                {(printInvoiceService?.workItems || invoiceService?.workItems || []).map((item, idx) => (
                  <Tr key={`wi-${idx}`}>
                    <Td>{idx + 1}</Td>
                    <Td>{item.name}</Td>
                    <Td>{item.quantity || 1}</Td>
                    <Td>₺{(item.basePrice || 0).toLocaleString()}</Td>
                    <Td>%20</Td>
                    <Td isNumeric>₺{((item.basePrice || 0) * (item.quantity || 1)).toLocaleString()}</Td>
                  </Tr>
                ))}
                {(printInvoiceService?.usedParts || invoiceService?.usedParts || []).map((part, idx) => (
                  <Tr key={`pt-${idx}`}>
                    <Td>{((printInvoiceService?.workItems?.length || invoiceService?.workItems?.length || 0) + idx + 1)}</Td>
                    <Td>{part.name}</Td>
                    <Td>{part.quantity}</Td>
                    <Td>₺{(part.price ?? (part.cost && part.quantity ? (part.cost / part.quantity) : 0)).toLocaleString()}</Td>
                    <Td>%20</Td>
                    <Td isNumeric>₺{(part.cost ?? (part.price * part.quantity) ?? 0).toLocaleString()}</Td>
                  </Tr>
                ))}
                <Tr>
                  <Td>{((printInvoiceService?.workItems?.length || invoiceService?.workItems?.length || 0) + (printInvoiceService?.usedParts?.length || invoiceService?.usedParts?.length || 0) + 1)}</Td>
                  <Td>İşçilik Bedeli</Td>
                  <Td>1</Td>
                  <Td>₺{(printInvoiceService?.laborCost || invoiceService?.laborCost || 0).toLocaleString()}</Td>
                  <Td>%20</Td>
                  <Td isNumeric>₺{(printInvoiceService?.laborCost || invoiceService?.laborCost || 0).toLocaleString()}</Td>
                </Tr>
              </Tbody>
            </Table>
            <CBox mt={2} mb={2} textAlign="right">
              <CText>Mal Hizmet Toplamı: <b>₺{(printInvoiceService?.totalCost || invoiceService?.totalCost || 0).toLocaleString()}</b></CText>
              <CText>KDV (%20): <b>₺{((printInvoiceService?.totalCost || invoiceService?.totalCost || 0) * 0.20).toLocaleString()}</b></CText>
              <CText fontSize="lg">Genel Toplam: <b>₺{((printInvoiceService?.totalCost || invoiceService?.totalCost || 0) * 1.20).toLocaleString()}</b></CText>
            </CBox>
            <Divider my={2} />
            <CFlex mt={6} mb={2} justify="space-between">
              <CBox textAlign="center" w="40%">
                <CText fontWeight="bold">Düzenleyen (Servis Yetkilisi)</CText>
                <CBox borderBottom="1px solid #333" w="80%" mx="auto" mt={6} mb={2} />
                <CText fontSize="sm">Ad Soyad / İmza</CText>
              </CBox>
              <CBox textAlign="center" w="40%">
                <CText fontWeight="bold">Müşteri (Araç Sahibi)</CText>
                <CBox borderBottom="1px solid #333" w="80%" mx="auto" mt={6} mb={2} />
                <CText fontSize="sm">Ad Soyad / İmza</CText>
              </CBox>
            </CFlex>
            <CBox fontSize="sm" color="gray.700" mt={4} textAlign="left">
              <CText>Teşekkür ederiz. Faturanızı e-arşivden sorgulayabilirsiniz.</CText>
              <CText>Banka: VAKIFBANK IBAN: TR00 0000 0000 0000 0000 0000 00</CText>
            </CBox>
          </CBox>
        )}
      </CBox>

      {/* Silme Onayı Dialogu */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={handleDeleteCancel}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg={modalBg} borderColor={borderColor}>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color={textColor}>
              Silme Onayı
            </AlertDialogHeader>
            <AlertDialogBody color={textColor}>
              Bu kaydı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button 
                ref={cancelRef} 
                onClick={handleDeleteCancel}
                color={cancelButtonColor}
                _hover={{ bg: cancelButtonHoverBg }}
              >
                İptal
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                Sil
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Work Type Add/Edit Modal */}
      <Modal isOpen={isWorkTypeModalOpen} onClose={handleWorkTypeModalClose} size="xl">
        <ModalOverlay bg={modalOverlayBg} />
        <ModalContent bg={modalBg} borderRadius="15px" border="1px solid" borderColor={borderColor}>
          <ModalHeader borderBottom="1px solid" borderColor={borderColor}>
            <Heading size="md" color={brandColor}>
              {editingWorkType ? 'İşlem Türünü Düzenle' : 'Yeni İşlem Türü Ekle'}
            </Heading>
          </ModalHeader>
          <ModalCloseButton color={textColor} />
          
          <ModalBody py={6}>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel color={textColor}>İşlem Adı</FormLabel>
                <Input
                  value={workTypeFormData.name}
                  onChange={(e) => setWorkTypeFormData({...workTypeFormData, name: e.target.value})}
                  placeholder="Örn: Yağ Değişimi"
                  bg={inputBg}
                  color={inputTextColor}
                  borderColor={inputBorderColor}
                />
              </FormControl>

              <HStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel color={textColor}>Kategori</FormLabel>
                  <Select
                    value={workTypeFormData.category}
                    onChange={(e) => setWorkTypeFormData({...workTypeFormData, category: e.target.value})}
                    placeholder="Kategori seçin"
                    bg={inputBg}
                    color={inputTextColor}
                    borderColor={inputBorderColor}
                  >
                    <option value="Bakım">Bakım</option>
                    <option value="Onarım">Onarım</option>
                    <option value="Kontrol">Kontrol</option>
                    <option value="Diğer">Diğer</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color={textColor}>Temel Fiyat (₺)</FormLabel>
                  <NumberInput
                    value={workTypeFormData.base_price}
                    onChange={(value) => setWorkTypeFormData({...workTypeFormData, base_price: value})}
                    min={0}
                  >
                    <NumberInputField 
                      bg={inputBg} 
                      color={inputTextColor} 
                      borderColor={inputBorderColor}
                      placeholder="0"
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel color={textColor}>Tahmini Süre (dakika)</FormLabel>
                <NumberInput
                  value={workTypeFormData.estimated_duration}
                  onChange={(value) => setWorkTypeFormData({...workTypeFormData, estimated_duration: value})}
                  min={1}
                  max={480}
                >
                  <NumberInputField 
                    bg={inputBg} 
                    color={inputTextColor} 
                    borderColor={inputBorderColor}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Açıklama</FormLabel>
                <Textarea
                  value={workTypeFormData.description}
                  onChange={(e) => setWorkTypeFormData({...workTypeFormData, description: e.target.value})}
                  placeholder="İşlem hakkında detaylı bilgi..."
                  bg={inputBg}
                  color={inputTextColor}
                  borderColor={inputBorderColor}
                  rows={3}
                />
              </FormControl>
            </Stack>
          </ModalBody>

          <ModalFooter borderTop="1px solid" borderColor={borderColor}>
            <Button variant="ghost" onClick={handleWorkTypeModalClose} mr={3} color={cancelButtonColor}>
              İptal
            </Button>
            <Button colorScheme="brand" onClick={handleSaveWorkType}>
              {editingWorkType ? 'Güncelle' : 'Ekle'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </CBox>
  );
} 