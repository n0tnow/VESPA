import React, { useState } from 'react';
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
  FormControl,
  FormLabel,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tooltip,
  IconButton,
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
  MdEdit,
  MdAdd,
  MdDelete,
  MdSearch,
  MdAttachMoney,
  MdBuild,
  MdPalette,
  MdCheckCircle,
  MdStar,
  MdStarBorder
} from 'react-icons/md';
import Card from 'components/card/Card';
import MiniStatistics from 'components/card/MiniStatistics';

export default function VespaModels() {
  const brandColor = useColorModeValue('brand.500', 'white');
  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedModel, setSelectedModel] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeTab, setActiveTab] = useState(0);

  // Vespa Models Data
  const [vespaModels, setVespaModels] = useState([
    {
      id: 1,
      name: 'Vespa Primavera 150',
      category: 'Klasik',
      price: 85000,
      currency: 'TL',
      engineSize: '150cc',
      maxSpeed: '95 km/h',
      fuelConsumption: '2.5L/100km',
      colors: ['Beyaz', 'Siyah', 'Kırmızı', 'Mavi', 'Sarı'],
      features: [
        'LED Farlar',
        'Dijital Gösterge',
        'USB Şarj',
        'Bagaj Bölmesi',
        'Anti-Slip Sistem'
      ],
      specifications: {
        engine: '150cc 4-stroke',
        power: '12.9 HP',
        torque: '12.8 Nm',
        transmission: 'CVT Otomatik',
        fuel: '7 Litre',
        weight: '134 kg',
        dimensions: '1930x745x1350 mm'
      },
      description: 'MotoEtiler\'de satışta! Vespa Primavera 150, modern teknoloji ile klasik tasarımı birleştiren ideal şehir scooter\'ı.',
      inStock: true,
      rating: 4.5,
      image: '/api/placeholder/300/200'
    },
    {
      id: 2,
      name: 'Vespa GTS 300',
      category: 'Touring',
      price: 125000,
      currency: 'TL',
      engineSize: '300cc',
      maxSpeed: '130 km/h',
      fuelConsumption: '3.2L/100km',
      colors: ['Siyah', 'Gri', 'Beyaz', 'Lacivert'],
      features: [
        'ABS Fren Sistemi',
        'Traction Control',
        'Büyük Bagaj',
        'Konforlu Sürüş',
        'Güçlü Motor'
      ],
      specifications: {
        engine: '300cc 4-stroke',
        power: '23.8 HP',
        torque: '26 Nm',
        transmission: 'CVT Otomatik',
        fuel: '9 Litre',
        weight: '158 kg',
        dimensions: '1955x760x1415 mm'
      },
      description: 'MotoEtiler\'de satışta! Vespa GTS 300, uzun mesafe sürüşler için güçlü motor ve konforlu tasarımı ile öne çıkar. MotoEtiler garantisi ile!',
      inStock: true,
      rating: 4.8,
      image: '/api/placeholder/300/200'
    },
    {
      id: 3,
      name: 'Vespa Sprint 150',
      category: 'Sport',
      price: 79000,
      currency: 'TL',
      engineSize: '150cc',
      maxSpeed: '95 km/h',
      fuelConsumption: '2.4L/100km',
      colors: ['Beyaz', 'Siyah', 'Kırmızı', 'Turuncu'],
      features: [
        'Sportif Tasarım',
        'LED Teknoloji',
        'Compact Boyut',
        'Çevik Handling',
        'Ekonomik Yakıt'
      ],
      specifications: {
        engine: '150cc 4-stroke',
        power: '12.9 HP',
        torque: '12.8 Nm',
        transmission: 'CVT Otomatik',
        fuel: '6 Litre',
        weight: '130 kg',
        dimensions: '1770x690x1340 mm'
      },
      description: 'MotoEtiler\'de özel sipariş! Vespa Sprint 150, sportif ruhu ve çevik kullanımı ile genç sürücüler için ideal.',
      inStock: false,
      rating: 4.3,
      image: '/api/placeholder/300/200'
    },
    {
      id: 4,
      name: 'Vespa LX 150',
      category: 'Klasik',
      price: 75000,
      currency: 'TL',
      engineSize: '150cc',
      maxSpeed: '90 km/h',
      fuelConsumption: '2.8L/100km',
      colors: ['Beyaz', 'Siyah', 'Bej'],
      features: [
        'Klasik Tasarım',
        'Güvenilir Motor',
        'Kolay Bakım',
        'Ekonomik Fiyat',
        'Dayanıklı Yapı'
      ],
      specifications: {
        engine: '150cc 4-stroke',
        power: '11.6 HP',
        torque: '11.5 Nm',
        transmission: 'CVT Otomatik',
        fuel: '8 Litre',
        weight: '125 kg',
        dimensions: '1865x700x1345 mm'
      },
      description: 'Vespa LX 150, klasik Vespa deneyimi sunan güvenilir ve ekonomik model.',
      inStock: true,
      rating: 4.1,
      image: '/api/placeholder/300/200'
    },
    {
      id: 5,
      name: 'Vespa Elettrica',
      category: 'Elektrikli',
      price: 165000,
      currency: 'TL',
      engineSize: 'Elektrikli',
      maxSpeed: '45 km/h',
      fuelConsumption: '0 L/100km',
      colors: ['Beyaz', 'Gri'],
      features: [
        'Tamamen Elektrikli',
        'Sessiz Motor',
        'Çevre Dostu',
        'Akıllı Bağlantı',
        'Hızlı Şarj'
      ],
      specifications: {
        engine: 'Elektrik Motor',
        power: '4 kW',
        torque: '200 Nm',
        transmission: 'Direkt',
        fuel: '4.2 kWh Batarya',
        weight: '130 kg',
        dimensions: '1930x745x1350 mm'
      },
      description: 'Vespa Elettrica, çevre dostu elektrikli teknoloji ile geleneksel Vespa tasarımını birleştiriyor.',
      inStock: true,
      rating: 4.6,
      image: '/api/placeholder/300/200'
    }
  ]);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: 0,
    engineSize: '',
    maxSpeed: '',
    fuelConsumption: '',
    colors: [],
    features: [],
    description: '',
    inStock: true
  });

  const categories = ['Klasik', 'Sport', 'Touring', 'Elektrikli'];

  const filteredModels = vespaModels.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || model.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleModelDetail = (model) => {
    setSelectedModel(model);
    onOpen();
  };

  const handleAddModel = () => {
    setSelectedModel(null);
    setFormData({
      name: '',
      category: '',
      price: 0,
      engineSize: '',
      maxSpeed: '',
      fuelConsumption: '',
      colors: [],
      features: [],
      description: '',
      inStock: true
    });
    onOpen();
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Icon key={i} as={MdStar} color="yellow.400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Icon key="half" as={MdStar} color="yellow.400" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Icon key={`empty-${i}`} as={MdStarBorder} color="gray.300" />);
    }
    
    return stars;
  };

  const getTotalModels = () => vespaModels.length;
  const getInStockModels = () => vespaModels.filter(model => model.inStock).length;
  const getAveragePrice = () => {
    const total = vespaModels.reduce((sum, model) => sum + model.price, 0);
    return Math.round(total / vespaModels.length);
  };
  const getTopRatedModel = () => {
    return vespaModels.reduce((max, model) => model.rating > max.rating ? model : max, vespaModels[0]);
  };

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
          value={getTopRatedModel().name.split(' ')[1]}
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
                {filteredModels.map((model) => (
                  <Card key={model.id} overflow="hidden" boxShadow="md">
                    <Box position="relative">
                      <Image
                        src={model.image}
                        alt={model.name}
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
                            <Heading size="md">{model.name}</Heading>
                            <Badge colorScheme="brand">{model.category}</Badge>
                          </HStack>
                          <HStack mt={2}>
                            {renderStars(model.rating)}
                            <Text fontSize="sm" color="gray.600">({model.rating})</Text>
                          </HStack>
                        </Box>

                        <Text fontSize="sm" color="gray.600" noOfLines={2}>
                          {model.description}
                        </Text>

                        <HStack spacing={4} w="100%">
                          <VStack align="start" spacing={1}>
                            <HStack>
                              <Icon as={MdSpeed} color="gray.500" />
                              <Text fontSize="xs">{model.engineSize}</Text>
                            </HStack>
                            <HStack>
                              <Icon as={MdLocalGasStation} color="gray.500" />
                              <Text fontSize="xs">{model.fuelConsumption}</Text>
                            </HStack>
                          </VStack>
                          <VStack align="start" spacing={1}>
                            <HStack>
                              <Icon as={MdColorLens} color="gray.500" />
                              <Text fontSize="xs">{model.colors.length} Renk</Text>
                            </HStack>
                            <HStack>
                              <Icon as={MdBuild} color="gray.500" />
                              <Text fontSize="xs">{model.features.length} Özellik</Text>
                            </HStack>
                          </VStack>
                        </HStack>

                        <Divider />

                        <HStack justify="space-between" w="100%">
                          <VStack align="start" spacing={0}>
                            <Text fontSize="lg" fontWeight="bold" color={brandColor}>
                              ₺{model.price.toLocaleString()}
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
                ))}
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
                    {vespaModels.map((model) => (
                      <Tr key={model.id}>
                        <Td fontWeight="bold">{model.name}</Td>
                        <Td>
                          <Badge colorScheme="brand" size="sm">
                            {model.category}
                          </Badge>
                        </Td>
                        <Td>{model.engineSize}</Td>
                        <Td>{model.specifications.power}</Td>
                        <Td>{model.maxSpeed}</Td>
                        <Td>{model.fuelConsumption}</Td>
                        <Td>{model.specifications.weight}</Td>
                        <Td>₺{model.price.toLocaleString()}</Td>
                      </Tr>
                    ))}
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
                  const categoryModels = vespaModels.filter(model => model.category === category);
                  
                  return (
                    <Card key={category}>
                      <Text fontSize="lg" fontWeight="bold" mb="15px">{category} Modeller</Text>
                      <VStack align="stretch" spacing={3}>
                        {categoryModels.map(model => (
                          <Box key={model.id} p="3" borderRadius="md" bg={boxBg}>
                            <HStack justify="space-between">
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="bold">{model.name}</Text>
                                <HStack>
                                  {renderStars(model.rating)}
                                  <Text fontSize="sm" color="gray.600">({model.rating})</Text>
                                </HStack>
                              </VStack>
                              <VStack align="end" spacing={1}>
                                <Text fontSize="lg" fontWeight="bold" color={brandColor}>
                                  ₺{model.price.toLocaleString()}
                                </Text>
                                <Badge colorScheme={model.inStock ? 'green' : 'red'} size="sm">
                                  {model.inStock ? 'Stokta' : 'Stok Yok'}
                                </Badge>
                              </VStack>
                            </HStack>
                          </Box>
                        ))}
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
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedModel ? selectedModel.name : 'Yeni Model Ekle'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedModel ? (
              <VStack align="stretch" spacing={4}>
                <Image
                  src={selectedModel.image}
                  alt={selectedModel.name}
                  w="100%"
                  h="200px"
                  objectFit="cover"
                  borderRadius="md"
                  fallbackSrc="https://via.placeholder.com/400x200/4A5568/FFFFFF?text=Vespa"
                />
                
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Text fontSize="xl" fontWeight="bold">{selectedModel.name}</Text>
                    <Badge colorScheme="brand">{selectedModel.category}</Badge>
                  </VStack>
                  <VStack align="end" spacing={1}>
                    <Text fontSize="2xl" fontWeight="bold" color={brandColor}>
                      ₺{selectedModel.price.toLocaleString()}
                    </Text>
                    <HStack>
                      {renderStars(selectedModel.rating)}
                      <Text fontSize="sm">({selectedModel.rating})</Text>
                    </HStack>
                  </VStack>
                </HStack>

                <Text color="gray.600">{selectedModel.description}</Text>

                <Box>
                  <Text fontSize="lg" fontWeight="bold" mb="10px">Teknik Özellikler</Text>
                  <SimpleGrid columns={2} gap="10px">
                    {Object.entries(selectedModel.specifications).map(([key, value]) => (
                      <HStack key={key} justify="space-between">
                        <Text fontSize="sm" textTransform="capitalize">{key}:</Text>
                        <Text fontSize="sm" fontWeight="bold">{value}</Text>
                      </HStack>
                    ))}
                  </SimpleGrid>
                </Box>

                <Box>
                  <Text fontSize="lg" fontWeight="bold" mb="10px">Özellikler</Text>
                  <List spacing={2}>
                    {selectedModel.features.map((feature, index) => (
                      <ListItem key={index}>
                        <ListIcon as={MdCheckCircle} color="green.500" />
                        {feature}
                      </ListItem>
                    ))}
                  </List>
                </Box>

                <Box>
                  <Text fontSize="lg" fontWeight="bold" mb="10px">Mevcut Renkler</Text>
                  <HStack wrap="wrap">
                    {selectedModel.colors.map((color, index) => (
                      <Badge key={index} colorScheme="gray" variant="outline">
                        {color}
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