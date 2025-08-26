import { WatchlistMovieDoc } from "@/type";
import { Image, Text, View } from "react-native";

const MovieTile = ({ item }: { item: WatchlistMovieDoc }) => (
  <View className="rounded-xl overflow-hidden bg-dark-100">
    <Image source={{ uri: item.poster_url }} className="w-40 h-60" resizeMode="cover" />
    <Text className="text-white font-semibold mt-2 w-40" numberOfLines={2}>
      {item.title}
    </Text>
  </View>
);

export default MovieTile