// Device type 1

import React, { useState, useEffect } from "react";
import { db } from "../config";
import { ref, onValue } from "firebase/database";
import Device from "./Device";

interface DeviceData {
  type: number;
  title: string;
  set?: boolean;
  id: string;
  data: string;
}
//Device type 3
interface CardProps {
  id: string;
}

const InfoCard: React.FC<CardProps> = (id) => {
  const [deviceData, setDeviceData] = useState<DeviceData>();

  const fetchData = () => {
    const dataRef = ref(db, id["id"]);
    onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      setDeviceData({
        ...data,
      });
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Device
      title={deviceData?.title}
      connectionStatus={true}
      text={deviceData?.data ? deviceData?.data : "00"}
      textConfig="text-5xl font-bold text-gray-500 mt-3 dark:text-gray-300"
      enable={false}
      isSwitable={false}
      icon="5"
    ></Device>
  );
};
export default InfoCard;
