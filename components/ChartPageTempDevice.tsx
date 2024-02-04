// Device type 1
import React, { useState, useEffect, useMemo } from "react";
import { db } from "../config";
import { ref, onValue } from "firebase/database";
import { BarChart, LineChart } from "react-native-chart-kit";
import Checkbox from "expo-checkbox";
import {
  View,
  Dimensions,
  Text,
  ScrollView,
  Button,
  Image,
  Pressable,
} from "react-native";
import SelectDropdown from "react-native-select-dropdown";
import { FontAwesome } from "@expo/vector-icons";

interface DeviceData {
  [timestamp: string]: number;
}

interface CardProps {
  id: string;
}

interface ChartData {
  value: number;
  date: string;
}

interface Action {
  dataHora: string;
  acao: string;
}

const converterDadosParaData = (
  dados: DeviceData,
  sampleRating: number
): ChartData[] => {
  const dadosConvertidos: ChartData[] = [];
  // Função para verificar se o timestamp tem o número correto de caracteres
  const isValidTimestamp = (timestamp: string): boolean =>
    timestamp.length === 10;
  // Pegar 1 em cada 4 registros
  let count = 0;
  for (const timestamp in dados) {
    if (dados.hasOwnProperty(timestamp) && isValidTimestamp(timestamp)) {
      // Aplicar amostragem (1 em cada 4)
      if (count % sampleRating === 0) {
        const valor = dados[timestamp];
        const data = new Date(parseInt(timestamp) * 1000).toISOString();

        dadosConvertidos.push({
          date: data,
          value: valor,
        });
      }
      count++;
    }
  }
  return dadosConvertidos;
};

const filtrarDadosPorDias = (
  dados: ChartData[],
  quantidadeDias: number
): ChartData[] => {
  const dataAtual = new Date();
  const dataLimite = new Date(dataAtual);
  dataLimite.setDate(dataAtual.getDate() - quantidadeDias);
  dataLimite.setHours(0, 0, 0, 0);
  return dados.filter((item) => {
    const dataItem = new Date(item.date);
    return dataItem >= dataLimite && dataItem <= dataAtual;
  });
};

const criarLabels = (dados: ChartData[]): string[] => {
  if (dados.length === 0) {
    return [];
  }

  const primeiraData = new Date(dados[0].date);
  const ultimaData = new Date(dados[dados.length - 1].date);
  const intervaloDeDatas = Math.ceil(
    (ultimaData.getTime() - primeiraData.getTime()) / (1000 * 60 * 60 * 24)
  );
  const passo = Math.max(1, Math.floor(intervaloDeDatas / 5));

  const labels: string[] = [
    primeiraData.toLocaleDateString("pt-br", {
      month: "2-digit",
      day: "2-digit",
    }),
  ]; // Adiciona a primeira data formatada

  for (let i = 1; i <= 4; i++) {
    const indice = i * passo;
    if (indice < dados.length) {
      const dataFormatada = new Date(dados[indice].date).toLocaleDateString(
        "pt-br",
        { month: "2-digit", day: "2-digit" }
      );
      labels.push(dataFormatada);
    }
  }

  labels.push(
    ultimaData.toLocaleDateString("pt-br", { month: "2-digit", day: "2-digit" })
  ); // Adiciona a última data formatada

  return labels;
};

//
//

const ChartPageTempDevice: React.FC<CardProps> = (props) => {
  const [rawData, setRawData] = useState<ChartData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [dataRange, setDataRange] = useState<number>(0);
  const [actionListSize, setActionListSize] = useState<number>(5);

  const fetchData = () => {
    const dataRef = ref(db, props.id);
    onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      setRawData(converterDadosParaData(data.data, 15));
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let filteredData = [];

    if (dataRange === 1) {
      // 30 days
      filteredData = filtrarDadosPorDias(rawData, 30);
    } else if (dataRange === 0) {
      // 7 days
      filteredData = filtrarDadosPorDias(rawData, 2);
    } else {
      filteredData = rawData;
    }
    console.log(dataRange);
    console.log(filteredData);
    setChartData(filteredData);
  }, [rawData, dataRange]);

  return (
    <ScrollView className="bg-[#1F232C]">
      {chartData.length > 0 ? (
        <View className="w-fit items-center m-2 bg-[#222530] rounded-xl">
          <Text className="m-1 text-slate-200 font-bold text-lg">
            Dados do dispositivo
          </Text>
          <View className=" w-full flex-row justify-end">
            <View className=" w-28 justify-end">
              <SelectDropdown
                data={["7 dias", "30 dias", "Tudo"]}
                defaultButtonText={"Periodo"}
                defaultValueByIndex={0}
                onSelect={(selectedItem, index) => {
                  setDataRange(index);
                }}
                dropdownStyle={{ backgroundColor: "#313745" }}
                rowStyle={{
                  backgroundColor: "#313745",
                  borderBottomColor: "#C5C5C5",
                }}
                buttonTextStyle={{ color: "rgb(161, 161, 170)" }}
                buttonStyle={{
                  width: "100%",
                  height: 25,
                  backgroundColor: "#313745",
                  borderRadius: 8,
                }}
                rowTextStyle={{
                  backgroundColor: "#313745",
                  color: "rgb(161, 161, 170)",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
                dropdownIconPosition={"right"}
                renderDropdownIcon={(isOpened) => {
                  return (
                    <FontAwesome
                      name={isOpened ? "chevron-up" : "chevron-down"}
                      color={"#1f99a3"}
                      size={12}
                    />
                  );
                }}
                buttonTextAfterSelection={(selectedItem, index) => {
                  return selectedItem;
                }}
                rowTextForSelection={(item, index) => {
                  return item;
                }}
              />
            </View>
          </View>
          <View className="bg-[#313745] w-fit m-2 rounded-xl">
            <Text className=" self-center m-2 text-slate-200 w-fit text-xs">
              Dados
            </Text>
            <LineChart
              data={{
                labels: criarLabels(chartData),
                datasets: [
                  {
                    data: chartData?.map((point) => point.value),
                  },
                ],
              }}
              bezier
              fromZero={true}
              width={Dimensions.get("window").width - 20} // from react-native
              height={180}
              yAxisInterval={1} // optional, defaults to 1
              withVerticalLines={false}
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#313745",
                backgroundGradientTo: "#313745",
                decimalPlaces: 1, // optional, defaults to 2dp
                color: (opacity = 0) => `rgba(31, 153, 163, ${opacity})`,
                labelColor: (opacity = 0.6) =>
                  `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 6,
                },
                propsForDots: {
                  r: "1",
                  strokeWidth: "1",
                },
              }}
              style={{
                marginVertical: 6,
                borderRadius: 16,
              }}
            />
          </View>
        </View>
      ) : (
        <View className="w-fit items-center m-2 bg-[#222530] rounded-xl">
          <Text className="m-1 text-slate-200 font-bold text-lg">
            Dados do dispositivo
          </Text>
          <View className=" w-full flex-row justify-end">
            <View className=" w-28 justify-end">
              <SelectDropdown
                data={["7 dias", "30 dias", "Tudo"]}
                defaultButtonText={"Periodo"}
                defaultValueByIndex={0}
                onSelect={(selectedItem, index) => {
                  setDataRange(index);
                }}
                dropdownStyle={{ backgroundColor: "#313745" }}
                rowStyle={{
                  backgroundColor: "#313745",
                  borderBottomColor: "#C5C5C5",
                }}
                buttonTextStyle={{ color: "rgb(161, 161, 170)" }}
                buttonStyle={{
                  width: "100%",
                  height: 25,
                  backgroundColor: "#313745",
                  borderRadius: 8,
                }}
                rowTextStyle={{
                  backgroundColor: "#313745",
                  color: "rgb(161, 161, 170)",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
                dropdownIconPosition={"right"}
                renderDropdownIcon={(isOpened) => {
                  return (
                    <FontAwesome
                      name={isOpened ? "chevron-up" : "chevron-down"}
                      color={"#1f99a3"}
                      size={12}
                    />
                  );
                }}
                buttonTextAfterSelection={(selectedItem, index) => {
                  return selectedItem;
                }}
                rowTextForSelection={(item, index) => {
                  return item;
                }}
              />
            </View>
          </View>
          <View className="bg-[#313745] w-fit m-2 rounded-xl">
            <Text className=" self-center m-2 text-slate-200 w-fit text-xs">
              Dados
            </Text>
            <LineChart
              data={{
                labels: [],
                datasets: [
                  {
                    data: [0],
                  },
                ],
              }}
              bezier
              fromZero={true}
              width={Dimensions.get("window").width - 20} // from react-native
              height={180}
              yAxisInterval={1} // optional, defaults to 1
              withVerticalLines={false}
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#313745",
                backgroundGradientTo: "#313745",
                decimalPlaces: 1, // optional, defaults to 2dp
                color: (opacity = 0) => `rgba(31, 153, 163, ${opacity})`,
                labelColor: (opacity = 0.6) =>
                  `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 6,
                },
                propsForDots: {
                  r: "1",
                  strokeWidth: "1",
                },
              }}
              style={{
                marginVertical: 6,
                borderRadius: 16,
              }}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
};
export default ChartPageTempDevice;
