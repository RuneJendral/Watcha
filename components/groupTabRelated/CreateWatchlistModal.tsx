import { createWatchlist } from '@/services/appwrite';
import { CreateWatchlistProps } from '@/type';
import React, { useState } from 'react';
import { Modal, Pressable, Text, TouchableOpacity } from 'react-native';
import CustomInput from '../CustomInput';
import DialogModal from '../basicModals/DialogModal';

const CreateWatchlistModal : React.FC<CreateWatchlistProps & { refetchWatchlists: () => void }> = ({ visible, onClose, refetchWatchlists }) => { 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({watchlistName: ''});
    const [dialogModalVisible, setDialogModalVisible] = useState(false);
    const [confirmText, setConfirmText] = useState("");

    const submit = async () => {
        const {watchlistName} = form;

        if(!watchlistName){
            setConfirmText("please enter a valid watchlist name");
            setDialogModalVisible(true);
            return;
        }

        setIsSubmitting(true)

        const result = await createWatchlist(watchlistName);

        if (result.ok) {
            setTimeout(refetchWatchlists, 600);
            setConfirmText(result.message);
            setDialogModalVisible(true);
        } else {
            setConfirmText(result.message);
            setDialogModalVisible(true);
        }

        setForm((prev) => ({ ...prev, watchlistName: ""}));
        setIsSubmitting(false);
    };

  return (

    <Modal visible={visible} animationType="fade" onRequestClose={onClose} transparent statusBarTranslucent presentationStyle="overFullScreen" >
        
        <DialogModal
            text={confirmText}
            visible={dialogModalVisible}
            onClose={() => {setDialogModalVisible(false); onClose()}}
        />

        <Pressable className="absolute inset-0 bg-black/40" onPress={onClose}>
            <Pressable className="mx-auto my-auto bg-dark-100 rounded-2xl p-6 w-72 shadow-lg gap-2" onPress={(e) => e.stopPropagation()}>
            <Text className="text-start text-base text-white mb-4">Add to Watchlist</Text>

            <CustomInput 
                placeholder="Enter the name of the watchlist" 
                value={form.watchlistName} 
                onChangeText={(text) => setForm((prev) => ({ ...prev, watchlistName: text}))} 
                label="Watchlist-Name" 
            />   

            <TouchableOpacity onPress={submit} className="mt-4 bg-accent rounded-lg p-2">
                <Text className="text-white text-center font-semibold">Create new Watchlist</Text>
            </TouchableOpacity>
            </Pressable>
        </Pressable>
    </Modal>

  );
};

export default CreateWatchlistModal