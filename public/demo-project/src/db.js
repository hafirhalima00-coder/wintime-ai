// db.js ÔÇö stub database module
// NOTE: No tests exist for any function in this file

let connection = null;

// connect ÔÇö called at startup with the DATABASE_URL env var
// BUG: if url is undefined (env var missing), this silently sets connection to null
// and ping() will return false with no warning
function connect(url) {
  if (url) {
    // simulate a connection object
    connection = { url, connected: true };
    console.log('DB connected to', url);
  }
}

function ping() {
  return connection !== null && connection.connected === true;
}

// getUser ÔÇö fetches a user record by id
// Zero test coverage: no test file references this function
// BUG: does not validate that id is defined or numeric before lookup
function getUser(id) {
  const users = {
    1: { id: 1, name: 'Alice', role: 'admin' },
    2: { id: 2, name: 'Bob', role: 'user' },
  };
  return users[id];
}

// getAllTasks ÔÇö returns all pending tasks
// Zero test coverage
async function getAllTasks() {
  // HACK: returns hardcoded data ÔÇö real implementation pending
  return [
    { id: 1, title: 'Fix auth bug', status: 'pending' },
    { id: 2, title: 'Write tests', status: 'pending' },
  ];
}

module.exports = { connect, ping, getUser, getAllTasks };
