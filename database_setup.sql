-- =============================================
-- MotoEtiler Vespa Bayisi Database Setup
-- 3NF (Third Normal Form) uyumlu tablo yapısı
-- =============================================

-- Database oluştur
USE master;
GO

-- Eğer database varsa sil
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'MotoEtilerDB')
BEGIN
    ALTER DATABASE MotoEtilerDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE MotoEtilerDB;
END
GO

-- Yeni database oluştur
CREATE DATABASE MotoEtilerDB;
GO

-- Database'i kullan
USE MotoEtilerDB;
GO

-- =============================================
-- 1. Kullanıcılar Tablosu (Django auth_user ile uyumlu)
-- =============================================
CREATE TABLE auth_user (
    id INT IDENTITY(1,1) PRIMARY KEY,
    password NVARCHAR(128) NOT NULL,
    last_login DATETIME2 NULL,
    is_superuser BIT NOT NULL DEFAULT 0,
    username NVARCHAR(150) UNIQUE NOT NULL,
    first_name NVARCHAR(150) NOT NULL,
    last_name NVARCHAR(150) NOT NULL,
    email NVARCHAR(254) NOT NULL,
    is_staff BIT NOT NULL DEFAULT 0,
    is_active BIT NOT NULL DEFAULT 1,
    date_joined DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- =============================================
-- 2. Kullanıcı Profilleri Tablosu
-- =============================================
CREATE TABLE api_userprofile (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    phone NVARCHAR(20) NULL,
    department NVARCHAR(100) NULL,
    is_technician BIT NOT NULL DEFAULT 0,
    can_manage_stock BIT NOT NULL DEFAULT 0,
    can_manage_customers BIT NOT NULL DEFAULT 0,
    can_manage_services BIT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES auth_user(id) ON DELETE CASCADE
);

-- =============================================
-- 3. Vespa Modelleri Tablosu
-- =============================================
CREATE TABLE api_vespamodel (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NTEXT NULL,
    year INT NOT NULL,
    engine_size NVARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image_url NVARCHAR(500) NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- =============================================
-- 4. Parça Kategorileri Tablosu
-- =============================================
CREATE TABLE api_partcategory (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NTEXT NULL,
    is_active BIT NOT NULL DEFAULT 1
);

-- =============================================
-- 5. Tedarikçiler Tablosu (3NF için ayrı tablo)
-- =============================================
CREATE TABLE suppliers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    contact_person NVARCHAR(100) NULL,
    phone NVARCHAR(20) NULL,
    email NVARCHAR(254) NULL,
    address NTEXT NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- =============================================
-- 6. Parçalar Tablosu
-- =============================================
CREATE TABLE api_part (
    id INT IDENTITY(1,1) PRIMARY KEY,
    part_id NVARCHAR(50) UNIQUE NOT NULL,
    name NVARCHAR(200) NOT NULL,
    category_id INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    current_stock INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 0,
    max_stock INT NOT NULL DEFAULT 0,
    supplier_id INT NOT NULL,
    url NVARCHAR(500) NULL,
    main_image NVARCHAR(500) NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (category_id) REFERENCES api_partcategory(id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

-- =============================================
-- 7. Model-Parça İlişki Tablosu (Many-to-Many)
-- =============================================
CREATE TABLE api_modelpart (
    id INT IDENTITY(1,1) PRIMARY KEY,
    vespa_model_id INT NOT NULL,
    part_id INT NOT NULL,
    is_required BIT NOT NULL DEFAULT 1,
    notes NTEXT NULL,
    FOREIGN KEY (vespa_model_id) REFERENCES api_vespamodel(id) ON DELETE CASCADE,
    FOREIGN KEY (part_id) REFERENCES api_part(id) ON DELETE CASCADE,
    UNIQUE (vespa_model_id, part_id)
);

-- =============================================
-- 8. Müşteriler Tablosu
-- =============================================
CREATE TABLE api_customer (
    id INT IDENTITY(1,1) PRIMARY KEY,
    customer_id NVARCHAR(20) UNIQUE NOT NULL,
    name NVARCHAR(100) NOT NULL,
    phone NVARCHAR(20) NOT NULL,
    email NVARCHAR(254) NOT NULL,
    address NTEXT NOT NULL,
    vespa_model_id INT NULL,
    plate_number NVARCHAR(20) NULL,
    registration_date DATE NOT NULL,
    total_spent DECIMAL(10,2) NOT NULL DEFAULT 0,
    services_count INT NOT NULL DEFAULT 0,
    last_service DATE NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'vip')),
    notes NTEXT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (vespa_model_id) REFERENCES api_vespamodel(id)
);

-- =============================================
-- 9. Servis Türleri Tablosu (3NF için ayrı tablo)
-- =============================================
CREATE TABLE service_types (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(50) NOT NULL,
    description NTEXT NULL,
    is_active BIT NOT NULL DEFAULT 1
);

-- =============================================
-- 10. Servis Durumları Tablosu (3NF için ayrı tablo)
-- =============================================
CREATE TABLE service_statuses (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(50) NOT NULL,
    description NTEXT NULL,
    is_active BIT NOT NULL DEFAULT 1
);

-- =============================================
-- 11. Servisler Tablosu
-- =============================================
CREATE TABLE api_service (
    id INT IDENTITY(1,1) PRIMARY KEY,
    service_id NVARCHAR(20) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    service_type_id INT NOT NULL,
    description NTEXT NOT NULL,
    status_id INT NOT NULL,
    estimated_cost DECIMAL(10,2) NOT NULL,
    actual_cost DECIMAL(10,2) NULL,
    start_date DATETIME2 NOT NULL,
    end_date DATETIME2 NULL,
    technician_id INT NULL,
    notes NTEXT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (customer_id) REFERENCES api_customer(id),
    FOREIGN KEY (service_type_id) REFERENCES service_types(id),
    FOREIGN KEY (status_id) REFERENCES service_statuses(id),
    FOREIGN KEY (technician_id) REFERENCES auth_user(id)
);

-- =============================================
-- 12. Servis-Parça İlişki Tablosu
-- =============================================
CREATE TABLE api_servicepart (
    id INT IDENTITY(1,1) PRIMARY KEY,
    service_id INT NOT NULL,
    part_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (service_id) REFERENCES api_service(id) ON DELETE CASCADE,
    FOREIGN KEY (part_id) REFERENCES api_part(id)
);

-- =============================================
-- 13. Stok Hareket Türleri Tablosu (3NF için ayrı tablo)
-- =============================================
CREATE TABLE movement_types (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(50) NOT NULL,
    description NTEXT NULL,
    is_active BIT NOT NULL DEFAULT 1
);

-- =============================================
-- 14. Stok Hareketleri Tablosu
-- =============================================
CREATE TABLE api_stockmovement (
    id INT IDENTITY(1,1) PRIMARY KEY,
    part_id INT NOT NULL,
    movement_type_id INT NOT NULL,
    quantity INT NOT NULL,
    previous_stock INT NOT NULL,
    new_stock INT NOT NULL,
    reason NVARCHAR(200) NOT NULL,
    reference NVARCHAR(100) NULL,
    user_id INT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (part_id) REFERENCES api_part(id),
    FOREIGN KEY (movement_type_id) REFERENCES movement_types(id),
    FOREIGN KEY (user_id) REFERENCES auth_user(id)
);

-- =============================================
-- İndeksler (Performance için)
-- =============================================
CREATE INDEX IX_api_part_part_id ON api_part(part_id);
CREATE INDEX IX_api_customer_customer_id ON api_customer(customer_id);
CREATE INDEX IX_api_service_service_id ON api_service(service_id);
CREATE INDEX IX_api_part_category_id ON api_part(category_id);
CREATE INDEX IX_api_part_supplier_id ON api_part(supplier_id);
CREATE INDEX IX_api_customer_vespa_model_id ON api_customer(vespa_model_id);
CREATE INDEX IX_api_service_customer_id ON api_service(customer_id);
CREATE INDEX IX_api_service_status_id ON api_service(status_id);
CREATE INDEX IX_api_stockmovement_part_id ON api_stockmovement(part_id);
CREATE INDEX IX_api_stockmovement_created_at ON api_stockmovement(created_at);

-- =============================================
-- Temel Verileri Ekle
-- =============================================

-- Servis Türleri
INSERT INTO service_types (name, description) VALUES
('maintenance', 'Bakım'),
('repair', 'Onarım'),
('inspection', 'Muayene'),
('emergency', 'Acil'),
('other', 'Diğer');

-- Servis Durumları
INSERT INTO service_statuses (name, description) VALUES
('pending', 'Bekliyor'),
('in_progress', 'Devam Ediyor'),
('completed', 'Tamamlandı'),
('cancelled', 'İptal');

-- Stok Hareket Türleri
INSERT INTO movement_types (name, description) VALUES
('in', 'Giriş'),
('out', 'Çıkış'),
('adjustment', 'Düzeltme'),
('return', 'İade');

-- Parça Kategorileri
INSERT INTO api_partcategory (name, description) VALUES
('Motor', 'Motor ile ilgili parçalar'),
('Fren Sistemi', 'Fren sistemi parçaları'),
('Transmisyon', 'Vites ve debriyaj parçaları'),
('Süspansiyon', 'Süspansiyon parçaları'),
('Elektrik', 'Elektrik sistemi parçaları'),
('Gövde', 'Gövde ve dış parçalar'),
('Aksesuar', 'Aksesuar parçaları');

-- Tedarikçiler
INSERT INTO suppliers (name, contact_person, phone, email) VALUES
('Vespa Türkiye', 'Ahmet Yılmaz', '+90 212 555 0101', 'info@vespa-turkiye.com'),
('Mobil Türkiye', 'Mehmet Özkan', '+90 212 555 0202', 'info@mobil-turkiye.com'),
('Michelin', 'Fatma Demir', '+90 212 555 0303', 'info@michelin-turkiye.com'),
('MotoEtiler Yetkili Bayi', 'Can Yıldız', '+90 212 555 0404', 'info@motoetiler.com');

-- Vespa Modelleri
INSERT INTO api_vespamodel (name, description, year, engine_size, price, image_url) VALUES
('Vespa Primavera 150 3v', 'Klasik tasarım, modern teknoloji', 2024, '150cc', 125000.00, 'https://example.com/primavera.jpg'),
('Vespa GTS 300', 'Güçlü motor, konforlu sürüş', 2024, '300cc', 185000.00, 'https://example.com/gts300.jpg'),
('Vespa Sprint 125', 'Sportif tasarım, ekonomik yakıt', 2024, '125cc', 95000.00, 'https://example.com/sprint125.jpg');

-- Admin kullanıcısı oluştur
INSERT INTO auth_user (password, username, first_name, last_name, email, is_superuser, is_staff, is_active, date_joined) VALUES
('pbkdf2_sha256$600000$hash_here', 'MotoEtiler', 'MotoEtiler', 'Admin', 'admin@motoetiler.com', 1, 1, 1, GETDATE());

-- Admin kullanıcı profili
INSERT INTO api_userprofile (user_id, phone, department, is_technician, can_manage_stock, can_manage_customers, can_manage_services) VALUES
(1, '+90 212 555 0404', 'Yönetim', 1, 1, 1, 1);

-- =============================================
-- 11. Appointment Slots Tablosu (Randevu Zaman Dilim Yönetimi)
-- =============================================
CREATE TABLE appointment_slots (
    id INT IDENTITY(1,1) PRIMARY KEY,
    day_of_week NVARCHAR(10) NOT NULL, -- MONDAY, TUESDAY, etc.
    slot_time TIME NOT NULL,
    slot_duration INT NOT NULL DEFAULT 60, -- minutes
    max_appointments INT NOT NULL DEFAULT 1,
    slot_type NVARCHAR(20) NOT NULL DEFAULT 'GENERAL', -- GENERAL, MAINTENANCE, REPAIR
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- =============================================
-- 12. Appointments Tablosu (Randevular)
-- =============================================
CREATE TABLE appointments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    appointment_id NVARCHAR(20) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    vespa_model_id INT NULL,
    service_type NVARCHAR(50) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 60,
    status NVARCHAR(20) NOT NULL DEFAULT 'SCHEDULED', -- SCHEDULED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW
    customer_notes NTEXT NULL,
    internal_notes NTEXT NULL,
    created_by INT NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    FOREIGN KEY (customer_id) REFERENCES api_customer(id),
    FOREIGN KEY (vespa_model_id) REFERENCES api_vespamodel(id),
    FOREIGN KEY (created_by) REFERENCES auth_user(id)
);

-- =============================================
-- 13. Appointment Status History Tablosu
-- =============================================
CREATE TABLE appointment_status_history (
    id INT IDENTITY(1,1) PRIMARY KEY,
    appointment_id INT NOT NULL,
    old_status NVARCHAR(20) NULL,
    new_status NVARCHAR(20) NOT NULL,
    change_reason NTEXT NULL,
    changed_by INT NOT NULL,
    changed_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES auth_user(id)
);

-- =============================================
-- İndeksler
-- =============================================
CREATE INDEX IX_appointment_slots_day_time ON appointment_slots(day_of_week, slot_time);
CREATE INDEX IX_appointments_date_time ON appointments(appointment_date, appointment_time);
CREATE INDEX IX_appointments_customer_id ON appointments(customer_id);
CREATE INDEX IX_appointments_status ON appointments(status);
CREATE INDEX IX_appointment_status_history_appointment_id ON appointment_status_history(appointment_id);

-- =============================================
-- Temel Appointment Slots Verisi
-- =============================================
-- Hafta içi çalışma saatleri (09:00-17:00)
INSERT INTO appointment_slots (day_of_week, slot_time, slot_duration, max_appointments, slot_type) VALUES
-- Pazartesi
('MONDAY', '09:00', 60, 2, 'GENERAL'),
('MONDAY', '10:00', 60, 2, 'GENERAL'),
('MONDAY', '11:00', 60, 2, 'GENERAL'),
('MONDAY', '13:00', 60, 2, 'GENERAL'),
('MONDAY', '14:00', 60, 2, 'GENERAL'),
('MONDAY', '15:00', 60, 2, 'GENERAL'),
('MONDAY', '16:00', 60, 2, 'GENERAL'),
-- Salı
('TUESDAY', '09:00', 60, 2, 'GENERAL'),
('TUESDAY', '10:00', 60, 2, 'GENERAL'),
('TUESDAY', '11:00', 60, 2, 'GENERAL'),
('TUESDAY', '13:00', 60, 2, 'GENERAL'),
('TUESDAY', '14:00', 60, 2, 'GENERAL'),
('TUESDAY', '15:00', 60, 2, 'GENERAL'),
('TUESDAY', '16:00', 60, 2, 'GENERAL'),
-- Çarşamba
('WEDNESDAY', '09:00', 60, 2, 'GENERAL'),
('WEDNESDAY', '10:00', 60, 2, 'GENERAL'),
('WEDNESDAY', '11:00', 60, 2, 'GENERAL'),
('WEDNESDAY', '13:00', 60, 2, 'GENERAL'),
('WEDNESDAY', '14:00', 60, 2, 'GENERAL'),
('WEDNESDAY', '15:00', 60, 2, 'GENERAL'),
('WEDNESDAY', '16:00', 60, 2, 'GENERAL'),
-- Perşembe
('THURSDAY', '09:00', 60, 2, 'GENERAL'),
('THURSDAY', '10:00', 60, 2, 'GENERAL'),
('THURSDAY', '11:00', 60, 2, 'GENERAL'),
('THURSDAY', '13:00', 60, 2, 'GENERAL'),
('THURSDAY', '14:00', 60, 2, 'GENERAL'),
('THURSDAY', '15:00', 60, 2, 'GENERAL'),
('THURSDAY', '16:00', 60, 2, 'GENERAL'),
-- Cuma
('FRIDAY', '09:00', 60, 2, 'GENERAL'),
('FRIDAY', '10:00', 60, 2, 'GENERAL'),
('FRIDAY', '11:00', 60, 2, 'GENERAL'),
('FRIDAY', '13:00', 60, 2, 'GENERAL'),
('FRIDAY', '14:00', 60, 2, 'GENERAL'),
('FRIDAY', '15:00', 60, 2, 'GENERAL'),
('FRIDAY', '16:00', 60, 2, 'GENERAL'),
-- Cumartesi (kısık mesai)
('SATURDAY', '09:00', 60, 1, 'GENERAL'),
('SATURDAY', '10:00', 60, 1, 'GENERAL'),
('SATURDAY', '11:00', 60, 1, 'GENERAL'),
('SATURDAY', '12:00', 60, 1, 'GENERAL');

PRINT 'MotoEtiler Vespa Bayisi Database başarıyla oluşturuldu!';
PRINT 'Tablolar 3NF kurallarına uygun şekilde yapılandırıldı.';
GO 