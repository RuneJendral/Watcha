import { icons } from "@/constants/icons";
import { router, Slot } from "expo-router";
import { Dimensions, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function SettingsLayout(){

    return (
        <View className="bg-primary h-full">
            <KeyboardAvoidingView behavior={'padding'} keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">


                    <View className="mt-5 w-full relative" style={{height: Dimensions.get('screen').height / 10}}>
                        <TouchableOpacity className="flex flex-row items-center justify-start ml-5 mt-10" onPress={() => {router.replace('../(tabs)/profile');}}>
                            <Image source={icons.leftArrow} className="size-5 mr-5"/>
                            <Text className="text-lg font-bold text-white">Profile Settings</Text>
                        </TouchableOpacity>
                    </View>
                    <Slot/>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
        
    )
}