import { parse } from '@babel/parser';

function isFunctionLikeExpression(node) {
  return node?.type === 'ArrowFunctionExpression' || node?.type === 'FunctionExpression';
}

function isSingleFunctionTopLevelStatement(statement) {
  if (!statement) return false;

  if (statement.type === 'FunctionDeclaration') return true;

  if (statement.type === 'ExpressionStatement') {
    return isFunctionLikeExpression(statement.expression);
  }

  if (statement.type === 'VariableDeclaration') {
    if (statement.declarations.length !== 1) return false;
    return isFunctionLikeExpression(statement.declarations[0]?.init);
  }

  if (statement.type === 'ExportDefaultDeclaration') {
    const decl = statement.declaration;
    return decl?.type === 'FunctionDeclaration' || isFunctionLikeExpression(decl);
  }

  if (statement.type === 'ExportNamedDeclaration') {
    const decl = statement.declaration;
    if (!decl) return false;
    if (decl.type === 'FunctionDeclaration') return true;
    if (decl.type === 'VariableDeclaration' && decl.declarations.length === 1) {
      return isFunctionLikeExpression(decl.declarations[0]?.init);
    }
  }

  return false;
}

/**
 * Validates that the input is syntactically valid JavaScript/TypeScript and
 * represents exactly one function at the top level.
 * @param {string} code
 * @returns {{ valid: true } | { valid: false, error: string }}
 */
export function validateSingleFunctionInput(code) {
  if (!code || typeof code !== 'string') {
    return { valid: false, error: 'Invalid input: code is required.' };
  }

  const trimmed = code.trim();
  if (!trimmed) {
    return { valid: false, error: 'Invalid input: code cannot be empty.' };
  }

  let ast;
  try {
    ast = parse(trimmed, {
      sourceType: 'unambiguous',
      plugins: ['typescript'],
    });
  } catch {
    return {
      valid: false,
      error: 'Invalid input: code must be valid JavaScript or TypeScript syntax.',
    };
  }

  const topLevelStatements = ast.program.body.filter((node) => node.type !== 'EmptyStatement');

  if (topLevelStatements.length !== 1 || !isSingleFunctionTopLevelStatement(topLevelStatements[0])) {
    return {
      valid: false,
      error: 'Invalid input: please provide exactly one JavaScript/TypeScript function.',
    };
  }

  return { valid: true };
}
