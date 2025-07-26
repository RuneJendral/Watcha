import { getUserWatchlists } from '@/services/appwrite';
import { CreateWatchlistProps, Watchlist } from '@/type';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

const WatchlistMemberModal : React.FC<CreateWatchlistProps & { refetchWatchlists: () => void }> = ({ visible, onClose, refetchWatchlists }) => { 
   const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchWatchlists = async () => {
      try {
        setLoading(true);
        const result = await getUserWatchlists(); 
        setWatchlists(result ?? []);
      } catch (error) {
        console.error('could not load watchlist', error);
      } finally {
        setLoading(false);
      }
    };

    if (visible) fetchWatchlists(); 
  }, [visible]);

  const handleAddMovie = async (watchlistId: string) => {
  try {

    onClose(); 
  } catch (e) {
    console.error('Could not add movie to watchlist', e);
  }
};

  const renderItem = ({ item }: { item: Watchlist }) => (
    <TouchableOpacity className="bg-light-200 rounded-lg my-2" onPress={() => handleAddMovie(item.id)}>
        <View className="p-2">
            <Text className="text-black font-bold">{item.name}</Text>
        </View>
    </TouchableOpacity>
  );


  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-white">
      <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
        <View className="flex-1 justify-center items-center bg-black/20">
          <View className="bg-dark-100 rounded-2xl p-6 w-72 max-h-[40%] shadow-lg">
            <Text className="text-start text-base text-white mb-4">Add to Watchlist</Text>

                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <FlatList
                    data={watchlists}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    ItemSeparatorComponent={() => <View className="h-2" />}
                    scrollEnabled={true}
                    contentContainerStyle={{ paddingBottom: 10 }}
                  />
                )}

            <TouchableOpacity onPress={onClose} className="mt-4 bg-accent rounded-lg p-2">
              <Text className="text-white text-center font-semibold">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default WatchlistMemberModal