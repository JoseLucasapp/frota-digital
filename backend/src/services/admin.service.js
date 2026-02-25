const supabase = require('../config/supabase');
const { hashPassword } = require('../utils/hash');

const createAdminService = async (data) => {
    const password_hash = await hashPassword(data.password);
    data.password_hash = password_hash;
    delete data.password;
    const {error} = await supabase.from('admins').insert(data);
    if (error) {
        throw error;
    }
    return { success: true, message: 'Admin created successfully' };
}

module.exports = {
    createAdminService
}