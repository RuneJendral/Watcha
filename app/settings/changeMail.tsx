import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import { changeMail } from '@/services/appwrite';
import useAuthStore from '@/store/auth.store';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';

const changeMailSetting = () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isSubmitting, setIsSubmitting] = useState(false);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [form, setForm] = useState({email: '',  password: ''});
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const user = useAuthStore((state) => state.user);

    const submit = async () => {
        const {email, password} = form;

        if(!email || !password){
            return Alert.alert('Error', 'Please enter valid e-mail or password');
        }

        setIsSubmitting(true)

        try{
            await changeMail({email, password});
            await useAuthStore.getState().fetchAuthenticatedUser();
            router.replace('/');
        } catch(error: any){
            Alert.alert('Error', error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
         <View className="gap-10 p-5 mt-5">

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
            />
        </View>
    )
}

export default changeMailSetting