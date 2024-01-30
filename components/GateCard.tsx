// Device type 1

import React, { useState, useEffect, useRef } from "react";
import { db } from "../config";
import { ref, onValue, update } from "firebase/database";
import Device from "./Device";
import { Image, Pressable, View, Text, ImageBackground } from "react-native";

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
    <ImageBackground
      className={"m-1"}
      imageStyle={{ borderRadius: 10 }}
      source={require("../assets/icons/Card.png")}
    >
      <View className="w-fit m-2">
        <View className="w-fit flex-row justify-between items-center ml-3">
          <Text className="font-extrabold text-lg text-neutral-50">
            Portão Eletrônico
          </Text>
          <View
            className={`rounded-lg h-2 w-2 self-stretch ${
              true ? " bg-[#63FF72]" : " bg-red-400"
            }`}
          />
        </View>
        <View className="w-fit flex-row justify-between items-center mx-3">
          <Text className={"text-md font-bold text-gray-400"}>
            {buttonText}
          </Text>
        </View>

        <View className="w-fit flex-row justify-between items-center">
          <View className="items-start p-2">
            {buttonText == "Abrindo" ? (
              <Image
                className={"h-[40] w-[80]"}
                source={require("../assets/icons/OpeningGate.png")}
              />
            ) : buttonText == "Fechando" ? (
              <Image
                className={"h-[40] w-[80]"}
                source={require("../assets/icons/ClosingGate.png")}
              />
            ) : buttonText == "Aberto" ? (
              <Image
                className={"h-[40] w-[80]"}
                source={require("../assets/icons/OpenGate.png")}
              />
            ) : buttonText == "Fechado" ? (
              <Image
                className={"h-[40] w-[80]"}
                source={require("../assets/icons/ClosedGate.png")}
              />
            ) : (
              <Image
                className={"h-[40] w-[80]"}
                source={require("../assets/icons/ErrorGate.png")}
              />
            )}
          </View>
          <View className="items-start justify-between flex-row">
            <Pressable
              disabled={isButtonDisabled}
              className="m-1"
              onPress={sendData}
            >
              {({ pressed }) => {
                return (
                  <View
                    style={{
                      transform: [
                        {
                          scale: pressed ? 0.96 : 1,
                        },
                      ],
                    }}
                  >
                    {buttonText == "Abrindo" || buttonText == "Fechando" ? (
                      <Image
                        className={"h-20 w-20"}
                        source={require("../assets/icons/GateButtonProgress.png")}
                      />
                    ) : (
                      <Image
                        className={"h-20 w-20"}
                        source={require("../assets/icons/GateButton.png")}
                      />
                    )}
                  </View>
                );
              }}
            </Pressable>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

export default GateCard;
