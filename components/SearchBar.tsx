import { icons } from "@/constants/icons";
import React from 'react';
import { Image, TextInput, View } from 'react-native';

interface Props{
    placeholder: string;
    value?: string;
    onChangeText?: (text: string) => void;
    onSubmit?: () => void;
}

const SearchBar = ({placeholder, value, onChangeText, onSubmit}: Props) => {
  return (
    <View className="flex-row items-center bg-dark-200 rounded-full px-5 py-4">
        <Image source={icons.search} className="size-5" resizeMode="contain" tintColor="#ab8bff"/>
        <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        placeholderTextColor="#a8b5db"
        className="flex-1 ml-2 text-white"
        />
    </View>
  )
}

export default SearchBar