import DialogModal from '@/components/basicModals/DialogModal';
import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import { changeName } from '@/services/appwrite';
import useAuthStore from '@/store/auth.store';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

const changeNameSetting = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({name: ''});
    const user = useAuthStore((state) => state.user);
    const [dialogModalVisible, setDialogModalVisible] = useState(false);
    const [confirmText, setConfirmText] = useState("");

    const submit = async () => {
        const {name} = form;

        if(!name){
            setConfirmText("Please enter a valid Name");
            setDialogModalVisible(true);
            return;
        }

        setIsSubmitting(true)

        try{
            await changeName({name});
            await useAuthStore.getState().fetchAuthenticatedUser();
            router.replace('/');
        } catch(error: any){
            setConfirmText(error.message);
            setDialogModalVisible(true);
        } finally {
            setIsSubmitting(false);
        }
    }


  return (
         <View className="gap-10 p-5 mt-5">

            <DialogModal
                text={confirmText}
                visible={dialogModalVisible}
                onClose={() => setDialogModalVisible(false)}
            />

            <View className="flex flex-coloumn items-start justify-between">
                <Text className="font-bold text-white">Change User-Name</Text>
                <Text className="text-light-300">{user?.name}</Text>
            </View>

            <CustomInput 
                placeholder="Enter your new User-Name" 
                value={form.name} 
                onChangeText={(text) => setForm((prev) => ({ ...prev, name: text}))} 
                label="new User-Name" 
                keyboardType="email-address"
            />

            <CustomButton 
                title="Change User-Name"
                isLoading={isSubmitting}
                onPress={submit}
                style={"py-4 px-4"}                
            />
        </View>
  )
}

export default changeNameSetting