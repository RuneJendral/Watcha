import WatchlistMovieCard from '@/components/groupTabRelated/WatchlistMovieCard';
import WatchlistAddMemberModal from '@/components/watchlistTabRelated/WatchlistAddMemberModal';
import WatchlistMemberModal from '@/components/watchlistTabRelated/WatchlistMemberModal';
import { icons } from '@/constants/icons';
import { images } from '@/constants/images';
import { getMoviesWatchlist, getWatchlistName, removeMovieFromWatchlist } from '@/services/appwrite';
import useFetch from '@/services/useFetch';
import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';


const WatchlistCollection = () => {
  const { id } = useLocalSearchParams();
  const [selectedMovies, setSelectedMovies] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [watchlistName, setWatchlistName] = useState<string | undefined>();
  const [modalVisible, setModalVisible] = useState(false);
  const [addMemberModalVisible, setAddMemberModalVisible] = useState(false);


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
 
  const handleVotingSelected = async () => {

  }

  useEffect(() => {
    const fetchWatchlistName = async () => {
      if (id) {
        const name = await getWatchlistName(id as string);
        setWatchlistName(name);
      }
    };

    fetchWatchlistName();
  }, [id]);

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
      
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} contentContainerStyle={{minHeight: "100%", paddingBottom: 10}}>

        <WatchlistMemberModal
            visible={modalVisible}
            watchlistId={id as string}
            onClose={() => setModalVisible(false)}
        />

        <WatchlistAddMemberModal
          visible={addMemberModalVisible}
          watchlistId={id as string}
          onClose={() => setAddMemberModalVisible(false)}
        />

        <View className="flex-row items-center justify-between pt-20 mb-3">
          <View className="flex-row items-center space-x-2">
            <Text className="text-lg text-white font-bold">{watchlistName ?? 'loading watchlist...'}</Text>
          </View>

          <View className="flex-row items-center">

             <TouchableOpacity className="mr-4" onPress={() => {setAddMemberModalVisible(true)}}>
              <Image source={icons.add} className="w-7 h-7" resizeMode="contain" />
            </TouchableOpacity>

            <TouchableOpacity className="mr-4" onPress={() => {setModalVisible(true)}}>
              <Image source={icons.groupHighlight} className="w-7 h-7" resizeMode="contain" />
            </TouchableOpacity>

          </View>
        </View>

        {selectionMode && (
          <View className="my-1">
            <TouchableOpacity className="bg-red-600 py-2 rounded-xl items-center mb-3"onPress={handleDeleteSelected}>
              <Text className="text-white font-bold">Delete {selectedMovies.length} Movies</Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-accent py-2 rounded-xl items-center mb-3"onPress={handleVotingSelected}>
              <Text className="text-white font-bold">Start Voting with {selectedMovies.length} Movies</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={clearSelection} className="mt-2 items-center">
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
            className="pb-32 "
              ListHeaderComponent={
              <Text className="text-lg text-white font-bold mb-3 mt-10">Watchlist:</Text>
            }
          />
        )}
      </ScrollView>

      {watchlistLoading && (
        <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center bg-primary z-50">
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

    </View>
  );
};

export default WatchlistCollection;
