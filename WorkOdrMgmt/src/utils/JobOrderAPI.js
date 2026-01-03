import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/env';

class JobOrderAPI {
  constructor(apiService) {
    this.apiService = apiService;
  }

  // ========== JOB ORDERS ==========
  
  // Create job order (Agent only)
  async createJobOrder(data) {
    return this.apiService.makeRequest('/job-orders', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Get my job orders (Agent)
  async getMyJobOrders() {
    return this.apiService.makeRequest('/job-orders/my-jobs', {
      method: 'GET'
    });
  }

  // Get all open job orders (Contractor)
  async getOpenJobOrders() {
    return this.apiService.makeRequest('/job-orders/open', {
      method: 'GET'
    });
  }

  // Search job orders (Contractor)
  async searchJobOrders(query) {
    return this.apiService.makeRequest(`/job-orders/search?q=${encodeURIComponent(query)}`, {
      method: 'GET'
    });
  }

  // Get single job order
  async getJobOrderById(id) {
    return this.apiService.makeRequest(`/job-orders/${id}`, {
      method: 'GET'
    });
  }

  // Update job order (Agent)
  async updateJobOrder(id, data) {
    return this.apiService.makeRequest(`/job-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Delete job order (Agent)
  async deleteJobOrder(id) {
    return this.apiService.makeRequest(`/job-orders/${id}`, {
      method: 'DELETE'
    });
  }

  // ========== WORK ORDERS ==========

  // Create work order / Apply to job (Contractor)
  async createWorkOrder(data) {
    return this.apiService.makeRequest('/work-orders', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Get my work orders / applications (Contractor)
  async getMyWorkOrders() {
    return this.apiService.makeRequest('/work-orders/my-applications', {
      method: 'GET'
    });
  }

  // Get applications for a job (Agent)
  async getApplicationsForJob(jobOrderId) {
    return this.apiService.makeRequest(`/work-orders/job/${jobOrderId}`, {
      method: 'GET'
    });
  }

  // Approve work order (Agent)
  async approveWorkOrder(workOrderId) {
    return this.apiService.makeRequest(`/work-orders/${workOrderId}/approve`, {
      method: 'POST'
    });
  }

  // Reject work order (Agent)
  async rejectWorkOrder(workOrderId) {
    return this.apiService.makeRequest(`/work-orders/${workOrderId}/reject`, {
      method: 'POST'
    });
  }

  // ========== ASSIGNMENTS ==========

  // Get my assignments
  async getMyAssignments() {
    return this.apiService.makeRequest('/assignments/my-assignments', {
      method: 'GET'
    });
  }

  // Get assignment by ID
  async getAssignmentById(id) {
    return this.apiService.makeRequest(`/assignments/${id}`, {
      method: 'GET'
    });
  }

  // ========== WORK PLANS ==========

  // Create work plan (Contractor)
  async createWorkPlan(data) {
    return this.apiService.makeRequest('/work-plans', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Get my work plans (Contractor)
  async getMyWorkPlans() {
    return this.apiService.makeRequest('/work-plans/my-plans', {
      method: 'GET'
    });
  }

  // Get work plan by assignment
  async getWorkPlanByAssignment(assignmentId) {
    return this.apiService.makeRequest(`/work-plans/assignment/${assignmentId}`, {
      method: 'GET'
    });
  }

  // Update work plan (Contractor)
  async updateWorkPlan(id, data) {
    return this.apiService.makeRequest(`/work-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // ========== INVOICES ==========

  // Create invoice (Contractor)
  async createInvoice(data) {
    return this.apiService.makeRequest('/invoices', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Get my invoices
  async getMyInvoices() {
    return this.apiService.makeRequest('/invoices/my-invoices', {
      method: 'GET'
    });
  }

  // Get invoices by assignment
  async getInvoicesByAssignment(assignmentId) {
    return this.apiService.makeRequest(`/invoices/assignment/${assignmentId}`, {
      method: 'GET'
    });
  }

  // Get invoice by ID
  async getInvoiceById(id) {
    return this.apiService.makeRequest(`/invoices/${id}`, {
      method: 'GET'
    });
  }

  // Update invoice status (Agent)
  async updateInvoiceStatus(id, status) {
    return this.apiService.makeRequest(`/invoices/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }
}

export default JobOrderAPI;
