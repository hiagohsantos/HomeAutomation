// Device type 3

import React, { useState, useEffect } from "react";
import { db } from "../config";
import {
  ref,
  onValue,
  off,
  DataSnapshot,
  DatabaseReference,
} from "firebase/database";
import { Image, Pressable, View, Text, ImageBackground } from "react-native";
import { Link, Tabs, useRouter } from "expo-router";

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

const TempCard: React.FC<CardProps> = (id) => {
  const [deviceData, setDeviceData] = useState<DeviceData>();
  const router = useRouter();
  const dataRef: DatabaseReference = ref(db, id["id"]);

  const fetchData = () => {
    onValue(dataRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      const formattedData = Object.entries(data.data).map(
        ([timestamp, value]) => ({
          timestamp,
          value: value as number,
        })
      );

      // Encontrar o dado mais recente (com o timestamp mais alto)
      const maisRecente = formattedData.reduce((prev, current) =>
        Number(current.timestamp) > Number(prev.timestamp) ? current : prev
      );
      // Pegar apenas o valor do dado mais recente
      const valorMaisRecente = maisRecente ? maisRecente.value : 0;
      // Converter o timestamp para um formato de hora (horas:minutos)
      const horaMaisRecente = maisRecente
        ? new Date(Number(maisRecente.timestamp) * 1000).toLocaleTimeString(
            ["pt-br"],
            { hour: "2-digit", minute: "2-digit" }
          )
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
    <ImageBackground
      className={"m-1"}
      imageStyle={{ borderRadius: 10 }}
      source={require("../assets/icons/Card.png")}
    >
      <Pressable
        onPress={(pressed) => {
          router.push({
            pathname: "/modal",
            params: {
              id: id["id"],
              title: deviceData?.title as string,
              type: deviceData?.type as number,
            },
          });
        }}
      >
        <View className="w-fit m-2">
          <View className="w-fit flex-row justify-between items-center ml-3">
            <Text className="font-extrabold text-lg text-neutral-50">
              {deviceData?.title ? deviceData?.title : "Dispositivo"}
            </Text>
            <View
              className={`rounded-lg h-2 w-2 self-stretch ${
                true ? " bg-[#63FF72]" : " bg-red-400"
              }`}
            />
          </View>
          <View className="w-fit flex-row justify-between items-center mx-3">
            <Text className={"text-md font-bold text-gray-400 my-2"}>
              {deviceData?.horaMaisRecente}
            </Text>
          </View>

          <View className="w-full flex-row justify-between items-center">
            <View className="p-2 items-start">
              {(deviceData?.valorMaisRecente
                ? deviceData?.valorMaisRecente <= 15
                : undefined) && (
                <Image
                  className={"h-14 w-10"}
                  source={require("../assets/icons/LowTemp.png")}
                />
              )}
              {(deviceData?.valorMaisRecente
                ? deviceData?.valorMaisRecente > 15 &&
                  deviceData?.valorMaisRecente <= 30
                : undefined) && (
                <Image
                  className={"h-14 w-10"}
                  source={require("../assets/icons/Temp.png")}
                />
              )}
              {(deviceData?.valorMaisRecente
                ? deviceData?.valorMaisRecente > 30
                : undefined) && (
                <Image
                  className={"h-14 w-10"}
                  source={require("../assets/icons/HighTemp.png")}
                />
              )}
              {deviceData ? undefined : (
                <Image
                  className={"h-14 w-10"}
                  source={require("../assets/icons/UnknownTemp.png")}
                />
              )}
            </View>
            <View className="justify-between flex-row ">
              <View className="w-fit flex-row justify-between items-center mx-3 ">
                <Text className={"my-2 text-5xl font-bold text-gray-400"}>
                  {deviceData?.valorMaisRecente}
                </Text>
                <Text
                  className={"text-2xl font-bold text-gray-400 self-stretch"}
                >
                  {deviceData?.unit}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </ImageBackground>
  );
};
export default TempCard;
