import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import { changeName } from '@/services/appwrite';
import useAuthStore from '@/store/auth.store';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';

const changeNameSetting = () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isSubmitting, setIsSubmitting] = useState(false);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [form, setForm] = useState({name: ''});
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const user = useAuthStore((state) => state.user);

    const submit = async () => {
        const {name} = form;

        if(!name){
            return Alert.alert('Error', 'Please enter valid Name');
        }

        setIsSubmitting(true)

        try{
            await changeName({name});
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
            />
        </View>
  )
}

export default changeNameSetting