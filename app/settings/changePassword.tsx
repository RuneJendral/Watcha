import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import { changePassword, logOut } from '@/services/appwrite';
import useAuthStore from '@/store/auth.store';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';

const changePasswordSetting = () => {
 // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isSubmitting, setIsSubmitting] = useState(false);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [form, setForm] = useState({oldPassword: '',  newPassword: '', repeatPassword: ''});

    const submit = async () => {
        const {oldPassword, newPassword, repeatPassword} = form;

        if(!oldPassword || !newPassword || !repeatPassword){
            return Alert.alert('Error', 'Please enter a valid password');
        }

        if(newPassword !== repeatPassword){
            return Alert.alert('Error', 'Please repeat the same new Password');
        }

        setIsSubmitting(true)

        try{
            await changePassword({newPassword, oldPassword});
            await logOut();
            useAuthStore.getState().setIsAuthenticated(false);
            useAuthStore.getState().setUser(null); 
            router.replace('/sign-in');
        } catch(error: any){
            Alert.alert('Error', error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
         <View className="gap-10 p-5 mt-5">

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
            />
        </View>
    )
}

export default changePasswordSetting