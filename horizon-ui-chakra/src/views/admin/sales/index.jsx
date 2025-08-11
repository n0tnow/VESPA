import React, { useEffect, useState } from 'react';
import { 
  Box, Button, Flex, HStack, Input, Select, Table, Tbody, Td, Th, Thead, Tr, Text, VStack, 
  useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, 
  ModalFooter, useDisclosure, Badge, SimpleGrid, Icon, IconButton, useColorModeValue,
  FormControl, FormLabel, NumberInput, NumberInputField, Textarea, Switch, Divider,
  Tabs, TabList, TabPanels, Tab, TabPanel, Stack, Image, Center, Spinner
} from '@chakra-ui/react';
import { 
  MdViewList, MdViewModule, MdAdd, MdSearch, MdFilterList, MdShoppingCart,
  MdAttachMoney, MdEdit, MdDelete, MdVisibility, MdImage
} from 'react-icons/md';
import { useLocation } from 'react-router-dom';
import Card from 'components/card/Card';
import apiService from 'services/apiService';

export default function SalesPage(){
  const toast = useToast();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [parts, setParts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [typeFilter, setTypeFilter] = useState('ACCESSORY');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'card'
  const [loading, setLoading] = useState(false);
  
  // Modals
  const detailModal = useDisclosure();
  const addPartModal = useDisclosure();
  const categoryModal = useDisclosure();
  
  // State
  const [selectedPart, setSelectedPart] = useState(null);
  const [cart, setCart] = useState([]); // {part_id, part_name, unit_price, quantity}
  const [method, setMethod] = useState('CASH');
  const [saving, setSaving] = useState(false);

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    part_name: '',
    part_code: '',
    category_id: '',
    part_type: 'ACCESSORY',
    brand: '',
    model: '',
    color: '',
    size: '',
    purchase_price: '',
    sale_price: '',
    currency_type: 'USD',
    initial_stock: '',
    description: '',
    image_url: '',
    image_file: null
  });

  // Colors
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const brandColor = useColorModeValue('brand.500', 'brand.300');

  const loadParts = async ()=>{
    try {
      setLoading(true);
      const res = await apiService.searchSalesParts(search, typeFilter);
      setParts(res.parts || []);
    } catch(e){
      toast({ title: 'Hata', description: e.message, status: 'error'});
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async (partType = null) => {
    try {
      const url = partType ? `/inventory/categories/?type=${partType}` : '/inventory/categories/';
      const res = await apiService.makeRequest(url);
      setCategories(res.categories || []);
    } catch(e) {
      console.error('Kategori yükleme hatası:', e);
    }
  };

  useEffect(()=>{ loadParts(); }, [typeFilter, search]);
  useEffect(()=>{ loadCategories(); }, []);

  // Check if a product should be added to cart from stock page
  useEffect(() => {
    if (location.state?.addToCart) {
      const productToAdd = location.state.addToCart;
      addToCart({
        id: productToAdd.id,
        part_name: productToAdd.part_name,
        sale_price: productToAdd.price || 0
      });
      
      toast({
        title: 'Ürün Sepete Eklendi',
        description: `${productToAdd.part_name} sepetinize eklendi`,
        status: 'success',
        duration: 3000
      });

      // Clear the state to prevent re-adding
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const addToCart = (p)=>{
    setCart(prev=>{
      const exists = prev.find(i=>i.part_id===p.id);
      if(exists){ return prev.map(i=> i.part_id===p.id ? {...i, quantity: i.quantity + 1} : i); }
      return [...prev, { part_id: p.id, part_name: p.part_name, unit_price: p.price || 0, quantity: 1 }];
    });
  };

  const total = cart.reduce((s,i)=> s + i.unit_price * i.quantity, 0);

  const checkout = async ()=>{
    try {
      setSaving(true);
      const payload = { items: cart.map(i=>({ part_id: i.part_id, quantity: i.quantity, unit_price: i.unit_price })), payment_method: method };
      const res = await apiService.createSale(payload);
      toast({ title: 'Satış tamamlandı', description: `Fatura #${res?.invoice_id||''}`, status: 'success' });
      setCart([]);
    } catch(e){
      toast({ title: 'Hata', description: e.message, status: 'error' });
    } finally { setSaving(false); }
  };

  const handleAddProduct = async () => {
    try {
      if (!newProduct.part_name || !newProduct.part_code || !newProduct.category_id) {
        toast({ title: 'Hata', description: 'Ürün adı, kodu ve kategorisi gereklidir', status: 'error' });
        return;
      }

      setSaving(true);
      
      // FormData oluştur (görsel yükleme için)
      const formData = new FormData();
      formData.append('part_name', newProduct.part_name);
      formData.append('part_code', newProduct.part_code);
      formData.append('category_id', newProduct.category_id);
      formData.append('part_type', newProduct.part_type);
      if (newProduct.brand) formData.append('brand', newProduct.brand);
      if (newProduct.model) formData.append('model', newProduct.model);
      if (newProduct.color) formData.append('color', newProduct.color);
      if (newProduct.size) formData.append('size', newProduct.size);
      if (newProduct.description) formData.append('description', newProduct.description);
      formData.append('min_stock_level', '5');
      formData.append('max_stock_level', '100');
      
      // Fiyat bilgilerini ekle (güncel kur ile kaydedilecek)
      if (newProduct.purchase_price) formData.append('purchase_price', newProduct.purchase_price);
      if (newProduct.sale_price) formData.append('sale_price', newProduct.sale_price);
      formData.append('currency_type', newProduct.currency_type);
      
      // Görsel dosyası varsa ekle
      if (newProduct.image_file) {
        formData.append('image', newProduct.image_file);
      }

      // API çağrısı yap
      const response = await fetch('http://localhost:8000/api/inventory/parts/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Ürün ekleme başarısız');
      }

      const result = await response.json();

      // Fiyat bilgileri backend'de otomatik olarak eklendi
      console.log('Product created with price info:', result);

      toast({ 
        title: 'Başarılı', 
        description: `${newProduct.part_name} başarıyla eklendi`, 
        status: 'success' 
      });

      // Formu temizle
      setNewProduct({
        part_name: '',
        part_code: '',
        category_id: '',
        part_type: 'ACCESSORY',
        brand: '',
        model: '',
        color: '',
        size: '',
        purchase_price: '',
        sale_price: '',
        currency_type: 'USD',
        initial_stock: '',
        description: '',
        image_url: '',
        image_file: null
      });

      addPartModal.onClose();
      loadParts(); // Listeyi yenile

    } catch(e) {
      toast({ title: 'Hata', description: e.message, status: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }} bg={bgColor} minH="100vh">
      {/* Header Section */}
      <Card mb={6}>
        <Flex justify="space-between" align="center" mb={4}>
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="bold">Satış Yönetimi</Text>
            <Text color={textColor}>Ürünleri görüntüleyin, sepete ekleyin ve satış işlemlerinizi yönetin</Text>
          </VStack>
          <HStack>
            <Button leftIcon={<Icon as={MdAdd} />} colorScheme="brand" onClick={() => {
              // Modal açılırken varsayılan tip için kategorileri yükle
              loadCategories(newProduct.part_type);
              addPartModal.onOpen();
            }}>
              Yeni Ürün Ekle
            </Button>
            <Button leftIcon={<Icon as={MdEdit} />} variant="outline" onClick={categoryModal.onOpen}>
              Kategoriler
            </Button>
          </HStack>
        </Flex>

        {/* Search and Filters */}
        <Flex gap={4} mb={4} align='center' wrap='wrap'>
          <HStack flex={1} maxW="400px">
            <Icon as={MdSearch} color={textColor} />
            <Input 
              placeholder='Ürün adı, kod veya kategori ara...' 
              value={search} 
              onChange={(e)=>setSearch(e.target.value)}
              bg={cardBg}
              border="1px"
              borderColor={borderColor}
            />
          </HStack>
          
          <Select value={typeFilter} onChange={(e)=>setTypeFilter(e.target.value)} w='200px' bg={cardBg}>
            <option value='ALL'>Tüm Ürünler</option>
            <option value='ACCESSORY'>Yan Ekipmanlar</option>
            <option value='PART'>Yedek Parçalar</option>
          </Select>

          {/* View Toggle */}
          <HStack spacing={1} bg={cardBg} borderRadius="md" p={1} border="1px" borderColor={borderColor}>
            <IconButton
              size="sm"
              icon={<Icon as={MdViewList} />}
              variant={viewMode === 'list' ? 'solid' : 'ghost'}
              colorScheme={viewMode === 'list' ? 'brand' : 'gray'}
              onClick={() => setViewMode('list')}
              aria-label="Liste görünümü"
            />
            <IconButton
              size="sm"
              icon={<Icon as={MdViewModule} />}
              variant={viewMode === 'card' ? 'solid' : 'ghost'}
              colorScheme={viewMode === 'card' ? 'brand' : 'gray'}
              onClick={() => setViewMode('card')}
              aria-label="Kart görünümü"
            />
          </HStack>

          <Button 
            leftIcon={<Icon as={MdFilterList} />} 
            variant="outline" 
            onClick={loadParts}
            isLoading={loading}
          >
            Yenile
          </Button>
        </Flex>

        {/* Quick Filters */}
        <HStack spacing={2} mb={4}>
          <Text fontSize='sm' color={textColor}>Hızlı Filtreler:</Text>
          <Button size='sm' variant='outline' onClick={()=>{setTypeFilter('ACCESSORY'); setSearch('kask');}}>Kask</Button>
          <Button size='sm' variant='outline' onClick={()=>{setTypeFilter('ACCESSORY'); setSearch('eldiven');}}>Eldiven</Button>
          <Button size='sm' variant='outline' onClick={()=>{setTypeFilter('ACCESSORY'); setSearch('ceket');}}>Ceket</Button>
          <Button size='sm' variant='outline' onClick={()=>{setTypeFilter('ACCESSORY'); setSearch('cam');}}>Cam</Button>
          <Button size='sm' variant='ghost' onClick={()=>{
            const rows = (parts||[]).map(p=>({ 
              Kod:p.part_code, Ad:p.part_name, Kategori:p.category_name, Stok:p.stock, 
              'Alış (USD)': p.purchase_price_usd, 'Alış (TRY)': p.purchase_price_try_at_purchase, 'Satış': p.sale_price 
            }));
            const header = Object.keys(rows[0]||{});
              const csv = [header.join(','), ...rows.map(r=> header.map(h=>`"${String(r[h]??'').replace(/"/g,'""')}"`).join(','))].join('\n');
              const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob); const a = document.createElement('a');
              a.href = url; a.download = 'satislar_listesi.csv'; a.click(); URL.revokeObjectURL(url);
          }}>CSV İndir</Button>
          </HStack>
      </Card>

      {/* Products Display */}
      <Card>
        {loading ? (
          <Center py={10}>
            <VStack>
              <Spinner size="xl" color={brandColor} />
              <Text color={textColor}>Ürünler yükleniyor...</Text>
            </VStack>
          </Center>
        ) : (
          <>
            {/* Results Summary */}
            <Flex justify="space-between" align="center" mb={4}>
              <Text color={textColor}>
                {parts.length} ürün bulundu
                {search && ` • "${search}" için sonuçlar`}
              </Text>
              <Text fontSize="sm" color={textColor}>
                Görünüm: {viewMode === 'list' ? 'Liste' : 'Kart'}
              </Text>
        </Flex>

            {viewMode === 'list' ? (
              // Professional List View
              <Table variant='simple' size="md">
                <Thead bg={bgColor}>
                  <Tr>
                    <Th>Ürün</Th>
                    <Th>Kategori</Th>
              <Th>Stok</Th>
                    <Th>Alış (USD)</Th>
                    <Th>Alış (TRY)</Th>
                    <Th>Satış (TRY)</Th>
                    <Th>İşlemler</Th>
            </Tr>
          </Thead>
          <Tbody>
            {(parts||[]).map(p=> (
                    <Tr key={p.id} _hover={{ bg: bgColor }}>
                      <Td>
                        <HStack>
                          <Box w="50px" h="50px" bg={bgColor} borderRadius="md" overflow="hidden" flexShrink={0}>
                            {p.image_path ? (
                              <Image src={p.image_path} alt={p.part_name} w="100%" h="100%" objectFit="cover" />
                            ) : (
                              <Center h="100%">
                                <Icon as={MdImage} color={textColor} />
                              </Center>
                            )}
                          </Box>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="semibold" noOfLines={1}>{p.part_name}</Text>
                            <Text fontSize="sm" color={textColor} noOfLines={1}>
                              {p.part_code}
                              {p.part_type === 'ACCESSORY' && <Badge ml={2} colorScheme='purple' size="sm">Aksesuar</Badge>}
                            </Text>
                          </VStack>
                        </HStack>
                      </Td>
                      <Td>
                        <Text color={textColor}>{p.category_name}</Text>
                      </Td>
                      <Td>
                        <Badge colorScheme={p.stock > 10 ? 'green' : p.stock > 0 ? 'yellow' : 'red'}>
                          {p.stock} adet
                        </Badge>
                      </Td>
                      <Td>
                        <Text fontWeight="semibold" color="blue.500">
                          ${(p.purchase_price_usd||0).toLocaleString()}
                        </Text>
                      </Td>
                      <Td>
                        <Text color={textColor}>
                          ₺{(p.purchase_price_try_at_purchase||0).toLocaleString()}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontWeight="bold" color="green.500">
                          ₺{(p.sale_price||0).toLocaleString()}
                        </Text>
                      </Td>
                      <Td>
                        <HStack>
                          <IconButton
                            size="sm"
                            icon={<Icon as={MdVisibility} />}
                            variant="ghost"
                            onClick={()=>{ setSelectedPart(p); detailModal.onOpen(); }}
                            aria-label="Detayları görüntüle"
                          />
                          <Button 
                            size='sm' 
                            leftIcon={<Icon as={MdShoppingCart} />}
                            colorScheme="brand"
                            onClick={()=>addToCart({ ...p, price: p.sale_price })}
                            isDisabled={p.stock <= 0}
                          >
                            Sepete Ekle
                          </Button>
                        </HStack>
                </Td>
              </Tr>
            ))}
                  {parts.length === 0 && (
                    <Tr>
                      <Td colSpan={7}>
                        <Center py={8}>
                          <VStack>
                            <Icon as={MdSearch} size="40px" color={textColor} />
                            <Text color={textColor}>Aradığınız kriterlerde ürün bulunamadı</Text>
                            <Text fontSize="sm" color={textColor}>Farklı arama terimleri veya filtreler deneyin</Text>
                          </VStack>
                        </Center>
                      </Td>
                    </Tr>
                  )}
          </Tbody>
        </Table>
            ) : (
              // Professional Card View
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }} gap={6}>
          {(parts||[]).map(p=> (
                  <Box 
                    key={`card-${p.id}`} 
                    bg={cardBg}
                    borderWidth='1px' 
                    borderColor={borderColor}
                    borderRadius='xl' 
                    overflow="hidden"
                    transition="all 0.2s"
                    _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                  >
                    {/* Product Image */}
                    <Box h='200px' bg={bgColor} position="relative">
                {p.image_path ? (
                        <Image src={p.image_path} alt={p.part_name} w="100%" h="100%" objectFit="cover" />
                      ) : (
                        <Center h="100%">
                          <VStack>
                            <Icon as={MdImage} size="40px" color={textColor} />
                            <Text fontSize='xs' color={textColor}>Görsel yok</Text>
                          </VStack>
                        </Center>
                      )}
                      
                      {/* Stock Badge */}
                      <Badge 
                        position="absolute" 
                        top={2} 
                        right={2}
                        colorScheme={p.stock > 10 ? 'green' : p.stock > 0 ? 'yellow' : 'red'}
                      >
                        {p.stock} stok
                      </Badge>
                      
                      {/* Type Badge */}
                      {p.part_type === 'ACCESSORY' && (
                        <Badge position="absolute" top={2} left={2} colorScheme='purple'>
                          Aksesuar
                        </Badge>
                )}
              </Box>

                    {/* Product Info */}
                    <VStack p={4} align="stretch" spacing={3}>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight='bold' fontSize="md" noOfLines={2} lineHeight="1.2">
                          {p.part_name}
                        </Text>
                        <Text fontSize='xs' color={textColor} noOfLines={1}>
                          {p.part_code} • {p.category_name}
                        </Text>
                      </VStack>

                      {/* Pricing */}
                      <VStack align="stretch" spacing={2}>
                        <HStack justify="space-between">
                          <Text fontSize="xs" color={textColor}>Alış (USD):</Text>
                          <Text fontSize="sm" fontWeight="semibold" color="blue.500">
                            ${(p.purchase_price_usd||0).toLocaleString()}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="xs" color={textColor}>Alış (TRY):</Text>
                          <Text fontSize="sm" color={textColor}>
                            ₺{(p.purchase_price_try_at_purchase||0).toLocaleString()}
                          </Text>
              </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" fontWeight="bold">Satış:</Text>
                          <Text fontSize="lg" fontWeight="bold" color="green.500">
                            ₺{(p.sale_price||0).toLocaleString()}
                          </Text>
              </HStack>
                      </VStack>

                      {/* Actions */}
                      <VStack spacing={2}>
                        <Button 
                          w="100%"
                          leftIcon={<Icon as={MdShoppingCart} />}
                          colorScheme="brand"
                          onClick={()=>addToCart({ ...p, price: p.sale_price })}
                          isDisabled={p.stock <= 0}
                        >
                          Sepete Ekle
                        </Button>
                        <Button 
                          w="100%"
                          size='sm' 
                          variant='outline' 
                          leftIcon={<Icon as={MdVisibility} />}
                          onClick={()=>{ setSelectedPart(p); detailModal.onOpen(); }}
                        >
                          Detayları Görüntüle
                        </Button>
                      </VStack>
                    </VStack>
            </Box>
          ))}
        </SimpleGrid>
            )}
          </>
        )}
      </Card>

      {/* Shopping Cart */}
      {cart.length > 0 && (
        <Card mt={6}>
          <HStack justify="space-between" mb={4}>
            <HStack>
              <Icon as={MdShoppingCart} color={brandColor} />
              <Text fontWeight='bold' fontSize="lg">Sepet ({cart.length} ürün)</Text>
            </HStack>
            <Button 
              size="sm" 
              variant="ghost" 
              colorScheme="red" 
              onClick={() => setCart([])}
            >
              Sepeti Temizle
            </Button>
          </HStack>
          
          <VStack spacing={3}>
            {cart.map((i,idx)=> (
              <Box key={`${i.part_id}-${idx}`} p={4} bg={bgColor} borderRadius="md" w="100%">
                <Flex justify="space-between" align="center">
                  <VStack align="start" flex={1}>
                    <Text fontWeight="semibold">{i.part_name}</Text>
                    <Text fontSize="sm" color={textColor}>Birim fiyat: ₺{i.unit_price.toLocaleString()}</Text>
                  </VStack>
                  
                  <HStack spacing={4}>
                  <HStack>
                      <Button 
                        size='sm' 
                        variant="outline"
                        onClick={()=> setCart(prev=> prev.map(x=> x.part_id===i.part_id ? {...x, quantity: Math.max(1, x.quantity-1)} : x))}
                      >
                        -
                      </Button>
                      <Text fontWeight="bold" minW="40px" textAlign="center">{i.quantity}</Text>
                      <Button 
                        size='sm' 
                        variant="outline"
                        onClick={()=> setCart(prev=> prev.map(x=> x.part_id===i.part_id ? {...x, quantity: x.quantity+1} : x))}
                      >
                        +
                      </Button>
                    </HStack>
                    
                    <Text fontWeight="bold" minW="100px" textAlign="right">
                      ₺{(i.unit_price * i.quantity).toLocaleString()}
                    </Text>
                    
                    <IconButton
                      size='sm' 
                      icon={<Icon as={MdDelete} />}
                      variant='ghost' 
                      colorScheme='red' 
                      onClick={()=> setCart(prev=> prev.filter((x,xi)=> !(x.part_id===i.part_id && xi===idx)))}
                      aria-label="Ürünü sil"
                    />
                  </HStack>
                </Flex>
              </Box>
            ))}
          </VStack>

          <Divider my={4} />
          
          <Flex justify='space-between' align='center'>
            <HStack spacing={4}>
              <Text fontWeight="semibold">Ödeme Yöntemi:</Text>
              <Select size='sm' value={method} onChange={(e)=>setMethod(e.target.value)} w='160px' bg={cardBg}>
                <option value='CASH'>💵 Nakit</option>
                <option value='CARD'>💳 Kart</option>
                <option value='TRANSFER'>🏦 Transfer</option>
            </Select>
          </HStack>
            <HStack spacing={4}>
              <VStack align="end" spacing={0}>
                <Text fontSize="lg" fontWeight='bold'>
                  Toplam: ₺{total.toLocaleString()}
                </Text>
                <Text fontSize="sm" color={textColor}>
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} ürün
                </Text>
              </VStack>
              <Button 
                colorScheme='brand' 
                size="lg"
                isLoading={saving} 
                onClick={checkout} 
                leftIcon={<Icon as={MdShoppingCart} />}
              >
                Satışı Tamamla
              </Button>
          </HStack>
        </Flex>
      </Card>
      )}

      {/* Product Detail Modal */}
      <Modal isOpen={detailModal.isOpen} onClose={detailModal.onClose} size='lg'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Icon as={MdVisibility} color={brandColor} />
              <Text>Ürün Detayları</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedPart && (
              <VStack align='stretch' spacing={4}>
                {/* Product Image */}
                <Center>
                  <Box w="200px" h="200px" bg={bgColor} borderRadius="lg" overflow="hidden">
                    {selectedPart.image_path ? (
                      <Image src={selectedPart.image_path} alt={selectedPart.part_name} w="100%" h="100%" objectFit="cover" />
                    ) : (
                      <Center h="100%">
                        <VStack>
                          <Icon as={MdImage} size="40px" color={textColor} />
                          <Text fontSize='sm' color={textColor}>Görsel yok</Text>
                        </VStack>
                      </Center>
                    )}
                  </Box>
                </Center>

                {/* Basic Info */}
                <VStack align='stretch' spacing={3}>
                  <Box>
                    <Text fontSize="lg" fontWeight='bold'>{selectedPart.part_name}</Text>
                    <Text color={textColor}>{selectedPart.part_code}</Text>
                    {selectedPart.part_type === 'ACCESSORY' && (
                      <Badge mt={1} colorScheme='purple'>Aksesuar</Badge>
                    )}
                  </Box>

                  <Divider />

                  {/* Details Grid */}
                  <SimpleGrid columns={2} spacing={3}>
                    <Box>
                      <Text fontSize="sm" color={textColor} mb={1}>Kategori</Text>
                      <Text fontWeight="semibold">{selectedPart.category_name}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color={textColor} mb={1}>Stok Durumu</Text>
                      <Badge colorScheme={selectedPart.stock > 10 ? 'green' : selectedPart.stock > 0 ? 'yellow' : 'red'}>
                        {selectedPart.stock} adet
                      </Badge>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color={textColor} mb={1}>Marka</Text>
                      <Text fontWeight="semibold">{selectedPart.brand || '-'}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color={textColor} mb={1}>Model</Text>
                      <Text fontWeight="semibold">{selectedPart.model || '-'}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color={textColor} mb={1}>Renk</Text>
                      <Text fontWeight="semibold">{selectedPart.color || '-'}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color={textColor} mb={1}>Beden</Text>
                      <Text fontWeight="semibold">{selectedPart.size || '-'}</Text>
                    </Box>
                  </SimpleGrid>

                  <Divider />

                  {/* Pricing Information */}
                  <VStack align="stretch" spacing={3}>
                    <Text fontSize="md" fontWeight="bold">Fiyat Bilgileri</Text>
                    
                    <Box p={3} bg={bgColor} borderRadius="md">
                      <HStack justify='space-between' mb={2}>
                        <Text fontSize="sm" color={textColor}>Alış Fiyatı (USD)</Text>
                        <Text fontWeight="semibold" color="blue.500">
                          ${(selectedPart.purchase_price_usd||0).toLocaleString()}
                        </Text>
                      </HStack>
                      <HStack justify='space-between' mb={2}>
                        <Text fontSize="sm" color={textColor}>Alış Fiyatı (Alış Günü TRY)</Text>
                        <Text fontWeight="semibold">
                          ₺{(selectedPart.purchase_price_try_at_purchase||0).toLocaleString()}
                        </Text>
                      </HStack>
                      <HStack justify='space-between'>
                        <Text fontSize="sm" color={textColor}>Satış Fiyatı (TRY)</Text>
                        <Text fontSize="lg" fontWeight="bold" color="green.500">
                          ₺{(selectedPart.sale_price||0).toLocaleString()}
                        </Text>
                      </HStack>
                    </Box>

                    {selectedPart.purchase_effective_date && (
                      <Text fontSize="xs" color={textColor}>
                        * Alış tarihi: {new Date(selectedPart.purchase_effective_date).toLocaleDateString('tr-TR')}
                      </Text>
                    )}
                  </VStack>
                </VStack>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <HStack>
              <Button variant="ghost" onClick={detailModal.onClose}>
                Kapat
              </Button>
              <Button 
                colorScheme="brand"
                leftIcon={<Icon as={MdShoppingCart} />}
                onClick={()=>{ 
                  if(selectedPart){ 
                    addToCart({ ...selectedPart, price: selectedPart.sale_price }); 
                    detailModal.onClose(); 
                    toast({ 
                      title: 'Sepete eklendi', 
                      description: `${selectedPart.part_name} sepete eklendi`, 
                      status: 'success',
                      duration: 2000 
                    });
                  } 
                }}
                isDisabled={selectedPart?.stock <= 0}
              >
                Sepete Ekle
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add New Product Modal */}
      <Modal isOpen={addPartModal.isOpen} onClose={addPartModal.onClose} size='xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Icon as={MdAdd} color={brandColor} />
              <Text>Yeni Ürün Ekle</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Text color={textColor} fontSize="sm">
                Sisteme yeni bir ürün veya parça ekleyin. Tüm alanları dikkatli bir şekilde doldurun.
              </Text>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Ürün Adı</FormLabel>
                  <Input 
                    placeholder="Örn: Vespa Kaskı" 
                    bg={cardBg}
                    value={newProduct.part_name}
                    onChange={(e) => setNewProduct(prev => ({...prev, part_name: e.target.value}))}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Ürün Kodu</FormLabel>
                  <Input 
                    placeholder="Örn: VK-001" 
                    bg={cardBg}
                    value={newProduct.part_code}
                    onChange={(e) => setNewProduct(prev => ({...prev, part_code: e.target.value}))}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>
                    <HStack>
                      <Text>Ürün Tipi</Text>
                      <Badge colorScheme="blue" size="sm">Önce seçin</Badge>
                    </HStack>
                  </FormLabel>
                  <Select 
                    bg={cardBg}
                    value={newProduct.part_type}
                    onChange={(e) => {
                      const selectedType = e.target.value;
                      setNewProduct(prev => ({
                        ...prev, 
                        part_type: selectedType,
                        category_id: '' // Kategori seçimini temizle
                      }));
                      // Seçilen tipe göre kategorileri yükle
                      loadCategories(selectedType);
                    }}
                  >
                    <option value="ACCESSORY">Aksesuar</option>
                    <option value="PART">Yedek Parça</option>
                  </Select>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>
                    <HStack>
                      <Text>Kategori</Text>
                      {!newProduct.part_type && (
                        <Badge colorScheme="orange" size="sm">Tip seçin</Badge>
                      )}
                    </HStack>
                  </FormLabel>
                  <Select 
                    placeholder={
                      !newProduct.part_type 
                        ? "Önce ürün tipi seçin" 
                        : categories.length === 0 
                        ? "Kategoriler yükleniyor..." 
                        : "Kategori seçin"
                    }
                    bg={cardBg}
                    value={newProduct.category_id}
                    onChange={(e) => setNewProduct(prev => ({...prev, category_id: e.target.value}))}
                    isDisabled={!newProduct.part_type || categories.length === 0}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                    ))}
                  </Select>
                  {newProduct.part_type && categories.length > 0 && (
                    <Text fontSize="xs" color="green.500" mt={1}>
                      ✅ {newProduct.part_type === 'ACCESSORY' ? 'Aksesuar' : 'Yedek Parça'} kategorileri gösteriliyor
                    </Text>
                  )}
                </FormControl>
                
                <FormControl>
                  <FormLabel>Marka</FormLabel>
                  <Input 
                    placeholder="Örn: Vespa" 
                    bg={cardBg}
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct(prev => ({...prev, brand: e.target.value}))}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Model</FormLabel>
                  <Input 
                    placeholder="Örn: Primavera" 
                    bg={cardBg}
                    value={newProduct.model}
                    onChange={(e) => setNewProduct(prev => ({...prev, model: e.target.value}))}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Renk</FormLabel>
                  <Input 
                    placeholder="Örn: Kırmızı" 
                    bg={cardBg}
                    value={newProduct.color}
                    onChange={(e) => setNewProduct(prev => ({...prev, color: e.target.value}))}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Beden</FormLabel>
                  <Input 
                    placeholder="Örn: L" 
                    bg={cardBg}
                    value={newProduct.size}
                    onChange={(e) => setNewProduct(prev => ({...prev, size: e.target.value}))}
                  />
                </FormControl>
              </SimpleGrid>

              <Divider />

              <Text fontSize="md" fontWeight="semibold">Fiyat Bilgileri</Text>
              
              <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Para Birimi</FormLabel>
                  <Select 
                    bg={cardBg}
                    value={newProduct.currency_type}
                    onChange={(e) => setNewProduct(prev => ({...prev, currency_type: e.target.value}))}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="TRY">TRY (₺)</option>
                  </Select>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Alış Fiyatı ({newProduct.currency_type})</FormLabel>
                  <NumberInput min={0} bg={cardBg}>
                    <NumberInputField 
                      placeholder="0.00"
                      value={newProduct.purchase_price}
                      onChange={(e) => setNewProduct(prev => ({...prev, purchase_price: e.target.value}))}
                    />
                  </NumberInput>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Satış Fiyatı ({newProduct.currency_type})</FormLabel>
                  <NumberInput min={0} bg={cardBg}>
                    <NumberInputField 
                      placeholder="0.00"
                      value={newProduct.sale_price}
                      onChange={(e) => setNewProduct(prev => ({...prev, sale_price: e.target.value}))}
                    />
                  </NumberInput>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Başlangıç Stok</FormLabel>
                  <NumberInput min={0} bg={cardBg}>
                    <NumberInputField 
                      placeholder="0"
                      value={newProduct.initial_stock}
                      onChange={(e) => setNewProduct(prev => ({...prev, initial_stock: e.target.value}))}
                    />
                  </NumberInput>
                </FormControl>
              </SimpleGrid>
              
              <Text fontSize="sm" color={textColor} fontStyle="italic">
                * Güncel döviz kurları otomatik olarak alınacak ve database'e kaydedilecektir
              </Text>

              <FormControl>
                <FormLabel>Açıklama</FormLabel>
                <Textarea 
                  placeholder="Ürün hakkında detaylı bilgi..." 
                  bg={cardBg}
                  rows={3}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({...prev, description: e.target.value}))}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Ürün Görseli</FormLabel>
                <VStack align="stretch" spacing={3}>
                  <Input 
                    type="file"
                    accept="image/*"
                    bg={cardBg}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setNewProduct(prev => ({...prev, image_file: file}));
                      }
                    }}
                  />
                  {newProduct.image_file && (
                    <Box p={3} bg={bgColor} borderRadius="md">
                      <Text fontSize="sm" color={textColor}>
                        📎 Seçili dosya: {newProduct.image_file.name}
                      </Text>
                    </Box>
                  )}
                  <Text fontSize="xs" color={textColor}>
                    * JPG, PNG veya GIF formatında görsel yükleyebilirsiniz
                  </Text>
                </VStack>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack>
              <Button variant="ghost" onClick={addPartModal.onClose}>
                İptal
              </Button>
              <Button 
                colorScheme="brand"
                leftIcon={<Icon as={MdAdd} />}
                onClick={handleAddProduct}
                isLoading={saving}
                loadingText="Ekleniyor..."
              >
                Ürünü Ekle
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Category Management Modal */}
      <Modal isOpen={categoryModal.isOpen} onClose={categoryModal.onClose} size='lg'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Icon as={MdEdit} color={brandColor} />
              <Text>Kategori Yönetimi</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Text color={textColor} fontSize="sm">
                Ürün kategorilerini görüntüleyin, düzenleyin ve yeni kategori ekleyin.
              </Text>
              
              {/* Add New Category */}
              <Box p={4} bg={bgColor} borderRadius="md">
                <Text fontWeight="semibold" mb={3}>Yeni Kategori Ekle</Text>
                <HStack>
                  <Input 
                    placeholder="Kategori adı..." 
                    bg={cardBg}
                  />
                  <Button colorScheme="brand" size="sm">
                    Ekle
                  </Button>
                </HStack>
              </Box>

              {/* Categories List */}
              <VStack align="stretch" spacing={2}>
                <Text fontWeight="semibold">Mevcut Kategoriler ({categories.length})</Text>
                <Box maxH="300px" overflowY="auto">
                  {categories.map(category => (
                    <Flex 
                      key={category.id} 
                      justify="space-between" 
                      align="center" 
                      p={3} 
                      bg={cardBg} 
                      borderRadius="md" 
                      borderWidth="1px"
                      borderColor={borderColor}
                    >
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="semibold">{category.category_name}</Text>
                        <Text fontSize="sm" color={textColor}>ID: {category.id}</Text>
                      </VStack>
                      <HStack>
                        <IconButton
                          size="sm"
                          icon={<Icon as={MdEdit} />}
                          variant="ghost"
                          aria-label="Kategoriyi düzenle"
                          onClick={() => {
                            toast({
                              title: 'Geliştirme aşamasında',
                              description: 'Kategori düzenleme özelliği yakında eklenecek',
                              status: 'info'
                            });
                          }}
                        />
                        <IconButton
                          size="sm"
                          icon={<Icon as={MdDelete} />}
                          variant="ghost"
                          colorScheme="red"
                          aria-label="Kategoriyi sil"
                          onClick={() => {
                            toast({
                              title: 'Geliştirme aşamasında',
                              description: 'Kategori silme özelliği yakında eklenecek',
                              status: 'info'
                            });
                          }}
                        />
                      </HStack>
                    </Flex>
                  ))}
                  {categories.length === 0 && (
                    <Center py={8}>
                      <VStack>
                        <Text color={textColor}>Henüz kategori bulunmuyor</Text>
                        <Text fontSize="sm" color={textColor}>Yukarıdaki formdan yeni kategori ekleyebilirsiniz</Text>
                      </VStack>
                    </Center>
                  )}
                </Box>
              </VStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={categoryModal.onClose}>
              Kapat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}


