const ts = require('typescript');

const program = ts.createProgram(['src/app/page.tsx'], {
  jsx: ts.JsxEmit.ReactJSX,
  target: ts.ScriptTarget.ES2022,
  moduleResolution: ts.ModuleResolutionKind.NodeJs,
  noEmit: true
});

const diagnostics = ts.getPreEmitDiagnostics(program);

for (const diagnostic of diagnostics) {
  if (diagnostic.file) {
    const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
  } else {
    console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
  }
}
