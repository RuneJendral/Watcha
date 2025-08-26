import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';


const WatchlistVoting = () => {
   
  const { id, selected } = useLocalSearchParams<{ id: string; selected?: string }>();

  const movieIds = React.useMemo<string[]>(() => {
    try {
      return selected ? JSON.parse(String(selected)) : [];
    } catch {
      return [];
    }
  }, [selected]);

  return (
   <View className="bg-primary flex-1 pb-10">
      <Text className="text-white p-4">
        Voting for watchlist {id}. Movies: {movieIds.join(', ') || 'none'}
      </Text>
    </View>
  )
}

export default WatchlistVoting