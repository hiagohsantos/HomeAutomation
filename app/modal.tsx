import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet } from "react-native";
import { Text, View } from "../components/Themed";

export default function ModalScreen() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-lg font-semibold ">Informações</Text>
      <View className="my-30 h-px w-4/5 dark:bg-zinc-400 bg-[#eee]" />
    </View>
  );
}
