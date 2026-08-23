import DialogModal from '@/components/basicModals/DialogModal';
import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import { deleteAccount } from '@/services/appwrite';
import useAuthStore from '@/store/auth.store';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

const DeleteAccountSetting = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmName, setConfirmName] = useState('');
    const user = useAuthStore((state) => state.user);
    const [dialogModalVisible, setDialogModalVisible] = useState(false);
    const [confirmText, setConfirmText] = useState("");

    const submit = async () => {
        if (confirmName.trim().toLowerCase() !== (user?.name ?? '').toLowerCase()) {
            setConfirmText("Please type your username exactly to confirm.");
            setDialogModalVisible(true);
            return;
        }

        setIsSubmitting(true);

        try {
            await deleteAccount();
            useAuthStore.getState().setIsAuthenticated(false);
            useAuthStore.getState().setUser(null);
            router.replace('/sign-in');
        } catch (error: any) {
            setConfirmText(error.message);
            setDialogModalVisible(true);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <View className="gap-10 p-5 mt-5">

            <DialogModal
                text={confirmText}
                visible={dialogModalVisible}
                onClose={() => setDialogModalVisible(false)}
            />

            <View className="flex flex-coloumn items-start justify-between">
                <Text className="font-bold text-white">Delete Account</Text>
                <Text className="text-light-300 mt-2">
                    This permanently deletes your account, removes you from every watchlist you are a member of, and deletes your votes. This cannot be undone.
                </Text>
            </View>

            <CustomInput
                placeholder={`Type "${user?.name ?? ''}" to confirm`}
                value={confirmName}
                onChangeText={setConfirmName}
                label="Confirm your username"
            />

            <CustomButton
                title="Permanently Delete Account"
                isLoading={isSubmitting}
                onPress={submit}
                style={"py-4 px-4"}
            />
        </View>
    )
}

export default DeleteAccountSetting
