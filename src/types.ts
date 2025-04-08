// src/types.ts

export interface Game {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface GameSession {
  session_id: string;
  game_id: string;
  title: string;
  status: string;
}

export interface AuthModalProps {
  isOpen: boolean;
  mode: "login" | "signup";
  onClose: () => void;
  onAuthSuccess: (
    user: User | null,
    newMode?: "login" | "signup" | null
  ) => void;
}
