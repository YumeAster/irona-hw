import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Splash from './pages/Splash';
import HomePage from './pages/HomePage';
import AlarmSettingPage from './pages/AlarmSettingPage';
import AppSettingPage from './pages/AppSettingPage'; 
import LicensePage from './pages/LicensePage';
import BlacklistPage from './pages/BlacklistPage';
import AlarmRingPage from './pages/AlarmRingPage';
import GameAlarmHandler from './pages/GameAlarmHandler';
import GameDemoPage from './pages/GameDemoPage';
import GamePlayPage from './pages/GamePlayPage';

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/HomePage" element={<HomePage />} />
        <Route path="/demo" element={<GameDemoPage />} />
        <Route path="/play" element={<GamePlayPage />} />
        <Route path="/alarm" element={<AlarmSettingPage />} />
        <Route path="/alarm/new" element={<AlarmSettingPage isNew />} />
        <Route path="/alarm/:id" element={<AlarmSettingPage />} />
        <Route path="/settings" element={<AppSettingPage />} />
        <Route path="/license" element={<LicensePage />} />
        <Route path="/blacklist" element={<BlacklistPage />} /> 

        <Route path="/alarm/ring/:id" element={<AlarmRingPage />} />
        <Route path="/alarm/game/:id" element={<GameAlarmHandler />} />
        <Route path="/alarm/test" element={<GameAlarmHandler />} />
      </Routes>
    </Router>
  );
}

export default App;