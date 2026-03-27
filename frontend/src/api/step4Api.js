import { apiPost } from './client';

export async function trainModel(modelId, params) {
  return apiPost('/step4/train', { model: modelId, params });
}
