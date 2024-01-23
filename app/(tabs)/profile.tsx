import { StyleSheet } from "react-native";
import { Text, View } from "../../components/Themed";
import LottieView from "lottie-react-native";

export default function TabTwoScreen() {
  return (
    <View className="flex-1 items-center">
      <Text className="text-2xl mt-3 text-[#00636E] font-extrabold dark:text-[#CCD6DE]">
        Perfil
      </Text>
      <View className="my-30 h-px w-4/5 dark:bg-zinc-400 bg-[#eee]" />
      <LottieView
        source={require("../../assets/animations/profile.json")}
        autoPlay={true}
        loop={true}
      ></LottieView>
    </View>
  );
}
