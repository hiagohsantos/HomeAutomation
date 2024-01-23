// Device type 1

import React, { useState, useEffect, useRef } from "react";
import { db } from "../config";
import { ref, onValue, update } from "firebase/database";
import Device from "./Device";

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
    <Device
      connectionStatus={true}
      title="Portão Eletrônico"
      icon="3"
      text={buttonText}
      textConfig="text-2xl font-bold text-gray-500 mt-2 dark:text-gray-300"
      enable={!isButtonDisabled}
      loading={isButtonDisabled}
      onClick={sendData}
    ></Device>
  );
};

export default GateCard;
