// Device type 1

import React, { useState, useEffect, useRef } from "react";
import { db } from "../config";
import { ref, onValue, update } from "firebase/database";
import Device from "./Device";
import { Image, Pressable, View, Text, ImageBackground} from "react-native";

interface FetchDataProps {}

const GateCard: React.FC<FetchDataProps> = () => {
  const [buttonText, setButtonText] = useState<string>("DESCONHECIDO");
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);
  const statusTimerRef = useRef<boolean>(true);
  const fetchData = () => {
    const dataRef = ref(db, "01-portao/status");
    onValue(dataRef, (snapshot) => {
      setIsButtonDisabled(false);
      const data = snapshot.val();
      statusTimerRef.current = false;

      if (data == "FECHADO") {
        setButtonText("Fechado");
      } else if (data == "ABERTO") {
        setButtonText("Aberto");
      } else {
        setButtonText("Desconhecido");
      }
    });
  };

  const sendData = () => {
    setIsButtonDisabled(true);
    if (buttonText === "Fechado") {
      setButtonText("Abrindo");
    } else if (buttonText === "Aberto") {
      setButtonText("Fechando");
    }

    statusTimerRef.current = true;
    const timeoutId = setTimeout(() => {
      if (statusTimerRef.current) {
        setButtonText("Falha");
        setIsButtonDisabled(false);
      }
    }, 20000);

    update(ref(db, "01-portao"), { set: true })
      .then(() => {
        // setStatusEnvio(true);
      })
      .catch((error) => {
        console.error(error);
        clearTimeout(timeoutId);

        if (statusTimerRef.current) {
          setButtonText("Falha");
          setIsButtonDisabled(false);
        }
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
      
        <ImageBackground  className={"m-2"} imageStyle={{ borderRadius: 10}} source={require("../assets/icons/Card.png")}>
      <View className="w-fit flex-row justify-between items-center mt-3 mx-3">
          <Text className="font-extrabold text-lg text-neutral-50">
              Portão Eletronico
          </Text>
          <View className={`rounded-lg h-2 w-2 ${true ? " bg-[#63FF72]" : " bg-red-400" }`}/>
      </View>
      <View className="w-fit flex-row justify-between items-center mx-3">
          <Text className={"text-md font-bold text-gray-400"}>
              {buttonText}
          </Text>
      </View>
        
    <View className="w-full flex-row justify-between">
        <View className="items-start m-4 mt-6">
        {(buttonText == "Abrindo" || buttonText == "Fechando" ) ?  
              (<Image  className = {"h-[42] w-[55]"} source={require("../assets/icons/ProgressGateIcon.png")}/>): 
              (buttonText == "Aberto" ? 
              <Image  className = {"h-[42] w-[55]"} source={require("../assets/icons/OpenGateIcon.png")}/>:
              <Image  className = {"h-[42] w-[55]"} source={require("../assets/icons/ClosedGateIcon.png")}/>
              )
           }
        </View>
        <View className="justify-between flex-row">
          <Pressable 
            disabled = {isButtonDisabled}
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
                    {(buttonText == "Abrindo" || buttonText == "Fechando" ) ?  
                    <Image  className= {"h-20 w-20"} source={require("../assets/icons/GateButtonProgress.png")}/>
                    :
                    <Image  className= {"h-20 w-20"} source={require("../assets/icons/GateButton.png")}/>}
                    </View>
                      );
                    }}
          </Pressable>
        </View>
      </View>
      </ImageBackground>
 
       
    // <Device
    //   connectionStatus={true}
    //   title="Portão Eletrônico"
    //   icon="3"
    //   text={buttonText}
    //   textConfig="text-xl font-bold text-gray-500 mt-2 dark:text-gray-300"
    //   enable={!isButtonDisabled}
    //   loading={isButtonDisabled}
    //   onClick={sendData}
    // ></Device>
  );
};

export default GateCard;
