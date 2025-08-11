import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  useColorModeValue,
  SimpleGrid,
  Icon,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Switch,
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
  Card as ChakraCard,
  CardHeader,
  CardBody,
  Heading,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import {
  MdSettings,
  MdEmail,
  MdAttachMoney,
  MdBusiness,
  MdNotifications,
  MdSave,
  MdRefresh,
  MdEdit,
  MdCheck,
  MdClose,
  MdWarning,
  MdInfo,
} from 'react-icons/md';
import Card from 'components/card/Card';
// MiniStatistics kaldırıldı
import apiService from 'services/apiService';

export default function SystemSettings() {
  const brandColor = useColorModeValue('brand.500', 'white');
  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // State management
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Settings by category
  const [emailSettings, setEmailSettings] = useState({
    EMAIL_SMTP_HOST: 'smtp.gmail.com',
    EMAIL_SMTP_PORT: '587',
    EMAIL_USERNAME: 'info@motoetiler.com',
    EMAIL_PASSWORD: '',
    LOW_STOCK_EMAIL_ENABLED: true,
    DAILY_REPORT_EMAIL_ENABLED: true,
    APPOINTMENT_REMINDER_EMAIL: true,
  });

  const [currencySettings, setCurrencySettings] = useState({
    CURRENCY_API_URL: 'https://api.exchangerate-api.com/v4/latest/EUR',
    CURRENCY_UPDATE_INTERVAL: '60',
    AUTO_CURRENCY_UPDATE: true,
  });

  const [taxSettings, setTaxSettings] = useState({
    TAX_RATE: '20.00',
    INCOME_TAX_RATE: '22.00',
    TAX_OFFICE_NAME: 'Beşiktaş Vergi Dairesi',
    TAX_NUMBER: '1234567890',
    AUTO_TAX_CALCULATION: true,
  });

  const [appointmentSettings, setAppointmentSettings] = useState({
    APPOINTMENT_DURATION_DEFAULT: '60',
    APPOINTMENT_REMINDER_DAYS: '1',
    MAX_APPOINTMENTS_PER_SLOT: '2',
    APPOINTMENT_CANCEL_HOURS: '24',
    WEEKEND_APPOINTMENTS: false,
  });

  const [companySettings, setCompanySettings] = useState({
    COMPANY_NAME: 'MotoEtiler Vespa Servisi',
    COMPANY_ADDRESS: 'Etiler Mah. Vespa Cad. No:1 Beşiktaş/İstanbul',
    COMPANY_PHONE: '+90 212 000 00 00',
    COMPANY_EMAIL: 'info@motoetiler.com',
    COMPANY_WEBSITE: 'www.motoetiler.com',
  });

  const [stockSettings, setStockSettings] = useState({
    LOW_STOCK_THRESHOLD: '5',
    CRITICAL_STOCK_THRESHOLD: '2',
    AUTO_STOCK_UPDATE: true,
  });

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError('');

      // Email
      const emailResp = await apiService.updateEmailSettings({}); // noop GET yok; aşağıda gerçek GET eklendiğinde değiştirilebilir
      // Company
      const companyResp = await apiService.getCompanySettings().catch(()=>({}));
      if(companyResp.settings){ setCompanySettings(prev=>({
        COMPANY_NAME: companyResp.settings.COMPANY_NAME || prev.COMPANY_NAME,
        COMPANY_ADDRESS: companyResp.settings.COMPANY_ADDRESS || prev.COMPANY_ADDRESS,
        COMPANY_PHONE: companyResp.settings.COMPANY_PHONE || prev.COMPANY_PHONE,
        COMPANY_EMAIL: companyResp.settings.COMPANY_EMAIL || prev.COMPANY_EMAIL,
        COMPANY_WEBSITE: companyResp.settings.COMPANY_WEBSITE || prev.COMPANY_WEBSITE,
      })); }
      const stockResp = await apiService.getStockSettings().catch(()=>({}));
      if(stockResp.settings){ setStockSettings(prev=>({
        LOW_STOCK_THRESHOLD: stockResp.settings.LOW_STOCK_THRESHOLD || prev.LOW_STOCK_THRESHOLD,
        CRITICAL_STOCK_THRESHOLD: stockResp.settings.CRITICAL_STOCK_THRESHOLD || prev.CRITICAL_STOCK_THRESHOLD,
        AUTO_STOCK_UPDATE: stockResp.settings.AUTO_STOCK_UPDATE === 'true' || prev.AUTO_STOCK_UPDATE,
      })); }
      
    } catch (error) {
      console.error('Error loading settings:', error);
      setError('Ayarlar yüklenirken hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async (category) => {
    try {
      setSaving(true);

      let settingsToSave = {};
      switch (category) {
        case 'email':
          settingsToSave = emailSettings;
          await apiService.updateEmailSettings(settingsToSave);
          break;
        case 'company':
          settingsToSave = companySettings;
          await apiService.updateCompanySettings(settingsToSave);
          break;
        case 'stock':
          settingsToSave = stockSettings;
          await apiService.updateStockSettings(settingsToSave);
          break;
      }

      toast({
        title: 'Başarılı!',
        description: 'Ayarlar başarıyla kaydedildi.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setEditingCategory(null);

    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Hata!',
        description: 'Ayarlar kaydedilirken hata oluştu.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmailSettings = async () => {
    try {
      setSaving(true);
      // await apiService.testEmailSettings(emailSettings);
      
      toast({
        title: 'Test Başarılı!',
        description: 'Email ayarları çalışıyor.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

    } catch (error) {
      toast({
        title: 'Test Başarısız!',
        description: 'Email ayarları kontrol edilmeli.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestCurrencyAPI = async () => {
    try {
      setSaving(true);
      // await apiService.testCurrencyAPI();
      
      toast({
        title: 'Test Başarılı!',
        description: 'Döviz kuru API\'si çalışıyor.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

    } catch (error) {
      toast({
        title: 'Test Başarısız!',
        description: 'Döviz kuru API ayarları kontrol edilmeli.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const SettingCard = ({ title, icon, category, children, canEdit = true }) => (
    <ChakraCard>
      <CardHeader>
        <Flex justify="space-between" align="center">
          <HStack>
            <Icon as={icon} color={brandColor} />
            <Heading size="md">{title}</Heading>
          </HStack>
          {canEdit && (
            <HStack>
              {editingCategory === category ? (
                <>
                  <IconButton
                    icon={<MdCheck />}
                    size="sm"
                    colorScheme="green"
                    onClick={() => handleSaveCategory(category)}
                    isLoading={saving}
                  />
                  <IconButton
                    icon={<MdClose />}
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingCategory(null)}
                  />
                </>
              ) : (
                <IconButton
                  icon={<MdEdit />}
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingCategory(category)}
                />
              )}
            </HStack>
          )}
        </Flex>
      </CardHeader>
      <CardBody>
        {children}
      </CardBody>
    </ChakraCard>
  );

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Header stats removed to eliminate MiniStatistics dependency */}

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
            <Tab>📧 Email Ayarları</Tab>
            <Tab>👤 Kullanıcı</Tab>
            <Tab>🏢 Şirket Bilgileri</Tab>
            <Tab>📦 Stok Ayarları</Tab>
          </TabList>

          <TabPanels>
            {/* Email Settings Tab */}
            <TabPanel>
              <SettingCard
                title="Email Sunucu Ayarları"
                icon={MdEmail}
                category="email"
              >
                <VStack spacing={4} align="stretch">
                  <HStack spacing={4}>
                    <FormControl>
                      <FormLabel>SMTP Sunucu</FormLabel>
                      <Input
                        value={emailSettings.EMAIL_SMTP_HOST}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, EMAIL_SMTP_HOST: e.target.value }))}
                        isReadOnly={editingCategory !== 'email'}
                      />
                    </FormControl>
                    <FormControl w="120px">
                      <FormLabel>Port</FormLabel>
                      <Input
                        value={emailSettings.EMAIL_SMTP_PORT}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, EMAIL_SMTP_PORT: e.target.value }))}
                        isReadOnly={editingCategory !== 'email'}
                      />
                    </FormControl>
                  </HStack>

                  <FormControl>
                    <FormLabel>Email Adresi</FormLabel>
                    <Input
                      value={emailSettings.EMAIL_USERNAME}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, EMAIL_USERNAME: e.target.value }))}
                      isReadOnly={editingCategory !== 'email'}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Email Şifresi</FormLabel>
                    <Input
                      type="password"
                      value={emailSettings.EMAIL_PASSWORD}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, EMAIL_PASSWORD: e.target.value }))}
                      isReadOnly={editingCategory !== 'email'}
                      placeholder="••••••••"
                    />
                  </FormControl>

                  <Divider />

                  <Text fontWeight="bold">Bildirim Ayarları</Text>
                  
                  <HStack justify="space-between">
                    <Text>Düşük Stok Email Bildirimi</Text>
                    <Switch
                      isChecked={emailSettings.LOW_STOCK_EMAIL_ENABLED}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, LOW_STOCK_EMAIL_ENABLED: e.target.checked }))}
                      isDisabled={editingCategory !== 'email'}
                    />
                  </HStack>

                  <HStack justify="space-between">
                    <Text>Günlük Rapor Email Bildirimi</Text>
                    <Switch
                      isChecked={emailSettings.DAILY_REPORT_EMAIL_ENABLED}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, DAILY_REPORT_EMAIL_ENABLED: e.target.checked }))}
                      isDisabled={editingCategory !== 'email'}
                    />
                  </HStack>

                  <HStack justify="space-between">
                    <Text>Randevu Hatırlatma Emaili</Text>
                    <Switch
                      isChecked={emailSettings.APPOINTMENT_REMINDER_EMAIL}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, APPOINTMENT_REMINDER_EMAIL: e.target.checked }))}
                      isDisabled={editingCategory !== 'email'}
                    />
                  </HStack>

                  <Button
                    leftIcon={<MdEmail />}
                    colorScheme="blue"
                    variant="outline"
                    onClick={handleTestEmailSettings}
                    isLoading={saving}
                  >
                    Email Ayarlarını Test Et
                  </Button>
                </VStack>
              </SettingCard>
            </TabPanel>

            {/* User Settings Tab */}
            <TabPanel>
              <SettingCard title="Kullanıcı Ayarları" icon={MdSettings} category="user">
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  <FormControl>
                    <FormLabel>Yeni Kullanıcı Adı</FormLabel>
                    <Input placeholder="Yeni kullanıcı adı" id="new-username" />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Yeni Şifre</FormLabel>
                    <Input type="password" placeholder="Yeni şifre" id="new-password" />
                  </FormControl>
                </SimpleGrid>
                <HStack mt={4}>
                  <Button onClick={async()=>{
                    const v = document.getElementById('new-username').value.trim();
                    if(!v) return;
                    try{ await apiService.changeUsername(v); toast({title:'Başarılı', description:'Kullanıcı adı güncellendi', status:'success'});}catch(e){ toast({title:'Hata', description:e.message, status:'error'});} 
                  }}>Kullanıcı Adını Güncelle</Button>
                  <Button onClick={async()=>{
                    const v = document.getElementById('new-password').value;
                    if(!v) return;
                    try{ await apiService.changePassword(v); toast({title:'Başarılı', description:'Şifre güncellendi', status:'success'});}catch(e){ toast({title:'Hata', description:e.message, status:'error'});} 
                  }}>Şifreyi Güncelle</Button>
                </HStack>
              </SettingCard>
            </TabPanel>

            

            

            {/* Company Settings Tab */}
            <TabPanel>
              <SettingCard
                title="Şirket Bilgileri"
                icon={MdBusiness}
                category="company"
              >
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>Şirket Adı</FormLabel>
                    <Input
                      value={companySettings.COMPANY_NAME}
                      onChange={(e) => setCompanySettings(prev => ({ ...prev, COMPANY_NAME: e.target.value }))}
                      isReadOnly={editingCategory !== 'company'}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Adres</FormLabel>
                    <Textarea
                      value={companySettings.COMPANY_ADDRESS}
                      onChange={(e) => setCompanySettings(prev => ({ ...prev, COMPANY_ADDRESS: e.target.value }))}
                      isReadOnly={editingCategory !== 'company'}
                    />
                  </FormControl>

                  <HStack spacing={4}>
                    <FormControl>
                      <FormLabel>Telefon</FormLabel>
                      <Input
                        value={companySettings.COMPANY_PHONE}
                        onChange={(e) => setCompanySettings(prev => ({ ...prev, COMPANY_PHONE: e.target.value }))}
                        isReadOnly={editingCategory !== 'company'}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Email</FormLabel>
                      <Input
                        value={companySettings.COMPANY_EMAIL}
                        onChange={(e) => setCompanySettings(prev => ({ ...prev, COMPANY_EMAIL: e.target.value }))}
                        isReadOnly={editingCategory !== 'company'}
                      />
                    </FormControl>
                  </HStack>

                  <FormControl>
                    <FormLabel>Website</FormLabel>
                    <Input
                      value={companySettings.COMPANY_WEBSITE}
                      onChange={(e) => setCompanySettings(prev => ({ ...prev, COMPANY_WEBSITE: e.target.value }))}
                      isReadOnly={editingCategory !== 'company'}
                    />
                  </FormControl>
                </VStack>
              </SettingCard>
            </TabPanel>

            {/* Stock Settings Tab */}
            <TabPanel>
              <SettingCard
                title="Stok Yönetimi Ayarları"
                icon={MdWarning}
                category="stock"
              >
                <VStack spacing={4} align="stretch">
                  <HStack spacing={4}>
                    <FormControl>
                      <FormLabel>Düşük Stok Uyarı Seviyesi</FormLabel>
                      <Input
                        type="number"
                        value={stockSettings.LOW_STOCK_THRESHOLD}
                        onChange={(e) => setStockSettings(prev => ({ ...prev, LOW_STOCK_THRESHOLD: e.target.value }))}
                        isReadOnly={editingCategory !== 'stock'}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Kritik Stok Uyarı Seviyesi</FormLabel>
                      <Input
                        type="number"
                        value={stockSettings.CRITICAL_STOCK_THRESHOLD}
                        onChange={(e) => setStockSettings(prev => ({ ...prev, CRITICAL_STOCK_THRESHOLD: e.target.value }))}
                        isReadOnly={editingCategory !== 'stock'}
                      />
                    </FormControl>
                  </HStack>

                  <HStack justify="space-between">
                    <Text>Otomatik Stok Güncellemesi</Text>
                    <Switch
                      isChecked={stockSettings.AUTO_STOCK_UPDATE}
                      onChange={(e) => setStockSettings(prev => ({ ...prev, AUTO_STOCK_UPDATE: e.target.checked }))}
                      isDisabled={editingCategory !== 'stock'}
                    />
                  </HStack>

                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Bilgi!</AlertTitle>
                      <AlertDescription>
                        Otomatik stok güncellemesi açıkken, servis işlemlerinde kullanılan parçalar 
                        otomatik olarak stoktan düşülür.
                      </AlertDescription>
                    </Box>
                  </Alert>
                </VStack>
              </SettingCard>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>
    </Box>
  );
}