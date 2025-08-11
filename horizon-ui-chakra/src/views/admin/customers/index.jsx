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
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Divider,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
} from '@chakra-ui/react';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdNotifications, MdDirectionsBike } from 'react-icons/md';
import Card from 'components/card/Card';
import MiniStatistics from 'components/card/MiniStatistics';
import apiService from 'services/apiService';
import { turkeyLocations } from 'data/turkeyLocations';
 


export default function CustomerManagement() {
  const brandColor = useColorModeValue('brand.500', 'white');
  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const inputBg = useColorModeValue('white', 'gray.800');
  const inputText = useColorModeValue('gray.800', 'white');
  const labelColor = useColorModeValue('gray.700', 'gray.200');
  
  // Additional color mode values for form elements
  const modalBg = useColorModeValue('white', 'gray.800');
  const modalHeaderColor = useColorModeValue('gray.700', 'white');
  const modalCloseColor = useColorModeValue('gray.500', 'gray.300');
  const modalFooterBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.300', 'gray.600');
  const accordionBg = useColorModeValue('gray.50', 'gray.700');
  const accordionHoverBg = useColorModeValue('gray.100', 'gray.600');
  const optionBgLight = useColorModeValue('white', 'gray.700');
  const optionColorLight = useColorModeValue('black', 'white');
  const cancelButtonColor = useColorModeValue('gray.600', 'gray.300');

  // Customer state management with real API
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load customers from API
  useEffect(() => {
    loadCustomers();
  }, []);

  // Load Vespa models
  const loadVespaModels = async () => {
    try {
      setLoadingModels(true);
      const response = await apiService.getVespaModels();
      setVespaModels(response.models || []);
    } catch (error) {
      console.error('Error loading Vespa models:', error);
      setError('Vespa modelleri yüklenirken hata: ' + error.message);
    } finally {
      setLoadingModels(false);
    }
  };

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getCustomers(1, 100); // Load first 100 customers
      
      // Transform API response to match frontend format
      const transformedCustomers = response.customers?.map(customer => ({
        id: customer.id,
        customer_code: customer.customer_code,
        name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim(),
        first_name: customer.first_name,
        last_name: customer.last_name,
        phone: customer.phone,
        email: customer.email,
        tax_number: customer.tax_number,
        customer_type: customer.customer_type,
        notes: customer.notes,
        registrationDate: customer.created_date?.split('T')[0] || '',
        status: customer.status || 'ACTIVE',
        vespa_count: customer.vespa_count || 0
      })) || [];
      
      setCustomers(transformedCustomers);
    } catch (error) {
      console.error('Error loading customers:', error);
      setError('Müşteriler yüklenirken hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    city: '',
    district: '',

    tax_number: '',
    customer_type: 'INDIVIDUAL',
    notes: '',
    status: 'ACTIVE',
    // Vespa data (required)
    vespa: {
      vespa_model_id: '',
      license_plate: '',
      current_mileage: 0,
      service_interval_km: 3000,
      vespa_notes: ''
    }
  });

  // Vespa models state
  const [vespaModels, setVespaModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [customerVespas, setCustomerVespas] = useState([]);
  const [selectedVespaIndex, setSelectedVespaIndex] = useState(0);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ services: [], vespas: [] });

  // Helper function to update vespa data
  const updateVespaData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      vespa: {
        ...prev.vespa,
        [field]: value
      }
    }));
  };

  // Searchable dropdown component for City/District
  const SearchableSelect = ({ label, options, value, onChange, placeholder, isDisabled }) => {
    const [search, setSearch] = useState('');
    const filtered = (options || []).filter((opt) => (opt || '').toLowerCase().includes(search.toLowerCase()));
    const displayValue = value || '';
    return (
      <FormControl isDisabled={isDisabled}>
        <FormLabel color={labelColor}>{label}</FormLabel>
        <Popover placement="bottom-start" matchWidth>
          <PopoverTrigger>
            <Box
              as="button"
              w="100%"
              textAlign="left"
              bg={inputBg}
              color={inputText}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="md"
              px={3}
              py={2}
            >
              <Text color={displayValue ? inputText : 'gray.400'}>
                {displayValue || placeholder}
              </Text>
            </Box>
          </PopoverTrigger>
          <PopoverContent w="100%" maxW="320px">
            <PopoverBody>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Ara...`}
                mb={2}
              />
              <Box maxH="200px" overflowY="auto" border="1px solid" borderColor={borderColor} borderRadius="md">
                {(filtered.length > 0 ? filtered : options || []).map((opt) => (
                  <Box
                    key={opt}
                    px={3}
                    py={2}
                    _hover={{ bg: optionBgLight }}
                    cursor="pointer"
                    onClick={() => {
                      onChange(opt);
                    }}
                  >
                    {opt}
                  </Box>
                ))}
                {(!options || options.length === 0) && (
                  <Box px={3} py={2} color="gray.500">Seçenek yok</Box>
                )}
              </Box>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </FormControl>
    );
  };

  // Helper function to format date as gg.aa.yyyy
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}.${month}.${year}`;
    } catch (error) {
      return '-';
    }
  };

  // Helper function to handle TC/Vergi No input (numbers only)
  const handleTaxNumberChange = (e) => {
    const value = e.target.value;
    // Remove all non-digit characters
    const numbersOnly = value.replace(/\D/g, '');
    // Limit to 11 characters (TC Kimlik max length)
    const limitedValue = numbersOnly.slice(0, 11);
    setFormData({...formData, tax_number: limitedValue});
  };

  // Helper function to handle phone input (numbers only, no leading zero)
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Remove all non-digit characters
    const numbersOnly = value.replace(/\D/g, '');
    
    // Remove leading zeros and ensure it starts with 5
    let cleanedValue = numbersOnly;
    
    // Remove leading zeros
    cleanedValue = cleanedValue.replace(/^0+/, '');
    
    // If first digit is not 5, don't allow (Turkish mobile format)
    if (cleanedValue.length > 0 && cleanedValue[0] !== '5') {
      // If user is trying to type a non-5 first digit, prevent it
      if (formData.phone === '') {
        return; // Don't update if trying to start with non-5
      }
    }
    
    // Limit to 10 digits (Turkish mobile format: 5XXXXXXXXX)
    const limitedValue = cleanedValue.slice(0, 10);
    setFormData({...formData, phone: limitedValue});
  };

  // Helper function to handle license plate input (Turkish format)
  const handleLicensePlateChange = (e) => {
    const value = e.target.value.toUpperCase();
    // Allow only letters, numbers and spaces
    const cleanedValue = value.replace(/[^A-Z0-9\s]/g, '');
    // Limit to reasonable length (Turkish plates are typically 7-9 characters including spaces)
    const limitedValue = cleanedValue.slice(0, 10);
    updateVespaData('license_plate', limitedValue);
  };

  const filteredCustomers = customers.filter(customer => {
    const searchableText = [
      customer.name || '',
      customer.first_name || '',
      customer.last_name || '',
      customer.email || '',
      customer.phone || '',

    ].join(' ').toLowerCase();
    
    const matchesSearch = searchableText.includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || customer.status?.toUpperCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      city: '',
      district: '',

      tax_number: '',
      customer_type: 'INDIVIDUAL',
      notes: '',
      status: 'ACTIVE',
      vespa: {
        vespa_model_id: '',
        license_plate: '',


        current_mileage: 0,
        service_interval_km: 3000,
        vespa_notes: ''
      }
    });
    // Load Vespa models when opening form
    loadVespaModels();
    onOpen();
  };

  const handleEditCustomer = async (customer) => {
    setSelectedCustomer(customer);
    
    // First, load Vespa models (wait for them to be ready)
    await loadVespaModels();
    
    // Set initial form data
    setFormData({
      first_name: customer.first_name || customer.name?.split(' ')[0] || '',
      last_name: customer.last_name || customer.name?.split(' ').slice(1).join(' ') || '',
      email: customer.email || '',
      phone: customer.phone || '',
      city: customer.city || '',
      district: customer.district || '',
      tax_number: customer.tax_number || '',
      customer_type: customer.customer_type || 'INDIVIDUAL',
      notes: customer.notes || '',
      status: customer.status?.toUpperCase() || 'ACTIVE',
      vespa: {
        vespa_model_id: '',
        license_plate: '',
        current_mileage: 0,
        service_interval_km: 3000,
        vespa_notes: ''
      }
    });
    
    // Load customer's existing Vespa data
    try {
      if (customer.vespa_count > 0) {
        const vespaResponse = await apiService.getCustomerVespas(customer.id);
        const vespas = vespaResponse.vespas || vespaResponse || [];

        setCustomerVespas(vespas);
        if (vespas.length > 0) {
          const firstVespa = vespas[0];
          setFormData(prev => ({
            ...prev,
            vespa: {
              vespa_model_id: firstVespa.vespa_model_id?.toString() || '',
              license_plate: firstVespa.license_plate || '',
              current_mileage: firstVespa.current_mileage || 0,
              service_interval_km: firstVespa.service_interval_km || 3000,
              vespa_notes: firstVespa.vespa_notes || ''
            }
          }));
        }
      }
    } catch (error) {
      console.error('Error loading customer Vespa data:', error);
    }
    
    onOpen();
  };

  // Yeni: Müşteri bilgi kartını aç
  const handleOpenCustomerInfo = async (customer) => {
    try {
      setSelectedCustomer(customer);
      // Tüm vespaları çek
      const vespaResp = await apiService.getCustomerVespas(customer.id);
      const vespas = vespaResp.vespas || vespaResp || [];
      // Son 5 servis kaydı (müşteriye göre)
      const servicesResp = await apiService.getServices(1, 50, '', customer.id, null);
      const services = servicesResp.services || servicesResp.results || servicesResp || [];
      setCustomerInfo({ vespas, services: services.slice(0, 5) });
      setIsInfoOpen(true);
    } catch (e) {
      console.error('Müşteri bilgi kartı yüklenemedi:', e);
    }
  };

  const handleSaveCustomer = async () => {
    try {
      setLoading(true);
      
      // Validation: Vespa bilgileri zorunlu
      if (!formData.vespa.vespa_model_id || !formData.vespa.license_plate) {
        setError('Vespa model ve plaka bilgileri zorunludur!');
        setLoading(false);
        return;
      }

      // Validation: Plaka formatı kontrolü
      if (formData.vespa.license_plate.length < 6) {
        setError('Plaka en az 6 karakter olmalıdır!');
        setLoading(false);
        return;
      }

      // Validation: Telefon numarası kontrolü
      if (!formData.phone || formData.phone.length !== 10 || formData.phone[0] !== '5') {
        setError('Telefon numarası 5 ile başlayan 10 haneli olmalıdır!');
        setLoading(false);
        return;
      }

      // Validation: TC/Vergi No kontrolü (eğer girilmişse)
      if (formData.tax_number && (formData.tax_number.length < 10 || formData.tax_number.length > 11)) {
        setError('TC Kimlik No 11 haneli, Vergi No 10 haneli olmalıdır!');
        setLoading(false);
        return;
      }
      
      const customerData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        district: formData.district,
        tax_number: formData.tax_number,
        customer_type: formData.customer_type,
        notes: formData.notes,
        status: formData.status
      };

      // Add Vespa data (required for all customers)
      customerData.vespa = {
        vespa_model_id: parseInt(formData.vespa.vespa_model_id),
        license_plate: formData.vespa.license_plate,
        current_mileage: parseInt(formData.vespa.current_mileage) || 0,
        service_interval_km: parseInt(formData.vespa.service_interval_km) || 3000,
        vespa_notes: formData.vespa.vespa_notes
      };
      
      if (selectedCustomer) {
        // Update existing customer (without Vespa - that's handled separately)
        await apiService.updateCustomer(selectedCustomer.id, customerData);
      } else {
        // Add new customer (with optional Vespa)
        await apiService.createCustomer(customerData);
      }
      
      // Reload customers after save
      await loadCustomers();
      onClose();
      
    } catch (error) {
      console.error('Error saving customer:', error);
      setError('Müşteri kaydedilirken hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (!window.confirm('Bu müşteriyi silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      setLoading(true);
      // Note: Backend might not have delete endpoint, using update to deactivate
      await apiService.updateCustomer(customerId, { status: 'INACTIVE' });
      
      // Reload customers after delete
      await loadCustomers();
      
    } catch (error) {
      console.error('Error deleting customer:', error);
      setError('Müşteri silinirken hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return 'green';
      case 'INACTIVE': return 'red';
      case 'PENDING': return 'yellow';
      default: return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return 'Aktif';
      case 'INACTIVE': return 'Pasif';
      case 'PENDING': return 'Beklemede';
      default: return 'Bilinmiyor';
    }
  };

  const upcomingServices = customers.filter(c => {
    if (!c.nextService) return false;
    const nextServiceDate = new Date(c.nextService);
    const today = new Date();
    const diffTime = nextServiceDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  });

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Statistics Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="20px" mb="20px">
        <MiniStatistics
          startContent={
            <Icon as={MdDirectionsBike} w="56px" h="56px" bg={boxBg} borderRadius="16px" p="12px" />
          }
          name="Toplam Müşteri"
          value={customers.length.toString()}
        />
        <MiniStatistics
          startContent={
            <Icon as={MdNotifications} w="56px" h="56px" bg={boxBg} borderRadius="16px" p="12px" />
          }
          name="Yaklaşan Servisler"
          value={upcomingServices.length.toString()}
        />
        <MiniStatistics
          startContent={
            <Icon as={MdEdit} w="56px" h="56px" bg={boxBg} borderRadius="16px" p="12px" />
          }
          name="Aktif Müşteriler"
          value={customers.filter(c => c.status?.toUpperCase() === 'ACTIVE').length.toString()}
        />
        <MiniStatistics
          startContent={
            <Icon as={MdDelete} w="56px" h="56px" bg={boxBg} borderRadius="16px" p="12px" />
          }
          name="Gecikmiş Servisler"
          value={customers.filter(c => c.status === 'overdue').length.toString()}
        />
      </SimpleGrid>

      {/* Upcoming Services Alert */}
      {upcomingServices.length > 0 && (
        <Alert status="warning" mb="20px" borderRadius="12px">
          <AlertIcon />
          <Box>
            <AlertTitle>Yaklaşan Servisler!</AlertTitle>
            <AlertDescription>
              {upcomingServices.length} müşterinizin bu hafta içinde servis randevusu var.
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {/* Customer Management Card */}
      <Card>
        <Flex justify="space-between" align="center" mb="20px">
          <Text fontSize="2xl" fontWeight="bold" color={brandColor}>
            Müşteri Yönetimi
          </Text>
          <Button
            leftIcon={<MdAdd />}
            colorScheme="brand"
            onClick={handleAddCustomer}
          >
            Yeni Müşteri Ekle
          </Button>
        </Flex>

        {/* Search and Filter */}
        <Stack direction={{ base: 'column', md: 'row' }} spacing={4} mb="20px">
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Icon as={MdSearch} color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Müşteri ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          <Select
            placeholder="Durum filtresi"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            w={{ base: '100%', md: '200px' }}
            bg={inputBg}
            color={inputText}
            borderColor={borderColor}
          >
            <option value="all" style={{backgroundColor: optionBgLight, color: optionColorLight}}>
              Tümü
            </option>
            <option value="ACTIVE" style={{backgroundColor: optionBgLight, color: optionColorLight}}>
              Aktif
            </option>
            <option value="INACTIVE" style={{backgroundColor: optionBgLight, color: optionColorLight}}>
              Pasif
            </option>
            <option value="PENDING" style={{backgroundColor: optionBgLight, color: optionColorLight}}>
              Beklemede
            </option>
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
            <Text>Müşteriler yükleniyor...</Text>
          </Box>
        ) : (
        /* Customer Table */
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Müşteri Adı</Th>
                <Th>İletişim</Th>
                <Th>TC/Vergi No</Th>
                <Th>Motor Sayısı</Th>
                <Th>Müşteri Tipi</Th>
                <Th>Durum</Th>
                <Th>Kayıt Tarihi</Th>
                <Th>İşlemler</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredCustomers.map((customer) => (
                <Tr key={customer.id}>
                  <Td onClick={() => handleOpenCustomerInfo(customer)} cursor="pointer">
                    <Box>
                      <Text fontWeight="bold">{customer.name}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {customer.customer_code || customer.id}
                      </Text>
                    </Box>
                  </Td>
                  <Td onClick={() => handleOpenCustomerInfo(customer)} cursor="pointer">
                    <Box>
                      <Text>{customer.email || '-'}</Text>
                      <Text fontSize="sm" color="gray.500">{customer.phone}</Text>
                    </Box>
                  </Td>
                  <Td onClick={() => handleOpenCustomerInfo(customer)} cursor="pointer">{customer.tax_number || '-'}</Td>
                  <Td onClick={() => handleOpenCustomerInfo(customer)} cursor="pointer">
                    <Badge 
                      colorScheme={customer.vespa_count > 0 ? 'green' : 'gray'}
                      variant="solid"
                    >
                      {customer.vespa_count || 0} Motor
                    </Badge>
                  </Td>
                  <Td>
                    <Badge 
                      colorScheme={customer.customer_type === 'CORPORATE' ? 'purple' : 'blue'}
                      variant="subtle"
                    >
                      {customer.customer_type === 'CORPORATE' ? 'Kurumsal' : 'Bireysel'}
                    </Badge>
                  </Td>
                  <Td onClick={() => handleOpenCustomerInfo(customer)} cursor="pointer">
                    <Badge colorScheme={getStatusColor(customer.status)}>
                      {getStatusText(customer.status)}
                    </Badge>
                  </Td>
                  <Td>{formatDate(customer.registrationDate)}</Td>
                  <Td>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        icon={<MdEdit />}
                        size="sm"
                        colorScheme="blue"
                        onClick={() => handleEditCustomer(customer)}
                        title="Müşteriyi Düzenle"
                      />
                      <IconButton
                        icon={<MdDelete />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDeleteCustomer(customer.id)}
                      />
                    </Stack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
        )}

        {!loading && filteredCustomers.length === 0 && (
          <Box textAlign="center" py="40px">
            <Text fontSize="lg" color="gray.500">
              {searchTerm || filterStatus !== 'all' 
                ? 'Arama kriterlerinize uygun müşteri bulunamadı.'
                : 'Henüz müşteri eklenmemiş.'
              }
            </Text>
          </Box>
        )}
      </Card>

      {/* Add/Edit Customer Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg={modalBg}>
          <ModalHeader color={modalHeaderColor}>
            {selectedCustomer ? 'Müşteri Düzenle' : 'Yeni Müşteri Ekle'}
          </ModalHeader>
          <ModalCloseButton color={modalCloseColor} />
          <ModalBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {/* Personal Information */}
              <FormControl isRequired>
                <FormLabel color={labelColor}>Ad</FormLabel>
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  placeholder="Adı girin"
                  bg={inputBg}
                  color={inputText}
                  borderColor={borderColor}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color={labelColor}>Soyad</FormLabel>
                <Input
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  placeholder="Soyadı girin"
                  bg={inputBg}
                  color={inputText}
                  borderColor={borderColor}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={labelColor}>E-posta</FormLabel>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="E-posta adresini girin"
                  bg={inputBg}
                  color={inputText}
                  borderColor={borderColor}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color={labelColor}>Telefon</FormLabel>
                <Input
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="5XXXXXXXXX (başında sıfır olmadan)"
                  maxLength={10}
                  bg={inputBg}
                  color={inputText}
                  borderColor={borderColor}
                  _placeholder={{ color: 'gray.400' }}
                />
                {formData.phone && formData.phone.length > 0 && formData.phone[0] !== '5' && (
                  <Text fontSize="xs" color="red.500" mt={1}>
                    Telefon numarası 5 ile başlamalıdır
                  </Text>
                )}
                {formData.phone && formData.phone.length > 0 && formData.phone.length < 10 && (
                  <Text fontSize="xs" color="orange.500" mt={1}>
                    Telefon numarası 10 haneli olmalıdır ({formData.phone.length}/10)
                  </Text>
                )}
              </FormControl>

              <SearchableSelect
                label="İl"
                options={turkeyLocations.map(c => c.city)}
                value={formData.city}
                onChange={(city) => setFormData({ ...formData, city, district: '' })}
                placeholder="İl seçin"
              />

              <SearchableSelect
                label="İlçe"
                options={(turkeyLocations.find(c => c.city === formData.city)?.districts) || []}
                value={formData.district}
                onChange={(district) => setFormData({ ...formData, district })}
                placeholder={formData.city ? 'İlçe seçin' : 'Önce il seçin'}
                isDisabled={!formData.city}
              />

              <FormControl>
                <FormLabel color={labelColor}>TC/Vergi No</FormLabel>
                <Input
                  value={formData.tax_number}
                  onChange={handleTaxNumberChange}
                  placeholder="TC Kimlik No (11 haneli) veya Vergi No (10 haneli)"
                  maxLength={11}
                  bg={inputBg}
                  color={inputText}
                  borderColor={borderColor}
                  _placeholder={{ color: 'gray.400' }}
                />
                {formData.tax_number && formData.tax_number.length > 0 && (
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    {formData.tax_number.length === 10 ? '✅ Vergi No formatı (10 haneli)' :
                     formData.tax_number.length === 11 ? '✅ TC Kimlik No formatı (11 haneli)' :
                     formData.tax_number.length < 10 ? `⚠️ En az 10 haneli olmalıdır (${formData.tax_number.length}/10)` :
                     '⚠️ TC: 11 haneli, Vergi No: 10 haneli olmalıdır'}
                  </Text>
                )}
              </FormControl>

              <FormControl>
                <FormLabel color={labelColor}>Müşteri Tipi</FormLabel>
                <Select
                  value={formData.customer_type}
                  onChange={(e) => setFormData({...formData, customer_type: e.target.value})}
                  bg={inputBg}
                  color={inputText}
                  borderColor={borderColor}
                >
                  <option value="INDIVIDUAL" style={{backgroundColor: optionBgLight, color: optionColorLight}}>
                    Bireysel
                  </option>
                  <option value="CORPORATE" style={{backgroundColor: optionBgLight, color: optionColorLight}}>
                    Kurumsal
                  </option>
                </Select>
              </FormControl>



              <FormControl gridColumn={{ base: 1, md: 'span 2' }}>
                <FormLabel color={labelColor}>Durum</FormLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  bg={inputBg}
                  color={inputText}
                  borderColor={borderColor}
                >
                  <option value="ACTIVE" style={{backgroundColor: optionBgLight, color: optionColorLight}}>
                    Aktif
                  </option>
                  <option value="INACTIVE" style={{backgroundColor: optionBgLight, color: optionColorLight}}>
                    Pasif
                  </option>
                </Select>
              </FormControl>

              <FormControl gridColumn={{ base: 1, md: 'span 2' }}>
                <FormLabel color={labelColor}>Notlar</FormLabel>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Müşteri hakkında notlar"
                  rows={3}
                  bg={inputBg}
                  color={inputText}
                  borderColor={borderColor}
                />
              </FormControl>
            </SimpleGrid>

            {/* Vespa Information (Required for all customers) */}
              <>
                <Divider my={6} />
                <Accordion allowToggle>
                  <AccordionItem border="none">
                    <AccordionButton
                      bg={accordionBg}
                      borderRadius="md"
                      _hover={{ bg: accordionHoverBg }}
                    >
                      <Box flex="1" textAlign="left">
                        <Text fontWeight="bold" color={labelColor}>
                          🏍️ Vespa Motor Bilgileri (Zorunlu)
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          Müşterinin motor bilgileri zorunludur
                        </Text>
                      </Box>
                      <AccordionIcon color={labelColor} />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        {/* Eğer müşterinin birden fazla Vespa'sı varsa seçim alanı */}
                        {customerVespas.length > 1 && (
                          <FormControl gridColumn={{ base: 1, md: 'span 2' }}>
                            <FormLabel color={labelColor}>Müşterinin Vespaları</FormLabel>
                            <Select
                              value={selectedVespaIndex}
                              onChange={(e) => {
                                const idx = parseInt(e.target.value, 10) || 0;
                                setSelectedVespaIndex(idx);
                                const v = customerVespas[idx];
                                setFormData(prev => ({
                                  ...prev,
                                  vespa: {
                                    vespa_model_id: v.vespa_model_id?.toString() || '',
                                    license_plate: v.license_plate || '',
                                    current_mileage: v.current_mileage || 0,
                                    service_interval_km: v.service_interval_km || 3000,
                                    vespa_notes: v.vespa_notes || ''
                                  }
                                }));
                              }}
                              bg={inputBg}
                              color={inputText}
                              borderColor={borderColor}
                            >
                              {customerVespas.map((v, idx) => (
                                <option key={v.id} value={idx} style={{ backgroundColor: optionBgLight, color: optionColorLight }}>
                                  {v.license_plate} - {v.model_name}
                                </option>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                        <FormControl isRequired>
                          <FormLabel color={labelColor}>Vespa Modeli</FormLabel>
                          <Select
                            value={formData.vespa.vespa_model_id}
                            onChange={(e) => updateVespaData('vespa_model_id', e.target.value)}
                            placeholder="Vespa modelini seçin"
                            bg={inputBg}
                            color={inputText}
                            borderColor={borderColor}
                            disabled={loadingModels}
                          >
                            {vespaModels.map((model) => (
                              <option 
                                key={model.id} 
                                value={model.id}
                                style={{
                                  backgroundColor: optionBgLight,
                                  color: optionColorLight
                                }}
                              >
                                {model.model_name} ({model.engine_size})
                              </option>
                            ))}
                          </Select>
                          {loadingModels && (
                            <Text fontSize="xs" color="gray.500" mt={1}>
                              Modeller yükleniyor...
                            </Text>
                          )}
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel color={labelColor}>Plaka</FormLabel>
                          <Input
                            value={formData.vespa.license_plate}
                            onChange={handleLicensePlateChange}
                            placeholder="34 ABC 123 (sadece harf, rakam ve boşluk)"
                            maxLength={10}
                            bg={inputBg}
                            color={inputText}
                            borderColor={borderColor}
                            _placeholder={{ color: 'gray.400' }}
                          />
                          {formData.vespa.license_plate && formData.vespa.license_plate.length > 0 && (
                            <Text fontSize="xs" color="gray.500" mt={1}>
                              ✅ Plaka formatı: {formData.vespa.license_plate}
                            </Text>
                          )}
                        </FormControl>



                        <FormControl>
                          <FormLabel color={labelColor}>Mevcut KM</FormLabel>
                          <Input
                            type="number"
                            min="0"
                            value={formData.vespa.current_mileage}
                            onChange={(e) => updateVespaData('current_mileage', e.target.value)}
                            placeholder="0"
                            bg={inputBg}
                            color={inputText}
                            borderColor={borderColor}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel color={labelColor}>Servis Aralığı (KM)</FormLabel>
                          <Input
                            type="number"
                            min="1000"
                            step="1000"
                            value={formData.vespa.service_interval_km}
                            onChange={(e) => updateVespaData('service_interval_km', e.target.value)}
                            placeholder="3000"
                            bg={inputBg}
                            color={inputText}
                            borderColor={borderColor}
                          />
                        </FormControl>

                        <FormControl gridColumn={{ base: 1, md: 'span 2' }}>
                          <FormLabel color={labelColor}>Motor Notları</FormLabel>
                          <Textarea
                            value={formData.vespa.vespa_notes}
                            onChange={(e) => updateVespaData('vespa_notes', e.target.value)}
                            placeholder="Motor hakkında notlar"
                            rows={2}
                            bg={inputBg}
                            color={inputText}
                            borderColor={borderColor}
                          />
                        </FormControl>
                      </SimpleGrid>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              </>
          </ModalBody>

          <ModalFooter bg={modalFooterBg}>
            <Button 
              variant="ghost" 
              mr={3} 
              onClick={onClose}
              color={cancelButtonColor}
            >
              İptal
            </Button>
            <Button 
              colorScheme="brand" 
              onClick={handleSaveCustomer}
              isLoading={loading}
            >
              {selectedCustomer ? 'Güncelle' : 'Ekle'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Müşteri Bilgi Kartı Modal */}
      <Modal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent bg={modalBg}>
          <ModalHeader color={modalHeaderColor}>Müşteri Bilgi Kartı</ModalHeader>
          <ModalCloseButton color={modalCloseColor} />
          <ModalBody>
            {selectedCustomer && (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Card>
                  <Box p={4}>
                    <Text fontWeight="bold" mb={2}>Müşteri Bilgileri</Text>
                    <Stack spacing={1} fontSize="sm">
                      <Text>Ad Soyad: {selectedCustomer.name}</Text>
                      <Text>E-posta: {selectedCustomer.email || '-'}</Text>
                      <Text>Telefon: {selectedCustomer.phone || '-'}</Text>
                      <Text>TC/Vergi No: {selectedCustomer.tax_number || '-'}</Text>
                      <Text>Durum: {getStatusText(selectedCustomer.status)}</Text>
                      <Text>Kayıt Tarihi: {formatDate(selectedCustomer.registrationDate)}</Text>
                    </Stack>
                  </Box>
                </Card>
                <Card>
                  <Box p={4}>
                    <Text fontWeight="bold" mb={2}>Motor Bilgileri</Text>
                    <Stack spacing={2}>
                      {customerInfo.vespas.length === 0 ? (
                        <Text fontSize="sm" color="gray.500">Bu müşteriye ait motor kaydı yok.</Text>
                      ) : customerInfo.vespas.map((v) => (
                        <Box key={v.id} p={3} border="1px solid" borderColor={borderColor} borderRadius="md">
                          <Text fontWeight="medium">{v.model_name} - {v.license_plate}</Text>
                          <Text fontSize="sm" color="gray.500">KM: {v.current_mileage || 0} | Son Servis: {v.last_service_date ? formatDate(v.last_service_date) : '-'}</Text>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </Card>
                <Card gridColumn={{ base: 1, md: 'span 2' }}>
                  <Box p={4}>
                    <Text fontWeight="bold" mb={2}>Son Servis Geçmişi</Text>
                    {customerInfo.services.length === 0 ? (
                      <Text fontSize="sm" color="gray.500">Servis kaydı bulunamadı.</Text>
                    ) : (
                      <TableContainer>
                        <Table variant="simple" size="sm">
                          <Thead>
                            <Tr>
                              <Th>Tarih</Th>
                              <Th>Servis Türü</Th>
                              <Th>Plaka</Th>
                              <Th>Durum</Th>
                              <Th>Tutar</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {customerInfo.services.slice(0,5).map((s) => (
                              <Tr key={s.id}>
                                <Td>{s.service_date}</Td>
                                <Td>{s.service_type}</Td>
                                <Td>{s.license_plate}</Td>
                                <Td>
                                  <Badge colorScheme={getStatusColor((s.status || '').toLowerCase())}>
                                    {getStatusText((s.status || '').toLowerCase())}
                                  </Badge>
                                </Td>
                                <Td>₺{(s.total_cost || 0).toLocaleString()}</Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
                </Card>
              </SimpleGrid>
            )}
          </ModalBody>
          <ModalFooter bg={modalFooterBg}>
            <Button onClick={() => setIsInfoOpen(false)} color={cancelButtonColor}>Kapat</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
} 