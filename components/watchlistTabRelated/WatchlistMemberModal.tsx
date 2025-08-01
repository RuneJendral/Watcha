import { addUserToWatchlistWithMail, getWatchlistMembers } from '@/services/appwrite';
import { ManageMembersProps, WatchlistMember } from '@/type';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Modal, Platform, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import CustomInput from '../CustomInput';

const WatchlistMemberModal : React.FC<ManageMembersProps> =  ({ visible, watchlistId, onClose })  => { 
  const [watchlistMembers, setWatchlistMembers] = useState<WatchlistMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({email: ''});
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleAddMember = async (watchlistId: string) => {
    const {email} = form;

    if(!email){
        return Alert.alert('Error', 'Please enter valid email');
    }

    setIsSubmitting(true)

    try {
      await addUserToWatchlistWithMail(watchlistId, email, false);
      onClose(); 
    } catch (e) {
      console.error('Could not add member to watchlist', e);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <View className="flex-1 justify-center items-center bg-black/20">
            <View className="bg-dark-100 rounded-2xl p-6 w-72 max-h-[60%] shadow-lg">
              <CustomInput 
                  placeholder="User E-Mail" 
                  value={form.email} 
                  onChangeText={(text) => setForm((prev) => ({ ...prev, email: text}))} 
                  label="Add Member" 
                  keyboardType="email-address"
              />
              <TouchableOpacity className="bg-accent items-center rounded-lg p-2 mt-2" onPress={() => handleAddMember(watchlistId)}>
                <Text className="text-white font-bold text-base">add to Watchlist</Text>
              </TouchableOpacity>

              <Text className="text-start text-base text-white mb-4 mt-4">Watchlist Members</Text>

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