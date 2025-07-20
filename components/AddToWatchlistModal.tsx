import { getUserWatchlists } from '@/services/appwrite';
import { AddToWatchlistProps, Watchlist } from '@/type';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import WatchlistModalCard from './WatchlistModalCard';

const AddToWatchlistModal: React.FC<AddToWatchlistProps> = ({ visible, onClose, onSelectWatchlist }) => {
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

  const renderItem = ({ item }: { item: Watchlist }) => (
    <TouchableOpacity onPress={() => onSelectWatchlist(item.id)}>
      <WatchlistModalCard id={item.id} name={item.name} />
    </TouchableOpacity>
  );


  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-white">
      <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
        <View className="flex-1 justify-center items-center bg-black/20">
          <View className="bg-white rounded-2xl p-6 w-72 shadow-lg">
            <Text className="text-start text-base text-black mb-4">Add to Watchlist</Text>

                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <FlatList
                    data={watchlists}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    ItemSeparatorComponent={() => <View className="h-2" />}
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

export default AddToWatchlistModal