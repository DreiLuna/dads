// File: Frontend/src/tests/frontend/ModelsTable.test.js
// Tests for ModelsTable and the model formatting helpers in utils/format.js.

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ModelsTable, { renderExponent } from '../../components/FunctionDetail/ModelsTable';
import { formatPolynomial, modelCsvFields } from '../../utils/format';


// Mocked API answer: each model is an object, or null when missing (see #360)
// System 11: original and reduced models over 1.1.1.1, no monic centered model
const system11Model = {
  coeffs: [['4', '4', '4'], ['-2', '4', '3']],
  resultant: '496',
  bad_primes: [2, 31],
  height: 1.3862944,
  base_field_label: '1.1.1.1',
};

// System 3's monic centered model has no height
const noHeightModel = {
  coeffs: [['1', '0', '-1'], ['0', '0', '1']],
  resultant: '1',
  bad_primes: [],
  height: null,
  base_field_label: '1.1.1.1',
};


// Pure function tests

// Coefficients are [[f coefficients], [g coefficients]]; degree 2 terms are x^2, xy, y^2
describe('formatPolynomial function', () => {
  test('formats a degree 2 model with a negative coefficient', () => {
    expect(formatPolynomial(noHeightModel.coeffs, 2)).toBe('[x^2 - y^2 : y^2]');
  });

  test('formats a model where every coefficient is nonzero', () => {
    expect(formatPolynomial(system11Model.coeffs, 2)).toBe('[4x^2 + 4xy + 4y^2 : -2x^2 + 4xy + 3y^2]');
  });

  test('formats a degree 3 model with -1 and middle terms', () => {
    expect(formatPolynomial([['1', '0', '-3', '0'], ['0', '-1', '0', '1']], 3))
      .toBe('[x^3 - 3xy^2 : -x^2y + y^3]');
  });

  test('returns an empty string when there is no degree', () => {
    expect(formatPolynomial(noHeightModel.coeffs, 0)).toBe('');
  });

  test('returns an empty string when there are no coefficients', () => {
    expect(formatPolynomial(null, 2)).toBe('');
  });
});


// CSV cells must read the same as the old string-based export
describe('modelCsvFields function', () => {
  test('formats every field of a full model', () => {
    expect(modelCsvFields(system11Model)).toEqual([
      '[[4,4,4],[-2,4,3]]', '496', '[2,31]', '1.3862944', '1.1.1.1',
    ]);
  });

  test('writes N/A for a missing height and [] for no bad primes', () => {
    expect(modelCsvFields(noHeightModel)).toEqual([
      '[[1,0,-1],[0,0,1]]', '1', '[]', 'N/A', '1.1.1.1',
    ]);
  });

  test('writes a zero height as 0', () => {
    expect(modelCsvFields({ ...noHeightModel, height: 0 })[3]).toBe('0');
  });

  test('writes N/A in every column for a missing model (system 11 monic centered)', () => {
    expect(modelCsvFields(null)).toEqual(['N/A', 'N/A', 'N/A', 'N/A', 'N/A']);
  });

  test('writes N/A for an empty field label', () => {
    expect(modelCsvFields({ ...system11Model, base_field_label: '' })[4]).toBe('N/A');
  });
});


// Renders exponents like 'x^2' as superscripts
describe('renderExponent function', () => {
  test('renders exponents correctly', () => {
    const { container } = render(<>{renderExponent(['x^2', 'y^3'])}</>);
    expect(container.textContent).toContain('x');
    expect(container.textContent).toContain('2');
    expect(container.textContent).toContain('y');
    expect(container.textContent).toContain('3');
  });
});


// Component test
describe('ModelsTable component', () => {
  const system11Data = {
    degree: 2,
    monic_centered: null,
    original_model: system11Model,
    reduced_model: system11Model,
    cp_field_of_defn: '2.2.124.1',
  };

  test('renders without crashing', () => {
    render(<ModelsTable data={{ degree: 2, original_model: system11Model }} />);
    expect(screen.getByTestId('models-table')).toBeInTheDocument();
  });

  test('shows the polynomial, resultant and bad primes of a model', () => {
    render(<ModelsTable data={{ degree: 2, original_model: system11Model }} />);
    expect(screen.getByText('496')).toBeInTheDocument();
    expect(screen.getByText('{2,31}')).toBeInTheDocument();
    expect(screen.getByTestId('models-table').textContent).toContain('4x2 + 4xy + 4y2 : -2x2 + 4xy + 3y2');
  });

  // System 11 has no monic centered model, so only two rows show
  test('hides a missing (null) model', () => {
    render(<ModelsTable data={system11Data} />);
    expect(screen.getByText('original model')).toBeInTheDocument();
    expect(screen.getByText('reduced model')).toBeInTheDocument();
    expect(screen.queryByText('monic centered model')).not.toBeInTheDocument();
  });

  // System 11: both models are over 1.1.1.1, but the critical points are over 2.2.124.1
  test('shows each model\'s own field of definition, not the critical point field', () => {
    render(<ModelsTable data={system11Data} />);

    const fieldLinks = screen.getAllByRole('link', { name: '1.1.1.1' });
    expect(fieldLinks).toHaveLength(2);
    fieldLinks.forEach(link => {
      expect(link).toHaveAttribute('href', 'https://www.lmfdb.org/NumberField/1.1.1.1');
    });
    expect(screen.queryByText('2.2.124.1')).not.toBeInTheDocument();
  });

  test('shows a dash and no link when the field label is missing', () => {
    render(<ModelsTable data={{ degree: 2, original_model: { ...system11Model, base_field_label: null } }} />);

    expect(screen.getByText('–')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  test('shows a model with no height', () => {
    render(<ModelsTable data={{ degree: 2, monic_centered: noHeightModel }} />);
    expect(screen.getByText('monic centered model')).toBeInTheDocument();
    expect(screen.getByText('{}')).toBeInTheDocument();
  });
});
