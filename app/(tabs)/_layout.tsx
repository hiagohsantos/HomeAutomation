import { Link, Tabs } from "expo-router";
import { Pressable, useColorScheme, Image, ImageBackground, View, TextInput } from "react-native";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import Colors from "../../constants/Colors";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useEffect, useState, useCallback} from "react";
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [username, setUsername] = useState('');
  const [hasLoggedIn, setHasLoggedIn] = useState<boolean>(false)
  const [isloading, setIsloading] = useState<boolean>(true)
  
  useEffect(() => {
    AsyncStorage.getItem('username').then(storedUsername => {
      SplashScreen.hideAsync();
      setIsloading(false)
      console.log("achei")
      if (storedUsername) {
        setUsername(storedUsername);
        setHasLoggedIn(true)
      }
    })
  }, []);

  const handleLogin = () => {
    AsyncStorage.setItem('username', username);
    setUsername(username);
    setHasLoggedIn(true)
  };

  if (isloading) {
    return null;
  }

  return (
    <ThemeProvider value={DarkTheme}>
      {hasLoggedIn ? (
          <Tabs
          screenOptions={{
            tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
            headerShown: false
          }}
        >
          <Tabs.Screen
            name="home"
            options={{
              title: "Home",
              tabBarIcon: ({ focused }) => (
                focused ? 
                <Image  className = {"h-6 w-6"} source={require("../../assets/icons/HomeFocused.png")}/>:
                <Image  className = {"h-6 w-6"} source={require("../../assets/icons/Home.png")}/>
              ),
            }}
          />
          <Tabs.Screen
            name="index"
            options={{
              title: "Dispositivos",
              tabBarIcon: ({ focused }) => (
                focused ? 
                <Image  className = {"h-6 w-6"} source={require("../../assets/icons/GridFocused.png")}/>:
                <Image  className = {"h-6 w-6"} source={require("../../assets/icons/Grid.png")}/>
              ),
              headerRight: () => (
                <Link href="/modal" asChild>
                  <Pressable>
                    {({ pressed }) => (
                      <Image  className= {"h-5 w-5 m-2"} source={require("../../assets/icons/Gear.png")}/>
                    )}
                  </Pressable>
                </Link>
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Perfil",
              tabBarIcon: ({ focused }) => (
                focused ? 
                <Image  className = {"h-6 w-6"} source={require("../../assets/icons/ProfileFocused.png")}/>:
                <Image  className = {"h-6 w-6"} source={require("../../assets/icons/Profile.png")}/>
              ),
            }}
          />
        </Tabs>
      ):(
        <ImageBackground style = {{flex: 1, justifyContent: 'center'}} source={require("../../assets/images/LoginScreen.png")}>
          <View className="flex-1 items-center justify-center">
            <View className="justify-center items-center rounded-xl w-80 h-12 m-4">
            <TextInput
              className="bg-[#424B5B] rounded-lg w-80 h-12 p-2 pl-6 text-neutral-300 font-bold text-lg"
              placeholder="Nome"
              value={username}
              onChangeText={text => setUsername(text)}
            />
            </View>
            <Pressable
            onPress={handleLogin}
            >
            {({ pressed }) => {
                  return (
                    <View style={{
                      transform: [
                        {
                          scale: pressed ? 0.96 : 1,
                        },
                      ],
                    }}>
                    {username ? 
                    (<Image  className= {"mt-6 h-12 w-80 rounded-lg"} source={require("../../assets/icons/LoginButtonEnable.png")}/>):
                    (<Image  className= {"mt-6 h-12 w-80 rounded-lg"} source={require("../../assets/icons/LoginButton.png")}/>)}
                    </View>
                      );
                    }}
            </Pressable>
          </View>
        </ImageBackground>
      )
      
      }
    </ThemeProvider>
  );
}
