import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import useAuthStore from "@/store/auth.store";
import { Redirect, Slot } from "expo-router";
import { Dimensions, Image, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

export default function AuthLayout(){
    const { isAuthenticated } = useAuthStore();

    if(isAuthenticated) return <Redirect href="/"/>

    return (
        <KeyboardAvoidingView className="bg-primary" behavior={'padding'} keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
            <ScrollView className="bg-primary h-full" keyboardShouldPersistTaps="handled">
                <View className="w-full relative" style={{height: Dimensions.get('screen').height / 4}}>
                    <ImageBackground source={images.bg} className="size-full" resizeMode="stretch"/>
                    <Image source={icons.logo} className="self-center size-10 absolute top-10 mt-5"/>
                </View>
                <Slot/>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}