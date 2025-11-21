
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
    User
} from "firebase/auth";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { auth, db, storage, isFirebaseReady } from "./firebase";
import { Trade, Account, DisciplineLog } from "../types";

// Helper for permission errors
const handleFirestoreError = (error: any) => {
    console.error("Firestore Error:", error);
    if (error.code === 'permission-denied') {
        alert("⚠️ Database Permission Denied\n\nPlease go to Firebase Console > Firestore Database > Rules and change them to:\n\nallow read, write: if request.auth != null;");
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

    // 1. Check if username is unique
    const cleanUsername = username.trim().toLowerCase();
    if (cleanUsername.length < 3) throw new Error("Username must be at least 3 chars");

    const usernameRef = doc(db, "usernames", cleanUsername);
    const usernameSnap = await getDoc(usernameRef);

    if (usernameSnap.exists()) {
        throw new Error("Username is already taken. Please choose another.");
    }

    // 2. Create Auth User
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    
    // 3. Update Profile
    await updateProfile(userCredential.user, { displayName: username });

    // 4. Reserve Username in DB
    await setDoc(usernameRef, { uid: userCredential.user.uid });
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

export const addTradeToDb = async (trade: Trade, userId: string) => {
    if (!isFirebaseReady || !db) {
        const local = JSON.parse(localStorage.getItem('trades') || '[]');
        const newTrade = { ...trade, id: Date.now().toString(), userId };
        localStorage.setItem('trades', JSON.stringify([...local, newTrade]));
        window.dispatchEvent(new Event('localDataUpdate'));
        return newTrade;
    }
    
    const { id, ...tradeData } = trade;
    const cleanData = cleanUndefined(tradeData);
    await addDoc(collection(db, "trades"), { ...cleanData, userId });
};

export const updateTradeInDb = async (trade: Trade) => {
    if (!isFirebaseReady || !db) {
        const local = JSON.parse(localStorage.getItem('trades') || '[]');
        const updated = local.map((t: Trade) => t.id === trade.id ? trade : t);
        localStorage.setItem('trades', JSON.stringify(updated));
        window.dispatchEvent(new Event('localDataUpdate'));
        return;
    }
    
    const { id, ...tradeData } = trade;
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
                { id: '1', name: 'Alpha Live', broker: 'IC Markets', balance: 10500, currency: 'USD', userId },
                { id: '2', name: 'Prop Challenge', broker: 'FTMO', balance: 99800, currency: 'USD', userId },
            ];
            callback(defaults);
            localStorage.setItem('accounts', JSON.stringify(defaults));
        }
        return () => {};
    }

    const q = query(collection(db, "accounts"), where("userId", "==", userId));
    return onSnapshot(q, async (snapshot) => {
        if (snapshot.empty) {
            const defaultAccount = { name: 'Main Account', broker: 'Default', balance: 10000, currency: 'USD', userId };
            await addDoc(collection(db, "accounts"), defaultAccount);
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
    // Clean undefined values to prevent Firestore crash
    const cleanLog = cleanUndefined(log);
    await setDoc(doc(db, "discipline", log.id), { ...cleanLog, userId }, { merge: true });
};

export const initializeTodayLog = async (userId: string) => {
    if (!isFirebaseReady || !db) return;

    const today = new Date().toISOString().split('T')[0];
    const logId = `${userId}_${today}`;
    
    // Check if exists
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
            mood: 50, // Neutral default
            intention: ''
        });
    }
}

// --- STORAGE ---
export const uploadScreenshotToStorage = async (base64: string, userId: string) => {
    if (!isFirebaseReady || !storage) return base64;

    try {
        const storageRef = ref(storage, `screenshots/${userId}/${Date.now()}.jpg`);
        const snapshot = await uploadString(storageRef, base64, 'data_url');
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (e) {
        console.error("Upload failed", e);
        return base64; 
    }
};
