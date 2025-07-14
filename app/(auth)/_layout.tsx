import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { Slot } from "expo-router";
import { Dimensions, Image, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

export default function _layout(){
    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView className="bg-primary h-full" keyboardShouldPersistTaps="handled">
                <View className="w-full relative" style={{height: Dimensions.get('screen').height / 3}}>
                    <ImageBackground source={images.bg} className="size-full" resizeMode="stretch"/>
                    <Image source={icons.logo} className="self-center size-10 absolute top-10"/>
                </View>
                <Slot/>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}