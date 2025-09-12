import axios from 'axios';
import type { Location } from '../types/location';

const BASE_URL = 'http://localhost:8080/api/location'; // Replace with your backend URL

export const updateLocation = (busId: string, location: Location) =>
  axios.post(`${BASE_URL}/update`, { busId, ...location });

export const getCurrentLocation = (busId: string) =>
  axios.get<{ lat: number; lng: number }>(`${BASE_URL}/current`, {
    params: { busId },
  });
