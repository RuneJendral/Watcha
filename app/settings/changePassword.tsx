import DialogModal from '@/components/basicModals/DialogModal';
import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import { changePassword, logOut } from '@/services/appwrite';
import useAuthStore from '@/store/auth.store';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

const changePasswordSetting = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({oldPassword: '',  newPassword: '', repeatPassword: ''});
    const [dialogModalVisible, setDialogModalVisible] = useState(false);
    const [confirmText, setConfirmText] = useState("");

    const submit = async () => {
        const {oldPassword, newPassword, repeatPassword} = form;

        if(!oldPassword || !newPassword || !repeatPassword){
            setConfirmText("Please enter a valid password");
            setDialogModalVisible(true);
            return;
        }

        if(newPassword !== repeatPassword){
            setConfirmText("Please repeat the same new Password");
            setDialogModalVisible(true);
            return;
        }

        setIsSubmitting(true)

        try{
            await changePassword({newPassword, oldPassword});
            await logOut();
            useAuthStore.getState().setIsAuthenticated(false);
            useAuthStore.getState().setUser(null); 
            router.replace('/sign-in');
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
                <Text className="font-bold text-white">Change Password</Text>
            </View>

            <CustomInput 
                placeholder="Enter your new Password" 
                value={form.newPassword} 
                onChangeText={(text) => setForm((prev) => ({ ...prev, newPassword: text}))} 
                label="new Password" 
                secureTextEntry={true}
            />

            <CustomInput 
                placeholder="Repeat your new Password" 
                value={form.repeatPassword} 
                onChangeText={(text) => setForm((prev) => ({ ...prev, repeatPassword: text}))} 
                label="repeat Password" 
                secureTextEntry={true}
            />

            <CustomInput 
                placeholder="Enter your Password" 
                value={form.oldPassword} 
                onChangeText={(text) => setForm((prev) => ({ ...prev, oldPassword: text}))} 
                label="Password" 
                secureTextEntry={true}
            />

            <CustomButton 
                title="Change Password"
                isLoading={isSubmitting}
                onPress={submit}
                style={"py-4 px-4"}               
            />
        </View>
    )
}

export default changePasswordSetting