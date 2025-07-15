// eslint-disable-next-line import/namespace, import/no-named-as-default, import/no-named-as-default-member
import useAuthStore from "@/store/auth.store";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from "react-native";
import "./global.css";

export default function RootLayout() {

  const {isLoading, fetchAuthtnticatedUser} = useAuthStore();

  useEffect(() =>{
    fetchAuthtnticatedUser();
  },[]);

  if(isLoading) return null;

  return (
  <>
    <StatusBar hidden={true}/>

    <Stack>
      <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
       <Stack.Screen name="(auth)" options={{headerShown: false}}/>
    </Stack>
  </>
  );
}
