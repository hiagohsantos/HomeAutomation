import { StyleSheet } from "react-native";
import { Text, View } from "react-native";
import LottieView from "lottie-react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from "react";


export default function TabTwoScreen() {
  const [userName , setUsername] = useState<string>("")

  useEffect(() => {
    AsyncStorage.getItem('username').then(storedUsername => {
      if (storedUsername) {
        setUsername(storedUsername);
      }
    });
  }, []);

  return (
  <>
    <View className="h-10 w-full bg-[#212530]"/>
    <View className="p-2 w-full h-14 bg-[#212530] ">
    <Text className=" ml-6 mt-2 font-extrabold text-xl text-neutral-50">
        Olá, {userName}
      </Text>
    </View>
    <View className="flex-1 items-center bg-[#1F232C]">
      <Text className="text-2xl mt-3 font-bold text-zinc-300">
        Perfil
      </Text>
      <Text className="text-md mt-3 font-bold text-zinc-300">
        Ops, parece que esta página ainda não está pronta. 
      </Text>
      <Text className="text-xs my-3  font-bold text-zinc-300">
       Aguarde por novas atualizações...
      </Text>
      <View className="my-30 h-px w-4/5 bg-zinc-400 " />
      <LottieView
        source={require("../../assets/animations/construction.json")}
        autoPlay={true}
        loop={true}
      ></LottieView>
    </View>
    </>
  );
}
