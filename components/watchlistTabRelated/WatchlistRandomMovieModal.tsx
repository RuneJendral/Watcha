import { RandomMovieProps, WatchlistMovies } from '@/type';
import React, { useState } from 'react';
import { Alert, Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import CustomInput from '../CustomInput';

function getWeightedRandom<T>(items: T[]): T {
  const weights = items.map((_, index) => items.length - index); 
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

  const random = Math.random() * totalWeight;

  let cumulative = 0;
  for (let i = 0; i < items.length; i++) {
    cumulative += weights[i];
    if (random < cumulative) {
      return items[i];
    }
  }

  return items[items.length - 1]; // Fallback
}

const WatchlistRandomMovieModal = ({visible, onClose, movies,}: RandomMovieProps) => {
  
  const [minRating, setMinRating] = useState<string>('');
  const [maxYear, setMaxYear] = useState<string>('');
  const [randomMovie, setRandomMovie] = useState<WatchlistMovies | null>(null);
  const [prioritizeOld, setPrioritizeOld] = useState(false);

  const getRandomFilteredMovie = () => {
    if (!movies || movies.length === 0) {
      Alert.alert('no movies available');
      return;
    }

    const filtered = movies.filter((movie) => {
      const meetsRating = !minRating || (movie.vote_average ?? 0) >= parseFloat(minRating);
      const meetsYear = !maxYear || (movie.release_date && new Date(movie.release_date).getFullYear() <= parseInt(maxYear));

      return meetsRating && meetsYear;
    });

    if (filtered.length === 0) {
      Alert.alert("There are no movies with this filter");
      return;
    }

  const selected = prioritizeOld ? getWeightedRandom(filtered): filtered[Math.floor(Math.random() * filtered.length)];

    setRandomMovie(selected);
  };



  return (
<Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-center items-center px-4">
        <View className="bg-dark-100 rounded-2xl p-6 w-full max-w-[360px]">
          <Text className="label text-white font-bold mb-2">Random Movie</Text>
          <ScrollView contentContainerStyle={{ paddingBottom: 10 }} showsVerticalScrollIndicator={false}>
            
            <CustomInput 
              placeholder="e.g. 7.5"
              value={minRating} 
              onChangeText={setMinRating} 
              label="min. rating" 
            />

            <CustomInput 
              placeholder="e.g. 2018"
              value={maxYear} 
              onChangeText={setMaxYear} 
              label="max. year" 
            />

            <TouchableOpacity onPress={() => setPrioritizeOld(!prioritizeOld)} className="flex-row items-center mb-4 mt-4">
              <View className={`w-5 h-5 border-2 rounded mr-2 ${prioritizeOld ? 'bg-accent border-accent' : 'border-gray-400'}`} />
              <Text className="text-white">prefer longer-listed movies</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={getRandomFilteredMovie} className="bg-accent rounded-lg p-2 mb-4">
              <Text className="text-white text-center font-bold">show random movie</Text>
            </TouchableOpacity>

            {randomMovie && (
              <View className="items-center bg-light-100 p-4 rounded-xl">
                <Text className="text-black font-bold text-lg mb-2">{randomMovie.title}</Text>
                <Image
                  source={{ uri: randomMovie.poster_url }}
                  className="w-32 h-48 rounded-md mb-2"
                  resizeMode="cover"
                />
                <Text className="text-black text-sm">
                  Rating: {randomMovie.vote_average}/10
                </Text>
                <Text className="text-black text-sm">
                  Year: {randomMovie.release_date ? new Date(randomMovie.release_date).getFullYear() : 'Unknown'}
                </Text>
              </View>
            )}
          </ScrollView>

          <TouchableOpacity onPress={onClose} className="mt-5 bg-accent rounded-lg p-2">
            <Text className="text-white text-center font-semibold">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default WatchlistRandomMovieModal 