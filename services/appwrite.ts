import { ChangeMailParams, ChangeNameParams, ChangePasswordParams, CreateUserParams, Movie, MovieDetails, SignInParams, TrendingMovie, Watchlist, WatchlistMovies } from '@/type';
import { Account, Avatars, Client, Databases, ID, Query } from "react-native-appwrite";

export const appwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
    platform:  process.env.EXPO_PUBLIC_APPWRITE_PLATFORM!,
    databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
    userCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID!,
    movieCollectionId: process.env.EXPO_PUBLIC_APPWRITE_METRICS_COLLECTION_ID!,
    watchlistCollectionId: process.env.EXPO_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!,
    watchlistMemberCollectionId: process.env.EXPO_PUBLIC_APPWRITE_WATCHLIST_MEMBERS_COLLECTION_ID!,
    watchlistMovieCollectionId: process.env.EXPO_PUBLIC_APPWRITE_WATCHLIST_MOVIES_COLLECTION_ID!
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

export const logOut = async () => {
    try {
        account.deleteSessions();
    } catch (e) {
        throw new Error(e as string);
    }
}

export const changeName = async ({name}: ChangeNameParams) => {
    try {
        const user = await account.get();

        await await account.updateName(name);

        const userDocs = await database.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        [Query.equal("accountId", user.$id)]
        );

        if (userDocs.total === 0) {
            throw new Error("User document not found in user collection.");
        }

        await database.updateDocument(
            appwriteConfig.databaseId, 
            appwriteConfig.userCollectionId, 
            userDocs.documents[0].$id,
            {name}
        )

    } catch (e) {
        throw new Error(e as string);
    }
}

export const changeMail = async ({email, password}: ChangeMailParams) => {
    try {
        const user = await account.get();

        await await account.updateEmail(email, password);

        const userDocs = await database.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        [Query.equal("accountId", user.$id)]
        );

        if (userDocs.total === 0) {
            throw new Error("User document not found in user collection.");
        }

        await database.updateDocument(
            appwriteConfig.databaseId, 
            appwriteConfig.userCollectionId, 
            userDocs.documents[0].$id,
            {email}
        )

    } catch (e) {
        throw new Error(e as string);
    }
}

export const changePassword = async ({newPassword, oldPassword}: ChangePasswordParams) => {
    try {
        await account.updatePassword(newPassword, oldPassword);
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

export const getUserWatchlists = async (): Promise<Watchlist[] | undefined> => {
    try{
        const currentAccount = await account.get();
        if(!currentAccount) throw Error;

        const memberLinks = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.watchlistMemberCollectionId,
            [Query.equal('user_ids', currentAccount.$id)]
        );

        const watchlistIds = memberLinks.documents.map(doc => doc.watchlist_id);

        const watchlists = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.watchlistCollectionId,
            [Query.equal('$id', watchlistIds)]
        );

    return watchlists.documents.map(doc => ({id: doc.$id,name: doc.name})) as Watchlist[];
    }   catch (error){
        console.log(error);
        return undefined;
    }
}

export const getMoviesWatchlist = async (watchlist_id: string): Promise<WatchlistMovies[] | undefined> => {
    try{
        const watchlistMovies = await database.listDocuments(
            appwriteConfig.databaseId, 
            appwriteConfig.watchlistMovieCollectionId, 
            [Query.equal('watchlist_ids', watchlist_id)]
        );

    return watchlistMovies.documents as unknown as WatchlistMovies[];
    }   catch (error){
        console.log(error);
        return undefined;
    }
}

export const createWatchlist = async (watchlistName: string) => {
    if (!watchlistName) return;

    try{
        const existingWatchlistMovies = await database.listDocuments(
            appwriteConfig.databaseId, 
            appwriteConfig.watchlistCollectionId, 
            [Query.equal('name', watchlistName)]
        );

        if(existingWatchlistMovies.total > 0){
            throw new Error(`watchlist with the name ${watchlistName} already exist`);
        } else {
            const newWatchlist = await database.createDocument(
                appwriteConfig.databaseId, 
                appwriteConfig.watchlistCollectionId, 
                ID.unique(), 
                {name: watchlistName}
            );

            const currentAccount = await account.get();
            if(!currentAccount) throw Error;

            addUserToWatchlist(newWatchlist.$id, currentAccount.$id);
        }

    }   catch (error){
        console.log(error);
        throw error;
    }
}

export const deleteWatchlist = async (watchlistId: string) => {
    try{
        const existingWatchlist = await database.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.watchlistCollectionId,
            watchlistId
        );

        if(existingWatchlist){

            //DELETE MEMBER COLLECTION
            const existingWatchlistUserCollection = await database.listDocuments(
                appwriteConfig.databaseId, 
                appwriteConfig.watchlistMemberCollectionId, 
                [Query.equal('watchlist_id', watchlistId)]
            );

            for (const memberDoc of existingWatchlistUserCollection.documents) {
                await database.deleteDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.watchlistMemberCollectionId,
                    memberDoc.$id
                );
            }     

            //DELETE/UPDATE MOVIE COLLECTION
            const movieCollection = await database.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.watchlistMovieCollectionId,
                [Query.equal('watchlist_ids', watchlistId)]
            );

            for (const movie of movieCollection.documents) {
                const updatedIds = (movie.watchlist_ids ?? []).filter((id: string) => id !== watchlistId);

                if (updatedIds.length === 0){
                    await database.deleteDocument(
                        appwriteConfig.databaseId,
                        appwriteConfig.watchlistMovieCollectionId,
                        movie.$id
                    );
                } else {
                    await database.updateDocument(
                        appwriteConfig.databaseId,
                        appwriteConfig.watchlistMovieCollectionId,
                        movie.$id,
                        { watchlist_ids: updatedIds}
                    );
                }
            }


            //DELETE WATCHLIST
            await database.deleteDocument(
                appwriteConfig.databaseId,
                appwriteConfig.watchlistCollectionId,
                watchlistId
            );

            console.log("watchlist deleted")

        } else {
           console.log("watchlist could not be found");
        }
    }
    catch (error){
        console.log(error);
        throw error;
    }
}

export const addUserToWatchlist = async (watchlistId: string, userId: string) => {
    try {
        const currentWatchlist = await database.listDocuments(appwriteConfig.databaseId, appwriteConfig.watchlistMemberCollectionId,[Query.equal('watchlist_id', watchlistId)]);

        if(currentWatchlist.total > 0){

            const doc = currentWatchlist.documents[0];

            const existingUsers: string[] = doc.user_ids ?? [];

            if(!existingUsers.includes(userId)){

                const updatedUserList = [...existingUsers, userId];

                await database.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                doc.$id,
                {
                    user_ids: updatedUserList
                }
            );} else{
                console.log("User already exist in selected Watchlist");
            }
        }else {
            await database.createDocument(
                appwriteConfig.databaseId, 
                appwriteConfig.watchlistMemberCollectionId, 
                ID.unique(), 
                {
                    watchlist_id: watchlistId,
                    user_ids: [userId]
                }
            );
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const removeUserFromWatchlist = async (watchlistId: string, userId: string) => {
    try {
        const currentWatchlist = await database.listDocuments(appwriteConfig.databaseId, appwriteConfig.watchlistMemberCollectionId,[Query.equal('watchlist_id', watchlistId)]);

        if(currentWatchlist.total > 0){

            const doc = currentWatchlist.documents[0];

            const existingUsers: string[] = doc.user_ids ?? [];

            if(existingUsers.includes(userId)){

                const updatedUserList = existingUsers.filter(id => id !== userId);

                await database.updateDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.userCollectionId,
                    doc.$id,
                    {
                        user_ids: updatedUserList
                    }
                );} 
            else{
                console.log("user could not be found in selected Watchlist");
            }
        }else {
           console.log("watchlist could not be found in watchlist member collection");
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const addMovieToWatchlist = async (watchlistId: string, movieId: string, movie: MovieDetails) =>{
    try {
        const existing = await database.listDocuments(appwriteConfig.databaseId, appwriteConfig.watchlistMovieCollectionId,[Query.equal('movie_id', movieId)]);

        if(existing.total > 0){

            const doc = existing.documents[0];

            const currentWatchlists: string[] = doc.watchlist_ids ?? [];

            if(!currentWatchlists.includes(watchlistId)){

                const updatedWatchlists = [...currentWatchlists, watchlistId];

                await database.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.watchlistMovieCollectionId,
                doc.$id,
                {
                    watchlist_ids: updatedWatchlists
                }
            );} else{
                console.log("Movie already exist in selected Watchlist");
            }
        }else {
            await database.createDocument(
                appwriteConfig.databaseId, 
                appwriteConfig.watchlistMovieCollectionId, 
                ID.unique(), {
                    movie_id: movieId,
                    watchlist_ids: [watchlistId],
                    title: movie.title,
                    poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                    createdAt: new Date().toISOString()
                }
            );
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const removeMovieFromWatchlist = async (watchlistId: string, movieId: string) =>{
    try {
        const existing = await database.listDocuments(appwriteConfig.databaseId, appwriteConfig.watchlistMovieCollectionId,[Query.equal('movie_id', movieId)]);

        if(existing.total > 0){

            const doc = existing.documents[0];

            const currentWatchlists: string[] = doc.watchlist_ids ?? [];

            if(currentWatchlists.includes(watchlistId)){

                const updatedWatchlists = currentWatchlists.filter(id => id !== watchlistId);

                 if (updatedWatchlists.length > 0) {
                    await database.updateDocument(
                        appwriteConfig.databaseId,
                        appwriteConfig.watchlistMovieCollectionId,
                        doc.$id,
                        {
                            watchlist_ids: updatedWatchlists
                        }
                    );
                } else {
                    await database.deleteDocument(
                        appwriteConfig.databaseId,
                        appwriteConfig.watchlistMovieCollectionId,
                        doc.$id
                    );
                }
               
                } else{
                    console.log("watchlist Id caonnot be found in current watchlist");
                }
            }else {
             console.log("Movie cannot be found");
            }
    } catch (error) {
        console.log(error);
        throw error;
    }
}