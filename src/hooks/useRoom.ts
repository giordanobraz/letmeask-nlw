import { useEffect, useState } from "react";
import { database } from "../services/firebase";
import { useAuth } from "./useAuth";
type Questions = {
  id: string;
  author: {
    nome: string;
    avatar: string;
  }
  content: string;
  isAnswered: boolean;
  isHighlighted: boolean;
  likeCount: number;
  likeId: string | undefined;
}

type firebaseQuestions = Record<string, {
  author: {
    nome: string;
    avatar: string;
  }
  endedAt: Date;
  content: string;
  isAnswered: boolean;
  isHighlighted: boolean;
  likes: Record<string, {
    authorId: string
  }>
}>

export function useRoom(roomId: string) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Questions[]>([]);
  const [title, setTitle] = useState('');

  useEffect(() => {
    const roomRef = database.ref(`rooms/${roomId}`);
    roomRef.on('value', room => {
      const databaseRoom = room.val();
      const databaseQuestions: firebaseQuestions = databaseRoom.questions ?? {};
      const parsedQuestions = Object.entries(databaseQuestions).map(([key, value]) => {
        return {
          id: key,
          content: value.content,
          author: value.author,
          isHighlighted: value.isHighlighted,
          isAnswered: value.isAnswered,
          likeCount: Object.values(value.likes ?? {}).length,
          likeId: Object.entries(value.likes ?? {}).find(([key, like]) => like.authorId === user?.id)?.[0]          
        }
      });

      const questionsSorted = parsedQuestions.sort((a, b) => a.likeCount - b.likeCount);
      setTitle(databaseRoom.title);
      setQuestions(questionsSorted);
    })

    return () => {
      roomRef.off('value');
    }
  }, [roomId, user?.id])

  return { questions, title }
}