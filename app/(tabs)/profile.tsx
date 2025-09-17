import { icons } from '@/constants/icons'
import { images } from '@/constants/images'
import { logOut } from '@/services/appwrite'
import useAuthStore from '@/store/auth.store'
import { SettingsItemProps } from '@/type'
import { Link, router } from 'expo-router'
import React, { useState } from 'react'
import { Alert, Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native'

const profile = () => {

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const {user} = useAuthStore();
  //console.log("USER:", JSON.stringify(user, null, 2));
  const avatarUrl = `${user?.avatar}?name=${encodeURIComponent(user?.name ?? 'User')}&width=500&height=500`;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = async () => {
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

  const SettingsItem = ({icon, title, onPress, textStyle, showArrow = true, path="./settings/changeName"}: SettingsItemProps) => (
    <Link href={path} asChild>
      <TouchableOpacity onPress={onPress} className="flex flex-row items-center justify-between py-3">
        <View className="flex flex-row items-center gap-3">
          <Image source={icon} className="size-6"/>
          <Text className={`text-lg font-medium ${textStyle}`}>{title}</Text>
        </View>

        {showArrow && <Image source={icons.rightArrow} className="size-5" />}

      </TouchableOpacity>
    </Link>
  )


  return (
    <SafeAreaView className="h-full bg-primary">
      <Image source={images.bg} className="flex-1 absolute w-full z-0" resizeMode="cover"/>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-32 px-7 my-5">

        <View className="flex flex-row items-center justify-between mt-10">
          <Text className="text-lg font-bold text-white">Profile</Text>
        </View>

        <View className="flex-row justify-center flex mt-5">
          <View className="flex flex-col items-center relative mt-5">
            <Image source={{uri: avatarUrl}} className="size-44 relative rounded-full"/>
            <Text className="text-2xl font-bold mt-2 text-white">{user?.name}</Text>
          </View>
        </View>

        <View className="flex flex-col mt-10 border-t pt-5 border-light-300">
          <SettingsItem icon={icons.user} title="User Name" textStyle="text-light-300" path="../settings/changeName"/>
          <SettingsItem icon={icons.lock} title="Password" textStyle="text-light-300" path="../settings/changePassword"/>
        </View>

        <View className="flex flex-col mt-5 border-t pt-5 border-light-300">
          <SettingsItem icon={icons.logout} title="Logout" textStyle="text-danger" onPress={handleLogout} showArrow={false}/>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default profile