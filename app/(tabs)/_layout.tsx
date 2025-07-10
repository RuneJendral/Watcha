import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { Redirect, Tabs } from 'expo-router';
import { Image, ImageBackground, Text, View } from "react-native";

const TabIcon = ({focused, icon, title}: any) => {
    if(focused)
    {
        return(
          <ImageBackground source={images.highlight} className="flex flex-row w-full flex-1 min-w-[112px] min-h-16 mt-4 justify-center items-center overflow-hidden" >
            <Image source={icon} tintColor="#151312" className="size-5"/>
            <Text className="text-secondary text-base font-semibold">{title}</Text>
          </ImageBackground>
        )
    }

    return(
      <View className="size-full justify-center items-center mt-4">
         <Image source={icon} tintColor="#A8B5DB" className="size-5"/>
      </View>
    )
  
}

const _layout = () => {

  const isAuthenticated = true;

  if(!isAuthenticated) return <Redirect href="/sign-in"/>

  return (

   
      <Tabs screenOptions={{ tabBarShowLabel: false, tabBarItemStyle:{width: "100%", height: "100%", justifyContent: "center", alignItems: "center"}, tabBarStyle:{backgroundColor: "#0f0D23", height: 100, position: "absolute", borderWidth: 1, borderColor: "#0f0d23", overflow: "hidden"}}}>
        <Tabs.Screen name='index' options={{title: 'Home', headerShown: false, tabBarIcon: ({ focused }) => (<TabIcon focused={focused} icon={icons.home} title="Home"/>) }}/>
        <Tabs.Screen name='search' options={{title: 'Search', headerShown: false, tabBarIcon: ({ focused }) => (<TabIcon focused={focused} icon={icons.search} title="Search" />) }}/>
        <Tabs.Screen name='saved' options={{title: 'Saved', headerShown: false, tabBarIcon: ({ focused }) => (<TabIcon focused={focused} icon={icons.save} title="Saved" />)}}/>
        <Tabs.Screen name='profile' options={{title: 'Profile', headerShown: false, tabBarIcon: ({ focused }) => (<TabIcon focused={focused} icon={icons.person} title="Profile" />)}}/>
      </Tabs>
  )
}

export default _layout