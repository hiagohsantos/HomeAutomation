// Device type 1

import React, { useState, useEffect } from "react";
import { db } from "../config";
import { ref, onValue } from "firebase/database";
import { LineChart } from "react-native-gifted-charts";
import { View, Text } from "react-native";

interface DeviceData {
  [timestamp: string]: boolean;
}
//Device type 3
interface CardProps {
  id: string;
}

interface ChartData {
  value: number;
  date: string;
  label: string;
}

const ChartCard: React.FC<CardProps> = (id) => {
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [totalTimeOn, setTotalTimeOn] = useState<number>(0);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [maxChartValue, setMaxChartValue] = useState<number>(0);

  const fetchData = () => {
    const dataRef = ref(db, id["id"] + "/data");
    onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      setDeviceData(data || []);
    });
  };
  useEffect(() => {
    // Calcular o tempo total ligado quando os dados mudam
    let totalTime = 0;
    let lastTimestamp: string | null = null;

    const newData: ChartData[] = [];

    Object.entries(deviceData).forEach(([timestamp, status]) => {
      if (!status) {
        // Se o estado for false (desligado), verifica o último evento de ligar
        if (lastTimestamp !== null) {
          const timeOn = parseInt(timestamp) - parseInt(lastTimestamp);
          totalTime += timeOn;

          // Adiciona o ponto ao array de dados do gráfico
          newData.push({
            value: Math.round(totalTime),
            date: new Date(parseInt(lastTimestamp) * 1000).toLocaleDateString(
              "pt-br"
            ),
            label: new Date(parseInt(lastTimestamp) * 1000).toLocaleDateString(
              "pt-br",
              {
                month: "numeric",
                day: "numeric",
              }
            ),
          });
        }
      }
      lastTimestamp = timestamp;
    });

    const maxChartValue =
      Math.max(...newData.map((point) => point.value)) + 100;
    setMaxChartValue(maxChartValue);
    setChartData(newData);
    setTotalTimeOn(Math.round(totalTime / 60));
  }, [deviceData]);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <View className="flex-1 items-center justify-center">
      <View className=" w-full">
        <LineChart
          areaChart
          curved
          data={chartData}
          //rotateLabel
          width={350}
          hideDataPoints
          spacing={Math.round(300 / chartData.length)}
          color="#00ff83"
          thickness={2}
          startFillColor="rgba(20,105,81,0.2)"
          endFillColor="rgba(20,85,81,0.04)"
          startOpacity={0.9}
          endOpacity={0.2}
          initialSpacing={0}
          //noOfSections={0}
          maxValue={maxChartValue}
          yAxisColor="white"
          yAxisThickness={0}
          hideRules
          rulesType="solid"
          rulesColor="gray"
          yAxisTextStyle={{ color: "gray" }}
          xAxisColor="lightgray"
          pointerConfig={{
            pointerStripHeight: 160,
            pointerStripColor: "lightgray",
            pointerStripWidth: 2,
            pointerColor: "lightgray",
            radius: 6,
            pointerLabelWidth: 100,
            pointerLabelHeight: 90,
            activatePointersOnLongPress: true,
            autoAdjustPointerLabelPosition: false,
            pointerLabelComponent: (items: any) => {
              return (
                <View
                  style={{
                    height: 90,
                    width: 100,
                    justifyContent: "center",
                    marginTop: -30,
                    marginLeft: -40,
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 14,
                      marginBottom: 6,
                      textAlign: "center",
                    }}
                  >
                    {items[0].date}
                  </Text>

                  <View
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 6,
                      borderRadius: 16,
                      backgroundColor: "white",
                    }}
                  >
                    <Text style={{ fontWeight: "bold", textAlign: "center" }}>
                      {items[0].value + ".0"}
                    </Text>
                  </View>
                </View>
              );
            },
          }}
        />
      </View>
      <View className="mt-10">
        <Text className=" dark:text-zinc-50 text-zinc-800 font-extrabold text-lg">
          Total de Tempo Ligado: {totalTimeOn} minutos
        </Text>
      </View>
    </View>
  );
};
export default ChartCard;
