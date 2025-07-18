import { Watchlist } from '@/type'
import { Link } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity } from 'react-native'

const WatchlistCard = ({id, name}: Watchlist) => {  
  return (
    <Link href={`/(tabs)/movies/${id}`} asChild>
        <TouchableOpacity className='w-[30%]'>
            <Text className="text-sm font-bold text-white mt-2" numberOfLines={1}>{name}</Text>
        </TouchableOpacity>
    </Link>
  )
}

export default WatchlistCard