 
import useAuthStore from "@/store/auth.store";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from "react-native";
import "./global.css";

export default function RootLayout() {

  const {isLoading, fetchAuthenticatedUser: fetchAuthtnticatedUser} = useAuthStore();

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
      <Stack.Screen name="settings" options={{headerShown: false}}/>
    </Stack>
  </>
  );
}
