import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export interface AnalysisResult {
  condition: string;
  confidence: number;
  description: string;
  recommendations: string[];
}

export const analyzeImage = async (file: File): Promise<AnalysisResult> => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await axios.post(`${API_URL}/analysis/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw new Error('Failed to analyze image');
  }
};