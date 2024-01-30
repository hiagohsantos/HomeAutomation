import MasonryList from "@react-native-seoul/masonry-list";
import Device from "../../components/Device";
import GateCard from "../../components/GateCard";
import React, { useState, useEffect } from "react";
import { ref, onValue, off, update, get } from "firebase/database";
import { db } from "../../config";

import {
  useColorScheme,
  Pressable,
  Text,
  ActivityIndicator,
  View,
  Alert,
  Image,
  ImageBackground,
} from "react-native";
import LottieView from "lottie-react-native";
import LightCard from "../../components/LightCard";
import TempCard from "../../components/TempCard";
import HumidCard from "../../components/HumidCard";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface DeviceData {
  status?: boolean;
  type: number;
  title: string;
  set?: string;
  info?: string;
  id: string;
}

const renderCardItem = (item: DeviceData) => (
  <View key={item.id}>
    {item.type === 1 && <GateCard key={item.id}></GateCard>}
    {item.type === 2 && <LightCard key={item.id} id={item.id}></LightCard>}
    {item.type === 3 && <TempCard key={item.id} id={item.id}></TempCard>}
    {item.type === 4 && <HumidCard key={item.id} id={item.id}></HumidCard>}
  </View>
);

export default function TabOneScreen() {
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [error, setError] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    AsyncStorage.getItem("username").then((storedUsername) => {
      if (storedUsername) {
        const agora = new Date();
        const hora = agora.getHours();

        let novaMensagem = "";

        if (hora >= 5 && hora < 12) {
          novaMensagem = "Bom dia,";
        } else if (hora >= 12 && hora < 18) {
          novaMensagem = "Boa tarde,";
        } else {
          novaMensagem = "Boa noite,";
        }
        setMensagem(`${novaMensagem} ${storedUsername}`);
      }
    });

    const devicesRef = ref(db, "/");
    setLoading(true);
    get(devicesRef)
      .then((snapshot) => {
        const data = snapshot.val();
        if (data) {
          // Convertendo os dados do Firebase em um array de dispositivos
          const devicesArray: DeviceData[] = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          //console.log(devicesArray);
          setDevices(devicesArray);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <View className="h-10 w-full bg-[#212530]" />
      <View className="p-1 w-full bg-[#212530] ">
        <Text className="ml-6 mt-2 font-bold text-xl text-neutral-400">
          {mensagem}
        </Text>
      </View>

      {error ? (
        <View className="flex-1 items-center w-full bg-[#1F232C]">
          <Text className=" text-xl font-bold text-center mt-10 text-zinc-300">
            Houve uma falha ao buscar os dispositivos
          </Text>
          <Text className=" text-lg mt-5 text-zinc-400">
            Por favor, tente novamente mais tarde
          </Text>
          <LottieView
            source={require("../../assets/animations/dataError.json")}
            autoPlay={true}
            loop={true}
          ></LottieView>
        </View>
      ) : isLoading ? (
        <View className="flex-1 items-center justify-center  bg-[#1F232C]">
          <Text className="text-xl text-zinc-400">Carregando dispositivos</Text>
          <ActivityIndicator size="large" color="#34d399" />
        </View>
      ) : devices?.length === 0 ? (
        <View className="flex-1 items-center bg-[#1F232C]">
          <LottieView
            source={require("../../assets/animations/noDevices.json")}
            autoPlay={true}
            loop={true}
          ></LottieView>
          <Text className="text-2xl mt-3 font-extrabold text-[#CCD6DE]">
            Nenhum dispositivo encontrado
          </Text>
        </View>
      ) : (
        <View className="flex-1 bg-[#1F232C]">
          <View className=" w-full bg-[#1F232C] items-center justify-center">
            <Text className=" ml-6 mt-2 font-bold text-sm text-zinc-500">
              {devices.length} dispositivos encontrados
            </Text>
          </View>
          <MasonryList
            data={devices}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={{
              flexGrow: 1,
              paddingVertical: 10,
            }}
            renderItem={({ item }) => renderCardItem(item as DeviceData)}
          />
        </View>
      )}
    </>
  );
}
