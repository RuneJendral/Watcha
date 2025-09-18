import MovieCard from "@/components/indexTabRelated/MovieCard";
import TrendingCard from "@/components/indexTabRelated/TrendingCard";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { fetchMovies } from "@/services/api";
import { getTrendingMovies } from "@/services/appwrite";

import useFetch from "@/services/useFetch";
import { FlatList, Image, ScrollView, Text, View } from "react-native";

export default function Index() {
  const{data: movies, loading: moviesLoading, error: moviesError} = useFetch(() => fetchMovies({query: ''}), true, [])
  const trimmedMovies = movies?.slice(0, movies.length - (movies.length % 3));
  const {data: trendingMovies, loading: trendingLoading, error: trendingError} = useFetch(getTrendingMovies, true, []);

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full y-0"/>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} contentContainerStyle={{minHeight: "100%", paddingBottom: 10}}>

          <View className="mt-14 flex-row items-center">
            <Text className="text-3xl text-white font-bold mr-2">Watcha</Text>
            <Image source={icons.logo} className="w-8 h-8" resizeMode="contain" />
          </View>

          <View className="flex-1 mt-10">
             <>
              {trendingMovies && (
                <View className="mt-5">
                  <Text className="text-lg text-white font-bold mb-3">Search Trends</Text>
                </View>
              )}

              <>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  ItemSeparatorComponent={() => <View className="w-4"/>}
                  className="mb-4 mt-3"
                  data={trendingMovies}
                  renderItem={({ item, index }) => (
                    <TrendingCard movie={item} index={index}/>
                  )}
                  keyExtractor={(item) => item.movie_id.toString()}

                />
                </>
          
              <Text className="text-lg text-white font-bold mt-5 mb-3">Popular Movies</Text>

              <FlatList 
                data={Array.isArray(trimmedMovies) ? trimmedMovies : []}
                renderItem={({ item }) => (
                  <MovieCard 
                    {... item}
                  />
                )}
                keyExtractor={(item) => item.id.toString()}
                numColumns={3}
                columnWrapperStyle={{justifyContent: 'flex-start', gap: 18, paddingRight: 5, marginBottom: 10}}
                className="mt-2 pb-32"
                scrollEnabled={false}>
               </FlatList>
            </>
          </View>
        
      </ScrollView>

    </View>
  );
}
