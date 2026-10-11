// Mock API service - Replace with actual backend calls in production

import type { PCBuild, UpgradeRecommendation, Shop, Budget, UseCase } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const api = {
  async getRealtimeAssistantRecommendation(budget: Budget, useCase: UseCase) {
    const response = await fetch(`${API_BASE_URL}/assistant-recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ budget, useCase }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.error || 'Failed to fetch real-time assistant recommendation');
    }

    return response.json();
  },

  // Get PC build recommendations
  async getBuildRecommendations(
    budget: Budget,
    withMonitor: boolean,
    useCase?: UseCase
  ): Promise<PCBuild> {
    try {
      const response = await fetch(`${API_BASE_URL}/build`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          budget,
          withMonitor,
          useCase,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch build recommendations');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching build:', error);
      // Return mock data for development
      throw error;
    }
  },

  // Get upgrade recommendations
  async getUpgradeRecommendations(currentSpecs: FormData): Promise<UpgradeRecommendation[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/upgrade`, {
        method: 'POST',
        body: currentSpecs,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch upgrade recommendations');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching upgrades:', error);
      throw error;
    }
  },

  // Get shops for a specific part
  async getShops(partId: string, location?: string): Promise<Shop[]> {
    try {
      const params = new URLSearchParams({ partId });
      if (location) params.append('location', location);

      const response = await fetch(`${API_BASE_URL}/shops?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch shops');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching shops:', error);
      throw error;
    }
  },

  // Get part details
  async getPartDetails(partId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/parts/${partId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch part details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching part:', error);
      throw error;
    }
  },
};
