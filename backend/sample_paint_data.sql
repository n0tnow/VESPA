-- ===============================================
-- PAINT SYSTEM SAMPLE DATA
-- Örnek Vespa boyama şablonları ve parçaları
-- ===============================================

-- Paint Templates (Boyama Şablonları) - Multi-View Templates
INSERT INTO paint_templates (vespa_model_id, template_name, svg_template_path, is_active) VALUES
-- Multi-view default templates for all models
(1, 'Primavera 150 - Ön Görünüm', '/assets/svg/vespa-default-front.svg', 1),
(1, 'Primavera 150 - Sol Görünüm', '/assets/svg/vespa-default-left.svg', 1),
(1, 'Primavera 150 - Sağ Görünüm', '/assets/svg/vespa-default-right.svg', 1),
(1, 'Primavera 150 - Arka Görünüm', '/assets/svg/vespa-default-rear.svg', 1),

-- Other models can use the same default SVGs
(2, 'Primavera 150 3v - Ön Görünüm', '/assets/svg/vespa-default-front.svg', 1),
(2, 'Primavera 150 3v - Sol Görünüm', '/assets/svg/vespa-default-left.svg', 1),
(3, 'GTS 300 - Ön Görünüm', '/assets/svg/vespa-default-front.svg', 1),
(3, 'GTS 300 - Sol Görünüm', '/assets/svg/vespa-default-left.svg', 1),
(4, 'Sprint 150 - Ön Görünüm', '/assets/svg/vespa-default-front.svg', 1),
(4, 'Sprint 150 - Sol Görünüm', '/assets/svg/vespa-default-left.svg', 1);

-- Paint Template Parts (Boyama Parçaları) - Multi-View Support
-- Template ID 1: Primavera 150 - Default Template (4 görünüm)

-- ÖN GÖRÜNÜM (FRONT VIEW) PARÇALARI
INSERT INTO paint_template_parts (paint_template_id, part_name, svg_element_id, coordinates_x, coordinates_y, sort_order) VALUES
-- Ana gövde parçaları - Front view
(1, 'Ön Kalkan', 'front-shield', 250, 130, 1),
(1, 'Sol Yan Panel', 'side-panel-left', 150, 180, 2),
(1, 'Sağ Yan Panel', 'side-panel-right', 350, 180, 3),
(1, 'Ana Gövde', 'main-body', 250, 190, 4),
(1, 'Sele', 'seat', 250, 140, 5),
(1, 'Far', 'headlight', 250, 90, 6),
(1, 'Gidon', 'handlebar', 250, 71, 7),
(1, 'Sol Dikiz Aynası', 'mirror-left', 190, 55, 8),
(1, 'Sağ Dikiz Aynası', 'mirror-right', 310, 55, 9),
(1, 'Motor Kalkanı', 'engine-cover', 250, 250, 10),
(1, 'Ön Çamurluk', 'front-fender', 250, 48, 11),
(1, 'Bagaj Kutusu', 'luggage-box', 335, 232, 12),
(1, 'Ayak Dayama', 'footboard', 250, 288, 13);

-- SOL GÖRÜNÜM (LEFT VIEW) PARÇALARI  
INSERT INTO paint_template_parts (paint_template_id, part_name, svg_element_id, coordinates_x, coordinates_y, sort_order) VALUES
-- Template ID 2 için sol görünüm parçaları
(2, 'Ana Gövde Profili', 'main-body-profile', 275, 160, 1),
(2, 'Sele Profili', 'seat-profile', 280, 115, 2),
(2, 'Ön Kalkan Profili', 'front-shield-profile', 140, 160, 3),
(2, 'Motor Profili', 'engine-profile', 280, 225, 4),
(2, 'Arka Kalkan Profili', 'rear-shield-profile', 400, 180, 5),
(2, 'Egzoz', 'exhaust', 380, 248, 6),
(2, 'Gidon Profili', 'handlebar-profile', 140, 89, 7),
(2, 'Far Profili', 'headlight-profile', 130, 125, 8),
(2, 'Ön Çamurluk Profili', 'front-fender-profile', 130, 73, 9),
(2, 'Arka Çamurluk Profili', 'rear-fender-profile', 390, 283, 10),
(2, 'Bagaj Kutusu Profili', 'luggage-box-profile', 402, 195, 11),
(2, 'Ayak Dayama Profili', 'footboard-profile', 260, 260, 12),
(2, 'Dikiz Aynası', 'mirror-left-profile', 110, 75, 13);

-- SAĞ GÖRÜNÜM (RIGHT VIEW) PARÇALARI
INSERT INTO paint_template_parts (paint_template_id, part_name, svg_element_id, coordinates_x, coordinates_y, sort_order) VALUES
-- Template ID 3 için sağ görünüm parçaları
(3, 'Ana Gövde Profili Sağ', 'main-body-profile-right', 225, 160, 1),
(3, 'Sele Profili Sağ', 'seat-profile-right', 220, 115, 2),
(3, 'Ön Kalkan Profili Sağ', 'front-shield-profile-right', 360, 160, 3),
(3, 'Motor Profili Sağ', 'engine-profile-right', 220, 225, 4),
(3, 'Arka Kalkan Profili Sağ', 'rear-shield-profile-right', 100, 180, 5),
(3, 'Egzoz Sağ', 'exhaust-right', 120, 248, 6),
(3, 'Gidon Profili Sağ', 'handlebar-profile-right', 360, 89, 7),
(3, 'Far Profili Sağ', 'headlight-profile-right', 370, 125, 8),
(3, 'Ön Çamurluk Profili Sağ', 'front-fender-profile-right', 370, 73, 9),
(3, 'Arka Çamurluk Profili Sağ', 'rear-fender-profile-right', 110, 283, 10),
(3, 'Bagaj Kutusu Profili Sağ', 'luggage-box-profile-right', 98, 195, 11),
(3, 'Ayak Dayama Profili Sağ', 'footboard-profile-right', 240, 260, 12),
(3, 'Dikiz Aynası Sağ', 'mirror-right-profile', 390, 75, 13),
(3, 'Start Kilidi', 'kick-starter', 184, 292, 14);

-- ARKA GÖRÜNÜM (REAR VIEW) PARÇALARI
INSERT INTO paint_template_parts (paint_template_id, part_name, svg_element_id, coordinates_x, coordinates_y, sort_order) VALUES
-- Template ID 4 için arka görünüm parçaları  
(4, 'Arka Kalkan Ana', 'rear-shield-main', 250, 150, 1),
(4, 'Sele Arka', 'seat-rear', 250, 105, 2),
(4, 'Bagaj Kutusu Arka', 'luggage-box-rear', 250, 210, 3),
(4, 'Sol Yan Panel Arka', 'side-panel-left-rear', 170, 170, 4),
(4, 'Sağ Yan Panel Arka', 'side-panel-right-rear', 330, 170, 5),
(4, 'Arka Çamurluk Ana', 'rear-fender-main', 250, 300, 6),
(4, 'Sol Stop Lambası', 'rear-light-left', 207, 170, 7),
(4, 'Sağ Stop Lambası', 'rear-light-right', 292, 170, 8),
(4, 'Plaka Yeri', 'license-plate', 250, 237, 9),
(4, 'Sol Egzoz', 'exhaust-left', 180, 250, 10),
(4, 'Sağ Egzoz', 'exhaust-right', 320, 250, 11),
(4, 'Sol Ayak Dayayacağı', 'footrest-left', 150, 224, 12),
(4, 'Sağ Ayak Dayayacağı', 'footrest-right', 350, 224, 13),
(4, 'Sol Reflektör', 'reflector-left', 190, 200, 14),
(4, 'Sağ Reflektör', 'reflector-right', 310, 200, 15),
(4, 'Yedek Lastik', 'spare-tire', 180, 295, 16);

-- Primavera 150 - Yan Görünüm (template_id = 2)
INSERT INTO paint_template_parts (paint_template_id, part_name, svg_element_id, coordinates_x, coordinates_y, sort_order) VALUES
(2, 'Yan Profil Ana Gövde', 'side-main-body', 150, 100, 1),
(2, 'Yan Profil Sele', 'side-seat', 120, 80, 2),
(2, 'Yan Profil Motor', 'side-engine', 180, 120, 3),
(2, 'Yan Profil Tekerlek Ön', 'side-wheel-front', 100, 140, 4),
(2, 'Yan Profil Tekerlek Arka', 'side-wheel-rear', 200, 140, 5),
(2, 'Yan Profil Gidon', 'side-handlebar', 80, 60, 6);

-- GTS 300 - Standart Görünüm (template_id = 4)
INSERT INTO paint_template_parts (paint_template_id, part_name, svg_element_id, coordinates_x, coordinates_y, sort_order) VALUES
(4, 'GTS Ön Kalkan', 'gts-front-shield', 150, 80, 1),
(4, 'GTS Yan Panel Sol', 'gts-side-panel-left', 80, 120, 2),
(4, 'GTS Yan Panel Sağ', 'gts-side-panel-right', 220, 120, 3),
(4, 'GTS Arka Kalkan', 'gts-rear-shield', 150, 180, 4),
(4, 'GTS Motor Kalkanı', 'gts-engine-cover', 150, 150, 5),
(4, 'GTS Bagaj Kutusu', 'gts-luggage-box', 180, 180, 6),
(4, 'GTS Windshield', 'gts-windshield', 150, 30, 7),
(4, 'GTS Yan Reflektör Sol', 'gts-reflector-left', 90, 140, 8),
(4, 'GTS Yan Reflektör Sağ', 'gts-reflector-right', 210, 140, 9);

-- Sprint 150 - Standart Görünüm (template_id = 5)
INSERT INTO paint_template_parts (paint_template_id, part_name, svg_element_id, coordinates_x, coordinates_y, sort_order) VALUES
(5, 'Sprint Ön Kalkan', 'sprint-front-shield', 150, 80, 1),
(5, 'Sprint Yan Panel Sol', 'sprint-side-panel-left', 80, 120, 2),
(5, 'Sprint Yan Panel Sağ', 'sprint-side-panel-right', 220, 120, 3),
(5, 'Sprint Arka Kalkan', 'sprint-rear-shield', 150, 180, 4),
(5, 'Sprint Sele Altı', 'sprint-under-seat', 150, 140, 5),
(5, 'Sprint Motor Kalkanı', 'sprint-engine-cover', 150, 150, 6),
(5, 'Sprint Sport Çizgiler', 'sprint-sport-lines', 150, 110, 7);

-- Örnek boyama işi (test için)
INSERT INTO paint_jobs (service_record_id, paint_template_id, estimated_cost, status, painter_name) VALUES
(1, 1, 1500.00, 'PLANNED', 'Mehmet Usta');

-- Örnek seçili parçalar ve renkleri
INSERT INTO paint_job_parts (paint_job_id, paint_template_part_id, selected_color, color_name, estimated_cost) VALUES
-- Paint job 1 için seçilen parçalar
(1, 1, '#FF0000', 'Ferrari Kırmızısı', 200.00),
(1, 2, '#FF0000', 'Ferrari Kırmızısı', 150.00),
(1, 3, '#FF0000', 'Ferrari Kırmızısı', 150.00),
(1, 4, '#000000', 'Parlak Siyah', 100.00),
(1, 11, '#C0C0C0', 'Mat Gümüş', 80.00),
(1, 16, '#FFFFFF', 'Beyaz', 50.00);

-- ===============================================
-- SAMPLE SVG TEMPLATE CONTENT (Basit örnek)
-- ===============================================

-- NOT: Gerçek SVG dosyaları public/assets/svg/ klasöründe oluşturulmalı
-- Bu SQL'de sadece referans yolları tanımlanıyor

-- Örnek SVG içeriği (basit şekiller):
/*
vespa-primavera-150.svg içeriği:
<svg viewBox="0 0 300 250" xmlns="http://www.w3.org/2000/svg">
  <!-- Ön Kalkan -->
  <rect id="front-shield" x="120" y="70" width="60" height="40" fill="#e0e0e0" stroke="#000" />
  
  <!-- Yan Paneller -->
  <ellipse id="side-panel-left" cx="90" cy="120" rx="30" ry="50" fill="#e0e0e0" stroke="#000" />
  <ellipse id="side-panel-right" cx="210" cy="120" rx="30" ry="50" fill="#e0e0e0" stroke="#000" />
  
  <!-- Arka Kalkan -->
  <rect id="rear-shield" x="130" y="170" width="40" height="30" fill="#e0e0e0" stroke="#000" />
  
  <!-- Motor Kalkanı -->
  <circle id="engine-cover" cx="150" cy="150" r="25" fill="#e0e0e0" stroke="#000" />
  
  <!-- Farlar -->
  <circle id="headlight" cx="150" cy="70" r="15" fill="#ffffcc" stroke="#000" />
  
  <!-- Diğer parçalar... -->
</svg>
*/