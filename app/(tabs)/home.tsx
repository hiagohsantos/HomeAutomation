import { Image, Pressable, Text, View } from "react-native";
import LottieView from "lottie-react-native";
import ChartCard from "../../components/ChartCard";
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from "react";


export default function TabTwoScreen() {

  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('username').then(storedUsername => {
      if (storedUsername) {
        const agora = new Date();
        const hora = agora.getHours();

        let novaMensagem = '';

        if (hora >= 5 && hora < 12) {
          novaMensagem = 'Bom dia';
        } else if (hora >= 12 && hora < 18) {
          novaMensagem = 'Boa tarde';
        } else {
          novaMensagem = 'Boa noite';
        }
        setMensagem(`${novaMensagem} ${storedUsername}`);
      }
    });
  }, []);

  return (
    //  <View className="h-full w-full bg-neutral-50 dark:bg-neutral-900">
    //   <ChartCard id={"02-holofoteAcude"}></ChartCard>
    // </View>

    <>
    <View className="h-10 w-full bg-[#212530]"/>
      <View className="p-2 w-full h-14 bg-[#212530] ">
      <Text className="ml-6 mt-2 font-bold text-xl text-neutral-400">
           {mensagem}
        </Text>
      </View>
      
    <View className="flex-1 items-center bg-[#1F232C]">
    <Text className="text-2xl mt-3 font-bold text-zinc-300">
      Home
    </Text>
    <Text className="text-md mt-3  font-bold text-zinc-300">
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
