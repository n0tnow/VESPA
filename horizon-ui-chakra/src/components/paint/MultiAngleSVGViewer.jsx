import React, { useState, useEffect } from 'react';
import {
  Box,
  HStack,
  VStack,
  Button,
  Text,
  Tooltip,
  Badge,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  MdRotateLeft,
  MdRotateRight,
  MdVisibility,
  MdViewArray,
} from 'react-icons/md';

const MultiAngleSVGViewer = ({ 
  vespaModel, 
  selectedTemplate, 
  templateParts, 
  onPartClick, 
  selectedParts, 
  selectedColor, 
  colorName 
}) => {
  const [currentView, setCurrentView] = useState('front'); // front, left, right, rear
  const [svgContent, setSvgContent] = useState('');
  const [originalSvgContent, setOriginalSvgContent] = useState(''); // Store original SVG
  const [loading, setLoading] = useState(false);
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.300', 'gray.600');

  // View options
  const views = [
    { id: 'front', name: 'Ön Görünüm', icon: '🔍', path: 'front-view.svg' },
    { id: 'left', name: 'Sol Görünüm', icon: '👈', path: 'left-view.svg' },
    { id: 'right', name: 'Sağ Görünüm', icon: '👉', path: 'right-view.svg' },
    { id: 'rear', name: 'Arka Görünüm', icon: '🔄', path: 'rear-view.svg' },
  ];

  // Load SVG content when view changes
  useEffect(() => {
    if (selectedTemplate && currentView) {
      loadSVGContent();
    }
  }, [selectedTemplate, currentView]);

  // Apply selected colors to SVG when parts change
  useEffect(() => {
    if (svgContent && Object.keys(selectedParts).length > 0) {
      applySVGColors();
    }
  }, [selectedParts]); // Remove svgContent from dependencies to prevent infinite loop

  const loadSVGContent = async () => {
    try {
      setLoading(true);
      
      // Use default SVG templates for now
      const svgPath = `/assets/svg/vespa-default-${currentView}.svg`;
      console.log('🎨 **NEW CODE** Loading SVG:', svgPath);
      console.log('📋 Vespa Model:', vespaModel);
      console.log('👀 Current View:', currentView);
      console.log('🔍 Full path being requested:', svgPath);
      
      const response = await fetch(svgPath);
      console.log('📡 SVG Response Status:', response.status);
      if (response.ok) {
        const svgText = await response.text();
        console.log('✅ SVG loaded successfully, length:', svgText.length);
        console.log('🔍 SVG content preview:', svgText.substring(0, 200));
        setOriginalSvgContent(svgText);
        setSvgContent(svgText);
      } else {
        console.log('❌ SVG load failed, using placeholder');
        const placeholder = getPlaceholderSVG();
        setOriginalSvgContent(placeholder);
        setSvgContent(placeholder);
      }
    } catch (error) {
      console.error('Error loading SVG:', error);
      setSvgContent(getPlaceholderSVG());
    } finally {
      setLoading(false);
    }
  };

  const applySVGColors = () => {
    if (!originalSvgContent || !templateParts) return;

    console.log('🎨 Applying colors...', {
      selectedParts: Object.keys(selectedParts),
      templateParts: templateParts.map(p => p.svg_element_id)
    });

    // Create a new DOM parser to safely modify SVG
    const parser = new DOMParser();
    const doc = parser.parseFromString(originalSvgContent, 'image/svg+xml');
    
    // Apply colors to selected parts
    Object.entries(selectedParts).forEach(([partId, partData]) => {
      const partElement = templateParts.find(p => p.id == partId);
      if (partElement && partData.color) {
        const elementId = partElement.svg_element_id;
        const svgElement = doc.getElementById(elementId);
        
        console.log(`🖌️ Applying ${partData.color} to ${elementId}:`, svgElement);
        
        if (svgElement) {
          svgElement.setAttribute('fill', partData.color);
          svgElement.classList.add('painted');
        } else {
          console.warn(`❌ SVG element not found: ${elementId}`);
        }
      }
    });

    // Convert back to string
    const serializer = new XMLSerializer();
    const updatedSVG = serializer.serializeToString(doc);
    
    console.log('✅ SVG colors applied');
    setSvgContent(updatedSVG);
  };

  const getPlaceholderSVG = () => {
    return `
      <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="#f8f9fa"/>
        <text x="200" y="150" text-anchor="middle" font-size="16" fill="#666">
          🏍️ Vespa ${currentView.toUpperCase()} Görünümü
        </text>
        <text x="200" y="180" text-anchor="middle" font-size="12" fill="#999">
          SVG dosyası yükleniyor...
        </text>
      </svg>
    `;
  };

  const handleSVGClick = (event) => {
    const clickedElement = event.target;
    const elementId = clickedElement.id;
    
    console.log('🖱️ SVG Click:', {
      elementId,
      clickedElement,
      templateParts: templateParts?.length || 0,
      selectedColor,
      colorName
    });
    
    console.log('🔍 All template parts:', templateParts);
    
    if (elementId && elementId !== '') {
      // Find the corresponding template part
      const templatePart = templateParts.find(p => p.svg_element_id === elementId);
      console.log('🔍 Looking for svg_element_id:', elementId);
      console.log('🔍 Found template part:', templatePart);
      
      if (templatePart && selectedColor && colorName) {
        console.log('✅ Calling onPartClick with:', templatePart);
        onPartClick({
          ...templatePart,
          view: currentView // Add current view info
        });
      } else {
        console.log('❌ Missing requirements:', {
          templatePart: !!templatePart,
          selectedColor: !!selectedColor,
          colorName: !!colorName
        });
      }
    } else {
      console.log('❌ No element ID found');
    }
  };

  const getCurrentViewParts = () => {
    return templateParts.filter(part => 
      part.view === currentView || !part.view // If no view specified, show in all views
    );
  };

  return (
    <VStack spacing={4} align="stretch">
      {/* View Selector */}
      <HStack justify="center" spacing={2}>
        {views.map((view) => (
          <Button
            key={view.id}
            size="sm"
            variant={currentView === view.id ? 'solid' : 'outline'}
            colorScheme={currentView === view.id ? 'blue' : 'gray'}
            onClick={() => setCurrentView(view.id)}
            leftIcon={<span>{view.icon}</span>}
          >
            {view.name}
          </Button>
        ))}
      </HStack>

      {/* Current View Info */}
      <HStack justify="space-between" align="center">
        <Text fontSize="lg" fontWeight="bold">
          {views.find(v => v.id === currentView)?.name} - {vespaModel}
        </Text>
        <HStack>
          <Badge colorScheme="blue">
            {getCurrentViewParts().length} parça
          </Badge>
          <Badge colorScheme="green">
            {Object.keys(selectedParts).length} boyalı
          </Badge>
        </HStack>
      </HStack>

      {/* SVG Viewer */}
      <Box
        bg={cardBg}
        border="2px solid"
        borderColor={borderColor}
        borderRadius="lg"
        p={4}
        minH="400px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
        overflow="hidden"
      >
        {loading ? (
          <VStack>
            <Text color="gray.500">🔄 SVG yükleniyor...</Text>
            <Text fontSize="sm" color="gray.400">{currentView} görünümü</Text>
          </VStack>
        ) : !svgContent ? (
          <VStack>
            <Text color="red.500">❌ SVG yüklenemedi</Text>
            <Text fontSize="sm" color="red.400">SVG içeriği boş</Text>
          </VStack>
        ) : (
          <Box position="relative" w="100%" h="100%">
            {/* Debug Info */}
            <Box 
              position="absolute" 
              top="5px" 
              right="5px" 
              bg="green.100" 
              px={2} 
              py={1} 
              borderRadius="md" 
              fontSize="xs"
              zIndex={10}
            >
              ✅ SVG: {svgContent.length} chars
            </Box>
            
            <Box
              dangerouslySetInnerHTML={{ __html: svgContent }}
              onClick={handleSVGClick}
              cursor="pointer"
              w="100%"
              h="100%"
              sx={{
                '& svg': {
                  width: '100%',
                  height: '100%',
                  display: 'block',
                },
                '& .paint-part': {
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    strokeWidth: '3px',
                    stroke: '#007bff',
                  },
                },
              }}
            />
          </Box>
        )}

        {/* SVG Instructions Overlay */}
        {!loading && (
          <Box
            position="absolute"
            bottom="10px"
            left="10px"
            bg="rgba(0, 0, 0, 0.7)"
            color="white"
            px={3}
            py={2}
            borderRadius="md"
            fontSize="sm"
          >
            <Text fontWeight="bold">💡 Nasıl Kullanılır:</Text>
            <Text fontSize="xs">
              1. Sağ panelden renk seçin<br/>
              2. SVG üzerindeki parçalara tıklayın<br/>
              3. Farklı açıları görüntüleyin
            </Text>
          </Box>
        )}
      </Box>

      {/* Quick Actions */}
      <HStack justify="center" spacing={2}>
        <Tooltip label="Önceki görünüm">
          <IconButton
            icon={<MdRotateLeft />}
            size="sm"
            onClick={() => {
              const currentIndex = views.findIndex(v => v.id === currentView);
              const prevIndex = currentIndex > 0 ? currentIndex - 1 : views.length - 1;
              setCurrentView(views[prevIndex].id);
            }}
          />
        </Tooltip>

        <Button
          size="sm"
          leftIcon={<MdViewArray />}
          onClick={() => {
            // Reset to front view and reload
            setCurrentView('front');
            loadSVGContent();
          }}
        >
          Yenile
        </Button>

        <Tooltip label="Sonraki görünüm">
          <IconButton
            icon={<MdRotateRight />}
            size="sm"
            onClick={() => {
              const currentIndex = views.findIndex(v => v.id === currentView);
              const nextIndex = currentIndex < views.length - 1 ? currentIndex + 1 : 0;
              setCurrentView(views[nextIndex].id);
            }}
          />
        </Tooltip>
      </HStack>

      {/* Current View Parts List */}
      {getCurrentViewParts().length > 0 && (
        <Box>
          <Text fontWeight="bold" mb={2}>
            {views.find(v => v.id === currentView)?.name} Parçaları:
          </Text>
          <Box maxH="150px" overflowY="auto">
            <VStack spacing={1} align="stretch">
              {getCurrentViewParts().map((part) => (
                <HStack
                  key={part.id}
                  p={2}
                  bg={selectedParts[part.id] ? selectedParts[part.id].color : 'gray.100'}
                  borderRadius="md"
                  justify="space-between"
                  cursor="pointer"
                  onClick={() => onPartClick(part)}
                  _hover={{ bg: selectedParts[part.id] ? selectedParts[part.id].color : 'gray.200' }}
                >
                  <Text 
                    fontSize="sm" 
                    color={selectedParts[part.id] ? 'white' : 'black'}
                    fontWeight={selectedParts[part.id] ? 'bold' : 'normal'}
                  >
                    {part.part_name}
                  </Text>
                  {selectedParts[part.id] && (
                    <Badge colorScheme="green" size="sm">
                      {selectedParts[part.id].name}
                    </Badge>
                  )}
                </HStack>
              ))}
            </VStack>
          </Box>
        </Box>
      )}
    </VStack>
  );
};

export default MultiAngleSVGViewer;