import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    register: (userData) => api.post('/register', userData),
    login: async (userData) => {
        const response = await api.post('/login', userData);
        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
        }
        return response;
    },
    logout: () => {
        localStorage.removeItem('token');
    },
    isAuthenticated: () => !!localStorage.getItem('token'),
};

export const topicsService = {
    getAllTopics: () => api.get('/topics'),
    createTopic: (topicData) => api.post('/topics', topicData),
    searchTopics: (query) => api.get(`/topics/search?query=${query}`),
    deleteTopic: (topicId) => api.delete(`/topics/${topicId}`),
};

export const subtopicsService = {
    getSubtopics: (topicId) => api.get(`/topics/${topicId}/subtopics`),
    createSubtopic: (topicId, subtopicData) => api.post(`/topics/${topicId}/subtopics`, subtopicData),
    searchSubtopics: (topicId, query) => api.get(`/topics/${topicId}/subtopics/search?query=${query}`),
    deleteSubtopic: (topicId, subtopicId) => api.delete(`/topics/${topicId}/subtopics/${subtopicId}`),
};

export const resourcesService = {
    getResources: (subtopicId, tag = null) => {
        const url = tag
            ? `/subtopics/${subtopicId}/resources?tag=${tag}`
            : `/subtopics/${subtopicId}/resources`;
        return api.get(url);
    },
    createResource: (subtopicId, resourceData) => api.post(`/subtopics/${subtopicId}/resources`, resourceData),
    uploadResource: (subtopicId, formData) => {
        return api.post(`/subtopics/${subtopicId}/resources/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Important for file uploads
            },
        });
    },
    getTags: () => api.get('/tags'),
    deleteResource: (subtopicId, resourceId) => api.delete(`/subtopics/${subtopicId}/resources/${resourceId}`),
};

export default api;
