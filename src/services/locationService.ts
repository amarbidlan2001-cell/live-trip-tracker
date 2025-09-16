import axios from "axios";
import type { Location } from "../types/location";

// ✅ Local backend URL
const BASE_URL = "http://localhost:8080/api/location";
// const BASE_URL = 'http://192.168.31.33:8080/api/location';
// const BASE_URL = "https://acb87c7cc29e.ngrok-free.app/api/location";

export const updateLocation = (busId: string, location: Location) =>
  axios.post(`${BASE_URL}/update`, { busId, ...location });

export const getCurrentLocation = (busId: string) =>
  axios.get<{ lat: number; lng: number }>(`${BASE_URL}/current`, {
    params: { busId },
  });

// ✅ NEW: Delete bus location by busId
export const deleteLocation = (busId: string) =>
  axios.delete(`${BASE_URL}/delete`, {
    params: { busId },
  });
