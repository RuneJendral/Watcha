import { RandomMovieProps } from '@/type';
import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

const WatchlistMemberModal : React.FC<RandomMovieProps> =  ({ visible, watchlistId, onClose, movies })  => { 

  return (
    <KeyboardAvoidingView className="bg-primary" behavior={'padding'} keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
          <View className="flex-1 justify-center items-center ">
            <View className="bg-dark-100 rounded-2xl p-6 w-72 max-h-[60%] shadow-lg">

              <Text className="text-start text-base font-bold text-white mb-4 mt-4">Random Movie:</Text>

              <TouchableOpacity onPress={onClose} className="mt-4 bg-accent rounded-lg p-2">
                <Text className="text-white text-center font-semibold">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default WatchlistMemberModal