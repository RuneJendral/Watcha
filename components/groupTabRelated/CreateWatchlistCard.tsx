import { icons } from '@/constants/icons';
import { CreateWatchlistCardProps } from '@/type';
import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import CreateWatchlistModal from './CreateWatchlistModal';

const CreateWatchlistCard = ({inSelectionMode, refetchWatchlists }: CreateWatchlistCardProps) => {  

  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        className="bg-dark-100 rounded-xl w-[47%]"
        onPress={() => inSelectionMode ? setModalVisible(false) : setModalVisible(true)}
      >
        <View className="bg-accent p-4 rounded-lg">
          <Text className="text-black font-bold">add Watchlist</Text>
        </View>

        <View className="items-center justify-center h-24">
          <Image source={icons.add} className="size-10" />
        </View>
      </TouchableOpacity>

      <CreateWatchlistModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        refetchWatchlists={refetchWatchlists}
      />
    </>

  );
};

export default CreateWatchlistCard