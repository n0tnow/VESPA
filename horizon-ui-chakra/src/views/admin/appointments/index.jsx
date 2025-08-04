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

  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  VStack,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdCalendarToday,
  MdAccessTime,
  MdCheckCircle,
  MdPending,
} from 'react-icons/md';
import Card from 'components/card/Card';
import MiniStatistics from 'components/card/MiniStatistics';
import MiniCalendar from 'components/calendar/MiniCalendar';
import apiService from 'services/apiService';

export default function AppointmentManagement() {
  const brandColor = useColorModeValue('brand.500', 'white');
  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  const appointmentBg = useColorModeValue('gray.50', 'gray.700');
  
  // Dark mode color definitions
  const textColor = useColorModeValue('gray.700', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');
  const modalBg = useColorModeValue('white', 'gray.800');
  const modalHeaderColor = useColorModeValue('brand.600', 'brand.200');
  const inputBg = useColorModeValue('white', 'gray.700');
  const inputTextColor = useColorModeValue('gray.800', 'gray.100');
  const inputBorderColor = useColorModeValue('gray.200', 'gray.600');
  const selectBg = useColorModeValue('white', 'gray.700');
  const optionBg = useColorModeValue('white', 'gray.700');
  const optionTextColor = useColorModeValue('black', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('white', 'gray.800');
  const tableRowHover = useColorModeValue('gray.50', 'gray.700');
  const cancelButtonColor = useColorModeValue('gray.600', 'gray.300');
  const cancelButtonHoverBg = useColorModeValue('gray.100', 'gray.700');
  
  // Time slot hover colors
  const timeSlotHoverBg = useColorModeValue('brand.50', 'brand.900');
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // State management
  const [appointments, setAppointments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Form state
  const [formData, setFormData] = useState({
    customer_id: '',
    customer_vespa_id: '',
    appointment_date: '',
    appointment_time: '',
    service_type: '',
    description: '',
    customer_notes: '',
    estimated_duration: 60
  });

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Load available slots when date changes
  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load appointments
      const appointmentsResponse = await apiService.getAppointments();
      console.log('Appointments API Response:', appointmentsResponse);
      
      // Check if response has appointments array
      const appointmentsList = appointmentsResponse?.appointments || appointmentsResponse || [];
      
      const transformedAppointments = appointmentsList.map(appointment => ({
        id: appointment.id,
        appointmentNumber: appointment.appointment_number || `APT-${appointment.id}`,
        customerName: appointment.customer_name || 'Bilinmeyen Müşteri',
        customerPhone: appointment.customer_phone || '',
        vespaModel: appointment.model_name || appointment.vespa_model || '',
        licensePlate: appointment.license_plate || '',
        date: appointment.appointment_date,
        time: appointment.appointment_time,
        serviceType: appointment.service_type || 'Genel Servis',
        status: appointment.status || 'SCHEDULED',
        description: appointment.description || appointment.notes || '',
        technician: appointment.assigned_technician || '',
        duration: appointment.estimated_duration || 60
      }));
      setAppointments(transformedAppointments);

      // Load customers
      const customersResponse = await apiService.getCustomers(1, 100);
      setCustomers(customersResponse.results || []);

    } catch (error) {
      console.error('Error loading appointments:', error);
      setError('Randevular yüklenirken hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async (date) => {
    try {
      const response = await apiService.getAvailableSlots(date);
      console.log('Available slots API Response:', response);
      
      // Check if response has available_slots array
      const slotsList = response?.available_slots || response || [];
      setAvailableSlots(slotsList);
    } catch (error) {
      console.error('Error loading available slots:', error);
      setAvailableSlots([]);
    }
  };

  const handleAddAppointment = () => {
    setSelectedAppointment(null);
    setFormData({
      customer_id: '',
      customer_vespa_id: '',
      appointment_date: selectedDate,
      appointment_time: '',
      service_type: '',
      description: '',
      customer_notes: '',
      estimated_duration: 60
    });
    onOpen();
  };

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      customer_id: appointment.customer_id || '',
      customer_vespa_id: appointment.customer_vespa_id || '',
      appointment_date: appointment.date,
      appointment_time: appointment.time,
      service_type: appointment.serviceType,
      description: appointment.description,
      customer_notes: appointment.customer_notes || '',
      estimated_duration: appointment.duration
    });
    onOpen();
  };

  const handleSaveAppointment = async () => {
    try {
      setLoading(true);

      if (selectedAppointment) {
        // Update existing appointment
        await apiService.updateAppointment(selectedAppointment.id, formData);
      } else {
        // Create new appointment
        await apiService.createAppointment(formData);
      }

      await loadData();
      onClose();

    } catch (error) {
      console.error('Error saving appointment:', error);
      setError('Randevu kaydedilirken hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await apiService.updateAppointmentStatus(appointmentId, newStatus);
      await loadData();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      setError('Randevu durumu güncellenirken hata oluştu: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'blue';
      case 'CONFIRMED': return 'green';
      case 'IN_PROGRESS': return 'orange';
      case 'COMPLETED': return 'green';
      case 'CANCELLED': return 'red';
      case 'NO_SHOW': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'Planlandı';
      case 'CONFIRMED': return 'Onaylandı';
      case 'IN_PROGRESS': return 'Devam Ediyor';
      case 'COMPLETED': return 'Tamamlandı';
      case 'CANCELLED': return 'İptal Edildi';
      case 'NO_SHOW': return 'Gelmedi';
      default: return 'Bilinmiyor';
    }
  };

  const serviceTypes = [
    'Periyodik Bakım',
    'Ağır Bakım',
    'Rutin Bakım',
    'Onarım',
    'Acil Onarım',
    'Garantili Bakım',
    'Test Sürüşü',
    'Boyama İşlemi'
  ];

  // Safely calculate stats with default values
  const todaysAppointments = (appointments || []).filter(app => app?.date === selectedDate);
  const pendingAppointments = (appointments || []).filter(app => 
    app?.status === 'SCHEDULED' || app?.status === 'CONFIRMED'
  );
  const completedToday = (appointments || []).filter(app => 
    app?.date === selectedDate && app?.status === 'COMPLETED'
  ).length;

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Statistics Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="20px" mb="20px">
        <MiniStatistics
          startContent={
            <Icon as={MdCalendarToday} w="56px" h="56px" bg={boxBg} borderRadius="16px" p="12px" />
          }
          name="Bugünkü Randevular"
          value={(todaysAppointments?.length || 0).toString()}
        />
        <MiniStatistics
          startContent={
            <Icon as={MdPending} w="56px" h="56px" bg={boxBg} borderRadius="16px" p="12px" />
          }
          name="Bekleyen Randevular"
          value={(pendingAppointments?.length || 0).toString()}
        />
        <MiniStatistics
          startContent={
            <Icon as={MdCheckCircle} w="56px" h="56px" bg={boxBg} borderRadius="16px" p="12px" />
          }
          name="Bugün Tamamlanan"
          value={(completedToday || 0).toString()}
        />
        <MiniStatistics
          startContent={
            <Icon as={MdAccessTime} w="56px" h="56px" bg={boxBg} borderRadius="16px" p="12px" />
          }
          name="Müsait Slot"
          value={(availableSlots?.length || 0).toString()}
        />
      </SimpleGrid>

      {/* Error Alert */}
      {error && (
        <Alert status="error" mb="20px" borderRadius="12px">
          <AlertIcon />
          <AlertTitle>Hata!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Card>
        <Tabs index={activeTab} onChange={setActiveTab}>
          <TabList>
            <Tab>📅 Randevu Listesi</Tab>
            <Tab>🗓️ Takvim Görünümü</Tab>
            <Tab>⏰ Zaman Slotları</Tab>
          </TabList>

          <TabPanels>
            {/* Appointment List Tab */}
            <TabPanel>
              <Flex justify="space-between" align="center" mb="20px">
                <Text fontSize="2xl" fontWeight="bold" color={brandColor}>
                  Randevu Yönetimi
                </Text>
                <Button
                  leftIcon={<MdAdd />}
                  colorScheme="brand"
                  onClick={handleAddAppointment}
                >
                  Yeni Randevu Ekle
                </Button>
              </Flex>

              {/* Date Selection */}
              <Stack direction={{ base: 'column', md: 'row' }} spacing={4} mb="20px">
                <FormControl w={{ base: '100%', md: '200px' }}>
                  <FormLabel color={textColor}>Tarih Seç</FormLabel>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    bg={inputBg}
                    color={inputTextColor}
                    borderColor={inputBorderColor}
                  />
                </FormControl>
              </Stack>

              {/* Loading State */}
              {loading ? (
                <Box textAlign="center" py="40px">
                  <Text color={textColor}>Randevular yükleniyor...</Text>
                </Box>
              ) : (
                /* Appointments Table */
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Randevu No</Th>
                        <Th>Müşteri</Th>
                        <Th>Vespa</Th>
                        <Th>Tarih/Saat</Th>
                        <Th>Servis Türü</Th>
                        <Th>Teknisyen</Th>
                        <Th>Durum</Th>
                        <Th>İşlemler</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {(appointments || [])
                        .filter(app => !selectedDate || app?.date === selectedDate)
                        .map((appointment) => (
                        <Tr key={appointment?.id || Math.random()}>
                          <Td><Text color={textColor}>{appointment?.appointmentNumber || '-'}</Text></Td>
                          <Td>
                            <Box>
                              <Text fontWeight="bold" color={textColor}>{appointment?.customerName || 'Bilinmeyen'}</Text>
                              <Text fontSize="sm" color={secondaryTextColor}>{appointment?.customerPhone || '-'}</Text>
                            </Box>
                          </Td>
                          <Td>
                            <Box>
                              <Text color={textColor}>{appointment?.vespaModel || '-'}</Text>
                              <Text fontSize="sm" color={secondaryTextColor}>{appointment?.licensePlate || '-'}</Text>
                            </Box>
                          </Td>
                          <Td>
                            <Box>
                              <Text color={textColor}>{appointment?.date || '-'}</Text>
                              <Text fontSize="sm" color="brand.500">{appointment?.time || '-'}</Text>
                            </Box>
                          </Td>
                          <Td><Text color={textColor}>{appointment?.serviceType || '-'}</Text></Td>
                          <Td><Text color={textColor}>{appointment?.technician || '-'}</Text></Td>
                          <Td>
                            <Select
                              size="sm"
                              value={appointment?.status || 'SCHEDULED'}
                              onChange={(e) => handleStatusChange(appointment?.id, e.target.value)}
                              w="140px"
                              bg={selectBg}
                              color={inputTextColor}
                              borderColor={inputBorderColor}
                            >
                              <option value="SCHEDULED" style={{ backgroundColor: optionBg, color: optionTextColor }}>Planlandı</option>
                              <option value="CONFIRMED" style={{ backgroundColor: optionBg, color: optionTextColor }}>Onaylandı</option>
                              <option value="IN_PROGRESS" style={{ backgroundColor: optionBg, color: optionTextColor }}>Devam Ediyor</option>
                              <option value="COMPLETED" style={{ backgroundColor: optionBg, color: optionTextColor }}>Tamamlandı</option>
                              <option value="CANCELLED" style={{ backgroundColor: optionBg, color: optionTextColor }}>İptal</option>
                              <option value="NO_SHOW" style={{ backgroundColor: optionBg, color: optionTextColor }}>Gelmedi</option>
                            </Select>
                          </Td>
                          <Td>
                            <Stack direction="row" spacing={1}>
                              <IconButton
                                icon={<MdEdit />}
                                size="sm"
                                colorScheme="blue"
                                onClick={() => handleEditAppointment(appointment)}
                              />
                              <IconButton
                                icon={<MdDelete />}
                                size="sm"
                                colorScheme="red"
                                onClick={() => {
                                  if (window.confirm('Bu randevuyu iptal etmek istediğinizden emin misiniz?')) {
                                    handleStatusChange(appointment?.id, 'CANCELLED');
                                  }
                                }}
                              />
                            </Stack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              )}
            </TabPanel>

            {/* Calendar View Tab */}
            <TabPanel>
              <Grid templateColumns="1fr 300px" gap={6}>
                <GridItem>
                  <Card bg={cardBg}>
                    <Text fontSize="xl" fontWeight="bold" mb="20px" color={textColor}>
                      📅 Randevu Takvimi - {selectedDate}
                    </Text>
                    <VStack align="stretch" spacing={3}>
                      {(todaysAppointments || []).map((appointment) => (
                        <Box
                          key={appointment?.id || Math.random()}
                          p={4}
                          borderRadius="lg"
                          bg={appointmentBg}
                          borderLeft="4px solid"
                          borderColor={`${getStatusColor(appointment?.status)}.500`}
                          border="1px solid"
                          borderLeftColor={`${getStatusColor(appointment?.status)}.500`}
                          borderRightColor={borderColor}
                          borderTopColor={borderColor}
                          borderBottomColor={borderColor}
                          transition="all 0.2s"
                          _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                        >
                          <HStack justify="space-between" align="flex-start">
                            <Box flex="1">
                              <Text fontWeight="bold" color={textColor} fontSize="lg">
                                🕐 {appointment?.time || '-'} - {appointment?.customerName || 'Bilinmeyen'}
                              </Text>
                              <Text fontSize="sm" color={textColor} mt="1">
                                🔧 {appointment?.serviceType || '-'}
                              </Text>
                              <Text fontSize="xs" color={secondaryTextColor} mt="1">
                                🏍️ {appointment?.vespaModel || '-'}
                              </Text>
                            </Box>
                            <Badge colorScheme={getStatusColor(appointment?.status)} px="3" py="1" borderRadius="full">
                              {getStatusText(appointment?.status)}
                            </Badge>
                          </HStack>
                        </Box>
                      ))}
                      {(todaysAppointments || []).length === 0 && (
                        <Box textAlign="center" py="40px">
                          <Text color={secondaryTextColor} fontSize="lg">
                            📅 Seçilen tarihte randevu bulunmuyor.
                          </Text>
                          <Text color={secondaryTextColor} fontSize="sm" mt="2">
                            Yeni randevu eklemek için yukarıdaki butonu kullanın.
                          </Text>
                        </Box>
                      )}
                    </VStack>
                  </Card>
                </GridItem>
                <GridItem>
                  <Card bg={cardBg}>
                    <Text fontSize="lg" fontWeight="bold" mb="3" color={textColor}>
                      📅 Mini Takvim
                    </Text>
                    <MiniCalendar />
                  </Card>
                </GridItem>
              </Grid>
            </TabPanel>

            {/* Time Slots Tab */}
            <TabPanel>
              <Box mb="6">
                <Text fontSize="xl" fontWeight="bold" mb="2" color={textColor}>
                  ⏰ Müsait Zaman Slotları
                </Text>
                <Text fontSize="md" color={secondaryTextColor}>
                  📅 {selectedDate} - Aşağıdaki saatlerden birini seçerek hızlı randevu oluşturun
                </Text>
              </Box>
              
              <SimpleGrid columns={{ base: 2, md: 3, lg: 4, xl: 6 }} spacing={4}>
                {(availableSlots || []).map((slot, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    h="80px"
                    borderRadius="lg"
                    borderWidth="2px"
                    borderColor={borderColor}
                    bg={cardBg}
                    color={textColor}
                    _hover={{
                      borderColor: 'brand.500',
                      bg: timeSlotHoverBg,
                      transform: 'translateY(-2px)',
                      shadow: 'md'
                    }}
                    _active={{
                      transform: 'translateY(0px)',
                    }}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, appointment_time: slot?.time || slot?.slot_time }));
                      handleAddAppointment();
                    }}
                  >
                    <VStack spacing={2}>
                      <Text fontSize="lg" fontWeight="bold" color={textColor}>
                        🕐 {slot?.time || slot?.slot_time || '-'}
                      </Text>
                      <Text fontSize="xs" color="green.500" fontWeight="medium">
                        ✅ Müsait
                      </Text>
                    </VStack>
                  </Button>
                ))}
              </SimpleGrid>
              
              {(availableSlots || []).length === 0 && (
                <Box textAlign="center" py="60px">
                  <Text color={secondaryTextColor} fontSize="lg" mb="2">
                    ⏰ Seçilen tarihte müsait slot bulunmuyor.
                  </Text>
                  <Text color={secondaryTextColor} fontSize="sm">
                    Lütfen başka bir tarih seçin veya manuel randevu oluşturun.
                  </Text>
                  <Button 
                    mt="4" 
                    colorScheme="brand" 
                    leftIcon={<MdAdd />}
                    onClick={handleAddAppointment}
                  >
                    Manuel Randevu Ekle
                  </Button>
                </Box>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>

      {/* Add/Edit Appointment Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg={modalBg} borderRadius="xl" border="1px solid" borderColor={borderColor}>
          <ModalHeader color={modalHeaderColor} borderBottom="1px solid" borderColor={borderColor}>
            <Text fontSize="xl" fontWeight="bold">
              {selectedAppointment ? '📝 Randevu Düzenle' : '➕ Yeni Randevu Ekle'}
            </Text>
          </ModalHeader>
          <ModalCloseButton color={textColor} />
          <ModalBody py="6">
            <VStack spacing={5}>
              <FormControl isRequired>
                <FormLabel color={textColor} fontWeight="medium">👤 Müşteri</FormLabel>
                <Select
                  value={formData.customer_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_id: e.target.value }))}
                  placeholder="Müşteri seçin"
                  bg={inputBg}
                  color={inputTextColor}
                  borderColor={inputBorderColor}
                  _placeholder={{ color: secondaryTextColor }}
                >
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id} style={{ backgroundColor: optionBg, color: optionTextColor }}>
                      {customer.customer_name || `${customer.first_name} ${customer.last_name}`} - {customer.phone}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <HStack spacing={4} w="100%">
                <FormControl isRequired>
                  <FormLabel color={textColor} fontWeight="medium">📅 Tarih</FormLabel>
                  <Input
                    type="date"
                    value={formData.appointment_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, appointment_date: e.target.value }))}
                    bg={inputBg}
                    color={inputTextColor}
                    borderColor={inputBorderColor}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel color={textColor} fontWeight="medium">🕐 Saat</FormLabel>
                  <Input
                    type="time"
                    value={formData.appointment_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, appointment_time: e.target.value }))}
                    bg={inputBg}
                    color={inputTextColor}
                    borderColor={inputBorderColor}
                  />
                </FormControl>
              </HStack>

              <FormControl isRequired>
                <FormLabel color={textColor} fontWeight="medium">🔧 Servis Türü</FormLabel>
                <Select
                  value={formData.service_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, service_type: e.target.value }))}
                  placeholder="Servis türü seçin"
                  bg={inputBg}
                  color={inputTextColor}
                  borderColor={inputBorderColor}
                  _placeholder={{ color: secondaryTextColor }}
                >
                  {serviceTypes.map((type) => (
                    <option key={type} value={type} style={{ backgroundColor: optionBg, color: optionTextColor }}>{type}</option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontWeight="medium">⏱️ Tahmini Süre</FormLabel>
                <Select
                  value={formData.estimated_duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration: parseInt(e.target.value) }))}
                  bg={inputBg}
                  color={inputTextColor}
                  borderColor={inputBorderColor}
                >
                  <option value={30} style={{ backgroundColor: optionBg, color: optionTextColor }}>30 dakika</option>
                  <option value={60} style={{ backgroundColor: optionBg, color: optionTextColor }}>1 saat</option>
                  <option value={90} style={{ backgroundColor: optionBg, color: optionTextColor }}>1.5 saat</option>
                  <option value={120} style={{ backgroundColor: optionBg, color: optionTextColor }}>2 saat</option>
                  <option value={180} style={{ backgroundColor: optionBg, color: optionTextColor }}>3 saat</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontWeight="medium">📝 Açıklama</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Yapılacak işlemler..."
                  bg={inputBg}
                  color={inputTextColor}
                  borderColor={inputBorderColor}
                  _placeholder={{ color: secondaryTextColor }}
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontWeight="medium">💬 Müşteri Notları</FormLabel>
                <Textarea
                  value={formData.customer_notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_notes: e.target.value }))}
                  placeholder="Müşterinin özel istekleri..."
                  bg={inputBg}
                  color={inputTextColor}
                  borderColor={inputBorderColor}
                  _placeholder={{ color: secondaryTextColor }}
                  rows={3}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter bg={modalBg} borderTop="1px solid" borderColor={borderColor} borderBottomRadius="xl">
            <Button 
              variant="ghost" 
              mr={3} 
              onClick={onClose}
              color={cancelButtonColor}
              _hover={{ bg: cancelButtonHoverBg }}
            >
              ✖️ İptal
            </Button>
            <Button 
              colorScheme="brand" 
              onClick={handleSaveAppointment} 
              isLoading={loading}
              px="6"
              fontWeight="bold"
            >
              {selectedAppointment ? '📝 Güncelle' : '➕ Kaydet'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}