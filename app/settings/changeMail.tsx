import DialogModal from '@/components/basicModals/DialogModal';
import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import { changeMail } from '@/services/appwrite';
import useAuthStore from '@/store/auth.store';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

const changeMailSetting = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({email: '',  password: ''});
    const user = useAuthStore((state) => state.user);
    const [dialogModalVisible, setDialogModalVisible] = useState(false);
    const [confirmText, setConfirmText] = useState("");

    const submit = async () => {
        const {email, password} = form;

        if(!email || !password){
            setConfirmText("Please enter valid e-mail or password");
            setDialogModalVisible(true);
            return;
        }

        setIsSubmitting(true)

        try{
            await changeMail({email, password});
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
                <Text className="font-bold text-white">Change E-Mail</Text>
                <Text className="text-light-300">{user?.email}</Text>
            </View>

            <CustomInput 
                placeholder="Enter your new E-Mail" 
                value={form.email} 
                onChangeText={(text) => setForm((prev) => ({ ...prev, email: text}))} 
                label="new E-Mail" 
                keyboardType="email-address"
            />

            <CustomInput 
                placeholder="Enter your Password" 
                value={form.password} 
                onChangeText={(text) => setForm((prev) => ({ ...prev, password: text}))} 
                label="Password" 
                secureTextEntry={true}
            />

            <CustomButton 
                title="Change E-Mail"
                isLoading={isSubmitting}
                onPress={submit}
                style={"py-4 px-4"}
            />
        </View>
    )
}

export default changeMailSetting