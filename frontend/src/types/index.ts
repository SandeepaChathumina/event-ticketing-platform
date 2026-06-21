export interface Movie {
  id: number;
  title: string;
  description: string;
  posterUrl: string;
  durationMinutes: number;
  ageRating: string;
}

export interface Screen {
  id: number;
  name: string;
  totalCapacity: number;
}

export interface Showtime {
  id: number;
  movie: Movie;
  screen: Screen;
  startTime: string;
  ticketPrice: number;
}