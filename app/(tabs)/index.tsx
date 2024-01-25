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
} from "react-native";
import LottieView from "lottie-react-native";
import LightCard from "../../components/LightCard";
import InfoCard from "../../components/InfoCard";

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
    {item.type === 3 && <InfoCard key={item.id} id={item.id}></InfoCard>}
  </View>
);

export default function TabOneScreen() {
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [error, setError] = useState(false);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
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
      {error ? (
        <View className="flex-1 items-center w-full bg-neutral-50 dark:bg-neutral-900">
          <Text className="text-zinc-900 text-xl font-bold text-center mt-10 dark:text-zinc-300">
            Houve uma falha ao buscar os dispositivos
          </Text>
          <Text className=" text-zinc-800 text-lg mt-5 dark:text-zinc-400">
            Por favor, tente novamente mais tarde
          </Text>
          <LottieView
            source={require("../../assets/animations/dataError.json")}
            autoPlay={true}
            loop={true}
          ></LottieView>
        </View>
      ) : isLoading ? (
        <View className="flex-1 items-center justify-center bg-neutral-50 dark:bg-neutral-900 ">
          <Text className="text-xl text-zinc-800 dark:text-zinc-400">
            Carregando dispositivos
          </Text>
          <ActivityIndicator size="large" color="#34d399" />
        </View>
      ) : devices.length === 0 ? (
        <View className="flex-1 items-center">
          <LottieView
            source={require("../../assets/animations/noDevices.json")}
            autoPlay={true}
            loop={true}
          ></LottieView>
          <Text className="text-2xl mt-3 text-[#00636E] font-extrabold dark:text-[#CCD6DE]">
            Nenhum dispositivo encontrado
          </Text>
        </View>
      ) : (
        <View className="flex-1 bg-neutral-50 dark:bg-neutral-900">
          
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
