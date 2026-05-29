const supabase = require('../config/supabase');
const { hashPassword } = require('../utils/hash');
const { assertValidCnpj, onlyDigits } = require('../utils/document');

const createAdminService = async (data) => {
  const payload = { ...data, cnpj: assertValidCnpj(data.cnpj) };
  payload.password_hash = await hashPassword(payload.password);
  delete payload.password;

  const { error } = await supabase.from('admins').insert(payload);
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
  if (cnpj) query = query.eq("cnpj", onlyDigits(cnpj));
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

const updateAdminService = async (id, data) => {
  if (!id) throw new Error("ID é obrigatório.");

  const payload = {
    name: data.name,
    phone: data.phone,
  };

  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) delete payload[key];
  });

  const { data: result, error } = await supabase
    .from("admins")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  delete result.password_hash;
  return result;
};

module.exports = {
  createAdminService,
  getAllAdminsService,
  updateAdminService,
}