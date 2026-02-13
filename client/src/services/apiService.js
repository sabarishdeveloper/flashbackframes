import api from './api';

export const productAPI = {
    getAll: () => api.get('/products'),
    getById: (id) => api.get(`/products/${id}`),
    create: (formData) => api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, formData) => api.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => api.delete(`/products/${id}`),
};

export const orderAPI = {
    create: (formData) => api.post('/orders', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    track: (identifier) => api.get(`/orders/track/${identifier}`),
    getAll: () => api.get('/orders'),
    updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
    delete: (id) => api.delete(`/orders/${id}`),
};

export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    getMe: () => api.get('/auth/me'),
};

export const paymentAPI = {
    createOrder: (amount) => api.post('/payment/create-order', { amount }),
    verifyPayment: (paymentData) => api.post('/payment/verify', paymentData),
    verifyAndCreate: (formData) => api.post('/payment/verify-and-create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};
