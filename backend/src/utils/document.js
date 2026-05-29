const onlyDigits = (value) => String(value || "").replace(/\D/g, "");

const validateCpf = (value) => {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  const calc = (factor) => {
    let total = 0;
    for (let i = 0; i < factor - 1; i += 1) total += Number(cpf[i]) * (factor - i);
    const rest = (total * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  return calc(10) === Number(cpf[9]) && calc(11) === Number(cpf[10]);
};

const validateCnpj = (value) => {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

  const calc = (base, weights) => {
    const sum = weights.reduce((total, weight, index) => total + Number(base[index]) * weight, 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const first = calc(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const second = calc(cnpj.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return first === Number(cnpj[12]) && second === Number(cnpj[13]);
};

const assertValidCpf = (value) => {
  const cpf = onlyDigits(value);
  if (!validateCpf(cpf)) {
    const error = new Error("CPF inválido.");
    error.statusCode = 400;
    throw error;
  }
  return cpf;
};

const assertValidCnpj = (value) => {
  const cnpj = onlyDigits(value);
  if (!validateCnpj(cnpj)) {
    const error = new Error("CNPJ inválido.");
    error.statusCode = 400;
    throw error;
  }
  return cnpj;
};

module.exports = { onlyDigits, validateCpf, validateCnpj, assertValidCpf, assertValidCnpj };
