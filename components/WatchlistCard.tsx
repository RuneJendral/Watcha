import { WatchlistProps } from '@/type'
import { Link } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

const WatchlistCard = ({id, name }: WatchlistProps) => {  
  return (
    <Link href={`/(tabs)/watchlists/${id}`} asChild>
        <TouchableOpacity className="bg-primary rounded-xl overflow-hidden border-2 border-accent my-2 w-[45%]">

          <View className="bg-accent  p-4 rounded-lg">
            <Text className="text-black font-bold">{name}</Text>
          </View>

          <View className="p-4">
            <Text className="text-white text-sm" numberOfLines={3}>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam</Text>
          </View>

        </TouchableOpacity>
    </Link>
  )
}

export default WatchlistCard