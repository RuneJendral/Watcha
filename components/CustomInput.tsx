import { CustomInputProps } from '@/type';
import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

const CustomInput = ({placeholder = 'Enter text', value, onChangeText, label, secureTextEntry = false, keyboardType="default"}: CustomInputProps) => {

    const [isFocused, setIsFocused] = useState(false)

    return (
        <View className="w-full">
            <Text className="label text-white font-bold mb-2">{label}</Text>

            <TextInput 
                autoCapitalize="none" 
                autoCorrect={false} 
                value={value} 
                onChangeText={onChangeText} 
                secureTextEntry={secureTextEntry} 
                keyboardType={keyboardType}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                placeholderTextColor="#9CA4AB"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-accent focus:border-accent block w-full p-2.5 dark:bg-dark-200 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-accent dark:focus:border-accent"
            />
        </View>
    )
}

export default CustomInput