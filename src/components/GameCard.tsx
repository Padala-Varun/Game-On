import React from "react";
import { Game } from "../types";
import { Play } from "lucide-react";

interface GameCardProps {
  game: Game;
  onPlay: (gameId: string) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onPlay }) => {
  const difficultyColor = () => {
    switch (game.difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handlePlay = () => {
    // First call the original onPlay handler
    // This will trigger the auth modal if user is not logged in
    onPlay(game.id);

    // The actual navigation should be handled in the onPlay callback
    // from the parent component, which already checks for user authentication
    // We don't need to navigate directly from here
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
      <div className="h-48 bg-gray-200 relative">
        <img
          src={game.imageUrl}
          alt={game.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/api/placeholder/400/320";
          }}
        />
        <div className="absolute top-2 right-2">
          <span
            className={`px-2 py-1 rounded-md text-xs font-medium ${difficultyColor()}`}
          >
            {game.difficulty}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{game.title}</h3>
        <p className="text-gray-600 text-sm mb-4">{game.description}</p>
        <button
          onClick={handlePlay}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Play size={18} />
          Play Now
        </button>
      </div>
    </div>
  );
};
