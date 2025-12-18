import { gapi } from "gapi-script";

const CLIENT_ID = "755849231348-64dpv6bpqnma3sjqf12co9cp2diru3sm.apps.googleusercontent.com";
const FILE_NAME = "alarmData.json";
let cachedFileId = null;

/* -------------------- 로그인 상태 -------------------- */
export const getStoredGoogleUser = () => {
  const name = localStorage.getItem("googleUserName");
  const token = localStorage.getItem("googleAccessToken");
  return name && token ? { name, token } : null;
};

export const storeGoogleUser = (googleUser) => {
  const profile = googleUser.getBasicProfile();
  const token = googleUser.getAuthResponse().access_token;
  localStorage.setItem("googleUserName", profile.getName());
  localStorage.setItem("googleAccessToken", token);
};

export const clearStoredGoogleUser = () => {
  localStorage.removeItem("googleUserName");
  localStorage.removeItem("googleAccessToken");
  cachedFileId = null
};

/* -------------------- 초기화 -------------------- */
export const initGoogleAPI = () => {
  return new Promise((resolve, reject) => {
    window.gapi.load("client:auth2", async () => {
      try {
        await window.gapi.client.init({
          clientId: CLIENT_ID,
          scope: "https://www.googleapis.com/auth/drive.appdata",
        });

        const auth = window.gapi.auth2.getAuthInstance();
        if (auth.isSignedIn.get()) {
          const googleUser = auth.currentUser.get();
          storeGoogleUser(googleUser);
        }

        resolve();
      } catch (e) {
        console.error("Google API 초기화 실패:", e);
        reject(e);
      }
    });
  });
};

/* -------------------- 로그인 -------------------- */
export const loginGoogle = async () => {
  const auth = window.gapi.auth2.getAuthInstance();
  const user = await auth.signIn();
  storeGoogleUser(user);
  return user.getBasicProfile();
};

/* -------------------- 로그아웃 -------------------- */
export const logoutGoogle = () => {
  const auth = window.gapi.auth2.getAuthInstance();
  if (auth.isSignedIn.get()) auth.signOut();
  clearStoredGoogleUser();
};

/* -------------------- Drive 저장 -------------------- */
export const saveToDrive = async (data) => {
  const token = localStorage.getItem("googleAccessToken");
  if (!token) return alert("로그인 상태가 아닙니다");

  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  const metadata = { name: FILE_NAME };

  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", blob);

  // fileId 없으면 탐색
  if (!cachedFileId) {
    try {
      const listRes = await window.gapi.client.drive.files.list({
        spaces: "appDataFolder",
        q: `name='${FILE_NAME}'`,
        fields: "files(id, createdTime)",
        orderBy: "createdTime desc",
      });
      const files = listRes.result?.files || [];
      if (files.length > 0) cachedFileId = files[0].id;
    } catch (e) {
      console.warn("기존 파일 탐색 실패", e);
    }
  }

  const url = cachedFileId
    ? `https://www.googleapis.com/upload/drive/v3/files/${cachedFileId}?uploadType=multipart`
    : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";

  const method = cachedFileId ? "PATCH" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });

    const result = await res.json();

    // 404 에러 대응 - 파일이 없으면 cachedFileId 초기화
    if (res.status === 404) {
      cachedFileId = null
    }

    if (res.status >= 400 || result?.error) {
      console.warn("저장 실패", result);
      alert("저장 중 오류 발생");
      return;
    }

    if (result.id) {
      cachedFileId = result.id;
      console.log("✅ Drive 저장 완료:", result);
      alert("Drive에 저장되었습니다!");
    }
  } catch (e) {
    console.error("❌ 저장 중 예외:", e);
    alert("Drive 저장 실패");
  }
};

/* -------------------- Drive 불러오기 -------------------- */
export const loadFromDrive = async () => {
  try {
    await window.gapi.client.load("drive", "v3");

    const listRes = await window.gapi.client.drive.files.list({
      spaces: "appDataFolder",
      q: `name='${FILE_NAME}'`,
      fields: "files(id, createdTime)",
      orderBy: "createdTime desc",
    });

    const files = listRes.result?.files || [];
    if (files.length === 0) {
      alert("저장된 알람 데이터가 없습니다.");
      return null;
    }

    const fileId = files[0].id;
    const res = await window.gapi.client.drive.files.get({
      fileId,
      alt: "media",
    });

    cachedFileId = fileId;

    return JSON.parse(res.body);
  } catch (e) {
    console.error("❌ 불러오기 실패", e);
    alert("Drive에서 불러오기 실패");
    return null;
  }
};
