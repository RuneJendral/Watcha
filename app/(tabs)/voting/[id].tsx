// app/(tabs)/votingd/[id].tsx
import { images } from "@/constants/images";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, BackHandler, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import Swiper from "react-native-deck-swiper";

import {
  castVote,
  closeVotingSession,
  createVotingSession,
  deleteVotingSessionCascade,
  getActiveVotingSession, getMoviesWatchlist,
  getUserVotesForSession,
  getWatchlistMovieCard,
  getWinnerForSession,
  hasUserCompletedVoting, tallyVotes
} from "@/services/appwrite";
import type { VoteValue, VotingSessionDoc, WatchlistMovies } from "@/type";

const like: VoteValue = "like";
const dislike: VoteValue = "dislike";

export default function VotingScreen() {
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
  const [timeLeftMs, setTimeLeftMs] = useState(-1);

  // winner view
  const [winner, setWinner] = useState<{ id?: string; title?: string; poster_url?: string } | null>(null);
  const [resultScores, setResultScores] = useState<Record<string,{likes:number;dislikes:number;total:number}> | null>(null);

  const swiperRef = useRef<Swiper<any>>(null);

  const filterMoviesFor = useCallback((all: WatchlistMovies[], ids: string[]) => {
    const set = new Set(ids.map(String));
    return all.filter(m => set.has(String(m.movie_id)));
  }, []);

  const refreshScores = useCallback(async (sid: string) => {
    try { setScores(await tallyVotes(sid)); } catch {}
  }, []);

  const startCountdown = (endsAt?: string) => {
    if (!endsAt) return undefined as undefined | (() => void);
    const calc = () => Math.max(0, new Date(endsAt).getTime() - Date.now());
    // seed immediately so we never sit at -1 with a valid session
    setTimeLeftMs(calc());
    const t = setInterval(() => setTimeLeftMs(calc()), 1000);
    return () => clearInterval(t);
  };

  // load current state or preselected movies
  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const s = await getActiveVotingSession(id);
      const all = (await getMoviesWatchlist(id)) ?? [];

      if (s) {
        setSession(s);
        setTimeLeftMs(Math.max(0, new Date(s.ends_at).getTime() - Date.now()));
        const inSession = filterMoviesFor(all, s.movie_ids ?? []);
        setMovies(inSession);
        setFinished(await hasUserCompletedVoting(s.$id, s.movie_ids ?? []));
        await refreshScores(s.$id);
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
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to load voting.");
    } finally {
      setLoading(false);
    }
  }, [id, selected, filterMoviesFor, refreshScores]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      router.replace(`/watchlists/${id}`); // geht zurück zur Watchlist-Page
      return true; // verhindert Default-Verhalten
    });
    
    return () => backHandler.remove();
  }, [id]);

  // drive countdown from session.ends_at
  useEffect(() => {
    if (!session?.ends_at) return;
    const cleanup = startCountdown(session.ends_at);
    return cleanup;
  }, [session?.ends_at]);

  // live score polling during session
  useEffect(() => {
    if (!session) return;
    const i = setInterval(() => refreshScores(session.$id), 3000);
    return () => clearInterval(i);
  }, [session, refreshScores]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // when time runs out → close, compute winner & show results
  useEffect(() => {
    (async () => {
      if (!session) return;
      if (timeLeftMs < 0) return; // countdown not initialized yet
      const pastDeadline = Date.now() >= new Date(session.ends_at).getTime();
      if (timeLeftMs === 0 && pastDeadline) {
        try {
          await closeVotingSession(session.$id);
          const { winnerId, scores } = await getWinnerForSession(session.$id);
          setResultScores(scores);
          if (winnerId) {
            const card = await getWatchlistMovieCard(winnerId);
            setWinner({ id: winnerId, title: card?.title, poster_url: card?.poster_url });
          } else {
            setWinner({ id: undefined, title: "No votes cast" });
          }
        } catch {}
      }
    })();

 // watching ends_at avoids stale closure if session object changes
}, [timeLeftMs, session?.ends_at]);

  const onSwipe = async (index: number, dir: "left"|"right"|"top") => {
    if (!session || finished) return;
    const movie = movies[index];
    if (!movie) return;
    const value: VoteValue = dir === "right" ? like : dislike;
    try {
      await castVote(session.$id, String(movie.movie_id), value);
      await refreshScores(session.$id);

      const myVotes = await getUserVotesForSession(session.$id);
      if (new Set(myVotes.map(v => String(v.movie_id))).size >= (session.movie_ids ?? []).length) {
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
      const s = await createVotingSession(id, movies.map(m => String(m.movie_id)), { minutes: mins, allowSkip });
      setSession(s);
      setFinished(false);
      await refreshScores(s.$id);
      setTimeLeftMs(Math.max(0, new Date(s.ends_at).getTime() - Date.now()));
      startCountdown(s.ends_at);
    } catch (e: any) {
      setError(e?.message ?? "Could not start voting.");
    } finally {
      setLoading(false);
    }
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
      setTimeLeftMs(0);
      await load();
    } finally {
      setLoading(false);
    }
  };

  const Header = useMemo(() => (
    <View className="px-5 pt-20 mb-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg text-white font-bold">Voting</Text>
      </View>
    </View>
  ), []);

  const timeLeftText = useMemo(() => {
    const s = Math.ceil(timeLeftMs / 1000);
    const mm = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  }, [timeLeftMs]);

  // ---------- render states ----------
  if (loading) {
    return <View className="flex-1 bg-primary justify-center items-center">
      <ActivityIndicator color="#fff" size="large" />
    </View>;
  }

  if (error) {
    return <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full y-0" />
      {Header}
      <View className="px-5"><Text className="text-red-400">{error}</Text></View>
    </View>;
  }

  // no session & no selection
  if (!session && movies.length === 0) {
    return <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full y-0" />
      {Header}
      <View className="px-5">
        <Text className="text-white text-base">
          No active voting. Select movies in the watchlist first, then open this tab to configure and start a session.
        </Text>
      </View>
    </View>;
  }

  // pre-start config
  if (!session && movies.length > 0) {
    return (
      <KeyboardAvoidingView className="flex-1 bg-primary" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Image source={images.bg} className="absolute w-full y-0" />
        {Header}

        <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 40 }}>
          <Text className="text-white text-base mb-2">You selected {movies.length} movie(s) for the vote.</Text>

          <View className="bg-dark-100 rounded-2xl p-4 mt-3">
            <Text className="text-white font-semibold mb-2">Duration (minutes)</Text>
            <TextInput
              value={minutes}
              onChangeText={setMinutes}
              placeholder="15"
              keyboardType="number-pad"
              className="bg-dark-200 rounded-lg text-white px-3 py-2"
            />

            <TouchableOpacity onPress={() => setAllowSkip(s => !s)} className="mt-4 flex-row items-center justify-between bg-dark-200 rounded-lg px-3 py-3">
              <Text className="text-white">Allow skipping a card</Text>
              <View className={`w-5 h-5 rounded ${allowSkip ? "bg-accent" : "bg-light-200"}`} />
            </TouchableOpacity>

            <TouchableOpacity onPress={onStartVoting} className="mt-5 bg-accent rounded-xl py-3 items-center">
              <Text className="text-white font-semibold">Start voting</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-white font-semibold mt-6 mb-2">Preview</Text>
          <View className="flex-row flex-wrap gap-2">
            {movies.slice(0, 9).map(m => (
              <Image key={m.$id} source={{ uri: m.poster_url }} className="w-20 h-28 rounded-lg" resizeMode="cover" />
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // results (after time ran out) — winner + scores + cleanup
  if (session && timeLeftMs === 0) {
    return (
      <View className="flex-1 bg-primary">
        <Image source={images.bg} className="absolute w-full y-0" />
        {Header}

        <View className="px-5">
          <Text className="text-white text-xl font-bold mb-3">Results</Text>

          {winner?.poster_url ? (
            <Image source={{ uri: winner.poster_url }} className="w-full h-72 rounded-2xl mb-3" resizeMode="cover" />
          ) : null}
          <Text className="text-white text-lg font-semibold mb-3">
            {winner?.title ?? "No winner"}
          </Text>

          <View className="bg-dark-100 rounded-2xl p-3 mb-4">
            {movies.map(m => {
              const s = resultScores?.[String(m.movie_id)];
              return (
                <View key={m.$id} className="flex-row items-center justify-between py-1">
                  <Text className="text-white flex-1 pr-2" numberOfLines={1}>{m.title}</Text>
                  <Text className="text-white">
                    {s ? `+${s.likes} / -${s.dislikes} (${s.total})` : "0"}
                  </Text>
                </View>
              );
            })}
          </View>

          <TouchableOpacity onPress={onClearSession} className="bg-accent rounded-xl py-3 items-center">
            <Text className="text-white font-semibold">Clear session data</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // active session (swiping)
  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full y-0" />
      {Header}

      {finished ? (
        <View className="px-5">
          <Text className="text-white text-base mb-2">Thanks! You’ve voted.</Text>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white font-semibold">Time left</Text>
            <Text className="text-white font-bold">{timeLeftText}</Text>
          </View>
          <View className="bg-dark-100 rounded-2xl p-3">
            {movies.map(m => (
              <View key={m.$id} className="flex-row items-center justify-between py-1">
                <Text className="text-white flex-1 pr-2" numberOfLines={1}>{m.title}</Text>
                <Text className="text-white">{scores[String(m.movie_id)] ?? 0}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <>
          <View className="px-5 mb-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-white font-semibold">Time left</Text>
              <Text className="text-white font-bold">{timeLeftText}</Text>
            </View>
          </View>

          <View className="flex-1 px-5">
            <Swiper
              ref={swiperRef}
              cards={movies}
              backgroundColor="transparent"
              stackSize={3}
              cardIndex={0}
              animateCardOpacity
              onSwipedLeft={(i) => onSwipe(i, "left")}
              onSwipedRight={(i) => onSwipe(i, "right")}
              onSwipedTop={(i) => onSwipe(i, "top")}
              onSwipedAll={onSwipedAll}
              disableTopSwipe={!session?.allow_skip}
              overlayLabels={{
                left:  { title: "NOPE", style: { label: { color: "#ef4444", fontSize: 24, fontWeight: "700" } } },
                right: { title: "LIKE", style: { label: { color: "#10b981", fontSize: 24, fontWeight: "700" } } },
              }}
              renderCard={(m: WatchlistMovies | undefined) => {
                if (!m) return <View className="bg-dark-100 rounded-2xl flex-1" />;
                return (
                  <View className="bg-dark-100 rounded-2xl flex-1 overflow-hidden">
                    <Image source={{ uri: m.poster_url }} className="w-full h-full" resizeMode="cover" />
                    <View className="absolute bottom-0 left-0 right-0 p-3 bg-black/40">
                      <Text className="text-white font-bold text-lg">{m.title}</Text>
                    </View>
                  </View>
                );
              }}
            />

            <View className="flex-row justify-around mt-5">
              <TouchableOpacity onPress={() => swiperRef.current?.swipeLeft()} className="bg-red-600 px-6 py-3 rounded-full">
                <Text className="text-white font-semibold">Nope</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => session?.allow_skip && swiperRef.current?.swipeTop()}
                disabled={!session?.allow_skip}
                className={`px-6 py-3 rounded-full ${session?.allow_skip ? "bg-light-200" : "bg-light-200/40"}`}
              >
                <Text className="text-black font-semibold">Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => swiperRef.current?.swipeRight()} className="bg-emerald-500 px-6 py-3 rounded-full">
                <Text className="text-white font-semibold">Like</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="px-5 pb-8 mt-4">
            <Text className="text-white font-semibold mb-2">Current score</Text>
            <View className="bg-dark-100 rounded-2xl p-3">
              {movies.map(m => (
                <View key={m.$id} className="flex-row items-center justify-between py-1">
                  <Text className="text-white flex-1 pr-2" numberOfLines={1}>{m.title}</Text>
                  <Text className="text-white">{scores[String(m.movie_id)] ?? 0}</Text>
                </View>
              ))}
            </View>
          </View>
        </>
      )}
    </View>
  );
}
