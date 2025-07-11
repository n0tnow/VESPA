import React from "react";

// Chakra imports
import { Flex, useColorModeValue, Text, Icon } from "@chakra-ui/react";
import { MdDirectionsBike } from "react-icons/md";

// Custom components
import { HSeparator } from "components/separator/Separator";

export function SidebarBrand() {
  //   Chakra color mode
  let logoColor = useColorModeValue("navy.700", "white");
  let brandColor = useColorModeValue("brand.500", "brand.400");

  return (
    <Flex align='center' direction='column'>
      <Flex align='center' mb='20px' mt='32px'>
        <Icon 
          as={MdDirectionsBike} 
          w='32px' 
          h='32px' 
          color={brandColor} 
          mr='12px'
        />
        <Text 
          fontSize='24px' 
          fontWeight='bold' 
          color={logoColor}
          letterSpacing='0.5px'
        >
          MotoEtiler
        </Text>
      </Flex>
      <HSeparator mb='20px' />
    </Flex>
  );
}

export default SidebarBrand;
