// Classes/apiService.ts
import api from './api';

export const loadHomeCounter = async () => {
    try {
        await api.post("/homecounter");
    } catch (error) {
        console.error("Error loading home counter:", error);
        throw error;
    }
};
