import { apiGet } from './client';

export async function fetchResults() {
  return apiGet('/step5/results');
}
