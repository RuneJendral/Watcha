import { RelativePathString } from "expo-router";
import { ImageSourcePropType } from "react-native";
import { Models } from "react-native-appwrite";

export interface User extends Models.Document {
    name: string;
    email: string;
    avatar: string;
}

interface TabBarIconProps {
    focused: boolean;
    icon: ImageSourcePropType;
    iconHighlight: ImageSourcePropType;
}

interface CustomButtonProps {
    onPress?: () => void;
    title?: string;
    style?: string;
    leftIcon?: React.ReactNode;
    textStyle?: string;
    isLoading?: boolean;
}

interface CustomInputProps {
    placeholder?: string;
    value?: string;
    onChangeText?: (text: string) => void;
    label: string;
    secureTextEntry?: boolean;
    keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
}

interface ProfileFieldProps {
    label: string;
    value: string;
    icon: ImageSourcePropType;
}

interface CreateUserParams {
    email: string;
    password: string;
    name: string;
}

interface SignInParams {
    email: string;
    password: string;
}

interface ChangeNameParams {
    name: string;
}

interface ChangeMailParams {
    email: string;
    password: string;
}

interface ChangePasswordParams {
    newPassword: string;
    oldPassword: string;
}

interface MovieInfoProps {
  label: string;
  value?: string | number | null;
}

interface Props{
    placeholder: string;
    value?: string;
    onChangeText?: (text: string) => void;
    onSubmit?: () => void;
}

interface AddToWatchlistProps{
  visible: boolean;
  onClose: () => void;
  onSelectWatchlist: (watchlistId: string) => void;
  movie: MovieDetails;
}

interface CreateWatchlistProps{
  visible: boolean;
  onClose: () => void;
}

interface ManageMembersProps{
  visible: boolean;
  watchlistId: string;
  onClose: () => void;
}

interface RandomMovieProps{
  visible: boolean;
  watchlistId: string;
  onClose: () => void;
  movies: WatchlistMovies[];
}

interface Movie {
  id: number;
  title: string;
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

interface TrendingMovie {
  searchTerm: string;
  movie_id: number;
  title: string;
  count: number;
  poster_url: string;
}

interface MovieDetails {
  adult: boolean;
  backdrop_path: string | null;
  belongs_to_collection: {
    id: number;
    name: string;
    poster_path: string;
    backdrop_path: string;
  } | null;
  budget: number;
  genres: {
    id: number;
    name: string;
  }[];
  homepage: string | null;
  id: number;
  imdb_id: string | null;
  original_language: string;
  original_title: string;
  overview: string | null;
  popularity: number;
  poster_path: string | null;
  production_companies: {
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
  }[];
  production_countries: {
    iso_3166_1: string;
    name: string;
  }[];
  release_date: string;
  revenue: number;
  runtime: number | null;
  spoken_languages: {
    english_name: string;
    iso_639_1: string;
    name: string;
  }[];
  status: string;
  tagline: string | null;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

interface TrendingCardProps {
  movie: TrendingMovie;
  index: number;
}

type WatchlistProps = {
  id: string;
  name: string;
  selected: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
};

type WatchlistModal = {
  id: string;
  name: string;
};

type CreateWatchlistCardProps ={
  inSelectionMode: boolean; 
  refetchWatchlists: () => void;
}

interface SettingsItemProps {
    icon: ImageSourcePropType;
    title: string; 
    onPress?: () => void;
    textStyle?: string;
    showArrow?: boolean;
    path?: RelativePathString;
}

interface Watchlist {
  id: string;
  name: string;
  watchlistMovies?: string[]; 
  watchlistMembers?: string[]; 
}

interface WatchlistMember {
  id: string;
  name: string;
  avatar?: string;
  watchlistId?: string[];
  user_id?: string[];
}

interface WatchlistMovies {
  $id: string;
  watchlistIds: string[];
  movie_id: string;
  title: string;
  poster_url: string;
  vote_average?: number;
  release_date?: string;
  createdAt: string;
  selected: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}
