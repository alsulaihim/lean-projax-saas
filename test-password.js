const bcrypt = require('bcryptjs');

async function testPassword() {
  const password = 'password123';
  const hash = await bcrypt.hash(password, 10);

  console.log('Testing password:', password);
  console.log('Generated new hash:', hash);

  // Test comparison with new hash
  const isValid = await bcrypt.compare(password, hash);
  console.log('Password valid with new hash:', isValid);

  // Test with actual hash from database
  const dbHash = '$2b$10$Vr0Ct8osujQlZyc6ZQGb2OdNxO.pc6ZWhaXZktTF.Hvi0hFbCtoH6';
  console.log('\nNow testing with hash from DB:', dbHash);

  const isValidWithDbHash = await bcrypt.compare(password, dbHash);
  console.log('Password valid with DB hash:', isValidWithDbHash);
}

testPassword();