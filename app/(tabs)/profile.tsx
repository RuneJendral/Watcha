import CustomButton from '@/components/CustomButton'
import { icons } from '@/constants/icons'
import { logOut } from '@/services/appwrite'
import useAuthStore from '@/store/auth.store'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Alert, Image, Text, View } from 'react-native'

const profile = () => {

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const {user} = useAuthStore();
  console.log("USER:", JSON.stringify(user, null, 2));

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
      try{
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
    <View className="bg-primary flex-1 px-10">
      <View className="flex justify-center items-center flex-1 flex-col gap-5">
        <Image source={icons.profile} className="size-10" tintColor="#fff"/>
        <Text className="text-gray-500 text-500">Profile</Text>

        <CustomButton 
                title="Log-Out"
                isLoading={isSubmitting}
                onPress={submit}
        />
      </View>
    </View>
  )
}

export default profile