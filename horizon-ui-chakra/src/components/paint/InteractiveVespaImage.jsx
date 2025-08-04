import React, { useState } from 'react';
import { Box, Image, Text, Tooltip } from '@chakra-ui/react';

const InteractiveVespaImage = ({ onPartClick, selectedParts, vespaModel }) => {
  const [hoveredPart, setHoveredPart] = useState(null);

  // Vespa parçaları için koordinat haritası (piksel bazlı)
  const partCoordinates = {
    'front-shield': { x: 120, y: 80, width: 60, height: 40, name: 'Ön Kalkan' },
    'side-panel-left': { x: 80, y: 120, width: 50, height: 90, name: 'Sol Yan Panel' },
    'side-panel-right': { x: 220, y: 120, width: 50, height: 90, name: 'Sağ Yan Panel' },
    'rear-shield': { x: 150, y: 180, width: 40, height: 30, name: 'Arka Kalkan' },
    'engine-cover': { x: 125, y: 150, width: 50, height: 50, name: 'Motor Kalkanı' },
    'seat': { x: 120, y: 110, width: 60, height: 30, name: 'Sele' },
    'front-fender': { x: 130, y: 45, width: 40, height: 20, name: 'Ön Çamurluk' },
    'rear-fender': { x: 130, y: 230, width: 40, height: 15, name: 'Arka Çamurluk' },
    'luggage-box': { x: 170, y: 195, width: 25, height: 20, name: 'Bagaj Kutusu' },
    'handlebar': { x: 100, y: 50, width: 100, height: 8, name: 'Gidon' },
    'headlight': { x: 138, y: 58, width: 24, height: 24, name: 'Far' },
    'mirror-left': { x: 100, y: 40, width: 10, height: 10, name: 'Sol Dikiz Aynası' },
    'mirror-right': { x: 190, y: 40, width: 10, height: 10, name: 'Sağ Dikiz Aynası' },
  };

  const handlePartClick = (partId, partData) => {
    onPartClick({
      id: partId,
      part_name: partData.name,
      svg_element_id: partId,
      coordinates_x: partData.x,
      coordinates_y: partData.y
    });
  };

  const getPartStyle = (partId, partData) => {
    const isSelected = selectedParts[partId];
    const isHovered = hoveredPart === partId;
    
    return {
      position: 'absolute',
      left: `${partData.x}px`,
      top: `${partData.y}px`,
      width: `${partData.width}px`,
      height: `${partData.height}px`,
      backgroundColor: isSelected ? selectedParts[partId].color : 'rgba(0, 123, 255, 0.3)',
      border: isHovered ? '3px solid #007bff' : isSelected ? '2px solid #28a745' : '2px solid transparent',
      borderRadius: '4px',
      cursor: 'pointer',
      opacity: isSelected ? 0.8 : isHovered ? 0.6 : 0.3,
      transition: 'all 0.3s ease',
      zIndex: isHovered ? 10 : 5,
    };
  };

  return (
    <Box position="relative" display="inline-block">
      {/* Ana Vespa Resmi */}
      <Image
        src="/assets/images/vespa-primavera-150.jpg" // Gerçek fotoğraf
        alt={`Vespa ${vespaModel} - Boyama Görünümü`}
        width="400px"
        height="300px"
        objectFit="contain"
        border="2px solid"
        borderColor="gray.300"
        borderRadius="md"
        bg="white"
        fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f5f5f5'/%3E%3Ctext x='200' y='150' text-anchor='middle' font-size='16' fill='%23999'%3E🏍️ Vespa Fotoğrafı%3C/text%3E%3C/svg%3E"
      />

      {/* Tıklanabilir Parça Alanları */}
      {Object.entries(partCoordinates).map(([partId, partData]) => (
        <Tooltip
          key={partId}
          label={`${partData.name} ${selectedParts[partId] ? `(${selectedParts[partId].name})` : '- Boyamak için tıklayın'}`}
          placement="top"
          hasArrow
          bg="blue.600"
          color="white"
        >
          <Box
            style={getPartStyle(partId, partData)}
            onMouseEnter={() => setHoveredPart(partId)}
            onMouseLeave={() => setHoveredPart(null)}
            onClick={() => handlePartClick(partId, partData)}
          />
        </Tooltip>
      ))}

      {/* Hover Info */}
      {hoveredPart && (
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
          zIndex={20}
        >
          <Text fontWeight="bold">
            {partCoordinates[hoveredPart]?.name}
          </Text>
          <Text fontSize="xs">
            {selectedParts[hoveredPart] 
              ? `Renk: ${selectedParts[hoveredPart].name}` 
              : 'Boyamak için tıklayın'
            }
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default InteractiveVespaImage;