/**
 * Zotero API Client
 *
 * Handles communication with Zotero's Web API v3.
 * Supports fetching items, collections, and attachments.
 */

const ZOTERO_API_BASE = 'https://api.zotero.org';
const API_VERSION = '3';

export interface ZoteroItem {
  key: string;
  version: number;
  library: {
    type: string;
    id: number;
    name: string;
  };
  data: {
    key: string;
    version: number;
    itemType: string;
    title?: string;
    creators?: Array<{
      creatorType: string;
      firstName?: string;
      lastName?: string;
      name?: string;
    }>;
    abstractNote?: string;
    publicationTitle?: string;
    volume?: string;
    issue?: string;
    pages?: string;
    date?: string;
    DOI?: string;
    ISSN?: string;
    ISBN?: string;
    url?: string;
    accessDate?: string;
    language?: string;
    tags?: Array<{ tag: string; type?: number }>;
    collections?: string[];
    dateAdded?: string;
    dateModified?: string;
    // Attachment-specific
    parentItem?: string;
    linkMode?: string;
    contentType?: string;
    filename?: string;
    md5?: string;
    mtime?: number;
  };
  meta?: {
    creatorSummary?: string;
    parsedDate?: string;
    numChildren?: number;
  };
}

export interface ZoteroCollection {
  key: string;
  version: number;
  data: {
    key: string;
    version: number;
    name: string;
    parentCollection?: string | false;
  };
  meta: {
    numCollections: number;
    numItems: number;
  };
}

export interface ZoteroSyncResult {
  items: ZoteroItem[];
  collections: ZoteroCollection[];
  deletedItems: string[];
  deletedCollections: string[];
  newVersion: number;
}

export class ZoteroClient {
  private apiKey: string;
  private userId: string;

  constructor(apiKey: string, userId: string) {
    this.apiKey = apiKey;
    this.userId = userId;
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${ZOTERO_API_BASE}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Zotero-API-Key': this.apiKey,
        'Zotero-API-Version': API_VERSION,
        ...options.headers,
      },
    });

    // Handle rate limiting
    const backoff = response.headers.get('Backoff');
    if (backoff) {
      console.log(`[Zotero] Backoff requested: ${backoff}s`);
      await this.sleep(parseInt(backoff) * 1000);
    }

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || '60';
      console.log(`[Zotero] Rate limited, waiting ${retryAfter}s`);
      await this.sleep(parseInt(retryAfter) * 1000);
      return this.fetch(endpoint, options);
    }

    if (!response.ok) {
      throw new Error(`Zotero API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private async fetchWithHeaders<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T; headers: Headers }> {
    const url = `${ZOTERO_API_BASE}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Zotero-API-Key': this.apiKey,
        'Zotero-API-Version': API_VERSION,
        ...options.headers,
      },
    });

    if (response.status === 304) {
      return { data: [] as unknown as T, headers: response.headers };
    }

    if (!response.ok) {
      throw new Error(`Zotero API error: ${response.status} ${response.statusText}`);
    }

    return { data: await response.json(), headers: response.headers };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Verify API key and get user info
   */
  async verifyKey(): Promise<{ userId: string; username: string }> {
    const response = await this.fetch<{
      userID: number;
      username: string;
      access: { user: { library: boolean } };
    }>('/keys/current');

    return {
      userId: response.userID.toString(),
      username: response.username,
    };
  }

  /**
   * Get all items (handles pagination)
   */
  async getAllItems(since?: number): Promise<{ items: ZoteroItem[]; version: number }> {
    const allItems: ZoteroItem[] = [];
    let start = 0;
    const limit = 100;
    let totalResults = Infinity;
    let lastVersion = 0;

    const sinceParam = since !== undefined ? `&since=${since}` : '';

    while (start < totalResults) {
      const { data, headers } = await this.fetchWithHeaders<ZoteroItem[]>(
        `/users/${this.userId}/items?limit=${limit}&start=${start}${sinceParam}`
      );

      if (data.length === 0) break;

      totalResults = parseInt(headers.get('Total-Results') || '0');
      lastVersion = parseInt(headers.get('Last-Modified-Version') || '0');

      allItems.push(...data);
      start += limit;

      // Small delay between requests
      await this.sleep(100);
    }

    return { items: allItems, version: lastVersion };
  }

  /**
   * Get top-level items only (no attachments/notes)
   */
  async getTopLevelItems(since?: number): Promise<{ items: ZoteroItem[]; version: number }> {
    const allItems: ZoteroItem[] = [];
    let start = 0;
    const limit = 100;
    let totalResults = Infinity;
    let lastVersion = 0;

    const sinceParam = since !== undefined ? `&since=${since}` : '';

    while (start < totalResults) {
      const { data, headers } = await this.fetchWithHeaders<ZoteroItem[]>(
        `/users/${this.userId}/items/top?limit=${limit}&start=${start}${sinceParam}`
      );

      if (data.length === 0) break;

      totalResults = parseInt(headers.get('Total-Results') || '0');
      lastVersion = parseInt(headers.get('Last-Modified-Version') || '0');

      allItems.push(...data);
      start += limit;

      await this.sleep(100);
    }

    return { items: allItems, version: lastVersion };
  }

  /**
   * Get a specific item by key
   */
  async getItem(itemKey: string): Promise<ZoteroItem> {
    return this.fetch<ZoteroItem>(`/users/${this.userId}/items/${itemKey}`);
  }

  /**
   * Get children of an item (attachments, notes)
   */
  async getItemChildren(itemKey: string): Promise<ZoteroItem[]> {
    return this.fetch<ZoteroItem[]>(`/users/${this.userId}/items/${itemKey}/children`);
  }

  /**
   * Get all collections
   */
  async getCollections(since?: number): Promise<{ collections: ZoteroCollection[]; version: number }> {
    const sinceParam = since !== undefined ? `?since=${since}` : '';
    const { data, headers } = await this.fetchWithHeaders<ZoteroCollection[]>(
      `/users/${this.userId}/collections${sinceParam}`
    );

    return {
      collections: data,
      version: parseInt(headers.get('Last-Modified-Version') || '0'),
    };
  }

  /**
   * Get deleted items since a version
   */
  async getDeleted(since: number): Promise<{ items: string[]; collections: string[] }> {
    const data = await this.fetch<{ items: string[]; collections: string[]; tags: string[] }>(
      `/users/${this.userId}/deleted?since=${since}`
    );

    return {
      items: data.items || [],
      collections: data.collections || [],
    };
  }

  /**
   * Download attachment file
   * Returns the file as a Buffer
   */
  async downloadAttachment(itemKey: string): Promise<{ buffer: Buffer; filename: string; contentType: string }> {
    const url = `${ZOTERO_API_BASE}/users/${this.userId}/items/${itemKey}/file`;

    const response = await fetch(url, {
      headers: {
        'Zotero-API-Key': this.apiKey,
        'Zotero-API-Version': API_VERSION,
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`Failed to download attachment: ${response.status}`);
    }

    const contentDisposition = response.headers.get('Content-Disposition') || '';
    const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
    const filename = filenameMatch ? filenameMatch[1] : `${itemKey}.pdf`;
    const contentType = response.headers.get('Content-Type') || 'application/octet-stream';

    const arrayBuffer = await response.arrayBuffer();
    return {
      buffer: Buffer.from(arrayBuffer),
      filename,
      contentType,
    };
  }

  /**
   * Perform a full sync (get everything since last version)
   */
  async sync(lastVersion: number = 0): Promise<ZoteroSyncResult> {
    console.log(`[Zotero] Syncing since version ${lastVersion}`);

    // Get items and collections in parallel
    const [itemsResult, collectionsResult] = await Promise.all([
      this.getTopLevelItems(lastVersion > 0 ? lastVersion : undefined),
      this.getCollections(lastVersion > 0 ? lastVersion : undefined),
    ]);

    // Get deleted items if we have a previous version
    let deletedItems: string[] = [];
    let deletedCollections: string[] = [];

    if (lastVersion > 0) {
      const deleted = await this.getDeleted(lastVersion);
      deletedItems = deleted.items;
      deletedCollections = deleted.collections;
    }

    const newVersion = Math.max(itemsResult.version, collectionsResult.version);

    console.log(`[Zotero] Sync complete: ${itemsResult.items.length} items, ${collectionsResult.collections.length} collections`);

    return {
      items: itemsResult.items,
      collections: collectionsResult.collections,
      deletedItems,
      deletedCollections,
      newVersion,
    };
  }

  /**
   * Check if an item type is importable (has bibliographic data)
   */
  static isImportableItemType(itemType: string): boolean {
    const importableTypes = [
      'journalArticle',
      'book',
      'bookSection',
      'conferencePaper',
      'thesis',
      'report',
      'preprint',
      'manuscript',
      'patent',
      'computerProgram',
      'dataset',
    ];
    return importableTypes.includes(itemType);
  }

  /**
   * Extract DOI from item
   */
  static extractDOI(item: ZoteroItem): string | null {
    // Check DOI field
    if (item.data.DOI) {
      return item.data.DOI.replace(/^https?:\/\/doi\.org\//i, '');
    }

    // Check URL for DOI
    if (item.data.url) {
      const match = item.data.url.match(/doi\.org\/(.+)$/i);
      if (match) return match[1];
    }

    return null;
  }

  /**
   * Convert Zotero creators to author objects
   */
  static convertCreators(creators: ZoteroItem['data']['creators']): Array<{ name: string; type: string }> {
    if (!creators) return [];

    return creators.map(creator => ({
      name: creator.name || `${creator.firstName || ''} ${creator.lastName || ''}`.trim(),
      type: creator.creatorType,
    }));
  }
}
