import { WatchlistProps } from '@/type'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

const WatchlistModalCard = ({id, name }: WatchlistProps) => {  
  return (
        <TouchableOpacity className="bg-light-300 rounded-lg my-2 ">
            <View className="p-2">
                <Text className="text-black font-bold">{name}</Text>
            </View>
        </TouchableOpacity>
  )
}

export default WatchlistModalCard