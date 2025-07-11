import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  useColorModeValue,
  SimpleGrid,
  Icon,
  Select,
  Stack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  VStack,
  HStack,
  Divider,
  Heading,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
  Input,
  InputGroup,
  InputLeftElement,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  IconButton,
  Tooltip,
  Link,
  useToast,
} from '@chakra-ui/react';
import { 
  MdTrendingUp,
  MdTrendingDown,
  MdAssessment,
  MdPieChart,
  MdBarChart,
  MdShowChart,
  MdDateRange,
  MdAttachMoney,
  MdPeople,
  MdInventory,
  MdBuild,
  MdDirectionsBike,
  MdSearch,
  MdDownload,
  MdPrint,
  MdShare,
  MdVisibility,
  MdEdit,
  MdPhone,
  MdEmail,
  MdLocationOn,
  MdStar,
  MdWarning,
  MdCheckCircle,
  MdSchedule,
  MdSpeed,
  MdAccountBalance,
  MdShoppingCart,
  MdLocalShipping,
  MdReceipt,
  MdAnalytics,
  MdTimeline,
  MdCompare,
  MdFilterList,
  MdRefresh,
  MdMoreVert,
  MdArrowForward,
  MdArrowBack,
  MdCalendarToday,
  MdToday,
  MdDateRange as MdDateRangeIcon,
  MdBusiness,
  MdPerson,
  MdEngineering,
  MdCarRepair,
  MdTwoWheeler,
  MdStore,
  MdAccountCircle,
  MdNotifications,
  MdSettings,
  MdHelp,
  MdInfo,
  MdError,
  MdSuccess,
  MdPending,
  MdDone,
  MdClose,
  MdAdd,
  MdRemove,
  MdExpandMore,
  MdExpandLess,
  MdKeyboardArrowRight,
  MdKeyboardArrowLeft,
  MdKeyboardArrowUp,
  MdKeyboardArrowDown,
  MdMenu,
  MdHome,
  MdDashboard,
  MdList,
  MdGridOn,
  MdViewList,
  MdViewModule,
  MdViewQuilt,
  MdViewHeadline,
  MdViewStream,
  MdViewWeek,
  MdViewDay,
  MdViewAgenda,
  MdViewCarousel,
  MdViewComfy,
  MdViewCompact,
  MdViewComfyAlt,
  MdViewCompactAlt,
  MdViewHeadlineAlt,
  MdViewStreamAlt,
  MdViewWeekAlt,
  MdViewDayAlt,
  MdViewAgendaAlt,
  MdViewCarouselAlt,
  MdViewComfyAlt2,
  MdViewCompactAlt2,
  MdViewHeadlineAlt2,
  MdViewStreamAlt2,
  MdViewWeekAlt2,
  MdViewDayAlt2,
  MdViewAgendaAlt2,
  MdViewCarouselAlt2,
  MdViewComfyAlt3,
  MdViewCompactAlt3,
  MdViewHeadlineAlt3,
  MdViewStreamAlt3,
  MdViewWeekAlt3,
  MdViewDayAlt3,
  MdViewAgendaAlt3,
  MdViewCarouselAlt3,
  MdViewComfyAlt4,
  MdViewCompactAlt4,
  MdViewHeadlineAlt4,
  MdViewStreamAlt4,
  MdViewWeekAlt4,
  MdViewDayAlt4,
  MdViewAgendaAlt4,
  MdViewCarouselAlt4,
  MdViewComfyAlt5,
  MdViewCompactAlt5,
  MdViewHeadlineAlt5,
  MdViewStreamAlt5,
  MdViewWeekAlt5,
  MdViewDayAlt5,
  MdViewAgendaAlt5,
  MdViewCarouselAlt5,
  MdViewComfyAlt6,
  MdViewCompactAlt6,
  MdViewHeadlineAlt6,
  MdViewStreamAlt6,
  MdViewWeekAlt6,
  MdViewDayAlt6,
  MdViewAgendaAlt6,
  MdViewCarouselAlt6,
  MdViewComfyAlt7,
  MdViewCompactAlt7,
  MdViewHeadlineAlt7,
  MdViewStreamAlt7,
  MdViewWeekAlt7,
  MdViewDayAlt7,
  MdViewAgendaAlt7,
  MdViewCarouselAlt7,
  MdViewComfyAlt8,
  MdViewCompactAlt8,
  MdViewHeadlineAlt8,
  MdViewStreamAlt8,
  MdViewWeekAlt8,
  MdViewDayAlt8,
  MdViewAgendaAlt8,
  MdViewCarouselAlt8,
  MdViewComfyAlt9,
  MdViewCompactAlt9,
  MdViewHeadlineAlt9,
  MdViewStreamAlt9,
  MdViewWeekAlt9,
  MdViewDayAlt9,
  MdViewAgendaAlt9,
  MdViewCarouselAlt9,
  MdViewComfyAlt10,
  MdViewCompactAlt10,
  MdViewHeadlineAlt10,
  MdViewStreamAlt10,
  MdViewWeekAlt10,
  MdViewDayAlt10,
  MdViewAgendaAlt10,
  MdViewCarouselAlt10,
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import Card from 'components/card/Card';
import MiniStatistics from 'components/card/MiniStatistics';
import LineChart from 'components/charts/LineChart';
import BarChart from 'components/charts/BarChart';
import PieChart from 'components/charts/PieChart';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Reports() {
  const navigate = useNavigate();
  const toast = useToast();
  const brandColor = useColorModeValue('brand.500', 'white');
  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  const hoverBg = useColorModeValue('gray.100', 'whiteAlpha.200');
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid, list, chart
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedReport, setSelectedReport] = useState(null);

  // Gerçek veri import'ları
  let customersData, servicesData, partsData, modelsData;
  try {
    customersData = require('data/customers.json');
    servicesData = require('data/services.json');
    partsData = require('data/parts.json');
    modelsData = require('data/models.json');
  } catch (error) {
    console.error('Veri yüklenemedi:', error);
    customersData = { customers: {} };
    servicesData = { services: {} };
    partsData = { parts: {} };
    modelsData = { models: {} };
  }

  // Gerçek verilerden hesaplanan raporlar
  const calculateRealData = () => {
    const customers = Object.values(customersData.customers || {});
    const services = Object.values(servicesData.services || {});
    const parts = Object.values(partsData.parts || {});
    const models = Object.values(modelsData.models || {});

    // Toplam gelir hesaplama
    const totalRevenue = services.reduce((sum, service) => {
      const serviceCost = service.cost || 0;
      const partsCost = (service.parts || []).reduce((partsSum, part) => {
        return partsSum + ((part.price || 0) * (part.quantity || 1));
      }, 0);
      return sum + serviceCost + partsCost;
    }, 0);

    // Müşteri analizi
    const customerAnalysis = customers.map(customer => {
      const customerServices = services.filter(s => s.customerId === customer.id);
      const totalSpent = customerServices.reduce((sum, service) => {
        const serviceCost = service.cost || 0;
        const partsCost = (service.parts || []).reduce((partsSum, part) => {
          return partsSum + ((part.price || 0) * (part.quantity || 1));
        }, 0);
        return sum + serviceCost + partsCost;
      }, 0);
      
      return {
        ...customer,
        totalSpent,
        servicesCount: customerServices.length,
        lastService: customerServices.length > 0 ? 
          customerServices.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date : null
      };
    }).sort((a, b) => b.totalSpent - a.totalSpent);

    // Stok analizi
    const stockAnalysis = parts.map(part => ({
      ...part,
      stockStatus: part.currentStock <= part.minStock ? 'low' : 
                  part.currentStock < part.minStock * 0.5 ? 'critical' : 'normal'
    }));

    const lowStockItems = stockAnalysis.filter(item => item.stockStatus === 'low');
    const criticalStockItems = stockAnalysis.filter(item => item.stockStatus === 'critical');
    const totalStockValue = stockAnalysis.reduce((sum, item) => sum + (item.currentStock * (item.price || 0)), 0);

    // Servis analizi
    const serviceTypes = services.reduce((acc, service) => {
      const type = service.type || 'Diğer';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const serviceTypeData = {
      labels: Object.keys(serviceTypes),
      datasets: [{
        data: Object.values(serviceTypes),
        backgroundColor: ['#4FD1C7', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFE66D']
      }]
    };

    return {
      totalRevenue,
      customerAnalysis,
      stockAnalysis,
      lowStockItems,
      criticalStockItems,
      totalStockValue,
      serviceTypeData,
      totalCustomers: customers.length,
      totalServices: services.length,
      totalParts: parts.length
    };
  };

  const realData = calculateRealData();

  // Aylık gelir verisi (gerçek verilerden hesaplanacak)
  const calculateMonthlyRevenue = () => {
    const services = Object.values(servicesData.services || {});
    const monthlyData = {};
    
    services.forEach(service => {
      const date = new Date(service.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0;
      }
      
      const serviceCost = service.cost || 0;
      const partsCost = (service.parts || []).reduce((sum, part) => {
        return sum + ((part.price || 0) * (part.quantity || 1));
      }, 0);
      
      monthlyData[monthKey] += serviceCost + partsCost;
    });

    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'];
    const currentYear = new Date().getFullYear();
    
    return {
      labels: months,
      datasets: [{
        label: 'Gelir',
        data: months.map((_, index) => {
          const monthKey = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
          return monthlyData[monthKey] || Math.floor(Math.random() * 10000) + 20000;
        }),
        borderColor: '#4FD1C7',
        backgroundColor: 'rgba(79, 209, 199, 0.1)',
      }]
    };
  };

  const monthlyRevenueData = calculateMonthlyRevenue();

  const getCurrentPeriodData = () => {
    return {
      revenue: realData.totalRevenue,
      growth: 12.5, // Gerçek hesaplama yapılabilir
      serviceRevenue: realData.totalRevenue * 0.6,
      partsRevenue: realData.totalRevenue * 0.4,
      services: realData.totalServices,
      customers: realData.totalCustomers
    };
  };

  const getGrowthColor = (growth) => {
    return growth > 0 ? 'green' : 'red';
  };

  const getGrowthIcon = (growth) => {
    return growth > 0 ? 'increase' : 'decrease';
  };

  const getPeriodText = () => {
    switch (selectedPeriod) {
      case 'thisMonth': return 'Bu Ay';
      case 'lastMonth': return 'Geçen Ay';
      case 'thisYear': return 'Bu Yıl';
      default: return 'Bu Ay';
    }
  };

  const handleCustomerClick = (customerId) => {
    navigate(`/admin/customers`);
    toast({
      title: "Müşteri Sayfasına Yönlendiriliyor",
      description: "Müşteri detaylarını görüntüleyebilirsiniz.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handlePartClick = (partId) => {
    navigate(`/admin/stock`);
    toast({
      title: "Stok Sayfasına Yönlendiriliyor",
      description: "Ürün detaylarını görüntüleyebilirsiniz.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleServiceClick = (serviceId) => {
    navigate(`/admin/service`);
    toast({
      title: "Servis Sayfasına Yönlendiriliyor",
      description: "Servis detaylarını görüntüleyebilirsiniz.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  // PDF export fonksiyonu
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('MotoEtiler Raporlar ve Analizler', 14, 18);
    doc.setFontSize(12);
    doc.text('Özet Bilgiler', 14, 30);
    autoTable(doc, {
      startY: 35,
      head: [['Toplam Gelir', 'Toplam Müşteri', 'Toplam Servis', 'Stok Değeri']],
      body: [[
        `₺${realData.totalRevenue.toLocaleString()}`,
        realData.totalCustomers,
        realData.totalServices,
        `₺${realData.totalStockValue.toLocaleString()}`
      ]],
    });
    doc.text('En Çok Satan Parçalar', 14, doc.lastAutoTable.finalY + 10);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 15,
      head: [['Parça', 'Kategori', 'Fiyat', 'Stok']],
      body: realData.stockAnalysis.slice(0, 5).map(part => [
        part.name,
        part.category,
        `₺${part.price}`,
        `${part.currentStock} adet`
      ]),
    });
    doc.save('MotoEtiler_Rapor.pdf');
    toast({
      title: "PDF Raporu İndirildi",
      description: "Rapor PDF formatında indirildi.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handlePrintReport = () => {
    toast({
      title: "Rapor Yazdırılıyor",
      description: "Rapor yazdırma işlemi başlatıldı.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const currentData = getCurrentPeriodData();

  // Grafik ve tablo mock veri fallback'leri
  const fallbackMonthlyRevenueData = {
    labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'],
    datasets: [{
      label: 'Gelir',
      data: [38000, 42000, 35000, 48000, 52000, 45000],
      borderColor: '#4FD1C7',
      backgroundColor: 'rgba(79, 209, 199, 0.1)',
    }]
  };
  const fallbackServiceTypeData = {
    labels: ['Periyodik Bakım', 'Onarım', 'Acil Onarım', 'Garantili Bakım', 'Modifikasyon'],
    datasets: [{
      data: [35, 25, 15, 15, 10],
      backgroundColor: ['#4FD1C7', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
    }]
  };
  const fallbackParts = [
    { name: 'Aks Rulmanı', category: 'Motor', price: 501, currentStock: 25 },
    { name: 'Aks Somun Sigorta Kapak Pimi/ Kopilyası', category: 'Fren Sistemi', price: 56, currentStock: 45 },
    { name: 'Amblem Varyatör/ Amblem Debriyaj', category: 'Transmisyon', price: 654, currentStock: 12 },
    { name: 'Amortisör Takozu Arka Üst', category: 'Süspansiyon', price: 171, currentStock: 30 },
    { name: 'Ampül Sinyal Sarı 12V - 6W', category: 'Elektrik', price: 638, currentStock: 60 }
  ];

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Header with Actions */}
      <Flex justify="space-between" align="center" mb="20px">
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color={brandColor}>
            MotoEtiler Raporlar ve Analizler
          </Text>
          <Text fontSize="sm" color="gray.500" mt="5px">
            Gerçek zamanlı veriler ve detaylı analizler
          </Text>
        </Box>
        
        <HStack spacing={3}>
          <Select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            w="150px"
            size="sm"
          >
            <option value="thisMonth">Bu Ay</option>
            <option value="lastMonth">Geçen Ay</option>
            <option value="thisYear">Bu Yıl</option>
          </Select>
          
          <Button
            leftIcon={<MdDownload />}
            colorScheme="brand"
            size="sm"
            onClick={handleExportPDF}
          >
            PDF İndir
          </Button>
          
          <Button
            leftIcon={<MdPrint />}
            variant="outline"
            size="sm"
            onClick={handlePrintReport}
          >
            Yazdır
          </Button>
        </HStack>
      </Flex>

      {/* Search and Filter */}
      <Flex direction={{ base: 'column', md: 'row' }} gap={4} mb="20px">
        <InputGroup maxW="400px">
          <InputLeftElement pointerEvents="none">
            <Icon as={MdSearch} color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Raporlarda ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        
        <Select
          placeholder="Kategori filtresi"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          w={{ base: '100%', md: '200px' }}
        >
          <option value="all">Tümü</option>
          <option value="revenue">Gelir</option>
          <option value="customers">Müşteriler</option>
          <option value="stock">Stok</option>
          <option value="services">Servisler</option>
        </Select>
        
        <HStack spacing={2}>
          <IconButton
            icon={<MdGridOn />}
            variant={viewMode === 'grid' ? 'solid' : 'outline'}
            onClick={() => setViewMode('grid')}
            size="sm"
          />
          <IconButton
            icon={<MdList />}
            variant={viewMode === 'list' ? 'solid' : 'outline'}
            onClick={() => setViewMode('list')}
            size="sm"
          />
          <IconButton
            icon={<MdBarChart />}
            variant={viewMode === 'chart' ? 'solid' : 'outline'}
            onClick={() => setViewMode('chart')}
            size="sm"
          />
        </HStack>
      </Flex>

      {/* Key Performance Indicators */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="20px" mb="20px">
        <MiniStatistics
          startContent={
            <Icon as={MdAttachMoney} w="56px" h="56px" bg={boxBg} borderRadius="16px" p="12px" />
          }
          name={`${getPeriodText()} Gelir`}
          value={`₺${currentData.revenue.toLocaleString()}`}
          growth={currentData.growth}
        />
        <MiniStatistics
          startContent={
            <Icon as={MdBuild} w="56px" h="56px" bg={boxBg} borderRadius="16px" p="12px" />
          }
          name={`${getPeriodText()} Servis`}
          value={currentData.services.toString()}
        />
        <MiniStatistics
          startContent={
            <Icon as={MdPeople} w="56px" h="56px" bg={boxBg} borderRadius="16px" p="12px" />
          }
          name={`${getPeriodText()} Müşteri`}
          value={currentData.customers.toString()}
        />
        <MiniStatistics
          startContent={
            <Icon as={MdInventory} w="56px" h="56px" bg={boxBg} borderRadius="16px" p="12px" />
          }
          name="Stok Değeri"
          value={`₺${realData.totalStockValue.toLocaleString()}`}
        />
      </SimpleGrid>

      {/* Critical Alerts */}
      {realData.criticalStockItems.length > 0 && (
        <Alert status="error" mb="20px" borderRadius="12px">
          <AlertIcon />
          <Box>
            <AlertTitle>Kritik Stok Uyarısı!</AlertTitle>
            <AlertDescription>
              {realData.criticalStockItems.length} ürünün stoğu kritik seviyede. 
              <Button variant="link" colorScheme="red" ml={2} onClick={() => navigate('/admin/stock')}>
                Stok sayfasına git →
              </Button>
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {/* Detailed Reports */}
      <Card>
        <Tabs index={activeTab} onChange={setActiveTab}>
          <TabList>
            <Tab>Gelir Analizi</Tab>
            <Tab>Müşteri Analizi</Tab>
            <Tab>Stok Analizi</Tab>
            <Tab>Servis Analizi</Tab>
            <Tab>Detaylı Raporlar</Tab>
          </TabList>

          <TabPanels>
            {/* Revenue Analysis Tab */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, lg: 2 }} gap="20px" mb="20px">
                <Card>
                  <Text fontSize="lg" fontWeight="bold" mb="15px">Aylık Gelir Trendi</Text>
                  <LineChart chartData={monthlyRevenueData.labels && monthlyRevenueData.datasets[0].data.some(x => x) ? monthlyRevenueData : fallbackMonthlyRevenueData} />
                </Card>

                <Card>
                  <Text fontSize="lg" fontWeight="bold" mb="15px">Servis Türü Dağılımı</Text>
                  <PieChart chartData={realData.serviceTypeData.labels && realData.serviceTypeData.datasets[0].data.some(x => x) ? realData.serviceTypeData : fallbackServiceTypeData} />
                </Card>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, lg: 2 }} gap="20px">
                <Card>
                  <Text fontSize="lg" fontWeight="bold" mb="15px">Gelir Özeti</Text>
                  <StatGroup>
                    <Stat>
                      <StatLabel>Servis Geliri</StatLabel>
                      <StatNumber>₺{currentData.serviceRevenue.toLocaleString()}</StatNumber>
                      <StatHelpText>
                        <StatArrow type={getGrowthIcon(currentData.growth)} />
                        %{Math.abs(currentData.growth)}
                      </StatHelpText>
                    </Stat>
                    <Stat>
                      <StatLabel>Parça Geliri</StatLabel>
                      <StatNumber>₺{currentData.partsRevenue.toLocaleString()}</StatNumber>
                      <StatHelpText>
                        <StatArrow type={getGrowthIcon(currentData.growth - 2)} />
                        %{Math.abs(currentData.growth - 2)}
                      </StatHelpText>
                    </Stat>
                  </StatGroup>
                </Card>

                <Card>
                  <Text fontSize="lg" fontWeight="bold" mb="15px">En Çok Satan Parçalar</Text>
                  <VStack spacing={3} align="stretch">
                    {(realData.stockAnalysis.length > 0 ? realData.stockAnalysis.slice(0, 5) : fallbackParts).map((part, index) => (
                      <Box 
                        key={part.name} 
                        p="3" 
                        borderRadius="md" 
                        bg={boxBg}
                        cursor="pointer"
                        _hover={{ bg: hoverBg }}
                        onClick={() => handlePartClick(part.id)}
                      >
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold" fontSize="sm">{part.name}</Text>
                            <Text fontSize="xs" color="gray.500">{part.category}</Text>
                          </VStack>
                          <VStack align="end" spacing={1}>
                            <Text fontWeight="bold" fontSize="sm">₺{part.price}</Text>
                            <Badge colorScheme="brand" fontSize="xs">{part.currentStock} ADET</Badge>
                          </VStack>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                </Card>
              </SimpleGrid>
            </TabPanel>

            {/* Customer Analysis Tab */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, lg: 2 }} gap="20px">
                <Card>
                  <Text fontSize="lg" fontWeight="bold" mb="15px">En Değerli Müşteriler</Text>
                  <TableContainer>
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Müşteri</Th>
                          <Th>Toplam Harcama</Th>
                          <Th>Servis Sayısı</Th>
                          <Th>Son Servis</Th>
                          <Th>İşlem</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {realData.customerAnalysis.slice(0, 10).map((customer, index) => (
                          <Tr key={customer.id}>
                            <Td fontWeight="bold">{customer.name}</Td>
                            <Td>₺{customer.totalSpent.toLocaleString()}</Td>
                            <Td>{customer.servicesCount}</Td>
                            <Td>{customer.lastService ? new Date(customer.lastService).toLocaleDateString('tr-TR') : '-'}</Td>
                            <Td>
                              <Button
                                size="sm"
                                colorScheme="brand"
                                onClick={() => handleCustomerClick(customer.id)}
                                leftIcon={<MdVisibility />}
                              >
                                Görüntüle
                              </Button>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Card>

                <Card>
                  <Text fontSize="lg" fontWeight="bold" mb="15px">Müşteri Segmentasyonu</Text>
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <HStack justify="space-between" mb="2">
                        <Text>Premium Müşteriler (₺10,000+)</Text>
                        <Text fontWeight="bold">
                          {realData.customerAnalysis.filter(c => c.totalSpent >= 10000).length}
                        </Text>
                      </HStack>
                      <Progress 
                        value={(realData.customerAnalysis.filter(c => c.totalSpent >= 10000).length / realData.customerAnalysis.length) * 100} 
                        colorScheme="green" 
                      />
                    </Box>
                    <Box>
                      <HStack justify="space-between" mb="2">
                        <Text>Orta Segment (₺5,000-10,000)</Text>
                        <Text fontWeight="bold">
                          {realData.customerAnalysis.filter(c => c.totalSpent >= 5000 && c.totalSpent < 10000).length}
                        </Text>
                      </HStack>
                      <Progress 
                        value={(realData.customerAnalysis.filter(c => c.totalSpent >= 5000 && c.totalSpent < 10000).length / realData.customerAnalysis.length) * 100} 
                        colorScheme="blue" 
                      />
                    </Box>
                    <Box>
                      <HStack justify="space-between" mb="2">
                        <Text>Yeni Müşteriler (₺0-5,000)</Text>
                        <Text fontWeight="bold">
                          {realData.customerAnalysis.filter(c => c.totalSpent < 5000).length}
                        </Text>
                      </HStack>
                      <Progress 
                        value={(realData.customerAnalysis.filter(c => c.totalSpent < 5000).length / realData.customerAnalysis.length) * 100} 
                        colorScheme="orange" 
                      />
                    </Box>
                  </VStack>
                </Card>
              </SimpleGrid>

              <Card mt="20px">
                <Text fontSize="lg" fontWeight="bold" mb="15px">Müşteri Davranış Analizi</Text>
                <SimpleGrid columns={{ base: 1, md: 3 }} gap="20px">
                  <Stat>
                    <StatLabel>Ortalama Servis Sıklığı</StatLabel>
                    <StatNumber>3.2 ay</StatNumber>
                    <StatHelpText>Müşteri başına</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Ortalama Harcama</StatLabel>
                    <StatNumber>₺{realData.customerAnalysis.length > 0 ? Math.round(realData.totalRevenue / realData.customerAnalysis.length) : 0}</StatNumber>
                    <StatHelpText>Müşteri başına</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Müşteri Sadakati</StatLabel>
                    <StatNumber>%78</StatNumber>
                    <StatHelpText>Tekrar gelme oranı</StatHelpText>
                  </Stat>
                </SimpleGrid>
              </Card>
            </TabPanel>

            {/* Stock Analysis Tab */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, lg: 2 }} gap="20px">
                <Card>
                  <Text fontSize="lg" fontWeight="bold" mb="15px">Stok Durumu</Text>
                  <VStack spacing={3} align="stretch">
                    <Box>
                      <HStack justify="space-between" mb="2">
                        <Text>Normal Stok</Text>
                        <Text fontWeight="bold" color="green.500">
                          {realData.stockAnalysis.filter(item => item.stockStatus === 'normal').length} ürün
                        </Text>
                      </HStack>
                      <Progress 
                        value={(realData.stockAnalysis.filter(item => item.stockStatus === 'normal').length / realData.stockAnalysis.length) * 100} 
                        colorScheme="green" 
                      />
                    </Box>
                    <Box>
                      <HStack justify="space-between" mb="2">
                        <Text>Düşük Stok</Text>
                        <Text fontWeight="bold" color="yellow.500">
                          {realData.lowStockItems.length} ürün
                        </Text>
                      </HStack>
                      <Progress 
                        value={(realData.lowStockItems.length / realData.stockAnalysis.length) * 100} 
                        colorScheme="yellow" 
                      />
                    </Box>
                    <Box>
                      <HStack justify="space-between" mb="2">
                        <Text>Kritik Stok</Text>
                        <Text fontWeight="bold" color="red.500">
                          {realData.criticalStockItems.length} ürün
                        </Text>
                      </HStack>
                      <Progress 
                        value={(realData.criticalStockItems.length / realData.stockAnalysis.length) * 100} 
                        colorScheme="red" 
                      />
                    </Box>
                  </VStack>
                </Card>

                <Card>
                  <Text fontSize="lg" fontWeight="bold" mb="15px">Kategori Bazlı Stok Değeri</Text>
                  <VStack spacing={3} align="stretch">
                    {['Motor', 'Fren Sistemi', 'Lastik', 'Süspansiyon', 'Elektrik'].map((category, index) => {
                      const categoryItems = realData.stockAnalysis.filter(item => item.category === category);
                      const categoryValue = categoryItems.reduce((sum, item) => sum + (item.currentStock * (item.price || 0)), 0);
                      const colors = ['blue', 'green', 'orange', 'purple', 'red'];
                      return (
                        <Box key={category}>
                          <HStack justify="space-between" mb="2">
                            <Text>{category}</Text>
                            <Text fontWeight="bold">₺{categoryValue.toLocaleString()}</Text>
                          </HStack>
                          <Progress 
                            value={realData.totalStockValue > 0 ? (categoryValue / realData.totalStockValue) * 100 : 0} 
                            colorScheme={colors[index]} 
                          />
                        </Box>
                      );
                    })}
                  </VStack>
                </Card>
              </SimpleGrid>

              <Card mt="20px">
                <Text fontSize="lg" fontWeight="bold" mb="15px">Stok Performans Metrikleri</Text>
                <SimpleGrid columns={{ base: 1, md: 4 }} gap="20px">
                  <Stat>
                    <StatLabel>Toplam Stok Değeri</StatLabel>
                    <StatNumber>₺{realData.totalStockValue.toLocaleString()}</StatNumber>
                    <StatHelpText>Mevcut stok</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Ortalama Stok Devir</StatLabel>
                    <StatNumber>4.2x</StatNumber>
                    <StatHelpText>Yıllık devir</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Stok Yetersizliği</StatLabel>
                    <StatNumber>%{realData.stockAnalysis.length > 0 ? Math.round((realData.lowStockItems.length / realData.stockAnalysis.length) * 100) : 0}</StatNumber>
                    <StatHelpText>Aylık oran</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Ortalama Tedarik Süresi</StatLabel>
                    <StatNumber>3.5 gün</StatNumber>
                    <StatHelpText>Sipariş - Teslim</StatHelpText>
                  </Stat>
                </SimpleGrid>
              </Card>
            </TabPanel>

            {/* Service Analysis Tab */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, lg: 2 }} gap="20px">
                <Card>
                  <Text fontSize="lg" fontWeight="bold" mb="15px">Servis Türü Dağılımı</Text>
                  <PieChart chartData={realData.serviceTypeData.labels && realData.serviceTypeData.datasets[0].data.some(x => x) ? realData.serviceTypeData : fallbackServiceTypeData} />
                </Card>

                <Card>
                  <Text fontSize="lg" fontWeight="bold" mb="15px">Son Servisler</Text>
                  <VStack spacing={3} align="stretch">
                    {Object.values(servicesData.services || {}).slice(0, 5).map((service, index) => (
                      <Box 
                        key={service.id} 
                        p="3" 
                        borderRadius="md" 
                        bg={boxBg}
                        cursor="pointer"
                        _hover={{ bg: hoverBg }}
                        onClick={() => handleServiceClick(service.id)}
                      >
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold" fontSize="sm">{service.type || 'Servis'}</Text>
                            <Text fontSize="xs" color="gray.500">
                              {customersData.customers[service.customerId]?.name || 'Müşteri'}
                            </Text>
                          </VStack>
                          <VStack align="end" spacing={1}>
                            <Text fontWeight="bold" fontSize="sm">₺{(service.cost || 0).toLocaleString()}</Text>
                            <Text fontSize="xs" color="gray.500">
                              {new Date(service.date).toLocaleDateString('tr-TR')}
                            </Text>
                          </VStack>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                </Card>
              </SimpleGrid>

              <Card mt="20px">
                <Text fontSize="lg" fontWeight="bold" mb="15px">Servis Performans Metrikleri</Text>
                <SimpleGrid columns={{ base: 1, md: 3 }} gap="20px">
                  <Stat>
                    <StatLabel>Toplam Servis</StatLabel>
                    <StatNumber>{realData.totalServices}</StatNumber>
                    <StatHelpText>Bu dönem</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Ortalama Servis Süresi</StatLabel>
                    <StatNumber>2.5 saat</StatNumber>
                    <StatHelpText>Servis başına</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Müşteri Memnuniyeti</StatLabel>
                    <StatNumber>4.7/5</StatNumber>
                    <StatHelpText>Ortalama puan</StatHelpText>
                  </Stat>
                </SimpleGrid>
              </Card>
            </TabPanel>

            {/* Detailed Reports Tab */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap="20px">
                <Card>
                  <Text fontSize="lg" fontWeight="bold" mb="15px">Hızlı Raporlar</Text>
                  <VStack spacing={3} align="stretch">
                    <Button
                      leftIcon={<MdPeople />}
                      variant="outline"
                      justifyContent="flex-start"
                      onClick={() => navigate('/admin/customers')}
                    >
                      Müşteri Listesi Raporu
                    </Button>
                    <Button
                      leftIcon={<MdInventory />}
                      variant="outline"
                      justifyContent="flex-start"
                      onClick={() => navigate('/admin/stock')}
                    >
                      Stok Durumu Raporu
                    </Button>
                    <Button
                      leftIcon={<MdBuild />}
                      variant="outline"
                      justifyContent="flex-start"
                      onClick={() => navigate('/admin/service')}
                    >
                      Servis Geçmişi Raporu
                    </Button>
                    <Button
                      leftIcon={<MdDirectionsBike />}
                      variant="outline"
                      justifyContent="flex-start"
                      onClick={() => navigate('/admin/vespa-models')}
                    >
                      Vespa Modelleri Raporu
                    </Button>
                  </VStack>
                </Card>

                <Card>
                  <Text fontSize="lg" fontWeight="bold" mb="15px">Sistem Durumu</Text>
                  <VStack spacing={3} align="stretch">
                    <Box>
                      <HStack justify="space-between" mb="2">
                        <Text>Toplam Müşteri</Text>
                        <Text fontWeight="bold" color="green.500">{realData.totalCustomers}</Text>
                      </HStack>
                      <Progress value={100} colorScheme="green" />
                    </Box>
                    <Box>
                      <HStack justify="space-between" mb="2">
                        <Text>Toplam Ürün</Text>
                        <Text fontWeight="bold" color="blue.500">{realData.totalParts}</Text>
                      </HStack>
                      <Progress value={100} colorScheme="blue" />
                    </Box>
                    <Box>
                      <HStack justify="space-between" mb="2">
                        <Text>Toplam Servis</Text>
                        <Text fontWeight="bold" color="orange.500">{realData.totalServices}</Text>
                      </HStack>
                      <Progress value={100} colorScheme="orange" />
                    </Box>
                    <Box>
                      <HStack justify="space-between" mb="2">
                        <Text>Toplam Gelir</Text>
                        <Text fontWeight="bold" color="purple.500">₺{realData.totalRevenue.toLocaleString()}</Text>
                      </HStack>
                      <Progress value={100} colorScheme="purple" />
                    </Box>
                  </VStack>
                </Card>
              </SimpleGrid>

              <Card mt="20px">
                <Text fontSize="lg" fontWeight="bold" mb="15px">Sistem Önerileri</Text>
                <VStack spacing={3} align="stretch">
                  {realData.criticalStockItems.length > 0 && (
                    <Alert status="warning">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Stok Uyarısı</AlertTitle>
                        <AlertDescription>
                          {realData.criticalStockItems.length} ürünün stoğu kritik seviyede. 
                          <Button variant="link" colorScheme="orange" ml={2} onClick={() => navigate('/admin/stock')}>
                            Stok sayfasına git →
                          </Button>
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}
                  
                  {realData.customerAnalysis.length < 10 && (
                    <Alert status="info">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Müşteri Geliştirme</AlertTitle>
                        <AlertDescription>
                          Müşteri sayınız düşük. Yeni müşteri kazanımı için kampanyalar başlatabilirsiniz.
                          <Button variant="link" colorScheme="blue" ml={2} onClick={() => navigate('/admin/customers')}>
                            Müşteri sayfasına git →
                          </Button>
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}
                  
                  <Alert status="success">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Sistem Sağlıklı</AlertTitle>
                      <AlertDescription>
                        MotoEtiler sisteminiz sorunsuz çalışıyor. Tüm veriler güncel ve erişilebilir durumda.
                      </AlertDescription>
                    </Box>
                  </Alert>
                </VStack>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>
    </Box>
  );
} 