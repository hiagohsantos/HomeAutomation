// Device type 2
import React, { useState, useEffect, useRef } from "react";
import { db } from "../config";
import { ref, onValue, update } from "firebase/database";
import { Image, Pressable, View, Text, ImageBackground} from "react-native";

interface DeviceData {
  status: boolean;
  type: number;
  title: string;
  set: boolean;
  id: string;
}

interface CardProps {
  id: string;
}

const LightCard: React.FC<CardProps> = (id) => {
  const [deviceData, setDeviceData] = useState<DeviceData>();
  const [buttonStatus, setButtonStatus] = useState<boolean>(false);
  const statusTimerRef = useRef<boolean>(false);

  useEffect(() => {
    const dataRef = ref(db, id["id"]);
    onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      setDeviceData({
        ...data,
      });
    });
  }, []);

  useEffect(() => {
    const dataRef = ref(db, id["id"] + "/status");
    onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      statusTimerRef.current = false;
      setButtonStatus(data);
    });
  }, []);

  const sendData = () => {
    statusTimerRef.current = true;
    setButtonStatus((status) => !status);

    // Aguarde 5 segundos antes de reverter o estado do botão
    const timeoutId = setTimeout(() => {
      if (statusTimerRef.current) {
        setButtonStatus((status) => !status);
      }
      clearTimeout(timeoutId);
    }, 8000);

    update(ref(db, id["id"]), { set: true })
      .then((response) => {})
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <ImageBackground  className={"m-2"} imageStyle={{ borderRadius: 10}} source={require("../assets/icons/Card.png")}>
          <View className={`rounded-lg  ${buttonStatus ? "border border-[#63FF72]" : "border-0"}`}>
            <View className="w-fit flex-row justify-between items-center mt-3 mx-3">
                <Text className="font-extrabold text-lg text-neutral-50">
                    {deviceData?.title ? deviceData?.title : "Dispositivo"}
                </Text>
                <View className={`rounded-lg h-2 w-2 ${true ? " bg-[#63FF72]" : " bg-red-400" }`}/>
            </View>
            <View className="w-fit flex-row justify-between items-center mx-3">
                <Text className={"text-md font-bold text-gray-400"}>
                    {buttonStatus ? "Ligado" : "Desligado"}
                </Text>
            </View>
              
           <View className="w-full flex-row justify-between">
              <View className="items-start m-4">
                  {buttonStatus ? 
                    <Image  className= {"h-14 w-14"} source={require("../assets/icons/LightOn.png")}/>: 
                    <Image  className= {"h-14 w-14"} source={require("../assets/icons/LightOff.png")}/>
                  }
              </View>
              <View className="justify-between flex-row">
                <Pressable
                  className="m-1"
                  onPress={sendData}
                  >
                  {({ pressed }) => {
                        return (
                          <View style={{
                            transform: [
                              {
                                scale: pressed ? 0.96 : 1,
                              },
                            ],
                          }}>
                          {buttonStatus ? 
                          <Image  className= {"h-20 w-20"} source={require("../assets/icons/PowerButtonOn.png")}/>
                          :
                          <Image  className= {"h-20 w-20"} source={require("../assets/icons/PowerButtonOff.png")}/>}
                          </View>
                            );
                          }}
                 </Pressable>
              </View>
            </View>
          </View>
        </ImageBackground>
    // <Device
    //   title={deviceData?.title}
    //   connectionStatus={true}
    //   text={buttonStatus ? "Ligado" : "Desligado"}
    //   textConfig="text-xl font-bold text-gray-500 mt-2 dark:text-gray-300"
    //   enable={true}
    //   onClick={sendData}
    //   isSwitable={true}
    //   status={buttonStatus}
    //   icon="4"
    // ></Device>
  );
};
export default LightCard;
