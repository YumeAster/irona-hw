import React, { useState } from "react";
import "./AppSettingPage.css";
import { useNavigate } from "react-router-dom";
import {
  getStoredGoogleUser,
  loginGoogle,
  logoutGoogle
} from "../utils/googleDrive";

export default function AppSettingPage() {
  const navigate = useNavigate();

  // 로그인 상태 시 사용자 이메일, 로그인 안됐을 경우 false
  const [googleUser, setGoogleUser] = useState(getStoredGoogleUser());

  const handleLogin = async () => {
      await loginGoogle();
      setGoogleUser(getStoredGoogleUser());
  };

  const handleLogout = async () => {
      logoutGoogle();
      setGoogleUser(getStoredGoogleUser());
  };

  return (
    <div className="settings-container">
      {/* 헤더 */}
      <div className="header-block" onClick={() => navigate(-1)}>
        <span className="back-arrow">←</span>
        <span className="header-title">설정</span>
      </div>

      <div className="button-group">
        {/* 계정 설정 버튼 */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">알람 목록 확인</h1>
          <div className="flex items-center gap-2">
            {googleUser ? (
              <><span className="text-sm text-gray-700">{googleUser.name}</span>
              <button onClick={handleLogout} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">
                  로그아웃
                </button>
                </>
            ) : (
              <>
              <button
              onClick={handleLogin}
              className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded-lg text-sm text-blue-700"
            >
              Google 로그인
            </button>
            </>
            )}
            
          </div>
        </div>


        {/* 난이도 슬라이더 */}
        <div className="slider-block">
          <div className="slider-title">난이도 설정</div>
          <div className="slider-container">
            <img src="https://emojicdn.elk.sh/🐢" alt="거북이" className="slider-icon" />
            <div className="slider-wrapper">
              <input type="range" min="1" max="3" defaultValue="2" step="1" />
              <div className="slider-ticks">
                <span>1</span>
                <span>2</span>
                <span>3</span>
              </div>
            </div>
            <img src="https://emojicdn.elk.sh/🐇" alt="토끼" className="slider-icon" />
          </div>
        </div>

        {/* 기타 항목들 */}
        <button className="block-button" onClick={() => navigate('/blacklist')}>블랙리스트</button>
        <button className="block-button" onClick={() => alert("분석 시각화로 이동")}>분석 시각화</button>
        <button className="block-button" onClick={() => alert("의견 보내기")}>의견 보내기</button>
        <button className="block-button" onClick={() => navigate('/license')}>라이센스</button>
        <button className="block-button" onClick={() => navigate('/demo')}>게임 목록 (시연용)</button>

      </div>
    </div>
  );
}