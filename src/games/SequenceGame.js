import React, { useEffect, useState, useCallback, useRef } from "react";
import { useBluetooth } from "../utils/useBluetooth"; 

/* 외부 호출 */
export function startGame(difficulty = 1, onComplete = () => {}) {
  return <SequenceGame difficulty={difficulty} onComplete={onComplete} />;
}

/* 아두이노 화면 제어 상수 */
const START_X = 50; 
const SEQUENCE_Y = 50; 
const SPACING = 40; 
const SCREEN_WIDTH = 480; 
const SCREEN_HEIGHT = 320; 

/* 입력 타입을 이미지 파일명과 매핑 */
const INPUT_MAP = {
  'UP': 'up.bmp',      
  'DOWN': 'down.bmp',  
  'LEFT': 'LEFT.bmp',  
  'RIGHT': 'right.bmp',    
};

/* 아두이노 입력 패킷을 게임 입력 타입으로 파싱하는 헬퍼 함수 (생략: 이전과 동일) */
const parseHardwareInput = (data) => {
    if (!data) return null;
    const cleanedData = data.replace(/[<>]/g, '');
    const parts = cleanedData.split(',').map(v => parseInt(v.trim()));
    if (parts.length !== 10) return null;
    
    const [LX, LY, , , , , , ] = parts; 


    if (LX === 1) return 'UP';
    if (LX === -1) return 'DOWN';
    if (LY === 1) return 'RIGHT';
    if (LY === -1) return 'LEFT';
    
    return null; 
};


export default function SequenceGame({ difficulty = 1, onComplete }) {
  const [sequence, setSequence] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [message, setMessage] = useState("준비!");
  
  const SEQUENCE_LENGTH = Math.min(difficulty + 2, 8); 

  const { latestData, sendData, isConnected } = useBluetooth();
  
  const lastProcessedInputRef = useRef(null); 

  /* 문제 생성 (생략: 이전과 동일) */
  const generateNewSequence = useCallback(() => {
    const keys = Object.keys(INPUT_MAP);
    const newSequence = [];
    for (let i = 0; i < SEQUENCE_LENGTH; i++) {
      const randomIndex = Math.floor(Math.random() * keys.length);
      newSequence.push(keys[randomIndex]);
    }
    setSequence(newSequence);
    setCurrentIndex(0);
    setMessage("순서를 기억하세요!");
    
    // 1.5초 후 화면에 시퀀스 표시
    setTimeout(() => {
        sendSequenceToHardware(newSequence, 0); 
        setMessage("시작!");
    }, 1500);

  }, [SEQUENCE_LENGTH, sendData]);

  // ✅ 아두이노 화면에 시퀀스 이미지를 그리는 함수 (CLR 반영)
  const sendSequenceToHardware = useCallback((seq, currentIdx) => {
    if (!isConnected) return;
    
    const commands = [];
    // 1. ✅ 화면 전체 지우기 (CLR 명령 사용)
    commands.push(`CLR:${SCREEN_WIDTH},${SCREEN_HEIGHT},0,0`); 
    
    let x_cursor = START_X;
    
    seq.forEach((inputKey, index) => {
      const filename = INPUT_MAP[inputKey];
      
      commands.push(`IMG:${filename},${x_cursor},${SEQUENCE_Y}`);
      x_cursor += SPACING;
    });

    commands.forEach(cmd => sendData(cmd).catch(console.error));
  }, [isConnected, sendData]);
  
  useEffect(() => {
    generateNewSequence();
  }, [generateNewSequence]);

  useEffect(() => {
    if (sequence.length > 0) {
        sendSequenceToHardware(sequence, currentIndex);
    }
  }, [currentIndex, sequence, sendSequenceToHardware]);


  /* ----------------------------------------------------
   * 2. 아두이노 입력 처리 (사용자 입력 검증) - 변수 정의 보강
   * ---------------------------------------------------- */
  useEffect(() => {
    if (!latestData || !isConnected) return;
    
    const data = latestData.replace(/[<>]/g, '').split(',').map(v => parseInt(v.trim()));
    if (data.length !== 10 || data.some(isNaN)) return;
    
    const [LX, LY, LS, RX, RY, RS, B1, B2, B3, B4] = data; // ✅ 변수 정의
    
    const currentHardwareInput = parseHardwareInput(latestData);

    const expectedInput = sequence[currentIndex];

    if (currentHardwareInput && currentHardwareInput === lastProcessedInputRef.current) return;

    if (currentHardwareInput) {
        lastProcessedInputRef.current = currentHardwareInput; 

        if (currentHardwareInput === expectedInput) {
            const nextIndex = currentIndex + 1;
            
            if (nextIndex < sequence.length) {
                setCurrentIndex(nextIndex);
                setMessage("GOOD!");
                sendData("SPK:440").catch(console.error); 
                setTimeout(() => sendData("SPK:0").catch(console.error), 100);
            } else {
                setMessage("SUCCESS!");
                sendData("SPK:880").catch(console.error); 
                setTimeout(() => sendData("SPK:0").catch(console.error), 300);
                setTimeout(onComplete, 1000); 
            }
            
        } else {
            setMessage(`FAIL! ${currentHardwareInput}이(가) 아닙니다.`);
            
            if (isConnected) {
                sendData("BUZ:294").catch(console.error); 
                sendData("VIB:1").catch(console.error); 
                setTimeout(() => {
                    sendData("BUZ:0").catch(console.error);
                    sendData("VIB:0").catch(console.error);
                }, 500);
            }
            
            setCurrentIndex(0);
            setTimeout(() => generateNewSequence(), 1500); 
        }
    }
    
    // 5. 입력 해제 시 lastProcessedInputRef 초기화 로직
    const isReleased = (LX === 0 && LY === 0 && RX === 0 && RY === 0 && 
                        LS === 1 && RS === 1 && B1 === 1 && B2 === 1 && B3 === 1 && B4 === 1);
    
    if (isReleased) {
        lastProcessedInputRef.current = null;
    }

  }, [latestData, isConnected, sequence, currentIndex, sendData, generateNewSequence, onComplete]); 


  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-100 to-indigo-100">
      <h2 className="text-3xl font-bold mb-6">순서 맞추기 게임</h2>
      
      <div className="text-xl font-medium mb-8 text-gray-700">{message}</div>

      <div className="flex gap-2 p-4 border rounded-lg bg-white shadow-md">
        {sequence.map((key, index) => (
          <div 
            key={index} 
            className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold transition-all duration-300
              ${index < currentIndex ? 'bg-green-500' : 
                index === currentIndex ? 'bg-red-500 scale-110' : 
                'bg-gray-400'
              }`}
            title={key}
          >
            {key.substring(0, 1)}
          </div>
        ))}
      </div>
      
      <p className="mt-8 text-xs text-gray-500">
          HW 입력: {latestData || '없음'} | 연결: {isConnected ? 'O' : 'X'}
      </p>
    </div>
  );
}