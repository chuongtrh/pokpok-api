// deno-lint-ignore-file
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

import db from "../db/firestore.ts";
import collectionType from "./collection.type.ts";

export default {
  createClan: async (data: any) => {
    const docRef = await addDoc(collection(db, collectionType.CLANS), data);
    return docRef.id;
  },
  getClans: async () => {
    const ref = await getDocs(collection(db, collectionType.CLANS));
    const clans = ref.docs.map((doc) => {
      return {
        ...doc.data(),
        id: doc.id,
      };
    });
    return clans;
  },
  getClan: async (clanId: string) => {
    const snap = await getDoc(doc(db, collectionType.CLANS, clanId));
    return {
      ...snap.data(),
      id: clanId,
    };
  },
  addMember: async (clanId: string, data: any) => {
    const ref = doc(db, collectionType.CLANS, clanId);
    const docRef = await addDoc(collection(ref, collectionType.MEMBERS), data);
    return docRef.id;
  },
  getMembers: async (clanId: string) => {
    const ref = doc(db, collectionType.CLANS, clanId);
    const memberRef = await getDocs(collection(ref, collectionType.MEMBERS));
    const members = memberRef.docs.map((doc) => {
      return {
        ...doc.data(),
        id: doc.id,
      };
    });
    return members;
  },
  getGames: async (clanId: string) => {
    const ref = doc(db, collectionType.CLANS, clanId);
    const gameRef = await getDocs(collection(ref, collectionType.GAMES));
    const games = gameRef.docs.map((doc) => {
      return {
        ...doc.data(),
        id: doc.id,
      };
    });
    return games;
  },
  getGame: async (clanId: string, gameId: string) => {
    const ref = doc(db, collectionType.CLANS, clanId);
    const gameRef = doc(ref, collectionType.GAMES, gameId);
    const snap = await getDoc(gameRef);
    return {
      ...snap.data(),
      id: gameId,
    };
  },
  addGame: async (clanId: string, data: any) => {
    const ref = doc(db, collectionType.CLANS, clanId);
    const docRef = await addDoc(collection(ref, collectionType.GAMES), data);
    return docRef.id;
  },
  updateGame: async (clanId: string, gameId: string, data: any) => {
    const ref = doc(db, collectionType.CLANS, clanId);
    const gameRef = doc(ref, collectionType.GAMES, gameId);
    await setDoc(gameRef, data, { merge: true });
  },
  getPlayers: async (clanId: string, gameId: string) => {
    const ref = doc(db, collectionType.CLANS, clanId);
    const gameRef = doc(ref, collectionType.GAMES, gameId);

    const playerRef = await getDocs(
      collection(gameRef, collectionType.PLAYERS),
    );
    const players = playerRef.docs.map((snap) => {
      const snapData = snap.data();
      return {
        ...snapData,
        profit: snapData.total_cashout - snapData.total_buyin,
        id: snap.id,
      };
    });
    return players;
  },
  getPlayer: async (clanId: string, gameId: string, playerId: string) => {
    const ref = doc(db, collectionType.CLANS, clanId);
    const gameRef = doc(ref, collectionType.GAMES, gameId);
    const playerRef = doc(gameRef, collectionType.PLAYERS, playerId);
    const snap = await getDoc(playerRef);
    const snapData = snap.data();
    return {
      ...snapData,
      profit: snapData.total_cashout - snapData.total_buyin,
      id: playerId,
    };
  },
  addPlayer: async (
    clanId: string,
    gameId: string,
    playerId: string,
    data: any,
  ) => {
    const ref = doc(db, collectionType.CLANS, clanId);
    const gameRef = doc(ref, collectionType.GAMES, gameId);
    const playerRef = doc(gameRef, collectionType.PLAYERS, playerId);
    const docSnap = await getDoc(playerRef);
    if (docSnap.exists()) {
      console.log("exist player:", docSnap.data());
    } else {
      await setDoc(
        playerRef,
        data,
        { merge: true },
      );
    }
    return playerId;
  },
  updatePlayer: async (
    clanId: string,
    gameId: string,
    playerId: string,
    data: any,
  ) => {
    const ref = doc(db, collectionType.CLANS, clanId);
    const gameRef = doc(ref, collectionType.GAMES, gameId);
    const playerRef = doc(gameRef, collectionType.PLAYERS, playerId);
    await setDoc(playerRef, data, { merge: true });
  },
  addLogIntoGame: async (clanId: string, gameId: string, data: any) => {
    const ref = doc(db, collectionType.CLANS, clanId);
    const gameRef = doc(ref, collectionType.GAMES, gameId);

    const docRef = await addDoc(collection(gameRef, collectionType.LOGS), data);
    return docRef.id;
  },
  getLogs: async (clanId: string, gameId: string) => {
    const ref = doc(db, collectionType.CLANS, clanId);
    const gameRef = doc(ref, collectionType.GAMES, gameId);
    const logRef = collection(gameRef, collectionType.LOGS);
    const q = query(logRef, orderBy("created_at"));
    const querySnapshot = await getDocs(q);
    const logs = querySnapshot.docs.map((doc) => {
      return {
        ...doc.data(),
        id: doc.id,
      };
    });
    return logs;
  },
};
