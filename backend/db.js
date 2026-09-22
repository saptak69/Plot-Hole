import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let isPostgres = false;
let pgPool = null;
let sqliteDb = null;
let usingFallback = false;

if (process.env.DATABASE_URL) {
  console.log('Connecting to PostgreSQL/Supabase...');
  pgPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 3000,
    idleTimeoutMillis: 30000,
    max: 20,
    keepAlive: true
  });
  isPostgres = true;
} else {
  console.log('Using SQLite local database (Demo Mode)...');
  const sqlite3 = (await import('sqlite3')).default;
  const dbPath = path.join(__dirname, 'local.db');
  sqliteDb = new sqlite3.Database(dbPath);
}

// Status check helper
export function getDbStatus() {
  return {
    isPostgres,
    usingFallback,
    connected: isPostgres ? !!pgPool : !!sqliteDb
  };
}

// Helper to run query (returns array of rows)
export async function query(sql, params = []) {
  if (isPostgres) {
    const result = await pgPool.query(sql, params);
    return result.rows;
  } else {
    return new Promise((resolve, reject) => {
      // Translate Postgres $1, $2 params to SQLite ?1, ?2 params
      const sqliteSql = sql.replace(/\$(\d+)/g, '?$1');
      sqliteDb.all(sqliteSql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }
}

// Helper to run a statement (INSERT/UPDATE/DELETE) and return info
export async function execute(sql, params = []) {
  if (isPostgres) {
    const result = await pgPool.query(sql, params);
    return { rowCount: result.rowCount, rows: result.rows };
  } else {
    return new Promise((resolve, reject) => {
      const sqliteSql = sql.replace(/\$(\d+)/g, '?$1');
      sqliteDb.run(sqliteSql, params, function (err) {
        if (err) reject(err);
        else resolve({ rowCount: this.changes, lastID: this.lastID });
      });
    });
  }
}

// Helper to get a single row
export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

// Initialize tables
export async function initDb() {
  const usersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      avatar_url TEXT,
      bio TEXT,
      display_name TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const reviewsTable = `
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      diary_id TEXT,
      user_id TEXT NOT NULL,
      tmdb_movie_id INTEGER NOT NULL,
      rating REAL NOT NULL,
      review_text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (diary_id) REFERENCES diary(id) ON DELETE CASCADE
    );
  `;

  const watchlistTable = `
    CREATE TABLE IF NOT EXISTS watchlist (
      user_id TEXT NOT NULL,
      tmdb_movie_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, tmdb_movie_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;

  const diaryTable = `
    CREATE TABLE IF NOT EXISTS diary (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      tmdb_movie_id INTEGER NOT NULL,
      media_type TEXT DEFAULT 'movie',
      rating REAL,
      watched_date TEXT NOT NULL,
      review_id TEXT,
      status TEXT DEFAULT 'watched',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE SET NULL
    );
  `;

  const followsTable = `
    CREATE TABLE IF NOT EXISTS follows (
      follower_id TEXT NOT NULL,
      following_id TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (follower_id, following_id),
      FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;

  const reviewLikesTable = `
    CREATE TABLE IF NOT EXISTS review_likes (
      user_id TEXT NOT NULL,
      review_id TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, review_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
    );
  `;

  const reviewCommentsTable = `
    CREATE TABLE IF NOT EXISTS review_comments (
      id TEXT PRIMARY KEY,
      review_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      comment_text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;

  const listsTable = `
    CREATE TABLE IF NOT EXISTS lists (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      is_private INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;

  const listItemsTable = `
    CREATE TABLE IF NOT EXISTS list_items (
      list_id TEXT NOT NULL,
      tmdb_movie_id INTEGER NOT NULL,
      media_type TEXT DEFAULT 'movie',
      title TEXT,
      poster_path TEXT,
      release_date TEXT,
      added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (list_id, tmdb_movie_id),
      FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
    );
  `;

  const listLikesTable = `
    CREATE TABLE IF NOT EXISTS list_likes (
      list_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (list_id, user_id),
      FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;

  const spacesPostsTable = `
    CREATE TABLE IF NOT EXISTS spaces_posts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'discussion',
      media_tag TEXT,
      tmdb_movie_id INTEGER,
      video_embed_id TEXT,
      rating REAL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;

  const spacesLikesTable = `
    CREATE TABLE IF NOT EXISTS spaces_likes (
      post_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (post_id, user_id),
      FOREIGN KEY (post_id) REFERENCES spaces_posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;

  const spacesCommentsTable = `
    CREATE TABLE IF NOT EXISTS spaces_comments (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      comment_text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES spaces_posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;

  const notificationsTable = `
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      link_url TEXT,
      is_read INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  if (isPostgres) {
    try {
      // Test PostgreSQL connection
      await pgPool.query('SELECT 1');
      
      await pgPool.query(usersTable);
      await pgPool.query(reviewsTable);
      await pgPool.query(watchlistTable);
      await pgPool.query(diaryTable);
      await pgPool.query(followsTable);
      await pgPool.query(reviewLikesTable);
      await pgPool.query(reviewCommentsTable);
      await pgPool.query(listsTable);
      await pgPool.query(listItemsTable);
      await pgPool.query(listLikesTable);
      await pgPool.query(spacesPostsTable);
      await pgPool.query(spacesLikesTable);
      await pgPool.query(spacesCommentsTable);
      await pgPool.query(notificationsTable);
      console.log('Database tables initialized successfully on PostgreSQL!');
    } catch (err) {
      if (process.env.NODE_ENV === 'production') {
        console.error('CRITICAL: PostgreSQL connection/initialization failed in PRODUCTION mode. Startup terminated.', err);
        process.exit(1);
      }
      console.error('PostgreSQL connection/initialization failed. Falling back to local SQLite database...', err);
      isPostgres = false;
      usingFallback = true;
      
      // Initialize SQLite fallback database
      const sqlite3 = (await import('sqlite3')).default;
      const dbPath = path.join(__dirname, 'local.db');
      sqliteDb = new sqlite3.Database(dbPath);
      
      await execute(usersTable);
      await execute(reviewsTable);
      await execute(watchlistTable);
      await execute(diaryTable);
      await execute(followsTable);
      await execute(reviewLikesTable);
      await execute(reviewCommentsTable);
      await execute(listsTable);
      await execute(listItemsTable);
      await execute(listLikesTable);
      await execute(spacesPostsTable);
      await execute(spacesLikesTable);
      await execute(spacesCommentsTable);
      await execute(notificationsTable);
      console.log('Database tables initialized successfully on SQLite fallback database!');
    }
  } else {
    // SQLite requires running statements sequentially
    await execute(usersTable);
    await execute(reviewsTable);
    await execute(watchlistTable);
    await execute(diaryTable);
    await execute(followsTable);
    await execute(reviewLikesTable);
    await execute(reviewCommentsTable);
    await execute(listsTable);
    await execute(listItemsTable);
    await execute(listLikesTable);
    await execute(spacesPostsTable);
    await execute(spacesLikesTable);
    await execute(spacesCommentsTable);
    await execute(notificationsTable);
    console.log('Database tables initialized successfully on SQLite database!');
  }

  // Safe migrations: Helper to run query safely
  const runMigration = async (sqlPostgres, sqlSqlite) => {
    try {
      if (isPostgres) {
        await pgPool.query(sqlPostgres);
      } else {
        await execute(sqlSqlite);
      }
    } catch (e) {
      // Column might already exist
    }
  };

  await runMigration('ALTER TABLE diary ADD COLUMN media_type TEXT DEFAULT \'movie\'', 'ALTER TABLE diary ADD COLUMN media_type TEXT DEFAULT \'movie\'');
  await runMigration('ALTER TABLE diary ADD COLUMN review_id TEXT', 'ALTER TABLE diary ADD COLUMN review_id TEXT');
  await runMigration('ALTER TABLE reviews ADD COLUMN diary_id TEXT', 'ALTER TABLE reviews ADD COLUMN diary_id TEXT');
  await runMigration('ALTER TABLE reviews ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP', 'ALTER TABLE reviews ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
  await runMigration('ALTER TABLE users ADD COLUMN display_name TEXT', 'ALTER TABLE users ADD COLUMN display_name TEXT');
  await runMigration('ALTER TABLE diary ADD COLUMN status TEXT DEFAULT \'watched\'', 'ALTER TABLE diary ADD COLUMN status TEXT DEFAULT \'watched\'');

  // Create database indexes for frequently queried fields
  const createIndexes = async () => {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);',
      'CREATE INDEX IF NOT EXISTS idx_reviews_movie_id ON reviews(tmdb_movie_id);',
      'CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);',
      'CREATE INDEX IF NOT EXISTS idx_diary_user_id ON diary(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_diary_movie_id ON diary(tmdb_movie_id);',
      'CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);',
      'CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);',
      'CREATE INDEX IF NOT EXISTS idx_review_comments_review_id ON review_comments(review_id);',
      'CREATE INDEX IF NOT EXISTS idx_lists_user_id ON lists(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_list_items_list_id ON list_items(list_id);',
      'CREATE INDEX IF NOT EXISTS idx_spaces_posts_user_id ON spaces_posts(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_spaces_posts_category ON spaces_posts(category);',
      'CREATE INDEX IF NOT EXISTS idx_spaces_likes_post_id ON spaces_likes(post_id);',
      'CREATE INDEX IF NOT EXISTS idx_spaces_comments_post_id ON spaces_comments(post_id);',
      'CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);'
    ];
    for (const sql of indexes) {
      try {
        if (isPostgres) {
          await pgPool.query(sql);
        } else {
          await execute(sql);
        }
      } catch (e) {
        // Index might already exist or error can be ignored
      }
    }
  };
  await createIndexes();

  // Seed initial community data if spaces_posts is empty
  const seedInitialSpacesAndNotifications = async () => {
    try {
      const existingPosts = await query('SELECT COUNT(*) as count FROM spaces_posts;');
      const count = parseInt(existingPosts[0]?.count || 0);
      if (count === 0) {
        // Find or create default community curator users
        let saptak = await queryOne("SELECT id FROM users WHERE username = 'saptak_cinephile'");
        if (!saptak) {
          const saptakId = 'usr_saptak_cinephile';
          const dummyHash = '$2a$10$X8O.N48YkQ2Pnm9g70hKieF4r6W5iF7k9M3jL2p1Qo.aB3cD4e5f6';
          await execute(
            "INSERT INTO users (id, username, email, password_hash, display_name, bio) VALUES ($1, $2, $3, $4, $5, $6)",
            [saptakId, 'saptak_cinephile', 'saptak@plothole.internal', dummyHash, 'Saptak Mondal', 'Founder & Film Archivist at PlotHole. 70mm and IMAX enthusiast.']
          );
          saptak = { id: saptakId };
        }

        let nolanPurist = await queryOne("SELECT id FROM users WHERE username = 'nolan_purist'");
        if (!nolanPurist) {
          const nolanId = 'usr_nolan_purist';
          const dummyHash = '$2a$10$X8O.N48YkQ2Pnm9g70hKieF4r6W5iF7k9M3jL2p1Qo.aB3cD4e5f6';
          await execute(
            "INSERT INTO users (id, username, email, password_hash, display_name, bio) VALUES ($1, $2, $3, $4, $5, $6)",
            [nolanId, 'nolan_purist', 'nolan@plothole.internal', dummyHash, 'Cinephile Odyssey', 'Analyzing deep sci-fi sound design and practical special effects.']
          );
          nolanPurist = { id: nolanId };
        }

        // Insert initial posts into database
        const posts = [
          {
            id: 'sp_dune2',
            user_id: saptak.id,
            category: 'trailer',
            title: 'Dune: Part Two Official IMAX Sequence — Visual Mastery by Greig Fraser',
            content: 'The theatrical scale is breathtaking. The worm-riding sequence and the Harkonnen arena in infrared black-and-white redefine modern sci-fi cinematography. Greig Fraser used ARRI Alexa LF cameras and custom vintage lenses.',
            media_tag: 'Dune: Part Two (2024)',
            tmdb_movie_id: 693134,
            video_embed_id: 'Way9Dexny3w',
            rating: 4.0
          },
          {
            id: 'sp_interstellar',
            user_id: nolanPurist.id,
            category: 'review',
            title: 'Interstellar at 12 Years: Why the Wormhole sequence remains unmatched',
            content: 'Rewatched in 4K HDR with lossless audio. The sound design silence when transitioning through the accretion disk is still the purest cinematic experience of the 21st century. 10/10 masterwork.',
            media_tag: 'Interstellar (2014)',
            tmdb_movie_id: 157336,
            video_embed_id: null,
            rating: 4.0
          },
          {
            id: 'sp_oppenheimer',
            user_id: saptak.id,
            category: 'trailer',
            title: 'Oppenheimer 70mm Trinity Sequence: The sound delay technique explained',
            content: 'Nolan intentionally created an eerie absolute silence following the Trinity blast before the physical shockwave tears through the bunker. Notice how the pressure wave sound was recorded.',
            media_tag: 'Oppenheimer (2023)',
            tmdb_movie_id: 872585,
            video_embed_id: 'uYPbbksJxIg',
            rating: 4.0
          },
          {
            id: 'sp_pulpfiction',
            user_id: nolanPurist.id,
            category: 'discussion',
            title: 'Unpopular Opinion: Pulp Fiction’s soundtrack is actually a character in itself',
            content: 'Every needle-drop dictates the pacing of the three non-linear timelines. Notice how Dick Dale’s surf rock immediately sets the adrenaline pace for Pumpkin and Honey Bunny.',
            media_tag: 'Pulp Fiction (1994)',
            tmdb_movie_id: 680,
            video_embed_id: null,
            rating: 4.0
          }
        ];

        for (const p of posts) {
          await execute(
            `INSERT INTO spaces_posts (id, user_id, category, title, content, media_tag, tmdb_movie_id, video_embed_id, rating)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [p.id, p.user_id, p.category, p.title, p.content, p.media_tag, p.tmdb_movie_id, p.video_embed_id, p.rating]
          );
        }

        // Seed initial comments
        await execute(
          `INSERT INTO spaces_comments (id, post_id, user_id, comment_text) VALUES 
           ('sc_1', 'sp_dune2', $1, 'The audio mix in IMAX during the spice harvester attack was earth-shaking.'),
           ('sc_2', 'sp_dune2', $2, 'Completely agree. Austin Butler as Feyd-Rautha stole the second half of the movie.'),
           ('sc_3', 'sp_interstellar', $1, 'Zimmer recorded the organ at Temple Church in London. That reverberation makes the whole score holy.')`,
          [nolanPurist.id, saptak.id]
        );

        // Seed initial likes
        await execute(
          `INSERT INTO spaces_likes (post_id, user_id) VALUES 
           ('sp_dune2', $1),
           ('sp_interstellar', $2),
           ('sp_oppenheimer', $1)`,
          [saptak.id, nolanPurist.id]
        );

        // Seed initial system notifications
        await execute(
          `INSERT INTO notifications (id, user_id, type, title, body, link_url, is_read) VALUES 
           ('notif_1', NULL, 'update', 'District Partner Perk', 'Use code PLOT100 for ₹100 OFF on 2 cinema tickets across PVR, INOX, and Cinepolis.', 'https://in.bookmyshow.com', 0),
           ('notif_2', NULL, 'activity', 'Release Radar Active', 'Track 24 upcoming theatrical releases with real showtimes in Release Radar.', '/schedule', 0),
           ('notif_3', NULL, 'activity', 'Dune: Part Two Perfection', 'Dune: Part Two achieved 94% Perfection on the PlotHole Sentiment Meter.', '/media/movie/693134', 1)`
        );

        console.log('✨ Seeded initial community Spaces posts, comments, likes, and notifications!');
      }
    } catch (seedErr) {
      console.error('Error seeding community data:', seedErr.message);
    }
  };
  await seedInitialSpacesAndNotifications();
}

export async function withTransaction(callback) {
  if (isPostgres) {
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      const txQuery = (sql, params = []) => client.query(sql, params).then(r => r.rows);
      const txExecute = (sql, params = []) => client.query(sql, params).then(r => ({ rowCount: r.rowCount, rows: r.rows }));
      const txQueryOne = (sql, params = []) => txQuery(sql, params).then(rows => rows[0] || null);
      
      const result = await callback({ query: txQuery, execute: txExecute, queryOne: txQueryOne });
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } else {
    try {
      await execute('BEGIN');
      const txQueryOne = (sql, params = []) => query(sql, params).then(rows => rows[0] || null);
      const result = await callback({ query, execute, queryOne: txQueryOne });
      await execute('COMMIT');
      return result;
    } catch (error) {
      try {
        await execute('ROLLBACK');
      } catch (rollbackErr) {
        // Ignore rollback failure if transaction already terminated
      }
      throw error;
    }
  }
}
