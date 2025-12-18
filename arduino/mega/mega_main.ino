#include <SPI.h>
#include <SdFat.h>            
#include <MCUFRIEND_kbv.h>
#include <Adafruit_GFX.h>
#include "SpiDriver/SdSpiSoftDriver.h"

// --- 핀 설정 ---
#define SD_CS_PIN 10
#define SOFT_MISO_PIN 12
#define SOFT_MOSI_PIN 11
#define SOFT_SCK_PIN 13

// --- 이미지 설정 ---
#define BG_FILENAME "bg.bmp"
#define PLAYER_FILENAME "player.bmp"
#define PLAYER_W 18
#define PLAYER_H 22
#define MOVE_SPEED 10
#define TEXT_W 40
#define TEXT_H 30
#define TEXT_Y 280
#define BUFFPIXEL 20

// --- 객체 생성 ---
SoftSpiDriver<SOFT_MISO_PIN, SOFT_MOSI_PIN, SOFT_SCK_PIN> softSpi;
SdFat SD;
MCUFRIEND_kbv tft;

// --- 변수 ---
int playerX = 230, playerY = 150;
// 버튼 상태 저장용
int curB1=1, curB2=1, curB3=1, curB4=1;
int oldB1=1, oldB2=1, oldB3=1, oldB4=1;

void setup() {
  Serial.begin(9600);   // PC 연결
  Serial1.begin(9600);  // 우노 연결
  
  pinMode(53, OUTPUT);  

  uint16_t ID = tft.readID();
  if (ID == 0xD3D3) ID = 0x9481;
  tft.begin(ID);
  tft.setRotation(1); 
  tft.fillScreen(TFT_BLACK);

  if (!SD.begin(SdSpiConfig(SD_CS_PIN, DEDICATED_SPI, SD_SCK_MHZ(0), &softSpi))) {
    tft.setCursor(10, 10); tft.setTextColor(TFT_RED); tft.print("SD Fail");
  }

  // 초기 배경 및 플레이어 그리기 (이후 초기화 안 함)
  drawBMP(BG_FILENAME, 0, 0);
  drawBMPTransparent(PLAYER_FILENAME, playerX, playerY);
  tft.setTextSize(3);
}

void loop() {
  // ============================================================
  // 1. 우노 -> 메가 -> PC : 데이터 중계 + 플레이어/버튼 제어 (항상 실행)
  // ============================================================
  if (Serial1.available()) {
    String packet = Serial1.readStringUntil('>');
    int startIndex = packet.indexOf('<');
    
    if (startIndex != -1) {
      String fullData = packet.substring(startIndex) + ">";
      
      // [1] PC(웹)로 데이터 전송 (통신 유지)
      Serial.println(fullData); 

      // [2] 메가 화면 제어 (모드 구분 없이 항상 실행)
      parseAndControlLocal(fullData);
    }
  }

  // ============================================================
  // 2. PC -> 메가 : 웹 명령 처리 (IMG, SPK 등)
  // ============================================================
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    
    // [중요] 초기화(fillScreen) 로직 삭제됨
    // 웹에서 명령이 오면 그 위에 덧그리거나 하드웨어를 제어함

    if (cmd.startsWith("IMG:")) {
      parseAndDrawImage(cmd);
    } else if (cmd.startsWith("CLR:")) {
      parseAndRestoreBackground(cmd);
    } else if (cmd.startsWith("SPK:") || cmd.startsWith("VIB:") || cmd.startsWith("LED:") || cmd.startsWith("BUZ:")) {
      Serial1.println(cmd); // 우노로 토스
    }
  }
}

// -----------------------------------------------------------
// [로컬] 우노 데이터를 해석해서 플레이어 이동 및 버튼 표시
// -----------------------------------------------------------
void parseAndControlLocal(String data) {
  data.replace("<", ""); data.replace(">", "");
  
  int val[10];
  int strIdx = 0;
  for (int i = 0; i < 10; i++) {
    int nextComma = data.indexOf(',', strIdx);
    if (nextComma == -1) nextComma = data.length();
    val[i] = data.substring(strIdx, nextComma).toInt();
    strIdx = nextComma + 1;
  }
  
  // 1. 플레이어 이동
  int lx = val[0];
  int ly = val[1];
  if (lx != 0 || ly != 0) {
    int oldX = playerX;
    int oldY = playerY;
    playerX += (ly * MOVE_SPEED); 
    playerY -= (lx * MOVE_SPEED);
    
    if (playerX < 0) playerX = 0;
    if (playerX > tft.width() - PLAYER_W) playerX = tft.width() - PLAYER_W;
    if (playerY < 0) playerY = 0;
    if (playerY > tft.height() - PLAYER_H) playerY = tft.height() - PLAYER_H;

    if (oldX != playerX || oldY != playerY) {
      restoreBackgroundFromBMP(oldX, oldY, PLAYER_W, PLAYER_H);
      drawBMPTransparent(PLAYER_FILENAME, playerX, playerY);
    }
  }

  // 2. 버튼 상태 표시 (B1~B4)
  curB1 = val[6]; curB2 = val[7]; curB3 = val[8]; curB4 = val[9];
  handleButtonUI(curB1, oldB1, 30, "B1", TFT_BLUE);
  handleButtonUI(curB2, oldB2, 140, "B2", TFT_WHITE);
  handleButtonUI(curB3, oldB3, 250, "B3", TFT_GREEN);
  handleButtonUI(curB4, oldB4, 360, "B4", TFT_RED);
  
  // 상태 업데이트
  oldB1 = curB1; oldB2 = curB2; oldB3 = curB3; oldB4 = curB4;
}

// 버튼 UI 헬퍼
void handleButtonUI(int cur, int old, int x, const char* label, uint16_t color) {
  if (cur != old) {
    if (cur == 0) { // 누름
      tft.setCursor(x, TEXT_Y);
      tft.setTextColor(color);
      tft.print(label);
    } else { // 뗌 (배경 복원)
      restoreBackgroundFromBMP(x, TEXT_Y, TEXT_W, TEXT_H);
    }
  }
}

// --- 공통 헬퍼 함수들 (이미지, 복원 등) ---
void parseAndDrawImage(String cmd) {
  int c1 = cmd.indexOf(','); int c2 = cmd.indexOf(',', c1 + 1);
  if (c1 == -1 || c2 == -1) return;
  String f = cmd.substring(4, c1);
  int x = cmd.substring(c1 + 1, c2).toInt();
  int y = cmd.substring(c2 + 1).toInt();
  if (!f.startsWith("/")) f = "/" + f;
  if (SD.exists(f)) drawBMP(f.c_str(), x, y);
}

void parseAndRestoreBackground(String cmd) {
  int c1 = cmd.indexOf(':'); int c2 = cmd.indexOf(',', c1+1); 
  int c3 = cmd.indexOf(',', c2+1); int c4 = cmd.indexOf(',', c3+1);
  if (c1==-1 || c2==-1 || c3==-1 || c4==-1) return;
  int w = cmd.substring(c1+1, c2).toInt(); int h = cmd.substring(c2+1, c3).toInt();
  int x = cmd.substring(c3+1, c4).toInt(); int y = cmd.substring(c4+1).toInt();
  restoreBackgroundFromBMP(x, y, w, h);
}

void restoreBackgroundFromBMP(int x, int y, int w, int h) {
  FsFile f; uint8_t buf[3 * w]; 
  if ((f = SD.open(BG_FILENAME, O_READ)) == NULL) return;
  if (read16(f) == 0x4D42) {
    read32(f); read32(f); uint32_t off = read32(f);
    read32(f); int32_t bw = read32(f); int32_t bh = read32(f);
    uint32_t rs = (bw * 3 + 3) & ~3;
    tft.setAddrWindow(x, y, x + w - 1, y + h - 1);
    for (int r = 0; r < h; r++) {
      int rr = bh - 1 - (y + r);
      f.seekSet(off + (rr * rs) + (x * 3));
      f.read(buf, w * 3);
      for (int c = 0; c < w; c++) {
        uint16_t col = tft.color565(buf[c*3+2], buf[c*3+1], buf[c*3]);
        tft.pushColors(&col, 1, r==0 && c==0);
      }
    }
  }
  f.close();
}

void drawBMP(const char *filename, int x, int y) {
  FsFile f; if ((f = SD.open(filename, O_READ)) == NULL) return;
  if (read16(f) == 0x4D42) {
    read32(f); read32(f); uint32_t off = read32(f);
    read32(f); int32_t w = read32(f); int32_t h = read32(f);
    uint32_t rs = (w * 3 + 3) & ~3;
    uint8_t buf[3*BUFFPIXEL]; int bidx = sizeof(buf);
    tft.setAddrWindow(x, y, x + w - 1, y + h - 1);
    bool first = true;
    for (int r = 0; r < h; r++) {
      uint32_t pos = off + (h - 1 - r) * rs;
      if (f.curPosition() != pos) { f.seekSet(pos); bidx = sizeof(buf); }
      for (int c = 0; c < w; c++) {
        if (bidx >= sizeof(buf)) { f.read(buf, sizeof(buf)); bidx = 0; }
        uint16_t col = tft.color565(buf[bidx+2], buf[bidx+1], buf[bidx]);
        bidx += 3; tft.pushColors(&col, 1, first); first = false;
      }
    }
  }
  f.close();
}

void drawBMPTransparent(const char *filename, int x, int y) {
  FsFile f; if ((f = SD.open(filename, O_READ)) == NULL) return;
  if (read16(f) == 0x4D42) {
    read32(f); read32(f); uint32_t off = read32(f);
    read32(f); int32_t w = read32(f); int32_t h = read32(f);
    uint32_t rs = (w * 3 + 3) & ~3;
    uint8_t buf[3*BUFFPIXEL]; int bidx = sizeof(buf);
    for (int r = 0; r < h; r++) {
      uint32_t pos = off + (h - 1 - r) * rs;
      if (f.curPosition() != pos) { f.seekSet(pos); bidx = sizeof(buf); }
      for (int c = 0; c < w; c++) {
        if (bidx >= sizeof(buf)) { f.read(buf, sizeof(buf)); bidx = 0; }
        uint8_t b = buf[bidx++], g = buf[bidx++], r_ = buf[bidx++];
        if (!(r_ > 250 && g > 250 && b > 250)) tft.drawPixel(x+c, y+r, tft.color565(r_, g, b));
      }
    }
  }
  f.close();
}

uint16_t read16(FsFile &f) { uint16_t r; f.read(&r, 2); return r; }
uint32_t read32(FsFile &f) { uint32_t r; f.read(&r, 4); return r; }