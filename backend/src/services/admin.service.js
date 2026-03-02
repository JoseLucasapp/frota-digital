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

const getAllAdminsService = async ({
  email,
  name,
  cnpj,
  institution,
  page = 1,
  pageSize = 10,
}) => {
  page = Math.max(parseInt(page, 10) || 1, 1);
  pageSize = Math.min(Math.max(parseInt(pageSize, 10) || 10, 1), 100);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from("admins").select("*", { count: "exact" });

  if (email) query = query.eq("email", email);
  if (name) query = query.ilike("name", `%${name}%`);
  if (cnpj) query = query.eq("cnpj", cnpj);
  if (institution) query = query.ilike("institution", `%${institution}%`);

  const { data, error, count } = await query.range(from, to);

  if (error) throw error;

  const total = count ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  return {
    data,
    page,
    pageSize,
    total,
    totalPages,
  };
};


module.exports = {
    createAdminService,
    getAllAdminsService
}