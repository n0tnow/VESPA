/* eslint-disable */
/*!
  _   _  ___  ____  ___ ________  _   _   _   _ ___   
 | | | |/ _ \|  _ \|_ _|__  / _ \| \ | | | | | |_ _| 
 | |_| | | | | |_) || |  / / | | |  \| | | | | || | 
 |  _  | |_| |  _ < | | / /| |_| | |\  | | |_| || |
 |_| |_|\___/|_| \_\___/____\___/|_| \_|  \___/|___|
                                                                                                                                                                                                                                                                                                                                       
=========================================================
* Horizon UI - v1.1.0
=========================================================

* Product Page: https://www.horizon-ui.com/
* Copyright 2023 Horizon UI (https://www.horizon-ui.com/)

* Designed and Coded by Simmmple

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// Chakra imports
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
// Custom components
import DefaultAuth from "layouts/auth/Default";
// Assets
import illustration from "assets/img/auth/auth.png";
import { MdOutlineRemoveRedEye, MdDirectionsBike } from "react-icons/md";
import { RiEyeCloseLine } from "react-icons/ri";

function SignIn() {
  // Chakra color mode
  const textColor = useColorModeValue("navy.700", "white");
  const textColorSecondary = "gray.400";
  const textColorBrand = useColorModeValue("brand.500", "white");
  const brandStars = useColorModeValue("brand.500", "brand.400");
  
  const [show, setShow] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  
  const handleClick = () => setShow(!show);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    // MotoEtiler giriş bilgileri
    const validUsername = "MotoEtiler";
    const validPassword = "Motoetiler2025";
    
    if (username === validUsername && password === validPassword) {
      // Giriş başarılı
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("username", username);
      navigate("/admin");
    } else {
      setError("Kullanıcı adı veya şifre hatalı!");
    }
    
    setIsLoading(false);
  };
  return (
    <DefaultAuth illustrationBackground={illustration} image={illustration}>
      <Flex
        maxW={{ base: "100%", md: "max-content" }}
        w='100%'
        mx={{ base: "auto", lg: "0px" }}
        me='auto'
        h='100%'
        alignItems='start'
        justifyContent='center'
        mb={{ base: "30px", md: "60px" }}
        px={{ base: "25px", md: "0px" }}
        mt={{ base: "40px", md: "14vh" }}
        flexDirection='column'>
        <Box me='auto'>
          <Flex align='center' mb='10px'>
            <Icon as={MdDirectionsBike} w='40px' h='40px' color={textColorBrand} mr='12px' />
            <Heading color={textColor} fontSize='36px'>
              MotoEtiler
            </Heading>
          </Flex>
          <Text
            mb='36px'
            ms='4px'
            color={textColorSecondary}
            fontWeight='400'
            fontSize='md'>
            MotoEtiler Vespa Bayi Yönetim Sistemi'ne giriş yapın
          </Text>
        </Box>
        <Flex
          zIndex='2'
          direction='column'
          w={{ base: "100%", md: "420px" }}
          maxW='100%'
          background='transparent'
          borderRadius='15px'
          mx={{ base: "auto", lg: "unset" }}
          me='auto'
          mb={{ base: "20px", md: "auto" }}>
          {error && (
            <Alert status='error' mb='24px' borderRadius='16px'>
              <AlertIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleLogin}>
            <FormControl>
              <FormLabel
                display='flex'
                ms='4px'
                fontSize='sm'
                fontWeight='500'
                color={textColor}
                mb='8px'>
                Kullanıcı Adı<Text color={brandStars}>*</Text>
              </FormLabel>
              <Input
                isRequired={true}
                variant='auth'
                fontSize='sm'
                ms={{ base: "0px", md: "0px" }}
                type='text'
                placeholder='MotoEtiler'
                mb='24px'
                fontWeight='500'
                size='lg'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <FormLabel
                ms='4px'
                fontSize='sm'
                fontWeight='500'
                color={textColor}
                display='flex'>
                Şifre<Text color={brandStars}>*</Text>
              </FormLabel>
              <InputGroup size='md'>
                <Input
                  isRequired={true}
                  fontSize='sm'
                  placeholder='Şifrenizi girin'
                  mb='24px'
                  size='lg'
                  type={show ? "text" : "password"}
                  variant='auth'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <InputRightElement display='flex' alignItems='center' mt='4px'>
                  <Icon
                    color={textColorSecondary}
                    _hover={{ cursor: "pointer" }}
                    as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                    onClick={handleClick}
                  />
                </InputRightElement>
              </InputGroup>
              <Flex justifyContent='center' align='center' mb='24px'>
                <Text color={textColorSecondary} fontSize='sm'>
                  Sadece yetkili personel giriş yapabilir
                </Text>
              </Flex>
              <Button
                type='submit'
                fontSize='sm'
                variant='brand'
                fontWeight='500'
                w='100%'
                h='50'
                mb='24px'
                isLoading={isLoading}
                loadingText='Giriş yapılıyor...'>
                Giriş Yap
              </Button>
            </FormControl>
          </form>
        </Flex>
      </Flex>
    </DefaultAuth>
  );
}

export default SignIn;
