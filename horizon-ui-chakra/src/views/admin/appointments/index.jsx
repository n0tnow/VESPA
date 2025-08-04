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
                  <FormLabel>Tarih Seç</FormLabel>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </FormControl>
              </Stack>

              {/* Loading State */}
              {loading ? (
                <Box textAlign="center" py="40px">
                  <Text>Randevular yükleniyor...</Text>
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
                          <Td>{appointment?.appointmentNumber || '-'}</Td>
                          <Td>
                            <Box>
                              <Text fontWeight="bold">{appointment?.customerName || 'Bilinmeyen'}</Text>
                              <Text fontSize="sm" color="gray.500">{appointment?.customerPhone || '-'}</Text>
                            </Box>
                          </Td>
                          <Td>
                            <Box>
                              <Text>{appointment?.vespaModel || '-'}</Text>
                              <Text fontSize="sm" color="gray.500">{appointment?.licensePlate || '-'}</Text>
                            </Box>
                          </Td>
                          <Td>
                            <Box>
                              <Text>{appointment?.date || '-'}</Text>
                              <Text fontSize="sm" color="brand.500">{appointment?.time || '-'}</Text>
                            </Box>
                          </Td>
                          <Td>{appointment?.serviceType || '-'}</Td>
                          <Td>{appointment?.technician || '-'}</Td>
                          <Td>
                            <Select
                              size="sm"
                              value={appointment?.status || 'SCHEDULED'}
                              onChange={(e) => handleStatusChange(appointment?.id, e.target.value)}
                              w="140px"
                            >
                              <option value="SCHEDULED">Planlandı</option>
                              <option value="CONFIRMED">Onaylandı</option>
                              <option value="IN_PROGRESS">Devam Ediyor</option>
                              <option value="COMPLETED">Tamamlandı</option>
                              <option value="CANCELLED">İptal</option>
                              <option value="NO_SHOW">Gelmedi</option>
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
                  <Card>
                    <Text fontSize="xl" fontWeight="bold" mb="20px">
                      Randevu Takvimi - {selectedDate}
                    </Text>
                    <VStack align="stretch" spacing={2}>
                      {(todaysAppointments || []).map((appointment) => (
                        <Box
                          key={appointment?.id || Math.random()}
                          p={3}
                          borderRadius="md"
                          bg={appointmentBg}
                          borderLeft="4px solid"
                          borderColor={`${getStatusColor(appointment?.status)}.500`}
                        >
                          <HStack justify="space-between">
                            <Box>
                              <Text fontWeight="bold">{appointment?.time || '-'} - {appointment?.customerName || 'Bilinmeyen'}</Text>
                              <Text fontSize="sm">{appointment?.serviceType || '-'}</Text>
                              <Text fontSize="xs" color="gray.500">{appointment?.vespaModel || '-'}</Text>
                            </Box>
                            <Badge colorScheme={getStatusColor(appointment?.status)}>
                              {getStatusText(appointment?.status)}
                            </Badge>
                          </HStack>
                        </Box>
                      ))}
                      {(todaysAppointments || []).length === 0 && (
                        <Text textAlign="center" color="gray.500" py="40px">
                          Seçilen tarihte randevu bulunmuyor.
                        </Text>
                      )}
                    </VStack>
                  </Card>
                </GridItem>
                <GridItem>
                  <MiniCalendar />
                </GridItem>
              </Grid>
            </TabPanel>

            {/* Time Slots Tab */}
            <TabPanel>
              <Text fontSize="xl" fontWeight="bold" mb="20px">
                Müsait Zaman Slotları - {selectedDate}
              </Text>
              <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} spacing={4}>
                {(availableSlots || []).map((slot, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    h="60px"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, appointment_time: slot?.time || slot?.slot_time }));
                      handleAddAppointment();
                    }}
                  >
                    <VStack spacing={1}>
                      <Text fontSize="sm" fontWeight="bold">{slot?.time || slot?.slot_time || '-'}</Text>
                      <Text fontSize="xs" color="gray.500">Müsait</Text>
                    </VStack>
                  </Button>
                ))}
              </SimpleGrid>
              {(availableSlots || []).length === 0 && (
                <Text textAlign="center" color="gray.500" py="40px">
                  Seçilen tarihte müsait slot bulunmuyor.
                </Text>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>

      {/* Add/Edit Appointment Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedAppointment ? 'Randevu Düzenle' : 'Yeni Randevu Ekle'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Müşteri</FormLabel>
                <Select
                  value={formData.customer_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_id: e.target.value }))}
                  placeholder="Müşteri seçin"
                >
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.customer_name || `${customer.first_name} ${customer.last_name}`} - {customer.phone}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <HStack spacing={4} w="100%">
                <FormControl isRequired>
                  <FormLabel>Tarih</FormLabel>
                  <Input
                    type="date"
                    value={formData.appointment_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, appointment_date: e.target.value }))}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Saat</FormLabel>
                  <Input
                    type="time"
                    value={formData.appointment_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, appointment_time: e.target.value }))}
                  />
                </FormControl>
              </HStack>

              <FormControl isRequired>
                <FormLabel>Servis Türü</FormLabel>
                <Select
                  value={formData.service_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, service_type: e.target.value }))}
                  placeholder="Servis türü seçin"
                >
                  {serviceTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Tahmini Süre (dakika)</FormLabel>
                <Select
                  value={formData.estimated_duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration: parseInt(e.target.value) }))}
                >
                  <option value={30}>30 dakika</option>
                  <option value={60}>1 saat</option>
                  <option value={90}>1.5 saat</option>
                  <option value={120}>2 saat</option>
                  <option value={180}>3 saat</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Açıklama</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Yapılacak işlemler..."
                />
              </FormControl>

              <FormControl>
                <FormLabel>Müşteri Notları</FormLabel>
                <Textarea
                  value={formData.customer_notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_notes: e.target.value }))}
                  placeholder="Müşterinin özel istekleri..."
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              İptal
            </Button>
            <Button colorScheme="brand" onClick={handleSaveAppointment} isLoading={loading}>
              {selectedAppointment ? 'Güncelle' : 'Kaydet'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}