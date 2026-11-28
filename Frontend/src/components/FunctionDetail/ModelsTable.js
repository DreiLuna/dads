import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import HelpBox from '../FunctionDetail/HelpBox'
import { formatPolynomial } from '../../utils/format';
import ExternalLink from '../ExternalLink';

// Recommend separating renderExponent into a utility file if they are used in multiple places, to avoid code duplication.
export const renderExponent = (expressionArray) => {
	// Recommend separating Superscript into a utility file if they are used in multiple places, to avoid code duplication.
	const Superscript = ({ children }) => (
		<sup style={{ fontSize: '0.6em', verticalAlign: 'super' }}>{children}</sup>
	  );
    return expressionArray.map((expression, index) => {
      const parts = expression.split(/(\^[\d]+)/);
      return (
        <React.Fragment key={index}>
          {parts.map((part, i) =>
            part.startsWith('^') ? (
              <Superscript key={i}>{part.slice(1)}</Superscript>
            ) : (
              part
            )
          )}
          {index !== expressionArray.length - 1 && <span> : </span>}
        </React.Fragment>
      );
    });
  };

export default function ModelsTable({ data }) {
    // Model objects in the API answer; a missing model is null
    const modelKeys = Object.keys(data).filter(
      key => (key.includes('_model') && key !== 'display_model') || key === 'monic_centered'
    );

    // Filter out models that have no data to display
    const relevantModels = modelKeys.filter(key => data[key]);

  return (
    <TableContainer className='table-component' component={Paper}>
      <h3>Models:</h3>
      <h6>Several different representatives of this conjugacy class. May include: monic centered, reduced, and the original model found in the literature.</h6>
      <Table aria-label='models table' data-testid="models-table">
        <TableHead>
          <TableRow>
            <TableCell><b>Name</b><HelpBox description="Name of the representative model" title="Name" /></TableCell>
            <TableCell><b>Polynomials</b><HelpBox description="The defining polynomials of the representative model" title="Polynomials" /></TableCell>
            <TableCell><b>Resultant</b><HelpBox description="The resultant of the defining polynomials of the representative model" title="Resultant" /></TableCell>
            <TableCell><b>Primes of Bad Reduction</b><HelpBox description="The primes when the representative model has bad reduction, i.e., the primes dividing the resultant" title="Primes of Bad Reduction" /></TableCell>
            <TableCell><b>Field of Definition</b><HelpBox description="The smallest field containing all coefficients of this representative model" title="Field of Definition" /></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {relevantModels.map((key, index) => {
            const model = data[key];
            return (
              <TableRow key={index}>
                <TableCell>{key.replace(/_/g, ' ').replace(/ model$/, '') + ' model'}</TableCell>
                <TableCell>{renderExponent([formatPolynomial(model.coeffs, data.degree)])}</TableCell>
                <TableCell>{model.resultant}</TableCell>
                <TableCell>{model.bad_primes ? `{${model.bad_primes.join(',')}}` : ''}</TableCell>
                <TableCell>{model.base_field_label ? (
                <ExternalLink
                  href={`https://www.lmfdb.org/NumberField/${model.base_field_label}`}
                  style={{
                    color: "blue",
                    textDecoration: "underline"
                  }}>
                    {model.base_field_label}
                </ExternalLink>): ('–')}
                </TableCell>
              </TableRow>

            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
