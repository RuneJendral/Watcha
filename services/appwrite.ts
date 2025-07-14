import { CreateUserParams, SignInParams } from '@/type';
import { Account, Avatars, Client, Databases, ID, Query } from "react-native-appwrite";

export const appwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
    platform:  process.env.EXPO_PUBLIC_APPWRITE_PLATFORM!,
    databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
    userCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID!,
    movieCollectionId: process.env.EXPO_PUBLIC_APPWRITE_METRICS_COLLECTION_ID!
}

export const client = new Client().setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!).setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!).setPlatform(appwriteConfig.platform);
export const account = new Account(client);
export const database = new Databases(client);
const avatars = new Avatars(client);

export const createUser = async ({email, password, name}: CreateUserParams) => {
    try{
        const newAccount = await account.create(ID.unique(), email, password, name);
        if(!newAccount) throw Error;

        await signIn({email, password});

        const avatarUrl = avatars.getInitialsURL(name);

        return await database.createDocument(
            appwriteConfig.databaseId, 
            appwriteConfig.userCollectionId, 
            ID.unique(),
            {email, name, accountId: newAccount.$id, avatar: avatarUrl}
        )
        
    } catch(e) {
        throw new Error(e as string);
    }
}

export const signIn = async ({email, password}: SignInParams) => {
    try {
        const session = await account.createEmailPasswordSession(email, password);
    } catch (e) {
        throw new Error(e as string);
    }
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();
        if(!currentAccount) throw Error;

        const currentUser = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )

        if(!currentUser) throw Error;

        return currentUser.documents[0];
    } catch (e) {
        console.log(e);
        throw new Error(e as string);
    }
}

export const updateSearchCount = async (query: string, movie: Movie) =>{

    if (!query || !movie?.id || !movie?.title) return;

    try {
        const result = await database.listDocuments(appwriteConfig.databaseId, appwriteConfig.movieCollectionId, [
        Query.equal('searchTerm', query)
        ])

        if(result.documents.length > 0){
            const existingMovie = result.documents[0];

            await database.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.movieCollectionId,
                existingMovie.$id,
                {
                    count: existingMovie.count + 1
                }
            )
        } else {
            await database.createDocument(appwriteConfig.databaseId, appwriteConfig.movieCollectionId, ID.unique(), {
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
        const result = await database.listDocuments(appwriteConfig.databaseId, appwriteConfig.movieCollectionId, [
            Query.limit(5),
            Query.orderDesc('count'),
        ])

    return result.documents as unknown as TrendingMovie[];
    }   catch (error){
        console.log(error);
        return undefined;
    }
}