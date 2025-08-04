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
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  Card as ChakraCard,
  CardHeader,
  CardBody,
  Heading,
} from '@chakra-ui/react';
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdDownload,
  MdAssessment,
  MdAccountBalance,
  MdReceipt,
  MdTrendingUp,
  MdTrendingDown,
  MdAttachMoney,
  MdCalendarToday,
  MdCheckCircle,
  MdPending,
  MdWarning,
} from 'react-icons/md';
import Card from 'components/card/Card';
import MiniStatistics from 'components/card/MiniStatistics';
import apiService from 'services/apiService';

export default function TaxReports() {
  const brandColor = useColorModeValue('brand.500', 'white');
  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedReport, setSelectedReport] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // State management
  const [taxReports, setTaxReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPeriod, setCurrentPeriod] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });

  // Form state for new tax report
  const [formData, setFormData] = useState({
    report_period_start: '',
    report_period_end: '',
    report_type: 'MONTHLY',
    notes: ''
  });

  // Tax summary state
  const [taxSummary, setTaxSummary] = useState({
    total_revenue: 0,
    total_expenses: 0,
    taxable_income: 0,
    calculated_tax: 0,
    collected_vat: 0,
    paid_vat: 0,
    net_vat: 0
  });

  // Load data on mount
  useEffect(() => {
    loadData();
    loadTaxSummary();
  }, [currentPeriod]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // This would be a new API endpoint we need to add
      // const response = await apiService.getTaxReports();
      // For now, using mock data structure based on database design
      const mockReports = [
        {
          id: 1,
          report_period_start: '2024-01-01',
          report_period_end: '2024-01-31',
          report_type: 'MONTHLY',
          total_revenue: 125000.00,
          total_expenses: 45000.00,
          taxable_income: 80000.00,
          calculated_tax: 17600.00,
          paid_tax: 15000.00,
          remaining_tax: 2600.00,
          collected_vat: 25000.00,
          paid_vat: 9000.00,
          net_vat: 16000.00,
          status: 'FINALIZED',
          finalized_date: '2024-02-05',
          created_date: '2024-02-01'
        },
        {
          id: 2,
          report_period_start: '2024-02-01',
          report_period_end: '2024-02-29',
          report_type: 'MONTHLY',
          total_revenue: 142000.00,
          total_expenses: 52000.00,
          taxable_income: 90000.00,
          calculated_tax: 19800.00,
          paid_tax: 0.00,
          remaining_tax: 19800.00,
          collected_vat: 28400.00,
          paid_vat: 10400.00,
          net_vat: 18000.00,
          status: 'DRAFT',
          finalized_date: null,
          created_date: '2024-03-01'
        }
      ];

      setTaxReports(mockReports);

    } catch (error) {
      console.error('Error loading tax reports:', error);
      setError('Vergi raporları yüklenirken hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTaxSummary = async () => {
    try {
      // This would call the accounting dashboard API
      const dashboardData = await apiService.getDashboardData();
      
      setTaxSummary({
        total_revenue: dashboardData.total_revenue || 0,
        total_expenses: dashboardData.total_expenses || 0,
        taxable_income: (dashboardData.total_revenue || 0) - (dashboardData.total_expenses || 0),
        calculated_tax: ((dashboardData.total_revenue || 0) - (dashboardData.total_expenses || 0)) * 0.22, // 22% income tax
        collected_vat: (dashboardData.total_revenue || 0) * 0.20, // 20% VAT
        paid_vat: (dashboardData.total_expenses || 0) * 0.20, // 20% VAT on expenses
        net_vat: ((dashboardData.total_revenue || 0) * 0.20) - ((dashboardData.total_expenses || 0) * 0.20)
      });

    } catch (error) {
      console.error('Error loading tax summary:', error);
    }
  };

  const handleGenerateReport = () => {
    setSelectedReport(null);
    const startOfMonth = new Date(currentPeriod.year, currentPeriod.month - 1, 1);
    const endOfMonth = new Date(currentPeriod.year, currentPeriod.month, 0);
    
    setFormData({
      report_period_start: startOfMonth.toISOString().split('T')[0],
      report_period_end: endOfMonth.toISOString().split('T')[0],
      report_type: 'MONTHLY',
      notes: ''
    });
    onOpen();
  };

  const handleEditReport = (report) => {
    setSelectedReport(report);
    setFormData({
      report_period_start: report.report_period_start,
      report_period_end: report.report_period_end,
      report_type: report.report_type,
      notes: report.notes || ''
    });
    onOpen();
  };

  const handleSaveReport = async () => {
    try {
      setLoading(true);

      if (selectedReport) {
        // Update existing report
        // await apiService.updateTaxReport(selectedReport.id, formData);
      } else {
        // Generate new tax report
        // await apiService.generateTaxReport(formData);
      }

      await loadData();
      onClose();

    } catch (error) {
      console.error('Error saving tax report:', error);
      setError('Vergi raporu kaydedilirken hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeReport = async (reportId) => {
    if (!window.confirm('Bu raporu kesinleştirmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    try {
      setLoading(true);
      // await apiService.finalizeTaxReport(reportId);
      await loadData();
    } catch (error) {
      console.error('Error finalizing tax report:', error);
      setError('Rapor kesinleştirilirken hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async (reportId) => {
    try {
      // await apiService.exportTaxReportPDF(reportId);
      // This would trigger a PDF download
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setError('PDF dışa aktarılırken hata oluştu: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT': return 'yellow';
      case 'FINALIZED': return 'green';
      case 'SUBMITTED': return 'blue';
      default: return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'DRAFT': return 'Taslak';
      case 'FINALIZED': return 'Kesinleşti';
      case 'SUBMITTED': return 'Gönderildi';
      default: return 'Bilinmiyor';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const reportTypes = [
    { value: 'MONTHLY', label: 'Aylık' },
    { value: 'QUARTERLY', label: 'Üç Aylık' },
    { value: 'ANNUAL', label: 'Yıllık' }
  ];

  // Calculate statistics
  const totalTaxOwed = taxReports.reduce((sum, report) => sum + (report.remaining_tax || 0), 0);
  const totalVATOwed = taxReports.reduce((sum, report) => sum + (report.net_vat || 0), 0);
  const pendingReports = taxReports.filter(report => report.status === 'DRAFT').length;

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Statistics Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="20px" mb="20px">
        <MiniStatistics
          startContent={
            <Icon as={MdAssessment} w="56px" h="56px" bg={boxBg} borderRadius="16px" p="12px" />
          }
          name="Toplam Gelir"
          value={formatCurrency(taxSummary.total_revenue)}
        />
        <MiniStatistics
          startContent={
            <Icon as={MdAccountBalance} w="56px" h="56px" bg={boxBg} borderRadius="16px" p="12px" />
          }
          name="Ödenecek Vergi"
          value={formatCurrency(totalTaxOwed)}
        />
        <MiniStatistics
          startContent={
            <Icon as={MdReceipt} w="56px" h="56px" bg={boxBg} borderRadius="16px" p="12px" />
          }
          name="Net KDV"
          value={formatCurrency(totalVATOwed)}
        />
        <MiniStatistics
          startContent={
            <Icon as={MdPending} w="56px" h="56px" bg={boxBg} borderRadius="16px" p="12px" />
          }
          name="Bekleyen Raporlar"
          value={pendingReports.toString()}
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
            <Tab>📊 Vergi Raporları</Tab>
            <Tab>📈 Mali Özet</Tab>
            <Tab>⚙️ Vergi Ayarları</Tab>
          </TabList>

          <TabPanels>
            {/* Tax Reports Tab */}
            <TabPanel>
              <Flex justify="space-between" align="center" mb="20px">
                <Text fontSize="2xl" fontWeight="bold" color={brandColor}>
                  Vergi Beyanı Raporları
                </Text>
                <HStack spacing={3}>
                  <Select
                    w="120px"
                    value={currentPeriod.year}
                    onChange={(e) => setCurrentPeriod(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  >
                    <option value={2024}>2024</option>
                    <option value={2023}>2023</option>
                    <option value={2022}>2022</option>
                  </Select>
                  <Select
                    w="100px"
                    value={currentPeriod.month}
                    onChange={(e) => setCurrentPeriod(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleDateString('tr-TR', { month: 'long' })}
                      </option>
                    ))}
                  </Select>
                  <Button
                    leftIcon={<MdAdd />}
                    colorScheme="brand"
                    onClick={handleGenerateReport}
                  >
                    Rapor Oluştur
                  </Button>
                </HStack>
              </Flex>

              {/* Loading State */}
              {loading ? (
                <Box textAlign="center" py="40px">
                  <Text>Vergi raporları yükleniyor...</Text>
                </Box>
              ) : (
                /* Tax Reports Table */
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Dönem</Th>
                        <Th>Tür</Th>
                        <Th>Toplam Gelir</Th>
                        <Th>Vergi Matrahı</Th>
                        <Th>Hesaplanan Vergi</Th>
                        <Th>Net KDV</Th>
                        <Th>Durum</Th>
                        <Th>İşlemler</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {taxReports.map((report) => (
                        <Tr key={report.id}>
                          <Td>
                            <Box>
                              <Text fontWeight="bold">
                                {new Date(report.report_period_start).toLocaleDateString('tr-TR')} - 
                                {new Date(report.report_period_end).toLocaleDateString('tr-TR')}
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                {report.report_type === 'MONTHLY' ? 'Aylık' : 
                                 report.report_type === 'QUARTERLY' ? 'Üç Aylık' : 'Yıllık'}
                              </Text>
                            </Box>
                          </Td>
                          <Td>{report.report_type}</Td>
                          <Td>{formatCurrency(report.total_revenue)}</Td>
                          <Td>{formatCurrency(report.taxable_income)}</Td>
                          <Td>
                            <Box>
                              <Text>{formatCurrency(report.calculated_tax)}</Text>
                              {report.remaining_tax > 0 && (
                                <Text fontSize="sm" color="red.500">
                                  Kalan: {formatCurrency(report.remaining_tax)}
                                </Text>
                              )}
                            </Box>
                          </Td>
                          <Td>
                            <Text color={report.net_vat > 0 ? 'red.500' : 'green.500'}>
                              {formatCurrency(Math.abs(report.net_vat))}
                            </Text>
                          </Td>
                          <Td>
                            <Badge colorScheme={getStatusColor(report.status)}>
                              {getStatusText(report.status)}
                            </Badge>
                          </Td>
                          <Td>
                            <Stack direction="row" spacing={1}>
                              <IconButton
                                icon={<MdEdit />}
                                size="sm"
                                colorScheme="blue"
                                onClick={() => handleEditReport(report)}
                                isDisabled={report.status === 'FINALIZED'}
                                title="Düzenle"
                              />
                              <IconButton
                                icon={<MdDownload />}
                                size="sm"
                                colorScheme="green"
                                onClick={() => handleExportPDF(report.id)}
                                title="PDF İndir"
                              />
                              {report.status === 'DRAFT' && (
                                <IconButton
                                  icon={<MdCheckCircle />}
                                  size="sm"
                                  colorScheme="orange"
                                  onClick={() => handleFinalizeReport(report.id)}
                                  title="Kesinleştir"
                                />
                              )}
                            </Stack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              )}
            </TabPanel>

            {/* Financial Summary Tab */}
            <TabPanel>
              <Text fontSize="2xl" fontWeight="bold" color={brandColor} mb="20px">
                Mali Özet - {currentPeriod.month}/{currentPeriod.year}
              </Text>

              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb="20px">
                {/* Revenue Card */}
                <ChakraCard>
                  <CardHeader>
                    <Heading size="md">💰 Gelir Bilgileri</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      <Stat>
                        <StatLabel>Toplam Gelir</StatLabel>
                        <StatNumber>{formatCurrency(taxSummary.total_revenue)}</StatNumber>
                        <StatHelpText>
                          <StatArrow type="increase" />
                          Bu ay
                        </StatHelpText>
                      </Stat>
                      <Divider />
                      <Stat>
                        <StatLabel>Toplam Gider</StatLabel>
                        <StatNumber>{formatCurrency(taxSummary.total_expenses)}</StatNumber>
                      </Stat>
                      <Divider />
                      <Stat>
                        <StatLabel>Net Kar</StatLabel>
                        <StatNumber color="green.500">
                          {formatCurrency(taxSummary.total_revenue - taxSummary.total_expenses)}
                        </StatNumber>
                      </Stat>
                    </VStack>
                  </CardBody>
                </ChakraCard>

                {/* Tax Card */}
                <ChakraCard>
                  <CardHeader>
                    <Heading size="md">🏛️ Vergi Bilgileri</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      <Stat>
                        <StatLabel>Vergi Matrahı</StatLabel>
                        <StatNumber>{formatCurrency(taxSummary.taxable_income)}</StatNumber>
                      </Stat>
                      <Divider />
                      <Stat>
                        <StatLabel>Gelir Vergisi (%22)</StatLabel>
                        <StatNumber color="red.500">
                          {formatCurrency(taxSummary.calculated_tax)}
                        </StatNumber>
                      </Stat>
                      <Progress 
                        value={(taxSummary.calculated_tax / taxSummary.total_revenue) * 100} 
                        colorScheme="red" 
                        size="sm"
                      />
                    </VStack>
                  </CardBody>
                </ChakraCard>

                {/* VAT Card */}
                <ChakraCard>
                  <CardHeader>
                    <Heading size="md">📋 KDV Bilgileri</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      <Stat>
                        <StatLabel>Tahsil Edilen KDV</StatLabel>
                        <StatNumber>{formatCurrency(taxSummary.collected_vat)}</StatNumber>
                      </Stat>
                      <Divider />
                      <Stat>
                        <StatLabel>Ödenen KDV</StatLabel>
                        <StatNumber>{formatCurrency(taxSummary.paid_vat)}</StatNumber>
                      </Stat>
                      <Divider />
                      <Stat>
                        <StatLabel>Net KDV</StatLabel>
                        <StatNumber color={taxSummary.net_vat > 0 ? 'red.500' : 'green.500'}>
                          {formatCurrency(Math.abs(taxSummary.net_vat))}
                        </StatNumber>
                        <StatHelpText>
                          {taxSummary.net_vat > 0 ? 'Ödenecek' : 'İade'}
                        </StatHelpText>
                      </Stat>
                    </VStack>
                  </CardBody>
                </ChakraCard>
              </SimpleGrid>
            </TabPanel>

            {/* Tax Settings Tab */}
            <TabPanel>
              <Text fontSize="2xl" fontWeight="bold" color={brandColor} mb="20px">
                Vergi Ayarları
              </Text>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <ChakraCard>
                  <CardHeader>
                    <Heading size="md">Vergi Oranları</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4}>
                      <FormControl>
                        <FormLabel>KDV Oranı (%)</FormLabel>
                        <Input type="number" defaultValue="20" step="0.01" />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Gelir Vergisi Oranı (%)</FormLabel>
                        <Input type="number" defaultValue="22" step="0.01" />
                      </FormControl>
                      <Button colorScheme="brand" w="full">
                        Ayarları Kaydet
                      </Button>
                    </VStack>
                  </CardBody>
                </ChakraCard>

                <ChakraCard>
                  <CardHeader>
                    <Heading size="md">Vergi Dairesi Bilgileri</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4}>
                      <FormControl>
                        <FormLabel>Vergi Dairesi</FormLabel>
                        <Input defaultValue="Beşiktaş Vergi Dairesi" />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Vergi Numarası</FormLabel>
                        <Input defaultValue="1234567890" />
                      </FormControl>
                      <Button colorScheme="brand" w="full">
                        Bilgileri Güncelle
                      </Button>
                    </VStack>
                  </CardBody>
                </ChakraCard>
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>

      {/* Generate/Edit Tax Report Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedReport ? 'Vergi Raporu Düzenle' : 'Yeni Vergi Raporu Oluştur'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <HStack spacing={4} w="100%">
                <FormControl isRequired>
                  <FormLabel>Başlangıç Tarihi</FormLabel>
                  <Input
                    type="date"
                    value={formData.report_period_start}
                    onChange={(e) => setFormData(prev => ({ ...prev, report_period_start: e.target.value }))}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Bitiş Tarihi</FormLabel>
                  <Input
                    type="date"
                    value={formData.report_period_end}
                    onChange={(e) => setFormData(prev => ({ ...prev, report_period_end: e.target.value }))}
                  />
                </FormControl>
              </HStack>

              <FormControl isRequired>
                <FormLabel>Rapor Türü</FormLabel>
                <Select
                  value={formData.report_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, report_type: e.target.value }))}
                >
                  {reportTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Notlar</FormLabel>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Rapor hakkında notlar..."
                />
              </FormControl>

              {!selectedReport && (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Bilgi!</AlertTitle>
                    <AlertDescription>
                      Rapor oluşturulduktan sonra seçilen dönemdeki tüm gelir ve gider kayıtları 
                      otomatik olarak hesaplanacaktır.
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              İptal
            </Button>
            <Button colorScheme="brand" onClick={handleSaveReport} isLoading={loading}>
              {selectedReport ? 'Güncelle' : 'Oluştur'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}