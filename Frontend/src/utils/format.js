// Formatting for model objects returned by the API:
// { coeffs, resultant, bad_primes, height, base_field_label }, or null when missing.

// Monomials of a homogeneous polynomial in x and y, from x^degree down to y^degree
function buildMonomials(degree) {
  const monomialList = [];
  for (let i = 0; i <= degree; i++) {
    if (i === 0) {
      monomialList.push('x^' + degree);
    } else if (i === degree) {
      monomialList.push('y^' + degree);
    } else if (degree - i === 1 && i === 1) {
      monomialList.push('xy');
    } else if (i === 1) {
      monomialList.push('x^' + (degree - i) + 'y');
    } else if (degree - i === 1) {
      monomialList.push('xy^' + i);
    } else {
      monomialList.push('x^' + (degree - i) + 'y^' + i);
    }
  }
  return monomialList;
}

// Coefficients [[f...], [g...]] -> "[4x^2 + 4xy + 4y^2 : -2x^2 + 4xy + 3y^2]"
export function formatPolynomial(coeffs, degree) {
  if (!degree || !coeffs) {
    return '';
  }
  const monomialList = buildMonomials(degree);

  const sides = coeffs.slice(0, 2).map(row => {
    let out = '';
    let isFirstTerm = true;
    for (let j = 0; j <= degree; j++) {
      const coefficient = String(row[j]);
      if (coefficient === '0') {
        continue;
      }
      const isNegative = coefficient.startsWith('-');
      if (!isFirstTerm) {
        out += isNegative ? ' - ' : ' + ';
      } else if (isNegative) {
        out += '-';
      }
      const absolute = isNegative ? coefficient.slice(1) : coefficient;
      out += (absolute === '1' ? '' : absolute) + monomialList[j];
      isFirstTerm = false;
    }
    return out;
  });

  return `[${sides.join(' : ')}]`;
}

const NA = 'N/A';
const orNA = value => (value === null || value === undefined || value === '' ? NA : String(value));

// The five CSV cells for one model: coeffs, resultant, bad_primes, height, base_field_label
export function modelCsvFields(model) {
  if (!model) {
    return [NA, NA, NA, NA, NA];
  }
  return [
    model.coeffs ? `[${model.coeffs.map(row => `[${row.join(',')}]`).join(',')}]` : NA,
    orNA(model.resultant),
    model.bad_primes ? `[${model.bad_primes.join(',')}]` : NA,
    orNA(model.height),
    orNA(model.base_field_label),
  ];
}
