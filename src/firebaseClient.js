import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import {
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
let auth;
let db;
let authReadyPromise;

export function hasFirebaseConfig() {
  const required = [
    firebaseConfig.apiKey,
    firebaseConfig.authDomain,
    firebaseConfig.projectId,
    firebaseConfig.appId
  ];
  return required.every((value) => value && !String(value).includes("your-"));
}

export function getFirebaseProjectId() {
  return firebaseConfig.projectId || "";
}

function makeRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

export async function ensureFirebase() {
  if (!hasFirebaseConfig()) {
    throw new Error("Firebase 尚未設定。請先建立 .env.local，填入 VITE_FIREBASE_* 設定。");
  }

  if (!app) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }

  if (!authReadyPromise) {
    authReadyPromise = new Promise((resolve, reject) => {
      const unsub = onAuthStateChanged(
        auth,
        async (user) => {
          if (user) {
            unsub();
            resolve(user);
            return;
          }

          try {
            const credential = await signInAnonymously(auth);
            unsub();
            resolve(credential.user);
          } catch (error) {
            unsub();
            reject(error);
          }
        },
        reject
      );
    });
  }

  const user = await authReadyPromise;
  return { app, auth, db, user };
}

export async function createOnlineRoom(room) {
  const { db: firestore, user } = await ensureFirebase();

  for (let tries = 0; tries < 6; tries += 1) {
    const roomId = makeRoomCode();
    const ref = doc(firestore, "rooms", roomId);
    const snap = await getDoc(ref);
    if (snap.exists()) continue;

    const payload = {
      ...room,
      roomId,
      hostUid: user.uid,
      allowedUids: [user.uid],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(ref, payload);
    return { roomId, uid: user.uid };
  }

  throw new Error("產生房號失敗，請再試一次。");
}

export async function joinOnlineRoom(roomId, playerName) {
  const { db: firestore, user } = await ensureFirebase();
  const code = String(roomId || "").trim().toUpperCase();
  const ref = doc(firestore, "rooms", code);

  const result = await runTransaction(firestore, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("找不到這個房間。");

    const room = snap.data();
    if (room.status !== "lobby") {
      throw new Error("這個房間已經開始遊戲，不能中途加入。");
    }

    const players = [...room.players];
    const existingIndex = players.findIndex((player) => player.uid === user.uid);
    const emptyIndex = players.findIndex((player) => player.kind === "empty");

    const seat = existingIndex >= 0 ? existingIndex : emptyIndex;
    if (seat < 0) throw new Error("房間已滿。");

    players[seat] = {
      seat,
      uid: user.uid,
      name: playerName || `玩家${seat + 1}`,
      kind: "human",
      score: players[seat]?.score || 0,
      online: true
    };

    const allowedUids = Array.from(new Set([...(room.allowedUids || []), user.uid]));

    tx.update(ref, {
      players,
      allowedUids,
      updatedAt: serverTimestamp()
    });

    return { seat, uid: user.uid };
  });

  return result;
}

export async function saveOnlineRoom(roomId, room) {
  const { db: firestore } = await ensureFirebase();
  const ref = doc(firestore, "rooms", roomId);

  const payload = JSON.parse(JSON.stringify(room));
  delete payload.createdAt;
  delete payload.updatedAt;

  await updateDoc(ref, {
    ...payload,
    updatedAt: serverTimestamp()
  });
}

export async function deleteOnlineRoom(roomId) {
  const { db: firestore } = await ensureFirebase();
  const ref = doc(firestore, "rooms", roomId);
  await updateDoc(ref, {
    status: "closed",
    updatedAt: serverTimestamp()
  });
}

export async function getOnlineRoom(roomId) {
  const { db: firestore } = await ensureFirebase();
  const ref = doc(firestore, "rooms", String(roomId || "").trim().toUpperCase());
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function watchOnlineRoom(roomId, callback, onError) {
  const { db: firestore, user } = await ensureFirebase();
  const ref = doc(firestore, "rooms", String(roomId || "").trim().toUpperCase());

  const unsub = onSnapshot(
    ref,
    (snap) => {
      callback(snap.exists() ? snap.data() : null, user.uid);
    },
    onError
  );

  return unsub;
}
