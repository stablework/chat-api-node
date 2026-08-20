const bcrypt = require('bcrypt');
const User = require("../../models/user");

const user = async () => {
  await bcrypt.hash('123456', 10).then(async(password) => {
    const data = {
      'name': 'Admin',
      'password': password,
      'role': 'admin',
      'status': 'active'
    };
    
    await User.findOneAndUpdate({'email': 'admin@admin.com'}, data, {
      upsert: true
    });
  });
}

module.exports = user;
