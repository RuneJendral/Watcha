import { KeyboardAvoidingView, Platform, ScrollView, Text } from "react-native";

export default function _layout(){
    return (
        <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? 'padding' : 'height'}>
            <ScrollView className="">

            </ScrollView>
        </KeyboardAvoidingView>
    )
}