// src/App.tsx
import React, { useState, useEffect } from "react";
import { GameCard } from "./components/GameCard";
import { AuthModal } from "./components/AuthModal";
import { Game } from "./types";
import { Gamepad2, LogIn, UserPlus, User } from "lucide-react";

const API_BASE_URL = "https://game-on-1.onrender.com/api";


function App() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [games, setGames] = useState<Game[]>([]);
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    mode: "login" | "signup";
  }>({
    isOpen: false,
    mode: "login",
  });

  useEffect(() => {
    // Check if user is already logged in
    async function checkAuthStatus() {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          credentials: "include", // Important for cookies
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
      } finally {
        setIsLoading(false);
      }
    }

    // Fetch games from backend
    async function fetchGames() {
      try {
        const response = await fetch(`${API_BASE_URL}/games`, {
          credentials: "include",
        });

        if (response.ok) {
          const gamesData = await response.json();
          setGames(gamesData);
        }
      } catch (error) {
        console.error("Failed to fetch games:", error);
        // Fallback to sample games if API fails
        setGames([
          {
            id: "game1",
            title: "Snake Classic",
            description:
              "Navigate the snake to collect food and grow longer without hitting walls or yourself.",
            imageUrl: "/api/placeholder/400/320",
            difficulty: "Easy",
          },
          {
            id: "game2",
            title: "Memory Match",
            description:
              "Test your memory by matching pairs of cards in this classic concentration game.",
            imageUrl: "/api/placeholder/400/320",
            difficulty: "Medium",
          },
          {
            id: "game3",
            title: "Space Shooter",
            description:
              "Defend Earth from alien invaders in this action-packed space adventure.",
            imageUrl: "/api/placeholder/400/320",
            difficulty: "Hard",
          },
          {
            id: "game4",
            title: "Puzzle Master",
            description:
              "Solve challenging puzzles and train your brain with this addictive game.",
            imageUrl: "/api/placeholder/400/320",
            difficulty: "Medium",
          },
        ]);
      }
    }

    checkAuthStatus();
    fetchGames();
  }, []);

  const handleAuthSuccess = (
    userData: any | null,
    newMode: "login" | "signup" | null = null
  ) => {
    if (userData) {
      setUser(userData);
    }

    if (newMode) {
      setAuthModal({ isOpen: true, mode: newMode });
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handlePlayGame = async (gameId: string) => {
    if (!user) {
      setAuthModal({ isOpen: true, mode: "login" });
      return;
    }

    try {
      // Call backend to record game play or handle game session
      const response = await fetch(`${API_BASE_URL}/games/${gameId}/play`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        const gameSession = await response.json();
        console.log("Game session started:", gameSession);

        // Now navigate based on the game ID or title
        const game = games.find((g) => g.id === gameId);
        if (game) {
          let url = "";

          if (game.title.toLowerCase().includes("snake")) {
            url = "https://breakout-master.vercel.app/";
          } else if (game.title.toLowerCase().includes("memory")) {
            url = "https://sudoku-master-eta.vercel.app/";
          } else if (game.title.toLowerCase().includes("space")) {
            url = "https://tic-tac-toe-master-mauve.vercel.app/";
          } else if (game.title.toLowerCase().includes("puzzle")) {
            url = "https://slide-puzzle-master.vercel.app/";
          } else if (game.id === "game1") {
            url = "https://breakout-master.vercel.app/";
          } else if (game.id === "game2") {
            url = "https://sudoku-master-eta.vercel.app/";
          } else if (game.id === "game3") {
            url = "https://tic-tac-toe-master-mauve.vercel.app/";
          } else if (game.id === "game4") {
            url = "https://slide-puzzle-master.vercel.app/";
          }

          if (url) {
            window.open(url, "_blank");
          }
        }
      }
    } catch (error) {
      console.error("Failed to start game:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Gamepad2 size={32} className="text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">GameHub</h1>
            </div>
            <div className="flex gap-3">
              {isLoading ? (
                <div className="w-16 h-8 bg-gray-200 animate-pulse rounded-lg"></div>
              ) : !user ? (
                <>
                  <button
                    onClick={() =>
                      setAuthModal({ isOpen: true, mode: "login" })
                    }
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <LogIn size={20} />
                    Sign In
                  </button>
                  <button
                    onClick={() =>
                      setAuthModal({ isOpen: true, mode: "signup" })
                    }
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                  >
                    <UserPlus size={20} />
                    Sign Up
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <User size={20} className="text-indigo-600" />
                    <span className="font-medium">
                      {user.username || user.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to GameHub
          </h2>
          <p className="text-xl text-gray-600">
            {user
              ? `Ready to play, ${user.username || "gamer"}?`
              : "Your gateway to endless entertainment"}
          </p>
        </div>

        {isLoading ? (
          // Loading skeleton
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-200 animate-pulse rounded mb-2"></div>
                  <div className="h-12 bg-gray-200 animate-pulse rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {games.map((game) => (
              <GameCard key={game.id} game={game} onPlay={handlePlayGame} />
            ))}
          </div>
        )}
      </main>

      <AuthModal
        isOpen={authModal.isOpen}
        mode={authModal.mode}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default App;
