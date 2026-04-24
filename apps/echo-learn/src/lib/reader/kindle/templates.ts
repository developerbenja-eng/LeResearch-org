/**
 * EPUB Template Strings
 *
 * Minimal XML/XHTML templates for EPUB 2.0.1 packaging.
 * EPUB is just a ZIP with specific structure — these templates
 * are the boilerplate glue files.
 */

export function containerXml(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
}

export function contentOpf(meta: {
  id: string;
  title: string;
  author: string;
  date: string;
  chapters: { id: string; filename: string; title: string }[];
}): string {
  const manifestItems = meta.chapters
    .map((ch) => `    <item id="${ch.id}" href="${ch.filename}" media-type="application/xhtml+xml"/>`)
    .join('\n');

  const spineItems = meta.chapters.map((ch) => `    <itemref idref="${ch.id}"/>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">urn:echo:${meta.id}</dc:identifier>
    <dc:title>${escapeXml(meta.title)}</dc:title>
    <dc:creator>${escapeXml(meta.author)}</dc:creator>
    <dc:language>en</dc:language>
    <dc:date>${meta.date}</dc:date>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="style" href="style.css" media-type="text/css"/>
${manifestItems}
  </manifest>
  <spine toc="ncx">
${spineItems}
  </spine>
</package>`;
}

export function tocNcx(meta: {
  id: string;
  title: string;
  chapters: { id: string; filename: string; title: string; order: number }[];
}): string {
  const navPoints = meta.chapters
    .map(
      (ch) => `    <navPoint id="nav-${ch.id}" playOrder="${ch.order}">
      <navLabel><text>${escapeXml(ch.title)}</text></navLabel>
      <content src="${ch.filename}"/>
    </navPoint>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:echo:${meta.id}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>${escapeXml(meta.title)}</text></docTitle>
  <navMap>
${navPoints}
  </navMap>
</ncx>`;
}

export function chapterXhtml(title: string, bodyHtml: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${escapeXml(title)}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <h1>${escapeXml(title)}</h1>
  ${bodyHtml}
</body>
</html>`;
}

export const defaultStyleCss = `body {
  font-family: Georgia, "Times New Roman", serif;
  line-height: 1.6;
  margin: 1em;
  color: #222;
}
h1 { font-size: 1.4em; margin-bottom: 0.5em; }
h2 { font-size: 1.2em; margin-top: 1em; }
h3 { font-size: 1.1em; margin-top: 0.8em; }
p { margin: 0.5em 0; text-indent: 0; }
blockquote {
  margin: 0.5em 1em;
  padding-left: 0.5em;
  border-left: 2px solid #999;
  color: #555;
}
code {
  font-family: "Courier New", monospace;
  font-size: 0.9em;
  background: #f5f5f5;
  padding: 0.1em 0.3em;
}
pre {
  font-family: "Courier New", monospace;
  font-size: 0.85em;
  background: #f5f5f5;
  padding: 0.5em;
  overflow-x: auto;
  white-space: pre-wrap;
}
table { border-collapse: collapse; margin: 0.5em 0; width: 100%; }
th, td { border: 1px solid #ccc; padding: 0.3em 0.5em; text-align: left; }
th { background: #f0f0f0; }
ul, ol { margin: 0.5em 0; padding-left: 1.5em; }
`;

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
