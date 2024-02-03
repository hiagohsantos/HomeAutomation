// Device type 1
import React, { useState, useEffect } from "react";
import { db } from "../config";
import { ref, onValue } from "firebase/database";
import { BarChart, LineChart } from "react-native-chart-kit";
import { View, Dimensions, Text, ScrollView } from "react-native";

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

const ChartCard: React.FC<CardProps> = (props) => {
  const [cumulativeData, setCumulativeData] = useState<ChartData[]>([]);
  const [dailyData, setDailyData] = useState<ChartData[]>([]);
  const [acoes, setAcoes] = useState<Action[]>([]);

  const fetchData = () => {
    const dataRef = ref(db, props.id + "/data");
    onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      const listaDeAcoes = criarListaDeAcoes(data).reverse();
      setAcoes(listaDeAcoes);
      const calculatedDailyData = agruparESomarPorDia(
        calculaTempoEntreTimestamps(data)
      );
      const calculatedCumulativeData =
        calcularSomatorioAcumulado(calculatedDailyData);

      setDailyData(calculatedDailyData);
      setCumulativeData(calculatedCumulativeData);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <ScrollView className="mt-12">
      {cumulativeData.length > 0 ? (
        <View>
          <View className=" w-fit items-center m-2 ">
            <LineChart
              data={{
                labels: cumulativeData?.map((point) => point.date),
                datasets: [
                  {
                    data: cumulativeData?.map((point) => point.value),
                  },
                ],
              }}
              width={Dimensions.get("window").width - 20}
              height={200}
              withShadow={true}
              withInnerLines={false}
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "rgba(24, 26, 34, 1)",
                backgroundGradientTo: "rgba(34, 37, 48, 1)",
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
              renderDotContent={({ x, y, index }) =>
                index === cumulativeData.length - 1 ? (
                  <Text
                    key={index}
                    style={{
                      position: "absolute",
                      top: y - 25,
                      left: x - 20,
                      width: 40,
                      textAlign: "center",
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      borderRadius: 6,
                    }}
                  >
                    {cumulativeData[index].value} Hrs
                  </Text>
                ) : null
              }
            />
          </View>
          <View className="w-fit items-center m-2">
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
              height={200}
              withInnerLines={false}
              yAxisLabel=""
              yAxisSuffix=""
              showValuesOnTopOfBars={true}
              chartConfig={{
                stackedBar: true,
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "rgba(24, 26, 34, 1)",
                backgroundGradientTo: "rgba(34, 37, 48, 1)",
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
          <View className=" bg-zinc-800 rounded-xl m-2 divide-y-[1px] divide-[#2DEBFB]">
            <Text
              className={"self-center m-2"}
              style={{ fontSize: 20, marginBottom: 10 }}
            >
              Histórico do dispositivo
            </Text>
            {acoes.map((acao, index) => (
              <View key={index} className=" w-fit, bg-[#1F232C]  p-2 mx-1 ">
                <Text className="font-bold text-neutral-400">{acao.acao}</Text>
                <Text className=" text-neutral-200">{acao.dataHora}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : undefined}
    </ScrollView>
  );
};
export default ChartCard;
