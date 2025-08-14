import React, { useState, useEffect, useId, useMemo } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Checkbox,
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
  Progress,
  Image,
  HStack,
  VStack,
  Center,
  Spinner,
  Divider,
  Tooltip,
  Tag,
  TagLabel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useToast
} from '@chakra-ui/react';
import {
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdSearch, 
  MdWarning, 
  MdInventory,
  MdTrendingUp,
  MdTrendingDown,
  MdStore,
  MdLocalShipping,
  MdVisibility,
  MdLocationOn,
  MdShoppingCart,
  MdBarChart,
  MdFilterList,
  MdRefresh,
  MdImage,
  MdBusiness,
  MdWarehouse,
  MdClose,
  MdArrowDropDown,
  MdChevronLeft,
  MdChevronRight
} from 'react-icons/md';
import { useNavigate, useLocation } from 'react-router-dom';
import Card from 'components/card/Card';
import MiniStatistics from 'components/card/MiniStatistics';
import apiService from 'services/apiService';

export default function StockManagement() {
  const uid = useId();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  
  // Colors
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const primaryTextColor = useColorModeValue('gray.800', 'white');
  const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');
  const brandColor = useColorModeValue('brand.500', 'brand.300');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const locationCardBg = useColorModeValue('gray.50', 'gray.700');
  const modalBg = useColorModeValue('white', 'gray.800');
  const modalHeaderColor = useColorModeValue('gray.800', 'white');
  const inputBg = useColorModeValue('white', 'gray.700');
  const placeholderColor = useColorModeValue('gray.400', 'gray.500');
  const iconColor = useColorModeValue('gray.500', 'gray.400');
  const selectOptionBg = useColorModeValue('white', 'gray.700');
  const selectOptionColor = useColorModeValue('black', 'white');
  
  // Modals
  const detailModal = useDisclosure();
  const locationModal = useDisclosure();
  const addProductModal = useDisclosure();
  const categoryModal = useDisclosure();
  const editProductModal = useDisclosure();
  
  // State
  const [parts, setParts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const [selectedPartLocations, setSelectedPartLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('name');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // New product form state
  const [newProduct, setNewProduct] = useState({
    part_name: '',
    part_code: '',
    part_type: 'PART',
    category_id: '',
    brand: '',
    model: '',
    color: '',
    size: '',
    description: '',
    min_stock_level: 5,
    max_stock_level: 100,
    image_files: [],
    sale_price: '',
    purchase_price: '',
    currency_type: 'TRY',
    // Separate currencies for buy/sell
    sale_currency_type: 'TRY',
    purchase_currency_type: 'TRY',
    // Optional compatibility via single model selection for PART
    vespa_model_id: '',
    compatible_model_ids: [],
    // Initial stock to add
    initial_store_qty: 0,
    initial_warehouse_qty: 0
  });
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [vespaModels, setVespaModels] = useState([]);
  const [loadingVespaModels, setLoadingVespaModels] = useState(false);
  const [modelSearchTerm, setModelSearchTerm] = useState('');
  const [imagePreviews, setImagePreviews] = useState([]);
  const [editImageFiles, setEditImageFiles] = useState([]);
  const [editImagePreviews, setEditImagePreviews] = useState([]);
  const [editExistingImages, setEditExistingImages] = useState([]); // [{id, image_path}]
  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [loadingEditCompatibility, setLoadingEditCompatibility] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPartId, setEditingPartId] = useState(null);
  const scheduleIdle = (fn) => {
    try {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        return window.requestIdleCallback(fn);
      }
    } catch {}
    return setTimeout(fn, 0);
  };

  const isTypeAndCategorySelected = Boolean(newProduct.part_type && newProduct.category_id);

  // Update image previews when files change
  useEffect(() => {
    try {
      (imagePreviews || []).forEach(url => URL.revokeObjectURL(url));
    } catch {}
    const previews = (newProduct.image_files || []).map(f => URL.createObjectURL(f));
    setImagePreviews(previews);
    // Cleanup on unmount
    return () => {
      try { previews.forEach(url => URL.revokeObjectURL(url)); } catch {}
    };
  }, [newProduct.image_files]);

  // Update edit image previews
  useEffect(() => {
    try {
      (editImagePreviews || []).forEach(url => URL.revokeObjectURL(url));
    } catch {}
    const previews = (editImageFiles || []).map(f => URL.createObjectURL(f));
    setEditImagePreviews(previews);
    return () => {
      try { previews.forEach(url => URL.revokeObjectURL(url)); } catch {}
    };
  }, [editImageFiles]);



  // Data loading functions
  const loadParts = async () => {
    try {
      setLoading(true);
      
      // Auto-update currency rates before loading parts to ensure accurate prices
      try {
        await apiService.makeRequest('/inventory/currency/rates/', 'POST');
      } catch (error) {
        console.warn('Currency update failed, continuing with existing rates:', error);
      }
      
      const response = await apiService.makeRequest('/inventory/parts/');
      const partsData = response?.parts || response || [];
      
      const transformedParts = partsData.map(part => ({
        id: part.id,
        part_code: part.part_code,
        part_name: part.part_name,
        part_type: part.part_type,
        category_name: part.category_name,
        category_id: part.category_id,
        brand: part.brand,
        model: part.model,
        color: part.color,
        size: part.size,
        description: part.description,
        image_path: part.image_path,
        image_paths: part.image_paths || part.images || (part.image_path ? [part.image_path] : []),
        total_stock: part.total_stock || 0,
        available_stock: part.available_stock || 0,
        reserved_stock: part.reserved_stock || 0,
        min_stock_level: part.min_stock_level || 5,
        max_stock_level: part.max_stock_level || 100,
        stock_status: part.stock_status || 'NORMAL',
        purchase_price: part.purchase_price || 0,
        sale_price: part.sale_price || 0,
        currency_type: part.currency_type || 'TRY',
        effective_date: part.effective_date,
        supplier_name: part.supplier_name,
        supplier_id: part.supplier_id,
        purchase_currency_type: part.purchase_currency_type,
        purchase_price_try_at_purchase: part.purchase_price_try_at_purchase || 0,
        sale_price_try_today: part.sale_price_try_today || 0,
        eur_try_today: part.eur_try_today || 35.0,
        usd_try_today: part.usd_try_today || 32.0,
        eur_try_on_purchase: part.eur_try_on_purchase || 35.0,
        usd_try_on_purchase: part.usd_try_on_purchase || 32.0,
        last_updated: part.updated_date
      }));
      
      setParts(transformedParts);
    } catch (error) {
      console.error('Error loading parts:', error);
      toast({
        title: 'Hata',
        description: 'Ürünler yüklenirken hata oluştu: ' + error.message,
        status: 'error',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStorageLocations = async () => {
    try {
      const response = await apiService.makeRequest('/inventory/locations/');
      setLocations(response?.storage_locations || response || []);
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const loadCategories = async (partType = null) => {
    try {
      const url = partType ? `/inventory/categories/?type=${partType}` : '/inventory/categories/';
      const response = await apiService.makeRequest(url);
      const raw = response?.categories || response || [];
      const normalized = Array.isArray(raw) ? raw : [];
      let result = normalized;
      if (partType) {
        const hasTypeField = normalized.some(c => c.category_type !== undefined || c.type !== undefined);
        if (hasTypeField) {
          result = normalized.filter(c => (String(c.category_type || c.type || '').toUpperCase()) === String(partType).toUpperCase());
        }
        // if no type field, API already filtered → keep as is
      }
      setCategories(result);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadSuppliers = async () => {
    try {
      setLoadingSuppliers(true);
      const response = await apiService.makeRequest('/inventory/suppliers/');
      const list = response?.suppliers || response || [];
      const mapped = list.map(s => ({ id: s.id, name: s.supplier_name || s.name || s.company_name || `Supplier ${s.id}` }));
      setSuppliers(mapped);
      // Preselect Motopit if exists
      const motopit = mapped.find(s => String(s.name).toLowerCase().includes('motopit'));
      if (motopit) {
        setNewProduct(prev => ({ ...prev, supplier_id: prev.supplier_id || String(motopit.id) }));
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const loadPartLocations = async (partId) => {
    try {
      const response = await apiService.makeRequest(`/inventory/parts/${partId}/locations/`);
      setSelectedPartLocations(response?.locations || response || []);
    } catch (error) {
      console.error('Error loading part locations:', error);
    }
  };

  // Effects
  useEffect(() => {
    // Initial lightweight loads
    loadParts();
    loadStorageLocations();
  }, []);

  // Lazy-load heavy lists when addProductModal opens
  useEffect(() => {
    if (addProductModal.isOpen) {
      // Defer heavy loads to idle time to reduce INP on open
      scheduleIdle(() => {
        Promise.allSettled([
          (async () => loadCategories(newProduct.part_type))(),
          (async () => loadSuppliers())(),
          (async () => {
            try {
              setLoadingVespaModels(true);
              const res = await apiService.getVespaModels();
              const arr = Array.isArray(res) ? res : (res?.vespa_models || res?.models || []);
              setVespaModels(arr.map(m => ({ id: m.id, name: m.model_name || m.name })));
            } catch (e) {
              console.error('Error loading vespa models:', e);
            } finally {
              setLoadingVespaModels(false);
            }
          })()
        ]);
      });
    }
  }, [addProductModal.isOpen, newProduct.part_type]);

  // Utility functions
  const getStockStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'CRITICAL': return 'red';
      case 'LOW': return 'yellow';
      case 'NORMAL': return 'green';
      default: return 'gray';
    }
  };

  const getStockStatusText = (status) => {
    switch (status?.toUpperCase()) {
      case 'CRITICAL': return 'Kritik';
      case 'LOW': return 'Düşük';
      case 'NORMAL': return 'Normal';
      default: return 'Bilinmiyor';
    }
  };

  const formatLocationDescription = (location) => {
    if (location.location_type === 'STORE') {
      return `Mağaza - ${location.location_name}`;
    } else {
      // WAREHOUSE
      let description = 'Depo';
      if (location.shelf_code) {
        description += ` - ${location.shelf_code} Rafı`;
      }
      if (location.rack_number) {
        description += ` - ${location.rack_number}. Sıra`;
      }
      if (location.level_number) {
        description += ` - ${location.level_number}. Seviye`;
      }
      return description;
    }
  };

  const getCurrencySymbol = (currencyType) => {
    switch (currencyType) {
      case 'EUR': return '€';
      case 'USD': return '$';
      case 'TRY': return '₺';
      default: return '₺';
    }
  };
  
  const getPartImages = (part) => {
    if (!part) return [];
    const imgs = part.image_paths || part.images;
    if (Array.isArray(imgs) && imgs.length > 0) return imgs;
    return part.image_path ? [part.image_path] : [];
  };

  const derivePurchaseDisplay = (part) => {
    if (!part) return { currency: 'TRY', amount: 0, tryAtPurchase: 0 };
    const currency = inferPurchaseCurrency(part);
    let amount = Number(part.purchase_price) || 0;
    // If backend only returned TRY-at-purchase and we can invert with rates, compute foreign amount
    if (currency !== 'TRY' && (!amount || amount === 0)) {
      const tryVal = Number(part.purchase_price_try_at_purchase) || 0;
      const rate = currency === 'EUR' ? Number(part.eur_try_on_purchase || part.eur_try_today) : Number(part.usd_try_on_purchase || part.usd_try_today);
      if (tryVal > 0 && rate > 0) {
        amount = Number((tryVal / rate).toFixed(2));
      }
    }
    return { currency, amount, tryAtPurchase: Number(part.purchase_price_try_at_purchase) || 0 };
  };

  const resolveImageUrl = (path) => {
    if (!path) return '/placeholder-product.png';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/')) return `http://localhost:8000${path}`;
    return `http://localhost:8000/${path}`;
  };

  const inferPurchaseCurrency = (part) => {
    // If backend starts returning purchase_currency_type, prefer it
    const explicit = part.purchase_currency_type;
    if (explicit && ['TRY','USD','EUR'].includes(explicit)) return explicit;
    // Heuristic: if sale currency is TRY and purchase_price_try_at_purchase exists, try to infer via rates
    try {
      const pp = Number(part.purchase_price);
      const ppTry = Number(part.purchase_price_try_at_purchase);
      const eur = Number(part.eur_try_on_purchase || part.eur_try_today);
      const usd = Number(part.usd_try_on_purchase || part.usd_try_today);
      if (pp > 0 && ppTry > 0) {
        if (eur > 0 && Math.abs(pp * eur - ppTry) / ppTry < 0.1) return 'EUR';
        if (usd > 0 && Math.abs(pp * usd - ppTry) / ppTry < 0.1) return 'USD';
      }
    } catch {}
    return part.currency_type || 'TRY';
  };

  const handleRowClick = async (part) => {
    setSelectedPart(part);
    setCurrentImageIndex(0);
    await loadPartLocations(part.id);
    detailModal.onOpen();
  };

  const handleSellProduct = (part) => {
    // Navigate to sales page and add product to cart
    navigate('/admin/sales', { 
      state: { 
        addToCart: {
          id: part.id,
          part_name: part.part_name,
          price: part.currency_type !== 'TRY' ? part.sale_price_try_today : part.sale_price
        }
      }
    });
  };

  const handleAddProduct = async () => {
    try {
      if (!newProduct.part_name || !newProduct.part_code || !newProduct.category_id) {
        toast({
          title: 'Hata',
          description: 'Ürün adı, kodu ve kategorisi gereklidir',
          status: 'error',
          duration: 5000
        });
        return;
      }

      // Validate type/category chosen first
      if (!newProduct.part_type || !newProduct.category_id) {
        toast({ title: 'Hata', description: 'Önce ürün tipi ve kategoriyi seçiniz', status: 'error', duration: 5000 });
        return;
      }

      // Validate sale price
      if (!newProduct.sale_price || Number(newProduct.sale_price) <= 0) {
        toast({ title: 'Hata', description: 'Satış fiyatı zorunludur ve 0’dan büyük olmalıdır', status: 'error', duration: 5000 });
        return;
      }
      // Validate supplier (required by backend part_prices)
      if (!newProduct.supplier_id) {
        toast({ title: 'Hata', description: 'Tedarikçi seçimi zorunludur', status: 'error', duration: 5000 });
        return;
      }

      // For PART, require at least one compatible model (multi-select)
      if (newProduct.part_type === 'PART' && (!newProduct.compatible_model_ids || newProduct.compatible_model_ids.length === 0)) {
        toast({ title: 'Hata', description: 'Yedek parça için en az bir uyumlu Vespa modeli seçiniz', status: 'error', duration: 5000 });
        return;
      }

      setSaving(true);
      const formData = new FormData();
      formData.append('part_name', newProduct.part_name);
      formData.append('part_code', newProduct.part_code);
      formData.append('category_id', newProduct.category_id);
      formData.append('part_type', newProduct.part_type);
      formData.append('brand', newProduct.brand);
      formData.append('model', newProduct.model);
      formData.append('color', newProduct.color);
      formData.append('size', newProduct.size);
      formData.append('description', newProduct.description);
      formData.append('min_stock_level', newProduct.min_stock_level);
      formData.append('max_stock_level', newProduct.max_stock_level);
      // Pricing with independent currencies (backend expects single currency_type)
      if (newProduct.purchase_price) formData.append('purchase_price', String(newProduct.purchase_price));
      if (newProduct.purchase_currency_type) formData.append('purchase_currency_type', newProduct.purchase_currency_type);
      formData.append('sale_price', String(newProduct.sale_price));
      const effectiveCurrency = newProduct.sale_currency_type || newProduct.currency_type || 'TRY';
      formData.append('currency_type', effectiveCurrency);
      if (newProduct.sale_currency_type) formData.append('sale_currency_type', newProduct.sale_currency_type);
      formData.append('supplier_id', String(newProduct.supplier_id));

      // Compatibility: multi model ids for PART
      if (newProduct.part_type === 'PART' && newProduct.compatible_model_ids?.length > 0) {
        formData.append('compatible_model_ids', JSON.stringify(newProduct.compatible_model_ids.map(id => Number(id))));
      }

      // Images: backend consumes single 'image'. Send first as 'image' and also include all as 'images' for future compatibility
      if (newProduct.image_files && newProduct.image_files.length > 0) {
        formData.append('image', newProduct.image_files[0]);
        newProduct.image_files.forEach((file) => {
          formData.append('images', file);
        });
      }

      const response = await fetch('http://localhost:8000/api/inventory/parts/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        let serverMsg = '';
        try {
          serverMsg = await response.text();
        } catch (_e) {}
        throw new Error('Ürün ekleme başarısız' + (serverMsg ? `: ${serverMsg}` : ''));
      }

      const result = await response.json();
      const createdPartId = result?.part?.id || result?.id;
      
      toast({
        title: 'Başarılı',
        description: `${newProduct.part_name} başarıyla eklendi`,
        status: 'success',
        duration: 5000
      });

      // Reset form
      setNewProduct({
        part_name: '',
        part_code: '',
        part_type: 'PART',
        category_id: '',
        brand: '',
        model: '',
        color: '',
        size: '',
        description: '',
        min_stock_level: 5,
        max_stock_level: 100,
        image_file: null,
        sale_price: '',
        purchase_price: '',
        currency_type: 'TRY',
        sale_currency_type: 'TRY',
        purchase_currency_type: 'TRY',
        vespa_model_id: '',
        compatible_model_ids: []
      });

      // If initial stocks provided, create stock movements to STORE and WAREHOUSE
      try {
        const storeQty = Number(newProduct.initial_store_qty) || 0;
        const whQty = Number(newProduct.initial_warehouse_qty) || 0;
        if (createdPartId && (storeQty > 0 || whQty > 0)) {
          // We need location ids. Try fetch locations and pick by type
          const locResp = await apiService.makeRequest('/inventory/locations/');
          const allLocations = locResp?.storage_locations || locResp || [];
          const storeLoc = allLocations.find(l => (l.location_type || l.type) === 'STORE');
          const whLoc = allLocations.find(l => (l.location_type || l.type) === 'WAREHOUSE');
          const token = localStorage.getItem('accessToken');
          const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
          if (storeQty > 0 && storeLoc?.id) {
            await fetch('http://localhost:8000/api/inventory/stock/movements/', {
              method: 'POST',
              headers,
              body: JSON.stringify({ part_id: createdPartId, location_id: storeLoc.id, movement_type: 'IN', quantity: storeQty, reference_type: 'INITIAL', notes: 'Initial stock (store)' })
            });
          }
          if (whQty > 0 && whLoc?.id) {
            await fetch('http://localhost:8000/api/inventory/stock/movements/', {
              method: 'POST',
              headers,
              body: JSON.stringify({ part_id: createdPartId, location_id: whLoc.id, movement_type: 'IN', quantity: whQty, reference_type: 'INITIAL', notes: 'Initial stock (warehouse)' })
            });
          }
        }
      } catch (e) {
        console.warn('Initial stock movements failed:', e);
      }

      addProductModal.onClose();
      loadParts(); // Reload parts list
      
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: 'Hata',
        description: error.message,
        status: 'error',
        duration: 5000
      });
    } finally {
      setSaving(false);
    }
  };

  // Filtering and sorting
  const filteredParts = parts.filter(part => {
    const matchesSearch = part.part_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         part.part_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || part.part_type === filterType;
    const matchesStatus = filterStatus === 'ALL' || part.stock_status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.part_name.localeCompare(b.part_name);
      case 'stock': return b.total_stock - a.total_stock;
      case 'status': return a.stock_status.localeCompare(b.stock_status);
      default: return 0;
    }
  });

  // Statistics
  const totalParts = parts.length;
  const lowStockParts = parts.filter(p => p.stock_status === 'LOW').length;
  const criticalStockParts = parts.filter(p => p.stock_status === 'CRITICAL').length;
  const totalValue = parts.reduce((sum, p) => {
    const priceInTry = p.currency_type !== 'TRY' ? p.sale_price_try_today : p.sale_price;
    return sum + (p.total_stock * priceInTry);
  }, 0);



  // If navigated with a request to open the Add Product modal, handle it
  useEffect(() => {
    if (location?.state?.openAddProduct) {
      try {
        addProductModal.onOpen();
        // Start background loads in parallel
        loadCategories(newProduct.part_type);
        loadSuppliers();
        (async () => {
          try {
            setLoadingVespaModels(true);
            const res = await apiService.getVespaModels();
            const arr = Array.isArray(res) ? res : (res?.vespa_models || res?.models || []);
            setVespaModels(arr.map(m => ({ id: m.id, name: m.model_name || m.name })));
          } catch (e) {
            console.error('Error loading vespa models:', e);
          } finally {
            setLoadingVespaModels(false);
          }
        })();
      } finally {
        try { window.history.replaceState({}, document.title); } catch {}
      }
    }
  }, [location?.state?.openAddProduct]);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }} bg={bgColor} minH="100vh">
      {/* Header */}
      <Card mb={6}>
        <Flex justify="space-between" align="center" mb={4}>
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="bold" color={primaryTextColor}>Stok Yönetimi</Text>
            <Text color={secondaryTextColor}>Mağaza ve depo stok durumunu görüntüleyin ve yönetin</Text>
          </VStack>
          <HStack>
            <Button leftIcon={<Icon as={MdRefresh} />} variant="outline" onClick={loadParts} isLoading={loading}>
              Yenile
            </Button>
            <Button 
              leftIcon={<Icon as={MdAdd} />} 
              colorScheme="brand"
              onClick={() => {
                // Open immediately; load heavy data in background/idle
                addProductModal.onOpen();
                scheduleIdle(() => {
                  Promise.allSettled([
                    (async () => loadCategories('PART'))(),
                    (async () => loadSuppliers())()
                  ]);
                });
              }}
            >
              Yeni Ürün
            </Button>
            <Button leftIcon={<Icon as={MdEdit} />} variant="outline" onClick={categoryModal.onOpen}>
              Kategoriler
            </Button>
          </HStack>
        </Flex>

        {/* Filters */}
        <Flex gap={4} mb={4} align="center" wrap="wrap">
          <HStack flex={1} maxW="400px">
            <Icon as={MdSearch} color={iconColor} />
            <Input 
              placeholder="Ürün adı veya kodu ara..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg={inputBg}
              border="1px"
              borderColor={borderColor}
              color={primaryTextColor}
              _placeholder={{ color: placeholderColor }}
            />
          </HStack>
          
          <Select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)} 
            w="150px" 
            bg={inputBg}
            color={primaryTextColor}
            borderColor={borderColor}
          >
            <option value="ALL" style={{ backgroundColor: selectOptionBg, color: selectOptionColor }}>Tüm Tipler</option>
            <option value="PART" style={{ backgroundColor: selectOptionBg, color: selectOptionColor }}>Yedek Parça</option>
            <option value="ACCESSORY" style={{ backgroundColor: selectOptionBg, color: selectOptionColor }}>Aksesuar</option>
          </Select>

          <Select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)} 
            w="150px" 
            bg={inputBg}
            color={primaryTextColor}
            borderColor={borderColor}
          >
            <option value="ALL" style={{ backgroundColor: selectOptionBg, color: selectOptionColor }}>Tüm Durumlar</option>
            <option value="NORMAL" style={{ backgroundColor: selectOptionBg, color: selectOptionColor }}>Normal</option>
            <option value="LOW" style={{ backgroundColor: selectOptionBg, color: selectOptionColor }}>Düşük</option>
            <option value="CRITICAL" style={{ backgroundColor: selectOptionBg, color: selectOptionColor }}>Kritik</option>
          </Select>

          <Select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)} 
            w="150px" 
            bg={inputBg}
            color={primaryTextColor}
            borderColor={borderColor}
          >
            <option value="name" style={{ backgroundColor: selectOptionBg, color: selectOptionColor }}>Ada Göre</option>
            <option value="stock" style={{ backgroundColor: selectOptionBg, color: selectOptionColor }}>Stoka Göre</option>
            <option value="status" style={{ backgroundColor: selectOptionBg, color: selectOptionColor }}>Duruma Göre</option>
          </Select>
        </Flex>
      </Card>

      {/* Statistics */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="20px" mb="20px">
        <Card p={6}>
          <Stat>
            <StatLabel>Toplam Ürün</StatLabel>
            <StatNumber color={brandColor}>{totalParts}</StatNumber>
            <StatHelpText>
              <Icon as={MdInventory} mr={1} />
              Tüm ürünler
            </StatHelpText>
          </Stat>
        </Card>
        
        <Card p={6}>
          <Stat>
            <StatLabel>Düşük Stok</StatLabel>
            <StatNumber color="yellow.500">{lowStockParts}</StatNumber>
            <StatHelpText>
              <Icon as={MdWarning} mr={1} />
              Minimum seviye
            </StatHelpText>
          </Stat>
        </Card>
        
        <Card p={6}>
          <Stat>
            <StatLabel>Kritik Stok</StatLabel>
            <StatNumber color="red.500">{criticalStockParts}</StatNumber>
            <StatHelpText>
              <Icon as={MdTrendingDown} mr={1} />
              Acil tedarik
            </StatHelpText>
          </Stat>
        </Card>
        
        <Card p={6}>
          <Stat>
            <StatLabel>Toplam Değer</StatLabel>
            <StatNumber color="green.500">₺{totalValue.toLocaleString()}</StatNumber>
            <StatHelpText>
              <Icon as={MdTrendingUp} mr={1} />
              Stok değeri
            </StatHelpText>
          </Stat>
        </Card>
      </SimpleGrid>

      {/* Alerts */}
      {criticalStockParts > 0 && (
        <Alert status="error" mb="20px" borderRadius="12px">
          <AlertIcon />
          <Box>
            <AlertTitle>Kritik Stok Durumu!</AlertTitle>
            <AlertDescription>
              {criticalStockParts} ürünün stoğu kritik seviyede. Acil tedarik gerekiyor.
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {lowStockParts > 0 && (
        <Alert status="warning" mb="20px" borderRadius="12px">
          <AlertIcon />
          <Box>
            <AlertTitle>Düşük Stok Uyarısı!</AlertTitle>
            <AlertDescription>
              {lowStockParts} ürünün stoğu minimum seviyede veya altında.
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {/* Main Table */}
      <Card>
              {loading ? (
          <Center py={10}>
            <VStack>
              <Spinner size="xl" color={brandColor} />
              <Text color={primaryTextColor}>Stok verileri yükleniyor...</Text>
            </VStack>
          </Center>
        ) : (
              <TableContainer>
            <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Görsel</Th>
                  <Th>Ürün Bilgileri</Th>
                  <Th>Tip</Th>
                  <Th>Stok Durumu</Th>
                  <Th>Lokasyonlar</Th>
                      <Th>Fiyat</Th>
                      <Th>Durum</Th>
                      <Th>İşlemler</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                {filteredParts.map((part) => (
                  <Tr 
                    key={part.id} 
                            cursor="pointer"
                    _hover={{ bg: hoverBg }}
                    onClick={() => handleRowClick(part)}
                  >
                    <Td>
                      <Box w="40px" h="40px" borderRadius="md" overflow="hidden" bg="gray.100">
                            <Image
                          src={resolveImageUrl(part.image_path)}
                          alt={part.part_name}
                          w="100%"
                          h="100%"
                          objectFit="cover"
                          fallbackSrc="/placeholder-product.png"
                            />
                          </Box>
                        </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold" fontSize="sm" color={primaryTextColor}>{part.part_name}</Text>
                        <Text fontSize="xs" color={secondaryTextColor}>{part.part_code}</Text>
                        <Text fontSize="xs" color={secondaryTextColor}>{part.category_name}</Text>
                        {(part.brand || part.model) && (
                          <Text fontSize="xs" color={secondaryTextColor}>
                            {part.brand} {part.model}
                          </Text>
                        )}
                      </VStack>
                    </Td>
                    <Td>
                      <Badge colorScheme={part.part_type === 'PART' ? 'blue' : 'purple'}>
                        {part.part_type === 'PART' ? 'Yedek Parça' : 'Aksesuar'}
                      </Badge>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <HStack>
                          <Text fontWeight="bold" color={primaryTextColor}>{part.total_stock}</Text>
                          <Text fontSize="xs" color={secondaryTextColor}>toplam</Text>
                        </HStack>
                        <HStack>
                          <Text fontSize="xs" color="green.500">{part.available_stock} müsait</Text>
                          {part.reserved_stock > 0 && (
                            <Text fontSize="xs" color="orange.500">{part.reserved_stock} rezerve</Text>
                          )}
                        </HStack>
                        <Text fontSize="xs" color={secondaryTextColor}>
                          Min: {part.min_stock_level} / Max: {part.max_stock_level}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Button
                        leftIcon={<Icon as={MdLocationOn} />}
                              size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPart(part);
                          loadPartLocations(part.id);
                          locationModal.onOpen();
                        }}
                      >
                        Konumlar
                      </Button>
                    </Td>
                                        <Td>
                      <VStack align="start" spacing={1}>
                        {part.currency_type !== 'TRY' ? (
                          <>
                            <Text fontWeight="bold" color="green.600" fontSize="sm">
                              ₺{part.sale_price_try_today?.toLocaleString() || 0}
                            </Text>
                            <Text fontSize="xs" color={secondaryTextColor}>
                              Satış: {getCurrencySymbol(part.currency_type)}{part.sale_price?.toLocaleString() || 0}
                            </Text>
                            <Text fontSize="xs" color={secondaryTextColor}>
                              Alış: {getCurrencySymbol(part.currency_type)}{part.purchase_price?.toLocaleString() || 0}
                            </Text>
                          </>
                        ) : (
                          <>
                            <Text fontWeight="bold" color="green.600">
                              ₺{part.sale_price?.toLocaleString() || 0}
                            </Text>
                            <Text fontSize="xs" color={secondaryTextColor}>
                              Alış: ₺{part.purchase_price?.toLocaleString() || 0}
                            </Text>
                          </>
                        )}
                        <Badge size="xs" colorScheme={part.currency_type === 'TRY' ? 'green' : part.currency_type === 'EUR' ? 'blue' : 'purple'}>
                          {part.currency_type}
                        </Badge>
                      </VStack>
                    </Td>
                        <Td>
                      <Badge colorScheme={getStockStatusColor(part.stock_status)}>
                        {getStockStatusText(part.stock_status)}
                          </Badge>
                        </Td>
                        <Td>
                      <HStack>
                        <Tooltip label="Detayları Görüntüle">
                            <IconButton
                            icon={<Icon as={MdVisibility} />}
                              size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(part);
                            }}
                          />
                        </Tooltip>
                        <Tooltip label="Düzenle">
                          <IconButton
                            icon={<Icon as={MdEdit} />}
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Use the exact same shape/state as newProduct by copying it
                              const cloned = JSON.parse(JSON.stringify(newProduct));
                              cloned.id = part.id;
                              cloned.part_name = part.part_name || '';
                              cloned.part_code = part.part_code || '';
                              cloned.part_type = part.part_type || 'PART';
                              cloned.category_id = part.category_id || '';
                              cloned.brand = part.brand || '';
                              cloned.model = part.model || '';
                              cloned.color = part.color || '';
                              cloned.size = part.size || '';
                              cloned.description = part.description || '';
                              cloned.min_stock_level = part.min_stock_level || 5;
                              cloned.max_stock_level = part.max_stock_level || 100;
                              cloned.purchase_price = part.purchase_price || '';
                              cloned.sale_price = part.sale_price || '';
                              cloned.purchase_currency_type = (part.purchase_currency_type || part.currency_type || 'TRY');
                              cloned.sale_currency_type = part.currency_type || 'TRY';
                              cloned.supplier_id = part.supplier_id || '';
                              cloned.image_files = [];
                              // preload supplier/name to ensure Select shows a label immediately
                              if (!suppliers || suppliers.length === 0) {
                                scheduleIdle(() => loadSuppliers());
                              }
                              setEditProduct(cloned);
                              setIsEditing(true);
                              setEditingPartId(part.id);
                              addProductModal.onOpen();
                              // Load compatibility for PART types
                              (async () => {
                                if (part.part_type === 'PART') {
                                  try {
                                    setLoadingEditCompatibility(true);
                                    const res = await apiService.getPartCompatibility(part.id);
                                    const models = (res?.models || []).map(m => String(m.id));
                                    setEditProduct(prev => ({ ...(prev || {}), compatible_model_ids: models }));
                                  } catch (e) {
                                    console.warn('Compatibility load failed', e);
                                  } finally {
                                    setLoadingEditCompatibility(false);
                                  }
                                }
                              })();
                              // Load existing gallery images
                              (async () => {
                                try {
                                  const res = await apiService.getPartImages(part.id);
                                  setEditExistingImages(res?.images || []);
                                } catch (e) {
                                  console.warn('Part images load failed', e);
                                }
                              })();
                            }}
                          />
                        </Tooltip>
                        <Tooltip label="Satış Yap">
                            <IconButton
                            icon={<Icon as={MdShoppingCart} />}
                              size="sm"
                            colorScheme="green"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSellProduct(part);
                            }}
                          />
                        </Tooltip>
                      </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
              )}

                {!loading && filteredParts.length === 0 && (
          <Center py={10}>
            <VStack>
              <Icon as={MdInventory} boxSize={12} color={iconColor} />
              <Text color={secondaryTextColor}>
                {searchTerm || filterType !== 'ALL' || filterStatus !== 'ALL'
                  ? 'Arama kriterlerinize uygun ürün bulunamadı.'
                  : 'Henüz ürün eklenmemiş.'
                }
              </Text>
            </VStack>
          </Center>
        )}
      </Card>

      {/* Product Detail Modal */}
      <Modal isOpen={detailModal.isOpen} onClose={detailModal.onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg={modalBg}>
          <ModalHeader color={modalHeaderColor}>
            <HStack>
              <Icon as={MdVisibility} />
              <Text>Ürün Detayları</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedPart && (
              <VStack align="stretch" spacing={4}>
                <VStack align="start" spacing={4}>
                  <VStack align="center" spacing={2} w="100%">
            <Box position="relative" w={{ base: '100%', md: '420px' }} h={{ base: '240px', md: '280px' }} borderRadius="lg" overflow="hidden" bg="gray.100">
              <Image
                src={resolveImageUrl(getPartImages(selectedPart)[currentImageIndex] || selectedPart.image_path)}
                alt={selectedPart.part_name}
                w="100%"
                h="100%"
                objectFit="contain"
                bg={bgColor}
              />
              {getPartImages(selectedPart).length > 1 && (
                <>
                  <IconButton
                    aria-label="Önceki görsel"
                    icon={<Icon as={MdChevronLeft} />}
                    position="absolute"
                    top="50%"
                    left={2}
                    transform="translateY(-50%)"
                    onClick={() => setCurrentImageIndex((prev) => (prev - 1 + getPartImages(selectedPart).length) % getPartImages(selectedPart).length)}
                  />
                  <IconButton
                    aria-label="Sonraki görsel"
                    icon={<Icon as={MdChevronRight} />}
                    position="absolute"
                    top="50%"
                    right={2}
                    transform="translateY(-50%)"
                    onClick={() => setCurrentImageIndex((prev) => (prev + 1) % getPartImages(selectedPart).length)}
                  />
                </>
              )}
            </Box>
            <VStack align="start" w="100%" spacing={2}>
              <VStack align="start" spacing={1} w="100%">
                <Text fontSize="xl" fontWeight="bold" color={primaryTextColor}>{selectedPart.part_name}</Text>
                <Text color={secondaryTextColor}>{selectedPart.part_code}</Text>
                <HStack>
                  <Badge colorScheme={selectedPart.part_type === 'PART' ? 'blue' : 'purple'}>
                    {selectedPart.part_type === 'PART' ? 'Yedek Parça' : 'Aksesuar'}
                  </Badge>
                  <Badge colorScheme={getStockStatusColor(selectedPart.stock_status)}>
                    {getStockStatusText(selectedPart.stock_status)}
                  </Badge>
                </HStack>
              </VStack>

              {getPartImages(selectedPart).length > 1 && (
                <HStack spacing={2} wrap="wrap" justify="flex-start">
                  {getPartImages(selectedPart).map((img, idx) => (
                    <Box
                      key={`thumb-${idx}`}
                      w="56px"
                      h="56px"
                      borderRadius="md"
                      overflow="hidden"
                      borderWidth={currentImageIndex === idx ? '2px' : '1px'}
                      borderColor={currentImageIndex === idx ? 'brand.500' : borderColor}
                      cursor="pointer"
                      onClick={() => setCurrentImageIndex(idx)}
                    >
                      <Image src={resolveImageUrl(img)} alt={`thumb-${idx}`} w="100%" h="100%" objectFit="cover" />
                    </Box>
                  ))}
                </HStack>
              )}
            </VStack>
                  </VStack>
                </VStack>

                <Divider />

                <SimpleGrid columns={2} gap={4}>
                  <VStack align="start">
                    <Text fontWeight="bold" color={primaryTextColor}>Stok Bilgileri</Text>
                    <Text color={primaryTextColor}>Toplam Stok: <Text as="span" fontWeight="bold">{selectedPart.total_stock}</Text></Text>
                    <Text color={primaryTextColor}>Müsait Stok: <Text as="span" fontWeight="bold" color="green.500">{selectedPart.available_stock}</Text></Text>
                    <Text color={primaryTextColor}>Rezerve Stok: <Text as="span" fontWeight="bold" color="orange.500">{selectedPart.reserved_stock}</Text></Text>
                    <Text color={primaryTextColor}>Min/Max: <Text as="span" fontWeight="bold">{selectedPart.min_stock_level}/{selectedPart.max_stock_level}</Text></Text>
                  </VStack>
                  
                  <VStack align="start">
                    <Text fontWeight="bold" color={primaryTextColor}>Fiyat Bilgileri</Text>
                    
                    <>
                      {/* Purchase price - derive and show clearly */}
                      {(() => {
                        const pd = derivePurchaseDisplay(selectedPart);
                        return (
                          <VStack align="start" spacing={1}>
                            <Text color={primaryTextColor}>
                              Alış Fiyatı ({pd.currency}):
                              <Text as="span" fontWeight="bold" ml={2}>
                                {getCurrencySymbol(pd.currency)}{(pd.amount || 0).toLocaleString()}
                              </Text>
                            </Text>
                            {!!pd.tryAtPurchase && (
                              <Text color={secondaryTextColor} fontSize="sm">
                                (Alış Günü TRY karşılığı: ₺{pd.tryAtPurchase.toLocaleString()})
                              </Text>
                            )}
                          </VStack>
                        );
                      })()}
                      <Text color={primaryTextColor}>
                        Satış Fiyatı ({selectedPart.currency_type}): 
                        <Text as="span" fontWeight="bold" ml={2}>
                          {getCurrencySymbol(selectedPart.currency_type)}{selectedPart.sale_price?.toLocaleString()}
                        </Text>
                      </Text>
                      {selectedPart.sale_price_try_today && selectedPart.currency_type !== 'TRY' && (
                        <Text color={primaryTextColor}>
                          Satış Fiyatı (Güncel TRY):
                          <Text as="span" fontWeight="bold" color="green.500" ml={2}>
                            ₺{selectedPart.sale_price_try_today?.toLocaleString()}
                          </Text>
                        </Text>
                      )}
                    </>
                    
                    <Text color={primaryTextColor}>Para Birimi: <Text as="span" fontWeight="bold">{selectedPart.currency_type}</Text></Text>
                    <Text color={primaryTextColor}>Tedarikçi: <Text as="span" fontWeight="bold">{selectedPart.supplier_name || '-'}</Text></Text>
                  </VStack>
                </SimpleGrid>

                {selectedPart.description && (
                  <>
                    <Divider />
                    <VStack align="start">
                      <Text fontWeight="bold" color={primaryTextColor}>Açıklama</Text>
                      <Text color={primaryTextColor}>{selectedPart.description}</Text>
                    </VStack>
                  </>
                )}

                <Divider />

                <VStack align="start">
                  <Text fontWeight="bold" color={primaryTextColor}>Lokasyon Bilgileri</Text>
                  {selectedPartLocations.length > 0 ? (
                    <SimpleGrid columns={1} gap={2} w="100%">
                      {selectedPartLocations.map((loc, index) => (
                        <HStack key={index} p={2} bg={locationCardBg} borderRadius="md">
                          <Icon as={loc.location_type === 'STORE' ? MdStore : MdWarehouse} color={iconColor} />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm" fontWeight="bold" color={primaryTextColor}>
                              {formatLocationDescription(loc)}
                            </Text>
                            <Text fontSize="xs" color={secondaryTextColor}>
                              Kod: {loc.location_code}
                            </Text>
                            <Text fontSize="xs" color={primaryTextColor}>
                              <Text as="span" fontWeight="bold">{loc.current_stock}</Text> adet 
                              {loc.reserved_stock > 0 && ` (${loc.reserved_stock} rezerve)`}
                            </Text>
                          </VStack>
                        </HStack>
                      ))}
                    </SimpleGrid>
                  ) : (
                    <Text color={secondaryTextColor}>Lokasyon bilgileri yükleniyor...</Text>
                  )}
                </VStack>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={detailModal.onClose}>
              Kapat
            </Button>
            <Button colorScheme="green" leftIcon={<Icon as={MdShoppingCart} />} onClick={() => handleSellProduct(selectedPart)}>
              Satış Yap
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Product Modal - mirrors Add Product fields */}
      <Modal isOpen={editProductModal.isOpen} onClose={editProductModal.onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg={modalBg}>
          <ModalHeader color={modalHeaderColor}>
            <HStack>
              <Icon as={MdEdit} />
              <Text>Ürün Düzenle</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editProduct && (
              <VStack align="stretch" spacing={4}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel htmlFor={`edit-part-type-${uid}`} color={primaryTextColor}>Ürün Tipi</FormLabel>
                    <Select id={`edit-part-type-${uid}`} bg={inputBg} color={primaryTextColor} borderColor={borderColor} value={editProduct.part_type} onChange={(e) => setEditProduct(prev => ({...prev, part_type: e.target.value, category_id: '', brand: '', model: '', color: '', size: '', compatible_model_ids: []}))}>
                      <option value="PART">Yedek Parça</option>
                      <option value="ACCESSORY">Aksesuar</option>
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel htmlFor={`edit-category-${uid}`} color={primaryTextColor}>Kategori</FormLabel>
                    <Select id={`edit-category-${uid}`} bg={inputBg} color={primaryTextColor} borderColor={borderColor} placeholder={categories.length === 0 ? 'Kategoriler yükleniyor...' : 'Kategori seçin'} value={editProduct.category_id || ''} onChange={(e) => setEditProduct(prev => ({...prev, category_id: e.target.value}))}>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel htmlFor={`edit-name-${uid}`} color={primaryTextColor}>Ürün Adı</FormLabel>
                    <Input id={`edit-name-${uid}`} bg={inputBg} color={primaryTextColor} borderColor={borderColor} value={editProduct.part_name || ''} onChange={(e) => setEditProduct(prev => ({ ...prev, part_name: e.target.value }))} />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel htmlFor={`edit-code-${uid}`} color={primaryTextColor}>Ürün Kodu</FormLabel>
                    <Input id={`edit-code-${uid}`} bg={inputBg} color={primaryTextColor} borderColor={borderColor} value={editProduct.part_code || ''} onChange={(e) => setEditProduct(prev => ({ ...prev, part_code: e.target.value }))} />
                  </FormControl>
                  {editProduct.part_type === 'ACCESSORY' && (
                    <>
                      <FormControl>
                        <FormLabel color={primaryTextColor}>Marka</FormLabel>
                        <Input value={editProduct.brand || ''} bg={inputBg} borderColor={borderColor} onChange={(e) => setEditProduct(prev => ({ ...prev, brand: e.target.value }))} />
                      </FormControl>
                      <FormControl>
                        <FormLabel color={primaryTextColor}>Model</FormLabel>
                        <Input value={editProduct.model || ''} bg={inputBg} borderColor={borderColor} onChange={(e) => setEditProduct(prev => ({ ...prev, model: e.target.value }))} />
                      </FormControl>
                      <FormControl>
                        <FormLabel color={primaryTextColor}>Renk</FormLabel>
                        <Input value={editProduct.color || ''} bg={inputBg} borderColor={borderColor} onChange={(e) => setEditProduct(prev => ({ ...prev, color: e.target.value }))} />
                      </FormControl>
                      <FormControl>
                        <FormLabel color={primaryTextColor}>Beden/Boyut</FormLabel>
                        <Input value={editProduct.size || ''} bg={inputBg} borderColor={borderColor} onChange={(e) => setEditProduct(prev => ({ ...prev, size: e.target.value }))} />
                      </FormControl>
                    </>
                  )}
                </SimpleGrid>

                <FormControl>
                  <FormLabel color={primaryTextColor}>Tedarikçi</FormLabel>
                  <Select value={editProduct.supplier_id || ''} onChange={(e) => setEditProduct(prev => ({ ...prev, supplier_id: e.target.value }))} placeholder="Seçiniz" bg={inputBg} borderColor={borderColor}>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.supplier_name || s.name}</option>
                    ))}
                  </Select>
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel color={primaryTextColor}>Alış Fiyatı</FormLabel>
                    <HStack>
                      <NumberInput min={0} value={editProduct.purchase_price || ''} onChange={(vStr, vNum) => setEditProduct(prev => ({ ...prev, purchase_price: Number.isFinite(vNum) ? vNum : '' }))} flex={1}>
                        <NumberInputField bg={inputBg} color={primaryTextColor} borderColor={borderColor} />
                      </NumberInput>
                      <Select w="120px" bg={inputBg} color={primaryTextColor} borderColor={borderColor} value={editProduct.currency_type || 'TRY'} onChange={(e) => setEditProduct(prev => ({ ...prev, currency_type: e.target.value }))}>
                        <option value="TRY">TRY</option>
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                      </Select>
                    </HStack>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel color={primaryTextColor}>Satış Fiyatı</FormLabel>
                    <NumberInput min={0} value={editProduct.sale_price || ''} onChange={(vStr, vNum) => setEditProduct(prev => ({ ...prev, sale_price: Number.isFinite(vNum) ? vNum : '' }))}>
                      <NumberInputField bg={inputBg} color={primaryTextColor} borderColor={borderColor} />
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>

                {/* Görseller (çoklu önizleme + başta mevcut görseller) */}
                <FormControl>
                  <FormLabel color={primaryTextColor}>Ürün Görselleri</FormLabel>
                  <Box border="2px" borderStyle="dashed" borderColor={borderColor} bg={inputBg} borderRadius="md" p={4}>
                    <VStack align="stretch" spacing={3}>
                      <HStack justify="space-between">
                        <Text color={secondaryTextColor} fontSize="sm">Görselleri yükleyin (birden fazla seçebilirsiniz)</Text>
                        <Button size="sm" onClick={() => document.getElementById('edit-product-images-input')?.click()}>
                          Dosya Seç
                        </Button>
                      </HStack>
                      <Input
                        id="edit-product-images-input"
                        type="file"
                        accept="image/*"
                        multiple
                        display="none"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setEditImageFiles(files);
                          setEditProduct(prev => ({ ...(prev || {}), image_files: files }));
                        }}
                      />
                      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                        {/* Existing images for the part being edited (from backend gallery) */}
                        {editExistingImages.map((img, idx) => (
                          <Box key={`exist-${img.id || idx}`} position="relative" border="1px" borderColor={borderColor} borderRadius="md" overflow="hidden">
                            <Image src={resolveImageUrl(img.image_path)} alt={`exist-${idx}`} w="100%" h="100%" objectFit="cover" />
                            <IconButton
                              aria-label="remove-existing"
                              icon={<MdClose />}
                              size="xs"
                              colorScheme="red"
                              position="absolute"
                              top="4px"
                              right="4px"
                              onClick={async () => {
                                try {
                                  await apiService.deletePartImage(editingPartId, img.id);
                                  setEditExistingImages(prev => prev.filter(x => x.id !== img.id));
                                } catch (e) {
                                  toast({ title: 'Hata', description: e.message, status: 'error' });
                                }
                              }}
                            />
                          </Box>
                        ))}
                        {/* New previews */}
                        {editImagePreviews.map((src, idx) => (
                          <Box key={`new-${idx}`} position="relative" border="1px" borderColor={borderColor} borderRadius="md" overflow="hidden">
                            <Image src={src} alt={`new-${idx}`} w="100%" h="100%" objectFit="cover" />
                            <IconButton
                              aria-label="remove"
                              icon={<MdClose />}
                              size="xs"
                              colorScheme="red"
                              position="absolute"
                              top="4px"
                              right="4px"
                              onClick={() => {
                                setEditProduct(prev => {
                                  const next = [...(prev?.image_files || [])];
                                  next.splice(idx, 1);
                                  return { ...(prev || {}), image_files: next };
                                });
                                setEditImageFiles(prev => {
                                  const arr = [...prev];
                                  arr.splice(idx, 1);
                                  return arr;
                                });
                              }}
                            />
                          </Box>
                        ))}
                      </SimpleGrid>
                    </VStack>
                  </Box>
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel color={primaryTextColor}>Min Stok Seviyesi</FormLabel>
                    <NumberInput min={1} value={editProduct.min_stock_level || 5} onChange={(v) => setEditProduct(prev => ({ ...prev, min_stock_level: parseInt(v) || 5 }))}>
                      <NumberInputField bg={inputBg} color={primaryTextColor} borderColor={borderColor} />
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel color={primaryTextColor}>Max Stok Seviyesi</FormLabel>
                    <NumberInput min={1} value={editProduct.max_stock_level || 100} onChange={(v) => setEditProduct(prev => ({ ...prev, max_stock_level: parseInt(v) || 100 }))}>
                      <NumberInputField bg={inputBg} color={primaryTextColor} borderColor={borderColor} />
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel color={primaryTextColor}>Açıklama</FormLabel>
                  <Textarea value={editProduct.description || ''} bg={inputBg} borderColor={borderColor} onChange={(e) => setEditProduct(prev => ({ ...prev, description: e.target.value }))} />
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={editProductModal.onClose}>İptal</Button>
            <Button colorScheme="brand" onClick={async () => {
              try {
                const form = new FormData();
                form.append('part_name', editProduct.part_name || '');
                form.append('part_code', editProduct.part_code || '');
                if (editProduct.category_id) form.append('category_id', String(editProduct.category_id));
                if (editProduct.part_type) form.append('part_type', editProduct.part_type);
                if (editProduct.description) form.append('description', editProduct.description);
                if (editProduct.min_stock_level != null) form.append('min_stock_level', String(editProduct.min_stock_level));
                if (editProduct.max_stock_level != null) form.append('max_stock_level', String(editProduct.max_stock_level));
                if (editProduct.brand) form.append('brand', editProduct.brand);
                if (editProduct.model) form.append('model', editProduct.model);
                if (editProduct.color) form.append('color', editProduct.color);
                if (editProduct.size) form.append('size', editProduct.size);
                if (editProduct.sale_price) form.append('sale_price', String(editProduct.sale_price));
                if (editProduct.purchase_price) form.append('purchase_price', String(editProduct.purchase_price));
                if (editProduct.currency_type) form.append('currency_type', editProduct.currency_type);
                if (editProduct.supplier_id) form.append('supplier_id', String(editProduct.supplier_id));
                if (editProduct.image_file) form.append('image', editProduct.image_file);

                await apiService.updatePart(editProduct.id, form, true);
                toast({ title: 'Başarılı', description: 'Ürün güncellendi', status: 'success' });
                editProductModal.onClose();
                loadParts();
              } catch (e) {
                toast({ title: 'Hata', description: e.message, status: 'error' });
              }
            }}>Kaydet</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Category Management Modal - Simple version */}
      <Modal isOpen={categoryModal.isOpen} onClose={categoryModal.onClose} size="lg">
        <ModalOverlay />
        <ModalContent bg={modalBg}>
          <ModalHeader color={modalHeaderColor}>
            <HStack>
              <Icon as={MdEdit} />
              <Text>Kategori Yönetimi</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Text color={secondaryTextColor} fontSize="sm">
                Ürün kategorilerini görüntüleyin ve yeni kategori ekleyin.
              </Text>
              <Box p={4} bg={locationCardBg} borderRadius="md">
                <Text fontWeight="semibold" mb={3} color={primaryTextColor}>Yeni Kategori Ekle</Text>
                <HStack>
                  <Input 
                    placeholder="Kategori adı..." 
                    bg={inputBg}
                    color={primaryTextColor}
                    _placeholder={{ color: placeholderColor }}
                    border="1px"
                    borderColor={borderColor}
                    focusBorderColor="brand.500"
                  />
                  <Button colorScheme="brand" size="sm" onClick={() => toast({ title: 'Bilgi', description: 'Kategori ekleme yakında', status: 'info' })}>Ekle</Button>
                </HStack>
              </Box>
              <VStack align="stretch" spacing={2}>
                <Text fontWeight="semibold" color={primaryTextColor}>Mevcut Kategoriler ({categories.length})</Text>
                <Box maxH="300px" overflowY="auto">
                  {categories.map(category => (
                    <Flex key={category.id} justify="space-between" align="center" p={3} bg={cardBg} borderRadius="md" borderWidth="1px" borderColor={borderColor} mb={3}>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="semibold" color={primaryTextColor}>{category.category_name}</Text>
                        <Text fontSize="sm" color={secondaryTextColor}>ID: {category.id}</Text>
                      </VStack>
                      <HStack>
                        <IconButton size="sm" icon={<Icon as={MdEdit} />} variant="ghost" aria-label="Kategoriyi düzenle" onClick={() => {
                          toast({ title: 'Bilgi', description: 'Kategori düzenleme yakında', status: 'info' });
                        }} />
                        <IconButton size="sm" icon={<Icon as={MdDelete} />} variant="ghost" colorScheme="red" aria-label="Kategoriyi sil" onClick={() => {
                          toast({ title: 'Bilgi', description: 'Kategori silme yakında', status: 'info' });
                        }} />
                      </HStack>
                    </Flex>
                  ))}
                  {categories.length === 0 && (
                    <Center py={8}>
                      <VStack>
                        <Text color={secondaryTextColor}>Henüz kategori bulunmuyor</Text>
                        <Text fontSize="sm" color={secondaryTextColor}>Yukarıdaki formdan yeni kategori ekleyebilirsiniz</Text>
                      </VStack>
                    </Center>
                  )}
                </Box>
              </VStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={categoryModal.onClose}>Kapat</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Location Modal */}
      <Modal isOpen={locationModal.isOpen} onClose={locationModal.onClose} size="lg">
        <ModalOverlay />
        <ModalContent bg={modalBg}>
          <ModalHeader color={modalHeaderColor}>
            <HStack>
              <Icon as={MdLocationOn} />
              <Text>Stok Lokasyonları</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedPart && (
              <VStack align="stretch" spacing={4}>
                <Text fontWeight="bold" color={primaryTextColor}>{selectedPart.part_name} - {selectedPart.part_code}</Text>
                <Divider />
                {selectedPartLocations.length > 0 ? (
                  selectedPartLocations.map((loc, index) => (
                    <Card key={index} p={4}>
                      <HStack justify="space-between" align="start">
                        <HStack>
                          <Icon 
                            as={loc.location_type === 'STORE' ? MdStore : MdWarehouse} 
                            color={loc.location_type === 'STORE' ? 'blue.500' : 'orange.500'}
                            boxSize={6}
                          />
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold" color={primaryTextColor}>
                              {formatLocationDescription(loc)}
                            </Text>
                            <Text fontSize="sm" color={secondaryTextColor}>
                              Kod: {loc.location_code}
                            </Text>
                            <Text fontSize="sm" color={secondaryTextColor}>
                              {loc.location_name}
                            </Text>
                          </VStack>
                        </HStack>
                        <VStack align="end" spacing={1}>
                          <Text fontSize="lg" fontWeight="bold" color="green.500">
                            {loc.current_stock} adet
                          </Text>
                          {loc.reserved_stock > 0 && (
                            <Text fontSize="sm" color="orange.500">
                              {loc.reserved_stock} rezerve
                            </Text>
                          )}
                          <Text fontSize="sm" color="blue.500">
                            {loc.available_stock} müsait
                          </Text>
                        </VStack>
                      </HStack>
                    </Card>
                  ))
                ) : (
                  <Center py={6}>
                    <Text color={secondaryTextColor}>Bu ürün için lokasyon bilgisi bulunamadı.</Text>
                  </Center>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={locationModal.onClose}>Kapat</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add/Edit Product Modal */}
      <Modal isOpen={addProductModal.isOpen} onClose={() => { setIsEditing(false); setEditingPartId(null); addProductModal.onClose(); }} size="xl">
        <ModalOverlay />
        <ModalContent bg={modalBg}>
          <ModalHeader color={modalHeaderColor}>
            <HStack>
              <Icon as={isEditing ? MdEdit : MdAdd} />
              <Text>{isEditing ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Text color={secondaryTextColor} fontSize="sm">
                {isEditing ? 'Ürün bilgilerini güncelleyin. Tüm alanlar ekleme formu ile birebir aynıdır.' : 'Sisteme yeni bir ürün veya parça ekleyin. Tüm alanları dikkatli bir şekilde doldurun.'}
              </Text>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                 <FormControl isRequired>
                   <FormLabel htmlFor={`part-type-${uid}`} color={primaryTextColor}>Ürün Tipi</FormLabel>
                   <Select 
                     id={`part-type-${uid}`}
                     bg={inputBg}
                     color={primaryTextColor}
                     borderColor={borderColor}
                      value={isEditing ? editProduct?.part_type : newProduct.part_type}
                      onChange={(e) => {
                        const selectedType = e.target.value;
                        const setter = isEditing ? setEditProduct : setNewProduct;
                        setter(prev => ({
                         ...prev, 
                         part_type: selectedType,
                         category_id: '',
                         // reset non-applicable fields
                         brand: '', model: '', color: '', size: '',
                         vespa_model_id: '', compatible_model_ids: []
                       }));
                       loadCategories(selectedType);
                     }}
                   >
                     <option value="PART" style={{ backgroundColor: selectOptionBg, color: selectOptionColor }}>Yedek Parça</option>
                     <option value="ACCESSORY" style={{ backgroundColor: selectOptionBg, color: selectOptionColor }}>Aksesuar</option>
                   </Select>
                 </FormControl>
                 
                 <FormControl isRequired>
                   <FormLabel htmlFor={`category-${uid}`} color={primaryTextColor}>Kategori</FormLabel>
                   <Select 
                     id={`category-${uid}`}
                     placeholder={
                       !newProduct.part_type 
                         ? "Önce ürün tipi seçin" 
                         : categories.length === 0 
                         ? "Kategoriler yükleniyor..." 
                         : "Kategori seçin"
                     }
                     bg={inputBg}
                     color={primaryTextColor}
                     borderColor={borderColor}
                     _placeholder={{ color: placeholderColor }}
                      value={isEditing ? (editProduct?.category_id || '') : newProduct.category_id}
                      onChange={(e) => (isEditing ? setEditProduct : setNewProduct)(prev => ({...prev, category_id: e.target.value}))}
                      isDisabled={!(isEditing ? editProduct?.part_type : newProduct.part_type) || categories.length === 0}
                   >
                     {categories.map(cat => (
                       <option key={cat.id} value={cat.id} style={{ backgroundColor: selectOptionBg, color: selectOptionColor }}>
                         {cat.category_name}
                       </option>
                     ))}
                   </Select>
                 </FormControl>
                
                 {/* Name and Code move down */}
                 <FormControl isRequired>
                   <FormLabel htmlFor={`name-${uid}`} color={primaryTextColor}>Ürün Adı</FormLabel>
                   <Input 
                     id={`name-${uid}`}
                     placeholder="Örn: Vespa Kaskı" 
                     bg={inputBg}
                     color={primaryTextColor}
                     borderColor={borderColor}
                     _placeholder={{ color: placeholderColor }}
                      value={isEditing ? (editProduct?.part_name || '') : newProduct.part_name}
                      onChange={(e) => (isEditing ? setEditProduct : setNewProduct)(prev => ({...prev, part_name: e.target.value}))}
                   />
                 </FormControl>
                 
                 <FormControl isRequired>
                   <FormLabel htmlFor={`code-${uid}`} color={primaryTextColor}>Ürün Kodu</FormLabel>
                   <Input 
                     id={`code-${uid}`}
                     placeholder="Örn: VK-001" 
                     bg={inputBg}
                     color={primaryTextColor}
                     borderColor={borderColor}
                     _placeholder={{ color: placeholderColor }}
                      value={isEditing ? (editProduct?.part_code || '') : newProduct.part_code}
                      onChange={(e) => (isEditing ? setEditProduct : setNewProduct)(prev => ({...prev, part_code: e.target.value}))}
                   />
                 </FormControl>
                
                  {(isEditing ? editProduct?.part_type : newProduct.part_type) === 'ACCESSORY' && (
                   <FormControl>
                     <FormLabel htmlFor={`brand-${uid}`} color={primaryTextColor}>Marka</FormLabel>
                     <Input 
                       id={`brand-${uid}`}
                       placeholder="Örn: Vespa" 
                       bg={inputBg}
                       color={primaryTextColor}
                       borderColor={borderColor}
                       _placeholder={{ color: placeholderColor }}
                        value={isEditing ? (editProduct?.brand || '') : newProduct.brand}
                        onChange={(e) => (isEditing ? setEditProduct : setNewProduct)(prev => ({...prev, brand: e.target.value}))}
                     />
                   </FormControl>
                 )}
                
                  {(isEditing ? editProduct?.part_type : newProduct.part_type) === 'ACCESSORY' && (
                   <FormControl>
                     <FormLabel htmlFor={`model-${uid}`} color={primaryTextColor}>Model</FormLabel>
                     <Input 
                       id={`model-${uid}`}
                       placeholder="Örn: Primavera" 
                       bg={inputBg}
                       color={primaryTextColor}
                       borderColor={borderColor}
                       _placeholder={{ color: placeholderColor }}
                        value={isEditing ? (editProduct?.model || '') : newProduct.model}
                        onChange={(e) => (isEditing ? setEditProduct : setNewProduct)(prev => ({...prev, model: e.target.value}))}
                     />
                   </FormControl>
                 )}
                
                  {(isEditing ? editProduct?.part_type : newProduct.part_type) === 'ACCESSORY' && (
                   <FormControl>
                     <FormLabel htmlFor={`color-${uid}`} color={primaryTextColor}>Renk</FormLabel>
                     <Input 
                       id={`color-${uid}`}
                       placeholder="Örn: Siyah" 
                       bg={inputBg}
                       color={primaryTextColor}
                       borderColor={borderColor}
                       _placeholder={{ color: placeholderColor }}
                        value={isEditing ? (editProduct?.color || '') : newProduct.color}
                        onChange={(e) => (isEditing ? setEditProduct : setNewProduct)(prev => ({...prev, color: e.target.value}))}
                     />
                   </FormControl>
                 )}
                
                  {(isEditing ? editProduct?.part_type : newProduct.part_type) === 'ACCESSORY' && (
                   <FormControl>
                     <FormLabel htmlFor={`size-${uid}`} color={primaryTextColor}>Beden/Boyut</FormLabel>
                     <Input 
                       id={`size-${uid}`}
                       placeholder="Örn: L, XL, 42" 
                       bg={inputBg}
                       color={primaryTextColor}
                       borderColor={borderColor}
                       _placeholder={{ color: placeholderColor }}
                        value={isEditing ? (editProduct?.size || '') : newProduct.size}
                        onChange={(e) => (isEditing ? setEditProduct : setNewProduct)(prev => ({...prev, size: e.target.value}))}
                     />
                   </FormControl>
                 )}
              </SimpleGrid>
              
              {/* Supplier row full width */}
              <FormControl isRequired gridColumn={{ base: 'span 1', md: 'span 2' }}>
                <FormLabel htmlFor={`supplier-${uid}`} color={primaryTextColor}>Tedarikçi</FormLabel>
                <Select
                  id={`supplier-${uid}`}
                  placeholder={loadingSuppliers ? 'Tedarikçiler yükleniyor...' : 'Tedarikçi seçin'}
                  bg={inputBg}
                  color={primaryTextColor}
                  borderColor={borderColor}
                  value={isEditing ? (editProduct?.supplier_id || '') : (newProduct.supplier_id || '')}
                  onChange={(e) => (isEditing ? setEditProduct : setNewProduct)(prev => ({ ...prev, supplier_id: e.target.value }))}
                >
                  {!loadingSuppliers && suppliers.map(s => (
                    <option key={s.id} value={s.id} style={{ backgroundColor: selectOptionBg, color: selectOptionColor }}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Pricing (independent currencies for buy/sell) */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel color={primaryTextColor}>Alış Fiyatı</FormLabel>
                  <HStack>
                     <NumberInput min={0} value={isEditing ? (editProduct?.purchase_price || '') : newProduct.purchase_price} onChange={(vStr, vNum) => (isEditing ? setEditProduct : setNewProduct)(prev => ({...prev, purchase_price: Number.isFinite(vNum) ? vNum : ''}))} flex={1}>
                      <NumberInputField bg={inputBg} color={primaryTextColor} borderColor={borderColor} />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <Select w="120px" bg={inputBg} color={primaryTextColor} borderColor={borderColor}
                      value={isEditing ? (editProduct?.purchase_currency_type || 'TRY') : newProduct.purchase_currency_type}
                      onChange={(e) => (isEditing ? setEditProduct : setNewProduct)(prev => ({...prev, purchase_currency_type: e.target.value}))}
                    >
                      <option value="TRY" style={{ backgroundColor: selectOptionBg, color: selectOptionColor }}>TRY</option>
                      <option value="EUR" style={{ backgroundColor: selectOptionBg, color: selectOptionColor }}>EUR</option>
                      <option value="USD" style={{ backgroundColor: selectOptionBg, color: selectOptionColor }}>USD</option>
                    </Select>
                  </HStack>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel color={primaryTextColor}>Satış Fiyatı</FormLabel>
                  <HStack>
                     <NumberInput min={0} value={isEditing ? (editProduct?.sale_price || '') : newProduct.sale_price} onChange={(vStr, vNum) => (isEditing ? setEditProduct : setNewProduct)(prev => ({...prev, sale_price: Number.isFinite(vNum) ? vNum : ''}))} flex={1}>
                      <NumberInputField bg={inputBg} color={primaryTextColor} borderColor={borderColor} />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <Select w="120px" bg={inputBg} color={primaryTextColor} borderColor={borderColor}
                      value={isEditing ? (editProduct?.sale_currency_type || 'TRY') : newProduct.sale_currency_type}
                      onChange={(e) => (isEditing ? setEditProduct : setNewProduct)(prev => ({...prev, sale_currency_type: e.target.value}))}
                    >
                      <option value="TRY" style={{ backgroundColor: selectOptionBg, color: selectOptionColor }}>TRY</option>
                      <option value="EUR" style={{ backgroundColor: selectOptionBg, color: selectOptionColor }}>EUR</option>
                      <option value="USD" style={{ backgroundColor: selectOptionBg, color: selectOptionColor }}>USD</option>
                    </Select>
                  </HStack>
                </FormControl>
              </SimpleGrid>

              {/* Compatible models for PART: multi-select styled like service operations */}
              {(isEditing ? editProduct?.part_type : newProduct.part_type) === 'PART' && (
                <FormControl>
                  <FormLabel color={primaryTextColor}>Uyumlu Vespa Modelleri</FormLabel>
                  <Menu closeOnSelect={false} isLazy matchWidth>
                    <MenuButton
                      as={Button}
                      w="100%"
                      h="40px"
                      textAlign="left"
                      fontWeight="normal"
                      bg={inputBg}
                      color={primaryTextColor}
                      border="1px"
                      borderColor={borderColor}
                      _hover={{ bg: hoverBg }}
                      justifyContent="space-between"
                      rightIcon={<Icon as={MdArrowDropDown} />}
                      px={3}
                    >
                       {(isEditing ? editProduct?.compatible_model_ids : newProduct.compatible_model_ids)?.length > 0
                         ? `${(isEditing ? editProduct?.compatible_model_ids : newProduct.compatible_model_ids).length} model seçildi`
                        : 'Uyumlu modelleri seçin'}
                    </MenuButton>
                    <MenuList p={0} maxH="300px" overflowY="auto" bg={modalBg} borderColor={borderColor}>
                      <Box p={3} borderBottom="1px solid" borderColor={borderColor}>
                        <InputGroup size="sm">
                          <InputLeftElement pointerEvents="none">
                            <Icon as={MdSearch} color={iconColor} />
                          </InputLeftElement>
                          <Input
                            id={`model-search-${uid}`}
                            placeholder="Model ara..."
                            value={modelSearchTerm}
                            onChange={(e) => setModelSearchTerm(e.target.value)}
                            bg={inputBg}
                            color={primaryTextColor}
                            borderColor={borderColor}
                            _placeholder={{ color: placeholderColor }}
                          />
                        </InputGroup>
                      </Box>
                      <Box p={2}>
                        {(loadingVespaModels ? [] : vespaModels)
                          .filter(vm => vm.name.toLowerCase().includes(modelSearchTerm.toLowerCase()))
                          .map(vm => {
                           const checked = ((isEditing ? editProduct?.compatible_model_ids : newProduct.compatible_model_ids) || []).map(String).includes(String(vm.id));
                            return (
                              <MenuItem key={vm.id} closeOnSelect={false} _hover={{ bg: hoverBg }}>
                                <Checkbox
                                  id={`model-${vm.id}-${uid}`}
                                  isChecked={checked}
                                  onChange={(e) => {
                                     (isEditing ? setEditProduct : setNewProduct)(prev => {
                                      const current = (prev.compatible_model_ids || []).map(String);
                                      const idStr = String(vm.id);
                                      const next = e.target.checked
                                        ? Array.from(new Set([...current, idStr]))
                                        : current.filter(x => x !== idStr);
                                      return { ...prev, compatible_model_ids: next };
                                    });
                                  }}
                                  colorScheme="brand"
                                >
                                  <Text as="span" color={primaryTextColor}>{vm.name}</Text>
                                </Checkbox>
                              </MenuItem>
                            );
                          })}
                        {(!loadingVespaModels && vespaModels.length === 0) && (
                          <Box p={3}><Text color={secondaryTextColor} fontSize="sm">Model bulunamadı</Text></Box>
                        )}
                      </Box>
                    </MenuList>
                  </Menu>
                   {(isEditing ? editProduct?.compatible_model_ids : newProduct.compatible_model_ids)?.length > 0 && (
                    <Box mt={3} p={3} bg={locationCardBg} border="1px" borderColor={borderColor} borderRadius="md">
                      <Flex justify="space-between" align="center" mb={2}>
                        <Text fontWeight="bold" fontSize="sm" color={primaryTextColor}>
                           ✅ Seçilen Modeller ({(isEditing ? editProduct?.compatible_model_ids : newProduct.compatible_model_ids).length})
                        </Text>
                         <Button size="xs" variant="ghost" colorScheme="red" onClick={() => (isEditing ? setEditProduct : setNewProduct)(prev => ({...prev, compatible_model_ids: []}))}>Tümünü Temizle</Button>
                      </Flex>
                      <HStack spacing={2} wrap="wrap">
                         {(isEditing ? editProduct?.compatible_model_ids : newProduct.compatible_model_ids).map(id => {
                          const m = vespaModels.find(v => String(v.id) === String(id));
                          return (
                            <Tag key={id} size="sm" colorScheme="green" borderRadius="full">
                              <TagLabel>{m?.name || id}</TagLabel>
                                 <IconButton aria-label="remove" icon={<MdClose />} size="xs" variant="ghost" onClick={() => (isEditing ? setEditProduct : setNewProduct)(prev => ({...prev, compatible_model_ids: prev.compatible_model_ids.filter(x => String(x) !== String(id))}))} />
                            </Tag>
                          );
                        })}
                      </HStack>
                    </Box>
                  )}
                </FormControl>
              )}

              {/* Initial stock split between Store and Warehouse */}
              {!isEditing && (
              <FormControl>
                <FormLabel color={primaryTextColor}>İlk Stok Girişi</FormLabel>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <HStack>
                    <Icon as={MdStore} color={iconColor} />
                    <Text color={secondaryTextColor} minW="100px">Mağaza</Text>
                    <NumberInput min={0} value={newProduct.initial_store_qty} onChange={(vStr, vNum) => setNewProduct(prev => ({...prev, initial_store_qty: Number.isFinite(vNum) ? vNum : 0}))} flex={1}>
                      <NumberInputField bg={inputBg} color={primaryTextColor} borderColor={borderColor} />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </HStack>
                  <HStack>
                    <Icon as={MdWarehouse} color={iconColor} />
                    <Text color={secondaryTextColor} minW="100px">Depo</Text>
                    <NumberInput min={0} value={newProduct.initial_warehouse_qty} onChange={(vStr, vNum) => setNewProduct(prev => ({...prev, initial_warehouse_qty: Number.isFinite(vNum) ? vNum : 0}))} flex={1}>
                      <NumberInputField bg={inputBg} color={primaryTextColor} borderColor={borderColor} />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </HStack>
                </SimpleGrid>
                <Text fontSize="xs" color={secondaryTextColor} mt={1}>Ürün oluşturulduktan sonra belirtilen miktarlar ilgili lokasyonlara giriş olarak kaydedilecektir.</Text>
              </FormControl>
              )}

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel color={primaryTextColor}>Min Stok Seviyesi</FormLabel>
                  <NumberInput 
                    min={1} 
                    value={isEditing ? (editProduct?.min_stock_level || 5) : newProduct.min_stock_level}
                    onChange={(value) => (isEditing ? setEditProduct : setNewProduct)(prev => ({...prev, min_stock_level: parseInt(value) || 5}))}
                  >
                    <NumberInputField 
                      bg={inputBg}
                      color={primaryTextColor}
                      borderColor={borderColor}
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                
                <FormControl>
                  <FormLabel color={primaryTextColor}>Max Stok Seviyesi</FormLabel>
                  <NumberInput 
                    min={1} 
                    value={isEditing ? (editProduct?.max_stock_level || 100) : newProduct.max_stock_level}
                    onChange={(value) => (isEditing ? setEditProduct : setNewProduct)(prev => ({...prev, max_stock_level: parseInt(value) || 100}))}
                  >
                    <NumberInputField 
                      bg={inputBg}
                      color={primaryTextColor}
                      borderColor={borderColor}
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </SimpleGrid>
              
              <FormControl>
                <FormLabel color={primaryTextColor}>Ürün Görselleri</FormLabel>
                <Box
                  border="2px"
                  borderStyle="dashed"
                  borderColor={borderColor}
                  bg={inputBg}
                  borderRadius="md"
                  p={4}
                >
                  <VStack align="stretch" spacing={3}>
                    <HStack justify="space-between">
                      <Text color={secondaryTextColor} fontSize="sm">Görselleri yükleyin (birden fazla seçebilirsiniz)</Text>
                      <Button size="sm" onClick={() => document.getElementById('product-images-input')?.click()}>
                        Dosya Seç
                      </Button>
                    </HStack>
                    <Input
                      id="product-images-input"
                      type="file"
                      accept="image/*"
                      multiple
                      display="none"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setNewProduct(prev => ({ ...prev, image_files: files }));
                      }}
                    />
                    {imagePreviews.length > 0 ? (
                      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                        {imagePreviews.map((src, idx) => (
                          <Box key={idx} position="relative" border="1px" borderColor={borderColor} borderRadius="md" overflow="hidden">
                            <Image src={src} alt={`preview-${idx}`} w="100%" h="100%" objectFit="cover" />
                            <IconButton
                              aria-label="remove"
                              icon={<MdClose />}
                              size="xs"
                              colorScheme="red"
                              position="absolute"
                              top="4px"
                              right="4px"
                              onClick={() => {
                                setNewProduct(prev => {
                                  const next = [...(prev.image_files || [])];
                                  next.splice(idx, 1);
                                  return { ...prev, image_files: next };
                                });
                              }}
                            />
                          </Box>
                        ))}
                      </SimpleGrid>
                    ) : (
                      <Text fontSize="xs" color={secondaryTextColor}>JPG, PNG veya WebP formatında görselleri yükleyebilirsiniz</Text>
                    )}
                  </VStack>
                </Box>
              </FormControl>
              
              <FormControl>
                <FormLabel color={primaryTextColor}>Açıklama</FormLabel>
                <Textarea 
                  placeholder="Ürün hakkında detaylı açıklama..."
                  rows={3}
                  bg={inputBg}
                  color={primaryTextColor}
                  borderColor={borderColor}
                  _placeholder={{ color: placeholderColor }}
                  value={isEditing ? (editProduct?.description || '') : newProduct.description}
                  onChange={(e) => (isEditing ? setEditProduct : setNewProduct)(prev => ({...prev, description: e.target.value}))}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button 
              variant="ghost" 
              mr={3} 
              onClick={addProductModal.onClose}
              color={secondaryTextColor}
            >
              İptal
            </Button>
            {isEditing ? (
              <Button colorScheme="brand" onClick={async () => {
                try {
                  setSaving(true);
                  const form = new FormData();
                  const p = editProduct || {};
                  form.append('part_name', p.part_name || '');
                  form.append('part_code', p.part_code || '');
                  if (p.category_id) form.append('category_id', String(p.category_id));
                  if (p.part_type) form.append('part_type', p.part_type);
                  if (p.description) form.append('description', p.description);
                  if (p.min_stock_level != null) form.append('min_stock_level', String(p.min_stock_level));
                  if (p.max_stock_level != null) form.append('max_stock_level', String(p.max_stock_level));
                  if (p.brand) form.append('brand', p.brand);
                  if (p.model) form.append('model', p.model);
                  if (p.color) form.append('color', p.color);
                  if (p.size) form.append('size', p.size);
                  if (p.sale_price) form.append('sale_price', String(p.sale_price));
                  if (p.purchase_price) form.append('purchase_price', String(p.purchase_price));
                  if (p.purchase_currency_type) form.append('currency_type', p.purchase_currency_type);
                  if (p.supplier_id) form.append('supplier_id', String(p.supplier_id));
                  if (p.remove_image) form.append('remove_image', '1');
                  if (p.image_files && p.image_files[0]) form.append('image', p.image_files[0]);
                  await apiService.updatePart(editingPartId, form, true);
                  // compatibility update
                  if (p.part_type === 'PART') {
                    await apiService.makeRequest(`/inventory/parts/${editingPartId}/compatibility/`, {
                      method: 'PUT',
                      body: JSON.stringify({ compatible_model_ids: (p.compatible_model_ids || []).map(x => Number(x)) }),
                      headers: { 'Content-Type': 'application/json', ...(apiService.getAuthHeaders()) }
                    });
                  }
                  toast({ title: 'Başarılı', description: 'Ürün güncellendi', status: 'success' });
                  setIsEditing(false); setEditingPartId(null); addProductModal.onClose();
                  loadParts();
                } catch (e) {
                  toast({ title: 'Hata', description: e.message, status: 'error' });
                } finally {
                  setSaving(false);
                }
              }} isLoading={saving} loadingText="Güncelleniyor...">Güncelle</Button>
            ) : (
              <Button colorScheme="brand" onClick={handleAddProduct} isLoading={saving} loadingText="Ekleniyor...">Ürünü Ekle</Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
} 