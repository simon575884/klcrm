// Generate Password Hashes for Supabase
const bcrypt = require('bcryptjs');

const users = [
  { username: 'owner', password: 'admin123', role: 'owner' },
  { username: 'worker', password: 'worker123', role: 'worker' },
  { username: 'receptionist', password: 'reception123', role: 'receptionist' }
];

console.log('='.repeat(60));
console.log('GENERATING PASSWORD HASHES FOR SUPABASE');
console.log('='.repeat(60));
console.log('\nCopy these INSERT statements to your SQL file:\n');

users.forEach(user => {
  const hash = bcrypt.hashSync(user.password, 10);
  console.log(`-- ${user.role.toUpperCase()}: username=${user.username}, password=${user.password}`);
  console.log(`INSERT INTO users (username, password, role) VALUES ('${user.username}', '${hash}', '${user.role}') ON CONFLICT (username) DO NOTHING;`);
  console.log('');
});

console.log('='.repeat(60));
console.log('Copy the above INSERT statements and replace the default');
console.log('user inserts in supabase-setup.sql file');
console.log('='.repeat(60));
