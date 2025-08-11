/*!
=========================================================
* MotoEtiler Vespa Bayi Yönetim Sistemi - v1.0.0
=========================================================

* MotoEtiler Vespa Bayi Yönetim Sistemi
* Copyright 2024 MotoEtiler

* Designed and Coded by Development Team

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

// Chakra imports
import {
  Box,
  Flex,
  Icon,
  SimpleGrid,
  useColorModeValue,
  Text,
  Badge,
  Stack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  VStack,
  HStack,
  Divider,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
// Custom components
import MiniCalendar from "components/calendar/MiniCalendar";
import MiniStatistics from "components/card/MiniStatistics";
import Card from "components/card/Card";
import React, { useState, useEffect } from "react";
import apiService from "services/apiService";
import {
  MdDirectionsBike,
  MdPeople,
  MdBuild,
  MdAttachMoney,
  MdTrendingUp,
  MdWarning,
  MdCheckCircle,
  MdPending,
} from "react-icons/md";

export default function VespaDashboard() {
  // Chakra Color Mode
  const brandColor = useColorModeValue("brand.500", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  
  // Real dashboard data from API
  const [dashboardData, setDashboardData] = useState({
    totalCustomers: 0,
    totalServices: 0,
    totalRevenue: 0,
    lowStockItems: 0,
    pendingServices: 0,
    inProgressServices: 0,
    completedServices: 0,
    monthlyGrowth: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load dashboard data from API
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      // Parallel fetch core datasets
      const todayStr = new Date().toISOString().split('T')[0];
      const future = new Date();
      future.setDate(future.getDate() + 14);
      const futureStr = future.toISOString().split('T')[0];

      const [servicesResp, apptsResp, lowStockResp, customersResp] = await Promise.all([
        apiService.getServices(1, 100),
        apiService.getAppointments(todayStr, futureStr),
        apiService.getLowStockParts().catch(() => ({})),
        apiService.getCustomers(1, 100)
      ]);

      const services = servicesResp?.services || servicesResp?.results || servicesResp || [];
      const appointments = apptsResp?.appointments || apptsResp?.results || apptsResp || [];
      const critical = lowStockResp?.critical_stock || [];
      const low = lowStockResp?.low_stock || [];
      const totalLowStock = (lowStockResp?.total_alerts) ?? (critical.length + low.length);
      const customers = customersResp?.customers || customersResp?.results || customersResp || [];

      const pendingServices = services.filter(s => (s.status || '').toLowerCase() === 'pending').length;
      const inProgressServices = services.filter(s => (s.status || '').toLowerCase() === 'in_progress').length;
      const completedServices = services.filter(s => (s.status || '').toLowerCase() === 'completed').length;
      // Bu Ay Gelir: cari akışla tutarlılık için bu ayki INCOME toplamını kullan
      const startMonth = new Date();
      startMonth.setDate(1);
      const startStr = startMonth.toISOString().split('T')[0];
      const endMonth = new Date(startMonth.getFullYear(), startMonth.getMonth()+1, 0);
      const endStr = endMonth.toISOString().split('T')[0];
      const cashSummary = await apiService.getAccountingDashboardRange(startStr, endStr);
      let totalRevenue = Number(cashSummary?.range_summary?.billed_revenue?.services || cashSummary?.range_summary?.billed_revenue?.service || 0) + Number(cashSummary?.range_summary?.billed_revenue?.sales || 0);
      if (!totalRevenue || totalRevenue <= 0) {
        totalRevenue = Number(cashSummary?.range_summary?.total_income || 0);
      }

      setDashboardData({
        totalCustomers: customers.length,
        totalServices: services.length,
         totalRevenue: totalRevenue,
        lowStockItems: totalLowStock || 0,
        pendingServices,
        inProgressServices,
        completedServices,
        monthlyGrowth: 0
      });

      // Build recent and upcoming lists
      const recent = [...services]
        .sort((a, b) => String(b.service_date).localeCompare(String(a.service_date)))
        .slice(0, 8)
        .map(s => ({
          id: s.id,
          customer: s.customer_name || '-',
          plate: s.license_plate || '-',
          type: s.service_type || '-',
          date: s.service_date || '-',
          status: (s.status || '').toLowerCase(),
          amount: s.total_cost || 0
        }));
      setRecentServices(recent);

      const upcoming = appointments
        .sort((a, b) => String(a.appointment_date).localeCompare(String(b.appointment_date)))
        .slice(0, 6)
        .map(a => ({
          customer: a.customer_name || '-',
          plate: a.license_plate || '-',
          date: a.appointment_date || '-',
          type: a.service_type || 'Servis'
        }));
      setUpcomingServices(upcoming);

      const lowList = [...critical, ...low]
        .slice(0, 6)
        .map(p => ({
          name: p.part_name || p.name || 'Parça',
          stock: p.total_stock ?? p.stock ?? 0,
          min: p.min_stock_level ?? p.min ?? 0
        }));
      setLowStockItems(lowList);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Dashboard verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  const [recentServices, setRecentServices] = useState([]);
  const [upcomingServices, setUpcomingServices] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'in_progress': return 'blue';
      case 'pending': return 'yellow';
      default: return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Tamamlandı';
      case 'in_progress': return 'Devam Ediyor';
      case 'pending': return 'Beklemede';
      default: return 'Bilinmiyor';
    }
  };

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      {/* Welcome Section */}
      <Flex justify="space-between" align="center" mb="20px">
        <VStack align="start" spacing={1}>
          <Text fontSize="2xl" fontWeight="bold" color={brandColor}>
            MotoEtiler Vespa Bayi
          </Text>
          <Text fontSize="md" color="gray.500">
            Hoş geldiniz! MotoEtiler'in güncel durumunu buradan takip edebilirsiniz.
          </Text>
        </VStack>
        <Badge colorScheme="green" p="2" borderRadius="md">
          Bugün: {new Date().toLocaleDateString('tr-TR')}
        </Badge>
      </Flex>

      {/* Key Performance Indicators */}
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 4 }}
        gap='20px'
        mb='20px'>
        <MiniStatistics
          startContent={
            <Icon as={MdPeople} w="56px" h="56px" bg={boxBg} borderRadius="16px" p="12px" />
          }
          name='Toplam Müşteri'
          value={dashboardData.totalCustomers.toString()}
          growth={`+${dashboardData.monthlyGrowth}%`}
        />
        <MiniStatistics
          startContent={
            <Icon as={MdBuild} w="56px" h="56px" bg={boxBg} borderRadius="16px" p="12px" />
          }
          name='Bu Ay Servis'
          value={dashboardData.totalServices.toString()}
        />
        <MiniStatistics
          startContent={
            <Icon as={MdAttachMoney} w="56px" h="56px" bg={boxBg} borderRadius="16px" p="12px" />
          }
          name='Bu Ay Gelir'
          value={`₺${dashboardData.totalRevenue.toLocaleString()}`}
          growth={`+${dashboardData.monthlyGrowth}%`}
        />
        <MiniStatistics
          startContent={
            <Icon as={MdBuild} w="56px" h="56px" bg={boxBg} borderRadius="16px" p="12px" />
          }
          name='Açık İş Emri'
          value={(dashboardData.pendingServices + dashboardData.inProgressServices).toString()}
        />
      </SimpleGrid>

      {/* Alerts Section */}
      <Stack spacing={3} mb="20px">
        {dashboardData.lowStockItems > 0 && (
          <Alert status="warning" borderRadius="12px">
            <AlertIcon />
            <Box>
              <AlertTitle>Düşük Stok Uyarısı!</AlertTitle>
              <AlertDescription>
                {dashboardData.lowStockItems} ürünün stoğu minimum seviyede. Tedarik yapmanız gerekiyor.
              </AlertDescription>
            </Box>
          </Alert>
        )}
        
        {dashboardData.pendingServices > 0 && (
          <Alert status="info" borderRadius="12px">
            <AlertIcon />
            <Box>
              <AlertTitle>Bekleyen Servisler</AlertTitle>
              <AlertDescription>
                {dashboardData.pendingServices} servis işlemi teknisyen ataması bekliyor.
              </AlertDescription>
            </Box>
          </Alert>
        )}
      </Stack>

      {/* Main Content Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="20px" mb="20px">
        {/* Recent Services */}
        <Card gridColumn={{ base: "1", xl: "1 / 3" }}>
          <Flex justify="space-between" align="center" mb="20px">
            <Text fontSize="lg" fontWeight="bold" color={brandColor}>
              Son Servisler
            </Text>
            <Badge colorScheme="brand">
              {recentServices.length} Kayıt
            </Badge>
          </Flex>
          
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Müşteri</Th>
                   <Th>Plaka</Th>
                  <Th>Tür</Th>
                  <Th>Tarih</Th>
                  <Th>Durum</Th>
                  <Th>Tutar</Th>
                </Tr>
              </Thead>
              <Tbody>
                {recentServices.map((service) => (
                  <Tr key={service.id}>
                    <Td fontWeight="bold">{service.customer}</Td>
                    <Td>{service.plate}</Td>
                    <Td>{service.type}</Td>
                    <Td>{service.date}</Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(service.status)} size="sm">
                        {getStatusText(service.status)}
                      </Badge>
                    </Td>
                    <Td fontWeight="bold">₺{service.amount.toLocaleString()}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Card>

        {/* Calendar */}
        <Card>
          <Text fontSize="lg" fontWeight="bold" color={brandColor} mb="15px">
            Takvim
          </Text>
          <MiniCalendar h='100%' minW='100%' selectRange={false} />
        </Card>
      </SimpleGrid>

      {/* Second Row */}
      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="20px" mb="20px">
        {/* Upcoming Services */}
        <Card>
          <Text fontSize="lg" fontWeight="bold" color={brandColor} mb="15px">
            Yaklaşan Servisler
          </Text>
          <VStack spacing={3} align="stretch">
            {upcomingServices.map((service, index) => (
              <Box key={index} p="3" borderRadius="md" bg={boxBg}>
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold" fontSize="sm">{service.customer}</Text>
                    <Text fontSize="xs" color="gray.500">{service.vespa}</Text>
                  </VStack>
                  <VStack align="end" spacing={1}>
                    <Text fontSize="xs" fontWeight="bold">{service.date}</Text>
                    <Badge colorScheme="blue" size="sm">{service.type}</Badge>
                  </VStack>
                </HStack>
              </Box>
            ))}
          </VStack>
        </Card>

        {/* Low Stock Items */}
        <Card>
          <Text fontSize="lg" fontWeight="bold" color={brandColor} mb="15px">
            Düşük Stok Uyarısı
          </Text>
          <VStack spacing={3} align="stretch">
            {lowStockItems.map((item, index) => (
              <Box key={index} p="3" borderRadius="md" bg={boxBg}>
                <HStack justify="space-between" mb="2">
                  <Text fontWeight="bold" fontSize="sm">{item.name}</Text>
                  <Badge colorScheme="red" size="sm">
                    {item.stock} / {item.min}
                  </Badge>
                </HStack>
                <Progress 
                  value={(item.stock / item.min) * 100} 
                  colorScheme="red" 
                  size="sm"
                />
              </Box>
            ))}
          </VStack>
        </Card>

        {/* Quick Stats */}
        <Card>
          <Text fontSize="lg" fontWeight="bold" color={brandColor} mb="15px">
            Hızlı İstatistikler
          </Text>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <HStack>
                <Icon as={MdCheckCircle} color="green.500" />
                <Text fontSize="sm">Tamamlanan Servisler</Text>
              </HStack>
              <Text fontWeight="bold">{dashboardData.completedServices}</Text>
            </HStack>
            
            <HStack justify="space-between">
              <HStack>
                <Icon as={MdPending} color="yellow.500" />
                <Text fontSize="sm">Bekleyen Servisler</Text>
              </HStack>
              <Text fontWeight="bold">{dashboardData.pendingServices}</Text>
            </HStack>
            
            <HStack justify="space-between">
              <HStack>
                <Icon as={MdWarning} color="red.500" />
                <Text fontSize="sm">Düşük Stok</Text>
              </HStack>
              <Text fontWeight="bold">{dashboardData.lowStockItems}</Text>
            </HStack>
            
            <Divider />
            
            <HStack justify="space-between">
              <HStack>
                <Icon as={MdTrendingUp} color="green.500" />
                <Text fontSize="sm">Büyüme Oranı</Text>
              </HStack>
              <Text fontWeight="bold" color="green.500">
                +{dashboardData.monthlyGrowth}%
              </Text>
            </HStack>
          </VStack>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
