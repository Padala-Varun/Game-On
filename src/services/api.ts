import { User, Game, GameSession } from "../types";

export const AuthService = {
  getCurrentUser: async (): Promise<User> => {
    const response = await fetch("/api/auth/current-user");
    if (!response.ok) throw new Error("Failed to get current user");
    return response.json();
  },

  login: async (email: string, password: string): Promise<User> => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error("Login failed");
    return response.json();
  },

  signup: async (email: string, password: string): Promise<User> => {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error("Signup failed");
    return response.json();
  },

  logout: async (): Promise<void> => {
    const response = await fetch("/api/auth/logout", { method: "POST" });
    if (!response.ok) throw new Error("Logout failed");
  },
};

export const GameService = {
  getGames: async (): Promise<Game[]> => {
    const response = await fetch("/api/games");
    if (!response.ok) throw new Error("Failed to fetch games");
    return response.json();
  },

  playGame: async (gameId: string): Promise<GameSession> => {
    const response = await fetch(`/api/games/${gameId}/play`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Failed to start game");
    return response.json();
  },
};
