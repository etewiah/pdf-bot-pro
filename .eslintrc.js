module.exports = {
  "extends": "standard",
  "rules": {
    "key-spacing": ["error", { "align": "value" }],
    "space-before-function-paren": 0,
    "no-multi-spaces": [
      "error",
      { "exceptions": { "VariableDeclarator": true, "ImportDeclaration": true, "Property": true } }
    ]
  }
};
