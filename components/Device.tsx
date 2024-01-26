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
  Image,
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
              status ? "border border-[#63FF72]" : "border-0"
            }
                 my-2 p-3  bg-zinc-300  ${
                   pressed || !enable
                     ? " bg-[#404658] "
                     : "bg-[#2a2e3a]  "
                 } `}
            style={{
              transform: [
                {
                  scale: pressed ? 0.98 : 1,
                },
              ],
            }}
          >
            <View className="flex-1 min-h-[80]">
              <View className=" w-full items-end">
                <View className={`rounded-lg  h-2 w-2 ${
                    connectionStatus ? " bg-[#63FF72]" : " bg-red-400"
                  }`}
                />
              </View>
              <View className=" flex-row"> 
                <View className="items-start">
                  {icon && iconMapping[icon] ? (
                    iconMapping[icon]
                  ) : (
                    <FontAwesome name="gears" size={size} color={color} />
                  )}
                </View>
              <View className=" max-w-[160] ml-1">
                <Text className="font-bold text-lg text-gray-500">
                  {title ? title : "Dispositivo"}
                </Text>
              </View>
              </View>
              
            </View>
            <View className=" divide-y divide-neutral-900">
             

              <View className="justify-between flex-row">
                <Text className={textConfig}>
                  {text ? text : "Desconhecido"}
                </Text>
                
                {loading && <ActivityIndicator size="small" color="#34d399" />}
                {isSwitable && (
                  <Pressable>
                  {({ pressed }) => {
                        return (
                          <View style={{
                            transform: [
                              {
                                scale: pressed ? 0.96 : 1,
                              },
                            ],
                          }}>
                          {status ? 
                          <Image  className= {"h-20 w-20"} source={require("../assets/icons/PowerButtonOn.png")}/>
                          :
                          <Image  className= {"h-20 w-20"} source={require("../assets/icons/PowerButtonOff.png")}/>}
                          </View>
                            );
                          }}
            </Pressable>
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
