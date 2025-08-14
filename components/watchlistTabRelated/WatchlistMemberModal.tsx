import { getWatchlistMembers } from '@/services/appwrite';
import { ManageMembersProps, WatchlistMember } from '@/type';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Modal, Pressable, Text, TouchableOpacity } from 'react-native';

const WatchlistMemberModal : React.FC<ManageMembersProps> =  ({ visible, watchlistId, onClose })  => { 
  const [watchlistMembers, setWatchlistMembers] = useState<WatchlistMember[]>([]);
  const [loading, setLoading] = useState(true);
  const defaultAvatar = 'https://www.gravatar.com/avatar/?d=mp';

  useEffect(() => {
      const fetchWatchlists = async () => {
      try {
        setLoading(true);
        const result = await getWatchlistMembers(watchlistId); 
        setWatchlistMembers(result ?? []);
      } catch (error) {
        console.error('could not load watchlist members', error);
      } finally {
        setLoading(false);
      }
    };

    if (visible) fetchWatchlists(); 
  }, [visible]);

  const renderItem = ({ item }: { item: WatchlistMember }) => (
    <TouchableOpacity className="bg-light-200 rounded-xl my-2 px-4 py-1.5 flex-row items-center">
      <Image
        source={{ uri: item.avatar || defaultAvatar }}
        className="w-10 h-10 rounded-full mr-4"
        resizeMode="cover"
      />
    <Text className="text-black font-semibold text-base">{item.name}</Text>
  </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose} transparent statusBarTranslucent={true} navigationBarTranslucent={true}>
      <Pressable className="flex-1 justify-center items-center bg-black/40" onPress={onClose}>
        <Pressable className="bg-dark-100 rounded-2xl p-6 w-72 max-h-[60%] shadow-lg" onPress={(e) => e.stopPropagation()}>
          <Text className="text-start text-base font-bold text-white mb-4 mt-4">Watchlist Members:</Text>

              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <FlatList
                  data={watchlistMembers}
                  keyExtractor={(item) => item.id}
                  renderItem={renderItem}
                  scrollEnabled={true}
                  contentContainerStyle={{ paddingBottom: 10 }}
                />
              )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default WatchlistMemberModal