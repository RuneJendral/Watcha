import { addUserToWatchlistWithMail } from '@/services/appwrite';
import { ManageMembersProps } from '@/type';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import CustomInput from '../CustomInput';

const WatchlistMemberModal : React.FC<ManageMembersProps> =  ({ visible, watchlistId, onClose })  => { 
  const [form, setForm] = useState({email: ''});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        Alert.alert('Could not add member to watchlist');
        console.error('Could not add member to watchlist', e);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView className="bg-primary" behavior={'padding'} keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
          <View className="flex-1 justify-center items-center ">
            <View className="bg-dark-100 rounded-2xl p-6 w-72 max-h-[60%] shadow-lg">
              <CustomInput 
                  placeholder="User E-Mail" 
                  value={form.email} 
                  onChangeText={(text) => setForm((prev) => ({ ...prev, email: text}))} 
                  label="Add Member" 
                  keyboardType="email-address"
              />
              <TouchableOpacity className="bg-accent items-center rounded-lg p-2 mt-2" onPress={() => handleAddMember(watchlistId)}>
                {isSubmitting ? (
                    <ActivityIndicator size="small" color="white"/>
                ):(
                   <Text className="text-white font-bold text-base">add to Watchlist</Text>
                )}
              </TouchableOpacity>

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