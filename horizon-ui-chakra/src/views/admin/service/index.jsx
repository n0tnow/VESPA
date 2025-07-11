import React, { useState } from 'react';
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
  Checkbox,
  CheckboxGroup,
  VStack,
  HStack,
  Divider,
  Heading,
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
  MdClose
} from 'react-icons/md';
import Card from 'components/card/Card';
import MiniStatistics from 'components/card/MiniStatistics';

export default function ServiceTracking() {
  const brandColor = useColorModeValue('brand.500', 'white');
  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  const cardBg = useColorModeValue('white', 'gray.700');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedService, setSelectedService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState(0);

  // MotoEtiler servis kayıtları
  const [serviceRecords, setServiceRecords] = useState([
    {
      id: 1,
      customerId: 1,
      customerName: 'Ahmet Yılmaz',
      vespaModel: 'Vespa Primavera 150',
      plateNumber: '34 ABC 123',
      serviceDate: '2024-01-15',
      serviceType: 'Rutin Bakım',
      technician: 'Mehmet Usta (MotoEtiler)',
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
      technician: 'Ali Teknisyen (MotoEtiler)',
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
      technician: 'Hasan Usta (MotoEtiler)',
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
  ]);

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

  const [technicians] = useState([
    'Mehmet Usta (MotoEtiler)',
    'Ali Teknisyen (MotoEtiler)',
    'Hasan Usta (MotoEtiler)',
    'Fatma Teknisyen (MotoEtiler)',
    'Emre Usta (MotoEtiler)'
  ]);

  const [availableParts] = useState([
    { name: 'Motor Yağı 10W-40', price: 75 },
    { name: 'Yağ Filtresi', price: 45 },
    { name: 'Fren Balata Seti', price: 130 },
    { name: 'Amortisör Takımı', price: 400 },
    { name: 'Akü 12V', price: 170 },
    { name: 'Lastik Seti', price: 300 },
    { name: 'Spark Plug', price: 25 },
    { name: 'Hava Filtresi', price: 35 }
  ]);

  // Müşteri verileri
  const [customers] = useState([
    {
      id: 1,
      name: 'Ahmet Yılmaz',
      email: 'ahmet@email.com',
      phone: '+90 532 123 45 67',
      vespaModel: 'Vespa Primavera 150',
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
      vespaModel: 'Vespa Sprint 150',
      plateNumber: '35 GHI 789'
    }
  ]);

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
    technician: '',
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
    setSelectedService(null);
    setSelectedCustomer(null);
    setCustomerServiceHistory([]);
    setWorkItems([]);
    setFormData({
      customerId: '',
      customerName: '',
      vespaModel: '',
      plateNumber: '',
      serviceDate: '',
      serviceType: '',
      technician: '',
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
      technician: service.technician,
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

  const handleDeleteService = (serviceId) => {
    setServiceRecords(serviceRecords.filter(service => service.id !== serviceId));
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

  const handlePartSelection = (partName, isSelected) => {
    const part = availableParts.find(p => p.name === partName);
    if (isSelected) {
      setSelectedParts([...selectedParts, { ...part, quantity: 1, selected: true, cost: part.price }]);
    } else {
      setSelectedParts(selectedParts.filter(p => p.name !== partName));
    }
  };

  const updatePartQuantity = (partName, quantity) => {
    setSelectedParts(selectedParts.map(part => 
      part.name === partName 
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

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb="20px">
        <Text fontSize="2xl" fontWeight="bold" color={brandColor}>
          MotoEtiler Servis Yönetimi
        </Text>
        <Button
          leftIcon={<MdAttachMoney />}
          colorScheme="green"
          onClick={() => setIsPriceListOpen(true)}
        >
          Fiyat Listesi
        </Button>
      </Flex>

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
          <Box>
            <AlertTitle>Bekleyen Servisler</AlertTitle>
            <AlertDescription>
              {getPendingServices()} servis işlemi beklemede. Teknisyen ataması yapılması gerekiyor.
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {/* Main Content */}
      <Card>
        <Tabs index={activeTab} onChange={setActiveTab}>
          <TabList>
            <Tab>Servis Kayıtları</Tab>
            <Tab>Teknisyen Performansı</Tab>
            <Tab>Servis Analizi</Tab>
          </TabList>

          <TabPanels>
            {/* Service Records Tab */}
            <TabPanel>
              <Flex justify="space-between" align="center" mb="20px">
                <Text fontSize="2xl" fontWeight="bold" color={brandColor}>
                  Servis Takibi
                </Text>
                <Button
                  leftIcon={<MdAdd />}
                  colorScheme="brand"
                  onClick={handleAddService}
                >
                  Yeni Servis Ekle
                </Button>
              </Flex>

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
                  />
                </InputGroup>
                <Select
                  placeholder="Durum filtresi"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  w={{ base: '100%', md: '200px' }}
                >
                  <option value="all">Tümü</option>
                  <option value="pending">Beklemede</option>
                  <option value="in_progress">Devam Ediyor</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="cancelled">İptal Edildi</option>
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
                      <Th>Teknisyen</Th>
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
                          <Box>
                            <Text fontWeight="bold">{service.customerName}</Text>
                            <Text fontSize="sm" color="gray.500">
                              {service.plateNumber}
                            </Text>
                          </Box>
                        </Td>
                        <Td>
                          <Box>
                            <Text>{service.vespaModel}</Text>
                            <Text fontSize="sm" color="gray.500">
                              {service.mileage} km
                            </Text>
                          </Box>
                        </Td>
                        <Td>{service.serviceType}</Td>
                        <Td>{service.technician}</Td>
                        <Td>{service.serviceDate}</Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(service.status)}>
                            {getStatusText(service.status)}
                          </Badge>
                        </Td>
                        <Td>₺{service.totalCost.toLocaleString()}</Td>
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
                              onClick={() => handleDeleteService(service.id)}
                            />
                          </Stack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>

              {filteredServices.length === 0 && (
                <Box textAlign="center" py="40px">
                  <Text fontSize="lg" color="gray.500">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Arama kriterlerinize uygun servis bulunamadı.'
                      : 'Henüz servis kaydı eklenmemiş.'
                    }
                  </Text>
                </Box>
              )}
            </TabPanel>

            {/* Technician Performance Tab */}
            <TabPanel>
              <Text fontSize="2xl" fontWeight="bold" color={brandColor} mb="20px">
                Teknisyen Performansı
              </Text>
              
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="20px">
                {technicians.map(technician => {
                  const techServices = serviceRecords.filter(service => service.technician === technician);
                  const completedServices = techServices.filter(service => service.status === 'completed');
                  const totalRevenue = completedServices.reduce((sum, service) => sum + service.totalCost, 0);
                  
                  return (
                    <Card key={technician}>
                      <Box p="6">
                        <Heading size="md" mb="4">{technician}</Heading>
                        <Stack spacing={2}>
                          <HStack justify="space-between">
                            <Text>Toplam Servis:</Text>
                            <Text fontWeight="bold">{techServices.length}</Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text>Tamamlanan:</Text>
                            <Text fontWeight="bold" color="green.500">{completedServices.length}</Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text>Toplam Gelir:</Text>
                            <Text fontWeight="bold" color={brandColor}>₺{totalRevenue.toLocaleString()}</Text>
                          </HStack>
                        </Stack>
                      </Box>
                    </Card>
                  );
                })}
              </SimpleGrid>
            </TabPanel>

            {/* Service Analysis Tab */}
            <TabPanel>
              <Text fontSize="2xl" fontWeight="bold" color={brandColor} mb="20px">
                Servis Analizi
              </Text>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} gap="20px">
                <Card>
                  <Text fontSize="lg" fontWeight="bold" mb="10px">Servis Türü Dağılımı</Text>
                  {serviceTypes.map(type => {
                    const typeServices = serviceRecords.filter(service => service.serviceType === type);
                    const typeRevenue = typeServices.reduce((sum, service) => sum + service.totalCost, 0);
                    const totalRevenue = calculateTotalRevenue();
                    const percentage = totalRevenue > 0 ? (typeRevenue / totalRevenue) * 100 : 0;
                    
                    return (
                      <Box key={type} mb="10px">
                        <Flex justify="space-between" mb="5px">
                          <Text fontSize="sm">{type}</Text>
                          <Text fontSize="sm">₺{typeRevenue.toLocaleString()}</Text>
                        </Flex>
                        <Box bg="gray.200" borderRadius="md" h="8px">
                          <Box 
                            bg={brandColor} 
                            h="100%" 
                            borderRadius="md" 
                            width={`${percentage}%`}
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </Card>

                <Card>
                  <Text fontSize="lg" fontWeight="bold" mb="10px">Servis Durumu Özeti</Text>
                  <Stack spacing={4}>
                    <Box>
                      <Flex justify="space-between">
                        <Text>Bekleyen Servisler</Text>
                        <Text fontWeight="bold" color="yellow.500">
                          {getPendingServices()}
                        </Text>
                      </Flex>
                    </Box>
                    <Box>
                      <Flex justify="space-between">
                        <Text>Devam Eden Servisler</Text>
                        <Text fontWeight="bold" color="blue.500">
                          {getInProgressServices()}
                        </Text>
                      </Flex>
                    </Box>
                    <Box>
                      <Flex justify="space-between">
                        <Text>Tamamlanan Servisler</Text>
                        <Text fontWeight="bold" color="green.500">
                          {getCompletedServices()}
                        </Text>
                      </Flex>
                    </Box>
                    <Divider />
                    <Box>
                      <Flex justify="space-between">
                        <Text>Toplam Gelir</Text>
                        <Text fontWeight="bold" color={brandColor}>
                          ₺{calculateTotalRevenue().toLocaleString()}
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

      {/* Add/Edit Service Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedService ? 'Servis Düzenle' : 'Yeni Servis Ekle'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              {/* Müşteri Seçimi */}
              <FormControl isRequired>
                <FormLabel>Müşteri Seçimi</FormLabel>
                <Select
                  value={formData.customerId}
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                  placeholder="Müşteri seçin"
                >
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.vespaModel} ({customer.plateNumber})
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Müşteri Bilgileri */}
              {selectedCustomer && (
                <Box p="4" bg="blue.50" borderRadius="md">
                  <Text fontWeight="bold" mb="2">Müşteri Bilgileri:</Text>
                  <Stack spacing={1}>
                    <Text><strong>Ad:</strong> {selectedCustomer.name}</Text>
                    <Text><strong>Telefon:</strong> {selectedCustomer.phone}</Text>
                    <Text><strong>Model:</strong> {selectedCustomer.vespaModel}</Text>
                    <Text><strong>Plaka:</strong> {selectedCustomer.plateNumber}</Text>
                  </Stack>
                </Box>
              )}

              {/* Müşteri Servis Geçmişi */}
              {customerServiceHistory.length > 0 && (
                <Box p="4" bg="gray.50" borderRadius="md">
                  <Text fontWeight="bold" mb="2">Servis Geçmişi:</Text>
                  <Stack spacing={2}>
                    {customerServiceHistory.slice(-3).map(service => (
                      <Box key={service.id} p="2" bg="white" borderRadius="md">
                        <Text fontSize="sm">
                          <strong>{service.serviceDate}</strong> - {service.serviceType} - {service.technician}
                        </Text>
                        <Text fontSize="xs" color="gray.600">{service.description}</Text>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              <Stack direction="row" spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Kilometre</FormLabel>
                  <NumberInput
                    value={formData.mileage}
                    onChange={(value) => setFormData({...formData, mileage: parseInt(value) || 0})}
                    min={0}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Servis Tarihi</FormLabel>
                  <Input
                    type="date"
                    value={formData.serviceDate}
                    onChange={(e) => setFormData({...formData, serviceDate: e.target.value})}
                  />
                </FormControl>
              </Stack>

              <Stack direction="row" spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Servis Türü</FormLabel>
                  <Select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                    placeholder="Servis türü seçin"
                  >
                    {serviceTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Teknisyen</FormLabel>
                  <Select
                    value={formData.technician}
                    onChange={(e) => setFormData({...formData, technician: e.target.value})}
                    placeholder="Teknisyen seçin"
                  >
                    {technicians.map(tech => (
                      <option key={tech} value={tech}>{tech}</option>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              {/* Yapılacak İşlemler */}
              <FormControl>
                <FormLabel>Yapılacak İşlemler</FormLabel>
                <Box border="1px" borderColor="gray.200" p="4" borderRadius="md">
                  <Text fontSize="sm" mb="3" color="gray.600">
                    Yapılacak işlemleri seçin:
                  </Text>
                  <SimpleGrid columns={2} spacing={2}>
                    {workTypes.map(workType => (
                      <Button
                        key={workType.name}
                        size="sm"
                        variant={workItems.find(item => item.name === workType.name) ? "solid" : "outline"}
                        colorScheme={workItems.find(item => item.name === workType.name) ? "green" : "gray"}
                        onClick={() => {
                          const exists = workItems.find(item => item.name === workType.name);
                          if (exists) {
                            handleWorkItemRemove(workType.name);
                          } else {
                            handleWorkItemAdd(workType);
                          }
                        }}
                      >
                        {workType.name} - ₺{workType.basePrice}
                      </Button>
                    ))}
                  </SimpleGrid>
                </Box>
              </FormControl>

              {/* Seçilen İşlemler */}
              {workItems.length > 0 && (
                <Box p="4" bg="green.50" borderRadius="md">
                  <Text fontWeight="bold" mb="2">Seçilen İşlemler:</Text>
                  <Stack spacing={2}>
                    {workItems.map(item => (
                      <HStack key={item.name} justify="space-between">
                        <Text>{item.name}</Text>
                        <HStack>
                          <NumberInput
                            size="sm"
                            w="80px"
                            value={item.quantity}
                            onChange={(value) => handleWorkItemQuantityChange(item.name, parseInt(value) || 1)}
                            min={1}
                          >
                            <NumberInputField />
                          </NumberInput>
                          <Text>₺{(item.basePrice * item.quantity).toLocaleString()}</Text>
                          <IconButton
                            size="sm"
                            icon={<MdDelete />}
                            colorScheme="red"
                            variant="outline"
                            onClick={() => handleWorkItemRemove(item.name)}
                          />
                        </HStack>
                      </HStack>
                    ))}
                  </Stack>
                </Box>
              )}

              <FormControl>
                <FormLabel>Durum</FormLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="pending">Beklemede</option>
                  <option value="in_progress">Devam Ediyor</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="cancelled">İptal Edildi</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Açıklama</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Servis detayları"
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <FormLabel>İşçilik Ücreti (₺)</FormLabel>
                <NumberInput
                  value={formData.laborCost}
                  onChange={(value) => setFormData({...formData, laborCost: parseFloat(value) || 0})}
                  min={0}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Kullanılan Parçalar</FormLabel>
                <Box border="1px" borderColor="gray.200" p="4" borderRadius="md" maxH="200px" overflowY="auto">
                  <VStack align="start" spacing={2}>
                    {availableParts.map(part => {
                      const selectedPart = selectedParts.find(p => p.name === part.name);
                      const isSelected = !!selectedPart;
                      
                      return (
                        <HStack key={part.name} w="100%" justify="space-between">
                          <Checkbox
                            isChecked={isSelected}
                            onChange={(e) => handlePartSelection(part.name, e.target.checked)}
                          >
                            {part.name} - ₺{part.price}
                          </Checkbox>
                          {isSelected && (
                            <NumberInput
                              size="sm"
                              w="80px"
                              value={selectedPart.quantity}
                              onChange={(value) => updatePartQuantity(part.name, parseInt(value) || 1)}
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
                </Box>
              </FormControl>

              <FormControl>
                <FormLabel>Sonraki Servis Tarihi</FormLabel>
                <Input
                  type="date"
                  value={formData.nextServiceDate}
                  onChange={(e) => setFormData({...formData, nextServiceDate: e.target.value})}
                />
              </FormControl>

              {/* Maliyet Hesaplama */}
              <Box p="4" bg="gray.50" borderRadius="md">
                <Text fontWeight="bold" mb="2">Maliyet Özeti:</Text>
                <Stack spacing={1}>
                  <HStack justify="space-between">
                    <Text>Servis Ücreti:</Text>
                    <Text>₺{(servicePrices[formData.serviceType] || 0).toLocaleString()}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>İşlemler:</Text>
                    <Text>₺{workItems.reduce((sum, item) => sum + (item.basePrice * item.quantity), 0).toLocaleString()}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Parçalar:</Text>
                    <Text>₺{selectedParts.reduce((sum, part) => sum + part.cost, 0).toLocaleString()}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Ek İşçilik:</Text>
                    <Text>₺{(formData.laborCost || 0).toLocaleString()}</Text>
                  </HStack>
                  <Divider />
                  <HStack justify="space-between">
                    <Text fontWeight="bold" fontSize="lg">Toplam:</Text>
                    <Text fontWeight="bold" fontSize="lg">₺{calculateTotalCost().toLocaleString()}</Text>
                  </HStack>
                </Stack>
              </Box>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
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
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Heading size="md" color={brandColor}>MotoEtiler Servis Fiyat Listesi</Heading>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              {/* Arama Kutusu */}
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <MdSearch color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Servis türü ara..."
                  value={priceSearchTerm}
                  onChange={(e) => setPriceSearchTerm(e.target.value)}
                />
              </InputGroup>

              {/* Fiyat Listesi */}
              <Box maxH="400px" overflowY="auto">
                <Stack spacing={3}>
                  {filteredPrices.map(([serviceType, price]) => (
                    <Box key={serviceType} p="4" border="1px solid" borderColor="gray.200" borderRadius="md" bg={cardBg}>
                      <HStack justify="space-between" align="center">
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="bold">{serviceType}</Text>
                          <Text color={price > 0 ? 'green.500' : 'orange.500'} fontSize="lg" fontWeight="bold">
                            {price > 0 ? `₺${price.toLocaleString()}` : 'Özel Fiyat'}
                          </Text>
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
                              <NumberInputField />
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
                            />
                            <IconButton
                              icon={<MdClose />}
                              size="sm"
                              colorScheme="red"
                              onClick={handleCancelEdit}
                            />
                          </HStack>
                        ) : (
                          <IconButton
                            icon={<MdEdit />}
                            size="sm"
                            colorScheme="blue"
                            variant="outline"
                            onClick={() => handleEditPrice(serviceType, price)}
                          />
                        )}
                      </HStack>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="brand" onClick={() => setIsPriceListOpen(false)}>
              Tamam
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
} 