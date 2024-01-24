import { StyleSheet } from "react-native";
import { Text, View } from "react-native";
import LottieView from "lottie-react-native";

export default function TabTwoScreen() {
  return (
    <View className="flex-1 items-center bg-neutral-50 dark:bg-neutral-900">
      <Text className="text-2xl mt-3 text-zinc-600 font-bold dark:text-zinc-300">
        Perfil
      </Text>
      <Text className="text-md mt-3 text-zinc-600 font-bold dark:text-zinc-300">
        Ops, parece que esta página ainda não está pronta. 
      </Text>
      <Text className="text-xs my-3 text-zinc-600 font-bold dark:text-zinc-300">
       Aguarde por novas atualizações...
      </Text>
      <View className="my-30 h-px w-4/5 dark:bg-zinc-400 bg-[#eee]" />
      <LottieView
        source={require("../../assets/animations/construction.json")}
        autoPlay={true}
        loop={true}
      ></LottieView>
    </View>
  );
}
