import { WatchlistModal } from '@/type'
import React from 'react'
import { Text, View } from 'react-native'

const WatchlistModalCard = ({id, name }: WatchlistModal) => {  
  return (
    <View className="p-2">
        <Text className="text-black font-bold">{name}</Text>
    </View>
  )
}

export default WatchlistModalCard