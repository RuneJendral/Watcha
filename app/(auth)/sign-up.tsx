import CustomButton from "@/components/CustomButton"
import CustomInput from "@/components/CustomInput"
import { createUser } from "@/services/appwrite"
import useAuthStore from "@/store/auth.store"
import { Link, router } from "expo-router"
import { useState } from "react"
import { Alert, Text, View } from "react-native"

const SignUp = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({name: '', email: '', password: ''});

    const submit = async () => {
        const {name, email, password} = form;

        if(!name || !email || !password){
            return Alert.alert('Error', 'Please enter valid username or password');
        }

        setIsSubmitting(true)

        try{
            await createUser({email, password, name});
            await useAuthStore.getState().fetchAuthtnticatedUser();
            router.replace('/');
        } catch(error: any){
            Alert.alert('Error', error.message);
        } finally {
            setIsSubmitting(false);
        }
    }


    return(
        <View className="gap-10 p-5 mt-5">
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


            <CustomButton 
                title="Sign Up"
                isLoading={isSubmitting}
                onPress={submit}
            />

            <View className="flex justify-center mt-5 flex-row gap-2">
                <Text className="base-regular text-white">Already have an account?</Text>
                <Link href="/sign-in" className="base-bold text-accent">Sign In</Link>
            </View>
        </View>
    )
}

export default SignUp