import { icons } from '@/constants/icons'
import { images } from '@/constants/images'
import React from 'react'
import { Image, ScrollView, Text, View } from 'react-native'

const group = () => {
  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full y-0"/>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} contentContainerStyle={{minHeight: "100%", paddingBottom: 10}}>
        <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto"/>

        
        <View className="mt-10">
          <Text className="text-lg text-white font-bold mb-3">Watchlists</Text>
        </View>
        

      </ScrollView>
    </View>
  )
}

export default group