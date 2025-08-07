/**
 * Centralized API Service with JWT Authentication
 * Replaces all mock data with real backend API calls
 */

const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  // ===== AUTHENTICATION =====
  
  /**
   * Set authentication tokens
   */
  setTokens(accessToken, refreshToken) {
    this.token = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  /**
   * Clear authentication tokens
   */
  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  /**
   * Get auth headers
   */
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  /**
   * Make authenticated API request
   */
  async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle 401 - try to refresh token
      if (response.status === 401 && this.refreshToken) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry the original request
          config.headers = this.getAuthHeaders();
          const retryResponse = await fetch(url, config);
          return await this.handleResponse(retryResponse);
        } else {
          // Refresh failed, redirect to login
          this.clearTokens();
          window.location.href = '/auth/sign-in';
          return null;
        }
      }

      return await this.handleResponse(response);
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  /**
   * Handle API response
   */
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
    }
    
    return await response.json();
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken() {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.access, this.refreshToken);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return false;
  }

  // ===== AUTHENTICATION ENDPOINTS =====

  /**
   * Login user
   */
  async login(username, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      this.setTokens(data.access_token, data.refresh_token);
      return data;
    }

    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Login failed');
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      await this.makeRequest('/auth/logout/', { method: 'POST' });
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      this.clearTokens();
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser() {
    return await this.makeRequest('/auth/me/');
  }

  // ===== CUSTOMERS ENDPOINTS =====

  /**
   * Get all customers with summary info
   */
  async getCustomers(page = 1, limit = 20, search = '') {
    const params = new URLSearchParams({
      page,
      limit,
      ...(search && { search }),
    });
    
    return await this.makeRequest(`/customers/?${params}`);
  }

  /**
   * Get customer by ID with details
   */
  async getCustomer(customerId) {
    return await this.makeRequest(`/customers/${customerId}/`);
  }

  /**
   * Create new customer
   */
  async createCustomer(customerData) {
    return await this.makeRequest('/customers/', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  /**
   * Update customer
   */
  async updateCustomer(customerId, customerData) {
    return await this.makeRequest(`/customers/${customerId}/`, {
      method: 'PUT',
      body: JSON.stringify(customerData),
    });
  }

  /**
   * Get Vespa models
   */
  async getVespaModels() {
    return await this.makeRequest('/customers/vespa-models/');
  }

  /**
   * Get customer's Vespas
   */
  async getCustomerVespas(customerId) {
    return await this.makeRequest(`/customers/${customerId}/vespas/`);
  }

  // ===== INVENTORY ENDPOINTS =====

  /**
   * Get all parts with stock info
   */
  async getParts(page = 1, limit = 20, category = '', search = '') {
    const params = new URLSearchParams({
      page,
      limit,
      ...(category && { category }),
      ...(search && { search }),
    });
    
    return await this.makeRequest(`/inventory/parts/?${params}`);
  }

  /**
   * Get part by ID with details
   */
  async getPart(partId) {
    return await this.makeRequest(`/inventory/parts/${partId}/`);
  }

  /**
   * Get parts by Vespa model
   */
  async getPartsByModel(modelId) {
    return await this.makeRequest(`/inventory/parts/?model=${modelId}`);
  }

  /**
   * Get part categories
   */
  async getPartCategories() {
    return await this.makeRequest('/inventory/categories/');
  }

  /**
   * Get low stock parts
   */
  async getLowStockParts() {
    return await this.makeRequest('/inventory/stock/low/');
  }

  /**
   * Get stock movements
   */
  async getStockMovements(partId = null, limit = 50) {
    const params = new URLSearchParams({
      limit,
      ...(partId && { part_id: partId }),
    });
    
    return await this.makeRequest(`/inventory/stock-movements/?${params}`);
  }

  /**
   * Get storage locations
   */
  async getStorageLocations() {
    return await this.makeRequest('/inventory/locations/');
  }

  /**
   * Get suppliers
   */
  async getSuppliers() {
    return await this.makeRequest('/inventory/suppliers/');
  }

  // ===== SERVICES ENDPOINTS =====

  /**
   * Get all service records
   */
  async getServices(page = 1, limit = 20, status = '', customerId = null, vespaId = null) {
    const params = new URLSearchParams({
      page,
      limit,
      ...(status && { status }),
    });
    if (customerId) params.append('customer_id', customerId);
    if (vespaId) params.append('vespa_id', vespaId);
    
    return await this.makeRequest(`/services/?${params}`);
  }

  /**
   * Get service by ID
   */
  async getService(serviceId) {
    return await this.makeRequest(`/services/${serviceId}/`);
  }

  /**
   * Create new service record
   */
  async createService(serviceData) {
    return await this.makeRequest('/services/', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  }

  /**
   * Update service status
   */
  async updateServiceStatus(serviceId, status, completionData = {}) {
    return await this.makeRequest(`/services/${serviceId}/status/`, {
      method: 'POST',
      body: JSON.stringify({ status, ...completionData }),
    });
  }

  /**
   * Get paint templates for model
   */
  async getPaintTemplates(modelId) {
    return await this.makeRequest(`/services/paint/templates/${modelId}/`);
  }

  /**
   * Get paint jobs
   */
  async getPaintJobs(serviceId = null) {
    const params = serviceId ? `?service=${serviceId}` : '';
    return await this.makeRequest(`/services/paint/jobs/${params}`);
  }

  // ===== APPOINTMENTS ENDPOINTS =====

  /**
   * Get appointments
   */
  async getAppointments(startDate = null, endDate = null) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    return await this.makeRequest(`/appointments/?${params}`);
  }

  /**
   * Get available appointment slots
   */
  async getAvailableSlots(date, serviceType = null) {
    const params = new URLSearchParams({ date });
    if (serviceType) params.append('service_type', serviceType);
    
    return await this.makeRequest(`/appointments/slots/available/?${params}`);
  }

  /**
   * Create appointment
   */
  async createAppointment(appointmentData) {
    return await this.makeRequest('/appointments/', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  /**
   * Update appointment status
   */
  async updateAppointmentStatus(appointmentId, status) {
    return await this.makeRequest(`/appointments/${appointmentId}/status/`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

  // ===== ACCOUNTING ENDPOINTS =====

  /**
   * Get invoices
   */
  async getInvoices(page = 1, limit = 20, status = '') {
    const params = new URLSearchParams({
      page,
      limit,
      ...(status && { status }),
    });
    
    return await this.makeRequest(`/accounting/invoices/?${params}`);
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(invoiceId) {
    return await this.makeRequest(`/accounting/invoices/${invoiceId}/`);
  }

  /**
   * Create invoice
   */
  async createInvoice(invoiceData) {
    return await this.makeRequest('/accounting/invoices/', {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });
  }

  /**
   * Get daily cash summary
   */
  async getDailyCashSummary(date = null) {
    const params = date ? `?date=${date}` : '';
    return await this.makeRequest(`/accounting/cash-summary/${params}`);
  }

  // ===== REPORTS ENDPOINTS =====

  /**
   * Get comprehensive dashboard data
   */
  async getDashboardData() {
    return await this.makeRequest('/reports/dashboard/');
  }

  /**
   * Get customer summary report
   */
  async getCustomerSummaryReport() {
    return await this.makeRequest('/reports/customers/');
  }

  /**
   * Get inventory summary report
   */
  async getInventorySummaryReport() {
    return await this.makeRequest('/reports/inventory/');
  }

  /**
   * Get service performance report
   */
  async getServicePerformanceReport() {
    return await this.makeRequest('/reports/services/');
  }

  // ===== VESPA MODELS =====

  /**
   * Get all Vespa models
   */
  async getVespaModels() {
    return await this.makeRequest('/customers/vespa-models/');
  }

  // ===== TAX REPORTS ENDPOINTS =====

  /**
   * Get all tax reports
   */
  async getTaxReports(year = null, reportType = null) {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (reportType) params.append('report_type', reportType);
    
    return await this.makeRequest(`/accounting/tax-reports/?${params}`);
  }

  /**
   * Generate new tax report
   */
  async generateTaxReport(reportData) {
    return await this.makeRequest('/accounting/tax-reports/generate/', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  /**
   * Finalize tax report
   */
  async finalizeTaxReport(reportId) {
    return await this.makeRequest(`/accounting/tax-reports/${reportId}/finalize/`, {
      method: 'POST',
    });
  }

  /**
   * Export tax report as PDF
   */
  async exportTaxReportPDF(reportId) {
    const response = await fetch(`${API_BASE_URL}/accounting/tax-reports/${reportId}/export-pdf/`, {
      headers: this.getAuthHeaders(),
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tax-report-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  }

  // ===== SYSTEM SETTINGS ENDPOINTS =====

  /**
   * Get all system settings
   */
  async getSystemSettings() {
    return await this.makeRequest('/admin/system-settings/');
  }

  /**
   * Update system settings by category
   */
  async updateSystemSettings(category, settings) {
    return await this.makeRequest(`/admin/system-settings/${category}/`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  /**
   * Test email settings
   */
  async testEmailSettings(emailSettings) {
    return await this.makeRequest('/admin/test-email/', {
      method: 'POST',
      body: JSON.stringify(emailSettings),
    });
  }

  /**
   * Test currency API
   */
  async testCurrencyAPI() {
    return await this.makeRequest('/inventory/currency/rates/');
  }

  /**
   * Update appointment status
   */
  async updateAppointment(appointmentId, appointmentData) {
    return await this.makeRequest(`/appointments/${appointmentId}/`, {
      method: 'PUT',
      body: JSON.stringify(appointmentData),
    });
  }

  // ===== EMAIL NOTIFICATIONS =====

  /**
   * Get email notifications
   */
  async getEmailNotifications(status = null) {
    const params = status ? `?status=${status}` : '';
    return await this.makeRequest(`/admin/email-notifications/${params}`);
  }

  /**
   * Send email notification
   */
  async sendEmailNotification(notificationData) {
    return await this.makeRequest('/admin/email-notifications/send/', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  }

  // ===== ADVANCED REPORTS =====

  /**
   * Get monthly financial summary
   */
  async getMonthlyFinancialSummary(year, month) {
    return await this.makeRequest(`/reports/monthly-financial-summary/?year=${year}&month=${month}`);
  }

  /**
   * Get tax calculation summary
   */
  async getTaxCalculationSummary(startDate, endDate) {
    return await this.makeRequest(`/reports/tax-calculation/?start_date=${startDate}&end_date=${endDate}`);
  }

  // ===== PAINT SYSTEM METHODS =====

  /**
   * Get paint templates for a Vespa model
   */
  async getPaintTemplates(vespaModelId) {
    return await this.makeRequest(`/services/paint/templates/${vespaModelId}/`);
  }

  /**
   * Get paint template parts (SVG elements)
   */
  async getPaintTemplateParts(templateId) {
    return await this.makeRequest(`/services/paint/template-parts/${templateId}/`);
  }

  /**
   * Create paint job with selected parts and colors
   */
  async createPaintJob(paintJobData) {
    return await this.makeRequest('/services/paint/jobs/', {
      method: 'POST',
      body: JSON.stringify(paintJobData),
    });
  }

  /**
   * Get paint job details
   */
  async getPaintJobDetails(paintJobId) {
    return await this.makeRequest(`/services/paint/jobs/${paintJobId}/`);
  }

  // ===== WORK TYPES =====

  /**
   * Get all work types
   */
  async getWorkTypes(search = '', category = '') {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    
    const url = `/services/work-types/${params.toString() ? '?' + params.toString() : ''}`;
    return await this.makeRequest(url);
  }

  /**
   * Get work type by ID
   */
  async getWorkType(workTypeId) {
    return await this.makeRequest(`/services/work-types/${workTypeId}/`);
  }

  /**
   * Create new work type
   */
  async createWorkType(workTypeData) {
    return await this.makeRequest('/services/work-types/', {
      method: 'POST',
      body: JSON.stringify(workTypeData),
    });
  }

  /**
   * Update work type
   */
  async updateWorkType(workTypeId, workTypeData) {
    return await this.makeRequest(`/services/work-types/${workTypeId}/`, {
      method: 'PUT',
      body: JSON.stringify(workTypeData),
    });
  }

  /**
   * Delete work type (soft delete)
   */
  async deleteWorkType(workTypeId) {
    return await this.makeRequest(`/services/work-types/${workTypeId}/`, {
      method: 'DELETE',
    });
  }

  /**
   * Get work types grouped by categories
   */
  async getWorkTypesCategories() {
    return await this.makeRequest('/services/work-types/categories/');
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;