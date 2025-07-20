import { getWatchlistMovies } from '@/services/appwrite';
import useFetch from '@/services/useFetch';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';

const watchlistCollection = () => {

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { id } = useLocalSearchParams();

  const {data: watchlistMovies, loading: watchlistLoading, error: watchlistError} = useFetch(() => getWatchlistMovies(id as string), true, [id]);

  return (
    <View className="bg-primary flex-1">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} contentContainerStyle={{minHeight: "100%", paddingBottom: 10}}>
       
      </ScrollView>
    </View>
  )
}

export default watchlistCollection