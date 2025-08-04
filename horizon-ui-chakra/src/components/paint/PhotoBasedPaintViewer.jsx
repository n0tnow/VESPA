import React, { useState, useEffect } from 'react';
import {
  Box,
  HStack,
  VStack,
  Button,
  Text,
  Image,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react';
import {
  MdRotateLeft,
  MdRotateRight,
  MdVisibility,
  MdViewArray,
} from 'react-icons/md';

const PhotoBasedPaintViewer = ({ 
  vespaModel, 
  selectedTemplate, 
  templateParts, 
  onPartClick, 
  selectedParts, 
  selectedColor, 
  colorName 
}) => {
  const [currentView, setCurrentView] = useState('front');
  const [hoveredPart, setHoveredPart] = useState(null);
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.300', 'gray.600');

  // View options with PNG line drawings
  const views = [
    { id: 'front', name: 'Ön Görünüm', icon: '🔍', photo: '/assets/photos/vespa-front.png' },
    { id: 'left', name: 'Sol Görünüm', icon: '👈', photo: '/assets/photos/vespa-left.png' },
    { id: 'right', name: 'Sağ Görünüm', icon: '👉', photo: '/assets/photos/vespa-right.png' },
    { id: 'rear', name: 'Arka Görünüm', icon: '🔄', photo: '/assets/photos/vespa-rear.png' },
  ];

  // Motor parça koordinatları (PNG line drawings için)
  // Not: Bu koordinatlar PNG boyutuna göre ayarlanmalı
  const partCoordinates = {
    front: [
      { id: 'front-shield', name: 'Ön Kalkan', coords: '200,200,600,450', shape: 'rect' },
      { id: 'main-body', name: 'Ana Gövde', coords: '250,450,550,700', shape: 'rect' },
      { id: 'seat', name: 'Sele', coords: '300,150,500,250', shape: 'rect' },
      { id: 'front-fender', name: 'Ön Çamurluk', coords: '350,700,450,800', shape: 'rect' },
      { id: 'side-panel-left', name: 'Sol Yan Panel', coords: '150,350,300,600', shape: 'rect' },
      { id: 'side-panel-right', name: 'Sağ Yan Panel', coords: '500,350,650,600', shape: 'rect' },
    ],
    left: [
      { id: 'main-body', name: 'Ana Gövde', coords: '200,250,700,500', shape: 'rect' },
      { id: 'front-shield', name: 'Ön Kalkan', coords: '100,200,250,400', shape: 'rect' },
      { id: 'seat', name: 'Sele', coords: '300,150,600,250', shape: 'rect' },
      { id: 'side-panel-left', name: 'Sol Yan Panel', coords: '150,300,350,550', shape: 'rect' },
      { id: 'front-fender', name: 'Ön Çamurluk', coords: '100,550,250,650', shape: 'rect' },
      { id: 'rear-fender', name: 'Arka Çamurluk', coords: '650,550,800,650', shape: 'rect' },
      { id: 'engine-cover', name: 'Motor Kalkanı', coords: '400,450,600,600', shape: 'rect' },
    ],
    right: [
      { id: 'main-body', name: 'Ana Gövde', coords: '100,250,600,500', shape: 'rect' },
      { id: 'front-shield', name: 'Ön Kalkan', coords: '550,200,700,400', shape: 'rect' },
      { id: 'seat', name: 'Sele', coords: '200,150,500,250', shape: 'rect' },
      { id: 'side-panel-right', name: 'Sağ Yan Panel', coords: '450,300,650,550', shape: 'rect' },
      { id: 'front-fender', name: 'Ön Çamurluk', coords: '550,550,700,650', shape: 'rect' },
      { id: 'rear-fender', name: 'Arka Çamurluk', coords: '0,550,150,650', shape: 'rect' },
      { id: 'engine-cover', name: 'Motor Kalkanı', coords: '200,450,400,600', shape: 'rect' },
    ],
    rear: [
      { id: 'main-body', name: 'Ana Gövde', coords: '250,300,550,600', shape: 'rect' },
      { id: 'seat', name: 'Sele', coords: '300,100,500,200', shape: 'rect' },
      { id: 'side-panel-left', name: 'Sol Yan Panel', coords: '100,300,300,650', shape: 'rect' },
      { id: 'side-panel-right', name: 'Sağ Yan Panel', coords: '500,300,700,650', shape: 'rect' },
      { id: 'rear-fender', name: 'Arka Çamurluk', coords: '300,650,500,750', shape: 'rect' },
      { id: 'engine-cover', name: 'Motor Kalkanı', coords: '350,600,450,700', shape: 'rect' },
    ]
  };

  const handleAreaClick = (part) => {
    console.log('🖱️ Photo Part Click:', {
      part,
      selectedColor,
      colorName
    });

    if (selectedColor && colorName) {
      const templatePart = templateParts?.find(p => p.svg_element_id === part.id);
      if (templatePart) {
        onPartClick(templatePart);
      } else {
        // Create a mock template part for compatibility
        onPartClick({
          id: Math.random(),
          part_name: part.name,
          svg_element_id: part.id,
          coordinates_x: 0,
          coordinates_y: 0,
          view: currentView
        });
      }
    }
  };

  const getPartOverlayStyle = (partId) => {
    const partData = selectedParts[partId];
    if (!partData) return {};

    return {
      backgroundColor: partData.color,
      opacity: 0.4,
      mixBlendMode: 'multiply',
      pointerEvents: 'none'
    };
  };

  // Koordinat ayarlama için debug modu
  const handleImageClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    const scaleX = e.target.naturalWidth / e.target.width;
    const scaleY = e.target.naturalHeight / e.target.height;
    const realX = Math.round(x * scaleX);
    const realY = Math.round(y * scaleY);
    
    console.log('📍 KOORDINAT AYARLAMA:', {
      view: currentView,
      clicked: `${x},${y}`,
      realSize: `${realX},${realY}`,
      imageSize: `${e.target.naturalWidth}x${e.target.naturalHeight}`,
      displaySize: `${e.target.width}x${e.target.height}`,
      suggested: `coords: '${realX-50},${realY-50},${realX+50},${realY+50}'`
    });
  };

  const getCurrentPhoto = () => {
    const view = views.find(v => v.id === currentView);
    return view?.photo || '/assets/photos/vespa-front.png';
  };

  const getCurrentParts = () => {
    return partCoordinates[currentView] || partCoordinates.front;
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

      {/* Photo Container */}
      <Box
        bg={cardBg}
        border="2px solid"
        borderColor={borderColor}
        borderRadius="lg"
        p={4}
        minH="500px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
        overflow="hidden"
      >
        <Box position="relative" maxW="100%" maxH="100%">
          {/* Main Photo */}
          <Image
            src={getCurrentPhoto()}
            alt={`Vespa ${currentView} view`}
            maxW="100%"
            maxH="450px"
            objectFit="contain"
            useMap={`#vespa-${currentView}-map`}
            onClick={handleImageClick}
            style={{ cursor: 'crosshair' }}
          />

          {/* Color Overlays */}
          {getCurrentParts().map((part) => {
            const partData = selectedParts[part.id];
            if (!partData) return null;

            const coords = part.coords.split(',').map(Number);
            const [x1, y1, x2, y2] = coords;

            return (
              <Box
                key={`overlay-${part.id}`}
                position="absolute"
                left={`${(x1 / 800) * 100}%`}
                top={`${(y1 / 600) * 100}%`}
                width={`${((x2 - x1) / 800) * 100}%`}
                height={`${((y2 - y1) / 600) * 100}%`}
                bg={partData.color}
                opacity={0.5}
                mixBlendMode="multiply"
                borderRadius="md"
                border="2px solid"
                borderColor={partData.color}
                pointerEvents="none"
                transition="all 0.3s ease"
              />
            );
          })}

          {/* Hover Indicator */}
          {hoveredPart && (
            <Box
              position="absolute"
              left={`${(hoveredPart.coords.split(',')[0] / 800) * 100}%`}
              top={`${(hoveredPart.coords.split(',')[1] / 600) * 100}%`}
              width={`${((hoveredPart.coords.split(',')[2] - hoveredPart.coords.split(',')[0]) / 800) * 100}%`}
              height={`${((hoveredPart.coords.split(',')[3] - hoveredPart.coords.split(',')[1]) / 600) * 100}%`}
              border="3px dashed"
              borderColor="blue.400"
              bg="blue.100"
              opacity={0.3}
              borderRadius="md"
              pointerEvents="none"
              animation="pulse 1.5s infinite"
            />
          )}

          {/* Image Map */}
          <map name={`vespa-${currentView}-map`}>
            {getCurrentParts().map((part) => (
              <area
                key={part.id}
                shape={part.shape}
                coords={part.coords}
                alt={part.name}
                title={part.name}
                onClick={() => handleAreaClick(part)}
                onMouseEnter={() => setHoveredPart(part)}
                onMouseLeave={() => setHoveredPart(null)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </map>

          {/* Part Labels */}
          {getCurrentParts().map((part) => {
            const coords = part.coords.split(',').map(Number);
            const centerX = (coords[0] + coords[2]) / 2;
            const centerY = (coords[1] + coords[3]) / 2;

            return (
              <Tooltip key={`label-${part.id}`} label={part.name}>
                <Box
                  position="absolute"
                  left={`${(centerX / 800) * 100}%`}
                  top={`${(centerY / 600) * 100}%`}
                  transform="translate(-50%, -50%)"
                  bg="rgba(0,0,0,0.7)"
                  color="white"
                  px={2}
                  py={1}
                  borderRadius="md"
                  fontSize="xs"
                  fontWeight="bold"
                  pointerEvents="none"
                  opacity={hoveredPart?.id === part.id ? 1 : 0}
                  transition="opacity 0.3s ease"
                >
                  {part.name}
                </Box>
              </Tooltip>
            );
          })}
        </Box>

        {/* Instructions Overlay */}
        <Box
          position="absolute"
          bottom="10px"
          left="10px"
          bg="rgba(0, 0, 0, 0.8)"
          color="white"
          px={3}
          py={2}
          borderRadius="md"
          fontSize="sm"
        >
          <Text fontWeight="bold">💡 Nasıl Kullanılır:</Text>
          <Text fontSize="xs">
            1. Sağ panelden renk seçin<br/>
            2. Fotoğraf üzerindeki parçalara tıklayın<br/>
            3. Farklı açıları görüntüleyin
          </Text>
        </Box>
      </Box>

      {/* Quick Actions */}
      <HStack justify="center" spacing={2}>
        <Tooltip label="Önceki görünüm">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<MdRotateLeft />}
            onClick={() => {
              const currentIndex = views.findIndex(v => v.id === currentView);
              const prevIndex = currentIndex > 0 ? currentIndex - 1 : views.length - 1;
              setCurrentView(views[prevIndex].id);
            }}
          >
            Önceki
          </Button>
        </Tooltip>

        <Tooltip label="Sonraki görünüm">
          <Button
            size="sm"
            variant="outline"
            rightIcon={<MdRotateRight />}
            onClick={() => {
              const currentIndex = views.findIndex(v => v.id === currentView);
              const nextIndex = currentIndex < views.length - 1 ? currentIndex + 1 : 0;
              setCurrentView(views[nextIndex].id);
            }}
          >
            Sonraki
          </Button>
        </Tooltip>

        <Text fontSize="sm" color="gray.500">
          {currentView.toUpperCase()} Görünümü - {getCurrentParts().length} Parça
        </Text>
      </HStack>
    </VStack>
  );
};

export default PhotoBasedPaintViewer;