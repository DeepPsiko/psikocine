export type Role = "USER" | "ADMIN";

export type SaturdayStatus = "SCHEDULED" | "VOTING" | "FINISHED";

export interface SafeUser {
  id: string;
  name: string;
  username: string;
  email: string | null;
  avatar: string | null;
  bio: string | null;
  role: Role;
  isBlocked: boolean;
  createdAt: string;
}

export interface GenreItem {
  id: string;
  name: string;
  slug: string;
}

export interface RatingDistribution {
  star: number;
  count: number;
  percentage: number;
}

export interface MovieItem {
  id: string;
  title: string;
  originalTitle: string | null;
  year: number;
  description: string;
  poster: string;
  backdrop: string | null;
  duration: number;
  director: string;
  cast: string;
  country: string | null;
  trailerUrl: string | null;
  createdAt: string;
  genres: GenreItem[];
  averageRating: number;
  ratingCount: number;
  ratingDistribution?: RatingDistribution[];
  userRating?: number | null;
  isFavorite?: boolean;
  inWatchlist?: boolean;
  isWatched?: boolean;
  reviewCount?: number;
}

export interface ReviewReplyItem {
  id: string;
  content: string;
  userId: string;
  reviewId: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
  };
}

export interface ReviewItem {
  id: string;
  content: string;
  hasSpoiler: boolean;
  isHidden: boolean;
  userId: string;
  movieId: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
    role: string;
  };
  userRating?: number | null;
  likesCount: number;
  hasLiked?: boolean;
  replies: ReviewReplyItem[];
}

export interface SaturdayCandidateItem {
  id: string;
  saturdayId: string;
  movieId: string;
  proposedById: string;
  movie: {
    id: string;
    title: string;
    year: number;
    poster: string;
    backdrop: string | null;
    director: string;
    duration: number;
    genres: { genre: GenreItem }[];
    averageRating?: number;
  };
  proposedBy: {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
  };
  votesCount: number;
  percentage: number;
  rank: number;
}

export interface SaturdayEventItem {
  id: string;
  title: string;
  date: string;
  votingDeadline: string;
  status: SaturdayStatus;
  winnerMovieId: string | null;
  winnerMovie?: MovieItem | null;
  notes: string | null;
  candidates: SaturdayCandidateItem[];
  totalVotes: number;
  userVotedCandidateId?: string | null;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "VOTE" | "WINNER";
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}
