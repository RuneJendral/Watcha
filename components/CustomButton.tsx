import { CustomButtonProps } from '@/type';
import cn from 'clsx';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

const CustomButton = ({onPress, title="Click Me", style, textStyle, leftIcon, isLoading = false}:CustomButtonProps) => {
    return (
        <TouchableOpacity className={cn('bg-accent rounded-lg py-4 px-4', style)} onPress={onPress}>
            {leftIcon}

            <View className="flex-row items-center justify-center">
                {isLoading ? (
                    <ActivityIndicator size="small" color="white"/>
                ):(
                    <Text className={cn('text-white font-bold', textStyle)}>
                        {title}
                    </Text>
                )}
                
            </View>
        </TouchableOpacity>
    )
}

export default CustomButton