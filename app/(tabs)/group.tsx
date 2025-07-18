import WatchlistCard from '@/components/WatchlistCard'
import { icons } from '@/constants/icons'
import { images } from '@/constants/images'
import { getWatchlists } from '@/services/appwrite'
import useFetch from '@/services/useFetch'
import React from 'react'
import { ActivityIndicator, FlatList, Image, ScrollView, Text, View } from 'react-native'

const group = () => {

  const {data: watchlists, loading: watchlistsLoading, error: watchlistsError} = useFetch(getWatchlists, true, []);

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full y-0"/>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} contentContainerStyle={{minHeight: "100%", paddingBottom: 10}}>
        <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto"/>

        {watchlistsLoading ? (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            className="mt-10 self-center"
          />
        ) : watchlistsError ? (
          <Text>Error: {watchlistsError?.message}</Text>
        ) : (
          <View className="flex-1 mt-5">

            {watchlists && (
              <View className="mt-10">
                <Text className="text-lg text-white font-bold mb-3">Watchlists</Text>
              </View>
            )}


            <>

              <FlatList 
                data={Array.isArray(watchlists) ? watchlists : []}
                renderItem={({ item }) => (
                  <WatchlistCard name={item.name} id={item.id}/>
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

        
        <View className="mt-10">
          <Text className="text-lg text-white font-bold mb-3">Watchlists</Text>
        </View>
        

      </ScrollView>
    </View>
  )
}

export default group