import { ChangeMailParams, ChangeNameParams, ChangePasswordParams, CreateUserFakeMailParams, CreateUserParams, CreateWatchlistResult, Movie, MovieDetails, SignInFakeMailParams, SignInParams, TrendingMovie, VoteDoc, VoteValue, VotingSessionDoc, Watchlist, WatchlistMember, WatchlistMovies } from '@/type';
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
    watchlistMovieCollectionId: process.env.EXPO_PUBLIC_APPWRITE_WATCHLIST_MOVIES_COLLECTION_ID!,
    watchlistVotingSessionCollectionId: process.env.EXPO_PUBLIC_APPWRITE_WATCHLIST_VOTING_SESSION_COLLECTION_ID!,
    watchlistVoteCollectionId: process.env.EXPO_PUBLIC_APPWRITE_WATCHLIST_VOTES_COLLECTION_ID!
}

export const client = new Client().setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!).setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!).setPlatform(appwriteConfig.platform);
export const account = new Account(client);
export const database = new Databases(client);
export const avatars = new Avatars(client);
const maximumWatchlistCreations  = 3;
const nowIso = () => new Date().toISOString();

export function slugifyUsername(raw: string) {
    return raw
        .normalize("NFKD")               
        .replace(/[\u0300-\u036f]/g, "") 
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9._-]+/g, "-") 
        .replace(/^-+|-+$/g, "")         
        .slice(0, 32);                   
}

export function createFakeEmail(usernameSlug: string, suffix?: string) {
    const tag = suffix ?? Math.random().toString(36).slice(2, 8); 
    return `${usernameSlug}+${tag}@example.com`; 
}

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

export const createUserWithFakeMail = async ({password, name}: CreateUserFakeMailParams) => {
    try{
        const usernameSlug = slugifyUsername(name);
        if (!usernameSlug) throw Error;

        const existing = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("name", usernameSlug)]
        );
        if (existing.total > 0) {
            throw Error;
        }

        const fakeEmail = createFakeEmail(usernameSlug);

        const newAccount = await account.create(ID.unique(), fakeEmail, password, name);
        if(!newAccount) throw Error;

        await signIn({email:fakeEmail, password});

        const avatarUrl = avatars.getInitialsURL(name);

        return await database.createDocument(
            appwriteConfig.databaseId, 
            appwriteConfig.userCollectionId, 
            ID.unique(),
            {email:fakeEmail, name:usernameSlug, accountId: newAccount.$id, avatar: avatarUrl}
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

export const signInWithFakeMail = async ({name, password}: SignInFakeMailParams) => {
    try {
        const usernameSlug = slugifyUsername(name);

        const users = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("name", usernameSlug)]
        );
        if (users.total === 0) {
            throw new Error("User not found.");
        }

        const userDoc = users.documents[0];
        const fakeEmail = userDoc.email as string;
        if (!fakeEmail) throw new Error("Account mapping incomplete.");

        await account.createEmailPasswordSession(fakeEmail, password);
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

        const usernameSlug = slugifyUsername(name);

        const userDocs = await database.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        [Query.equal("accountId", user.$id)]
        );

        if (userDocs.total === 0) {
            throw new Error("User document not found in user collection.");
        }

        const existing = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("name", usernameSlug)]
        );
        if (existing.total > 0) {
            throw new Error("User with username already exists");
        }

        await database.updateDocument(
            appwriteConfig.databaseId, 
            appwriteConfig.userCollectionId, 
            userDocs.documents[0].$id,
            {name}
        )

        await account.updateName(name);

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

export const adminCheck = async (watchlistId: string): Promise<boolean> => {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) throw new Error("No user");

    const result = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.watchlistMemberCollectionId,
      [
        Query.equal("watchlist_id", watchlistId),
        Query.equal("admin_id", currentAccount.$id),
      ]
    );

    return result.total > 0;
  } catch (error) {
    console.error("adminCheck failed", error);
    return false;
  }
};

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

export const getWatchlistName = async (watchlist_id: string): Promise<string | undefined> => {
    try{

        const watchlist = await database.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.watchlistCollectionId,
            watchlist_id
        );

    return watchlist.name;
    }   catch (error){
        console.log(error);
        return undefined;
    }
}

export const getWatchlistMembers = async (watchlist_id: string): Promise<WatchlistMember[]> => {

    const watchlistMembers = await database.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.watchlistMemberCollectionId,
        [Query.equal("watchlist_id", watchlist_id)]
    );

    const allUserIds = watchlistMembers.documents.flatMap((doc: any) => doc.user_ids ?? []);
    const uniqueUserIds = Array.from(new Set(allUserIds));

    if (uniqueUserIds.length === 0) return [];

    let userDocs: any[] = [];

    try {        
        const res = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("accountId", uniqueUserIds)]
        );

        userDocs = res.documents;

    } catch {
        userDocs = (
            await Promise.all(
                uniqueUserIds.map(async (uid) => {
                    const r = await database.listDocuments(
                        appwriteConfig.databaseId,
                        appwriteConfig.userCollectionId,
                        [Query.equal("accountId", uid)]
                    );
                    return r.documents[0];
                })
            )
        ).filter(Boolean);
    }

    const byAccountId = new Map<string, any>(
        userDocs.map((doc: any) => [doc.accountId, doc])
    );

    const detailedMembers: WatchlistMember[] = uniqueUserIds.map((uid) => {
        const doc = byAccountId.get(uid);
        return {
            id: uid,
            name: doc?.name ?? "unknown user",
            avatar: doc?.avatar ?? undefined,
        };
    });

    return detailedMembers;
};

const toResultError = (err: unknown, fallback = "Something went wrong"): CreateWatchlistResult => {
    if (typeof err === "object" && err !== null) {
        const anyErr = err as any;
        const msg = (anyErr?.message as string) || fallback;
        const code = (anyErr?.code as string) || (anyErr?.type as string) || "UNKNOWN";
        return { ok: false, code, message: msg };
    }
    return { ok: false, code: "UNKNOWN", message: fallback };
};

export const createWatchlist = async (watchlistName: string): Promise <CreateWatchlistResult> => {
    try{

        const currentAccount = await account.get();

        const users = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("accountId", currentAccount.$id)]
        );

        if (users.total === 0) {
            return { ok: false, code: "USER_NOT_FOUND", message: "User document not found." };
        }

        const userDoc = users.documents[0];
        const currentWatchlistCount = Number(userDoc.created_watchlist_count ?? 0);

        if (currentWatchlistCount >= maximumWatchlistCreations) {
            return { ok: false, code: "LIMIT_REACHED", message: `You’ve reached the limit of ${maximumWatchlistCreations} watchlists.` };
        }

        const existingWatchlistMovies = await database.listDocuments(
            appwriteConfig.databaseId, 
            appwriteConfig.watchlistCollectionId, 
            [Query.equal('name', watchlistName)]
        );

        if(existingWatchlistMovies.total > 0){
            return { ok: false, code: "DUPLICATE", message: `A watchlist named “${watchlistName}” already exists.`, field: "watchlistName" };
        } 
        
        
        const newWatchlist = await database.createDocument(
            appwriteConfig.databaseId, 
            appwriteConfig.watchlistCollectionId, 
            ID.unique(), 
            {name: watchlistName}
        );

        await addUserToWatchlist(newWatchlist.$id, currentAccount.$id, true);

        await database.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            userDoc.$id,
            {
                created_watchlist_count: userDoc.created_watchlist_count + 1,
            }
        );

        return { ok: true, message: `Created “${watchlistName}”`, watchlistId: newWatchlist.$id, name: watchlistName};

    } catch (error){
        return toResultError(error, "Could not create watchlist.");
    }
}

export const deleteWatchlist = async (watchlistId: string) => {
    try{
        const currentAccount = await account.get();
        if (!currentAccount) throw new Error("No user");

        const response = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("accountId", currentAccount.$id)]
        );

        if (response.total === 0) {
            throw new Error("User document not found");
        }

        const userDoc = response.documents[0];

        const isAdmin = await adminCheck(watchlistId);

        //CHECK IF USER IS ADMIN
        if(isAdmin){
            //CHECK IF WATCHLIST EXISTS
            await database.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.watchlistCollectionId,
                watchlistId
            );

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

            await database.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                userDoc.$id,
                {
                    created_watchlist_count: Math.max(0, userDoc.created_watchlist_count - 1),
                }
            );

            console.log("watchlist deleted")
        } else {
            await removeUserFromWatchlist(watchlistId, currentAccount.$id);
        }
    }
    catch (error){
        console.log(error);
        throw error;
    }
}

export const addUserToWatchlistWithMail = async (watchlistId: string, userMail: string, addAdmin: boolean): Promise<boolean | undefined> => {
    try {
        const requestedUser = await database.listDocuments(appwriteConfig.databaseId, appwriteConfig.userCollectionId, [Query.equal("email", userMail)]);

        const userDoc = requestedUser.documents[0];

        if (!userDoc) {
            console.log("User not found with given email");
            return false;
        }

        return addUserToWatchlist(watchlistId, userDoc?.accountId ?? "unknown user", addAdmin);;

    } catch (error){
        console.log(error);
        throw error;
    }
}


export const addUserToWatchlistWithUserName = async (watchlistId: string, userName: string, addAdmin: boolean): Promise<boolean | undefined> => {
    try {
        const usernameSlug = slugifyUsername(userName);

        const requestedUser = await database.listDocuments(appwriteConfig.databaseId, appwriteConfig.userCollectionId, [Query.equal("name", usernameSlug)]);

        const userDoc = requestedUser.documents[0];

        if (!userDoc) {
            console.log("User not found with given username");
            return false;
        }

        return addUserToWatchlist(watchlistId, userDoc?.accountId ?? "unknown user", addAdmin);;

    } catch (error){
        console.log(error);
        throw error;
    }
}

export const addUserToWatchlist = async (watchlistId: string, userId: string, addAdmin: boolean): Promise<boolean | undefined>  => {
    try {
        const currentWatchlist = await database.listDocuments(appwriteConfig.databaseId, appwriteConfig.watchlistMemberCollectionId,[Query.equal('watchlist_id', watchlistId)]);
        const payload: any = {
            watchlist_id: watchlistId,
            user_ids: [userId],
        };

        if (addAdmin) {
            payload.admin_id = userId;
        }

        if(currentWatchlist.total > 0){

            const doc = currentWatchlist.documents[0];

            const existingUsers: string[] = doc.user_ids ?? [];

            if(!existingUsers.includes(userId)){

                const updatedUserList = [...existingUsers, userId];

                await database.updateDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.watchlistMemberCollectionId,
                    doc.$id,
                    {
                        user_ids: updatedUserList
                    }
                );

                return true;
            } else{              
                console.log("User already exist in selected Watchlist");
                return false;
            }
        }else {
            await database.createDocument(
                appwriteConfig.databaseId, 
                appwriteConfig.watchlistMemberCollectionId, 
                ID.unique(), 
                payload
            );

            return true;
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
                    appwriteConfig.watchlistMemberCollectionId,
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

export const addMovieToWatchlist = async (watchlistId: string, movieId: string, movie: MovieDetails): Promise<boolean | undefined>  =>{
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

            );

            return true;
        
        } else{
                console.log("Movie already exist in selected Watchlist");
                return false;
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
                    createdAt: new Date().toISOString(),
                    vote_average: movie.vote_average,
                    release_date: movie.release_date
                }
            );

            return true;
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

export async function createVotingSession(
  watchlistId: string,
  movieIds: string[],
  opts: { minutes: number; allowSkip: boolean }
): Promise<VotingSessionDoc> {
  const end = new Date(Date.now() + Math.max(1, opts.minutes) * 60_000).toISOString();

  const doc = await database.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.watchlistVotingSessionCollectionId,
    ID.unique(),
    {
      watchlist_id: watchlistId,   // string
      status: "active",            // enum: active | closed | draft
      movie_ids: movieIds,         // string[]
      ends_at: end,                // ISO string
      allow_skip: !!opts.allowSkip // boolean
    }
  );
  return doc as unknown as VotingSessionDoc;
}

export async function getActiveVotingSession(watchlistId: string) {
  const res = await database.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.watchlistVotingSessionCollectionId,
    [Query.equal("watchlist_id", watchlistId), Query.equal("status", "active")]
  );
  const s = res.documents[0] as unknown as VotingSessionDoc | undefined;
  if (s && new Date(s.ends_at).getTime() <= Date.now()) {
    await closeVotingSession(s.$id);
    return undefined;
  }
  return s;
}

export async function closeVotingSession(sessionId: string) {
  return database.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.watchlistVotingSessionCollectionId,
    sessionId,
    { status: "closed" }
  );
}

export async function castVote(sessionId: string, movieId: string, value: VoteValue) {
  const me = await account.get();

  // idempotent: one vote per (user, movie) -> update
  const existing = await database.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.watchlistVoteCollectionId,
    [Query.equal("session_id", sessionId), Query.equal("user_id", me.$id), Query.equal("movie_id", movieId)]
  );

  if (existing.total > 0) {
    return database.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.watchlistVoteCollectionId,
      existing.documents[0].$id,
      { value }
    );
  }

  return database.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.watchlistVoteCollectionId,
    ID.unique(),
    { session_id: sessionId, user_id: me.$id, movie_id: movieId, value }
  );
}

export async function tallyVotes(sessionId: string) {
  const res = await database.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.watchlistVoteCollectionId,
    [Query.equal("session_id", sessionId), Query.limit(1000)]
  );
  const scores: Record<string, number> = {};
  for (const d of res.documents as unknown as VoteDoc[]) {
    const delta = d.value === "like" ? 1 : -1;
    scores[d.movie_id] = (scores[d.movie_id] ?? 0) + delta;
  }
  return scores;
}

export async function getUserVotesForSession(sessionId: string) {
  const me = await account.get();
  const res = await database.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.watchlistVoteCollectionId,
    [Query.equal("session_id", sessionId), Query.equal("user_id", me.$id), Query.limit(1000)]
  );
  return res.documents as unknown as VoteDoc[];
}

export async function hasUserCompletedVoting(sessionId: string, movieIds: string[]) {
  const myVotes = await getUserVotesForSession(sessionId);
  const voted = new Set(myVotes.map(v => String(v.movie_id)));
  const total = new Set((movieIds ?? []).map(String));
  return total.size > 0 && voted.size >= total.size;
}

export async function aggregateVotes(sessionId: string) {
  const res = await database.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.watchlistVoteCollectionId,
    [Query.equal("session_id", sessionId), Query.limit(10000)]
  );
  const scores: Record<string,{likes:number;dislikes:number;total:number}> = {};
  for (const v of res.documents as unknown as VoteDoc[]) {
    const k = String(v.movie_id);
    if (!scores[k]) scores[k] = { likes: 0, dislikes: 0, total: 0 };
    if (v.value === "like") scores[k].likes += 1;
    else scores[k].dislikes += 1;
    scores[k].total += 1;
  }
  return scores;
}

export async function getWinnerForSession(sessionId: string) {
  const scores = await aggregateVotes(sessionId);
  const entries = Object.entries(scores);
  if (entries.length === 0) return { winnerId: undefined, scores };
  entries.sort((a, b) => {
    const [,A] = a; const [,B] = b;
    const netA = A.likes - A.dislikes;
    const netB = B.likes - B.dislikes;
    if (netB !== netA) return netB - netA;
    if (B.likes !== A.likes) return B.likes - A.likes;
    return B.total - A.total;
  });
  return { winnerId: entries[0][0], scores };
}

export async function getWatchlistMovieCard(movieId: string) {
  const res = await database.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.watchlistMovieCollectionId,
    [Query.equal("movie_id", movieId), Query.limit(1)]
  );
  const doc = res.documents[0] as any;
  if (!doc) return undefined;
  return { title: doc.title as string, poster_url: doc.poster_url as string | undefined };
}

export async function deleteVotingSessionCascade(sessionId: string) {
  const votes = await database.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.watchlistVoteCollectionId,
    [Query.equal("session_id", sessionId), Query.limit(10000)]
  );
  for (const v of votes.documents) {
    await database.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.watchlistVoteCollectionId,
      v.$id
    );
  }
  await database.deleteDocument(
    appwriteConfig.databaseId,
    appwriteConfig.watchlistVotingSessionCollectionId,
    sessionId
  );
}