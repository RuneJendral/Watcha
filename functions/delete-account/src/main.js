import { Client, Databases, Users, Query } from 'node-appwrite';

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;
const USER_COLLECTION_ID = process.env.APPWRITE_USER_COLLECTION_ID;
const WATCHLIST_COLLECTION_ID = process.env.APPWRITE_WATCHLIST_COLLECTION_ID;
const WATCHLIST_MEMBER_COLLECTION_ID = process.env.APPWRITE_WATCHLIST_MEMBERS_COLLECTION_ID;
const WATCHLIST_MOVIE_COLLECTION_ID = process.env.APPWRITE_WATCHLIST_MOVIES_COLLECTION_ID;
const WATCHLIST_VOTE_COLLECTION_ID = process.env.APPWRITE_WATCHLIST_VOTES_COLLECTION_ID;

// Triggered by an authenticated client via functions.createExecution().
// Appwrite injects the calling user's id and a per-execution API key into the
// request, so this can only ever delete the account that called it.
export default async ({ req, res, log, error }) => {
  const userId = req.headers['x-appwrite-user-id'];
  if (!userId) {
    return res.json({ ok: false, message: 'Not authenticated.' }, 401);
  }

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key']);

  const databases = new Databases(client);
  const users = new Users(client);

  try {
    // 1. delete their profile document
    const profiles = await databases.listDocuments(DATABASE_ID, USER_COLLECTION_ID, [
      Query.equal('accountId', userId),
    ]);
    for (const doc of profiles.documents) {
      await databases.deleteDocument(DATABASE_ID, USER_COLLECTION_ID, doc.$id);
    }

    // 2. leave every watchlist they belong to; tear down any watchlist left with no members
    const memberLinks = await databases.listDocuments(DATABASE_ID, WATCHLIST_MEMBER_COLLECTION_ID, [
      Query.contains('user_ids', userId),
      Query.limit(100),
    ]);

    for (const link of memberLinks.documents) {
      const remaining = (link.user_ids ?? []).filter((id) => id !== userId);

      if (remaining.length > 0) {
        const update = { user_ids: remaining };
        if (link.admin_id === userId) update.admin_id = remaining[0];
        await databases.updateDocument(DATABASE_ID, WATCHLIST_MEMBER_COLLECTION_ID, link.$id, update);
        continue;
      }

      // last member leaving: tear the whole watchlist down
      await databases.deleteDocument(DATABASE_ID, WATCHLIST_MEMBER_COLLECTION_ID, link.$id);

      const movies = await databases.listDocuments(DATABASE_ID, WATCHLIST_MOVIE_COLLECTION_ID, [
        Query.contains('watchlist_ids', link.watchlist_id),
        Query.limit(100),
      ]);
      for (const movie of movies.documents) {
        const updatedIds = (movie.watchlist_ids ?? []).filter((id) => id !== link.watchlist_id);
        if (updatedIds.length === 0) {
          await databases.deleteDocument(DATABASE_ID, WATCHLIST_MOVIE_COLLECTION_ID, movie.$id);
        } else {
          await databases.updateDocument(DATABASE_ID, WATCHLIST_MOVIE_COLLECTION_ID, movie.$id, {
            watchlist_ids: updatedIds,
          });
        }
      }

      try {
        await databases.deleteDocument(DATABASE_ID, WATCHLIST_COLLECTION_ID, link.watchlist_id);
      } catch (e) {
        log(`Watchlist ${link.watchlist_id} already gone: ${e.message}`);
      }
    }

    // 3. delete their votes
    const votes = await databases.listDocuments(DATABASE_ID, WATCHLIST_VOTE_COLLECTION_ID, [
      Query.equal('user_id', userId),
      Query.limit(100),
    ]);
    for (const vote of votes.documents) {
      await databases.deleteDocument(DATABASE_ID, WATCHLIST_VOTE_COLLECTION_ID, vote.$id);
    }

    // 4. delete the Appwrite account itself (also invalidates all of its sessions)
    await users.delete(userId);

    return res.json({ ok: true });
  } catch (e) {
    error(e.message);
    return res.json({ ok: false, message: e.message || 'Failed to delete account.' }, 500);
  }
};
