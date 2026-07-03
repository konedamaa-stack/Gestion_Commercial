const bcrypt = require('bcryptjs');

async function test() {
  const hash = '$2b$10$bNOFQqwpUSfi5csYUDPSDOglYS5CGxaNgxTFTdeD5/g1HF2KB6OYy';
  const password = 'superadmin';
  const isValid = await bcrypt.compare(password, hash);
  console.log("Is valid:", isValid);
}
test();
