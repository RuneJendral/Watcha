import WatchlistMovieCard from '@/components/groupTabRelated/WatchlistMovieCard';
import { images } from '@/constants/images';
import { getMoviesWatchlist, removeMovieFromWatchlist } from '@/services/appwrite';
import useFetch from '@/services/useFetch';
import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';


const WatchlistCollection = () => {
  const { id } = useLocalSearchParams();
  const [selectedMovies, setSelectedMovies] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

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

  const toggleSelection = (movieId: string) => {
    if (selectedMovies.includes(movieId)) {
      setSelectedMovies(prev => prev.filter(w => w !== movieId));
    } else {
      setSelectedMovies(prev => [...prev, movieId]);
    }

  };

  const handleLongPress = (movieId: string) => {
    setSelectionMode(true);
    toggleSelection(movieId);
  };

  const clearSelection = () => {
    setSelectionMode(false);
    setSelectedMovies([]);
  };

  const handleDeleteSelected = async () => {
    for (const movieId of selectedMovies) {
      await removeMovieFromWatchlist(id as string, movieId);
    }

      clearSelection();

    setTimeout(() => { //timeout because appwrite is not so fast in deleting the selected movies
      refetchWatchlistMovies();
    }, 600);
  }

  const renderMovie = ({ item }: any) => (
    <WatchlistMovieCard
      $id={item.movie_id}
      title={item.title}
      poster_url={item.poster_url} 
      watchlistIds={item.watchlist_ids} 
      movie_id={item.movie_id} 
      createdAt={item.createdAt}   
      selected={selectedMovies.includes(item.movie_id)} 
      onLongPress={() => handleLongPress(item.movie_id)}
      onPress={() =>
        selectionMode
          ? toggleSelection(item.movie_id)
          : router.push(`/(tabs)/movies/${item.movie_id}`)
      }
      />
  );

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full y-0"/>
      
      <ScrollView className="flex-1 px-5 item-center" showsVerticalScrollIndicator={false} contentContainerStyle={{minHeight: "100%", paddingBottom: 10}}>
        <Text className="text-lg text-white font-bold mb-3 mt-10">Watchlist Name</Text>

        {selectionMode && (
          <View className="my-4">
            <TouchableOpacity
              className="bg-red-600 py-2 rounded-xl items-center"
              onPress={handleDeleteSelected} 
            >
              <Text className="text-white font-bold">Delete {selectedMovies.length} Movies</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={clearSelection}
              className="mt-2 items-center"
            >
              <Text className="text-white underline">Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      
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
