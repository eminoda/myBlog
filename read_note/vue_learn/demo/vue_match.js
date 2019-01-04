const doctype = /^<!DOCTYPE [^>]+>/i;
const html = `<!DOCTYPE html >123>123><html lang="en"></html>`;
const doctypeMatch = html.match(doctype);
console.log(html.substring(doctypeMatch[0].length));
