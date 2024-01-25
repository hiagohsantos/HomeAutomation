import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { Switch } from "react-native-switch";
import {
  useColorScheme,
  Pressable,
  Text,
  ActivityIndicator,
  View,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

interface CardProps {
  status?: boolean;
  title?: string;
  description?: string;
  icon?: string;
  text?: string;
  textConfig?: string;
  enable?: boolean;
  isSwitable?: boolean;
  connectionStatus?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

const Device: React.FC<CardProps> = ({
  status,
  title,
  icon,
  text,
  textConfig,
  enable,
  isSwitable,
  connectionStatus,
  loading,
  onClick,
}) => {
  const size = 25;
  const colorScheme = useColorScheme() === "light";
  const color = colorScheme ? "#0F172A" : "#9ca3af";

  const iconMapping: Record<string, React.ReactNode> = {
    "1": (
      <MaterialCommunityIcons
        name="home-automation"
        size={size}
        color={color}
      />
    ),
    "2": (
      <MaterialCommunityIcons
        name="temperature-celsius"
        size={size}
        color={color}
      />
    ),
    "3": <MaterialCommunityIcons name="gate" size={size} color={color} />,
    "4": <MaterialCommunityIcons name="lightbulb" size={size} color={color} />,
    "5": (
      <MaterialCommunityIcons name="weather-cloudy" size={size} color={color} />
    ),

    // Adicione mais mapeamentos conforme necessário
  };

  return (
    
    <Pressable
      disabled={!enable}
      onLongPress={onClick}
      className="w-[190px] flex-1 mx-2 "
    >
      {({ pressed }) => {
        return (
          <View
            className={`rounded-lg ${
              status ? "border border-green-400" : "border-0"
            }
                 my-2 p-3  bg-zinc-300  ${
                   pressed || !enable
                     ? " bg-neutral-100 dark:bg-neutral-800"
                     : "bg-neutral-200 dark:bg-neutral-700"
                 } `}
            style={{
              transform: [
                {
                  scale: pressed ? 0.98 : 1,
                },
              ],
            }}
          >
            <View className="flex-row justify-between ">
              <View className="items-start">
                {icon && iconMapping[icon] ? (
                  iconMapping[icon]
                ) : (
                  <FontAwesome name="gears" size={size} color={color} />
                )}
              </View>

              <View
                className={` rounded-md items-center justify-center ${
                  connectionStatus ? " bg-green-400" : " bg-red-400"
                }`}
              >
                <Text className=" text-xs m-1 font-bold">
                  {connectionStatus ? "Ativo" : "Inativo"}
                </Text>
              </View>
            </View>
            <View className=" divide-y divide-neutral-900">
              <Text className="font-bold text-lg text-gray-500">
                {title ? title : "Dispositivo"}
              </Text>

              <View className="justify-between flex-row">
                <Text className={textConfig}>
                  {text ? text : "Desconhecido"}
                </Text>
                {loading && <ActivityIndicator size="small" color="#34d399" />}
                {isSwitable && (
                  <View className="mt-3 mr-4">
                    <Switch
                      value={status}
                      disabled={false}
                      activeText={"On"}
                      inActiveText={"Off"}
                      circleSize={20}
                      barHeight={20}
                      circleBorderWidth={3}
                      backgroundActive={"#34d399"}
                      backgroundInactive={"gray"}
                      circleActiveColor={"#737373"}
                      circleInActiveColor={"#000000"}
                      changeValueImmediately={true} // if rendering inside circle, change state immediately or wait for animation to complete
                      renderActiveText={false}
                      renderInActiveText={false}
                    />
                  </View>
                )}
              </View>
            </View>

          </View>
        );
      }}
    </Pressable>
  );
};
export default Device;
