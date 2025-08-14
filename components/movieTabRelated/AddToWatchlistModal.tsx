import { addMovieToWatchlist, getUserWatchlists, getWatchlistName } from '@/services/appwrite';
import { AddToWatchlistProps, Watchlist } from '@/type';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import DialogModal from '../basicModals/DialogModal';

const AddToWatchlistModal: React.FC<AddToWatchlistProps> = ({ visible, onClose, onSelectWatchlist, movie }) => {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogModalVisible, setDialogModalVisible] = useState(false);
  const [confirmText, setConfirmText] = useState("");

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
    const canAdd = await addMovieToWatchlist(watchlistId, movie.id.toString(), movie);
    const watchlistName = await getWatchlistName(watchlistId);

    setConfirmText(canAdd ? `Added ${movie.title} to ${watchlistName}` : `${movie.title} is already in ${watchlistName}`);
    setDialogModalVisible(true);
    onSelectWatchlist(watchlistId);
    onClose(); 

  } catch (e) {
    console.error('Could not add movie to watchlist', e);
    setConfirmText(`could not add ${movie.title} to watchlist`);
    setDialogModalVisible(true);
  }
};

  const renderItem = ({ item }: { item: Watchlist }) => (
    <TouchableOpacity className="bg-light-200 rounded-lg px-3 py-3 my-1" onPress={() => handleAddMovie(item.id)}>
      <Text className="text-black font-semibold">{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 justify-center items-center">

      <DialogModal
        text={confirmText}
        visible={dialogModalVisible}
        onClose={() => setDialogModalVisible(false)}
      />

      <Modal visible={visible} animationType="fade" onRequestClose={onClose} transparent statusBarTranslucent={true} navigationBarTranslucent={true}>
        <Pressable className="flex-1 bg-black/40 justify-center items-center" onPress={onClose}>
          <Pressable className="bg-dark-100 rounded-2xl p-6 w-72 max-h-[45%] shadow-lg" onPress={(e) => e.stopPropagation()}>
            <Text className="text-start text-base text-white mb-4">Add to Watchlist</Text>

                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <FlatList
                    data={watchlists}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    ItemSeparatorComponent={() => <View className="h-2" />}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 8 }}
                    removeClippedSubviews
                  />
                )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default AddToWatchlistModal