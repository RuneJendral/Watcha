import { DialogModalProps } from '@/type';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';

const CreateWatchlistModal : React.FC<DialogModalProps> = ({text, visible, onClose}) => { 
    return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose} statusBarTranslucent={true} navigationBarTranslucent={true}>
        <Pressable className="flex-1 bg-black/40 justify-center items-center" onPress={onClose}>
            <Pressable className="bg-dark-100 rounded-2xl p-6 w-72 max-h-[60%] shadow-lg" onPress={(e) => e.stopPropagation()}>
            <Text className="text-white text-base mb-4">{text}</Text>
            <View className="flex-row justify-center">
                <TouchableOpacity className="bg-accent rounded-lg px-4 py-2" onPress={onClose}>
                    <Text className="text-white font-semibold">OK</Text>
                </TouchableOpacity>
            </View>
            </Pressable>
        </Pressable>
    </Modal>
    );
};

export default CreateWatchlistModal