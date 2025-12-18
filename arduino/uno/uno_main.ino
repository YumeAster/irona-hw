// 아두이노 우노: 센서 입력 및 로컬/원격 하이브리드 제어

// --- 핀 정의 ---
const int RJ_X = A4;  
const int RJ_Y = A5;  
const int RJ_SW = 2;  

const int LJ_X = A0;  
const int LJ_Y = A1;  
const int LJ_SW = 3;  

const int SPK_PIN = 4;   
const int VIB_PIN = 5;   
const int BUZZ_PIN = 6;  

const int LED_1 = 7,  BTN_1 = 8;   
const int LED_2 = 9,  BTN_2 = 10;  
const int LED_3 = 11, BTN_3 = 12;  
const int LED_4 = 13, BTN_4 = A3;  

// --- 설정 및 변수 ---
const int CENTER = 512;
const int DEADZONE = 300; 

String lastStateString = ""; 

// 도레미 타이머 변수
unsigned long lastNoteTime = 0;
int noteIndex = 0;
int melody[] = {262, 294, 330}; 
const int noteDuration = 200;

// ✅ [중요] 원격 제어 상태 플래그 (앱이 제어 중인지 확인)
bool isRemoteSpk = false; 
bool isRemoteVib = false;

void setup() {
  Serial.begin(9600);
  
  pinMode(RJ_SW, INPUT_PULLUP);
  pinMode(LJ_SW, INPUT_PULLUP);
  pinMode(BTN_1, INPUT_PULLUP);
  pinMode(BTN_2, INPUT_PULLUP);
  pinMode(BTN_3, INPUT_PULLUP);
  pinMode(BTN_4, INPUT_PULLUP);

  pinMode(SPK_PIN, OUTPUT);
  pinMode(VIB_PIN, OUTPUT);
  pinMode(BUZZ_PIN, OUTPUT);
  pinMode(LED_1, OUTPUT);
  pinMode(LED_2, OUTPUT);
  pinMode(LED_3, OUTPUT);
  pinMode(LED_4, OUTPUT);
}

void loop() {
  // 1. 메가 명령 수신
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    executeCommand(cmd); 
  }

  // 2. 로컬 제어 (충돌 방지 로직 적용)

  // [기능 A] 진동 제어
  if (digitalRead(RJ_SW) == LOW) { 
    digitalWrite(VIB_PIN, HIGH); // 버튼 누르면 무조건 켬
  } else {
    // ✅ 버튼을 뗐을 때: "앱이 켠 게 아니라면" 끈다
    if (!isRemoteVib) {
      digitalWrite(VIB_PIN, LOW);
    }
  }

  // [기능 B] 스피커 제어 (도레미)
  if (digitalRead(LJ_SW) == LOW) { 
    // 버튼 누르면 로컬 로직 우선 실행
    unsigned long currentMillis = millis();
    if (currentMillis - lastNoteTime >= noteDuration) {
      tone(SPK_PIN, melody[noteIndex]); 
      noteIndex++; 
      if (noteIndex > 2) noteIndex = 0; 
      lastNoteTime = currentMillis; 
    }
  } else {
    // ✅ 버튼을 뗐을 때: "앱이 켠 게 아니라면" 끈다
    if (!isRemoteSpk) {
      noTone(SPK_PIN);
      noteIndex = 0; 
    }
  }

  // [기능 C] LED 제어
  digitalWrite(LED_1, !digitalRead(BTN_1));
  digitalWrite(LED_2, !digitalRead(BTN_2));
  digitalWrite(LED_3, !digitalRead(BTN_3));
  digitalWrite(LED_4, !digitalRead(BTN_4));

  // 3. 센서값 전송
  sendSensorData();
}

void sendSensorData() {
  int lx = getAxisDirection(analogRead(LJ_X)); 
  int ly = getAxisDirection(analogRead(LJ_Y)); 
  int ls = digitalRead(LJ_SW); 
  
  int rx = getAxisDirection(analogRead(RJ_X));
  int ry = getAxisDirection(analogRead(RJ_Y));
  int rs = digitalRead(RJ_SW);
  
  int b1 = digitalRead(BTN_1);
  int b2 = digitalRead(BTN_2);
  int b3 = digitalRead(BTN_3);
  int b4 = digitalRead(BTN_4);

  String currentState = "<" + String(lx) + "," + String(ly) + "," + String(ls) + "," +
                        String(rx) + "," + String(ry) + "," + String(rs) + "," +
                        String(b1) + "," + String(b2) + "," + String(b3) + "," + String(b4) + ">";

  if (currentState != lastStateString) {
    Serial.println(currentState); 
    lastStateString = currentState;
    delay(10); 
  }
}

int getAxisDirection(int rawValue) {
  if (rawValue > (CENTER + DEADZONE)) return 1;  
  if (rawValue < (CENTER - DEADZONE)) return -1; 
  return 0; 
}

void executeCommand(String cmd) {
  cmd.trim(); 
  
  // SPK 명령
  if (cmd.startsWith("SPK:")) {
    int freq = cmd.substring(4).toInt();
    if(freq > 0) {
      tone(SPK_PIN, freq); 
      isRemoteSpk = true; // ✅ 앱이 켰음을 표시
    } else {
      noTone(SPK_PIN);
      isRemoteSpk = false; // ✅ 앱이 껐음을 표시
    }
  }
  // VIB 명령
  else if (cmd.startsWith("VIB:")) {
    int state = cmd.substring(4).toInt();
    digitalWrite(VIB_PIN, state);
    
    if (state == 1) isRemoteVib = true; // ✅ 앱이 켰음
    else isRemoteVib = false;           // ✅ 앱이 껐음
  }
  // BUZ 명령
  else if (cmd.startsWith("BUZ:")) {
    int freq = cmd.substring(4).toInt();
    if(freq > 0) tone(BUZZ_PIN, freq); 
    else noTone(BUZZ_PIN);
  }
}