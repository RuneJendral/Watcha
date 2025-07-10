import { Client, Databases, ID, Query } from "react-native-appwrite";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_MOVIE_ID = process.env.EXPO_PUBLIC_APPWRITE_METRICS_COLLECTION_ID!;

const client = new Client().setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!).setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);

export const updateSearchCount = async (query: string, movie: Movie) =>{

    if (!query || !movie?.id || !movie?.title) return;

    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_MOVIE_ID, [
        Query.equal('searchTerm', query)
        ])

        if(result.documents.length > 0){
            const existingMovie = result.documents[0];

            await database.updateDocument(
                DATABASE_ID,
                COLLECTION_MOVIE_ID,
                existingMovie.$id,
                {
                    count: existingMovie.count + 1
                }
            )
        } else {
            await database.createDocument(DATABASE_ID, COLLECTION_MOVIE_ID, ID.unique(), {
                searchTerm: query,
                movie_id: movie.id,
                count: 1,
                title: movie.title,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            })
        }
    } catch (error) {
        console.log(error);
        throw error;
    }

    
}

export const getTrendingMovies = async (): Promise<TrendingMovie[] | undefined> => {
    try{
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_MOVIE_ID, [
            Query.limit(5),
            Query.orderDesc('count'),
        ])

    return result.documents as unknown as TrendingMovie[];
    }   catch (error){
        console.log(error);
        return undefined;
    }
}

export const appwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    platform: "com.rj.watcha",
    databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
    userCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID
}