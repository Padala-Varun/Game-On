export interface Game {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface User {
  email: string;
  password: string;
}