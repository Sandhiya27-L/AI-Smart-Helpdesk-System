import api from './axios'
export const queryNlp = (data) => api.post('/nlp/query', data)
