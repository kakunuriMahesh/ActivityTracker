import axios from 'axios';
import { API_BASE_URL } from '@/constants/config';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const createTask = async (task: { activity: string; distance: number; user: string }) => {
  // Mock response for now
  return { data: task };
};

export const createChallenge = async (challenge: { activity: string; goal: number; participants: string[] }) => {
  // Mock response
  return { data: challenge };
};

export default api;