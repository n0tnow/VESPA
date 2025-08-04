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
} from '@chakra-ui/react';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdNotifications, MdDirectionsBike } from 'react-icons/md';
import Card from 'components/card/Card';
import MiniStatistics from 'components/card/MiniStatistics';
import apiService from 'services/apiService';

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
        address: customer.address,
        city: customer.city,
        district: customer.district,
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
    address: '',
    city: '',
    district: '',
    tax_number: '',
    customer_type: 'INDIVIDUAL',
    notes: '',
    status: 'ACTIVE',
    // Vespa data (optional)
    vespa: {
      vespa_model_id: '',
      license_plate: '',
      chassis_number: '',
      purchase_date: '',
      current_mileage: 0,
      service_interval_km: 5000,
      vespa_notes: ''
    }
  });

  // Vespa models state
  const [vespaModels, setVespaModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);

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

  const filteredCustomers = customers.filter(customer => {
    const searchableText = [
      customer.name || '',
      customer.first_name || '',
      customer.last_name || '',
      customer.email || '',
      customer.phone || '',
      customer.address || '',
      customer.city || '',
      customer.district || ''
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
      address: '',
      city: '',
      district: '',
      tax_number: '',
      customer_type: 'INDIVIDUAL',
      notes: '',
      status: 'ACTIVE',
      vespa: {
        vespa_model_id: '',
        license_plate: '',
        chassis_number: '',
        purchase_date: '',
        current_mileage: 0,
        service_interval_km: 5000,
        vespa_notes: ''
      }
    });
    // Load Vespa models when opening form
    loadVespaModels();
    onOpen();
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      first_name: customer.first_name || customer.name?.split(' ')[0] || '',
      last_name: customer.last_name || customer.name?.split(' ').slice(1).join(' ') || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      city: customer.city || '',
      district: customer.district || '',
      tax_number: customer.tax_number || '',
      customer_type: customer.customer_type || 'INDIVIDUAL',
      notes: customer.notes || '',
      status: customer.status?.toUpperCase() || 'ACTIVE',
      vespa: {
        vespa_model_id: '',
        license_plate: '',
        chassis_number: '',
        purchase_date: '',
        current_mileage: 0,
        service_interval_km: 5000,
        vespa_notes: ''
      }
    });
    // Load Vespa models when opening form
    loadVespaModels();
    onOpen();
  };

  const handleSaveCustomer = async () => {
    try {
      setLoading(true);
      
      const customerData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        district: formData.district,
        tax_number: formData.tax_number,
        customer_type: formData.customer_type,
        notes: formData.notes,
        status: formData.status
      };

      // Add Vespa data if provided (only for new customers)
      if (!selectedCustomer && formData.vespa.vespa_model_id && formData.vespa.license_plate) {
        customerData.vespa = {
          vespa_model_id: parseInt(formData.vespa.vespa_model_id),
          license_plate: formData.vespa.license_plate,
          chassis_number: formData.vespa.chassis_number,
          purchase_date: formData.vespa.purchase_date || null,
          current_mileage: parseInt(formData.vespa.current_mileage) || 0,
          service_interval_km: parseInt(formData.vespa.service_interval_km) || 5000,
          vespa_notes: formData.vespa.vespa_notes
        };
      }
      
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
                <Th>Adres Bilgileri</Th>
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
                  <Td>
                    <Box>
                      <Text fontWeight="bold">{customer.name}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {customer.customer_code || customer.id}
                      </Text>
                    </Box>
                  </Td>
                  <Td>
                    <Box>
                      <Text>{customer.email || '-'}</Text>
                      <Text fontSize="sm" color="gray.500">{customer.phone}</Text>
                    </Box>
                  </Td>
                  <Td>
                    <Box>
                      <Text fontSize="sm">{customer.address || '-'}</Text>
                      <Text fontSize="xs" color="gray.500">
                        {[customer.district, customer.city].filter(Boolean).join(', ') || '-'}
                      </Text>
                    </Box>
                  </Td>
                  <Td>{customer.tax_number || '-'}</Td>
                  <Td>
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
                  <Td>
                    <Badge colorScheme={getStatusColor(customer.status)}>
                      {getStatusText(customer.status)}
                    </Badge>
                  </Td>
                  <Td>{customer.registrationDate || '-'}</Td>
                  <Td>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        icon={<MdEdit />}
                        size="sm"
                        colorScheme="blue"
                        onClick={() => handleEditCustomer(customer)}
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
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Telefon numarasını girin"
                  bg={inputBg}
                  color={inputText}
                  borderColor={borderColor}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={labelColor}>TC/Vergi No</FormLabel>
                <Input
                  value={formData.tax_number}
                  onChange={(e) => setFormData({...formData, tax_number: e.target.value})}
                  placeholder="TC Kimlik No veya Vergi No"
                  bg={inputBg}
                  color={inputText}
                  borderColor={borderColor}
                />
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

              {/* Address Information */}
              <FormControl gridColumn={{ base: 1, md: 'span 2' }}>
                <FormLabel color={labelColor}>Adres</FormLabel>
                <Textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Detaylı adres bilgisi"
                  rows={2}
                  bg={inputBg}
                  color={inputText}
                  borderColor={borderColor}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={labelColor}>İlçe</FormLabel>
                <Input
                  value={formData.district}
                  onChange={(e) => setFormData({...formData, district: e.target.value})}
                  placeholder="İlçe"
                  bg={inputBg}
                  color={inputText}
                  borderColor={borderColor}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={labelColor}>Şehir</FormLabel>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  placeholder="Şehir"
                  bg={inputBg}
                  color={inputText}
                  borderColor={borderColor}
                />
              </FormControl>

              <FormControl>
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

            {/* Vespa Information (Only for new customers) */}
            {!selectedCustomer && (
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
                          🏍️ Vespa Motor Bilgileri (İsteğe Bağlı)
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          Müşteriyle birlikte motor bilgilerini de kaydedin
                        </Text>
                      </Box>
                      <AccordionIcon color={labelColor} />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl>
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

                        <FormControl>
                          <FormLabel color={labelColor}>Plaka</FormLabel>
                          <Input
                            value={formData.vespa.license_plate}
                            onChange={(e) => updateVespaData('license_plate', e.target.value.toUpperCase())}
                            placeholder="34 ABC 123"
                            bg={inputBg}
                            color={inputText}
                            borderColor={borderColor}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel color={labelColor}>Şasi Numarası</FormLabel>
                          <Input
                            value={formData.vespa.chassis_number}
                            onChange={(e) => updateVespaData('chassis_number', e.target.value)}
                            placeholder="Şasi numarası (opsiyonel)"
                            bg={inputBg}
                            color={inputText}
                            borderColor={borderColor}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel color={labelColor}>Satın Alma Tarihi</FormLabel>
                          <Input
                            type="date"
                            value={formData.vespa.purchase_date}
                            onChange={(e) => updateVespaData('purchase_date', e.target.value)}
                            bg={inputBg}
                            color={inputText}
                            borderColor={borderColor}
                          />
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
                            placeholder="5000"
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
            )}
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
    </Box>
  );
} 