import { Text, View } from "../../components/Themed";
import LottieView from "lottie-react-native";
import ChartCard from "../../components/ChartCard";

export default function TabTwoScreen() {
  return (
    <View className="h-full bg-neutral-50 dark:bg-neutral-900">
      <ChartCard id={"02-holofoteAcude"}></ChartCard>
    </View>
    // <View className="flex-1 items-center">
    //   <Text className="text-2xl mt-3 text-[#00636E] font-extrabold dark:text-[#CCD6DE]">
    //     Home
    //   </Text>
    //   <View className="my-30 h-px w-4/5 dark:bg-zinc-400 bg-[#eee]" />
    //   <LottieView
    //     source={require("../../assets/animations/home.json")}
    //     autoPlay={true}
    //     loop={true}
    //   ></LottieView>
    // </View>
  );
}
