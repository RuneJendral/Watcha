import { addUserToWatchlistWithUserName, getWatchlistMembers } from '@/services/appwrite';
import { ManageMembersProps, WatchlistMember } from '@/type';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, KeyboardAvoidingView, Modal, Platform, Pressable, Text, TouchableOpacity, View } from 'react-native';
import DialogModal from '../basicModals/DialogModal';
import CustomButton from '../CustomButton';
import CustomInput from '../CustomInput';

const WatchlistMemberModal : React.FC<ManageMembersProps> =  ({ visible, watchlistId, onClose })  => { 
  const [watchlistMembers, setWatchlistMembers] = useState<WatchlistMember[]>([]);
  const [loading, setLoading] = useState(true);

  //Add Member
  const [form, setForm] = useState({username: ''});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogModalVisible, setDialogModalVisible] = useState(false);
  const [confirmText, setConfirmText] = useState("");

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

  const handleAddMember = async (watchlistId: string) => {
    const {username} = form;

    if(!username){
        setConfirmText("Please enter valid email");
        setDialogModalVisible(true);
        return;
    }

    setIsSubmitting(true)

    try {
        const canAdd = await addUserToWatchlistWithUserName(watchlistId, username, false);

        setConfirmText(canAdd ? `Added ${username} to watchlist` : `${username} not found or already added`);
        setDialogModalVisible(true);

        setForm((prev) => ({ ...prev, username: ""}));

        onClose(); 
    } catch (e) {
        setConfirmText(`could not add ${username}`);
        setDialogModalVisible(true);
        console.error('Could not add member to watchlist', e);
    } finally {
        setIsSubmitting(false);
    }
  };

  const getUserAvatar = (item: WatchlistMember, scale: number) => {
    return `${item?.avatar}?name=${encodeURIComponent(item?.name ?? 'User')}&width=${scale}&height=${scale}`;
  }

  const renderItem = ({ item }: { item: WatchlistMember }) => (

    <TouchableOpacity className="bg-light-200 rounded-xl my-2 px-4 py-1.5 flex-row items-center">
      <Image
        source={{ uri: getUserAvatar(item, 32)}}
        className="w-10 h-10 rounded-full mr-4"
        resizeMode="cover"
      />
      <Text className="text-black font-semibold text-base">{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 justify-center items-center">

    <DialogModal
      text={confirmText}
      visible={dialogModalVisible}
      onClose={() => setDialogModalVisible(false)}
    />

    <Modal visible={visible} animationType="fade" onRequestClose={onClose} transparent statusBarTranslucent={true} navigationBarTranslucent={true}>
      <Pressable className="flex-1 justify-center items-center bg-black/40" onPress={onClose}>
        <Pressable className="bg-dark-100 rounded-2xl p-6 w-72 max-h-[60%] shadow-lg" onPress={(e) => e.stopPropagation()}>

          <KeyboardAvoidingView behavior={'padding'} keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
              <CustomInput 
                  placeholder="username" 
                  value={form.username} 
                  onChangeText={(text) => setForm((prev) => ({ ...prev, username: text}))} 
                  label="Add Member" 
                  keyboardType="email-address"
              />

              <CustomButton 
                  title="add to Watchlist"
                  isLoading={isSubmitting}
                  onPress={() => handleAddMember(watchlistId)}
                  style={"items-center rounded-lg p-2 mt-2"}
                  textStyle={"text-white font-bold text-base"}
              />
          </KeyboardAvoidingView>

          <Text className="text-start text-base font-bold text-white mt-4">Watchlist Members:</Text>

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
    </View>
  );
};

export default WatchlistMemberModal