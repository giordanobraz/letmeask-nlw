import firebase from "firebase";
import { createContext, ReactNode, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { auth } from "../services/firebase";

type User = {
  id: string,
  nome: string,
  avatar: string;
}

type AuthContextType = {
  user: User | undefined,
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

type AuthContextProviderProps = {
  children: ReactNode
}

export const AuthContext = createContext({} as AuthContextType);
export function AuthContextProvider(props: AuthContextProviderProps) {
  const [user, setUser] = useState<User>();
  const history = useHistory()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        const { displayName, photoURL, uid } = user;

        if (!displayName || !photoURL) {
          throw new Error('Faltando informações na conta Google.');
        }

        setUser({
          id: uid,
          nome: displayName,
          avatar: photoURL
        });
      }

      return () => {
        unsubscribe();
      }
    });
  }, []);

  async function signInWithGoogle() {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await auth.signInWithPopup(provider);

      if (result.user) {
        const { displayName, photoURL, uid } = result.user;

        if (!displayName || !photoURL) {
          throw new Error('Faltando informações na conta Google.');
        }

        setUser({
          id: uid,
          nome: displayName,
          avatar: photoURL
        });
      }
    } catch (e) {
      alert('Vixe, um erro! Descrição: ' + e)
    }
  }

  async function signOut() {
    await auth.signOut().then(() => { setUser(undefined) }).then(() => history.push('/'))
  }
  return (
    <AuthContext.Provider value={{ user, signInWithGoogle, signOut }}>
      {props.children}
    </AuthContext.Provider>
  );
}