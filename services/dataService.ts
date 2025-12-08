import { 
    collection, 
    query, 
    where, 
    onSnapshot, 
    addDoc, 
    deleteDoc, 
    doc, 
    updateDoc, 
    setDoc,
    getDocs,
    getDoc
} from "firebase/firestore";
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    updateProfile,
    signOut, 
    onAuthStateChanged,
    deleteUser,
    sendPasswordResetEmail,
    User
} from "firebase/auth";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { auth, db, storage, isFirebaseReady } from "./firebase";
import { Trade, Account, DisciplineLog, Challenge } from "../types";

// Helper for permission errors
const handleFirestoreError = (error: any) => {
    console.error("Firestore Error:", error);
    if (error.code === 'permission-denied') {
        console.warn("Database Permission Denied. Ensure Rules are: allow read, write: if request.auth != null;");
    }
};

// Helper to remove undefined values which Firestore rejects
const cleanUndefined = (obj: any) => {
    return Object.entries(obj).reduce((acc: any, [key, value]) => {
        if (value !== undefined) {
            acc[key] = value;
        }
        return acc;
    }, {});
};

// --- AUTH ---
export const subscribeToAuth = (callback: (user: User | null) => void) => {
    if (!isFirebaseReady || !auth) {
        const mockUser = localStorage.getItem('mockUser');
        callback(mockUser ? { uid: 'demo-123', email: 'demo@tradeflow.com', displayName: localStorage.getItem('mockUserName') || 'Trader' } as User : null);
        return () => {};
    }
    return onAuthStateChanged(auth, callback);
};

export const loginUser = async (email: string, pass: string) => {
    if (!isFirebaseReady || !auth) {
        localStorage.setItem('mockUser', 'true');
        window.location.reload();
        return;
    }
    await signInWithEmailAndPassword(auth, email, pass);
};

export const registerUser = async (email: string, pass: string, username: string) => {
    if (!isFirebaseReady || !auth || !db) {
        localStorage.setItem('mockUser', 'true');
        localStorage.setItem('mockUserName', username);
        window.location.reload();
        return;
    }

    const cleanUsername = username.trim().toLowerCase();
    if (cleanUsername.length < 3) throw new Error("Username must be at least 3 chars");

    // 1. Create Auth User FIRST (So we are authenticated for DB checks)
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    try {
        // 2. Check if username is unique (Now allowed because request.auth is not null)
        const usernameRef = doc(db, "usernames", cleanUsername);
        const usernameSnap = await getDoc(usernameRef);

        if (usernameSnap.exists()) {
            // ROLLBACK: Delete the auth user if username is taken
            await deleteUser(user);
            throw new Error("Username is already taken. Please choose another.");
        }

        // 3. Reserve Username & Update Profile
        await setDoc(usernameRef, { uid: user.uid });
        await updateProfile(user, { displayName: username });

        // 4. Create Default Account
        const defaultAccount = { 
            name: 'Main Account', 
            broker: 'Default', 
            balance: 10000, 
            currency: 'USD', 
            userId: user.uid 
        };
        // @ts-ignore
        await addAccountToDb(defaultAccount, user.uid);

    } catch (error: any) {
        // If username check failed or DB failed, we need to handle it
        if (error.message.includes("Username is already taken")) {
            throw error;
        }
        console.error("Registration Flow Error:", error);
        throw error;
    }
};

export const logoutUser = async () => {
    if (!isFirebaseReady || !auth) {
        localStorage.removeItem('mockUser');
        localStorage.removeItem('mockUserName');
        window.location.reload();
        return;
    }
    await signOut(auth);
};

export const resetPassword = async (email: string) => {
    if (!isFirebaseReady || !auth) {
        console.log("Mock reset password for", email);
        return;
    }
    await sendPasswordResetEmail(auth, email);
};

// --- TRADES ---
export const subscribeToTrades = (userId: string, callback: (trades: Trade[]) => void) => {
    if (!isFirebaseReady || !db) {
        const local = localStorage.getItem('trades');
        callback(local ? JSON.parse(local) : []);
        
        const handleStorageChange = () => {
             const updated = localStorage.getItem('trades');
             if (updated) callback(JSON.parse(updated));
        };
        window.addEventListener('localDataUpdate', handleStorageChange);
        return () => window.removeEventListener('localDataUpdate', handleStorageChange);
    }

    const q = query(collection(db, "trades"), where("userId", "==", userId));
    return onSnapshot(q, (snapshot) => {
        const trades = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trade));
        callback(trades);
    }, handleFirestoreError);
};

export const addTradeToDb = async (trade: Trade, userId: string): Promise<string> => {
    if (!isFirebaseReady || !db) {
        const local = JSON.parse(localStorage.getItem('trades') || '[]');
        const id = Date.now().toString();
        const newTrade = { ...trade, id, userId };
        localStorage.setItem('trades', JSON.stringify([...local, newTrade]));
        window.dispatchEvent(new Event('localDataUpdate'));
        return id;
    }
    
    // Explicitly destructure to ensure we don't try to pass an undefined ID if it exists
    const { id, ...tradeData } = trade;
    const cleanData = cleanUndefined(tradeData);
    const docRef = await addDoc(collection(db, "trades"), { ...cleanData, userId });
    return docRef.id;
};

export const updateTradeInDb = async (trade: Partial<Trade>) => {
    if (!isFirebaseReady || !db) {
        const local = JSON.parse(localStorage.getItem('trades') || '[]');
        const updated = local.map((t: Trade) => t.id === trade.id ? { ...t, ...trade } : t);
        localStorage.setItem('trades', JSON.stringify(updated));
        window.dispatchEvent(new Event('localDataUpdate'));
        return;
    }
    
    const { id, ...tradeData } = trade;
    if (!id) throw new Error("Cannot update trade without ID");
    
    const cleanData = cleanUndefined(tradeData);
    await updateDoc(doc(db, "trades", id), cleanData);
};

export const deleteTradeFromDb = async (tradeId: string) => {
    if (!isFirebaseReady || !db) {
        const local = JSON.parse(localStorage.getItem('trades') || '[]');
        localStorage.setItem('trades', JSON.stringify(local.filter((t: Trade) => t.id !== tradeId)));
        window.dispatchEvent(new Event('localDataUpdate'));
        return;
    }
    await deleteDoc(doc(db, "trades", tradeId));
};

// --- ACCOUNTS ---
export const subscribeToAccounts = (userId: string, callback: (accounts: Account[]) => void) => {
    if (!isFirebaseReady || !db) {
        const local = localStorage.getItem('accounts');
        if (local) {
            callback(JSON.parse(local));
        } else {
             const defaults = [
                { id: '1', name: 'Main Account', broker: 'Demo', balance: 10000, currency: 'USD', userId },
            ];
            callback(defaults);
            localStorage.setItem('accounts', JSON.stringify(defaults));
        }
        return () => {};
    }

    const q = query(collection(db, "accounts"), where("userId", "==", userId));
    return onSnapshot(q, async (snapshot) => {
        if (snapshot.empty) {
            callback([]); 
        } else {
            const accounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account));
            callback(accounts);
        }
    }, handleFirestoreError);
};

export const addAccountToDb = async (account: Account, userId: string) => {
    if (!isFirebaseReady || !db) {
        const local = JSON.parse(localStorage.getItem('accounts') || '[]');
        const newAcc = { ...account, id: Date.now().toString(), userId };
        localStorage.setItem('accounts', JSON.stringify([...local, newAcc]));
        window.dispatchEvent(new Event('localDataUpdate'));
        return;
    }
    const { id, ...data } = account;
    const cleanData = cleanUndefined(data);
    await addDoc(collection(db, "accounts"), { ...cleanData, userId });
};

export const deleteAccountFromDb = async (accountId: string) => {
    if (!isFirebaseReady || !db) {
        const local = JSON.parse(localStorage.getItem('accounts') || '[]');
        localStorage.setItem('accounts', JSON.stringify(local.filter((a: Account) => a.id !== accountId)));
        window.dispatchEvent(new Event('localDataUpdate'));
        return;
    }
    await deleteDoc(doc(db, "accounts", accountId));
};

export const updateAccountBalance = async (accountId: string, newBalance: number) => {
    if (!isFirebaseReady || !db) {
        const local = JSON.parse(localStorage.getItem('accounts') || '[]');
        const updated = local.map((a: Account) => a.id === accountId ? { ...a, balance: newBalance } : a);
        localStorage.setItem('accounts', JSON.stringify(updated));
        window.dispatchEvent(new Event('localDataUpdate'));
        return;
    }
    await updateDoc(doc(db, "accounts", accountId), { balance: newBalance });
};

// --- DISCIPLINE ---
export const subscribeToDiscipline = (userId: string, callback: (logs: DisciplineLog[]) => void) => {
    if (!isFirebaseReady || !db) {
        const local = localStorage.getItem('disciplineLogs');
        callback(local ? JSON.parse(local) : []);
        return () => {};
    }
    const q = query(collection(db, "discipline"), where("userId", "==", userId));
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as DisciplineLog)));
    }, handleFirestoreError);
};

export const updateDisciplineLog = async (log: DisciplineLog, userId: string) => {
    if (!isFirebaseReady || !db) {
        const local = JSON.parse(localStorage.getItem('disciplineLogs') || '[]');
        const exists = local.find((l: DisciplineLog) => l.id === log.id);
        let newLogs;
        if (exists) {
            newLogs = local.map((l: DisciplineLog) => l.id === log.id ? log : l);
        } else {
            newLogs = [...local, log];
        }
        localStorage.setItem('disciplineLogs', JSON.stringify(newLogs));
        window.dispatchEvent(new Event('localDataUpdate'));
        return;
    }
    const cleanLog = cleanUndefined(log);
    await setDoc(doc(db, "discipline", log.id), { ...cleanLog, userId }, { merge: true });
};

export const initializeTodayLog = async (userId: string) => {
    if (!isFirebaseReady || !db) return;

    const today = new Date().toISOString().split('T')[0];
    const logId = `${userId}_${today}`;
    
    const q = query(collection(db, "discipline"), where("__name__", "==", logId));
    const snap = await getDocs(q);
    
    if (snap.empty) {
        await setDoc(doc(db, "discipline", logId), {
            id: logId,
            userId,
            date: today,
            followedPlan: false,
            noRevenge: false,
            calmEmotion: false,
            journaled: false,
            notes: '',
            mood: 50,
            intention: ''
        });
    }
}

// --- STORAGE ---
export const uploadScreenshotToStorage = async (base64: string, userId: string): Promise<string | null> => {
    // Safety check: if no base64, return null
    if (!base64 || !base64.startsWith('data:image')) return null;

    if (!isFirebaseReady || !storage) {
        // If local demo mode, safe to return base64 locally
        if (!isFirebaseReady) return base64;
        return null; // Firestore is ready but Storage is not configured/enabled
    }

    try {
        // Unique filename to prevent overwrites
        const filename = `screenshots/${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
        const storageRef = ref(storage, filename);
        
        const snapshot = await uploadString(storageRef, base64, 'data_url');
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (e) {
        console.error("Storage upload failed (safely handled)", e);
        // Important: Return NULL so we don't crash Firestore with a huge base64 string
        return null; 
    }
};

// --- CHALLENGES ---
export const subscribeToChallenge = (userId: string, callback: (challenge: Challenge | null) => void) => {
    if (!isFirebaseReady || !db) {
        const local = localStorage.getItem('activeChallenge');
        callback(local ? JSON.parse(local) : null);
        window.addEventListener('challengeUpdate', () => {
             const updated = localStorage.getItem('activeChallenge');
             callback(updated ? JSON.parse(updated) : null);
        });
        return () => {};
    }
    
    const q = query(collection(db, "challenges"), where("userId", "==", userId), where("status", "==", "active"));
    return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
            callback({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Challenge);
        } else {
            callback(null);
        }
    });
};

export const startChallenge = async (challenge: Challenge, userId: string) => {
    if (!isFirebaseReady || !db) {
        localStorage.setItem('activeChallenge', JSON.stringify({ ...challenge, userId }));
        window.dispatchEvent(new Event('challengeUpdate'));
        return;
    }
    
    // Deactivate old challenges
    const q = query(collection(db, "challenges"), where("userId", "==", userId), where("status", "==", "active"));
    const snap = await getDocs(q);
    snap.forEach(async (d) => {
        await updateDoc(doc(db, "challenges", d.id), { status: 'failed' }); // or archived
    });
    
    const { id, ...data } = challenge;
    await addDoc(collection(db, "challenges"), { ...data, userId });
};

export const updateChallenge = async (challenge: Challenge) => {
     if (!isFirebaseReady || !db) {
        localStorage.setItem('activeChallenge', JSON.stringify(challenge));
        window.dispatchEvent(new Event('challengeUpdate'));
        return;
    }
    
    const { id, ...data } = challenge;
    if (!id) return;
    await updateDoc(doc(db, "challenges", id), data);
}
