// Users data stored in JS file
// In a real application, this would be stored securely on a server
// For this demo, we're using a simple JS file

export const users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@streamflix.com',
    password: 'admin123', // In production, this should be hashed
    name: 'Admin User',
    role: 'admin'
  },
  {
    id: 2,
    username: 'user1',
    email: 'user1@streamflix.com',
    password: 'user123',
    name: 'John Doe',
    role: 'user'
  },
  {
    id: 3,
    username: 'demo',
    email: 'demo@streamflix.com',
    password: 'demo123',
    name: 'Demo User',
    role: 'user'
  }
];

// Function to find user by credentials
export const findUser = (username, password) => {
  return users.find(
    user => (user.username === username || user.email === username) && user.password === password
  );
};

// Function to find user by username/email
export const findUserByUsername = (username) => {
  return users.find(user => user.username === username || user.email === username);
};

// Function to add new user (for registration)
export const addUser = (userData) => {
  const newUser = {
    id: users.length + 1,
    ...userData,
    role: 'user'
  };
  users.push(newUser);
  return newUser;
};

