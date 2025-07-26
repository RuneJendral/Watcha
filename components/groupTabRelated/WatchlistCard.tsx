import { icons } from '@/constants/icons';
import { WatchlistProps } from '@/type';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

const WatchlistCard = ({ id, name, selected, onLongPress, onPress }: WatchlistProps & {
  onLongPress?: () => void;
  onPress?: () => void;
}) => {
  return (
    <TouchableOpacity
      className={`bg-dark-100 rounded-xl w-[45%] ${selected ? 'border-2 border-accent rounded-lg' : ''}`}
      onLongPress={onLongPress}
      onPress={onPress}
    >
      <View className="bg-accent p-4 rounded-lg">
        <Text className="text-black font-bold">{name}</Text>
      </View>

      <View className="items-center justify-center h-24">
        <Image source={icons.logo} className="size-10" />
      </View>
    </TouchableOpacity>
  );
};

export default WatchlistCard