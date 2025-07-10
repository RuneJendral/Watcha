import { KeyboardAvoidingView, Platform, Text } from "react-native";

export default function _layout(){
    return (
        <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? 'padding' : 'height'}>
            <Text></Text>
        </KeyboardAvoidingView>
    )
}