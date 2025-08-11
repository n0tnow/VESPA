import React, { useState, useEffect } from 'react';
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
  MdWarehouse
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import Card from 'components/card/Card';
import MiniStatistics from 'components/card/MiniStatistics';
import apiService from 'services/apiService';

export default function StockManagement() {
  const navigate = useNavigate();
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
    image_file: null
  });
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);



  // Data loading functions
  const loadParts = async () => {
    try {
      setLoading(true);
      
      // Auto-update currency rates before loading parts to ensure accurate prices
      try {
        await apiService.makeRequest('/inventory/currency-rates/', 'POST');
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
        brand: part.brand,
        model: part.model,
        color: part.color,
        size: part.size,
        description: part.description,
        image_path: part.image_path,
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
      const response = await apiService.makeRequest('/inventory/storage-locations/');
      setLocations(response?.storage_locations || response || []);
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const loadCategories = async (partType = null) => {
    try {
      const url = partType ? `/inventory/categories/?type=${partType}` : '/inventory/categories/';
      const response = await apiService.makeRequest(url);
      setCategories(response?.categories || response || []);
    } catch (error) {
      console.error('Error loading categories:', error);
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
    loadParts();
    loadStorageLocations();
    loadCategories();
  }, []);

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

  const handleRowClick = async (part) => {
    setSelectedPart(part);
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
      
      if (newProduct.image_file) {
        formData.append('image', newProduct.image_file);
      }

      const response = await fetch('http://localhost:8000/api/inventory/parts/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Ürün ekleme başarısız');
      }

      const result = await response.json();
      
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
        image_file: null
      });

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
                loadCategories(newProduct.part_type);
                addProductModal.onOpen();
              }}
            >
              Yeni Ürün
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
                          src={part.image_path || '/placeholder-product.png'}
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
                <HStack align="start" spacing={4}>
                  <Box w="120px" h="120px" borderRadius="lg" overflow="hidden" bg="gray.100">
                    <Image
                      src={selectedPart.image_path || '/placeholder-product.png'}
                      alt={selectedPart.part_name}
                      w="100%"
                      h="100%"
                      objectFit="cover"
                    />
                  </Box>
                  <VStack align="start" flex={1} spacing={2}>
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
                </HStack>

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
                    
                    {selectedPart.currency_type !== 'TRY' ? (
                      <>
                        <Text color={primaryTextColor}>
                          Alış Fiyatı ({selectedPart.currency_type}): 
                          <Text as="span" fontWeight="bold" ml={2}>
                            {getCurrencySymbol(selectedPart.currency_type)}{selectedPart.purchase_price?.toLocaleString()}
                          </Text>
                        </Text>
                        <Text color={primaryTextColor}>
                          Alış Fiyatı (Alış Günü TRY): 
                          <Text as="span" fontWeight="bold" ml={2}>
                            ₺{selectedPart.purchase_price_try_at_purchase?.toLocaleString()}
                          </Text>
                        </Text>
                        <Text color={primaryTextColor}>
                          Satış Fiyatı ({selectedPart.currency_type}): 
                          <Text as="span" fontWeight="bold" ml={2}>
                            {getCurrencySymbol(selectedPart.currency_type)}{selectedPart.sale_price?.toLocaleString()}
                          </Text>
                        </Text>
                        <Text color={primaryTextColor}>
                          Satış Fiyatı (Güncel TRY): 
                          <Text as="span" fontWeight="bold" color="green.500" ml={2}>
                            ₺{selectedPart.sale_price_try_today?.toLocaleString()}
                          </Text>
                        </Text>
                        {selectedPart.effective_date && (
                          <Text fontSize="xs" color={secondaryTextColor}>
                            * Alış tarihi: {new Date(selectedPart.effective_date).toLocaleDateString('tr-TR')}
                          </Text>
                        )}
                        <Text fontSize="xs" color={secondaryTextColor}>
                          * Güncel kur: {selectedPart.currency_type === 'EUR' ? selectedPart.eur_try_today : selectedPart.usd_try_today} TRY
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text color={primaryTextColor}>
                          Alış Fiyatı: 
                          <Text as="span" fontWeight="bold" ml={2}>
                            ₺{selectedPart.purchase_price?.toLocaleString()}
                          </Text>
                        </Text>
                        <Text color={primaryTextColor}>
                          Satış Fiyatı: 
                          <Text as="span" fontWeight="bold" color="green.500" ml={2}>
                            ₺{selectedPart.sale_price?.toLocaleString()}
                          </Text>
                        </Text>
                      </>
                    )}
                    
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

      {/* Add Product Modal */}
      <Modal isOpen={addProductModal.isOpen} onClose={addProductModal.onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg={modalBg}>
          <ModalHeader color={modalHeaderColor}>
            <HStack>
              <Icon as={MdAdd} />
              <Text>Yeni Ürün Ekle</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Text color={secondaryTextColor} fontSize="sm">
                Sisteme yeni bir ürün veya parça ekleyin. Tüm alanları dikkatli bir şekilde doldurun.
              </Text>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel color={primaryTextColor}>Ürün Adı</FormLabel>
                  <Input 
                    placeholder="Örn: Vespa Kaskı" 
                    bg={inputBg}
                    color={primaryTextColor}
                    borderColor={borderColor}
                    _placeholder={{ color: placeholderColor }}
                    value={newProduct.part_name}
                    onChange={(e) => setNewProduct(prev => ({...prev, part_name: e.target.value}))}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel color={primaryTextColor}>Ürün Kodu</FormLabel>
                  <Input 
                    placeholder="Örn: VK-001" 
                    bg={inputBg}
                    color={primaryTextColor}
                    borderColor={borderColor}
                    _placeholder={{ color: placeholderColor }}
                    value={newProduct.part_code}
                    onChange={(e) => setNewProduct(prev => ({...prev, part_code: e.target.value}))}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel color={primaryTextColor}>
                    <HStack>
                      <Text>Ürün Tipi</Text>
                      <Badge colorScheme="blue" size="sm">Önce seçin</Badge>
                    </HStack>
                  </FormLabel>
                  <Select 
                    bg={inputBg}
                    color={primaryTextColor}
                    borderColor={borderColor}
                    value={newProduct.part_type}
                    onChange={(e) => {
                      const selectedType = e.target.value;
                      setNewProduct(prev => ({
                        ...prev, 
                        part_type: selectedType,
                        category_id: ''
                      }));
                      loadCategories(selectedType);
                    }}
                  >
                    <option value="PART" style={{ backgroundColor: selectOptionBg, color: selectOptionColor }}>Yedek Parça</option>
                    <option value="ACCESSORY" style={{ backgroundColor: selectOptionBg, color: selectOptionColor }}>Aksesuar</option>
                  </Select>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel color={primaryTextColor}>
                    <HStack>
                      <Text>Kategori</Text>
                      {!newProduct.part_type && (
                        <Badge colorScheme="orange" size="sm">Tip seçin</Badge>
                      )}
                    </HStack>
                  </FormLabel>
                  <Select 
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
                    value={newProduct.category_id}
                    onChange={(e) => setNewProduct(prev => ({...prev, category_id: e.target.value}))}
                    isDisabled={!newProduct.part_type || categories.length === 0}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id} style={{ backgroundColor: selectOptionBg, color: selectOptionColor }}>
                        {cat.category_name}
                      </option>
                    ))}
                  </Select>
                  {newProduct.part_type && categories.length > 0 && (
                    <Text fontSize="xs" color="green.500" mt={1}>
                      ✅ {newProduct.part_type === 'ACCESSORY' ? 'Aksesuar' : 'Yedek Parça'} kategorileri gösteriliyor
                    </Text>
                  )}
                </FormControl>
                
                <FormControl>
                  <FormLabel color={primaryTextColor}>Marka</FormLabel>
                  <Input 
                    placeholder="Örn: Vespa" 
                    bg={inputBg}
                    color={primaryTextColor}
                    borderColor={borderColor}
                    _placeholder={{ color: placeholderColor }}
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct(prev => ({...prev, brand: e.target.value}))}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel color={primaryTextColor}>Model</FormLabel>
                  <Input 
                    placeholder="Örn: Primavera" 
                    bg={inputBg}
                    color={primaryTextColor}
                    borderColor={borderColor}
                    _placeholder={{ color: placeholderColor }}
                    value={newProduct.model}
                    onChange={(e) => setNewProduct(prev => ({...prev, model: e.target.value}))}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel color={primaryTextColor}>Renk</FormLabel>
                  <Input 
                    placeholder="Örn: Siyah" 
                    bg={inputBg}
                    color={primaryTextColor}
                    borderColor={borderColor}
                    _placeholder={{ color: placeholderColor }}
                    value={newProduct.color}
                    onChange={(e) => setNewProduct(prev => ({...prev, color: e.target.value}))}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel color={primaryTextColor}>Beden/Boyut</FormLabel>
                  <Input 
                    placeholder="Örn: L, XL, 42" 
                    bg={inputBg}
                    color={primaryTextColor}
                    borderColor={borderColor}
                    _placeholder={{ color: placeholderColor }}
                    value={newProduct.size}
                    onChange={(e) => setNewProduct(prev => ({...prev, size: e.target.value}))}
                  />
                </FormControl>
              </SimpleGrid>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel color={primaryTextColor}>Min Stok Seviyesi</FormLabel>
                  <NumberInput 
                    min={1} 
                    value={newProduct.min_stock_level}
                    onChange={(value) => setNewProduct(prev => ({...prev, min_stock_level: parseInt(value) || 5}))}
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
                    value={newProduct.max_stock_level}
                    onChange={(value) => setNewProduct(prev => ({...prev, max_stock_level: parseInt(value) || 100}))}
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
                <FormLabel color={primaryTextColor}>Ürün Görseli</FormLabel>
                <Input 
                  type="file" 
                  accept="image/*"
                  bg={inputBg}
                  color={primaryTextColor}
                  borderColor={borderColor}
                  onChange={(e) => setNewProduct(prev => ({...prev, image_file: e.target.files[0]}))}
                />
                <Text fontSize="xs" color={secondaryTextColor} mt={1}>
                  JPG, PNG veya WebP formatında görsel yükleyebilirsiniz
                </Text>
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
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({...prev, description: e.target.value}))}
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
            <Button
              colorScheme="brand"
              onClick={handleAddProduct}
              isLoading={saving}
              loadingText="Ekleniyor..."
            >
              Ürünü Ekle
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
} 