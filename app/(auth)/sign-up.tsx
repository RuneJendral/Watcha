import DialogModal from "@/components/basicModals/DialogModal"
import CustomButton from "@/components/CustomButton"
import CustomInput from "@/components/CustomInput"
import { createUser } from "@/services/appwrite"
import useAuthStore from "@/store/auth.store"
import { Link, router } from "expo-router"
import { useState } from "react"
import { Text, View } from "react-native"

const SignUp = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({name: '', email: '', password: '', repeatPassword: ''});
    const [dialogModalVisible, setDialogModalVisible] = useState(false);
    const [confirmText, setConfirmText] = useState("");

    const submit = async () => {
        const {name, email, password, repeatPassword} = form;

        if(!name || !email || !password || !repeatPassword){
            setConfirmText("Please enter a valid username or password");
            setDialogModalVisible(true);
            return;
        }

        if(password !== repeatPassword){
            setConfirmText("Please repeat the same new Password");
            setDialogModalVisible(true);
            return;
        }

        setIsSubmitting(true)

        try{
            await createUser({email, password, name});
            await useAuthStore.getState().fetchAuthenticatedUser();
            router.replace('/');
        } catch(error: any){
            setConfirmText(error.message);
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
                placeholder="Enter your User-Name" 
                value={form.name} 
                onChangeText={(text) => setForm((prev) => ({ ...prev, name: text}))} 
                label="Name" 
                keyboardType="email-address"
            />

            <CustomInput 
                placeholder="Enter your E-Mail" 
                value={form.email} 
                onChangeText={(text) => setForm((prev) => ({ ...prev, email: text}))} 
                label="E-Mail" 
                keyboardType="email-address"
            />

            <CustomInput 
                placeholder="Enter your Password" 
                value={form.password} 
                onChangeText={(text) => setForm((prev) => ({ ...prev, password: text}))} 
                label="Password" 
                secureTextEntry={true}
            />

            <CustomInput 
                placeholder="Repeat your Password" 
                value={form.repeatPassword} 
                onChangeText={(text) => setForm((prev) => ({ ...prev, repeatPassword: text}))} 
                label="repeat Password" 
                secureTextEntry={true}
            />

            <CustomButton 
                title="Sign Up"
                isLoading={isSubmitting}
                onPress={submit}
                style={"py-4 px-4"}
            />

            <View className="flex justify-center mt-5 flex-row gap-2">
                <Text className="base-regular text-white">Already have an account?</Text>
                <Link href="/sign-in" className="base-bold text-accent">Sign In</Link>
            </View>
        </View>
    )
}

export default SignUp