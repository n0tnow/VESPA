import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
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
} from '@chakra-ui/react';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdNotifications, MdDirectionsBike } from 'react-icons/md';
import Card from 'components/card/Card';
import MiniStatistics from 'components/card/MiniStatistics';

export default function CustomerManagement() {
  const brandColor = useColorModeValue('brand.500', 'white');
  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // MotoEtiler müşteri verileri
  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: 'Ahmet Yılmaz',
      email: 'ahmet@email.com',
      phone: '+90 532 123 45 67',
      vespaModel: 'Vespa Primavera 150',
      lastService: '2024-01-15',
      nextService: '2024-04-15',
      status: 'active',
      totalSpent: 15000,
      servicesCount: 8,
      registrationDate: '2022-03-10',
      notes: 'MotoEtiler\'den satın aldı, düzenli müşteri'
    },
    {
      id: 2,
      name: 'Elif Kaya',
      email: 'elif@email.com',
      phone: '+90 533 987 65 43',
      vespaModel: 'Vespa GTS 300',
      lastService: '2024-02-20',
      nextService: '2024-05-20',
      status: 'pending',
      totalSpent: 25000,
      servicesCount: 12,
      registrationDate: '2021-08-15',
      notes: 'Premium müşteri, MotoEtiler VIP üyesi'
    },
    {
      id: 3,
      name: 'Mehmet Özkan',
      email: 'mehmet@email.com',
      phone: '+90 534 456 78 90',
      vespaModel: 'Vespa Sprint 150',
      lastService: '2023-12-10',
      nextService: '2024-03-10',
      status: 'overdue',
      totalSpent: 8500,
      servicesCount: 5,
      registrationDate: '2023-01-20',
      notes: 'Servis hatırlatması gönderildi'
    },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vespaModel: '',
    notes: '',
    status: 'active'
  });

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      vespaModel: '',
      notes: '',
      status: 'active'
    });
    onOpen();
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      vespaModel: customer.vespaModel,
      notes: customer.notes || '',
      status: customer.status
    });
    onOpen();
  };

  const handleSaveCustomer = () => {
    if (selectedCustomer) {
      // Update existing customer
      setCustomers(customers.map(c => 
        c.id === selectedCustomer.id 
          ? { ...c, ...formData }
          : c
      ));
    } else {
      // Add new customer
      const newCustomer = {
        ...formData,
        id: Date.now(),
        lastService: null,
        nextService: null,
        totalSpent: 0,
        servicesCount: 0,
        registrationDate: new Date().toISOString().split('T')[0]
      };
      setCustomers([...customers, newCustomer]);
    }
    onClose();
  };

  const handleDeleteCustomer = (customerId) => {
    setCustomers(customers.filter(c => c.id !== customerId));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'pending': return 'yellow';
      case 'overdue': return 'red';
      default: return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'pending': return 'Beklemede';
      case 'overdue': return 'Gecikmiş';
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
          value={customers.filter(c => c.status === 'active').length.toString()}
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
          >
            <option value="all">Tümü</option>
            <option value="active">Aktif</option>
            <option value="pending">Beklemede</option>
            <option value="overdue">Gecikmiş</option>
          </Select>
        </Stack>

        {/* Customer Table */}
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Müşteri Adı</Th>
                <Th>İletişim</Th>
                <Th>Vespa Modeli</Th>
                <Th>Son Servis</Th>
                <Th>Sonraki Servis</Th>
                <Th>Durum</Th>
                <Th>Toplam Harcama</Th>
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
                        Kayıt: {customer.registrationDate}
                      </Text>
                    </Box>
                  </Td>
                  <Td>
                    <Box>
                      <Text>{customer.email}</Text>
                      <Text fontSize="sm" color="gray.500">{customer.phone}</Text>
                    </Box>
                  </Td>
                  <Td>{customer.vespaModel}</Td>
                  <Td>{customer.lastService || 'Henüz yok'}</Td>
                  <Td>{customer.nextService || 'Henüz yok'}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(customer.status)}>
                      {getStatusText(customer.status)}
                    </Badge>
                  </Td>
                  <Td>₺{customer.totalSpent.toLocaleString()}</Td>
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

        {filteredCustomers.length === 0 && (
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
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedCustomer ? 'Müşteri Düzenle' : 'Yeni Müşteri Ekle'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Müşteri Adı</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Müşteri adını girin"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>E-posta</FormLabel>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="E-posta adresini girin"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Telefon</FormLabel>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Telefon numarasını girin"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Vespa Modeli</FormLabel>
                <Select
                  value={formData.vespaModel}
                  onChange={(e) => setFormData({...formData, vespaModel: e.target.value})}
                  placeholder="Vespa modelini seçin"
                >
                  <option value="Vespa Primavera 150">Vespa Primavera 150</option>
                  <option value="Vespa GTS 300">Vespa GTS 300</option>
                  <option value="Vespa Sprint 150">Vespa Sprint 150</option>
                  <option value="Vespa LX 150">Vespa LX 150</option>
                  <option value="Vespa ET2 150">Vespa ET2 150</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Durum</FormLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="active">Aktif</option>
                  <option value="pending">Beklemede</option>
                  <option value="overdue">Gecikmiş</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Notlar</FormLabel>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Müşteri hakkında notlar"
                  rows={3}
                />
              </FormControl>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              İptal
            </Button>
            <Button colorScheme="brand" onClick={handleSaveCustomer}>
              {selectedCustomer ? 'Güncelle' : 'Ekle'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
} 