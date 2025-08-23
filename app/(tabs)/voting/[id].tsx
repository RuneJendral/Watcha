import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

const WatchlistVoting = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { id } = useLocalSearchParams();
  
  return (
    <View  className="bg-primary flex-1 pb-10">
      <ScrollView contentContainerStyle={{paddingBottom: 80}}>
        <View className="flex-row items-center gap-x-1 mt-2">
            <Text className="text-light-200 text-sm">Voting</Text>
        </View>
      </ScrollView>
    </View >
  )
}

export default WatchlistVoting