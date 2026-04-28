/**
 * GROBID TEI XML Parser
 *
 * Parses TEI XML output from GROBID into structured JSON format
 * for loading into our database and RAG system.
 *
 * GROBID endpoint: https://lfoppiano-grobid.hf.space/api/processFulltextDocument
 */

import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

// ============================================================================
// Types
// ============================================================================

export interface GrobidAuthor {
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  email?: string;
  isCorresponding: boolean;
  orcid?: string;
  affiliations: GrobidAffiliation[];
}

export interface GrobidAffiliation {
  institution: string;
  department?: string;
  laboratory?: string;
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
}

export interface GrobidReference {
  refId: string;
  refNumber: number;
  title?: string;
  authors: string[];
  journal?: string;
  year?: number;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  publisher?: string;
  bookTitle?: string;
  rawCitation?: string;
}

export interface GrobidSection {
  sectionNumber?: string;
  sectionType: string;
  title: string;
  content: string;
  level: number;
  order: number;
}

export interface GrobidFigure {
  figureId: string;
  caption: string;
  page?: number;
  coords?: string; // Raw coords from GROBID: "page,x,y,width,height"
}

export interface GrobidTable {
  tableId: string;
  caption: string;
  page?: number;
  coords?: string; // Raw coords from GROBID: "page,x,y,width,height"
}

export interface GrobidFormula {
  formulaId: string;
  content: string; // The formula text/LaTeX
  label?: string;  // e.g., "(1)", "(2)"
  page?: number;
  coords?: string;
}

export interface GrobidPaperData {
  // Metadata
  title: string;
  authors: GrobidAuthor[];
  doi?: string;
  journal?: string;
  publisher?: string;
  year?: number;
  volume?: string;
  issue?: string;
  pages?: string;

  // Dates
  dateReceived?: string;
  dateAccepted?: string;
  datePublished?: string;

  // Content
  abstract?: string;
  keywords: string[];
  sections: GrobidSection[];
  references: GrobidReference[];
  figures: GrobidFigure[];
  tables: GrobidTable[];
  formulas: GrobidFormula[];

  // Extraction metadata
  grobidVersion?: string;
  extractionDate: string;
}

// ============================================================================
// Parser Class
// ============================================================================

export class GrobidParser {
  private doc: Document;
  private ns: string = 'http://www.tei-c.org/ns/1.0';

  constructor(xmlString: string) {
    const parser = new DOMParser();
    this.doc = parser.parseFromString(xmlString, 'text/xml');
  }

  /**
   * Parse the full GROBID TEI XML document
   */
  parse(): GrobidPaperData {
    return {
      title: this.parseTitle(),
      authors: this.parseAuthors(),
      doi: this.parseDoi(),
      journal: this.parseJournal(),
      publisher: this.parsePublisher(),
      year: this.parseYear(),
      volume: this.parseVolume(),
      issue: this.parseIssue(),
      pages: this.parsePages(),
      dateReceived: this.parseDateReceived(),
      dateAccepted: this.parseDateAccepted(),
      datePublished: this.parseDatePublished(),
      abstract: this.parseAbstract(),
      keywords: this.parseKeywords(),
      sections: this.parseSections(),
      references: this.parseReferences(),
      figures: this.parseFigures(),
      tables: this.parseTables(),
      formulas: this.parseFormulas(),
      grobidVersion: this.parseGrobidVersion(),
      extractionDate: new Date().toISOString(),
    };
  }

  // -------------------------------------------------------------------------
  // Metadata Parsing
  // -------------------------------------------------------------------------

  private parseTitle(): string {
    const titleEl = this.querySelector('titleStmt title[type="main"]');
    return titleEl?.textContent?.trim() || '';
  }

  private parseDoi(): string | undefined {
    const doiEl = this.querySelector('idno[type="DOI"]');
    return doiEl?.textContent?.trim();
  }

  private parseJournal(): string | undefined {
    // Try 1: Standard journal title in header
    const journalEl = this.querySelector('monogr title[level="j"]');
    if (journalEl?.textContent?.trim()) {
      return journalEl.textContent.trim();
    }

    // Try 2: Look in footnotes for journal name pattern
    const footnotes = this.querySelectorAll('note[place="foot"]');
    for (const note of footnotes) {
      const text = note.textContent || '';
      // Pattern like "Author / Journal of Hydrology 238 (2000)"
      const journalMatch = text.match(/\/\s*([A-Z][^\/\d]+?)\s+\d+\s*\(\d{4}\)/);
      if (journalMatch) {
        return journalMatch[1].trim();
      }
    }

    // Try 3: Infer journal from DOI prefix
    const doi = this.parseDoi();
    if (doi) {
      const journalFromDoi = this.inferJournalFromDoi(doi);
      if (journalFromDoi) return journalFromDoi;
    }

    return undefined;
  }

  private inferJournalFromDoi(doi: string): string | undefined {
    // Common DOI patterns -> journal mappings
    const doiPatterns: [string, string][] = [
      ['10.1002/wrcr', 'Water Resources Research'],
      ['10.1002/vzj', 'Vadose Zone Journal'],
      ['10.1002/hyp', 'Hydrological Processes'],
      ['10.1016/j.jhydrol', 'Journal of Hydrology'],
      ['10.1016/j.watres', 'Water Research'],
      ['10.1016/j.geoderma', 'Geoderma'],
      ['10.1016/S0022-1694', 'Journal of Hydrology'],
      ['10.3389/frwa', 'Frontiers in Water'],
      ['10.3389/fenvs', 'Frontiers in Environmental Science'],
      ['10.3390/s', 'Sensors'],
      ['10.3390/w', 'Water'],
      ['10.1061/(ASCE)HE', 'Journal of Hydrologic Engineering'],
      ['10.1007/s10040', 'Hydrogeology Journal'],
      ['10.1007/s11269', 'Water Resources Management'],
      ['10.1111/gwat', 'Groundwater'],
      ['10.1029/', 'AGU Journal'],
    ];

    for (const [prefix, journal] of doiPatterns) {
      if (doi.startsWith(prefix)) {
        return journal;
      }
    }

    return undefined;
  }

  private parsePublisher(): string | undefined {
    const pubEl = this.querySelector('publicationStmt publisher');
    return pubEl?.textContent?.trim() || undefined;
  }

  private parseYear(): number | undefined {
    // Try 1: Published date with 'when' attribute
    const dateEl = this.querySelector('monogr imprint date[type="published"]');
    const when = dateEl?.getAttribute('when');
    if (when) {
      const year = parseInt(when.substring(0, 4), 10);
      if (!isNaN(year)) return year;
    }

    // Try 2: Any date with 'when' attribute in monogr
    const anyDateEl = this.querySelector('monogr imprint date');
    const anyWhen = anyDateEl?.getAttribute('when');
    if (anyWhen) {
      const year = parseInt(anyWhen.substring(0, 4), 10);
      if (!isNaN(year)) return year;
    }

    // Try 3: Extract from submission note (e.g., "accepted 21 August 2000")
    const noteEl = this.querySelector('note[type="submission"]');
    const noteText = noteEl?.textContent || '';
    const acceptedMatch = noteText.match(/accepted[:\s]+\d{1,2}\s+\w+\s+(\d{4})/i);
    if (acceptedMatch) {
      const year = parseInt(acceptedMatch[1], 10);
      if (!isNaN(year)) return year;
    }

    // Try 4: Extract year from note text (any 4-digit year from 1900-2099)
    const yearMatch = noteText.match(/\b(19\d{2}|20\d{2})\b/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1], 10);
      if (!isNaN(year)) return year;
    }

    // Try 5: Look in footnotes for journal citation pattern like "Journal Name 238 (2000) 78-89"
    const footnotes = this.querySelectorAll('note[place="foot"]');
    for (const note of footnotes) {
      const text = note.textContent || '';
      const journalYearMatch = text.match(/\((\d{4})\)\s*\d+[-–]\d+/);
      if (journalYearMatch) {
        const year = parseInt(journalYearMatch[1], 10);
        if (!isNaN(year)) return year;
      }
    }

    // Try 6: Extract year from DOI (e.g., 10.1029/91WR01366 -> 1991)
    const doi = this.parseDoi();
    if (doi) {
      // Pattern for AGU/Wiley style DOIs: 10.xxxx/YYxx where YY is 2-digit year
      const doiYearMatch = doi.match(/10\.\d+\/(\d{2})[A-Z]{2}/);
      if (doiYearMatch) {
        const twoDigitYear = parseInt(doiYearMatch[1], 10);
        // Convert 2-digit to 4-digit year (assume 00-30 is 2000s, 31-99 is 1900s)
        const year = twoDigitYear <= 30 ? 2000 + twoDigitYear : 1900 + twoDigitYear;
        return year;
      }
    }

    return undefined;
  }

  private parseVolume(): string | undefined {
    const volEl = this.querySelector('monogr imprint biblScope[unit="volume"]');
    return volEl?.textContent?.trim();
  }

  private parseIssue(): string | undefined {
    const issueEl = this.querySelector('monogr imprint biblScope[unit="issue"]');
    return issueEl?.textContent?.trim();
  }

  private parsePages(): string | undefined {
    const pagesEl = this.querySelector('monogr imprint biblScope[unit="page"]');
    if (pagesEl) {
      const from = pagesEl.getAttribute('from');
      const to = pagesEl.getAttribute('to');
      if (from && to) return `${from}-${to}`;
      return pagesEl.textContent?.trim();
    }
    return undefined;
  }

  // -------------------------------------------------------------------------
  // Dates Parsing
  // -------------------------------------------------------------------------

  private parseDateReceived(): string | undefined {
    const noteEl = this.querySelector('note[type="submission"]');
    const text = noteEl?.textContent || '';
    const match = text.match(/Received[:\s]+(\d{1,2}\s+\w+\s+\d{4})/i);
    if (match) {
      return this.normalizeDate(match[1]);
    }
    return undefined;
  }

  private parseDateAccepted(): string | undefined {
    const noteEl = this.querySelector('note[type="submission"]');
    const text = noteEl?.textContent || '';
    const match = text.match(/Accepted[:\s]+(\d{1,2}\s+\w+\s+\d{4})/i);
    if (match) {
      return this.normalizeDate(match[1]);
    }
    return undefined;
  }

  private parseDatePublished(): string | undefined {
    const dateEl = this.querySelector('monogr imprint date[type="published"]');
    return dateEl?.getAttribute('when') || undefined;
  }

  private normalizeDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    } catch {
      return dateStr;
    }
  }

  // -------------------------------------------------------------------------
  // Authors Parsing
  // -------------------------------------------------------------------------

  private parseAuthors(): GrobidAuthor[] {
    const authors: GrobidAuthor[] = [];
    const authorEls = this.querySelectorAll('sourceDesc biblStruct analytic author');

    authorEls.forEach((authorEl) => {
      const persName = this.getChildElement(authorEl, 'persName');
      if (!persName) return;

      const firstName = this.getChildText(persName, 'forename[type="first"]');
      const middleName = this.getChildText(persName, 'forename[type="middle"]');
      const lastName = this.getChildText(persName, 'surname');

      if (!lastName) return;

      const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
      const email = this.getChildText(authorEl, 'email');
      const isCorresponding = authorEl.getAttribute('role') === 'corresp';

      // Parse affiliations
      const affiliations: GrobidAffiliation[] = [];
      const affEls = this.getChildElements(authorEl, 'affiliation');
      affEls.forEach((affEl) => {
        const aff = this.parseAffiliation(affEl);
        if (aff) affiliations.push(aff);
      });

      authors.push({
        firstName: firstName || '',
        middleName,
        lastName,
        fullName,
        email,
        isCorresponding,
        affiliations,
      });
    });

    return authors;
  }

  private parseAffiliation(affEl: Element): GrobidAffiliation | null {
    const institution = this.getChildText(affEl, 'orgName[type="institution"]');
    if (!institution) return null;

    const address = this.getChildElement(affEl, 'address');

    return {
      institution,
      department: this.getChildText(affEl, 'orgName[type="department"]'),
      laboratory: this.getChildText(affEl, 'orgName[type="laboratory"]'),
      city: address ? this.getChildText(address, 'settlement') : undefined,
      region: address ? this.getChildText(address, 'region') : undefined,
      country: address ? this.getChildText(address, 'country') : undefined,
      countryCode: address ? this.getChildElement(address, 'country')?.getAttribute('key') || undefined : undefined,
    };
  }

  // -------------------------------------------------------------------------
  // Keywords Parsing
  // -------------------------------------------------------------------------

  private parseKeywords(): string[] {
    const keywords: string[] = [];
    const termEls = this.querySelectorAll('keywords term');

    termEls.forEach((termEl) => {
      const keyword = termEl.textContent?.trim();
      if (keyword) keywords.push(keyword);
    });

    return keywords;
  }

  // -------------------------------------------------------------------------
  // Abstract Parsing
  // -------------------------------------------------------------------------

  private parseAbstract(): string | undefined {
    const abstractEl = this.querySelector('profileDesc abstract');
    if (!abstractEl) return undefined;

    // Get all paragraph text
    const paragraphs: string[] = [];
    const pEls = this.getChildElements(abstractEl, 'p');

    if (pEls.length > 0) {
      pEls.forEach((p) => {
        const text = this.getTextContent(p);
        if (text) paragraphs.push(text);
      });
    } else {
      // Fallback: get all text content
      const text = this.getTextContent(abstractEl);
      if (text) paragraphs.push(text);
    }

    return paragraphs.join('\n\n') || undefined;
  }

  // -------------------------------------------------------------------------
  // Sections Parsing
  // -------------------------------------------------------------------------

  private parseSections(): GrobidSection[] {
    const sections: GrobidSection[] = [];
    const bodyEl = this.querySelector('text body');
    if (!bodyEl) return sections;

    const divEls = this.getChildElements(bodyEl, 'div');
    let order = 0;

    divEls.forEach((divEl) => {
      const section = this.parseSection(divEl, 0, order++);
      if (section) sections.push(section);
    });

    return sections;
  }

  private parseSection(divEl: Element, level: number, order: number): GrobidSection | null {
    const headEl = this.getChildElement(divEl, 'head');
    const title = headEl?.textContent?.trim() || '';
    const sectionNumber = headEl?.getAttribute('n') || undefined;

    // Get all paragraph content
    const paragraphs: string[] = [];
    const pEls = this.getChildElements(divEl, 'p');
    pEls.forEach((p) => {
      const text = this.getTextContent(p);
      if (text) paragraphs.push(text);
    });

    const content = paragraphs.join('\n\n');
    if (!content && !title) return null;

    // Determine section type from title
    const sectionType = this.inferSectionType(title);

    return {
      sectionNumber,
      sectionType,
      title,
      content,
      level,
      order,
    };
  }

  private inferSectionType(title: string): string {
    const lower = title.toLowerCase();

    if (lower.includes('abstract')) return 'abstract';
    if (lower.includes('introduction')) return 'introduction';
    if (lower.includes('method') || lower.includes('material')) return 'methods';
    if (lower.includes('result')) return 'results';
    if (lower.includes('discussion')) return 'discussion';
    if (lower.includes('conclusion')) return 'conclusions';
    if (lower.includes('reference') || lower.includes('bibliography')) return 'references';
    if (lower.includes('acknowledg')) return 'acknowledgments';
    if (lower.includes('appendix') || lower.includes('supplement')) return 'supplementary';

    return 'other';
  }

  // -------------------------------------------------------------------------
  // References Parsing
  // -------------------------------------------------------------------------

  private parseReferences(): GrobidReference[] {
    const references: GrobidReference[] = [];
    const biblEls = this.querySelectorAll('listBibl biblStruct');

    biblEls.forEach((biblEl, index) => {
      const ref = this.parseReference(biblEl, index);
      if (ref) references.push(ref);
    });

    return references;
  }

  private parseReference(biblEl: Element, index: number): GrobidReference | null {
    const refId = biblEl.getAttribute('xml:id') || `ref_${index}`;

    // Parse analytic (article) info
    const analyticEl = this.getChildElement(biblEl, 'analytic');
    const monogrEl = this.getChildElement(biblEl, 'monogr');

    // Get title (from analytic for articles, monogr for books)
    let title = analyticEl
      ? this.getChildText(analyticEl, 'title[level="a"]')
      : this.getChildText(monogrEl, 'title[level="m"]');

    // Get authors
    const authors: string[] = [];
    const authorContainer = analyticEl || monogrEl;
    if (authorContainer) {
      const authorEls = this.getChildElements(authorContainer, 'author');
      authorEls.forEach((authorEl) => {
        const persName = this.getChildElement(authorEl, 'persName');
        if (persName) {
          const firstName = this.getChildText(persName, 'forename');
          const lastName = this.getChildText(persName, 'surname');
          if (lastName) {
            authors.push(firstName ? `${firstName} ${lastName}` : lastName);
          }
        }
      });
    }

    // Get journal
    const journal = monogrEl ? this.getChildText(monogrEl, 'title[level="j"]') : undefined;

    // Get book title (for book chapters)
    const bookTitle = monogrEl ? this.getChildText(monogrEl, 'title[level="m"]') : undefined;

    // Get imprint info
    const imprintEl = monogrEl ? this.getChildElement(monogrEl, 'imprint') : null;

    // Get year
    let year: number | undefined;
    const dateEl = imprintEl ? this.getChildElement(imprintEl, 'date') : null;
    if (dateEl) {
      const when = dateEl.getAttribute('when');
      if (when) {
        year = parseInt(when.substring(0, 4), 10);
        if (isNaN(year)) year = undefined;
      }
    }

    // Get volume, pages
    const volume = imprintEl ? this.getChildText(imprintEl, 'biblScope[unit="volume"]') : undefined;
    const pages = imprintEl ? this.getChildText(imprintEl, 'biblScope[unit="page"]') : undefined;

    // Get DOI
    const doi = this.getChildText(biblEl, 'idno[type="DOI"]');

    // Get URL
    const ptrEl = this.getChildElement(biblEl, 'ptr');
    const url = ptrEl?.getAttribute('target') || undefined;

    return {
      refId,
      refNumber: index + 1,
      title,
      authors,
      journal,
      year,
      volume,
      pages,
      doi,
      url,
      bookTitle,
    };
  }

  // -------------------------------------------------------------------------
  // Figures Parsing
  // -------------------------------------------------------------------------

  private parseFigures(): GrobidFigure[] {
    const figures: GrobidFigure[] = [];
    const figureEls = this.querySelectorAll('figure');

    figureEls.forEach((figEl) => {
      // Skip tables (they have type="table")
      if (figEl.getAttribute('type') === 'table') return;

      const id = figEl.getAttribute('xml:id');
      const headEl = this.getChildElement(figEl, 'head');
      const figDescEl = this.getChildElement(figEl, 'figDesc');
      const graphicEl = this.getChildElement(figEl, 'graphic');

      const figureId = headEl?.textContent?.trim() || id || '';
      const caption = figDescEl?.textContent?.trim() || '';

      // Extract page number from coords attribute
      // Format: "page,x,y,width,height" e.g., "6,38.96,67.97,238.65,271.57"
      let page: number | undefined;
      let coords: string | undefined;
      if (graphicEl) {
        coords = graphicEl.getAttribute('coords') || undefined;
        if (coords) {
          const parts = coords.split(',');
          if (parts.length >= 1) {
            page = parseInt(parts[0], 10);
            if (isNaN(page)) page = undefined;
          }
        }
      }

      if (figureId || caption) {
        figures.push({ figureId, caption, page, coords });
      }
    });

    return figures;
  }

  // -------------------------------------------------------------------------
  // Tables Parsing
  // -------------------------------------------------------------------------

  private parseTables(): GrobidTable[] {
    const tables: GrobidTable[] = [];
    const tableEls = this.querySelectorAll('figure[type="table"]');

    tableEls.forEach((tableEl) => {
      const id = tableEl.getAttribute('xml:id');
      const headEl = this.getChildElement(tableEl, 'head');
      const figDescEl = this.getChildElement(tableEl, 'figDesc');

      const tableId = headEl?.textContent?.trim() || id || '';
      const caption = figDescEl?.textContent?.trim() || '';

      // Extract page number from coords attribute on the figure element or table element
      // Format: "page,x,y,width,height"
      let page: number | undefined;
      let coords: string | undefined;
      coords = tableEl.getAttribute('coords') || undefined;
      if (coords) {
        const parts = coords.split(',');
        if (parts.length >= 1) {
          page = parseInt(parts[0], 10);
          if (isNaN(page)) page = undefined;
        }
      }

      if (tableId || caption) {
        tables.push({ tableId, caption, page, coords });
      }
    });

    return tables;
  }

  // -------------------------------------------------------------------------
  // Formulas/Equations Parsing
  // -------------------------------------------------------------------------

  private parseFormulas(): GrobidFormula[] {
    const formulas: GrobidFormula[] = [];
    const formulaEls = this.querySelectorAll('formula');

    formulaEls.forEach((formulaEl) => {
      const id = formulaEl.getAttribute('xml:id') || '';

      // Get the formula content (the mathematical expression)
      // GROBID outputs the formula as text content
      const content = formulaEl.textContent?.trim() || '';

      // Get the label (e.g., "(1)", "(2)") from <label> child element
      const labelEl = this.getChildElement(formulaEl, 'label');
      const label = labelEl?.textContent?.trim() || undefined;

      // Extract page number from coords attribute if present
      // Format: "page,x,y,width,height"
      let page: number | undefined;
      let coords: string | undefined;
      coords = formulaEl.getAttribute('coords') || undefined;
      if (coords) {
        const parts = coords.split(',');
        if (parts.length >= 1) {
          page = parseInt(parts[0], 10);
          if (isNaN(page)) page = undefined;
        }
      }

      if (content) {
        formulas.push({
          formulaId: id,
          content,
          label,
          page,
          coords,
        });
      }
    });

    return formulas;
  }

  // -------------------------------------------------------------------------
  // GROBID Version
  // -------------------------------------------------------------------------

  private parseGrobidVersion(): string | undefined {
    const appEl = this.querySelector('encodingDesc appInfo application');
    return appEl?.getAttribute('version') || undefined;
  }

  // -------------------------------------------------------------------------
  // Helper Methods
  // -------------------------------------------------------------------------

  private querySelector(selector: string): Element | null {
    // Simple CSS selector implementation for XML
    const parts = selector.split(' ');
    let current: Element | null = this.doc.documentElement;

    for (const part of parts) {
      if (!current) return null;
      current = this.findElement(current, part);
    }

    return current;
  }

  private querySelectorAll(selector: string): Element[] {
    const results: Element[] = [];
    const parts = selector.split(' ');

    if (parts.length === 1) {
      return this.findAllElements(this.doc.documentElement, parts[0]);
    }

    // For multi-part selectors, find parent first then children
    const parentSelector = parts.slice(0, -1).join(' ');
    const childSelector = parts[parts.length - 1];

    const parents = this.querySelectorAll(parentSelector);
    parents.forEach((parent) => {
      const children = this.findAllElements(parent, childSelector);
      results.push(...children);
    });

    return results;
  }

  private findElement(parent: Element, selector: string): Element | null {
    const { tagName, attrs } = this.parseSelector(selector);

    const children = parent.getElementsByTagNameNS(this.ns, tagName);
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as Element;
      if (this.matchesAttrs(child, attrs)) {
        return child;
      }
    }

    // Also try without namespace
    const childrenNoNs = parent.getElementsByTagName(tagName);
    for (let i = 0; i < childrenNoNs.length; i++) {
      const child = childrenNoNs[i] as Element;
      if (this.matchesAttrs(child, attrs)) {
        return child;
      }
    }

    return null;
  }

  private findAllElements(parent: Element, selector: string): Element[] {
    const { tagName, attrs } = this.parseSelector(selector);
    const results: Element[] = [];

    const children = parent.getElementsByTagNameNS(this.ns, tagName);
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as Element;
      if (this.matchesAttrs(child, attrs)) {
        results.push(child);
      }
    }

    // Also try without namespace
    const childrenNoNs = parent.getElementsByTagName(tagName);
    for (let i = 0; i < childrenNoNs.length; i++) {
      const child = childrenNoNs[i] as Element;
      if (this.matchesAttrs(child, attrs) && !results.includes(child)) {
        results.push(child);
      }
    }

    return results;
  }

  private parseSelector(selector: string): { tagName: string; attrs: Record<string, string> } {
    const match = selector.match(/^(\w+)(?:\[(.+)\])?$/);
    if (!match) return { tagName: selector, attrs: {} };

    const tagName = match[1];
    const attrs: Record<string, string> = {};

    if (match[2]) {
      const attrMatches = match[2].matchAll(/(\w+)="([^"]+)"/g);
      for (const attrMatch of attrMatches) {
        attrs[attrMatch[1]] = attrMatch[2];
      }
    }

    return { tagName, attrs };
  }

  private matchesAttrs(el: Element, attrs: Record<string, string>): boolean {
    for (const [key, value] of Object.entries(attrs)) {
      if (el.getAttribute(key) !== value) return false;
    }
    return true;
  }

  private getChildElement(parent: Element | null, selector: string): Element | null {
    if (!parent) return null;
    return this.findElement(parent, selector);
  }

  private getChildElements(parent: Element | null, selector: string): Element[] {
    if (!parent) return [];
    const { tagName, attrs } = this.parseSelector(selector);
    const results: Element[] = [];

    // Only get direct children
    for (let i = 0; i < parent.childNodes.length; i++) {
      const child = parent.childNodes[i];
      if (child.nodeType === 1) { // Element node
        const el = child as Element;
        const localName = el.localName || el.nodeName;
        if (localName === tagName && this.matchesAttrs(el, attrs)) {
          results.push(el);
        }
      }
    }

    return results;
  }

  private getChildText(parent: Element | null, selector: string): string | undefined {
    const el = this.getChildElement(parent, selector);
    return el?.textContent?.trim() || undefined;
  }

  private getTextContent(el: Element): string {
    // Get text content, removing ref tags but keeping their text
    let text = '';

    for (let i = 0; i < el.childNodes.length; i++) {
      const node = el.childNodes[i];
      if (node.nodeType === 3) { // Text node
        text += node.textContent;
      } else if (node.nodeType === 1) { // Element node
        const childEl = node as Element;
        const localName = childEl.localName || childEl.nodeName;

        // For ref elements, just get the text
        if (localName === 'ref') {
          text += childEl.textContent;
        } else {
          text += this.getTextContent(childEl);
        }
      }
    }

    return text.trim();
  }
}

// ============================================================================
// GROBID API Client
// ============================================================================

export interface GrobidClientOptions {
  baseUrl?: string;
  timeout?: number;
}

export class GrobidClient {
  private baseUrl: string;
  private timeout: number;

  constructor(options: GrobidClientOptions = {}) {
    this.baseUrl = options.baseUrl || 'https://lfoppiano-grobid.hf.space';
    this.timeout = options.timeout || 300000; // 5 minutes default (HF spaces can be slow)
  }

  /**
   * Check if GROBID service is alive
   */
  async isAlive(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/isalive`, {
        signal: AbortSignal.timeout(30000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Process a PDF and return structured data
   */
  async processPdf(pdfBuffer: Buffer): Promise<GrobidPaperData> {
    const result = await this.processPdfWithRaw(pdfBuffer);
    return result.data;
  }

  /**
   * Process a PDF and return both structured data AND raw XML
   * Use this when you want to store the original XML for later re-parsing
   */
  async processPdfWithRaw(pdfBuffer: Buffer): Promise<{ data: GrobidPaperData; rawXml: string }> {
    const formData = new FormData();
    // Convert Buffer to ArrayBuffer for Blob compatibility
    const arrayBuffer = pdfBuffer.buffer.slice(
      pdfBuffer.byteOffset,
      pdfBuffer.byteOffset + pdfBuffer.byteLength
    ) as ArrayBuffer;
    formData.append('input', new Blob([arrayBuffer]), 'document.pdf');

    const response = await fetch(`${this.baseUrl}/api/processFulltextDocument`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/xml',
      },
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      throw new Error(`GROBID request failed: ${response.status} ${response.statusText}`);
    }

    const rawXml = await response.text();
    const parser = new GrobidParser(rawXml);
    return {
      data: parser.parse(),
      rawXml,
    };
  }

  /**
   * Process a PDF from a URL
   */
  async processPdfFromUrl(pdfUrl: string): Promise<GrobidPaperData> {
    // Fetch the PDF first
    const pdfResponse = await fetch(pdfUrl);
    if (!pdfResponse.ok) {
      throw new Error(`Failed to fetch PDF: ${pdfResponse.status}`);
    }

    const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());
    return this.processPdf(pdfBuffer);
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Parse GROBID XML string directly
 */
export function parseGrobidXml(xmlString: string): GrobidPaperData {
  const parser = new GrobidParser(xmlString);
  return parser.parse();
}

/**
 * Convert GrobidPaperData to database-ready format
 */
export function toDbFormat(data: GrobidPaperData, paperId: string) {
  return {
    paper: {
      id: paperId,
      title: data.title,
      authors: JSON.stringify(data.authors.map(a => ({
        name: a.fullName,
        email: a.email,
        isCorresponding: a.isCorresponding,
        orcid: a.orcid,
      }))),
      year: data.year,
      journal: data.journal,
      doi: data.doi,
      abstract: data.abstract,
      date_received: data.dateReceived,
      date_accepted: data.dateAccepted,
      date_published: data.datePublished,
      extraction_method: 'grobid',
      extraction_date: data.extractionDate,
      grobid_version: data.grobidVersion,
    },
    keywords: data.keywords.map((kw, i) => ({
      paper_id: paperId,
      keyword: kw,
      keyword_type: 'author',
    })),
    sections: data.sections.map((s, i) => ({
      paper_id: paperId,
      section_number: s.sectionNumber,
      section_type: s.sectionType,
      title: s.title,
      content: s.content,
      section_order: s.order,
      level: s.level,
    })),
    references: data.references.map((r) => ({
      paper_id: paperId,
      ref_id: r.refId,
      ref_number: r.refNumber,
      title: r.title,
      authors: JSON.stringify(r.authors),
      journal: r.journal,
      year: r.year,
      volume: r.volume,
      pages: r.pages,
      doi: r.doi,
      url: r.url,
      book_title: r.bookTitle,
    })),
    figures: data.figures.map((f) => ({
      paper_id: paperId,
      figure_id: f.figureId,
      caption: f.caption,
      page: f.page,
      coords: f.coords,
    })),
    tables: data.tables.map((t) => ({
      paper_id: paperId,
      table_id: t.tableId,
      caption: t.caption,
      page: t.page,
      coords: t.coords,
    })),
    formulas: data.formulas.map((f, i) => ({
      paper_id: paperId,
      formula_id: f.formulaId || `formula_${i}`,
      content: f.content,
      label: f.label,
      page: f.page,
      coords: f.coords,
    })),
    authors: data.authors.map((a, i) => ({
      paper_id: paperId,
      first_name: a.firstName,
      middle_name: a.middleName,
      last_name: a.lastName,
      full_name: a.fullName,
      email: a.email,
      is_corresponding: a.isCorresponding,
      orcid: a.orcid,
      author_order: i + 1,
      affiliations: JSON.stringify(a.affiliations),
    })),
  };
}
