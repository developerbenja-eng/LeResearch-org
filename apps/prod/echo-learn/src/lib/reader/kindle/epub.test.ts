import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { generateEpub, sectionsToEpubOptions } from './epub';

describe('EPUB Generator', () => {
  it('generates a valid EPUB zip with correct structure', async () => {
    const buf = await generateEpub({
      title: 'Test Paper',
      author: 'Jane Doe',
      id: 'test-123',
      sections: [
        { title: 'Introduction', content: 'This is the intro.', order: 1 },
        { title: 'Methods', content: '## Approach\n\nWe used **bold** methods.', order: 2 },
        { title: 'Results', content: 'The results were `significant`.', order: 3 },
      ],
    });

    expect(buf).toBeInstanceOf(Buffer);
    expect(buf.length).toBeGreaterThan(0);

    // Parse the ZIP and verify structure
    const zip = await JSZip.loadAsync(buf);
    const files = Object.keys(zip.files);

    expect(files).toContain('mimetype');
    expect(files).toContain('META-INF/container.xml');
    expect(files).toContain('OEBPS/content.opf');
    expect(files).toContain('OEBPS/toc.ncx');
    expect(files).toContain('OEBPS/style.css');
    expect(files).toContain('OEBPS/chapter-001.xhtml');
    expect(files).toContain('OEBPS/chapter-002.xhtml');
    expect(files).toContain('OEBPS/chapter-003.xhtml');
  });

  it('mimetype is the first entry and uncompressed', async () => {
    const buf = await generateEpub({
      title: 'Mimetype Test',
      author: 'Test',
      sections: [{ title: 'Ch1', content: 'Hello', order: 1 }],
    });

    // The mimetype file must be the literal string "application/epub+zip"
    const zip = await JSZip.loadAsync(buf);
    const mimetype = await zip.file('mimetype')!.async('string');
    expect(mimetype).toBe('application/epub+zip');
  });

  it('content.opf contains correct metadata', async () => {
    const buf = await generateEpub({
      title: 'Metadata Test',
      author: 'Dr. Smith',
      id: 'meta-456',
      sections: [{ title: 'Abstract', content: 'Summary here.', order: 1 }],
    });

    const zip = await JSZip.loadAsync(buf);
    const opf = await zip.file('OEBPS/content.opf')!.async('string');

    expect(opf).toContain('urn:echo:meta-456');
    expect(opf).toContain('Metadata Test');
    expect(opf).toContain('Dr. Smith');
    expect(opf).toContain('chapter-001');
  });

  it('toc.ncx contains chapter navigation', async () => {
    const buf = await generateEpub({
      title: 'TOC Test',
      author: 'Author',
      sections: [
        { title: 'First Section', content: 'Content 1', order: 1 },
        { title: 'Second Section', content: 'Content 2', order: 2 },
      ],
    });

    const zip = await JSZip.loadAsync(buf);
    const ncx = await zip.file('OEBPS/toc.ncx')!.async('string');

    expect(ncx).toContain('First Section');
    expect(ncx).toContain('Second Section');
    expect(ncx).toContain('playOrder="1"');
    expect(ncx).toContain('playOrder="2"');
  });

  it('converts markdown content to HTML in chapters', async () => {
    const buf = await generateEpub({
      title: 'Markdown Test',
      author: 'Author',
      sections: [
        {
          title: 'Rich Content',
          content: '## Subheading\n\nA paragraph with **bold** and `code`.\n\n- List item 1\n- List item 2',
          order: 1,
        },
      ],
    });

    const zip = await JSZip.loadAsync(buf);
    const chapter = await zip.file('OEBPS/chapter-001.xhtml')!.async('string');

    // Should contain converted HTML
    expect(chapter).toContain('<strong>bold</strong>');
    expect(chapter).toContain('<code>code</code>');
    expect(chapter).toContain('<li>');
    // Should have the XHTML wrapper
    expect(chapter).toContain('<?xml version="1.0"');
    expect(chapter).toContain('<html xmlns="http://www.w3.org/1999/xhtml">');
  });

  it('handles plain text content (no markdown)', async () => {
    const buf = await generateEpub({
      title: 'Plain Text Test',
      author: 'Author',
      sections: [
        {
          title: 'Plain Section',
          content: 'This is just plain text.\n\nWith multiple paragraphs.\n\nAnd a third one.',
          order: 1,
        },
      ],
    });

    const zip = await JSZip.loadAsync(buf);
    const chapter = await zip.file('OEBPS/chapter-001.xhtml')!.async('string');

    expect(chapter).toContain('<p>This is just plain text.</p>');
    expect(chapter).toContain('<p>With multiple paragraphs.</p>');
    expect(chapter).toContain('<p>And a third one.</p>');
  });

  it('escapes XML special characters in metadata', async () => {
    const buf = await generateEpub({
      title: 'Smith & Jones: A <Review>',
      author: 'O\'Brien & "The Team"',
      sections: [{ title: 'Ch 1', content: 'Content', order: 1 }],
    });

    const zip = await JSZip.loadAsync(buf);
    const opf = await zip.file('OEBPS/content.opf')!.async('string');

    expect(opf).toContain('Smith &amp; Jones: A &lt;Review&gt;');
    expect(opf).toContain('O&apos;Brien &amp; &quot;The Team&quot;');
  });

  it('applies custom CSS when provided', async () => {
    const customCss = 'body { font-family: sans-serif; color: red; }';
    const buf = await generateEpub({
      title: 'CSS Test',
      author: 'Author',
      css: customCss,
      sections: [{ title: 'Ch', content: 'Text', order: 1 }],
    });

    const zip = await JSZip.loadAsync(buf);
    const css = await zip.file('OEBPS/style.css')!.async('string');
    expect(css).toBe(customCss);
  });

  it('generates default ID when none provided', async () => {
    const buf = await generateEpub({
      title: 'No ID',
      author: 'Author',
      sections: [{ title: 'Ch', content: 'Text', order: 1 }],
    });

    const zip = await JSZip.loadAsync(buf);
    const opf = await zip.file('OEBPS/content.opf')!.async('string');
    expect(opf).toContain('urn:echo:echo-');
  });
});

describe('sectionsToEpubOptions', () => {
  it('maps ReaderPaper + ReaderSections to EpubOptions', () => {
    const paper = {
      title: 'My Paper',
      authors: [{ name: 'Alice' }, { name: 'Bob' }],
    };
    const sections = [
      { section_name: 'Abstract', content: 'Summary...', section_order: 1 },
      { section_name: 'Introduction', content: 'Intro text...', section_order: 2 },
    ];

    const opts = sectionsToEpubOptions(paper, sections);

    expect(opts.title).toBe('My Paper');
    expect(opts.author).toBe('Alice, Bob');
    expect(opts.sections).toHaveLength(2);
    expect(opts.sections[0]).toEqual({
      title: 'Abstract',
      content: 'Summary...',
      order: 1,
    });
  });

  it('uses "Unknown" author when no authors provided', () => {
    const opts = sectionsToEpubOptions(
      { title: 'Anon Paper', authors: [] },
      [{ section_name: 'Ch1', content: 'text', section_order: 1 }],
    );
    expect(opts.author).toBe('Unknown');
  });
});
