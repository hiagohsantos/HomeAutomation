// Device type 2
import React, { useState, useEffect, useRef } from "react";
import { db } from "../config";
import { ref, onValue, update } from "firebase/database";
import Device from "./Device";
import { RectButton } from "react-native-gesture-handler";

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
    }, 5000);

    update(ref(db, id["id"]), { set: true })
      .then((response) => {})
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <Device
      title={deviceData?.title}
      connectionStatus={true}
      text={buttonStatus ? "Ligado" : "Desligado"}
      textConfig="text-2xl font-bold text-gray-500 mt-2 dark:text-gray-300"
      enable={true}
      onClick={sendData}
      isSwitable={true}
      status={buttonStatus}
      icon="4"
    ></Device>
  );
};
export default LightCard;
