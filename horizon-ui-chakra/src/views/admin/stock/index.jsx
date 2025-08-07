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
  MdLocalShipping
} from 'react-icons/md';
import Card from 'components/card/Card';
import MiniStatistics from 'components/card/MiniStatistics';
import apiService from 'services/apiService';

export default function StockManagement() {
  const brandColor = useColorModeValue('brand.500', 'white');
  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  // Color definitions for all components
  const modalBg = useColorModeValue('white', 'gray.800');
  const modalCloseColor = useColorModeValue('black', 'white');
  const itemBoxBg = useColorModeValue('white', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.800');
  const modalHeaderColor = useColorModeValue('brand.600', 'brand.200');
  const modalTextColor = useColorModeValue('gray.800', 'gray.100');
  const inputBg = useColorModeValue('gray.50', 'gray.700');
  const inputTextColor = useColorModeValue('gray.800', 'gray.100');
  const inputBorderColor = useColorModeValue('gray.200', 'gray.600');
  const buttonBg = useColorModeValue('brand.500', 'brand.400');
  
  // Additional dark mode fixes
  const cancelButtonHoverBg = useColorModeValue('gray.100', 'gray.700');
  const optionTextColor = useColorModeValue('black', 'white');
  const selectBg = useColorModeValue('white', 'gray.700');
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeTab, setActiveTab] = useState(0);
  const [zoomImage, setZoomImage] = useState(null);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const buttonTextColor = useColorModeValue('white', 'gray.900');
  const buttonHoverBg = useColorModeValue('brand.600', 'brand.300');



  // State management for real API data
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load parts from API
  useEffect(() => {
    loadParts();
  }, []);

  const loadParts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getParts(1, 200); // Load first 200 parts
      
      // Transform API response to match frontend format
      const partsRaw = response?.parts || response?.results || response || [];
      const transformedParts = partsRaw.map(part => ({
        id: part.id,
        name: part.part_name,
        category: part.category_name || '-',
        partNumber: part.part_code,
        currentStock: part.total_stock || 0,
        minStock: part.min_stock_level || 5,
        maxStock: part.max_stock_level || 100,
        price: part.sale_price_tl || part.sale_price || 0,
        supplier: part.supplier_name || '-',
        lastUpdated: part.updated_date?.split('T')[0] || '',
        status: part.stock_status?.toLowerCase() || 'normal',
        image: part.image_path || '',
        brand: part.brand || '',
        model: part.model || '',
        color: part.color || '',
        size: part.size || '',
        description: part.description || '',
        currency: part.currency_type || 'TRY'
      })) || [];
      
      setStockItems(transformedParts);
    } catch (error) {
      console.error('Error loading parts:', error);
      setError('Parçalar yüklenirken hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const [suppliers, setSuppliers] = useState([]);

  // Load suppliers from API
  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const response = await apiService.getSuppliers();
      const suppliersRaw = response?.suppliers || response || [];
      const transformedSuppliers = suppliersRaw.map(supplier => ({
        id: supplier.id,
        name: supplier.supplier_name,
        contact: supplier.email || '-',
        phone: supplier.phone || '-',
        address: supplier.address || '-',
        rating: 5 // Default rating, can be enhanced later
      }));
      setSuppliers(transformedSuppliers);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    partNumber: '',
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    price: 0,
    supplier: '',
    notes: ''
  });

  const categories = [
    'Motor', 'Fren Sistemi', 'Lastik', 'Süspansiyon', 'Transmisyon', 
    'Elektrik', 'Gövde', 'Aksesuar', 'Bakım'
  ];

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.partNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = stockItems.filter(item => item.currentStock <= item.minStock);
  const criticalStockItems = stockItems.filter(item => item.currentStock < item.minStock * 0.5);

  const handleAddItem = () => {
    setSelectedItem(null);
    setFormData({
      name: '',
      category: '',
      partNumber: '',
      currentStock: 0,
      minStock: 0,
      maxStock: 0,
      price: 0,
      supplier: '',
      notes: ''
    });
    onOpen();
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      partNumber: item.partNumber,
      currentStock: item.currentStock,
      minStock: item.minStock,
      maxStock: item.maxStock,
      price: item.price,
      supplier: item.supplier,
      notes: item.notes || ''
    });
    onOpen();
  };

  const handleSaveItem = () => {
    const updatedItem = {
      ...formData,
      lastUpdated: new Date().toISOString().split('T')[0],
      status: getStockStatus(formData.currentStock, formData.minStock)
    };

    if (selectedItem) {
      setStockItems(stockItems.map(item =>
        item.id === selectedItem.id
          ? { ...item, ...updatedItem }
          : item
      ));
    } else {
      const newItem = {
        ...updatedItem,
        id: Date.now()
      };
      setStockItems([...stockItems, newItem]);
    }
    onClose();
  };

  const handleDeleteItem = (itemId) => {
    setStockItems(stockItems.filter(item => item.id !== itemId));
  };

  const getStockStatus = (current, min) => {
    if (current < min * 0.5) return 'critical';
    if (current <= min) return 'low';
    return 'normal';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return 'green';
      case 'low': return 'yellow';
      case 'critical': return 'red';
      default: return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'normal': return 'Normal';
      case 'low': return 'Düşük';
      case 'critical': return 'Kritik';
      default: return 'Bilinmiyor';
    }
  };

  const calculateStockValue = () => {
    return stockItems.reduce((total, item) => total + (item.currentStock * item.price), 0);
  };

  const getStockPercentage = (current, max) => {
    return max > 0 ? (current / max) * 100 : 0;
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Statistics Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="20px" mb="20px">
        <MiniStatistics
          startContent={
            <Icon as={MdInventory} w="56px" h="56px" bg={boxBg} borderRadius="16px" p="12px" />
          }
          name="Toplam Ürün"
          value={stockItems.length.toString()}
        />
        <MiniStatistics
          startContent={
            <Icon as={MdWarning} w="56px" h="56px" bg={boxBg} borderRadius="16px" p="12px" />
          }
          name="Düşük Stok"
          value={lowStockItems.length.toString()}
        />
        <MiniStatistics
          startContent={
            <Icon as={MdStore} w="56px" h="56px" bg={boxBg} borderRadius="16px" p="12px" />
          }
          name="Stok Değeri"
          value={`₺${calculateStockValue().toLocaleString()}`}
        />
        <MiniStatistics
          startContent={
            <Icon as={MdLocalShipping} w="56px" h="56px" bg={boxBg} borderRadius="16px" p="12px" />
          }
          name="Tedarikçi"
          value={suppliers.length.toString()}
        />
      </SimpleGrid>

      {/* Critical Stock Alert */}
      {criticalStockItems.length > 0 && (
        <Alert status="error" mb="20px" borderRadius="12px">
          <AlertIcon />
          <Box>
            <AlertTitle>Kritik Stok Durumu!</AlertTitle>
            <AlertDescription>
              {criticalStockItems.length} ürünün stoğu kritik seviyede. Acil tedarik gerekiyor.
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Alert status="warning" mb="20px" borderRadius="12px">
          <AlertIcon />
          <Box>
            <AlertTitle>Düşük Stok Uyarısı!</AlertTitle>
            <AlertDescription>
              {lowStockItems.length} ürünün stoğu minimum seviyede veya altında.
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {/* Main Content */}
      <Card>
        <Tabs index={activeTab} onChange={setActiveTab}>
          <TabList>
            <Tab>Stok Yönetimi</Tab>
            <Tab>Tedarikçiler</Tab>
            <Tab>Stok Analizi</Tab>
          </TabList>

          <TabPanels>
            {/* Stock Management Tab */}
            <TabPanel>
              <Flex justify="space-between" align="center" mb="20px">
                <Text fontSize="2xl" fontWeight="bold" color={brandColor}>
                  Stok Yönetimi
                </Text>
                <Button
                  leftIcon={<MdAdd />}
                  colorScheme="brand"
                  onClick={handleAddItem}
                >
                  Yeni Ürün Ekle
                </Button>
              </Flex>

              {/* Search and Filter */}
              <Stack direction={{ base: 'column', md: 'row' }} spacing={4} mb="20px">
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={MdSearch} color="gray.300" />
                  </InputLeftElement>
                  <Input
                    placeholder="Ürün ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    bg={inputBg}
                    color={inputTextColor}
                    borderColor={inputBorderColor}
                  />
                </InputGroup>
                <Select
                  placeholder="Kategori filtresi"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  w={{ base: '100%', md: '200px' }}
                  bg={inputBg}
                  color={inputTextColor}
                  borderColor={inputBorderColor}
                >
                  <option value="all" style={{ backgroundColor: selectBg, color: optionTextColor }}>Tümü</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat} style={{ backgroundColor: selectBg, color: optionTextColor }}>{cat}</option>
                  ))}
                </Select>
              </Stack>

              {/* Error State */}
              {error && (
                <Alert status="error" mb="20px" borderRadius="12px">
                  <AlertIcon />
                  <AlertTitle>Hata!</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Loading State */}
              {loading ? (
                <Box textAlign="center" py="40px">
                  <Text>Parçalar yükleniyor...</Text>
                </Box>
              ) : (
              /* Stock Table */
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Görsel</Th>
                      <Th>ÜRÜN ADI</Th>
                      <Th>Kategori</Th>
                      <Th>Parça No</Th>
                      <Th>Mevcut Stok</Th>
                      <Th>Min/Max</Th>
                      <Th>Fiyat</Th>
                      <Th>Tedarikçi</Th>
                      <Th>Durum</Th>
                      <Th>İşlemler</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredItems.map((item) => (
                      <Tr key={item.id}>
                        <Td>
                          <Box
                            bg={itemBoxBg}
                            borderRadius="md"
                            boxShadow="md"
                            p="1"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            w="48px"
                            h="48px"
                            cursor="pointer"
                            onClick={() => {
                              if (item.image) {
                                setZoomImage(item.image);
                                setIsZoomOpen(true);
                              }
                            }}
                          >
                            <Image
                              src={item.image || 'https://via.placeholder.com/40x40?text=No+Image'}
                              alt={item.name}
                              boxSize="40px"
                              objectFit="contain"
                              borderRadius="md"
                              fallbackSrc="https://via.placeholder.com/40x40?text=No+Image"
                            />
                          </Box>
                        </Td>
                        <Td>{item.name}</Td>
                        <Td>{item.category}</Td>
                        <Td>{item.partNumber}</Td>
                        <Td>
                          <Box>
                            <Text fontWeight="bold">{item.currentStock}</Text>
                            <Progress
                              value={getStockPercentage(item.currentStock, item.maxStock)}
                              colorScheme={getStatusColor(item.status)}
                              size="sm"
                              w="60px"
                            />
                          </Box>
                        </Td>
                        <Td>{item.minStock} / {item.maxStock}</Td>
                        <Td>₺{item.price.toLocaleString()}</Td>
                        <Td>{item.supplier}</Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(item.status)}>
                            {getStatusText(item.status)}
                          </Badge>
                        </Td>
                        <Td>
                          <Stack direction="row" spacing={1}>
                            <IconButton
                              icon={<MdEdit />}
                              size="sm"
                              colorScheme="blue"
                              onClick={() => handleEditItem(item)}
                            />
                            <IconButton
                              icon={<MdDelete />}
                              size="sm"
                              colorScheme="red"
                              onClick={() => handleDeleteItem(item.id)}
                            />
                          </Stack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
              )}

              {!loading && filteredItems.length === 0 && (
                <Box textAlign="center" py="40px">
                  <Text fontSize="lg" color="gray.500">
                    {searchTerm || filterCategory !== 'all' 
                      ? 'Arama kriterlerinize uygun ürün bulunamadı.'
                      : 'Henüz ürün eklenmemiş.'
                    }
                  </Text>
                </Box>
              )}
            </TabPanel>

            {/* Suppliers Tab */}
            <TabPanel>
              <Text fontSize="2xl" fontWeight="bold" color={brandColor} mb="20px">
                Tedarikçiler
              </Text>
              
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Tedarikçi Adı</Th>
                      <Th>İletişim</Th>
                      <Th>Telefon</Th>
                      <Th>Adres</Th>
                      <Th>Değerlendirme</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {suppliers.map((supplier) => (
                      <Tr key={supplier.id}>
                        <Td fontWeight="bold">{supplier.name}</Td>
                        <Td>{supplier.contact}</Td>
                        <Td>{supplier.phone}</Td>
                        <Td>{supplier.address}</Td>
                        <Td>
                          <Badge colorScheme={supplier.rating >= 4 ? 'green' : 'yellow'}>
                            {supplier.rating}/5
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </TabPanel>

            {/* Stock Analysis Tab */}
            <TabPanel>
              <Text fontSize="2xl" fontWeight="bold" color={brandColor} mb="20px">
                Stok Analizi
              </Text>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} gap="20px">
                <Card>
                  <Text fontSize="lg" fontWeight="bold" mb="10px">Kategori Bazlı Stok Dağılımı</Text>
                  {categories.map(category => {
                    const categoryItems = stockItems.filter(item => item.category === category);
                    const categoryValue = categoryItems.reduce((sum, item) => sum + (item.currentStock * item.price), 0);
                    const totalValue = calculateStockValue();
                    const percentage = totalValue > 0 ? (categoryValue / totalValue) * 100 : 0;
                    
                    return (
                      <Box key={category} mb="10px">
                        <Flex justify="space-between" mb="5px">
                          <Text fontSize="sm">{category}</Text>
                          <Text fontSize="sm">₺{categoryValue.toLocaleString()}</Text>
                        </Flex>
                        <Progress value={percentage} colorScheme="brand" size="sm" />
                      </Box>
                    );
                  })}
                </Card>

                <Card>
                  <Text fontSize="lg" fontWeight="bold" mb="10px">Stok Durumu Özeti</Text>
                  <Stack spacing={4}>
                    <Box>
                      <Flex justify="space-between">
                        <Text>Normal Stok</Text>
                        <Text fontWeight="bold" color="green.500">
                          {stockItems.filter(item => item.status === 'normal').length}
                        </Text>
                      </Flex>
                    </Box>
                    <Box>
                      <Flex justify="space-between">
                        <Text>Düşük Stok</Text>
                        <Text fontWeight="bold" color="yellow.500">
                          {stockItems.filter(item => item.status === 'low').length}
                        </Text>
                      </Flex>
                    </Box>
                    <Box>
                      <Flex justify="space-between">
                        <Text>Kritik Stok</Text>
                        <Text fontWeight="bold" color="red.500">
                          {stockItems.filter(item => item.status === 'critical').length}
                        </Text>
                      </Flex>
                    </Box>
                    <Box>
                      <Flex justify="space-between">
                        <Text>Toplam Stok Değeri</Text>
                        <Text fontWeight="bold" color={brandColor}>
                          ₺{calculateStockValue().toLocaleString()}
                        </Text>
                      </Flex>
                    </Box>
                  </Stack>
                </Card>
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>

      {/* Add/Edit Item Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent bg={modalBg} color={modalTextColor} borderRadius="2xl" boxShadow="2xl">
          <ModalHeader color={modalHeaderColor} fontWeight="bold">
            {selectedItem ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
          </ModalHeader>
          <ModalCloseButton color={modalTextColor} />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel color={modalTextColor}>Ürün Adı</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ürün adını girin"
                  bg={inputBg}
                  color={inputTextColor}
                  borderColor={inputBorderColor}
                  _placeholder={{ color: 'gray.400' }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color={modalTextColor}>Kategori</FormLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="Kategori seçin"
                  bg={inputBg}
                  color={inputTextColor}
                  borderColor={inputBorderColor}
                  _placeholder={{ color: 'gray.400' }}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat} style={{ backgroundColor: selectBg, color: optionTextColor }}>{cat}</option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel color={modalTextColor}>Parça Numarası</FormLabel>
                <Input
                  value={formData.partNumber}
                  onChange={(e) => setFormData({...formData, partNumber: e.target.value})}
                  placeholder="Parça numarasını girin"
                  bg={inputBg}
                  color={inputTextColor}
                  borderColor={inputBorderColor}
                  _placeholder={{ color: 'gray.400' }}
                />
              </FormControl>

              <Stack direction="row" spacing={4}>
                <FormControl isRequired>
                  <FormLabel color={modalTextColor}>Mevcut Stok</FormLabel>
                  <NumberInput
                    value={formData.currentStock}
                    onChange={(value) => setFormData({...formData, currentStock: parseInt(value) || 0})}
                    min={0}
                  >
                    <NumberInputField bg={inputBg} color={inputTextColor} borderColor={inputBorderColor} _placeholder={{ color: 'gray.400' }} />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color={modalTextColor}>Min Stok</FormLabel>
                  <NumberInput
                    value={formData.minStock}
                    onChange={(value) => setFormData({...formData, minStock: parseInt(value) || 0})}
                    min={0}
                  >
                    <NumberInputField bg={inputBg} color={inputTextColor} borderColor={inputBorderColor} _placeholder={{ color: 'gray.400' }} />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </Stack>

              <Stack direction="row" spacing={4}>
                <FormControl isRequired>
                  <FormLabel color={modalTextColor}>Max Stok</FormLabel>
                  <NumberInput
                    value={formData.maxStock}
                    onChange={(value) => setFormData({...formData, maxStock: parseInt(value) || 0})}
                    min={0}
                  >
                    <NumberInputField bg={inputBg} color={inputTextColor} borderColor={inputBorderColor} _placeholder={{ color: 'gray.400' }} />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color={modalTextColor}>Fiyat (₺)</FormLabel>
                  <NumberInput
                    value={formData.price}
                    onChange={(value) => setFormData({...formData, price: parseFloat(value) || 0})}
                    min={0}
                  >
                    <NumberInputField bg={inputBg} color={inputTextColor} borderColor={inputBorderColor} _placeholder={{ color: 'gray.400' }} />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </Stack>

              <FormControl isRequired>
                <FormLabel color={modalTextColor}>Tedarikçi</FormLabel>
                <Select
                  value={formData.supplier}
                  onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                  placeholder="Tedarikçi seçin"
                  bg={inputBg}
                  color={inputTextColor}
                  borderColor={inputBorderColor}
                  _placeholder={{ color: 'gray.400' }}
                >
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.name} style={{ backgroundColor: selectBg, color: optionTextColor }}>{supplier.name}</option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel color={modalTextColor}>Notlar</FormLabel>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Ürün hakkında notlar"
                  rows={3}
                  bg={inputBg}
                  color={inputTextColor}
                  borderColor={inputBorderColor}
                  _placeholder={{ color: 'gray.400' }}
                />
              </FormControl>
            </Stack>
          </ModalBody>

          <ModalFooter bg={modalBg} borderBottomRadius="2xl">
            <Button variant="ghost" mr={3} onClick={onClose} color={buttonTextColor} bg="transparent" _hover={{ bg: cancelButtonHoverBg }}>
              İptal
            </Button>
            <Button
              bg={buttonBg}
              color={buttonTextColor}
              _hover={{ bg: buttonHoverBg }}
              onClick={handleSaveItem}
              fontWeight="bold"
              px={6}
              borderRadius="lg"
            >
              {selectedItem ? 'Güncelle' : 'Ekle'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Zoom Image Modal */}
      <Modal isOpen={isZoomOpen} onClose={() => setIsZoomOpen(false)} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent bg={modalBg} borderRadius="lg" boxShadow="2xl">
          <ModalCloseButton color={modalCloseColor} />
          <ModalBody p={0} display="flex" alignItems="center" justifyContent="center">
            <Image
              src={zoomImage}
              alt="Büyük Ürün Görseli"
              w="100%"
              maxH="70vh"
              objectFit="contain"
              borderRadius="lg"
              bg={cardBg}
              fallbackSrc="https://via.placeholder.com/400x400?text=No+Image"
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
} 