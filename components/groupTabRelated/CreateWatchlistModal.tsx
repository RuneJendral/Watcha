import { createWatchlist } from '@/services/appwrite';
import { CreateWatchlistProps } from '@/type';
import React, { useState } from 'react';
import { Alert, Modal, Text, TouchableOpacity, View } from 'react-native';
import CustomInput from '../CustomInput';

const CreateWatchlistModal : React.FC<CreateWatchlistProps & { refetchWatchlists: () => void }> = ({ visible, onClose, refetchWatchlists }) => { 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({watchlistName: ''});

    const submit = async () => {
        const {watchlistName} = form;

        if(!watchlistName){
            return Alert.alert('Error', 'Please enter valid watchlist name');
        }

        setIsSubmitting(true)

        try{
            await createWatchlist(watchlistName);
            
            setTimeout(() => { //timeout because appwrite is not so fast in creating new watchlists
                refetchWatchlists();
            }, 600);

            onClose(); 
        } catch(error: any){
            Alert.alert('Error', error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

  return (
         <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
           <View className="h-full flex-1 justify-center items-center">
             <View className="bg-dark-100 rounded-2xl p-6 w-72 shadow-lg gap-2">
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
   
               <TouchableOpacity onPress={onClose} className="mt-4 bg-accent rounded-lg p-2">
                    <Text className="text-white text-center font-semibold">Close</Text>
               </TouchableOpacity>
             </View>
           </View>
         </Modal>
  );
};

export default CreateWatchlistModal