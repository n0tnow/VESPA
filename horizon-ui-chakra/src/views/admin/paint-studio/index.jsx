import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  useColorModeValue,
  SimpleGrid,
  Icon,
  VStack,
  HStack,
  Select,
  Input,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Card as ChakraCard,
  CardBody,
  List,
  ListItem,
  ListIcon,
  IconButton,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import {
  MdPalette,
  MdBrush,
  MdColorize,
  MdSave,
  MdPrint,
  MdRefresh,
  MdCheck,
  MdCircle,
} from 'react-icons/md';
import Card from 'components/card/Card';
import MultiAngleSVGViewer from 'components/paint/MultiAngleSVGViewer';
import PhotoBasedPaintViewer from 'components/paint/PhotoBasedPaintViewer';
import apiService from 'services/apiService';

export default function PaintStudio() {
  const brandColor = useColorModeValue('brand.500', 'white');
  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  const cardBg = useColorModeValue('white', 'gray.700');
  const { isOpen, onOpen, onClose } = useDisclosure();

  // State management
  const [vespaModels, setVespaModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [paintTemplates, setPaintTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateParts, setTemplateParts] = useState([]);
  const [selectedParts, setSelectedParts] = useState({}); // {partId: {color: '#hex', name: 'Color Name'}}
  const [selectedColor, setSelectedColor] = useState('#FF0000');
  const [colorName, setColorName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  // Pre-defined colors for quick selection
  // Expanded predefined colors - organized by categories
  const predefinedColors = [
    // Temel Renkler (Basic Colors)
    { hex: '#FF0000', name: 'Kırmızı', category: 'basic' },
    { hex: '#00FF00', name: 'Yeşil', category: 'basic' },
    { hex: '#0000FF', name: 'Mavi', category: 'basic' },
    { hex: '#FFFF00', name: 'Sarı', category: 'basic' },
    { hex: '#FF6600', name: 'Turuncu', category: 'basic' },
    { hex: '#800080', name: 'Mor', category: 'basic' },
    { hex: '#FFC0CB', name: 'Pembe', category: 'basic' },
    { hex: '#000000', name: 'Siyah', category: 'basic' },
    
    // Motor Renkleri (Motorcycle Colors)
    { hex: '#B22222', name: 'Vespa Kırmızısı', category: 'vespa' },
    { hex: '#228B22', name: 'Vespa Yeşili', category: 'vespa' },
    { hex: '#4169E1', name: 'Vespa Mavisi', category: 'vespa' },
    { hex: '#FFD700', name: 'Vespa Sarısı', category: 'vespa' },
    { hex: '#DC143C', name: 'Ferrari Kırmızısı', category: 'vespa' },
    { hex: '#2F4F4F', name: 'Koyu Gri', category: 'vespa' },
    { hex: '#708090', name: 'Açık Gri', category: 'vespa' },
    { hex: '#FFFFFF', name: 'Pearl Beyaz', category: 'vespa' },
    
    // Metalik Renkler (Metallic Colors)
    { hex: '#C0C0C0', name: 'Gümüş', category: 'metallic' },
    { hex: '#CD7F32', name: 'Bronz', category: 'metallic' },
    { hex: '#B87333', name: 'Bakır', category: 'metallic' },
    { hex: '#36454F', name: 'Metalik Gri', category: 'metallic' },
    { hex: '#4B0082', name: 'Metalik Mor', category: 'metallic' },
    { hex: '#8B4513', name: 'Metalik Kahve', category: 'metallic' },
    { hex: '#2F4F4F', name: 'Metalik Siyah', category: 'metallic' },
    { hex: '#DAA520', name: 'Metalik Altın', category: 'metallic' },
    
    // Pastel Renkler (Pastel Colors)
    { hex: '#FFB6C1', name: 'Açık Pembe', category: 'pastel' },
    { hex: '#98FB98', name: 'Açık Yeşil', category: 'pastel' },
    { hex: '#87CEEB', name: 'Açık Mavi', category: 'pastel' },
    { hex: '#F0E68C', name: 'Açık Sarı', category: 'pastel' },
    { hex: '#DDA0DD', name: 'Açık Mor', category: 'pastel' },
    { hex: '#F5DEB3', name: 'Krem', category: 'pastel' },
    { hex: '#E6E6FA', name: 'Lavanta', category: 'pastel' },
    { hex: '#FFF8DC', name: 'Bej', category: 'pastel' },
  ];

  // Load data on mount
  useEffect(() => {
    loadVespaModels();
  }, []);

  // Load paint templates when model changes
  useEffect(() => {
    if (selectedModel) {
      loadPaintTemplates(selectedModel);
    }
  }, [selectedModel]);

  // Load template parts when template changes
  useEffect(() => {
    if (selectedTemplate) {
      loadTemplateParts(selectedTemplate.id);
    }
  }, [selectedTemplate]);

  const loadVespaModels = async () => {
    try {
      setLoading(true);
      const response = await apiService.getVespaModels();
      setVespaModels(response.models || response || []);
    } catch (error) {
      console.error('Error loading Vespa models:', error);
      setError('Vespa modelleri yüklenirken hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPaintTemplates = async (modelId) => {
    try {
      setLoading(true);
      const response = await apiService.getPaintTemplates(modelId);
      setPaintTemplates(response.templates || []);
      setSelectedTemplate(null);
      setTemplateParts([]);
      setSelectedParts({});
    } catch (error) {
      console.error('Error loading paint templates:', error);
      setError('Boyama şablonları yüklenirken hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplateParts = async (templateId) => {
    try {
      setLoading(true);
      const response = await apiService.getPaintTemplateParts(templateId);
      setTemplateParts(response.parts || []);
      setSelectedParts({});
    } catch (error) {
      console.error('Error loading template parts:', error);
      setError('Şablon parçaları yüklenirken hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePartClick = (part) => {
    if (selectedColor && colorName) {
      setSelectedParts(prev => ({
        ...prev,
        [part.id]: {
          color: selectedColor,
          name: colorName,
          partName: part.part_name,
          svgElementId: part.svg_element_id
        }
      }));
    } else {
      setError('Lütfen önce renk seçin ve renk adı girin');
    }
  };

  const handleRemovePart = (partId) => {
    setSelectedParts(prev => {
      const newParts = { ...prev };
      delete newParts[partId];
      return newParts;
    });
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color.hex);
    setColorName(color.name);
  };

  const handleSavePaintJob = async () => {
    try {
      if (!selectedTemplate || Object.keys(selectedParts).length === 0) {
        setError('Lütfen şablon seçin ve en az bir parça boyayın');
        return;
      }

      setLoading(true);

      // Prepare selected parts data
      const selectedPartsData = Object.entries(selectedParts).map(([partId, partData]) => ({
        template_part_id: parseInt(partId),
        color_code: partData.color,
        color_name: partData.name,
        estimated_cost: 0
      }));

      const paintJobData = {
        service_id: 1, // TODO: Get from actual service record
        template_id: selectedTemplate.id,
        selected_parts: selectedPartsData,
        estimated_cost: 0
      };

      const response = await apiService.createPaintJob(paintJobData);
      console.log('Paint job created:', response);
      
      // Show success and open print view
      onOpen();

    } catch (error) {
      console.error('Error saving paint job:', error);
      setError('Boyama işi kaydedilirken hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintPaintJob = () => {
    // Create print content
    const printContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>🎨 BOYAMA İŞİ FORMU</h1>
        <hr/>
        <h2>Vespa Model: ${selectedTemplate?.model_name || 'Bilinmiyor'}</h2>
        <h3>Şablon: ${selectedTemplate?.template_name || 'Bilinmiyor'}</h3>
        <h3>Tarih: ${new Date().toLocaleDateString('tr-TR')}</h3>
        <hr/>
        <h2>🎯 BOYANACAK PARÇALAR:</h2>
        <table border="1" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 10px;">Parça Adı</th>
              <th style="padding: 10px;">Renk</th>
              <th style="padding: 10px;">Renk Kodu</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(selectedParts).map(([partId, partData]) => `
              <tr>
                <td style="padding: 10px;">${partData.partName}</td>
                <td style="padding: 10px;">
                  <div style="display: inline-flex; align-items: center;">
                    <div style="width: 30px; height: 20px; background-color: ${partData.color}; border: 1px solid #000; margin-right: 10px;"></div>
                    ${partData.name}
                  </div>
                </td>
                <td style="padding: 10px; font-family: monospace;">${partData.color}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <br/>
        <p><strong>Toplam Parça Sayısı:</strong> ${Object.keys(selectedParts).length}</p>
        <hr/>
        <p style="margin-top: 30px;">
          <strong>Boyacı İmzası:</strong> ______________________ 
          <strong style="margin-left: 50px;">Tarih:</strong> ______________________
        </p>
      </div>
    `;

    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb="20px">
        <Text fontSize="2xl" fontWeight="bold" color={brandColor}>
          🎨 Paint Studio - Boyama Sistemi
        </Text>
        <HStack spacing={3}>
          <Button
            leftIcon={<MdSave />}
            colorScheme="brand"
            onClick={handleSavePaintJob}
            isLoading={loading}
            isDisabled={Object.keys(selectedParts).length === 0}
          >
            Boyama İşini Kaydet
          </Button>
          <Button
            leftIcon={<MdPrint />}
            colorScheme="green"
            onClick={onOpen}
            isDisabled={Object.keys(selectedParts).length === 0}
          >
            Boyacı Çıktısı
          </Button>
        </HStack>
      </Flex>

      {/* Error Alert */}
      {error && (
        <Alert status="error" mb="20px" borderRadius="12px">
          <AlertIcon />
          <AlertTitle>Hata!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Grid templateColumns="1fr 350px" gap={6}>
        {/* Left Panel - Model Selection & Canvas */}
        <GridItem>
          <Card>
            <VStack spacing={6} align="stretch">
              {/* Model and Template Selection */}
              <HStack spacing={4}>
                <FormControl>
                  <FormLabel>Vespa Modeli</FormLabel>
                  <Select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    placeholder="Model seçin"
                  >
                    {vespaModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.model_name} ({model.category})
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Boyama Şablonu</FormLabel>
                  <Select
                    value={selectedTemplate?.id || ''}
                    onChange={(e) => {
                      const template = paintTemplates.find(t => t.id === parseInt(e.target.value));
                      setSelectedTemplate(template);
                    }}
                    placeholder="Şablon seçin"
                    isDisabled={!selectedModel}
                  >
                    {paintTemplates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.template_name} ({template.parts_count} parça)
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </HStack>

              {/* Paint Canvas Area */}
              <Box 
                border="2px dashed" 
                borderColor="gray.300" 
                borderRadius="lg" 
                p={8} 
                minH="400px"
                bg={cardBg}
                position="relative"
              >
                {selectedTemplate ? (
                  <VStack spacing={4} align="center">
                    <Text fontSize="lg" fontWeight="bold">
                      🏍️ {selectedTemplate.template_name}
                    </Text>
                    <Text color="gray.500">
                      SVG Şablonu: {selectedTemplate.svg_template_path}
                    </Text>
                    
                    {/* Photo-Based Paint Viewer */}
                    <PhotoBasedPaintViewer
                      vespaModel={selectedTemplate.model_name}
                      selectedTemplate={selectedTemplate}
                      templateParts={templateParts}
                      onPartClick={handlePartClick}
                      selectedParts={selectedParts}
                      selectedColor={selectedColor}
                      colorName={colorName}
                    />

                    {/* Template Parts List */}
                    {templateParts.length > 0 && (
                      <Box w="100%">
                        <Text fontWeight="bold" mb={2}>Boyama Parçaları:</Text>
                        <SimpleGrid columns={3} spacing={2}>
                          {templateParts.map((part) => (
                            <Button
                              key={part.id}
                              variant="outline"
                              size="sm"
                              onClick={() => handlePartClick(part)}
                              bg={selectedParts[part.id] ? selectedParts[part.id].color : 'transparent'}
                              color={selectedParts[part.id] ? 'white' : 'inherit'}
                              _hover={{ transform: 'scale(1.05)' }}
                            >
                              {part.part_name}
                            </Button>
                          ))}
                        </SimpleGrid>
                      </Box>
                    )}
                  </VStack>
                ) : (
                  <VStack spacing={4} align="center" justify="center" h="100%">
                    <Icon as={MdPalette} boxSize="60px" color="gray.400" />
                    <Text color="gray.500" textAlign="center">
                      Boyama yapmak için önce Vespa modeli ve şablon seçin
                    </Text>
                  </VStack>
                )}
              </Box>
            </VStack>
          </Card>
        </GridItem>

        {/* Right Panel - Color Palette & Selected Parts */}
        <GridItem>
          <VStack spacing={6} align="stretch">
            {/* Color Selection Panel */}
            <Card>
              <VStack spacing={4} align="stretch">
                <HStack>
                  <Icon as={MdColorize} color={brandColor} />
                  <Text fontSize="lg" fontWeight="bold">Renk Seçimi</Text>
                </HStack>
                
                {/* Large Color Picker - Optimized */}
                <VStack spacing={3} align="stretch">
                  <FormControl>
                    <FormLabel fontSize="sm">🎨 Büyük Renk Seçici</FormLabel>
                    <Box position="relative">
                      <Input
                        type="color"
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        w="100%"
                        h="80px"
                        p={2}
                        border="2px solid"
                        borderColor="gray.300"
                        borderRadius="lg"
                        cursor="pointer"
                        transition="border-color 0.2s ease"
                        _hover={{ borderColor: 'blue.400' }}
                        _focus={{ borderColor: 'blue.500', outline: 'none' }}
                        style={{
                          WebkitAppearance: 'none',
                          appearance: 'none',
                        }}
                      />
                      {/* Performance overlay */}
                      <Box
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                        pointerEvents="none"
                        fontSize="xs"
                        color="gray.600"
                        fontWeight="bold"
                        textShadow="1px 1px 2px rgba(255,255,255,0.8)"
                      >
                        Renk Seçin
                      </Box>
                    </Box>
                  </FormControl>
                  
                  {/* Hex Input */}
                  <HStack>
                    <FormControl>
                      <FormLabel fontSize="sm">Hex Kod</FormLabel>
                      <Input
                        value={selectedColor}
                        onChange={(e) => {
                          if (/^#[0-9A-F]{6}$/i.test(e.target.value) || e.target.value === '#') {
                            setSelectedColor(e.target.value.toUpperCase());
                          }
                        }}
                        placeholder="#FF0000"
                        maxLength={7}
                        fontFamily="mono"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm">Renk Adı</FormLabel>
                      <Input
                        value={colorName}
                        onChange={(e) => setColorName(e.target.value)}
                        placeholder="Örn: Parlak Kırmızı"
                      />
                    </FormControl>
                  </HStack>
                </VStack>

                {/* Categorized Predefined Colors */}
                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={3}>Hazır Renkler:</Text>
                  <Tabs size="sm" variant="soft-rounded" colorScheme="blue">
                    <TabList>
                      <Tab fontSize="xs">Temel</Tab>
                      <Tab fontSize="xs">Vespa</Tab>
                      <Tab fontSize="xs">Metalik</Tab>
                      <Tab fontSize="xs">Pastel</Tab>
                    </TabList>
                    <TabPanels>
                      {/* Basic Colors */}
                      <TabPanel p={3}>
                        <SimpleGrid columns={4} spacing={2}>
                          {predefinedColors.filter(c => c.category === 'basic').map((color) => (
                            <Tooltip key={color.hex} label={color.name}>
                              <Box
                                w="45px"
                                h="45px"
                                bg={color.hex}
                                borderRadius="lg"
                                border="3px solid"
                                borderColor={selectedColor === color.hex ? 'blue.500' : 'gray.300'}
                                cursor="pointer"
                                onClick={() => handleColorSelect(color)}
                                _hover={{ transform: 'scale(1.1)', borderColor: 'blue.400' }}
                                transition="all 0.2s"
                              />
                            </Tooltip>
                          ))}
                        </SimpleGrid>
                      </TabPanel>
                      
                      {/* Vespa Colors */}
                      <TabPanel p={3}>
                        <SimpleGrid columns={4} spacing={2}>
                          {predefinedColors.filter(c => c.category === 'vespa').map((color) => (
                            <Tooltip key={color.hex} label={color.name}>
                              <Box
                                w="45px"
                                h="45px"
                                bg={color.hex}
                                borderRadius="lg"
                                border="3px solid"
                                borderColor={selectedColor === color.hex ? 'blue.500' : 'gray.300'}
                                cursor="pointer"
                                onClick={() => handleColorSelect(color)}
                                _hover={{ transform: 'scale(1.1)', borderColor: 'blue.400' }}
                                transition="all 0.2s"
                              />
                            </Tooltip>
                          ))}
                        </SimpleGrid>
                      </TabPanel>
                      
                      {/* Metallic Colors */}
                      <TabPanel p={3}>
                        <SimpleGrid columns={4} spacing={2}>
                          {predefinedColors.filter(c => c.category === 'metallic').map((color) => (
                            <Tooltip key={color.hex} label={color.name}>
                              <Box
                                w="45px"
                                h="45px"
                                bg={color.hex}
                                borderRadius="lg"
                                border="3px solid"
                                borderColor={selectedColor === color.hex ? 'blue.500' : 'gray.300'}
                                cursor="pointer"
                                onClick={() => handleColorSelect(color)}
                                _hover={{ transform: 'scale(1.1)', borderColor: 'blue.400' }}
                                transition="all 0.2s"
                              />
                            </Tooltip>
                          ))}
                        </SimpleGrid>
                      </TabPanel>
                      
                      {/* Pastel Colors */}
                      <TabPanel p={3}>
                        <SimpleGrid columns={4} spacing={2}>
                          {predefinedColors.filter(c => c.category === 'pastel').map((color) => (
                            <Tooltip key={color.hex} label={color.name}>
                              <Box
                                w="45px"
                                h="45px"
                                bg={color.hex}
                                borderRadius="lg"
                                border="3px solid"
                                borderColor={selectedColor === color.hex ? 'blue.500' : 'gray.300'}
                                cursor="pointer"
                                onClick={() => handleColorSelect(color)}
                                _hover={{ transform: 'scale(1.1)', borderColor: 'blue.400' }}
                                transition="all 0.2s"
                              />
                            </Tooltip>
                          ))}
                        </SimpleGrid>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </Box>

                {/* Current Selection */}
                <HStack p={3} bg={boxBg} borderRadius="md">
                  <Box
                    w="30px"
                    h="30px"
                    bg={selectedColor}
                    borderRadius="md"
                    border="1px solid"
                    borderColor="gray.300"
                  />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight="bold">{colorName || 'Renk adı giriniz'}</Text>
                    <Text fontSize="xs" color="gray.500">{selectedColor}</Text>
                  </VStack>
                </HStack>
              </VStack>
            </Card>

            {/* Selected Parts List */}
            <Card>
              <VStack spacing={4} align="stretch">
                <HStack>
                  <Icon as={MdBrush} color={brandColor} />
                  <Text fontSize="lg" fontWeight="bold">Seçilen Parçalar</Text>
                  <Badge colorScheme="blue">{Object.keys(selectedParts).length}</Badge>
                </HStack>

                {Object.keys(selectedParts).length > 0 ? (
                  <List spacing={2}>
                    {Object.entries(selectedParts).map(([partId, partData]) => (
                      <ListItem key={partId}>
                        <HStack justify="space-between" p={2} bg={boxBg} borderRadius="md">
                          <HStack>
                            <Box
                              w="20px"
                              h="20px"
                              bg={partData.color}
                              borderRadius="sm"
                              border="1px solid"
                              borderColor="gray.300"
                            />
                            <VStack align="start" spacing={0}>
                              <Text fontSize="sm" fontWeight="bold">{partData.partName}</Text>
                              <Text fontSize="xs" color="gray.500">{partData.name}</Text>
                            </VStack>
                          </HStack>
                          <IconButton
                            icon={<MdRefresh />}
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => handleRemovePart(partId)}
                            aria-label="Remove part"
                          />
                        </HStack>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box p={4} textAlign="center" color="gray.500">
                    <Icon as={MdPalette} boxSize="40px" mb={2} />
                    <Text fontSize="sm">Henüz parça seçilmedi</Text>
                  </Box>
                )}
              </VStack>
            </Card>
          </VStack>
        </GridItem>
      </Grid>

      {/* Print Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>🖨️ Boyacı Çıktısı</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text>Boyacıya verilecek olan çıktı bilgileri:</Text>
              
              <Box p={4} bg="gray.50" borderRadius="md">
                <Text fontWeight="bold">Model: {selectedTemplate?.model_name}</Text>
                <Text fontWeight="bold">Şablon: {selectedTemplate?.template_name}</Text>
                <Text>Tarih: {new Date().toLocaleDateString('tr-TR')}</Text>
              </Box>

              <Text fontWeight="bold">Boyanacak Parçalar:</Text>
              {Object.entries(selectedParts).map(([partId, partData]) => (
                <HStack key={partId} p={2} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
                  <Box
                    w="30px"
                    h="20px"
                    bg={partData.color}
                    borderRadius="sm"
                    border="1px solid"
                    borderColor="gray.300"
                  />
                  <VStack align="start" spacing={0} flex={1}>
                    <Text fontWeight="bold">{partData.partName}</Text>
                    <Text fontSize="sm" color="gray.600">{partData.name} - {partData.color}</Text>
                  </VStack>
                </HStack>
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              İptal
            </Button>
            <Button colorScheme="blue" onClick={handlePrintPaintJob}>
              🖨️ Yazdır
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}