# BatchTrack local database

BatchTrack uses the browser's IndexedDB as its local database. The database name is `batchtrack_local_db` and its stores are:

- `retailers`
- `consumers`
- `machines`
- `inventory`
- `transactions`
- `sessions`

IndexedDB is persisted by the browser independently of the Python static server process. Restarting `localhost:8000`, closing the page, or restarting the application server does not recreate or clear these stores. Data remains available as long as the browser origin stays the same (`http://localhost:8000`) and the browser profile storage is not manually cleared.

`local-db.js` intentionally exposes table-level `read`, `put`, `remove`, and `find` methods. A future cloud repository can implement the same contract without changing the UI layer.

## Important deployment rule

Keep serving the app from the same origin and port during local development. Changing the scheme, host, or port creates a different browser storage origin and therefore a different IndexedDB database.

This is browser-local persistence. A shared multi-user server database requires a backend repository, such as SQLite or Postgres, and an API layer.
