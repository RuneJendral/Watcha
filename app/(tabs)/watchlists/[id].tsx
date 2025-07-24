import WatchlistMovieCard from '@/components/WatchlistView/WatchlistMovieCard';
import { images } from '@/constants/images';
import { getMoviesWatchlist } from '@/services/appwrite';
import useFetch from '@/services/useFetch';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, Image, ScrollView, Text, View } from 'react-native';


const WatchlistCollection = () => {
  const { id } = useLocalSearchParams();

  const {
    data: watchlistMovies,
    loading: watchlistLoading,
    error: watchlistError,
    refetch: refetchWatchlistMovies
  } = useFetch(() => getMoviesWatchlist(id as string), true, [id]);

  useFocusEffect(
  useCallback(() => {
    refetchWatchlistMovies();
  }, [id])
);

  const renderMovie = ({ item }: any) => (
    <WatchlistMovieCard
      $id={item.movie_id}
      title={item.title}
      poster_url={item.poster_url} 
      watchlistIds={item.watchlist_ids} 
      movie_id={item.movie_id} 
      createdAt={item.createdAt}    
      />
  );

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full y-0"/>
      
      <ScrollView className="flex-1 px-5 item-center" showsVerticalScrollIndicator={false} contentContainerStyle={{minHeight: "100%", paddingBottom: 10}}>
        <Text className="text-lg text-white font-bold mb-3 mt-10">Watchlist Name</Text>
      
        {watchlistLoading ? (
            <ActivityIndicator
                      size="large"
                      color="#0000ff"
                      className="mt-10 self-center"
                    />
        ) : watchlistError ? (
          <Text>Error: {watchlistError?.message}</Text>
        ) : (
          <FlatList
            scrollEnabled={false}
            data={watchlistMovies}
            numColumns={3}
            keyExtractor={(item) => item.$id}
            renderItem={renderMovie}
            contentContainerStyle={{ paddingBottom: 20, paddingTop: 10, gap: 16 }}
            columnWrapperStyle={{justifyContent: 'flex-start', gap: 15, paddingRight: 5, marginBottom: 10,  marginLeft: 2,}}
            className="mt-2 pb-32 "
              ListHeaderComponent={
              <Text className="text-lg text-white font-bold mb-3 mt-10">Watchlist:</Text>
            }
          />
        )}
      </ScrollView>
    </View>
  );
};

export default WatchlistCollection;
