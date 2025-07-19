import { icons } from '@/constants/icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

const CreateWatchlistCard = () => {  
  return (
   <TouchableOpacity className="bg-primary rounded-xl overflow-hidden border-2 border-accent my-2 w-[48%]">

        <View className="bg-accent  p-4 rounded-lg">
            <Text className="text-black font-bold">add Watchlist</Text>
        </View>

        <View className="flex-1 items-center justify-center">
            <Image source={ icons.add} className="size-10" />
        </View>
    </TouchableOpacity>
  );
};

export default CreateWatchlistCard