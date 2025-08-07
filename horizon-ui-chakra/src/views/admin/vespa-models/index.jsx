import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  useColorModeValue,
  SimpleGrid,
  Icon,
  Badge,
  Image,
  Stack,
  HStack,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Heading,
  Divider,
  List,
  ListItem,
  ListIcon,
  InputGroup,
  InputLeftElement,
  Input,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import { 
  MdDirectionsBike,
  MdSpeed,
  MdLocalGasStation,
  MdColorLens,
  MdInfo,
  MdAdd,
  MdSearch,
  MdAttachMoney,
  MdBuild,
  MdCheckCircle,
  MdStar,
  MdStarBorder
} from 'react-icons/md';
import Card from 'components/card/Card';
import MiniStatistics from 'components/card/MiniStatistics';

import apiService from 'services/apiService';

export default function VespaModels() {
  const brandColor = useColorModeValue('brand.500', 'white');
  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  const modalBg = useColorModeValue('white', 'gray.800');
  const modalOverlayBg = useColorModeValue('blackAlpha.600', 'blackAlpha.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'white');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedModel, setSelectedModel] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vespa Models Data
  const [vespaModels, setVespaModels] = useState([]);
  const [modelParts, setModelParts] = useState({});

  // Load data from API
  useEffect(() => {
    loadVespaModels();
  }, []);

  const loadVespaModels = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load models and parts from API
      const [modelsResponse, partsResponse] = await Promise.all([
        apiService.getVespaModels(),
        apiService.getParts(1, 1000)
      ]);

      // Transform API response to match frontend format
      const modelsRaw = Array.isArray(modelsResponse) ? modelsResponse : (modelsResponse?.models || []);
      const partsRaw = partsResponse?.parts || partsResponse?.results || partsResponse || [];

      const modelsArray = modelsRaw.map((model, index) => {
        try {
          // Use API data
          const modelName = model.model_name;
          const engineSize = model.engine_size || '150cc';
          const category = model.category || 'Klasik';
          
          // Calculate compatible parts count from partsResponse
          const compatibleParts = partsRaw.filter(part => 
            !part.vespa_model_id || part.vespa_model_id === model.id
          ) || [];
          
          return {
            id: model.id,
            name: modelName,
            category,
            price: engineSize.includes('300') ? 125000 : 
                   engineSize.includes('150') ? 85000 : 70000,
            currency: 'TL',
            engineSize,
            maxSpeed: engineSize.includes('300') ? '130 km/h' : '95 km/h',
            fuelConsumption: engineSize.includes('300') ? '3.2L/100km' : '2.5L/100km',
            colors: ['Beyaz', 'Siyah', 'Kırmızı', 'Mavi', 'Sarı'],
            features: [
              'LED Farlar',
              'Dijital Gösterge',
              'USB Şarj',
              'Bagaj Bölmesi',
              engineSize.includes('300') ? 'ABS Fren Sistemi' : 'Anti-Slip Sistem'
            ],
            specifications: {
              engine: engineSize + ' 4-stroke',
              power: engineSize.includes('300') ? '23.8 HP' : '12.9 HP',
              torque: engineSize.includes('300') ? '26 Nm' : '12.8 Nm',
              transmission: 'CVT Otomatik',
              fuel: engineSize.includes('300') ? '9 Litre' : '7 Litre',
              weight: engineSize.includes('300') ? '158 kg' : '134 kg',
              dimensions: '1930x745x1350 mm'
            },
            description: `MotoEtiler'de satışta! ${modelName}, modern teknoloji ile klasik tasarımı birleştiren ideal Vespa. ${compatibleParts.length} çeşit yedek parça stokta!`,
            inStock: true,
            rating: 4.5,
            image: model.image_path || '/api/placeholder/300/200',
            partCount: compatibleParts.length,
            url: '#'
            };
          } catch (err) {
            console.error(`Model işleme hatası: ${model.model_name}`, err);
            return null;
          }
        })
        .filter(Boolean); // null değerleri filtrele
      
      setVespaModels(modelsArray);
      
      // Create parts map for each model
      const partsMap = {};
      modelsRaw.forEach(model => {
        const modelParts = partsRaw.filter(part => 
          !part.vespa_model_id || part.vespa_model_id === model.id
        ) || [];
        partsMap[model.model_name] = modelParts;
      });
      
      setModelParts(partsMap);

    } catch (err) {
      console.error('Error loading vespa models:', err);
      setError('Vespa modelleri yüklenirken hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Klasik', 'Sport', 'Touring', 'Elektrikli'];

  const filteredModels = vespaModels.filter(model => {
    if (!model || !model.name) return false;
    
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (model.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || model.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleModelDetail = (model) => {
    setSelectedModel(model);
    onOpen();
  };

  const handleAddModel = () => {
    setSelectedModel(null);
    onOpen();
  };

  const renderStars = (rating = 0) => {
    const stars = [];
    const safeRating = Math.max(0, Math.min(5, rating || 0));
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = safeRating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Icon key={i} as={MdStar} color="yellow.400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Icon key="half" as={MdStar} color="yellow.400" />);
    }
    
    const emptyStars = 5 - Math.ceil(safeRating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Icon key={`empty-${i}`} as={MdStarBorder} color="gray.300" />);
    }
    
    return stars;
  };

  // Güvenli hesaplama fonksiyonları
  const getTotalModels = () => vespaModels.length;
  
  const getInStockModels = () => vespaModels.filter(model => model?.inStock).length;
  
  const getAveragePrice = () => {
    if (vespaModels.length === 0) return 0;
    const total = vespaModels.reduce((sum, model) => sum + (model?.price || 0), 0);
    return Math.round(total / vespaModels.length);
  };
  
  const getTopRatedModel = () => {
    if (vespaModels.length === 0) return { name: 'Bilinmiyor' };
    
    return vespaModels.reduce((max, model) => {
      if (!model || !max) return model || max;
      return (model.rating || 0) > (max.rating || 0) ? model : max;
    }, vespaModels[0] || { name: 'Bilinmiyor' });
  };

  // Loading state
  if (loading) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Text textAlign="center" fontSize="lg">Veriler yükleniyor...</Text>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Alert status="error" mb="20px" borderRadius="12px">
          <AlertIcon />
          <Box>
            <AlertTitle>Veri Yükleme Hatası!</AlertTitle>
            <AlertDescription>
              {error} - Lütfen sayfayı yenileyin veya sistem yöneticisine başvurun.
            </AlertDescription>
          </Box>
        </Alert>
      </Box>
    );
  }

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Statistics Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="20px" mb="20px">
        <MiniStatistics
          startContent={
            <Icon as={MdDirectionsBike} w="56px" h="56px" bg={boxBg} borderRadius="16px" p="12px" />
          }
          name="Toplam Model"
          value={getTotalModels().toString()}
        />
        <MiniStatistics
          startContent={
            <Icon as={MdCheckCircle} w="56px" h="56px" bg={boxBg} borderRadius="16px" p="12px" />
          }
          name="Stokta Var"
          value={getInStockModels().toString()}
        />
        <MiniStatistics
          startContent={
            <Icon as={MdAttachMoney} w="56px" h="56px" bg={boxBg} borderRadius="16px" p="12px" />
          }
          name="Ortalama Fiyat"
          value={`₺${getAveragePrice().toLocaleString()}`}
        />
        <MiniStatistics
          startContent={
            <Icon as={MdStar} w="56px" h="56px" bg={boxBg} borderRadius="16px" p="12px" />
          }
          name="En Popüler"
          value={getTopRatedModel()?.name?.split(' ')[1] || 'Bilinmiyor'}
        />
      </SimpleGrid>

      {/* Info Alert */}
      <Alert status="info" mb="20px" borderRadius="12px">
        <AlertIcon />
        <Box>
          <AlertTitle>Vespa Model Katalogu</AlertTitle>
          <AlertDescription>
            Tüm Vespa modelleri, teknik özellikler, fiyatlar ve stok durumları.
          </AlertDescription>
        </Box>
      </Alert>

      {/* Main Content */}
      <Card>
        <Tabs index={activeTab} onChange={setActiveTab}>
          <TabList>
            <Tab>Model Katalogu</Tab>
            <Tab>Karşılaştırma</Tab>
            <Tab>Fiyat Listesi</Tab>
          </TabList>

          <TabPanels>
            {/* Model Catalog Tab */}
            <TabPanel>
              <Flex justify="space-between" align="center" mb="20px">
                <Text fontSize="2xl" fontWeight="bold" color={brandColor}>
                  Vespa Model Katalogu
                </Text>
                <Button
                  leftIcon={<MdAdd />}
                  colorScheme="brand"
                  onClick={handleAddModel}
                >
                  Yeni Model Ekle
                </Button>
              </Flex>

              {/* Search and Filter */}
              <Stack direction={{ base: 'column', md: 'row' }} spacing={4} mb="20px">
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={MdSearch} color="gray.300" />
                  </InputLeftElement>
                  <Input
                    placeholder="Model ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
                <Select
                  placeholder="Kategori filtresi"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  w={{ base: '100%', md: '200px' }}
                >
                  <option value="all">Tümü</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Select>
              </Stack>

              {/* Models Grid */}
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="20px">
                {filteredModels.map((model) => {
                  if (!model || !model.id) return null;
                  
                  return (
                    <Card key={model.id} overflow="hidden" boxShadow="md">
                      <Box position="relative">
                        <Image
                          src={model.image || '/api/placeholder/300/200'}
                          alt={model.name || 'Vespa Model'}
                          w="100%"
                          h="200px"
                          objectFit="cover"
                          fallbackSrc="https://via.placeholder.com/300x200/4A5568/FFFFFF?text=Vespa"
                        />
                        <Badge
                          position="absolute"
                          top="10px"
                          right="10px"
                          colorScheme={model.inStock ? 'green' : 'red'}
                        >
                          {model.inStock ? 'Stokta' : 'Stok Yok'}
                        </Badge>
                      </Box>
                      
                      <Box p="6">
                        <VStack align="start" spacing={3}>
                          <Box w="100%">
                            <HStack justify="space-between">
                              <Heading size="md">{model.name || 'İsimsiz Model'}</Heading>
                              <Badge colorScheme="brand">{model.category || 'Kategori Yok'}</Badge>
                            </HStack>
                            <HStack mt={2}>
                              {renderStars(model.rating)}
                              <Text fontSize="sm" color="gray.600">({model.rating || '0'})</Text>
                            </HStack>
                          </Box>

                          <Text fontSize="sm" color="gray.600" noOfLines={2}>
                            {model.description || 'Açıklama bulunmuyor.'}
                          </Text>

                          <HStack spacing={4} w="100%">
                            <VStack align="start" spacing={1}>
                              <HStack>
                                <Icon as={MdSpeed} color="gray.500" />
                                <Text fontSize="xs">{model.engineSize || '-'}</Text>
                              </HStack>
                              <HStack>
                                <Icon as={MdLocalGasStation} color="gray.500" />
                                <Text fontSize="xs">{model.fuelConsumption || '-'}</Text>
                              </HStack>
                            </VStack>
                            <VStack align="start" spacing={1}>
                              <HStack>
                                <Icon as={MdColorLens} color="gray.500" />
                                <Text fontSize="xs">{(model.colors || []).length} Renk</Text>
                              </HStack>
                              <HStack>
                                <Icon as={MdBuild} color="gray.500" />
                                <Text fontSize="xs">{(model.features || []).length} Özellik</Text>
                              </HStack>
                            </VStack>
                          </HStack>

                          <Divider />

                          <HStack justify="space-between" w="100%">
                            <VStack align="start" spacing={0}>
                              <Text fontSize="lg" fontWeight="bold" color={brandColor}>
                                ₺{(model.price || 0).toLocaleString()}
                              </Text>
                              <Text fontSize="xs" color="gray.500">KDV Dahil</Text>
                            </VStack>
                            <Button
                              size="sm"
                              colorScheme="brand"
                              leftIcon={<MdInfo />}
                              onClick={() => handleModelDetail(model)}
                            >
                              Detay
                            </Button>
                          </HStack>
                        </VStack>
                      </Box>
                    </Card>
                  );
                })}
              </SimpleGrid>

              {filteredModels.length === 0 && (
                <Box textAlign="center" py="40px">
                  <Text fontSize="lg" color="gray.500">
                    {searchTerm || filterCategory !== 'all' 
                      ? 'Arama kriterlerinize uygun model bulunamadı.'
                      : 'Henüz model eklenmemiş.'
                    }
                  </Text>
                </Box>
              )}
            </TabPanel>

            {/* Comparison Tab */}
            <TabPanel>
              <Text fontSize="2xl" fontWeight="bold" color={brandColor} mb="20px">
                Model Karşılaştırma
              </Text>
              
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Model</Th>
                      <Th>Kategori</Th>
                      <Th>Motor</Th>
                      <Th>Güç</Th>
                      <Th>Hız</Th>
                      <Th>Yakıt</Th>
                      <Th>Ağırlık</Th>
                      <Th>Fiyat</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {vespaModels.map((model) => {
                      if (!model || !model.id) return null;
                      
                      return (
                        <Tr key={model.id}>
                          <Td fontWeight="bold">{model.name || 'Bilinmiyor'}</Td>
                          <Td>
                            <Badge colorScheme="brand" size="sm">
                              {model.category || 'Bilinmiyor'}
                            </Badge>
                          </Td>
                          <Td>{model.engineSize || '-'}</Td>
                          <Td>{model.specifications?.power || '-'}</Td>
                          <Td>{model.maxSpeed || '-'}</Td>
                          <Td>{model.fuelConsumption || '-'}</Td>
                          <Td>{model.specifications?.weight || '-'}</Td>
                          <Td>₺{(model.price || 0).toLocaleString()}</Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </TableContainer>
            </TabPanel>

            {/* Price List Tab */}
            <TabPanel>
              <Text fontSize="2xl" fontWeight="bold" color={brandColor} mb="20px">
                Fiyat Listesi
              </Text>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} gap="20px">
                {categories.map(category => {
                  const categoryModels = vespaModels.filter(model => 
                    model && model.category === category
                  );
                  
                  return (
                    <Card key={category}>
                      <Text fontSize="lg" fontWeight="bold" mb="15px">{category} Modeller</Text>
                      <VStack align="stretch" spacing={3}>
                        {categoryModels.map(model => {
                          if (!model || !model.id) return null;
                          
                          return (
                            <Box key={model.id} p="3" borderRadius="md" bg={boxBg}>
                              <HStack justify="space-between">
                                <VStack align="start" spacing={1}>
                                  <Text fontWeight="bold">{model.name || 'Bilinmiyor'}</Text>
                                  <HStack>
                                    {renderStars(model.rating)}
                                    <Text fontSize="sm" color="gray.600">({model.rating || '-'})</Text>
                                  </HStack>
                                </VStack>
                                <VStack align="end" spacing={1}>
                                  <Text fontSize="lg" fontWeight="bold" color={brandColor}>
                                    ₺{(model.price || 0).toLocaleString()}
                                  </Text>
                                  <Badge colorScheme={model.inStock ? 'green' : 'red'} size="sm">
                                    {model.inStock ? 'Stokta' : 'Stok Yok'}
                                  </Badge>
                                </VStack>
                              </HStack>
                            </Box>
                          );
                        })}
                        
                        {categoryModels.length === 0 && (
                          <Text fontSize="sm" color="gray.500" textAlign="center" py="4">
                            Bu kategoride model bulunmuyor.
                          </Text>
                        )}
                      </VStack>
                    </Card>
                  );
                })}
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>

      {/* Model Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay bg={modalOverlayBg} />
        <ModalContent bg={modalBg} borderRadius="15px" border="1px solid" borderColor={borderColor}>
          <ModalHeader color={brandColor} borderBottom="1px solid" borderColor={borderColor}>
            <Text fontSize="xl" fontWeight="bold">
              {selectedModel?.name || 'Yeni Model Ekle'}
            </Text>
          </ModalHeader>
          <ModalCloseButton color={textColor} />
          <ModalBody>
            {selectedModel ? (
              <VStack align="stretch" spacing={4}>
                <Image
                  src={selectedModel.image || '/api/placeholder/400/200'}
                  alt={selectedModel.name || 'Vespa Model'}
                  w="100%"
                  h="200px"
                  objectFit="cover"
                  borderRadius="md"
                  fallbackSrc="https://via.placeholder.com/400x200/4A5568/FFFFFF?text=Vespa"
                />
                
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Text fontSize="xl" fontWeight="bold">{selectedModel.name || 'İsimsiz Model'}</Text>
                    <Badge colorScheme="brand">{selectedModel.category || 'Kategori Yok'}</Badge>
                  </VStack>
                  <VStack align="end" spacing={1}>
                    <Text fontSize="2xl" fontWeight="bold" color={brandColor}>
                      ₺{(selectedModel.price || 0).toLocaleString()}
                    </Text>
                    <HStack>
                      {renderStars(selectedModel.rating)}
                      <Text fontSize="sm">({selectedModel.rating || '0'})</Text>
                    </HStack>
                  </VStack>
                </HStack>

                <Text color="gray.600">{selectedModel.description || 'Açıklama bulunmuyor.'}</Text>

                <Box>
                  <Text fontSize="lg" fontWeight="bold" mb="10px">Teknik Özellikler</Text>
                  <SimpleGrid columns={2} gap="10px">
                    {Object.entries(selectedModel.specifications || {}).map(([key, value]) => (
                      <HStack key={key} justify="space-between">
                        <Text fontSize="sm" textTransform="capitalize">{key}:</Text>
                        <Text fontSize="sm" fontWeight="bold">{value || '-'}</Text>
                      </HStack>
                    ))}
                  </SimpleGrid>
                </Box>

                <Box>
                  <Text fontSize="lg" fontWeight="bold" mb="10px">Özellikler</Text>
                  <List spacing={2}>
                    {(selectedModel.features || []).map((feature, index) => (
                      <ListItem key={index}>
                        <ListIcon as={MdCheckCircle} color="green.500" />
                        {feature || 'Bilinmiyor'}
                      </ListItem>
                    ))}
                  </List>
                </Box>

                <Box>
                  <Text fontSize="lg" fontWeight="bold" mb="10px">Mevcut Renkler</Text>
                  <HStack wrap="wrap">
                    {(selectedModel.colors || []).map((color, index) => (
                      <Badge key={index} colorScheme="gray" variant="outline">
                        {color || 'Bilinmiyor'}
                      </Badge>
                    ))}
                  </HStack>
                </Box>
              </VStack>
            ) : (
              <Text>Form için geliştirme devam ediyor...</Text>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Kapat
            </Button>
            {selectedModel && (
              <Button colorScheme="brand">
                Teklif Al
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}