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
  [timestamp: string]: boolean;
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

const criarListaDeAcoes = (dados: DeviceData): Action[] => {
  return Object.entries(dados).map(([timestamp, acao]: [string, boolean]) => {
    const dataHora = new Date(parseInt(timestamp) * 1000).toLocaleDateString(
      "pt-br",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }
    );
    const acaoTexto = acao ? "Dispositivo Ativado" : "Dispositivo Desativado";

    return {
      dataHora,
      acao: acaoTexto,
    };
  });
};

const agruparESomarPorDia = (dados: ChartData[]): ChartData[] => {
  const resultadoAgrupado: Record<string, number> = {};
  dados.forEach((registro) => {
    const dia = registro.date;
    if (resultadoAgrupado[dia]) {
      // Se o dia já estiver presente, adiciona o valor ao total existente
      resultadoAgrupado[dia] += registro.value;
    } else {
      // Se o dia ainda não estiver presente, cria uma nova entrada
      resultadoAgrupado[dia] = registro.value;
    }
  });
  // Converte o objeto de volta para um array de objetos
  const resultadoFinal: ChartData[] = Object.keys(resultadoAgrupado).map(
    (dia) => ({
      date: dia,
      value: resultadoAgrupado[dia],
    })
  );
  return resultadoFinal;
};

const calculaTempoEntreTimestamps = (dados: DeviceData[]): ChartData[] => {
  // Calcular o tempo total ligado quando os dados mudam
  let lastTimestamp: string | null = null;
  const newData: ChartData[] = [];
  Object.entries(dados).forEach(([timestamp, status]) => {
    if (!status) {
      // Se o estado for false (desligado), verifica o último evento de ligar(true)
      if (lastTimestamp !== null) {
        const timeOn = parseInt(timestamp) - parseInt(lastTimestamp);

        // Adiciona o ponto ao array de dados do gráfico
        newData.push({
          value: parseFloat((timeOn / (60 * 60)).toFixed(1)),
          date: new Date(parseInt(lastTimestamp) * 1000).toLocaleDateString(
            "pt-br",
            {
              month: "2-digit",
              day: "2-digit",
            }
          ),
        });
      }
    }
    lastTimestamp = timestamp;
  });
  return newData;
};

// Função para agrupar os dados pelos dias e calcular o somatório acumulado
const calcularSomatorioAcumulado = (dados: ChartData[]): ChartData[] => {
  let somatorioAcumulado = 0;
  const resultadoFinal: ChartData[] = dados.map((registro) => {
    somatorioAcumulado += registro.value;
    return {
      date: registro.date,
      value: somatorioAcumulado,
    };
  });
  return resultadoFinal;
};

const converterStringParaData = (dataString: string): Date => {
  const [dia, mes] = dataString.split("/");
  const anoAtual = new Date().getFullYear(); // Assume o ano atual, mas você pode ajustar conforme necessário
  return new Date(anoAtual, parseInt(mes) - 1, parseInt(dia));
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
    const dataItem = converterStringParaData(item.date);
    return dataItem >= dataLimite && dataItem <= dataAtual;
  });
};

const calculaConsumo = (
  consumo: number,
  dadosFiltrados: ChartData[]
): ChartData[] => {
  return dadosFiltrados.map((item) => ({
    date: item.date,
    value: parseFloat((item.value * consumo).toFixed(1)),
  }));
};

const limitarQuantidadeDados = (
  dados: ChartData[],
  quantidadeMaxima: number
): ChartData[] => {
  if (dados.length <= quantidadeMaxima) {
    // Se houver menos ou igual à quantidade máxima desejada, retorna todos os dados
    return dados;
  }
  const resultado = [];
  // Adiciona o primeiro ponto
  resultado.push(dados[0]);
  // Filtra os pontos não nulos
  const dadosNaoNulos = dados.filter((item) => item.value !== 0);
  // Calcula o intervalo para os pontos intermediários
  const intervalo = Math.max(
    1,
    Math.floor((dadosNaoNulos.length - 2) / Math.max(1, quantidadeMaxima - 2))
  );
  // Adiciona os pontos intermediários não nulos
  for (let i = 1; i <= quantidadeMaxima - 2; i++) {
    const indexIntermediario = Math.min(
      i * intervalo,
      dadosNaoNulos.length - 1
    );
    resultado.push(dadosNaoNulos[indexIntermediario]);
  }
  // Adiciona o último ponto
  resultado.push(dados[dados.length - 1]);
  return resultado;
};

//
//

const ChartPageLightDevide: React.FC<CardProps> = (props) => {
  const [rawData, setRawData] = useState<ChartData[]>([]);
  const [cumulativeData, setCumulativeData] = useState<ChartData[]>([]);
  const [dailyData, setDailyData] = useState<ChartData[]>([]);
  const [acoes, setAcoes] = useState<Action[]>([]);

  const [current, setCurrent] = useState<number>(0.0);
  const [voltage, setVoltage] = useState<number>(0.0);
  const [isChecked, setChecked] = useState<boolean>(false);
  const [dataRange, setDataRange] = useState<number>(0);

  const [actionListSize, setActionListSize] = useState<number>(5);

  const fetchData = () => {
    const dataRef = ref(db, props.id);
    onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      setCurrent(data.current);
      setVoltage(data.voltage);
      const listaDeAcoes = criarListaDeAcoes(data.data).reverse();
      setAcoes(listaDeAcoes);
      const timeBetweenTimestamps = calculaTempoEntreTimestamps(data.data);
      setRawData(timeBetweenTimestamps);
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
      filteredData = filtrarDadosPorDias(rawData, 7);
    } else {
      filteredData = rawData;
    }
    if (isChecked) {
      filteredData = calculaConsumo((current * voltage) / 1000, filteredData);
    }
    const calculatedDailyData = agruparESomarPorDia(filteredData);

    // Daily Data (Bar chart)
    const limitedDailyData = limitarQuantidadeDados(calculatedDailyData, 7);

    setDailyData(limitedDailyData);

    // Cumulative Data (Line Chart)
    const calculatedCumulativeData =
      calcularSomatorioAcumulado(calculatedDailyData);
    const limitedCumulativeData = limitarQuantidadeDados(
      calculatedCumulativeData,
      8
    );

    setCumulativeData(limitedCumulativeData);
  }, [rawData, isChecked, dataRange]);

  return (
    <ScrollView className="bg-[#1F232C]">
      <View className="w-fit items-center m-2 p-2 bg-[#222530]  rounded-xl">
        <Text className="m-1 text-slate-200 font-bold text-lg">
          Informações do dispositivo
        </Text>
        <View className=" m-1 w-full justify-between flex-row bg-[#313745] rounded-lg">
          <Text className=" self-start m-2 text-slate-200">Corrente</Text>
          <Text className=" self-start m-2 text-slate-200">{current} A</Text>
        </View>

        <View className=" m-1 w-full justify-between flex-row bg-[#313745] rounded-lg">
          <Text className=" self-start m-2 text-slate-200">Tensão</Text>
          <Text className=" self-start m-2 text-slate-200">{voltage} V</Text>
        </View>

        <View className=" m-1 w-full justify-between flex-row bg-[#313745] rounded-lg  ">
          <Text className="self-start m-2 text-slate-200 w-fit">Potência</Text>
          <Text className=" self-start m-2 text-slate-200 w-fit">
            {((voltage * current) / 1000).toFixed(2)} kW
          </Text>
        </View>
      </View>
      {dailyData.length > 0 ? (
        <View className="w-fit items-center m-2 bg-[#222530] rounded-xl">
          <View className=" w-full flex-row justify-evenly">
            <View className="flex-row items-center ">
              <Checkbox
                style={{
                  margin: 8,
                }}
                value={isChecked}
                onValueChange={() => setChecked(true)}
                color={isChecked ? "#1f99a3" : undefined}
              />
              <Text className=" text-slate-200 w-fit">Consumo</Text>
            </View>
            <View className="flex-row items-center ">
              <Checkbox
                style={{
                  margin: 8,
                }}
                value={!isChecked}
                onValueChange={() => setChecked(false)}
                color={!isChecked ? "#1f99a3" : undefined}
              />
              <Text className=" text-slate-200">Tempo</Text>
            </View>
            <View className=" w-28 justify-center">
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
                  // text represented after item is selected
                  // if data array is an array of objects then return selectedItem.property to render after item is selected
                  return selectedItem;
                }}
                rowTextForSelection={(item, index) => {
                  // text represented for each item in dropdown
                  // if data array is an array of objects then return item.property to represent item in dropdown
                  return item;
                }}
              />
            </View>
          </View>
          <View className="bg-[#313745] w-fit m-2 rounded-xl">
            <Text className=" self-center m-2 text-slate-200 w-fit text-xs">
              {isChecked
                ? "Consumo cumulativo (kWh)"
                : "Tempo cumulativo (Horas)"}
            </Text>
            <LineChart
              data={{
                labels: cumulativeData?.map((point) => point.date),
                datasets: [
                  {
                    data: cumulativeData?.map((point) => point.value),
                  },
                ],
              }}
              bezier
              fromZero={true}
              width={Dimensions.get("window").width - 20} // from react-native
              height={180}
              yAxisInterval={1} // optional, defaults to 1
              withVerticalLines={true}
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
                  r: "2",
                  strokeWidth: "1",
                },
              }}
              style={{
                marginVertical: 6,
                borderRadius: 16,
              }}
              renderDotContent={({ x, y, index }) =>
                index === cumulativeData.length - 1 ? (
                  <Text
                    className={`text-slate-100 absolute text-xs`}
                    key={index}
                    style={{
                      top: y - 25,
                      left: x - 10,
                    }}
                  >
                    {cumulativeData[index].value}
                  </Text>
                ) : null
              }
            />
          </View>
          <View className="w-fit bg-[#313745] m-2 rounded-xl">
            <Text className="self-center m-2 text-slate-200 w-fit text-xs">
              {isChecked ? "Consumo diário (kWh)" : "Tempo diário (Horas)"}
            </Text>
            <BarChart
              data={{
                labels: dailyData?.map((point) => point.date),
                datasets: [
                  {
                    data: dailyData?.map((point) => point.value),
                  },
                ],
              }}
              width={Dimensions.get("window").width - 20}
              height={180}
              withInnerLines={false}
              yAxisLabel=""
              yAxisSuffix=""
              fromZero={true}
              showValuesOnTopOfBars={true}
              chartConfig={{
                stackedBar: true,
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#313745",
                backgroundGradientTo: "#313745",
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(31, 153, 163, ${opacity})`,
                labelColor: (opacity = 0.6) =>
                  `rgba(255, 255, 255, ${opacity})`,
                style: {},
              }}
              style={{
                marginVertical: 3,
                borderRadius: 6,
              }}
            />
          </View>
          <View className="w-full bg-[#222530]  rounded-xl m-2 divide-y-[1px] divide-[#1f99a3]">
            <Text className={"self-center m-2 text-lg text-gray-200"}>
              Histórico do dispositivo
            </Text>
            {acoes.slice(0, actionListSize).map((acao, index) => (
              <View key={index} className=" bg-[#313745]  p-2 mx-1 m-1">
                <Text className="font-bold text-neutral-400">{acao.acao}</Text>
                <Text className=" text-neutral-200">{acao.dataHora}</Text>
              </View>
            ))}
          </View>
          {actionListSize < acoes.length ? (
            <Pressable
              onPress={() => {
                setActionListSize(actionListSize + 10);
              }}
            >
              <Text className=" text-slate-200 text-xs bg-[#313745] p-1 px-2 rounded-xl">
                Carregar mais
              </Text>
            </Pressable>
          ) : (
            <Text className=" text-slate-200 text-xs">
              Nao há mais itens no histórico.
            </Text>
          )}
        </View>
      ) : (
        <View className="w-fit items-center m-2 bg-[#222530] rounded-xl">
          <View className=" w-full flex-row justify-evenly">
            <View className="flex-row items-center ">
              <Checkbox
                style={{
                  margin: 8,
                }}
                value={isChecked}
                onValueChange={() => setChecked(true)}
                color={isChecked ? "#1f99a3" : undefined}
              />
              <Text className=" text-slate-200 w-fit">Consumo</Text>
            </View>
            <View className="flex-row items-center ">
              <Checkbox
                style={{
                  margin: 8,
                }}
                value={!isChecked}
                onValueChange={() => setChecked(false)}
                color={!isChecked ? "#1f99a3" : undefined}
              />
              <Text className=" text-slate-200">Tempo</Text>
            </View>
            <View className="w-28 justify-center">
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
                  // text represented after item is selected
                  // if data array is an array of objects then return selectedItem.property to render after item is selected
                  return selectedItem;
                }}
                rowTextForSelection={(item, index) => {
                  // text represented for each item in dropdown
                  // if data array is an array of objects then return item.property to represent item in dropdown
                  return item;
                }}
              />
            </View>
          </View>
          <View className="bg-[#313745] w-fit m-2 rounded-xl">
            <Text className=" self-center m-2 text-slate-200 w-fit text-xs">
              {isChecked
                ? "Consumo cumulativo (kWh)"
                : "Tempo cumulativo (Horas)"}
            </Text>
            <LineChart
              data={{
                labels: [""],
                datasets: [{ data: [0] }],
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
                decimalPlaces: 2, // optional, defaults to 2dp
                color: (opacity = 1) => `rgba(130, 138, 158, ${opacity})`,
                labelColor: (opacity = 0.6) =>
                  `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 6,
                },
                propsForDots: {
                  r: "2",
                  strokeWidth: "1",
                },
              }}
              style={{
                marginVertical: 6,
                borderRadius: 16,
              }}
            />
          </View>
          <View className="w-fit bg-[#313745] m-2 rounded-xl">
            <Text className="self-center m-2 text-slate-200 w-fit text-xs">
              {isChecked ? "Consumo diário (kWh)" : "Tempo diário (Horas)"}
            </Text>
            <BarChart
              data={{
                labels: [],
                datasets: [{ data: [0] }],
              }}
              width={Dimensions.get("window").width - 20}
              height={180}
              withInnerLines={false}
              yAxisLabel=""
              yAxisSuffix=""
              showValuesOnTopOfBars={true}
              chartConfig={{
                stackedBar: true,
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#313745",
                backgroundGradientTo: "#313745",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(130, 138, 158, ${opacity})`,
                labelColor: (opacity = 0.6) =>
                  `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 6,
                },
              }}
              style={{
                marginVertical: 3,
                borderRadius: 6,
              }}
            />
          </View>
          <View className="w-full bg-[#222530]  rounded-xl m-2 divide-y-[1px] divide-[#2DEBFB]">
            <Text className={"self-center m-2 text-lg text-gray-200"}>
              Histórico do dispositivo
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};
export default ChartPageLightDevide;
