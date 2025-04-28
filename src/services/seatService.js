import axios from 'axios';

const API_URL = 'https://galaxycinema-a6eeaze9afbagaft.southeastasia-01.azurewebsites.net/api';

const seatService = {
    getRoomById: async (roomId) => {
        try {
            const response = await axios.get(`${API_URL}/Room/${roomId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error fetching room');
        }
    },

    getByShowTimeId: async (showTimeId, roomId) => {
        try {
            const response = await axios.get(`${API_URL}/seat/paged`, {
                params: {
                    pageNumber: 1,
                    pageSize: 100,
                    roomId: roomId,
                },
            });
            return response.data.items;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error fetching seats');
        }
    },

    getAll: async () => {
        try {
            const response = await axios.get(`${API_URL}/seat`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error fetching seats');
        }
    },

    getById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/seat/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error fetching seat');
        }
    },
};

export { seatService };