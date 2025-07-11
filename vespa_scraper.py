#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
from bs4 import BeautifulSoup
import json
import time
import re
import hashlib
import logging
import os
from pathlib import Path
from urllib.parse import urljoin

# Logging ayarları
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class VespaScraper:
    def __init__(self, download_images=False):
        self.base_url = "https://www.motopit.com.tr"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.parts_data = {}
        self.models_data = {}
        self.download_images = download_images
        
        if download_images:
            Path("images").mkdir(exist_ok=True)
    
    def get_page(self, url, max_retries=3):
        """Sayfa içeriğini güvenli şekilde çeker"""
        for attempt in range(max_retries):
            try:
                response = self.session.get(url, timeout=15)
                response.raise_for_status()
                return response
            except Exception as e:
                logger.warning(f"Attempt {attempt + 1} failed for {url}: {e}")
                if attempt < max_retries - 1:
                    time.sleep(2)
                else:
                    logger.error(f"Failed to get {url} after {max_retries} attempts")
                    return None
    
    def parse_price(self, price_text):
        """Fiyat metnini sayısal değere dönüştürür"""
        if not price_text:
            return None
        
        logger.debug(f"Parsing price: '{price_text}'")
        
        # TL kelimesini kaldır
        clean_price = price_text.replace('TL', '').strip()
        
        # Türkçe format: 2.375,50 -> 2375.50
        if ',' in clean_price and '.' in clean_price:
            # Hem binlik hem ondalık var: 2.375,50
            parts = clean_price.split(',')
            if len(parts) == 2:
                integer_part = parts[0].replace('.', '')  # Binlik ayraçları kaldır
                decimal_part = parts[1]
                clean_price = f"{integer_part}.{decimal_part}"
        elif ',' in clean_price:
            # Sadece ondalık: 375,50
            clean_price = clean_price.replace(',', '.')
        elif '.' in clean_price and len(clean_price.split('.')[-1]) > 2:
            # Muhtemelen binlik ayracı: 2.375
            clean_price = clean_price.replace('.', '')
        
        try:
            result = float(clean_price)
            logger.debug(f"Parsed price: {result}")
            return result
        except Exception as e:
            logger.debug(f"Price parsing failed: {e}")
            return None
    
    def get_product_images(self, product_name, soup):
        """Ürün resim linklerini çeker"""
        images = {
            'thumbnail': None,
            'main': None,
            'gallery': []
        }
        
        # BeautifulSoup ile resim linklerini bul
        img_tags = soup.find_all('img')
        
        for img in img_tags:
            src = img.get('src') or img.get('data-src')
            if src:
                # Tam URL yap
                if src.startswith('/'):
                    src = self.base_url + src
                elif not src.startswith('http'):
                    src = self.base_url + '/' + src
                
                # Resim tipini belirle
                if any(keyword in src.lower() for keyword in ['thumb', 'small', 'list']):
                    if not images['thumbnail']:
                        images['thumbnail'] = src
                elif any(keyword in src.lower() for keyword in ['main', 'large', 'detail']):
                    if not images['main']:
                        images['main'] = src
                elif any(keyword in src.lower() for keyword in ['product', 'item', 'vespa']):
                    # Ana resim yoksa ilk uygun resmi ana resim yap
                    if not images['main']:
                        images['main'] = src
                    # Galeri olarak da ekle
                    if src not in images['gallery'] and len(images['gallery']) < 3:
                        images['gallery'].append(src)
        
        return images
    
    def generate_part_id(self, name, price):
        """Ürün için benzersiz ID oluşturur"""
        text = f"{name}_{price}".encode('utf-8')
        return hashlib.md5(text).hexdigest()[:8]
    
    def extract_products_from_text(self, html_content):
        """HTML içeriğinden ürünleri çıkarır"""
        products = []
        
        # HTML'i temizle ve sadece text al
        soup = BeautifulSoup(html_content, 'html.parser')
        text_content = soup.get_text()
        
        logger.debug(f"HTML text çıkarıldı, uzunluk: {len(text_content)}")
        
        # Tüm ürün verisinin bulunduğu uzun satırı bul
        product_data_line = None
        for line in text_content.split('\n'):
            if 'MTP' in line and 'Hızlı İncele' in line and len(line) > 1000:
                product_data_line = line
                logger.debug(f"Ürün verisi bulundu, uzunluk: {len(line)}")
                break
        
        if not product_data_line:
            logger.warning("Ürün verisi içeren uzun satır bulunamadı!")
            return products
        
        # MTP kodları ile ürünleri ayır
        mtp_pattern = r'(MTP\d+)'
        segments = re.split(mtp_pattern, product_data_line)
        
        logger.debug(f"MTP pattern ile {len(segments)} segment bulundu")
        
        i = 1  # İlk segment genellikle header, 1'den başla
        while i < len(segments) - 1:
            mtp_code = segments[i]
            product_segment = segments[i + 1]
            
            if mtp_code.startswith('MTP'):
                logger.debug(f"İşleniyor: {mtp_code} -> {product_segment[:100]}...")
                
                # Bu segment'ten ürün bilgilerini çıkar
                product = self.parse_product_segment(mtp_code, product_segment)
                if product:
                    products.append(product)
                    logger.debug(f"✅ Ürün eklendi: {product['name']} - {product['price']}TL")
            
            i += 2
        
        logger.info(f"Toplam {len(products)} ürün bulundu")
        return products
    
    def parse_product_segment(self, mtp_code, segment):
        """Tek bir ürün segmentini parse eder"""
        try:
            # Fiyat pattern'i: 500,00TL formatında
            price_pattern = r'(\d+[,.]?\d*)\s*TL'
            price_match = re.search(price_pattern, segment)
            
            if not price_match:
                logger.debug(f"Fiyat bulunamadı: {mtp_code}")
                return None
            
            price_text = price_match.group()
            price = self.parse_price(price_text)
            
            if not price or price <= 0:
                logger.debug(f"Geçersiz fiyat: {mtp_code} - {price_text}")
                return None
            
            # Ürün adını bul - MTP kodundan sonra ilk kelime grubu
            # Pattern: MTP0514749Aks Rulmanı .Hızlı İncele
            name_pattern = r'^([^.]+)\.?Hızlı İncele'
            name_match = re.search(name_pattern, segment)
            
            if name_match:
                product_name = name_match.group(1).strip()
            else:
                # Alternatif: ilk noktaya kadar olan kısım
                parts = segment.split('.')[0].strip()
                product_name = parts
            
            # Ürün adını temizle
            product_name = self.clean_product_name(product_name)
            
            if not self.is_valid_product(product_name, price):
                logger.debug(f"Geçersiz ürün: {product_name}")
                return None
            
            part_id = self.generate_part_id(product_name, price)
            
            # Resim linklerini çek (boş olabilir)
            image_urls = {
                'thumbnail': None,
                'main': None,
                'gallery': []
            }
            
            return {
                'id': part_id,
                'name': product_name,
                'price': price,
                'url': self.generate_product_url(product_name),
                'images': image_urls,
                'mtp_code': mtp_code
            }
            
        except Exception as e:
            logger.debug(f"Segment parse hatası {mtp_code}: {e}")
            return None
    
    def clean_product_name(self, name):
        """Ürün adını temizler"""
        if not name:
            return ""
        
        # Baştaki gereksiz karakterleri temizle
        while name and name[0] in '-•*0123456789. ':
            name = name[1:]
        
        return name.strip()
    
    def is_valid_product(self, name, price):
        """Ürünün geçerli olup olmadığını kontrol eder"""
        if not name or len(name) < 3:
            return False
        
        if not price or price <= 0:
            return False
        
        # Çok temel filtre - sadece açık sistem kelimelerini atla
        skip_keywords = [
            'menu', 'kategori', 'arama', 'sepet', 'hesap', 
            'ucretsiz kargo', 'aracinizi secin', 'alisveris',
            'giris', 'uye ol', 'taksit', 'odeme'
        ]
        
        name_lower = name.lower()
        for keyword in skip_keywords:
            if keyword in name_lower:
                logger.debug(f"Filtered out: {name} (contains: {keyword})")
                return False
        
        return True
    
    def generate_product_url(self, name):
        """Ürün adından URL oluşturur"""
        clean_name = re.sub(r'[^a-zA-Z0-9\s]', '', name.lower())
        slug = '-'.join(clean_name.split())
        return f"{self.base_url}/urun/{slug}"
    
    def get_vespa_models(self):
        """Vespa modellerini çeker"""
        logger.info("Vespa modelleri çekiliyor...")
        
        # Test için direkt bilinen modeli kullan
        test_models = [
            {
                'name': 'Vespa Primavera 150 3v',
                'url': 'https://www.motopit.com.tr/kategori/vespa-primavera-150-3v-yedek-parca'
            }
        ]
        
        logger.info(f"Test modu: {len(test_models)} model kullanılacak")
        for model in test_models:
            logger.info(f"  Test Model: {model['name']} -> {model['url']}")
        
        return test_models
    
    def extract_model_name_from_url(self, url):
        """URL'den model adını çıkarır"""
        try:
            # /kategori/vespa-primavera-150-3v-yedek-parca -> Vespa Primavera 150 3v
            parts = url.split('/')[-1]
            parts = parts.replace('-yedek-parca', '')
            parts = parts.replace('vespa-', '')
            
            # Kelimeler arası tire -> boşluk
            model_name = parts.replace('-', ' ').title()
            return f"Vespa {model_name}"
        except:
            return None
    
    def scrape_model_products(self, model_url, model_name):
        """Belirli bir modelin ürünlerini çeker"""
        logger.info(f"Model çekiliyor: {model_name}")
        
        response = self.get_page(model_url)
        if not response:
            return []
        
        products = self.extract_products_from_text(response.content)
        
        # Her ürüne model bilgisini ekle
        for product in products:
            product['model'] = model_name
        
        logger.info(f"{model_name}: {len(products)} ürün bulundu")
        return products
    
    def save_data(self):
        """Verileri JSON dosyalarına kaydeder"""
        # parts.json
        parts_output = {
            'parts': {part['id']: {
                'name': part['name'],
                'category': 'Genel',
                'price': part['price'],
                'url': part['url'],
                'images': part['images']
            } for part in self.parts_data.values()},
            'total_parts': len(self.parts_data),
            'generated_at': time.strftime('%Y-%m-%d %H:%M:%S')
        }
        
        with open('parts.json', 'w', encoding='utf-8') as f:
            json.dump(parts_output, f, ensure_ascii=False, indent=2)
        
        # models.json
        models_output = {
            'models': self.models_data,
            'total_models': len(self.models_data),
            'generated_at': time.strftime('%Y-%m-%d %H:%M:%S')
        }
        
        with open('models.json', 'w', encoding='utf-8') as f:
            json.dump(models_output, f, ensure_ascii=False, indent=2)
        
        logger.info("Veriler kaydedildi: parts.json, models.json")
    
    def run(self):
        """Ana çalıştırma fonksiyonu"""
        try:
            logger.info("Vespa yedek parça scraper başlatılıyor...")
            
            # Modelleri çek
            models = self.get_vespa_models()
            
            if not models:
                logger.error("Hiç model bulunamadı!")
                return
            
            total_parts = 0
            
            # Her model için ürünleri çek
            for model in models:
                model_name = model['name']
                model_url = model['url']
                
                # Model ürünlerini çek
                products = self.scrape_model_products(model_url, model_name)
                
                # Verileri organize et
                model_part_ids = []
                
                for product in products:
                    part_id = product['id']
                    
                    # Parts verisine ekle (eğer yoksa)
                    if part_id not in self.parts_data:
                        self.parts_data[part_id] = product
                        total_parts += 1
                    
                    model_part_ids.append(part_id)
                
                # Model verisini kaydet
                self.models_data[model_name] = {
                    'categories': {
                        'Genel': {
                            'parts': model_part_ids,
                            'url': model_url
                        }
                    },
                    'url': model_url
                }
                
                # Rate limiting
                time.sleep(2)
            
            # Sonuçları kaydet
            self.save_data()
            
            # Özet
            logger.info(f"Tamamlandı! Toplam {total_parts} ürün bulundu")
            
            print(f"\n=== ÖZET ===")
            print(f"İşlenen model sayısı: {len(models)}")
            print(f"Toplam ürün sayısı: {total_parts}")
            
            # Örnek ürünler
            if self.parts_data:
                print(f"\nÖrnek ürünler:")
                for i, (part_id, part) in enumerate(list(self.parts_data.items())[:5]):
                    print(f"  {i+1}. {part['name']} - {part['price']}TL")
            
        except Exception as e:
            logger.error(f"Hata oluştu: {e}")
            raise

def main():
    print("=== Vespa Yedek Parça Scraper ===")
    print("Motopit.com.tr sitesinden Vespa yedek parça verilerini çeker")
    print()
    
    # Debug seviyesi seçimi
    debug_mode = input("Debug modu aktif olsun mu? (y/n): ").lower() in ['y', 'yes', 'evet']
    if debug_mode:
        logging.getLogger().setLevel(logging.DEBUG)
        print("Debug modu aktif - detaylı loglar gösterilecek")
    
    # Resim indirme seçeneği
    download_images = input("Resim indirmek istiyor musunuz? (y/n): ").lower() in ['y', 'yes', 'evet']
    
    if download_images:
        print("Ürün bilgileri ve resimleri indirilecek...")
    else:
        print("Ürün bilgileri ve resim linkleri çekilecek (indirme yok)...")
    
    # Scraper'ı başlat
    scraper = VespaScraper(download_images=download_images)
    scraper.run()

if __name__ == "__main__":
    main()