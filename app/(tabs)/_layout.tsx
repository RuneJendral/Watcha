import { icons } from "@/constants/icons";
 
import useAuthStore from "@/store/auth.store";
import { TabBarIconProps } from "@/type";
import { Redirect, Tabs } from 'expo-router';
import { Image, View } from "react-native";

const TabIcon = ({focused, icon, iconHighlight}: TabBarIconProps) => {
    if(focused)
    {
        return(
          <View className="size-full justify-center items-center mt-4" >
            <Image source={iconHighlight} tintColor="#AB8BFF" className="size-7"/>
          </View>
        )
    }

    return(
      <View className="size-full justify-center items-center mt-4">
         <Image source={icon} tintColor="#A8B5DB" className="size-7"/>
      </View>
    )
}

const TabProfileIcon = ({focused, icon, iconHighlight}: TabBarIconProps) => {
    if(focused)
    {
        return(
          <View className="size-full justify-center items-center mt-4" >
            <Image source={iconHighlight} tintColor="#AB8BFF" className="size-7 rounded-full"/>
          </View>
        )
    }

    return(
      <View className="size-full justify-center items-center mt-4">
         <Image source={icon} tintColor="#A8B5DB" className="size-7 rounded-full"/>
      </View>
    )
}

const TabLayout = () => {
  const {isAuthenticated}  = useAuthStore();
  const {user} = useAuthStore();
  const avatarUrl = `${user?.avatar}?name=${encodeURIComponent(user?.name ?? 'User')}&width=500&height=500`;

  if(!isAuthenticated) return <Redirect href={"/sign-in"}/>

  return (
      <Tabs screenOptions={{ tabBarShowLabel: false, tabBarItemStyle:{width: "100%", height: "100%", justifyContent: "center", alignItems: "center"}, tabBarStyle:{backgroundColor: "#0f0D23", height: 100, position: "absolute", borderWidth: 1, borderColor: "#0f0d23", overflow: "hidden"}}}>
        <Tabs.Screen name='index' options={{title: 'Home', headerShown: false, tabBarIcon: ({ focused }) => (<TabIcon focused={focused} icon={icons.home} iconHighlight={icons.homeHighlight}/>) }}/>
        <Tabs.Screen name='search' options={{title: 'Search', headerShown: false, tabBarIcon: ({ focused }) => (<TabIcon focused={focused} icon={icons.search} iconHighlight={icons.searchHighlight}/>) }}/>
        <Tabs.Screen name='group' options={{title: 'Group', headerShown: false, tabBarIcon: ({ focused }) => (<TabIcon focused={focused} icon={icons.group} iconHighlight={icons.groupHighlight}/>)}}/>
        <Tabs.Screen name='profile' options={{title: 'Profile', headerShown: false, tabBarIcon: ({ focused }) => (<TabProfileIcon focused={focused} icon={{ uri: avatarUrl }} iconHighlight={{ uri: avatarUrl }}/>)}}/>
        <Tabs.Screen name='movies/[id]' options={{href: null, headerShown: false,}}/>
        <Tabs.Screen name='watchlists/[id]' options={{href: null, headerShown: false,}}/>
        <Tabs.Screen name='voting/[id]' options={{href: null, headerShown: false,}}/>
      </Tabs>
  )
}

export default TabLayout