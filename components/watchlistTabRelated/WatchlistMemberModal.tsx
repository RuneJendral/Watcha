import { getWatchlistMembers } from '@/services/appwrite';
import { ManageMembersProps, WatchlistMember } from '@/type';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, KeyboardAvoidingView, Modal, Platform, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

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
    <KeyboardAvoidingView className="bg-primary" behavior={'padding'} keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
          <View className="flex-1 justify-center items-center ">
            <View className="bg-dark-100 rounded-2xl p-6 w-72 max-h-[60%] shadow-lg">

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

              <TouchableOpacity onPress={onClose} className="mt-4 bg-accent rounded-lg p-2">
                <Text className="text-white text-center font-semibold">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default WatchlistMemberModal