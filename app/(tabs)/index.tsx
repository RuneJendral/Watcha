import MovieCard from "@/components/indexTabRelated/MovieCard";
import TrendingCard from "@/components/indexTabRelated/TrendingCard";
import { images } from "@/constants/images";
import { fetchMovies } from "@/services/api";
import { getTrendingMovies } from "@/services/appwrite";
import useFetch from "@/services/useFetch";
import { ActivityIndicator, FlatList, Image, ScrollView, Text, View } from "react-native";

export default function Index() {
  const {data: trendingMovies, loading: trendingLoading, error: trendingError} = useFetch(getTrendingMovies, true, []);

  const{data: movies, loading: moviesLoading, error: moviesError} = useFetch(() => fetchMovies({query: ''}), true, [])
  const trimmedMovies = movies?.slice(0, movies.length - (movies.length % 3));

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full y-0"/>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} contentContainerStyle={{minHeight: "100%", paddingBottom: 10}}>
       
        {moviesLoading || trendingLoading ? (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            className="mt-10 self-center"
          />
        ) : moviesError || trendingError ? (
          <Text>Error: {moviesError?.message || trendingError?.message}</Text>
        ) : (
          <View className="flex-1 mt-5">

            {trendingMovies && (
              <View className="mt-10">
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
        )}


        
      </ScrollView>

    </View>
  );
}
