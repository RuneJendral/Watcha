import { View, Text, Image, ScrollView} from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '@/constants';
import CustomButton from '@/components/CustomButton';

export default function Index() {
  return (
    <SafeAreaView className="bg-primary h-full">
     <ScrollView contentContainerStyle={{height: '100%'}}>
      <View className="w-full justify-center items-center h-full px-4">
        <Image
          source={images.logo}
          className="w-[130px] h-[84px]"
          resizeMode="contain"
        />

        <Image
          source={images.cards}
          className="max-w-[380px] w-full h-[300px]"
          resizeMode="contain"
        />

        <View className="relative mt-5">
          <Text className="text-3xl text-white font-bold text-center">
            Discover Endless Possibilities with{' '}
            <Text className="text-secondary-200">Watcha</Text>
          </Text>

          <Image 
            source={images.path}
            className="w-[136px] h-[15px] absolute -bottom-2 -right-8"
            resizeMode="contain"
          />

          <CustomButton/>
        </View>
      </View>
     </ScrollView>
    </SafeAreaView>
  );
}
