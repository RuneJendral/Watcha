
import CreateWatchlistCard from '@/components/groupTabRelated/CreateWatchlistCard'
import WatchlistCard from '@/components/groupTabRelated/WatchlistCard'
import { images } from '@/constants/images'
import { deleteWatchlist, getUserWatchlists } from '@/services/appwrite'
import useFetch from '@/services/useFetch'
import { WatchlistProps } from '@/type'
import { router } from 'expo-router'
import React, { useCallback, useState } from 'react'
import { ActivityIndicator, FlatList, Image, KeyboardAvoidingView, Platform, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native'

const group = () => {

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [selectedWatchlists, setSelectedWatchlists] = useState<string[]>([]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [selectionMode, setSelectionMode] = useState(false);

  type WatchlistItem = 
  | { type: 'create' }
  | (WatchlistProps & { type: 'watchlist' });

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const {data: watchlists, loading: watchlistsLoading, error: watchlistsError, refetch: refetchWatchlist} = useFetch(getUserWatchlists, true, []);

  const extendedWatchlists: WatchlistItem[] = [
    { type: 'create' },
    ...(Array.isArray(watchlists) ? 
    watchlists.map(w => ({
      ...w,
      type: 'watchlist' as const,
      selected: selectedWatchlists.includes(w.id),
    })) 
    : [])
  ];

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchWatchlist();
    } finally {
      setRefreshing(false);
    }
  }, [refetchWatchlist]);

  const toggleSelection = (id: string) => {
    if (selectedWatchlists.includes(id)) {
      setSelectedWatchlists(prev => prev.filter(w => w !== id));
    } else {
      setSelectedWatchlists(prev => [...prev, id]);
    }
  };

  const handleLongPress = (id: string) => {
    setSelectionMode(true);
    toggleSelection(id);
  };

  const clearSelection = () => {
    setSelectionMode(false);
    setSelectedWatchlists([]);
  };

  const handleDeleteSelected = async () => {
    for (const watchlistId of selectedWatchlists) {
      await deleteWatchlist(watchlistId);
  }

  clearSelection();

  setTimeout(() => { //timeout because appwrite is not so fast in deleting the selected watchlists
    refetchWatchlist();
  }, 600);
}

  return (
    <KeyboardAvoidingView className="flex-1 bg-primary" behavior={'padding'} keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
      <Image source={images.bg} className="absolute w-full y-0"/>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} contentContainerStyle={{minHeight: "100%", paddingBottom: 10}} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff"/>
      }>
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

            {selectionMode && (
              <View className="my-4">
                <TouchableOpacity
                  className="bg-red-600 py-2 rounded-xl items-center"
                  onPress={handleDeleteSelected} 
                >
                  <Text className="text-white font-bold">Delete {selectedWatchlists.length} Watchlists</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={clearSelection}
                  className="mt-2 items-center"
                >
                  <Text className="text-white underline">Cancel</Text>
                </TouchableOpacity>
              </View>
            )}

            <>
              <FlatList 
                data={extendedWatchlists}
                renderItem={({ item }) => {
                    if (item.type === 'create') {
                      return <CreateWatchlistCard refetchWatchlists={refetchWatchlist} inSelectionMode={selectionMode}/>;
                    }

                    return (
                      <WatchlistCard
                        name={item.name}
                        id={item.id}
                        selected={selectedWatchlists.includes(item.id)}
                        onLongPress={() => handleLongPress(item.id)}
                        onPress={() =>
                          selectionMode
                            ? toggleSelection(item.id)
                            : router.push(`/(tabs)/watchlists/${item.id}`)
                        }
                      />
                    );
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
