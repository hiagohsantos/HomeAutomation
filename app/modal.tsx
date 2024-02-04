import { Text, View } from "../components/Themed";
import { useLocalSearchParams, Stack } from "expo-router";
import ChartPageLightDevide from "../components/ChartPageLightDevide";
import ChartPageTempDevice from "../components/ChartPageTempDevice";

const ModalScreen: React.FC = () => {
  const params = useLocalSearchParams();
  const title: string | undefined = params.title as string;
  const id: string | undefined = params.id as string;
  const type = params.type as string;

  return (
    <>
      <Stack.Screen
        options={{
          animation: "slide_from_right",
          title: title,
          headerTintColor: "#d4d4d8",
          headerStyle: {
            backgroundColor: "#212530",
          },
          headerTitleAlign: "center",
          headerTitleStyle: {
            color: "#d4d4d8",
            fontSize: 20,
          },
        }}
      />
      <View className="h-full w-full bg-neutral-900">
        {type === "2" && <ChartPageLightDevide id={id} />}
        {type === "3" && <ChartPageTempDevice id={id} />}
      </View>
    </>
  );
};
export default ModalScreen;
