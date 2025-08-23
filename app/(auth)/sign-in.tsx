import DialogModal from "@/components/basicModals/DialogModal"
import CustomButton from "@/components/CustomButton"
import CustomInput from "@/components/CustomInput"
import { signInWithFakeMail } from "@/services/appwrite"
import useAuthStore from "@/store/auth.store"
import { Link, router } from "expo-router"
import { useState } from "react"
import { Text, View } from "react-native"

const SignIn = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({name: '',  password: ''});
    const [dialogModalVisible, setDialogModalVisible] = useState(false);
    const [confirmText, setConfirmText] = useState("");

    const submit = async () => {
        const {name, password} = form;

        if(!name || !password){
            setConfirmText("Please enter a valid username or password");
            setDialogModalVisible(true);
            return;
        }

        setIsSubmitting(true)

        try{
            await signInWithFakeMail({name, password});
            await useAuthStore.getState().fetchAuthenticatedUser();
            router.replace('/');
        } catch(error: any){
            setConfirmText("Wrong username or password");
            setDialogModalVisible(true);
        } finally {
            setIsSubmitting(false);
        }
    }


    return(
        <View className="gap-10 p-5 mt-5">

            <DialogModal
                text={confirmText}
                visible={dialogModalVisible}
                onClose={() => setDialogModalVisible(false)}
            />

            <CustomInput 
                placeholder="Enter your Username" 
                value={form.name} 
                onChangeText={(text) => setForm((prev) => ({ ...prev, name: text}))} 
                label="Username" 
                keyboardType="email-address"
            />

            <CustomInput 
                placeholder="Enter your Password" 
                value={form.password} 
                onChangeText={(text) => setForm((prev) => ({ ...prev, password: text}))} 
                label="Password" 
                secureTextEntry={true}
            />

            <CustomButton 
                title="Sign In"
                isLoading={isSubmitting}
                onPress={submit}
                style={"py-4 px-4"}
            />

            <View className="flex justify-center mt-5 flex-row gap-2">
                <Text className="base-regular text-light-300">Do not have an account?</Text>
                <Link href="/sign-up" className="base-bold text-accent">Sign Up</Link>
            </View>
        </View>
    )
}

export default SignIn