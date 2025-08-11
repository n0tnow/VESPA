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
import { MdDownload } from 'react-icons/md';
import Card from 'components/card/Card';
import BarChart from 'components/charts/BarChart';
import PieChart from 'components/charts/PieChart';
import apiService from 'services/apiService';

export default function TaxReports() {
  const brandColor = useColorModeValue('brand.500', 'white');
  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const txModal = useDisclosure();
  const [selectedReport, setSelectedReport] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rangeStart, setRangeStart] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]; });
  const [rangeEnd, setRangeEnd] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth()+1, 0).toISOString().split('T')[0]; });
  const [typeFilter, setTypeFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [rangeSummary, setRangeSummary] = useState({ total_income: 0, total_expenses: 0, net: 0, by_method: { cash: 0, card: 0, transfer: 0 }, billed_revenue: { service: 0, parts: 0 } });
  const [transactions, setTransactions] = useState([]);

  // New Transaction modal state
  const [newTx, setNewTx] = useState({
    transaction_date: new Date().toISOString().split('T')[0],
    transaction_type: 'INCOME',
    payment_method: 'CASH',
    amount: 0,
    description: ''
  });
  const [savingTx, setSavingTx] = useState(false);

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

  useEffect(() => {
    // Debounce API calls to prevent excessive requests
    const timeoutId = setTimeout(() => {
      loadData();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [rangeStart, rangeEnd, typeFilter, methodFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const summaryResp = await apiService.getAccountingDashboardRange(rangeStart, rangeEnd);
      const txResp = await apiService.getCashTransactions({ startDate: rangeStart, endDate: rangeEnd, type: typeFilter, method: methodFilter, limit: 500 });
      setRangeSummary(summaryResp.range_summary || { total_income: 0, total_expenses: 0, net: 0, by_method: { cash: 0, card: 0, transfer: 0 }, billed_revenue: { service: 0, parts: 0 } });
      setTransactions(txResp.transactions || txResp || []);

    } catch (error) {
      console.error('Error loading cash flow:', error);
      setError('Cari akış verileri yüklenirken hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = () => {
    setSelectedReport(null);
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
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

  const typeLabel = (t) => (t === 'INCOME' ? 'Giriş' : t === 'EXPENSE' ? 'Çıkış' : (t || ''));
  const methodLabel = (m) => ({ CASH: 'Nakit', CARD: 'Kart', TRANSFER: 'Transfer' }[m] || (m || ''));

  const exportToCSV = () => {
    const header = ['Tarih', 'Tür', 'Yöntem', 'Tutar', 'Açıklama', 'Referans'];
    const rows = transactions.map(t => [
      t.transaction_date || '',
      typeLabel(t.transaction_type),
      methodLabel(t.payment_method),
      String(t.amount ?? ''),
      (t.description || '').replace(/\n/g, ' '),
      t.reference_number || t.reference_type || ''
    ]);
    const csv = [header, ...rows].map(r => r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cari_akis_${rangeStart}_${rangeEnd}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const w = window.open('', 'PRINT', 'height=800,width=1000');
    if (!w) return;
    w.document.write('<html><head><title>Cari Akış</title>');
    w.document.write('<style>table{width:100%;border-collapse:collapse} th,td{border:1px solid #ddd;padding:8px;text-align:left} th{background:#f5f5f5}</style>');
    w.document.write('</head><body>');
    w.document.write(`<h3>Cari Akış (${rangeStart} - ${rangeEnd})</h3>`);
    w.document.write('<table><thead><tr><th>Tarih</th><th>Tür</th><th>Yöntem</th><th>Tutar</th><th>Açıklama</th><th>Referans</th></tr></thead><tbody>');
    transactions.forEach(t => {
      w.document.write(`<tr><td>${t.transaction_date || ''}</td><td>${typeLabel(t.transaction_type)}</td><td>${methodLabel(t.payment_method)}</td><td>${formatCurrency(t.amount || 0)}</td><td>${(t.description || '').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</td><td>${t.reference_number || t.reference_type || ''}</td></tr>`);
    });
    w.document.write('</tbody></table>');
    w.document.write('</body></html>');
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  const reportTypes = [
    { value: 'MONTHLY', label: 'Aylık' },
    { value: 'QUARTERLY', label: 'Üç Aylık' },
    { value: 'ANNUAL', label: 'Yıllık' }
  ];

  // Calculate statistics
  const totalTaxOwed = 0;
  const totalVATOwed = 0;
  const pendingReports = 0;

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }} pb="40px" minHeight="100vh">
      {/* Statistics Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="20px" mb="20px">
        <Card>
          <Flex justify="space-between" align="center">
            <Text color={brandColor} fontWeight="bold">Toplam Giriş</Text>
            <Text fontWeight="bold">{formatCurrency(rangeSummary.total_income)}</Text>
          </Flex>
        </Card>
        <Card>
          <Flex justify="space-between" align="center">
            <Text color={brandColor} fontWeight="bold">Toplam Çıkış</Text>
            <Text fontWeight="bold">{formatCurrency(rangeSummary.total_expenses)}</Text>
          </Flex>
        </Card>
        <Card>
          <Flex justify="space-between" align="center">
            <Text color={brandColor} fontWeight="bold">Net</Text>
            <Text fontWeight="bold" color={rangeSummary.net >= 0 ? 'green.500' : 'red.500'}>{formatCurrency(rangeSummary.net)}</Text>
          </Flex>
        </Card>
        <Card>
          <Flex justify="space-between" align="center">
            <Text color={brandColor} fontWeight="bold">Bu Dönem Faturalandırılan</Text>
            <Text fontWeight="bold">{formatCurrency((rangeSummary?.billed_revenue?.services || 0) + (rangeSummary?.billed_revenue?.sales || 0))}</Text>
          </Flex>
        </Card>
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
      {/* Cari Akış – Özet ve Filtreler */}
      <Card>
        {/* Satır 1: Filtreler */}
        <SimpleGrid columns={{ base: 1, md: 5 }} gap={3} mb="10px">
          <Input type="date" value={rangeStart} onChange={(e)=>setRangeStart(e.target.value)} />
          <Input type="date" value={rangeEnd} onChange={(e)=>setRangeEnd(e.target.value)} />
          <Select placeholder="Tür" value={typeFilter} onChange={(e)=>setTypeFilter(e.target.value)}>
            <option value="INCOME">Giriş</option>
            <option value="EXPENSE">Çıkış</option>
          </Select>
          <Select placeholder="Yöntem" value={methodFilter} onChange={(e)=>setMethodFilter(e.target.value)}>
            <option value="CASH">Nakit</option>
            <option value="CARD">Kart</option>
            <option value="TRANSFER">Transfer</option>
          </Select>
          <Button onClick={loadData} colorScheme="brand" variant="solid">Uygula</Button>
        </SimpleGrid>
        {/* Satır 2: Aksiyonlar */}
        <Flex align="center" justify="flex-end" gap={2} mb="10px">
          <Button onClick={txModal.onOpen} colorScheme="blue" variant="outline">Yeni İşlem</Button>
          <Button leftIcon={<Icon as={MdDownload} />} onClick={exportToCSV} variant="ghost">CSV</Button>
          <Button leftIcon={<Icon as={MdDownload} />} onClick={exportToPDF} variant="ghost">PDF</Button>
        </Flex>
        <Divider />
        <SimpleGrid columns={{ base: 1, md: 3 }} gap="20px" mt={4}>
          <Card>
            <Text color={brandColor} fontWeight="bold">Toplam Giriş</Text>
            <Text fontWeight="bold">{formatCurrency(rangeSummary.total_income)}</Text>
          </Card>
          <Card>
            <Text color={brandColor} fontWeight="bold">Toplam Çıkış</Text>
            <Text fontWeight="bold">{formatCurrency(rangeSummary.total_expenses)}</Text>
          </Card>
          <Card>
            <Text color={brandColor} fontWeight="bold">Servis Geliri (Fatura)</Text>
            <Text fontWeight="bold">{formatCurrency(rangeSummary?.billed_revenue?.services || rangeSummary?.billed_revenue?.service || 0)}</Text>
          </Card>
          <Card>
            <Text color={brandColor} fontWeight="bold">Satış Geliri (Fatura)</Text>
            <Text fontWeight="bold">{formatCurrency(rangeSummary?.billed_revenue?.sales || 0)}</Text>
          </Card>
        </SimpleGrid>
      </Card>

      {/* Charts Row */}
      <SimpleGrid columns={{ base: 1, md: 2 }} gap="20px" mt={4}>
        <Card>
          <Text fontWeight="bold" mb={2}>Faturalandırılan Gelir (Servis vs Satış)</Text>
          <Box height="300px" width="100%">
            <PieChart
              chartData={[rangeSummary?.billed_revenue?.services || 0, rangeSummary?.billed_revenue?.sales || 0]}
              chartOptions={{ 
                labels: ['Servis', 'Satış'], 
                legend: { position: 'bottom' },
                chart: { height: 280 }
              }}
            />
          </Box>
        </Card>
        <Card>
          <Text fontWeight="bold" mb={2}>Ödeme Yöntemi Kırılımı</Text>
          <Box height="300px" width="100%">
            <BarChart
              chartData={[{ name: 'Tutar', data: [rangeSummary?.by_method?.cash || 0, rangeSummary?.by_method?.card || 0, rangeSummary?.by_method?.transfer || 0] }]}
              chartOptions={{ 
                xaxis: { categories: ['Nakit', 'Kart', 'Transfer'] }, 
                dataLabels: { enabled: false }, 
                plotOptions: { bar: { borderRadius: 6 } },
                chart: { height: 280 }
              }}
            />
          </Box>
        </Card>
      </SimpleGrid>

      {/* Transactions Table */}
      <Card mt={4}>
        <Flex justify="space-between" align="center" mb="10px">
          <Text fontSize="lg" fontWeight="bold" color={brandColor}>İşlemler</Text>
        </Flex>
        <TableContainer maxHeight="500px" overflowY="auto" borderRadius="md" border="1px" borderColor="gray.200">
          <Table size="sm" variant="simple">
            <Thead position="sticky" top={0} bg="white" zIndex={1}>
              <Tr>
                <Th>Tarih</Th>
                <Th>Tür</Th>
                <Th>Yöntem</Th>
                <Th isNumeric>Tutar</Th>
                <Th>Açıklama</Th>
                <Th>Referans</Th>
                <Th isNumeric>Aksiyon</Th>
              </Tr>
            </Thead>
            <Tbody>
              {transactions.length === 0 ? (
                <Tr>
                  <Td colSpan={7}>
                    <Text fontSize="sm" color="gray.500" textAlign="center" py={8}>
                      {loading ? 'Yükleniyor...' : 'Kayıt bulunamadı.'}
                    </Text>
                  </Td>
                </Tr>
              ) : (
                transactions.map((t, idx) => (
                  <Tr key={`${t.id || 'tx'}-${idx}`} _hover={{ bg: 'blackAlpha.50' }}>
                    <Td whiteSpace="nowrap">{t.transaction_date || ''}</Td>
                    <Td>
                      <Badge colorScheme={t.transaction_type === 'INCOME' ? 'green' : 'red'}>
                        {typeLabel(t.transaction_type)}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge colorScheme={t.payment_method === 'CASH' ? 'yellow' : t.payment_method === 'CARD' ? 'blue' : 'purple'}>
                        {methodLabel(t.payment_method)}
                      </Badge>
                    </Td>
                    <Td isNumeric whiteSpace="nowrap">{formatCurrency(t.amount || 0)}</Td>
                    <Td maxWidth="200px" isTruncated title={t.description || ''}>{t.description || ''}</Td>
                    <Td maxWidth="150px" isTruncated title={t.reference_number || t.reference_type || ''}>{t.reference_number || t.reference_type || ''}</Td>
                    <Td isNumeric>
                      <HStack spacing={1} justify="flex-end">
                        <Button size="xs" variant="outline" onClick={()=>{
                          setNewTx({
                            transaction_date: (t.transaction_date || '').split('T')[0] || new Date().toISOString().split('T')[0],
                            transaction_type: t.transaction_type,
                            payment_method: t.payment_method,
                            amount: t.amount,
                            description: t.description || '',
                            reference_type: t.reference_type,
                            reference_id: t.reference_id,
                            id: t.id,
                          });
                          txModal.onOpen();
                        }}>Düzenle</Button>
                        <Button size="xs" variant="ghost" colorScheme="red" onClick={async ()=>{
                          if(!window.confirm('Silmek istediğinize emin misiniz?')) return;
                          try {
                            await apiService.deleteCashTransaction(t.id);
                            await loadData();
                          } catch(e){ setError('Silinirken hata: ' + (e?.message||'')); }
                        }}>Sil</Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </TableContainer>
        
        {/* Pagination Info */}
        {transactions.length > 0 && (
          <Flex justify="space-between" align="center" mt={3} px={2}>
            <Text fontSize="sm" color="gray.600">
              Toplam {transactions.length} işlem gösteriliyor
            </Text>
            {transactions.length >= 500 && (
              <Text fontSize="sm" color="orange.500" fontWeight="semibold">
                ⚠️ Sonuçlar 500 ile sınırlandırıldı. Daha spesifik filtreler kullanın.
              </Text>
            )}
          </Flex>
        )}
      </Card>

      {/* Yeni İşlem Modal */}
      <Modal isOpen={txModal.isOpen} onClose={txModal.onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{newTx.id ? 'İşlemi Düzenle' : 'Yeni İşlem'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Tarih</FormLabel>
                <Input type="date" value={newTx.transaction_date} onChange={(e)=>setNewTx(v=>({...v, transaction_date: e.target.value}))} />
              </FormControl>
              <HStack w="100%" spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Tür</FormLabel>
                  <Select value={newTx.transaction_type} onChange={(e)=>setNewTx(v=>({...v, transaction_type: e.target.value}))}>
                    <option value="INCOME">Giriş</option>
                    <option value="EXPENSE">Çıkış</option>
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Yöntem</FormLabel>
                  <Select value={newTx.payment_method} onChange={(e)=>setNewTx(v=>({...v, payment_method: e.target.value}))}>
                    <option value="CASH">Nakit</option>
                    <option value="CARD">Kart</option>
                    <option value="TRANSFER">Transfer</option>
                  </Select>
                </FormControl>
              </HStack>
              <FormControl isRequired>
                <FormLabel>Tutar</FormLabel>
                <Input type="number" min="0" step="0.01" value={newTx.amount} onChange={(e)=>setNewTx(v=>({...v, amount: parseFloat(e.target.value || '0')}))} />
              </FormControl>
              <FormControl>
                <FormLabel>Açıklama</FormLabel>
                <Textarea rows={2} value={newTx.description} onChange={(e)=>setNewTx(v=>({...v, description: e.target.value}))} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={txModal.onClose}>
              İptal
            </Button>
            <Button colorScheme="brand" isLoading={savingTx} onClick={async ()=>{
              try {
                setSavingTx(true);
                if(newTx.id){
                  const { id, ...rest } = newTx;
                  await apiService.updateCashTransaction(id, rest);
                } else {
                  await apiService.createCashTransaction(newTx);
                }
                txModal.onClose();
                await loadData();
              } catch (e) {
                setError('İşlem kaydedilirken hata oluştu: ' + (e?.message || ''));
              } finally { setSavingTx(false); }
            }}>Kaydet</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}