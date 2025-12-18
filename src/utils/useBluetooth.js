import { useState, useCallback, useEffect } from "react";

// ✅ 1. 모든 알파벳을 소문자로 변경했습니다.
const PRIMARY_SERVICE_UUID = "0000ffe0-0000-1000-8000-00805f9b34fb";
const DATA_CHARACTERISTIC_UUID = "0000ffe1-0000-1000-8000-00805f9b34fb";
const OPTIONAL_SERVICES = [PRIMARY_SERVICE_UUID];

export const useBluetooth = () => {
  const [device, setDevice] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [latestData, setLatestData] = useState(null); 
  const [history, setHistory] = useState([]);

  const requestDevice = useCallback(async () => {
    if (!navigator.bluetooth) {
      alert("❌ Web Bluetooth가 지원되지 않는 브라우저입니다.");
      return;
    }

    setIsSearching(true);
    setError(null);
    setDevice(null);
    setIsConnected(false);

    try {
      // 1. 주변 BLE 장치 검색 및 사용자 선택 요청
      const bleDevice = await navigator.bluetooth.requestDevice({
        // services: [PRIMARY_SERVICE_UUID], // requestDevice의 services 필드는 소문자 128비트 UUID 또는 16비트 숫자(0x...)만 허용
        optionalServices: [PRIMARY_SERVICE_UUID, ...OPTIONAL_SERVICES], 
        acceptAllDevices: true, 
      });
      
      setDevice(bleDevice);
      console.log(`장치 선택: ${bleDevice.name}`);

      // 2. GATT 서버 연결
      const server = await bleDevice.gatt.connect();
      setIsConnected(server.connected);
      console.log("✅ GATT 서버 연결 성공");

      // 장치 연결 해제 이벤트 리스너 등록
      bleDevice.addEventListener('gattserverdisconnected', () => {
          setIsConnected(false);
          setDevice(null);
          console.log("❌ 장치 연결 해제됨");
      });

    } catch (err) {
      const errorMessage = err.message || "알 수 없는 연결 실패";
      console.error("블루투스 연결 실패:", err);
      alert(`❌ 블루투스 연결 실패: ${errorMessage}`); 
      setError(errorMessage);
      setIsConnected(false);
      setDevice(null);
    } finally {
      setIsSearching(false);
    }
  }, []);
  
  // (나머지 sendData, disconnect, startDataNotifications 로직은 동일)
    const disconnect = useCallback(() => {
        if (device && device.gatt.connected) {
            device.gatt.disconnect();
        }
    }, [device]);

    const sendData = useCallback(async (dataString) => {
        if (!device || !device.gatt.connected) {
            console.warn("❌ 블루투스 장치가 연결되어 있지 않습니다. 데이터 전송 취소.");
            return false;
        }

        try {
            const server = device.gatt.connected ? device.gatt : await device.gatt.connect();
            // ✅ 서비스/특성 획득 시에도 소문자 UUID 사용
            const service = await server.getPrimaryService(PRIMARY_SERVICE_UUID);
            const characteristic = await service.getCharacteristic(DATA_CHARACTERISTIC_UUID);

            const encoder = new TextEncoder();
            const data = encoder.encode(dataString + '\n'); 

            await characteristic.writeValue(data);
            console.log(`✅ Bluetooth Data Sent: "${dataString}"`);
            return true;

        } catch (err) {
            console.error("❌ 데이터 전송 중 오류 발생:", err);
            if (!device.gatt.connected) {
                 setIsConnected(false);
            }
            return false;
        }
    }, [device]);

    const startDataNotifications = useCallback(async () => {
        if (!device || !device.gatt.connected) {
            console.warn("❌ 장치가 연결되지 않아 알림을 시작할 수 없습니다.");
            return;
        }
        
        try {
            const server = device.gatt.connected ? device.gatt : await device.gatt.connect();
            // ✅ 서비스/특성 획득 시에도 소문자 UUID 사용
            const service = await server.getPrimaryService(PRIMARY_SERVICE_UUID);
            const characteristic = await service.getCharacteristic(DATA_CHARACTERISTIC_UUID);

            const handleCharacteristicValueChanged = (event) => {
                const value = event.target.value; 
                const decoder = new TextDecoder('utf-8');
                const receivedString = decoder.decode(value);
                
                const data = receivedString.trim();

                setLatestData(data);
                setHistory(prev => [data, ...prev.slice(0, 9)]);
            };

            characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
            await characteristic.startNotifications();
            
            console.log("✅ 데이터 알림 구독 성공.");

        } catch (err) {
            console.error("❌ 알림 구독 실패:", err);
        }
    }, [device]);

    useEffect(() => {
        if (isConnected && device) {
            startDataNotifications();
        }
    }, [isConnected, device, startDataNotifications]);  

  return {
    device,
    isConnected,
    isSearching,
    error,
    requestDevice,
    disconnect,
    sendData,
    latestData,
    history,
    startDataNotifications,
  };
};