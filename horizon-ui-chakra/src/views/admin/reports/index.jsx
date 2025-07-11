import React, { useState } from 'react';
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
  MdDirectionsBike
} from 'react-icons/md';
import Card from 'components/card/Card';
import MiniStatistics from 'components/card/MiniStatistics';
import LineChart from 'components/charts/LineChart';
import BarChart from 'components/charts/BarChart';
import PieChart from 'components/charts/PieChart';

export default function Reports() {
  const brandColor = useColorModeValue('brand.500', 'white');
  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [activeTab, setActiveTab] = useState(0);

  // Sample data for reports
  const revenueData = {
    thisMonth: {
      revenue: 45000,
      growth: 12.5,
      serviceRevenue: 25000,
      partsRevenue: 20000,
      services: 85,
      customers: 65
    },
    lastMonth: {
      revenue: 40000,
      growth: 8.3,
      serviceRevenue: 22000,
      partsRevenue: 18000,
      services: 78,
      customers: 58
    },
    thisYear: {
      revenue: 480000,
      growth: 15.2,
      serviceRevenue: 280000,
      partsRevenue: 200000,
      services: 920,
      customers: 320
    }
  };

  const monthlyRevenueData = {
    labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'],
    datasets: [
      {
        label: 'Gelir',
        data: [38000, 42000, 35000, 48000, 52000, 45000],
        borderColor: '#4FD1C7',
        backgroundColor: 'rgba(79, 209, 199, 0.1)',
      }
    ]
  };

  const serviceTypeData = {
    labels: ['Periyodik Bakım', 'Onarım', 'Acil Onarım', 'Garantili Bakım', 'Modifikasyon'],
    datasets: [
      {
        data: [35, 25, 15, 15, 10],
        backgroundColor: [
          '#4FD1C7',
          '#FF6B6B',
          '#4ECDC4',
          '#45B7D1',
          '#96CEB4'
        ]
      }
    ]
  };

  const topCustomers = [
    { name: 'Ahmet Yılmaz', totalSpent: 15000, services: 8, lastService: '2024-01-15' },
    { name: 'Elif Kaya', totalSpent: 25000, services: 12, lastService: '2024-02-20' },
    { name: 'Mehmet Özkan', totalSpent: 8500, services: 5, lastService: '2023-12-10' },
    { name: 'Fatma Demir', totalSpent: 18000, services: 10, lastService: '2024-01-28' },
    { name: 'Ali Vural', totalSpent: 12500, services: 7, lastService: '2024-02-05' }
  ];

  const topParts = [
    { name: 'Motor Yağı 10W-40', sold: 45, revenue: 3375, category: 'Motor' },
    { name: 'Fren Balata Seti', sold: 28, revenue: 4200, category: 'Fren Sistemi' },
    { name: 'Lastik Seti', sold: 15, revenue: 6750, category: 'Lastik' },
    { name: 'Amortisör Takımı', sold: 8, revenue: 6400, category: 'Süspansiyon' },
    { name: 'Akü 12V', sold: 22, revenue: 3740, category: 'Elektrik' }
  ];

  const technicianPerformance = [
    { name: 'Mehmet Usta (MotoEtiler)', services: 35, revenue: 18500, avgTime: 2.5, rating: 4.8 },
    { name: 'Ali Teknisyen (MotoEtiler)', services: 28, revenue: 15200, avgTime: 3.1, rating: 4.6 },
    { name: 'Hasan Usta (MotoEtiler)', services: 22, revenue: 12800, avgTime: 2.8, rating: 4.9 },
    { name: 'Fatma Teknisyen (MotoEtiler)', services: 18, revenue: 9600, avgTime: 2.2, rating: 4.7 },
    { name: 'Emre Usta (MotoEtiler)', services: 15, revenue: 8200, avgTime: 2.9, rating: 4.5 }
  ];

  const getCurrentPeriodData = () => {
    return revenueData[selectedPeriod];
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

  const currentData = getCurrentPeriodData();

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Period Selection */}
      <Flex justify="space-between" align="center" mb="20px">
        <Text fontSize="2xl" fontWeight="bold" color={brandColor}>
          MotoEtiler Raporlar ve Analizler
        </Text>
        <Select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          w="200px"
        >
          <option value="thisMonth">Bu Ay</option>
          <option value="lastMonth">Geçen Ay</option>
          <option value="thisYear">Bu Yıl</option>
        </Select>
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
            <Icon as={MdTrendingUp} w="56px" h="56px" bg={boxBg} borderRadius="16px" p="12px" />
          }
          name="Büyüme Oranı"
          value={`%${currentData.growth}`}
        />
      </SimpleGrid>

      {/* Growth Alert */}
      {currentData.growth > 10 && (
        <Alert status="success" mb="20px" borderRadius="12px">
          <AlertIcon />
          <Box>
            <AlertTitle>Harika Performans!</AlertTitle>
            <AlertDescription>
              {getPeriodText()} büyüme oranınız %{currentData.growth}. Hedeflerinizi aşıyorsunuz!
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
            <Tab>Teknisyen Performansı</Tab>
          </TabList>

          <TabPanels>
            {/* Revenue Analysis Tab */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, lg: 2 }} gap="20px" mb="20px">
                <Card>
                  <Text fontSize="lg" fontWeight="bold" mb="15px">Aylık Gelir Trendi</Text>
                  <LineChart chartData={monthlyRevenueData} />
                </Card>

                <Card>
                  <Text fontSize="lg" fontWeight="bold" mb="15px">Servis Türü Dağılımı</Text>
                  <PieChart chartData={serviceTypeData} />
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
                    {topParts.map((part, index) => (
                      <Box key={part.name} p="3" borderRadius="md" bg={boxBg}>
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold" fontSize="sm">{part.name}</Text>
                            <Text fontSize="xs" color="gray.500">{part.category}</Text>
                          </VStack>
                          <VStack align="end" spacing={1}>
                            <Text fontWeight="bold" fontSize="sm">₺{part.revenue.toLocaleString()}</Text>
                            <Badge colorScheme="brand" fontSize="xs">{part.sold} adet</Badge>
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
                        </Tr>
                      </Thead>
                      <Tbody>
                        {topCustomers.map((customer, index) => (
                          <Tr key={customer.name}>
                            <Td fontWeight="bold">{customer.name}</Td>
                            <Td>₺{customer.totalSpent.toLocaleString()}</Td>
                            <Td>{customer.services}</Td>
                            <Td>{customer.lastService}</Td>
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
                        <Text fontWeight="bold">15</Text>
                      </HStack>
                      <Progress value={75} colorScheme="green" />
                    </Box>
                    <Box>
                      <HStack justify="space-between" mb="2">
                        <Text>Orta Segment (₺5,000-10,000)</Text>
                        <Text fontWeight="bold">28</Text>
                      </HStack>
                      <Progress value={60} colorScheme="blue" />
                    </Box>
                    <Box>
                      <HStack justify="space-between" mb="2">
                        <Text>Yeni Müşteriler (₺0-5,000)</Text>
                        <Text fontWeight="bold">22</Text>
                      </HStack>
                      <Progress value={40} colorScheme="orange" />
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
                    <StatNumber>₺485</StatNumber>
                    <StatHelpText>Servis başına</StatHelpText>
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
                        <Text fontWeight="bold" color="green.500">45 ürün</Text>
                      </HStack>
                      <Progress value={75} colorScheme="green" />
                    </Box>
                    <Box>
                      <HStack justify="space-between" mb="2">
                        <Text>Düşük Stok</Text>
                        <Text fontWeight="bold" color="yellow.500">12 ürün</Text>
                      </HStack>
                      <Progress value={25} colorScheme="yellow" />
                    </Box>
                    <Box>
                      <HStack justify="space-between" mb="2">
                        <Text>Kritik Stok</Text>
                        <Text fontWeight="bold" color="red.500">3 ürün</Text>
                      </HStack>
                      <Progress value={15} colorScheme="red" />
                    </Box>
                  </VStack>
                </Card>

                <Card>
                  <Text fontSize="lg" fontWeight="bold" mb="15px">Kategori Bazlı Stok Değeri</Text>
                  <VStack spacing={3} align="stretch">
                    {['Motor', 'Fren Sistemi', 'Lastik', 'Süspansiyon', 'Elektrik'].map((category, index) => {
                      const values = [45000, 28000, 35000, 15000, 12000];
                      const colors = ['blue', 'green', 'orange', 'purple', 'red'];
                      return (
                        <Box key={category}>
                          <HStack justify="space-between" mb="2">
                            <Text>{category}</Text>
                            <Text fontWeight="bold">₺{values[index].toLocaleString()}</Text>
                          </HStack>
                          <Progress value={(values[index] / 45000) * 100} colorScheme={colors[index]} />
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
                    <StatNumber>₺135,000</StatNumber>
                    <StatHelpText>Mevcut stok</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Ortalama Stok Devir</StatLabel>
                    <StatNumber>4.2x</StatNumber>
                    <StatHelpText>Yıllık devir</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Stok Yetersizliği</StatLabel>
                    <StatNumber>%8.5</StatNumber>
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

            {/* Technician Performance Tab */}
            <TabPanel>
              <Card>
                <Text fontSize="lg" fontWeight="bold" mb="15px">Teknisyen Performans Tablosu</Text>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Teknisyen</Th>
                        <Th>Toplam Servis</Th>
                        <Th>Toplam Gelir</Th>
                        <Th>Ortalama Süre (saat)</Th>
                        <Th>Müşteri Puanı</Th>
                        <Th>Performans</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {technicianPerformance.map((tech, index) => (
                        <Tr key={tech.name}>
                          <Td fontWeight="bold">{tech.name}</Td>
                          <Td>{tech.services}</Td>
                          <Td>₺{tech.revenue.toLocaleString()}</Td>
                          <Td>{tech.avgTime}</Td>
                          <Td>
                            <Badge colorScheme={tech.rating >= 4.5 ? 'green' : 'yellow'}>
                              {tech.rating}/5
                            </Badge>
                          </Td>
                          <Td>
                            <Progress 
                              value={(tech.services / 35) * 100} 
                              colorScheme={tech.services >= 30 ? 'green' : tech.services >= 20 ? 'yellow' : 'red'} 
                            />
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Card>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap="20px" mt="20px">
                <Card>
                  <Text fontSize="lg" fontWeight="bold" mb="15px">Teknisyen Verimliliği</Text>
                  <VStack spacing={3} align="stretch">
                    <Box>
                      <HStack justify="space-between" mb="2">
                        <Text>Yüksek Performans</Text>
                        <Text fontWeight="bold" color="green.500">2 teknisyen</Text>
                      </HStack>
                      <Progress value={80} colorScheme="green" />
                    </Box>
                    <Box>
                      <HStack justify="space-between" mb="2">
                        <Text>Orta Performans</Text>
                        <Text fontWeight="bold" color="yellow.500">2 teknisyen</Text>
                      </HStack>
                      <Progress value={60} colorScheme="yellow" />
                    </Box>
                    <Box>
                      <HStack justify="space-between" mb="2">
                        <Text>Geliştirilmesi Gereken</Text>
                        <Text fontWeight="bold" color="red.500">1 teknisyen</Text>
                      </HStack>
                      <Progress value={40} colorScheme="red" />
                    </Box>
                  </VStack>
                </Card>

                <Card>
                  <Text fontSize="lg" fontWeight="bold" mb="15px">Teknisyen Özetleri</Text>
                  <SimpleGrid columns={1} gap="20px">
                    <Stat>
                      <StatLabel>Ortalama Servis Süresi</StatLabel>
                      <StatNumber>2.7 saat</StatNumber>
                      <StatHelpText>Tüm teknisyenler</StatHelpText>
                    </Stat>
                    <Stat>
                      <StatLabel>Ortalama Müşteri Puanı</StatLabel>
                      <StatNumber>4.7/5</StatNumber>
                      <StatHelpText>Memnuniyet oranı</StatHelpText>
                    </Stat>
                    <Stat>
                      <StatLabel>Ortalama Haftalık Servis</StatLabel>
                      <StatNumber>6.2 servis</StatNumber>
                      <StatHelpText>Teknisyen başına</StatHelpText>
                    </Stat>
                  </SimpleGrid>
                </Card>
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>
    </Box>
  );
} 