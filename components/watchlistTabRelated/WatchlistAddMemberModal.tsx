import { addUserToWatchlistWithMail } from '@/services/appwrite';
import { ManageMembersProps } from '@/type';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, SafeAreaView, ScrollView } from 'react-native';
import CustomButton from '../CustomButton';
import CustomInput from '../CustomInput';
import DialogModal from '../basicModals/DialogModal';

const WatchlistMemberModal : React.FC<ManageMembersProps> =  ({ visible, watchlistId, onClose })  => { 
  const [form, setForm] = useState({email: ''});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogModalVisible, setDialogModalVisible] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleAddMember = async (watchlistId: string) => {
    const {email} = form;

    if(!email){
        setConfirmText("Please enter valid email");
        setDialogModalVisible(true);
        return;
    }

    setIsSubmitting(true)

    try {
        const canAdd = await addUserToWatchlistWithMail(watchlistId, email, false);

        setConfirmText(canAdd ? `Added ${email} to watchlist` : `${email} not found or already added`);
        setDialogModalVisible(true);

        setForm((prev) => ({ ...prev, email: ""}));

        onClose(); 
    } catch (e) {
        setConfirmText(`could not add ${email}`);
        setDialogModalVisible(true);
        console.error('Could not add member to watchlist', e);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 justify-center items-center">

    <DialogModal
      text={confirmText}
      visible={dialogModalVisible}
      onClose={() => setDialogModalVisible(false)}
    />

    <Modal visible={visible} animationType="fade" onRequestClose={onClose} transparent statusBarTranslucent={true} navigationBarTranslucent={true}>
      <Pressable className="flex-1 justify-center items-center bg-black/40" onPress={onClose}>
        <Pressable className="bg-dark-100 rounded-2xl p-6 w-72 max-h-[60%] shadow-lg" onPress={(e) => e.stopPropagation()}>
          <KeyboardAvoidingView behavior={'padding'} keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }} keyboardShouldPersistTaps="handled">
              <CustomInput 
                  placeholder="User E-Mail" 
                  value={form.email} 
                  onChangeText={(text) => setForm((prev) => ({ ...prev, email: text}))} 
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
            </ScrollView>
          </KeyboardAvoidingView>
        </Pressable>
      </Pressable>
    </Modal>

    </SafeAreaView>
  );
};

export default WatchlistMemberModal