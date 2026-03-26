const supabase = require('../config/supabase');
const { hashPassword } = require('../utils/hash');

const createAdminService = async (data) => {
  const payload = { ...data };
  payload.password_hash = await hashPassword(payload.password);
  delete payload.password;

  const { data: existingEmail, error: emailLookupError } = await supabase
    .from('admins')
    .select('id')
    .eq('email', payload.email)
    .maybeSingle();

  if (emailLookupError) throw emailLookupError;
  if (existingEmail) {
    const error = new Error('Já existe uma instituição cadastrada com este email');
    error.statusCode = 409;
    throw error;
  }

  const { data: existingCnpj, error: cnpjLookupError } = await supabase
    .from('admins')
    .select('id')
    .eq('cnpj', payload.cnpj)
    .maybeSingle();

  if (cnpjLookupError) throw cnpjLookupError;
  if (existingCnpj) {
    const error = new Error('Já existe uma instituição cadastrada com este CNPJ');
    error.statusCode = 409;
    throw error;
  }

  const { data: created, error } = await supabase.from('admins').insert(payload).select('*').single();
  if (error) {
    throw error;
  }

  if (created?.password_hash) delete created.password_hash;

  return { success: true, message: 'Instituição cadastrada com sucesso', data: created };
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

  let query = supabase.from("admins").select("id, name, email, phone, institution, cnpj, created_at", { count: "exact" });

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