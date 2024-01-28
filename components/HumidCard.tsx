// Device type 3

import React, { useState, useEffect } from "react";
import { db } from "../config";
import { ref, onValue, off, DataSnapshot, DatabaseReference  } from "firebase/database";
import { Image, Pressable, View, Text, ImageBackground} from "react-native";

interface DeviceData {
  type: number;
  title: string;
  data: { timestamp: string; value: number }[];
  unit: string;
  valorMaisRecente: number;
  horaMaisRecente?: string;
}

interface CardProps {
  id: string;
}

const HumidCard: React.FC<CardProps> = (id) => {
  const [deviceData, setDeviceData] = useState<DeviceData>();

  const dataRef: DatabaseReference = ref(db,id["id"]);

  const fetchData = () => {
    onValue(dataRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      const formattedData = Object.entries(data.data).map(([timestamp, value]) => ({
        timestamp,
        value: value as number, 
      }));

      // Encontrar o dado mais recente (com o timestamp mais alto)
      const maisRecente = formattedData.reduce((prev, current) =>
        Number(current.timestamp) > Number(prev.timestamp) ? current : prev
      );
      // Pegar apenas o valor do dado mais recente
      const valorMaisRecente = maisRecente ? maisRecente.value : 0;
      // Converter o timestamp para um formato de hora (horas:minutos)
      const horaMaisRecente = maisRecente
        ? new Date(Number(maisRecente.timestamp)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : "00:00";


      setDeviceData({
        type: data.type,
        title: data.title,
        data: formattedData,
        unit: data.unit,
        valorMaisRecente,
        horaMaisRecente,
      });
    });
  };

  useEffect(() => {
    fetchData();
    return () => {
    off(dataRef);
    };
  }, []);

  return (
    <ImageBackground  className={"m-2"} imageStyle={{ borderRadius: 10}} source={require("../assets/icons/Card.png")}>
          <View >
            <View className="w-fit flex-row justify-between items-center mt-3 mx-3">
                <Text className="font-extrabold text-lg text-neutral-50">
                    {deviceData?.title ? deviceData?.title : "Dispositivo"}
                </Text>
                <View className={`rounded-lg self-stretch h-2 w-2 ${true ? " bg-[#63FF72]" : " bg-red-400" }`}/>
            </View>
            <View className="w-fit flex-row justify-between items-center mx-3">
                <Text className={"text-md font-bold text-gray-400 my-2"}>
                    {deviceData?.horaMaisRecente}
                </Text>
            </View>
            
           <View className="w-full flex-row justify-between">
              <View className="ml-2 items-start">
                { (deviceData?.valorMaisRecente? (deviceData?.valorMaisRecente <= 60): undefined) && 
                 <Image  className= {"h-14 w-12"} source={require("../assets/icons/Humidity.png")}/>}
                { (deviceData?.valorMaisRecente? deviceData?.valorMaisRecente > 60: undefined) && 
                 <Image  className= {"h-14 w-12"} source={require("../assets/icons/HighHumidity.png")}/>}
                {(deviceData? undefined : <Image className= {"h-14 w-12"} source={require("../assets/icons/UnknownHumidity.png")}/>)}

              </View>
              <View className="justify-between flex-row">
              <View className="w-fit flex-row justify-between items-center mx-3">
                <Text className={"m-4 text-5xl font-bold text-gray-400"}>
                {deviceData?.valorMaisRecente}{deviceData?.unit}
                </Text>
            </View>
              </View>
            </View>
          </View>
        </ImageBackground>
  );
};
export default HumidCard;
