import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useMutation, useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

const FAVORITES_STORAGE_KEY = 'sound-map-favorites';

interface FavoritesContextValue {
  favoriteIds: string[];
  isReady: boolean;
  isFavorite: (spotId: string) => boolean;
  toggleFavorite: (spotId: string) => void;
}

export const [FavoritesProvider, useFavorites] = createContextHook<FavoritesContextValue>(() => {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const favoritesQuery = useQuery<string[]>({
    queryKey: ['favorites'],
    queryFn: async () => {
      console.log('[favorites] loading stored favorites');
      const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (!stored) {
        return [];
      }

      try {
        const parsed = JSON.parse(stored) as string[];
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.log('[favorites] failed to parse stored favorites', error);
        return [];
      }
    },
  });

  const saveFavoritesMutation = useMutation({
    mutationFn: async (nextIds: string[]) => {
      console.log('[favorites] saving favorites', nextIds);
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(nextIds));
      return nextIds;
    },
  });

  useEffect(() => {
    if (favoritesQuery.data) {
      setFavoriteIds(favoritesQuery.data);
    }
  }, [favoritesQuery.data]);

  const isFavorite = useCallback(
    (spotId: string) => {
      return favoriteIds.includes(spotId);
    },
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    (spotId: string) => {
      setFavoriteIds((current) => {
        const exists = current.includes(spotId);
        const nextIds = exists
          ? current.filter((id) => id !== spotId)
          : [...current, spotId];

        console.log('[favorites] toggling favorite', {
          spotId,
          exists,
          nextIds,
        });
        saveFavoritesMutation.mutate(nextIds);
        void Haptics.selectionAsync();
        return nextIds;
      });
    },
    [saveFavoritesMutation]
  );

  return useMemo(
    () => ({
      favoriteIds,
      isReady: !favoritesQuery.isLoading,
      isFavorite,
      toggleFavorite,
    }),
    [favoriteIds, favoritesQuery.isLoading, isFavorite, toggleFavorite]
  );
});
