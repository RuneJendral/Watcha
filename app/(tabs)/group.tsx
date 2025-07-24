import CreateWatchlistCard from '@/components/WatchlistCreation/CreateWatchlistCard'
import WatchlistCard from '@/components/WatchlistView/WatchlistCard'
import { icons } from '@/constants/icons'
import { images } from '@/constants/images'
import { getUserWatchlists } from '@/services/appwrite'
import useFetch from '@/services/useFetch'
import { WatchlistProps } from '@/type'
import React from 'react'
import { ActivityIndicator, FlatList, Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native'

const group = () => {

  type WatchlistItem = 
  | { type: 'create' }
  | (WatchlistProps & { type: 'watchlist' });

  // eslint-disable-next-line react-hooks/rules-of-hooks
 const {data: watchlists, loading: watchlistsLoading, error: watchlistsError, refetch: refetchWatchlist} = useFetch(getUserWatchlists, true, []);

 const extendedWatchlists: WatchlistItem[] = [
  { type: 'create' },
  ...(Array.isArray(watchlists) ? watchlists.map(w => ({ ...w, type: 'watchlist' as const })) : [])
];


  return (
    <KeyboardAvoidingView className="flex-1 bg-primary" behavior={'padding'} keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
        <Image source={images.bg} className="absolute w-full y-0"/>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} contentContainerStyle={{minHeight: "100%", paddingBottom: 10}}>
        <Image source={icons.logo} className="w-10 h-10 mt-20 mb-5 mx-auto"/>

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
                data={extendedWatchlists}
                renderItem={({ item }) => {
                    if (item.type === 'create') {
                      return <CreateWatchlistCard refetchWatchlists={refetchWatchlist}/>;
                    }

                    return <WatchlistCard name={item.name} id={item.id} />;
                }}
                keyExtractor={(item, index) => item.type === 'watchlist' ? item.id.toString() : `create-${index}`}
                numColumns={2}
                columnWrapperStyle={{justifyContent: 'flex-start', gap: 20, paddingRight: 5, marginBottom: 20}}
                className="mt-2 pb-32"
                scrollEnabled={false}>
               </FlatList>
            </>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default group