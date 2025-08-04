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
  MdReceipt
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
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedService, setSelectedService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState(0);
  const [invoiceService, setInvoiceService] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [printInvoiceService, setPrintInvoiceService] = useState(null);

  // MotoEtiler servis kayıtları
  const [serviceRecords, setServiceRecords] = useState(() => {
    const saved = localStorage.getItem('serviceRecords');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [
          {
            id: 1,
            customerId: 1,
            customerName: 'Ahmet Yılmaz',
            vespaModel: 'Vespa Primavera 150',
            plateNumber: '34 ABC 123',
            serviceDate: '2024-01-15',
            serviceType: 'Rutin Bakım',

            status: 'completed',
            totalCost: 2750,
            laborCost: 2500,
            partsCost: 250,
            description: 'MotoEtiler Rutin Bakım - Yağ değişimi, fren kontrolü, lastik kontrolü',
            usedParts: [
              { name: 'Motor Yağı 10W-40', quantity: 1, cost: 75 },
              { name: 'Yağ Filtresi', quantity: 1, cost: 45 },
              { name: 'Fren Balata Seti', quantity: 1, cost: 130 }
            ],
            nextServiceDate: '2024-04-15',
            mileage: 15000
          },
          {
            id: 2,
            customerId: 2,
            customerName: 'Elif Kaya',
            vespaModel: 'Vespa GTS 300',
            plateNumber: '06 DEF 456',
            serviceDate: '2024-02-20',
            serviceType: 'Ağır Bakım',

            status: 'in_progress',
            totalCost: 8050,
            laborCost: 7500,
            partsCost: 550,
            description: 'MotoEtiler Ağır Bakım - Kayış değişimi, yağ, yağ filtresi, hava filtresi',
            usedParts: [
              { name: 'Amortisör Takımı', quantity: 1, cost: 400 },
              { name: 'Fren Balata Seti', quantity: 1, cost: 150 }
            ],
            nextServiceDate: '2024-05-20',
            mileage: 22000
          },
          {
            id: 3,
            customerId: 3,
            customerName: 'Mehmet Özkan',
            vespaModel: 'Vespa Sprint 150',
            plateNumber: '35 GHI 789',
            serviceDate: '2024-01-10',
            serviceType: 'Kayış Değişimi',

            status: 'pending',
            totalCost: 3670,
            laborCost: 3500,
            partsCost: 170,
            description: 'MotoEtiler Kayış Değişimi - Transmisyon kayışı ve akü değişimi',
            usedParts: [
              { name: 'Akü 12V', quantity: 1, cost: 170 }
            ],
            nextServiceDate: '2024-03-10',
            mileage: 8500
          }
        ];
      }
    }
    return [
      {
        id: 1,
        customerId: 1,
        customerName: 'Ahmet Yılmaz',
        vespaModel: 'Vespa Primavera 150',
        plateNumber: '34 ABC 123',
        serviceDate: '2024-01-15',
        serviceType: 'Rutin Bakım',

        status: 'completed',
        totalCost: 2750,
        laborCost: 2500,
        partsCost: 250,
        description: 'MotoEtiler Rutin Bakım - Yağ değişimi, fren kontrolü, lastik kontrolü',
        usedParts: [
          { name: 'Motor Yağı 10W-40', quantity: 1, cost: 75 },
          { name: 'Yağ Filtresi', quantity: 1, cost: 45 },
          { name: 'Fren Balata Seti', quantity: 1, cost: 130 }
        ],
        nextServiceDate: '2024-04-15',
        mileage: 15000
      },
      {
        id: 2,
        customerId: 2,
        customerName: 'Elif Kaya',
        vespaModel: 'Vespa GTS 300',
        plateNumber: '06 DEF 456',
        serviceDate: '2024-02-20',
        serviceType: 'Ağır Bakım',

        status: 'in_progress',
        totalCost: 8050,
        laborCost: 7500,
        partsCost: 550,
        description: 'MotoEtiler Ağır Bakım - Kayış değişimi, yağ, yağ filtresi, hava filtresi',
        usedParts: [
          { name: 'Amortisör Takımı', quantity: 1, cost: 400 },
          { name: 'Fren Balata Seti', quantity: 1, cost: 150 }
        ],
        nextServiceDate: '2024-05-20',
        mileage: 22000
      },
      {
        id: 3,
        customerId: 3,
        customerName: 'Mehmet Özkan',
        vespaModel: 'Vespa Sprint 150',
        plateNumber: '35 GHI 789',
        serviceDate: '2024-01-10',
        serviceType: 'Kayış Değişimi',

        status: 'pending',
        totalCost: 3670,
        laborCost: 3500,
        partsCost: 170,
        description: 'MotoEtiler Kayış Değişimi - Transmisyon kayışı ve akü değişimi',
        usedParts: [
          { name: 'Akü 12V', quantity: 1, cost: 170 }
        ],
        nextServiceDate: '2024-03-10',
        mileage: 8500
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('serviceRecords', JSON.stringify(serviceRecords));
  }, [serviceRecords]);

  const [serviceTypes] = useState([
    'Rutin Bakım',
    'Ağır Bakım',
    'Kayış Değişimi',
    'Periyodik Bakım',
    'Onarım',
    'Acil Onarım',
    'Garantili Bakım',
    'Kaza Sonrası Tamir',
    'Modifikasyon',
    'Winterizasyon',
    'Test Sürüşü'
  ]);

  // MotoEtiler Servis Fiyat Listesi - state olarak tutulacak
  const [servicePrices, setServicePrices] = useState({
    'Rutin Bakım': 2500,
    'Ağır Bakım': 7500,
    'Kayış Değişimi': 3500,
    'Periyodik Bakım': 1500,
    'Onarım': 0, // Parçaya göre değişir
    'Acil Onarım': 500, // Ek ücret
    'Garantili Bakım': 1000,
    'Kaza Sonrası Tamir': 0, // Hasara göre değişir
    'Modifikasyon': 0, // Özel fiyat
    'Winterizasyon': 800,
    'Test Sürüşü': 200
  });

  // Technician selection removed as requested

  // Real API data management
  const [availableParts, setAvailableParts] = useState([]);
  const [vespaModels, setVespaModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load data from API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load parts from API
      const partsResponse = await apiService.getParts(1, 200);
      const transformedParts = partsResponse.results?.map(part => ({
        id: part.id,
        name: part.part_name,
        price: part.sale_price_tl || part.sale_price || 0,
        category: part.category_name || '-',
        partCode: part.part_code,
        description: part.description || '',
        image: part.image_path || ''
      })) || [];
      setAvailableParts(transformedParts);

      // Load Vespa models from API
      const modelsResponse = await apiService.getVespaModels();
      const transformedModels = modelsResponse.map(model => model.model_name);
      setVespaModels(transformedModels);

    } catch (error) {
      console.error('Error loading data:', error);
      setError('Veriler yüklenirken hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Müşteri verileri
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('customers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 1,
        name: 'Ahmet Yılmaz',
        email: 'ahmet@email.com',
        phone: '+90 532 123 45 67',
        vespaModel: 'Vespa Primavera 150 3v',
        plateNumber: '34 ABC 123'
      },
      {
        id: 2,
        name: 'Elif Kaya',
        email: 'elif@email.com',
        phone: '+90 533 987 65 43',
        vespaModel: 'Vespa GTS 300',
        plateNumber: '06 DEF 456'
      },
      {
        id: 3,
        name: 'Mehmet Özkan',
        email: 'mehmet@email.com',
        phone: '+90 534 456 78 90',
        vespaModel: 'Vespa Sprint 125',
        plateNumber: '35 GHI 789'
      },
      {
        id: 4,
        name: 'Ayşe Demir',
        email: 'ayse@email.com',
        phone: '+90 535 555 66 77',
        vespaModel: 'Vespa ET4 150',
        plateNumber: '16 XYZ 456'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers));
  }, [customers]);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerServiceHistory, setCustomerServiceHistory] = useState([]);
  const [workItems, setWorkItems] = useState([]);

  // İşlem türleri
  const [workTypes] = useState([
    { name: 'Yağ Değişimi', basePrice: 200 },
    { name: 'Fren Kontrolü', basePrice: 150 },
    { name: 'Lastik Kontrolü', basePrice: 100 },
    { name: 'Kayış Kontrolü', basePrice: 250 },
    { name: 'Amortisör Kontrolü', basePrice: 300 },
    { name: 'Fren Balata Değişimi', basePrice: 400 },
    { name: 'Akü Kontrolü', basePrice: 100 },
    { name: 'Motor Temizliği', basePrice: 150 },
    { name: 'Genel Bakım', basePrice: 500 }
  ]);

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
    nextServiceDate: ''
  });

  const [selectedParts, setSelectedParts] = useState([]);
  const [isPriceListOpen, setIsPriceListOpen] = useState(false);
  const [priceSearchTerm, setPriceSearchTerm] = useState('');
  const [editingPrice, setEditingPrice] = useState(null);
  const [editPrice, setEditPrice] = useState('');

  // Servis türüne göre otomatik fiyat hesaplama
  const calculateServiceCost = (serviceType, parts = []) => {
    const basePrice = servicePrices[serviceType] || 0;
    const partsCost = parts.reduce((total, part) => total + (part.cost * part.quantity), 0);
    return basePrice + partsCost;
  };

  // Servis türü değiştiğinde fiyatı güncelle
  const handleServiceTypeChange = (serviceType) => {
    setFormData(prev => ({
      ...prev,
      serviceType,
      laborCost: servicePrices[serviceType] || 0
    }));
  };

  const filteredServices = serviceRecords.filter(service => {
    const matchesSearch = service.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || service.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddService = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    setSelectedService(null);
    setSelectedCustomer(null);
    setCustomerServiceHistory([]);
    setWorkItems([]);
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
      nextServiceDate: ''
    });
    setSelectedParts([]);
    onOpen();
  };

  const handleEditService = (service) => {
    setSelectedService(service);
    
    // Müşteri bilgilerini ayarla
    const customer = customers.find(c => c.id === service.customerId);
    if (customer) {
      setSelectedCustomer(customer);
      const history = serviceRecords.filter(record => record.customerId === customer.id);
      setCustomerServiceHistory(history);
    }
    
    setFormData({
      customerId: service.customerId,
      customerName: service.customerName,
      vespaModel: service.vespaModel,
      plateNumber: service.plateNumber,
      serviceDate: service.serviceDate,
      serviceType: service.serviceType,
      status: service.status,
      description: service.description,
      usedParts: service.usedParts,
      laborCost: service.laborCost,
      mileage: service.mileage,
      nextServiceDate: service.nextServiceDate
    });
    
    // Parçalar ve işlemler
    setSelectedParts(service.usedParts || []);
    setWorkItems(service.workItems || []);
    
    onOpen();
  };

  const handleSaveService = () => {
    const serviceCost = servicePrices[formData.serviceType] || 0;
    const workCost = workItems.reduce((sum, item) => sum + (item.basePrice * item.quantity), 0);
    const partsCost = selectedParts.reduce((sum, part) => sum + part.cost, 0);
    const totalCost = serviceCost + workCost + partsCost + (formData.laborCost || 0);

    const updatedService = {
      ...formData,
      usedParts: selectedParts,
      workItems: workItems,
      serviceCost,
      workCost,
      partsCost,
      totalCost,
      serviceDate: formData.serviceDate || new Date().toISOString().split('T')[0],
      description: `${formData.serviceType} - ${workItems.map(item => item.name).join(', ')} - ${formData.description || 'MotoEtiler servis hizmeti'}`
    };

    if (selectedService) {
      setServiceRecords(serviceRecords.map(service =>
        service.id === selectedService.id
          ? { ...service, ...updatedService }
          : service
      ));
    } else {
      const newService = {
        ...updatedService,
        id: Date.now()
      };
      setServiceRecords([...serviceRecords, newService]);
    }
    
    // Form sıfırlama
    setSelectedService(null);
    setSelectedCustomer(null);
    setCustomerServiceHistory([]);
    setWorkItems([]);
    setSelectedParts([]);
    
    onClose();
  };

  // Silme onayı için state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const cancelRef = React.useRef();

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };
  const handleDeleteConfirm = () => {
    setServiceRecords(serviceRecords.filter(service => service.id !== deleteId));
    setIsDeleteOpen(false);
    setDeleteId(null);
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
      setSelectedParts([...selectedParts, { ...part, quantity: 1, selected: true, cost: part.price }]);
    } else {
      setSelectedParts(selectedParts.filter(p => p.id !== partId));
    }
  };

  // Get parts for selected model (simplified - returns all parts for now)
  // TODO: Implement part compatibility system with backend API
  const getPartsForModel = (modelName) => {
    if (!modelName) return availableParts;
    
    // For now, return all parts - backend part_model_compatibility table can be used later
    return availableParts;
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

  const handleSavePrice = () => {
    if (editingPrice && editPrice) {
      setServicePrices(prev => ({
        ...prev,
        [editingPrice]: parseInt(editPrice)
      }));
      setEditingPrice(null);
      setEditPrice('');
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
  const handleCustomerSelect = (customerId) => {
    const customer = customers.find(c => c.id === parseInt(customerId));
    setSelectedCustomer(customer);
    
    if (customer) {
      // Müşteri bilgilerini forma aktar
      setFormData(prev => ({
        ...prev,
        customerId: customer.id,
        customerName: customer.name,
        vespaModel: customer.vespaModel,
        plateNumber: customer.plateNumber
      }));

      // Müşterinin servis geçmişini bul
      const history = serviceRecords.filter(record => record.customerId === customer.id);
      setCustomerServiceHistory(history);
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

  // Toplam maliyet hesaplama
  const calculateTotalCost = () => {
    const serviceCost = servicePrices[formData.serviceType] || 0;
    const workCost = workItems.reduce((sum, item) => sum + (item.basePrice * item.quantity), 0);
    const partsCost = selectedParts.reduce((sum, part) => sum + part.cost, 0);
    const laborCost = formData.laborCost || 0;
    
    return serviceCost + workCost + partsCost + laborCost;
  };

  const handlePrintInvoice = () => {
    setPrintInvoiceService(invoiceService);
    setTimeout(() => {
      // Print stillerini ekle
      const printStyles = `
        <style>
          @media print {
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area { 
              position: absolute; 
              left: 0; 
              top: 0; 
              width: 100%; 
              background: white !important;
              color: black !important;
            }
            .chakra-modal__overlay { display: none !important; }
            .chakra-modal__content { 
              position: static !important; 
              margin: 0 !important; 
              box-shadow: none !important;
              background: white !important;
            }
          }
        </style>
      `;
      
      // Mevcut head'e print stillerini ekle
      const existingStyles = document.head.querySelector('#print-styles');
      if (existingStyles) existingStyles.remove();
      
      const styleElement = document.createElement('div');
      styleElement.id = 'print-styles';
      styleElement.innerHTML = printStyles;
      document.head.appendChild(styleElement);
      
      // Yazdırma işlemini başlat
      window.print();
      
      // Print işlemi bitince stilleri temizle
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
      <CFlex justify="space-between" align="center" mb="20px">
        <CText fontSize="2xl" fontWeight="bold" color={brandColor}>
          MotoEtiler Servis Yönetimi
        </CText>
        <Button
          leftIcon={<MdAttachMoney />}
          colorScheme="green"
          onClick={() => setIsPriceListOpen(true)}
        >
          Fiyat Listesi
        </Button>
      </CFlex>

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
          <TabList>
            <Tab>Servis Kayıtları</Tab>
                            <Tab>Servis Geçmişi</Tab>
            <Tab>Servis Analizi</Tab>
          </TabList>

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
                            {service.status === 'completed' && (
                              <IconButton
                                icon={<MdReceipt />}
                                size="sm"
                                colorScheme="green"
                                onClick={() => { setInvoiceService(service); setIsInvoiceOpen(true); }}
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
                  {serviceTypes.map(type => {
                    const typeServices = serviceRecords.filter(service => service.serviceType === type);
                    const typeRevenue = typeServices.reduce((sum, service) => sum + service.totalCost, 0);
                    const totalRevenue = calculateTotalRevenue();
                    const percentage = totalRevenue > 0 ? (typeRevenue / totalRevenue) * 100 : 0;
                    
                    // Sadece gerçek data olan servis türlerini göster
                    if (typeRevenue === 0) return null;
                    
                    return (
                      <CBox key={type} mb="10px">
                        <CFlex justify="space-between" mb="2" align="center">
                          <CText fontSize="sm" color={textColor} fontWeight="medium">{type}</CText>
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
              {/* Müşteri Seçimi */}
              <FormControl isRequired>
                <FormLabel color={textColor}>Müşteri Seçimi</FormLabel>
                <Select
                  value={formData.customerId}
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                  placeholder="Müşteri seçin"
                  bg={inputBg}
                  color={inputTextColor}
                  borderColor={inputBorderColor}
                >
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id} style={{ backgroundColor: optionBg, color: optionTextColor }}>
                      {customer.name} - {customer.vespaModel} ({customer.plateNumber})
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Müşteri Bilgileri */}
              {selectedCustomer && (
                <CBox p="4" bg={blueBg} borderRadius="md" border="1px solid" borderColor={borderColor}>
                  <CText fontWeight="bold" mb="2" color={brandColor}>Müşteri Bilgileri:</CText>
                  <Stack spacing={1}>
                    <CText color={textColor}><strong>Ad:</strong> {selectedCustomer.name}</CText>
                    <CText color={textColor}><strong>Telefon:</strong> {selectedCustomer.phone}</CText>
                    <CText color={textColor}><strong>Model:</strong> {selectedCustomer.vespaModel}</CText>
                    <CText color={textColor}><strong>Plaka:</strong> {selectedCustomer.plateNumber}</CText>
                  </Stack>
                </CBox>
              )}

              {/* Müşteri Servis Geçmişi */}
              {customerServiceHistory.length > 0 && (
                <CBox p="4" bg={grayBg} borderRadius="md" border="1px solid" borderColor={borderColor}>
                  <CText fontWeight="bold" mb="2" color={brandColor}>Servis Geçmişi:</CText>
                  <Stack spacing={2}>
                    {customerServiceHistory.slice(-3).map(service => (
                      <CBox key={service.id} p="2" bg={cardBg} borderRadius="md" border="1px solid" borderColor={borderColor}>
                        <CText fontSize="sm" color={textColor}>
                          <strong>{service.serviceDate}</strong> - {service.serviceType} <span style={{color:'#888', fontSize:'12px'}}>({service.mileage} km)</span>
                        </CText>
                        <CText fontSize="xs" color={secondaryTextColor}>{service.description}</CText>
                      </CBox>
                    ))}
                  </Stack>
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
                    value={formData.serviceType}
                    onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                    placeholder="Servis türü seçin"
                    bg={inputBg}
                    color={inputTextColor}
                    borderColor={inputBorderColor}
                  >
                    {serviceTypes.map(type => (
                      <option key={type} value={type} style={{ backgroundColor: optionBg, color: optionTextColor }}>{type}</option>
                    ))}
                  </Select>
                </FormControl>


              </Stack>

              {/* Yapılacak İşlemler */}
              <FormControl mb={4}>
                <FormLabel color={textColor}>Yapılacak İşlemler</FormLabel>
                <Menu closeOnSelect={false} isLazy>
                  <MenuButton
                    as={Button}
                    w="100%"
                    minW={0}
                    fontWeight="bold"
                    borderRadius="md"
                    bg={invoiceModalBg}
                    color={invoiceTextColor}
                    borderWidth="1px"
                    borderColor={invoiceBorderColor}
                    _hover={{ bg: menuButtonHoverBg }}
                    _active={{ bg: menuButtonActiveBg }}
                    _focus={{ boxShadow: "outline" }}
                    textAlign="left"
                    px={4}
                    py={2}
                    overflow="hidden"
                    whiteSpace="nowrap"
                  >
                    {workItems.length === 0
                      ? "İşlem seçin"
                      : (
                        <CFlex wrap="wrap" gap="2px">
                          {workItems.map(item => (
                            <CBox
                              key={item.name}
                              bg="brand.100"
                              color="brand.700"
                              px={2}
                              py={0.5}
                              borderRadius="md"
                              fontSize="xs"
                              mr={1}
                              mb={1}
                              maxW="90px"
                              overflow="hidden"
                              textOverflow="ellipsis"
                              whiteSpace="nowrap"
                            >
                              {item.name}
                            </CBox>
                          ))}
                        </CFlex>
                      )
                    }
                  </MenuButton>
                  <MenuList w="100%" minW="unset" maxH="250px" overflowY="auto" p={0}>
                    <CBox display="flex" flexDirection="column">
                      {(workTypes || []).map(item => (
                        <MenuItem
                          key={item.name}
                          onClick={() => {
                            const exists = workItems.find(w => w.name === item.name);
                            if (exists) {
                              setWorkItems(workItems.filter(w => w.name !== item.name));
                            } else {
                              setWorkItems([...workItems, { ...item, quantity: 1 }]);
                            }
                          }}
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                          px={4}
                          py={2}
                          _hover={{ bg: "gray.100" }}
                          _focus={{ bg: "gray.200" }}
                        >
                          <ChakraCheckbox
                            isChecked={!!workItems.find(w => w.name === item.name)}
                            pointerEvents="none"
                            mr={2}
                          />
                          <CText flex="1">{item.name} – ₺{item.basePrice}</CText>
                        </MenuItem>
                      ))}
                    </CBox>
                  </MenuList>
                </Menu>
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

              <FormControl>
                <FormLabel color={textColor}>Kullanılan Parçalar ({selectedCustomer ? selectedCustomer.vespaModel : 'Müşteri Seç'})</FormLabel>
                <CBox border="1px" borderColor={borderColor} p="4" borderRadius="md" maxH="300px" overflowY="auto">
                  {selectedCustomer ? (
                    <VStack align="start" spacing={2}>
                      {getPartsForModel(selectedCustomer.vespaModel).map(part => {
                        const selectedPart = selectedParts.find(p => p.id === part.id);
                        const isSelected = !!selectedPart;
                        
                        return (
                          <HStack key={part.id} w="100%" justify="space-between">
                            <Checkbox
                              isChecked={isSelected}
                              onChange={(e) => handlePartSelection(part.id, e.target.checked)}
                            >
                              <HStack>
                                <Image
                                  src={part.images?.thumbnail || part.images?.main || 'https://via.placeholder.com/32x32?text=No+Image'}
                                  alt={part.name}
                                  boxSize="32px"
                                  objectFit="contain"
                                  borderRadius="md"
                                  mr="2"
                                  fallbackSrc="https://via.placeholder.com/32x32?text=No+Image" />
                                <VStack align="start" spacing={0}>
                                  <CText fontWeight="medium">{part.name}</CText>
                                  <CText fontSize="sm" color="gray.600">₺{part.price?.toLocaleString()}</CText>
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
                                <NumberInputField />
                                <NumberInputStepper>
                                  <NumberIncrementStepper />
                                  <NumberDecrementStepper />
                                </NumberInputStepper>
                              </NumberInput>
                            )}
                          </HStack>
                        );
                      })}
                    </VStack>
                  ) : (
                    <CText color="gray.500">Önce müşteri seçiniz</CText>
                  )}
                </CBox>
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
                />
              </FormControl>

              {/* Maliyet Hesaplama */}
              <CBox p="4" bg={grayBg} borderRadius="md" border="1px solid" borderColor={borderColor}>
                <CText fontWeight="bold" mb="2" color={brandColor}>Maliyet Özeti:</CText>
                <Stack spacing={1}>
                  <HStack justify="space-between">
                    <CText color={textColor}>Servis Ücreti:</CText>
                    <CText color={textColor}>₺{(servicePrices[formData.serviceType] || 0).toLocaleString()}</CText>
                  </HStack>
                  <HStack justify="space-between">
                    <CText color={textColor}>İşlemler:</CText>
                    <CText color={textColor}>₺{workItems.reduce((sum, item) => sum + (item.basePrice * item.quantity), 0).toLocaleString()}</CText>
                  </HStack>
                  <HStack justify="space-between">
                    <CText color={textColor}>Parçalar:</CText>
                    <CText color={textColor}>₺{selectedParts.reduce((sum, part) => sum + part.cost, 0).toLocaleString()}</CText>
                  </HStack>
                  <HStack justify="space-between">
                    <CText color={textColor}>Ek İşçilik:</CText>
                    <CText color={textColor}>₺{(formData.laborCost || 0).toLocaleString()}</CText>
                  </HStack>
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

      {/* Fiyat Listesi Modal */}
      <Modal isOpen={isPriceListOpen} onClose={() => setIsPriceListOpen(false)} size="lg">
        <ModalOverlay bg={modalOverlayBg} />
        <ModalContent bg={modalBg} borderRadius="15px" border="1px solid" borderColor={borderColor}>
          <ModalHeader borderBottom="1px solid" borderColor={borderColor}>
            <Heading size="md" color={brandColor}>MotoEtiler Servis Fiyat Listesi</Heading>
          </ModalHeader>
          <ModalCloseButton color={textColor} />
          <ModalBody>
            <Stack spacing={4}>
              {/* Arama Kutusu */}
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <MdSearch color={secondaryTextColor} />
                </InputLeftElement>
                <Input
                  placeholder="Servis türü ara..."
                  value={priceSearchTerm}
                  onChange={(e) => setPriceSearchTerm(e.target.value)}
                  bg={inputBg}
                  color={inputTextColor}
                  borderColor={inputBorderColor}
                  _placeholder={{ color: secondaryTextColor }}
                />
              </InputGroup>

              {/* Fiyat Listesi */}
              <CBox maxH="400px" overflowY="auto">
                <Stack spacing={3}>
                  {filteredPrices.map(([serviceType, price]) => (
                    <CBox key={serviceType} p="4" border="1px solid" borderColor={borderColor} borderRadius="md" bg={cardBg}>
                      <HStack justify="space-between" align="center">
                        <VStack align="start" spacing={1}>
                          <CText fontWeight="bold" color={textColor}>{serviceType}</CText>
                          <CText color={price > 0 ? 'green.500' : 'orange.500'} fontSize="lg" fontWeight="bold">
                            {price > 0 ? `₺${price.toLocaleString()}` : 'Özel Fiyat'}
                          </CText>
                        </VStack>
                        {editingPrice === serviceType ? (
                          <HStack>
                            <NumberInput
                              size="sm"
                              w="120px"
                              value={editPrice}
                              onChange={(value) => setEditPrice(value)}
                              min={0}
                            >
                              <NumberInputField bg={inputBg} color={inputTextColor} borderColor={inputBorderColor} />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>
                            <IconButton
                              icon={<MdCheck />}
                              size="sm"
                              colorScheme="green"
                              onClick={handleSavePrice}
                              aria-label="Kaydet"
                            />
                            <IconButton
                              icon={<MdClose />}
                              size="sm"
                              colorScheme="red"
                              onClick={handleCancelEdit}
                              aria-label="İptal"
                            />
                          </HStack>
                        ) : (
                          <IconButton
                            icon={<MdEdit />}
                            size="sm"
                            colorScheme="blue"
                            variant="outline"
                            onClick={() => handleEditPrice(serviceType, price)}
                            aria-label="Düzenle"
                          />
                        )}
                      </HStack>
                    </CBox>
                  ))}
                </Stack>
              </CBox>
            </Stack>
          </ModalBody>

          <ModalFooter borderTop="1px solid" borderColor={borderColor}>
            <Button colorScheme="brand" onClick={() => setIsPriceListOpen(false)}>
              Tamam
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
                        <Td isNumeric>₺{(part.cost * part.quantity).toLocaleString()}</Td>
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
                {(printInvoiceService?.usedParts || invoiceService?.usedParts || []).map((part, idx) => (
                  <Tr key={idx}>
                    <Td>{idx + 1}</Td>
                    <Td>{part.name}</Td>
                    <Td>{part.quantity}</Td>
                    <Td>₺{part.price?.toLocaleString()}</Td>
                    <Td>%20</Td>
                    <Td isNumeric>₺{(part.cost * part.quantity).toLocaleString()}</Td>
                  </Tr>
                ))}
                <Tr>
                  <Td>{(printInvoiceService?.usedParts?.length || invoiceService?.usedParts?.length || 0) + 1}</Td>
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
    </CBox>
  );
} 