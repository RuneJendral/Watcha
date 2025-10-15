import { images } from "@/constants/images";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Swiper, type SwiperCardRefType } from "rn-swiper-list";

import {
  castVote,
  closeVotingSession,
  createVotingSession,
  deleteVotingSessionCascade,
  getLatestVotingSession,
  getMoviesWatchlist,
  getUserVotesForSession,
  getWatchlistMovieCard,
  getWinnerForSession,
  hasUserCompletedVoting,
  tallyVotes,
} from "@/services/appwrite";
import type { VoteValue, VotingSessionDoc, WatchlistMovies } from "@/type";


const like: VoteValue = "like";
const dislike: VoteValue = "dislike";

const VotingScreen= () => {
  const { id, selected } = useLocalSearchParams<{ id: string; selected?: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [session, setSession] = useState<VotingSessionDoc | undefined>(undefined);
  const [movies, setMovies] = useState<WatchlistMovies[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});

  // finished = current user has voted on all movies
  const [finished, setFinished] = useState(false);
  const [minutes, setMinutes] = useState("20");
  const [allowSkip, setAllowSkip] = useState(true);
  const [timeLeftMs, setTimeLeftMs] = useState(-1); // -1 = uninitialized

  // winner view
  const [winner, setWinner] = useState<{ id?: string; title?: string; poster_url?: string } | null>(null);
  const [resultScores, setResultScores] =
    useState<Record<string, { likes: number; dislikes: number; total: number }> | null>(null);

  const swiperRef = useRef<SwiperCardRefType>(null);

  const { width } = useWindowDimensions();
  const [availH, setAvailH] = useState(0);

  const PADDING_X = 20;

  const CARD_W = Math.min(width - PADDING_X * 2, 480);
  const RATIO = 1.45;


  
  const filterMoviesFor = useCallback((all: WatchlistMovies[], ids: string[]) => {
    const set = new Set(ids.map(String));
    return all.filter((m) => set.has(String(m.movie_id)));
  }, []);

  const refreshScores = useCallback(async (sid: string) => {
    try {
      setScores(await tallyVotes(sid));
    } catch {}
  }, []);

  const seedCountdown = (endsAt?: string) => {
    if (!endsAt) return setTimeLeftMs(-1);
    setTimeLeftMs(Math.max(0, new Date(endsAt).getTime() - Date.now()));
  };

  const computeResults = useCallback(async (sid: string) => {
    const { winnerId, scores } = await getWinnerForSession(sid);
    setResultScores(scores ?? null);
    if (winnerId) {
      const card = await getWatchlistMovieCard(winnerId);
      setWinner({ id: winnerId, title: card?.title, poster_url: card?.poster_url });
    } else {
      setWinner({ id: undefined, title: "No votes cast" });
    }
  }, []);

  // load latest session (active OR closed); or preselected list if none
  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const latest = await getLatestVotingSession(id);
      const all = (await getMoviesWatchlist(id)) ?? [];

      if (latest) {
        setSession(latest);
        const inSession = filterMoviesFor(all, latest.movie_ids ?? []);
        setMovies(inSession);
        await refreshScores(latest.$id);

        if (latest.status === "active") {
          seedCountdown(latest.ends_at);
          setFinished(await hasUserCompletedVoting(latest.$id, latest.movie_ids ?? []));
        } else {
          // closed -> results persist until user clears
          setTimeLeftMs(0);
          await computeResults(latest.$id);
        }
      } else {
        setSession(undefined);
        if (selected) {
          const selectedIds = JSON.parse(selected) as string[];
          setMovies(filterMoviesFor(all, selectedIds));
        } else {
          setMovies([]);
        }
        setFinished(false);
        setTimeLeftMs(-1);
        setWinner(null);
        setResultScores(null);
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to load voting.");
    } finally {
      setLoading(false);
    }
  }, [id, selected, filterMoviesFor, refreshScores, computeResults]);

  useEffect(() => {
    load();
  }, [load]);

  // Refresh 
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // countdown tick 
  useEffect(() => {
    if (!session || session.status !== "active") return;
    const t = setInterval(() => {
      const left = Math.max(0, new Date(session.ends_at).getTime() - Date.now());
      setTimeLeftMs(left);
    }, 1000);
    return () => clearInterval(t);
  }, [session?.ends_at, session?.status]);

  // time reached -> only CLOSE (keep data) and show results (persist)
  useEffect(() => {
    (async () => {
      if (!session || session.status !== "active") return;
      if (timeLeftMs < 0) return; // not initialized
      const pastDeadline = Date.now() >= new Date(session.ends_at).getTime();
      if (timeLeftMs === 0 && pastDeadline) {
        await closeVotingSession(session.$id); // mark closed
        setSession({ ...session, status: "closed" });
        await computeResults(session.$id);
      }
    })();
  }, [timeLeftMs, session?.$id, session?.ends_at, session?.status, computeResults]);

  // ---------- actions ----------
  const onSwipe = async (index: number, dir: "left" | "right" | "top") => {
    if (!session || session.status !== "active" || finished) return;
    const movie = movies[index];
    if (!movie) return;
    const value: VoteValue = dir === "right" ? like : dislike;
    try {
      await castVote(session.$id, String(movie.movie_id), value);
      await refreshScores(session.$id);

      const myVotes = await getUserVotesForSession(session.$id);
      if (new Set(myVotes.map((v) => String(v.movie_id))).size >= (session.movie_ids ?? []).length) {
        setFinished(true);
      }
    } catch {}
  };

  const onSwipedAll = async () => {
    if (!session) return;
    setFinished(true);
    await refreshScores(session.$id);
  };

  const onStartVoting = async () => {
    if (!id || movies.length === 0) return;
    try {
      setLoading(true);
      const mins = Math.max(1, parseInt(minutes || "15", 10));
      const s = await createVotingSession(
        id,
        movies.map((m) => String(m.movie_id)),
        { minutes: mins, allowSkip }
      );
      setSession(s);
      setFinished(false);
      await refreshScores(s.$id);
      seedCountdown(s.ends_at);
    } catch (e: any) {
      setError(e?.message ?? "Could not start voting.");
    } finally {
      setLoading(false);
    }
  };

  const onCloseNow = async () => {
    if (!session || session.status !== "active") return;
    await closeVotingSession(session.$id);
    setSession({ ...session, status: "closed" });
    setTimeLeftMs(0);
    await computeResults(session.$id);
  };

  const onClearSession = async () => {
    if (!session) return;
    try {
      setLoading(true);
      await deleteVotingSessionCascade(session.$id);
      setSession(undefined);
      setWinner(null);
      setResultScores(null);
      setScores({});
      setTimeLeftMs(-1);
      await load();
    } finally {
      setLoading(false);
    }
  };

  // ---------- UI helpers ----------
  const Header = useMemo(
    () => (
      <View className="px-5 pt-20 mb-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg text-white font-bold">Voting</Text>
        </View>
      </View>
    ),
    [session?.status]
  );

  const timeLeftText = useMemo(() => {
    if (timeLeftMs < 0) return "--:--";
    const s = Math.ceil(timeLeftMs / 1000);
    const mm = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  }, [timeLeftMs]);

  // ---------- render states ----------
  if (loading) {
    return (
      <View className="flex-1 bg-primary justify-center items-center">
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-primary">
        <Image source={images.bg} className="absolute w-full y-0" />
        {Header}
        <View className="px-5">
          <Text className="text-red-400">{error}</Text>
        </View>
      </View>
    );
  }

  // no session & no selection
  if (!session && movies.length === 0) {
    return (
      <View className="flex-1 bg-primary">
        <Image source={images.bg} className="absolute w-full y-0" />
        {Header}
        <View className="px-5">
          <Text className="text-white text-base">
            No active voting. Select movies in the watchlist first, then click on Start Voting to start a session.
          </Text>
        </View>
      </View>
    );
  }

  // pre-start config
  if (!session && movies.length > 0) {
    return (
      <KeyboardAvoidingView
        className="flex-1 bg-primary"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Image source={images.bg} className="absolute w-full y-0" />
        {Header}

        <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 40 }}>
          <Text className="text-white text-base mb-2">
            You selected {movies.length} movie(s) for the vote.
          </Text>

          <View className="bg-dark-100 rounded-2xl p-4 mt-3">
            <Text className="text-white font-semibold mb-2">Duration (minutes)</Text>
            <TextInput
              value={minutes}
              onChangeText={setMinutes}
              placeholder="15"
              keyboardType="number-pad"
              className="bg-dark-200 rounded-lg text-white px-3 py-2"
            />

            <TouchableOpacity
              onPress={() => setAllowSkip((s) => !s)}
              className="mt-4 flex-row items-center justify-between bg-dark-200 rounded-lg px-3 py-3"
            >
              <Text className="text-white">Allow skipping a card</Text>
              <View className={`w-5 h-5 rounded ${allowSkip ? "bg-accent" : "bg-light-200"}`} />
            </TouchableOpacity>

            <TouchableOpacity onPress={onStartVoting} className="mt-5 bg-accent rounded-xl py-3 items-center">
              <Text className="text-white font-semibold">Start voting</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-white font-semibold mt-6 mb-2">Preview</Text>
          <View className="flex-row flex-wrap gap-2">
            {movies.slice(0, 9).map((m) => (
              <Image key={m.$id} source={{ uri: m.poster_url }} className="w-20 h-28 rounded-lg" resizeMode="cover" />
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // results (closed session persists)
  if (session && session.status === "closed") {
    return (

        <ScrollView className="bg-primary" contentContainerStyle={{ paddingBottom: 110 }}>
          <Image source={images.bg} className="absolute w-full y-0" />
          {Header}

          <View className="px-5">
            <Text className="text-white text-xl font-bold mb-3">Results</Text>

            {winner?.poster_url ? (
              <Image source={{ uri: winner.poster_url }} className="w-full h-72 rounded-2xl mb-3" resizeMode="cover" />
            ) : null}
            <Text className="text-white text-lg font-semibold mb-3">{winner?.title ?? "No winner"}</Text>

            <View className="bg-dark-100 rounded-2xl p-3 mb-4">
              {movies.map((m) => {
                const s = resultScores?.[String(m.movie_id)];
                return (
                  <View key={m.$id} className="flex-row items-center justify-between py-1">
                    <Text className="text-white flex-1 pr-2" numberOfLines={1}>
                      {m.title}
                    </Text>
                    <Text className="text-white">{s ? `${s.total}` : "0"}</Text>
                  </View>
                );
              })}
            </View>

            <TouchableOpacity onPress={onClearSession} className="bg-accent rounded-xl py-3 items-center">
              <Text className="text-white font-semibold">Finish & Clear</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

    );
  }

  // active session (swiping)
  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full y-0" />
      {Header}

      {finished ? (
        <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 110 }}>
          <Text className="text-white text-base mb-2">Thanks! You’ve voted.</Text>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white font-semibold">Time left</Text>
            <Text className="text-white font-bold">{timeLeftText}</Text>
          </View>
          <TouchableOpacity onPress={onCloseNow} className="mb-3 self-start bg-light-200 px-3 py-1.5 rounded-lg">
            <Text className="text-black font-semibold">Close Voting</Text>
          </TouchableOpacity>
          <View className="bg-dark-100 rounded-2xl p-3">
            {movies.map((m) => (
              <View key={m.$id} className="flex-row items-center justify-between py-1">
                <Text className="text-white flex-1 pr-2" numberOfLines={1}>
                  {m.title}
                </Text>
                <Text className="text-white">{scores[String(m.movie_id)] ?? 0}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <>
          <View className="px-5">
            <View className="flex-row items-center justify-between">
              <Text className="text-white font-semibold">Time left</Text>
              <Text className="text-white font-bold">{timeLeftText}</Text>
            </View>
            <TouchableOpacity onPress={onCloseNow} className="mt-2 mb-2 self-start bg-light-200 px-3 py-1.5 rounded-lg">
              <Text className="text-black font-semibold">Close Voting</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-1 px-5" onLayout={(e) => setAvailH(e.nativeEvent.layout.height)}>
            {availH > 0 && (
              <GestureHandlerRootView className="flex-1">
                {(() => {
                  const CARD_H = Math.min(Math.max(availH - 12, 0), Math.round(CARD_W * RATIO));
                  return (
                    <View className="w-full items-center" style={{ height: CARD_H }}>
                      <Swiper
                        ref={swiperRef}
                        data={movies}
                        keyExtractor={(m: any) => String(m?.$id)}
                        onSwipeLeft={(i: number) => onSwipe(i, "left")}
                        onSwipeRight={(i: number) => onSwipe(i, "right")}
                        onSwipeTop={() => onSwipe(0, "top")}
                        onSwipeBottom={() => onSwipe(0, "top")}
                        onSwipedAll={onSwipedAll}
                        disableTopSwipe={!session?.allow_skip}
                        disableBottomSwipe={!session?.allow_skip}
                        cardStyle={{
                          width: CARD_W,
                          height: CARD_H,
                          borderRadius: 16,
                          overflow: "hidden",
                        }}
                        renderCard={(item: any) => {
                          if (!item) return <View className="bg-dark-100 rounded-2xl flex-1" />;
                          return (
                            <View className="bg-dark-100 rounded-2xl overflow-hidden h-full w-full">
                              <Image source={{ uri: item.poster_url }} className="w-full h-full" resizeMode="cover" />
                              <View className="absolute bottom-0 left-0 right-0 p-3 bg-black/40">
                                <Text className="text-white font-bold text-lg">{item.title}</Text>
                              </View>
                            </View>
                          );
                        }}
                      />
                    </View>
                  );
                })()}
              </GestureHandlerRootView>
            )}
          </View>
        </>
      )}
    </View>
  );
}

export default VotingScreen