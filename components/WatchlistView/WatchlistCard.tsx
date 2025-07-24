import { icons } from '@/constants/icons'
import { WatchlistProps } from '@/type'
import { Link } from 'expo-router'
import React from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'

const WatchlistCard = ({id, name }: WatchlistProps) => {  
  return (
    <Link href={`/(tabs)/watchlists/${id}`} asChild>
        <TouchableOpacity className="bg-dark-100 rounded-xl w-[45%]">

          <View className="bg-accent p-4 rounded-lg">
            <Text className="text-black font-bold">{name}</Text>
          </View>

          <View className="items-center justify-center h-24">
            <Image source={icons.logo} className="size-10" />
          </View>

        </TouchableOpacity>
    </Link>
  )
}

export default WatchlistCard