from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class VespaModel(models.Model):
    """Vespa modelleri"""
    name = models.CharField(max_length=100, verbose_name="Model Adı")
    description = models.TextField(blank=True, verbose_name="Açıklama")
    year = models.IntegerField(verbose_name="Yıl")
    engine_size = models.CharField(max_length=50, verbose_name="Motor Hacmi")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Fiyat")
    image_url = models.URLField(blank=True, verbose_name="Resim URL")
    is_active = models.BooleanField(default=True, verbose_name="Aktif")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Oluşturulma Tarihi")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Güncellenme Tarihi")

    class Meta:
        verbose_name = "Vespa Modeli"
        verbose_name_plural = "Vespa Modelleri"
        ordering = ['name']

    def __str__(self):
        return self.name


class PartCategory(models.Model):
    """Parça kategorileri"""
    name = models.CharField(max_length=100, verbose_name="Kategori Adı")
    description = models.TextField(blank=True, verbose_name="Açıklama")
    is_active = models.BooleanField(default=True, verbose_name="Aktif")

    class Meta:
        verbose_name = "Parça Kategorisi"
        verbose_name_plural = "Parça Kategorileri"
        ordering = ['name']

    def __str__(self):
        return self.name


class Supplier(models.Model):
    """Tedarikçiler"""
    name = models.CharField(max_length=100, verbose_name="Tedarikçi Adı")
    contact_person = models.CharField(max_length=100, blank=True, verbose_name="İletişim Kişisi")
    phone = models.CharField(max_length=20, blank=True, verbose_name="Telefon")
    email = models.EmailField(blank=True, verbose_name="E-posta")
    address = models.TextField(blank=True, verbose_name="Adres")
    is_active = models.BooleanField(default=True, verbose_name="Aktif")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Oluşturulma Tarihi")

    class Meta:
        verbose_name = "Tedarikçi"
        verbose_name_plural = "Tedarikçiler"
        ordering = ['name']

    def __str__(self):
        return self.name


class Part(models.Model):
    """Vespa parçaları"""
    part_id = models.CharField(max_length=50, unique=True, verbose_name="Parça ID")
    name = models.CharField(max_length=200, verbose_name="Parça Adı")
    category = models.ForeignKey(PartCategory, on_delete=models.CASCADE, verbose_name="Kategori")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Fiyat")
    current_stock = models.IntegerField(default=0, verbose_name="Mevcut Stok")
    min_stock = models.IntegerField(default=0, verbose_name="Minimum Stok")
    max_stock = models.IntegerField(default=0, verbose_name="Maksimum Stok")
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, verbose_name="Tedarikçi")
    url = models.URLField(blank=True, verbose_name="Ürün URL")
    main_image = models.URLField(blank=True, verbose_name="Ana Resim")
    is_active = models.BooleanField(default=True, verbose_name="Aktif")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Oluşturulma Tarihi")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Güncellenme Tarihi")

    class Meta:
        verbose_name = "Parça"
        verbose_name_plural = "Parçalar"
        ordering = ['name']

    def __str__(self):
        return f"{self.name} - {self.part_id}"

    @property
    def stock_status(self):
        """Stok durumu"""
        if self.current_stock <= self.min_stock:
            return "critical"
        elif self.current_stock <= self.min_stock * 1.5:
            return "low"
        else:
            return "normal"


class ModelPart(models.Model):
    """Model-Parça ilişkisi"""
    vespa_model = models.ForeignKey(VespaModel, on_delete=models.CASCADE, verbose_name="Vespa Modeli")
    part = models.ForeignKey(Part, on_delete=models.CASCADE, verbose_name="Parça")
    is_required = models.BooleanField(default=True, verbose_name="Zorunlu")
    notes = models.TextField(blank=True, verbose_name="Notlar")

    class Meta:
        verbose_name = "Model Parçası"
        verbose_name_plural = "Model Parçaları"
        unique_together = ['vespa_model', 'part']

    def __str__(self):
        return f"{self.vespa_model.name} - {self.part.name}"


class Customer(models.Model):
    """Müşteriler"""
    STATUS_CHOICES = [
        ('active', 'Aktif'),
        ('inactive', 'Pasif'),
        ('vip', 'VIP'),
    ]

    customer_id = models.CharField(max_length=20, unique=True, verbose_name="Müşteri ID")
    name = models.CharField(max_length=100, verbose_name="Ad Soyad")
    phone = models.CharField(max_length=20, verbose_name="Telefon")
    email = models.EmailField(verbose_name="E-posta")
    address = models.TextField(verbose_name="Adres")
    vespa_model = models.ForeignKey(VespaModel, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Vespa Modeli")
    plate_number = models.CharField(max_length=20, blank=True, verbose_name="Plaka")
    registration_date = models.DateField(verbose_name="Kayıt Tarihi")
    total_spent = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="Toplam Harcama")
    services_count = models.IntegerField(default=0, verbose_name="Servis Sayısı")
    last_service = models.DateField(null=True, blank=True, verbose_name="Son Servis")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', verbose_name="Durum")
    notes = models.TextField(blank=True, verbose_name="Notlar")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Oluşturulma Tarihi")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Güncellenme Tarihi")

    class Meta:
        verbose_name = "Müşteri"
        verbose_name_plural = "Müşteriler"
        ordering = ['name']

    def __str__(self):
        return f"{self.name} - {self.customer_id}"


class ServiceType(models.Model):
    """Servis türleri"""
    name = models.CharField(max_length=50, verbose_name="Servis Türü")
    description = models.TextField(blank=True, verbose_name="Açıklama")
    is_active = models.BooleanField(default=True, verbose_name="Aktif")

    class Meta:
        verbose_name = "Servis Türü"
        verbose_name_plural = "Servis Türleri"
        ordering = ['name']

    def __str__(self):
        return self.name


class ServiceStatus(models.Model):
    """Servis durumları"""
    name = models.CharField(max_length=50, verbose_name="Durum")
    description = models.TextField(blank=True, verbose_name="Açıklama")
    is_active = models.BooleanField(default=True, verbose_name="Aktif")

    class Meta:
        verbose_name = "Servis Durumu"
        verbose_name_plural = "Servis Durumları"
        ordering = ['name']

    def __str__(self):
        return self.name


class Service(models.Model):
    """Servis kayıtları"""
    service_id = models.CharField(max_length=20, unique=True, verbose_name="Servis ID")
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, verbose_name="Müşteri")
    service_type = models.ForeignKey(ServiceType, on_delete=models.CASCADE, verbose_name="Servis Türü")
    description = models.TextField(verbose_name="Açıklama")
    status = models.ForeignKey(ServiceStatus, on_delete=models.CASCADE, verbose_name="Durum")
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Tahmini Maliyet")
    actual_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Gerçek Maliyet")
    start_date = models.DateTimeField(verbose_name="Başlangıç Tarihi")
    end_date = models.DateTimeField(null=True, blank=True, verbose_name="Bitiş Tarihi")
    technician = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Teknisyen")
    notes = models.TextField(blank=True, verbose_name="Notlar")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Oluşturulma Tarihi")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Güncellenme Tarihi")

    class Meta:
        verbose_name = "Servis"
        verbose_name_plural = "Servisler"
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.service_id} - {self.customer.name}"


class ServicePart(models.Model):
    """Servis-Parça ilişkisi"""
    service = models.ForeignKey(Service, on_delete=models.CASCADE, verbose_name="Servis")
    part = models.ForeignKey(Part, on_delete=models.CASCADE, verbose_name="Parça")
    quantity = models.IntegerField(default=1, verbose_name="Miktar")
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Birim Fiyat")
    total_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Toplam Fiyat")

    class Meta:
        verbose_name = "Servis Parçası"
        verbose_name_plural = "Servis Parçaları"

    def save(self, *args, **kwargs):
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.service.service_id} - {self.part.name}"


class MovementType(models.Model):
    """Stok hareket türleri"""
    name = models.CharField(max_length=50, verbose_name="Hareket Türü")
    description = models.TextField(blank=True, verbose_name="Açıklama")
    is_active = models.BooleanField(default=True, verbose_name="Aktif")

    class Meta:
        verbose_name = "Hareket Türü"
        verbose_name_plural = "Hareket Türleri"
        ordering = ['name']

    def __str__(self):
        return self.name


class StockMovement(models.Model):
    """Stok hareketleri"""
    part = models.ForeignKey(Part, on_delete=models.CASCADE, verbose_name="Parça")
    movement_type = models.ForeignKey(MovementType, on_delete=models.CASCADE, verbose_name="Hareket Türü")
    quantity = models.IntegerField(verbose_name="Miktar")
    previous_stock = models.IntegerField(verbose_name="Önceki Stok")
    new_stock = models.IntegerField(verbose_name="Yeni Stok")
    reason = models.CharField(max_length=200, verbose_name="Sebep")
    reference = models.CharField(max_length=100, blank=True, verbose_name="Referans")
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name="Kullanıcı")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Tarih")

    class Meta:
        verbose_name = "Stok Hareketi"
        verbose_name_plural = "Stok Hareketleri"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.part.name} - {self.get_movement_type_display()} - {self.quantity}"


class UserProfile(models.Model):
    """Kullanıcı profilleri"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name="Kullanıcı")
    phone = models.CharField(max_length=20, blank=True, verbose_name="Telefon")
    department = models.CharField(max_length=100, blank=True, verbose_name="Departman")
    is_technician = models.BooleanField(default=False, verbose_name="Teknisyen")
    can_manage_stock = models.BooleanField(default=False, verbose_name="Stok Yönetimi")
    can_manage_customers = models.BooleanField(default=False, verbose_name="Müşteri Yönetimi")
    can_manage_services = models.BooleanField(default=False, verbose_name="Servis Yönetimi")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Oluşturulma Tarihi")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Güncellenme Tarihi")

    class Meta:
        verbose_name = "Kullanıcı Profili"
        verbose_name_plural = "Kullanıcı Profilleri"

    def __str__(self):
        return self.user.get_full_name() or self.user.username
