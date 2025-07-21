import AddToWatchlistModal from '@/components/AddToWatchlistModal';
import { icons } from '@/constants/icons';
import { fetchMovieDetails } from '@/services/api';
import useFetch from '@/services/useFetch';
import { MovieInfoProps } from '@/type';
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MovieInfo = ({label, value }: MovieInfoProps) => (
  <View className="flex-col items-start justify-center mt-5">
    <Text className="text-light-200 font-normal text-sm">{label}</Text>
    <Text className="text-light-100 font-bold text-sm mt-2">{value || 'N/A'}</Text>
  </View>
)

const movieDetails = () => {

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { id } = useLocalSearchParams();

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const {data: movie} = useFetch(() =>
    fetchMovieDetails(id as string), true, [id]
  );
  
  const CreateDate = (date: string) => {
      const dates:string[] = ["", "Jan.", "Feb. ", "Mar. ", "Apr. ", "May ", "Jun. ", "Jul. ", "Aug. ", "Sep. ", "Oct. ", "Nov. ", "Dec. "];
      const dateName:string = dates[parseInt(date.split('-')[1])] + date?.split('-')[0];

    return (dateName)
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [modalVisible, setModalVisible] = useState(false);
  
  return (
    <SafeAreaView className="bg-primary flex-1 pb-4">
      <ScrollView contentContainerStyle={{paddingBottom: 80}}>
        
        {movie && (
          <AddToWatchlistModal
              visible={modalVisible}
              movie={movie}
              onClose={() => setModalVisible(false)}
              onSelectWatchlist={(id) => {
                setModalVisible(false);
              }}
            />
          )}
        
          <View>
            <Image source={{ uri: `https://image.tmdb.org/t/p/w500${movie?.poster_path}`}} className="w-full h-[550px]" resizeMode="stretch"/>
          </View>

          <View className="flex-col items-start justify-center mt-5 px-5">


            <Text className="text-white font-bold text-xl">{movie?.title}</Text>

            <View className="flex-row items-center gap-x-1 mt-2">
              <Text className="text-light-200 text-sm">{movie?.release_date ? CreateDate(movie.release_date) : 'N/A'}</Text>
              <Text className="text-light-200 text-sm">{movie?.runtime}m</Text>
            </View>

            <View className="flex-row justify-between items-center w-full mt-2">
              <View className="flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1">
                <Image source={icons.star} className="size-4"/>
                <Text className="text-white font-bold text-base">{Math.round(movie?.vote_average ?? 0)}/10</Text>
                <Text className="text-light-200 text-sm">({movie?.vote_count} votes)</Text>
              </View>

              <View>
                <TouchableOpacity className="flex-row rounded-md bg-accent items-center px-2 py-1 gap-x-1" onPress={() => setModalVisible(true)}>
                  <Image source={icons.add} className="size-4"/>
                  <Text className="text-white font-bold text-base">add to Watchlist</Text>
                </TouchableOpacity>
              </View>

            </View>

            <MovieInfo label="Overview" value={movie?.overview}/>
            <MovieInfo label="Genres" value={movie?.genres?.map((g) => g.name).join(' - ') || 'N/A'}/>

            <View className="flex flex-row justify-between w-1/2">
              <MovieInfo label="Budget" value={`$${movie?.budget! / 1_000_000} million`}/>
              <MovieInfo label="Revenue" value={`$${Math.round(movie?.revenue! / 1_000_000)} million`}/>
            </View>

            <MovieInfo label="Production Companies" value={movie?.production_companies.map((c) => c.name).join(' - ') || 'N/A'}/>

          </View> 
      </ScrollView>
    </SafeAreaView>
  )
}

export default movieDetails