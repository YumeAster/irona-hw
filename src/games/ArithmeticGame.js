import React, { useEffect, useState, useCallback, useRef } from "react";
import { useBluetooth } from "../utils/useBluetooth"; 

/* 외부 호출 */
export function startGame(difficulty = 1, onComplete = () => {}) {
  return <ArithmeticGame difficulty={difficulty} onComplete={onComplete} />;
}

/* 아두이노 화면 제어 상수 */
const START_X = 30; 
const SPACING = 30;
const PROBLEM_Y = 50; 
const INPUT_Y = 100;
const SCREEN_WIDTH = 240;  // 화면 폭 가정
const SCREEN_HEIGHT = 320; // 화면 높이 가정

// 연산자 문자열을 파일 이름으로 변환하는 헬퍼
const OP_MAP = {
  "+": "plus.bmp",
  "-": "minus.bmp",
  "*": "multiply.bmp",
  "=": "equal.bmp",
};

/* 메인 컴포넌트 */
export default function ArithmeticGame({ difficulty = 1, onComplete }) {
  const [expr, setExpr] = useState("");
  const [answer, setAnswer] = useState(0);
  const [currentValue, setCurrentValue] = useState(0); 
  const [feedback, setFeedback] = useState("");
  
  const { latestData, sendData, isConnected } = useBluetooth();
  const isJoystickActiveRef = useRef({ LX: false, B1: false }); 

  /* 문제 생성 (생략: 이전과 동일) */
  const newProblem = useCallback(() => {
    const ops1 = ["+", "-"];
    const ops2 = ["+", "-", "*"]; 

    const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    let nums = [];
    let ops  = [];
    if (difficulty === 0) {
      nums = [rand(1, 9), rand(1, 9)];
      ops  = [ops1[rand(0, 1)]];
    } else if (difficulty === 1) {
      nums = [rand(10, 99), rand(10, 99)];
      ops  = [ops2[rand(0, 2)]];
    } else {
      nums = [rand(10, 99), rand(10, 99), rand(10, 99)];
      ops  = [ops2[rand(0, 2)], ops2[rand(0, 2)]];
    }

    let res = nums[0];
    let str = `${nums[0]}`;
    nums.slice(1).forEach((n, i) => {
      const op = ops[i];
      str += ` ${op} ${n}`;
      if (op === "+") res += n;
      if (op === "-") res -= n;
      if (op === "*") res *= n;
    });

    setExpr(str);
    setAnswer(res);
    setCurrentValue(0); 
    setFeedback("");
    isJoystickActiveRef.current = { LX: false, B1: false }; 
  }, [difficulty]);
  
  useEffect(() => newProblem(), [newProblem]);


  /* 제출 로직 (생략: 이전과 동일) */
  const handleSubmit = useCallback((inputVal) => {
    if (inputVal === answer) {
      setFeedback("정답!"); 
      
      // 하드웨어 피드백: 정답 (스피커 + LED)
      if (isConnected) {
        sendData("SPK:880").catch(console.error); 
        sendData("LED:1,1").catch(console.error); 
        setTimeout(() => {
            sendData("SPK:0").catch(console.error);
            sendData("LED:1,0").catch(console.error);
        }, 300); 
      }
      
      setTimeout(onComplete, 1000); 
    } else {
      setFeedback("틀렸어요! 다시 시도해보세요."); 
      
      // 하드웨어 피드백: 오답 (부저+진동+LED)
      if (isConnected) {
        sendData("BUZ:294").catch(console.error); 
        sendData("VIB:1").catch(console.error); 
        sendData("LED:1,1").catch(console.error); 
        setTimeout(() => {
          sendData("BUZ:0").catch(console.error);
          sendData("VIB:0").catch(console.error);
          sendData("LED:1,0").catch(console.error);
        }, 500);
      }
      
      newProblem();
    }
  }, [answer, onComplete, isConnected, sendData, newProblem]);


  /* 아두이노 입력 처리 (생략: 이전과 동일) */
  useEffect(() => {
    if (!latestData || !isConnected) return;
    
    const data = latestData.replace(/[<>]/g, '').split(',').map(v => parseInt(v.trim()));
    if (data.length !== 10 || data.some(isNaN)) return;

    const [LX, , , , , , B1] = data;

    // 2. 숫자 조작
    if (B1 !== 0) { 
        if (LX === 1 && !isJoystickActiveRef.current.LX) {
            setCurrentValue(prev => prev + 1);
            isJoystickActiveRef.current.LX = true; 
        } else if (LX === -1 && !isJoystickActiveRef.current.LX) {
            setCurrentValue(prev => Math.max(0, prev - 1));
            isJoystickActiveRef.current.LX = true; 
        } else if (LX === 0 && isJoystickActiveRef.current.LX) {
            isJoystickActiveRef.current.LX = false;
        }
    }

    // 3. 정답 제출
    if (B1 === 0 && !isJoystickActiveRef.current.B1) {
        isJoystickActiveRef.current.B1 = true;
        handleSubmit(currentValue);
    } 
    // 4. 버튼 뗐을 때 잠금 해제
    else if (B1 === 1 && isJoystickActiveRef.current.B1) {
        isJoystickActiveRef.current.B1 = false;
    }

  }, [latestData, isConnected, handleSubmit, currentValue, sendData]); 


  /* ----------------------------------------------------
   * ✅ 2. 앱 -> 아두이노 메가 출력 처리 (CLR 반영)
   * ---------------------------------------------------- */
  const sendDisplayCommands = useCallback(() => {
    if (!isConnected || !expr) return;
    
    const commands = [];
    
    // 1. ✅ 화면 전체 지우기 (CLR 명령 사용)
    // 화면 전체를 지웁니다.
    commands.push(`CLR:${SCREEN_WIDTH},${SCREEN_HEIGHT},0,0`); 

    // 2. 문제 식 그리기 (expr)
    let x_cursor = START_X;
    const problemParts = expr.split(/\s+/).map(p => {
        if (p === '+' || p === '-' || p === '*') return { type: 'op', value: p };
        return { type: 'num', value: p };
    });
    
    problemParts.forEach(part => {
        const charStr = part.value.toString();
        
        if (part.type === 'op') {
            const filename = OP_MAP[charStr];
            commands.push(`IMG:${filename},${x_cursor},${PROBLEM_Y}`);
            x_cursor += SPACING;
        } else {
            for (const digit of charStr) {
                const filename = `${digit}.bmp`;
                commands.push(`IMG:${filename},${x_cursor},${PROBLEM_Y}`);
                x_cursor += SPACING;
            }
        }
        x_cursor += 10; 
    });
    
    // 3. 등호 (=)와 물음표 그리기
    commands.push(`IMG:equal.bmp,${x_cursor},${PROBLEM_Y}`);
    x_cursor += SPACING + 10;
    commands.push(`IMG:question.bmp,${x_cursor},${PROBLEM_Y}`);
    
    
    // 4. 현재 입력 값 (currentValue) 그리기
    let input_x_cursor = START_X; 
    commands.push(`IMG:Input_Tag.bmp,${input_x_cursor},${INPUT_Y}`);
    input_x_cursor += 50; 

    const inputStr = currentValue.toString();
    for (const digit of inputStr) {
        const filename = `${digit}.bmp`;
        commands.push(`IMG:${filename},${input_x_cursor},${INPUT_Y}`);
        input_x_cursor += SPACING;
    }

    // 5. 명령어 전송
    commands.forEach(cmd => sendData(cmd).catch(console.error));
    
  }, [expr, currentValue, isConnected, sendData]);

  // 화면 갱신 명령어 전송
  useEffect(() => {
    sendDisplayCommands();
  }, [expr, currentValue, sendDisplayCommands]);


  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-pink-100">
      <h2 className="text-3xl font-bold mb-6">사칙연산 퀴즈</h2>
      <div className="text-4xl font-mono mb-4">{expr} = {answer}</div>
      <p className="mt-4 text-red-600 font-medium">{feedback}</p>
      <div className="text-2xl font-semibold mt-4">입력값: {currentValue}</div>
      <p className="mt-8 text-xs text-gray-500">
          HW 입력: {latestData || '없음'} | 연결: {isConnected ? 'O' : 'X'}
      </p>
    </div>
  );
}