/**
 * TypeScript Types for Notion Database Responses
 * 
 * Based on actual Notion database structure documented in:
 * docs/planning/NOTION_SCHEMA_MAPPING.md
 */

/**
 * Notion Database: Portfolio Projects
 * Database ID: (from env NOTION_PROJECTS_DB)
 */
export interface NotionProjectPage {
  id: string;
  created_time: string;
  last_edited_time: string;
  properties: {
    // Title field (required)
    Title: {
      type: 'title';
      title: Array<{
        plain_text: string;
        href?: string | null;
      }>;
    };

    // Categories (Multi-select)
    Categories: {
      type: 'multi_select';
      multi_select: Array<{
        id: string;
        name: string;
        color: string;
      }>;
    };

    // Description (Text)
    Description: {
      type: 'rich_text';
      rich_text: Array<{
        plain_text: string;
        href?: string | null;
      }>;
    };

    // Hero Image File
    'Hero Image File': {
      type: 'files';
      files: Array<{
        name: string;
        type: 'file';
        file: {
          url: string;
          expiry_time: string;
        };
      }>;
    };

    // Additional Image Files
    'Additional Image Files': {
      type: 'files';
      files: Array<{
        name: string;
        type: 'file';
        file: {
          url: string;
          expiry_time: string;
        };
      }>;
    };

    // Media Embed (URL/Text)
    'Media Embed': {
      type: 'rich_text';
      rich_text: Array<{
        plain_text: string;
      }>;
    };

    // Slug (Text)
    Slug: {
      type: 'rich_text';
      rich_text: Array<{
        plain_text: string;
      }>;
    };

    // Status (Select)
    Status: {
      type: 'select';
      select: {
        id: string;
        name: 'Published' | 'Draft' | 'Archived';
        color: string;
      } | null;
    };

    // Year (Number)
    Year: {
      type: 'number';
      number: number | null;
    };

    // Links (Rich Text) - needs parsing
    'Links (Rich Text)': {
      type: 'rich_text';
      rich_text: Array<{
        plain_text: string;
        href?: string | null;
      }>;
    };
  };
}

/**
 * Notion Database: Blog Posts (Future)
 */
export interface NotionBlogPost {
  id: string;
  created_time: string;
  last_edited_time: string;
  properties: {
    Title: {
      type: 'title';
      title: Array<{ plain_text: string }>;
    };
    
    Slug: {
      type: 'rich_text';
      rich_text: Array<{ plain_text: string }>;
    };

    Date: {
      type: 'date';
      date: {
        start: string;
        end?: string | null;
      } | null;
    };

    Description: {
      type: 'rich_text';
      rich_text: Array<{ plain_text: string }>;
    };

    Categories: {
      type: 'multi_select';
      multi_select: Array<{
        id: string;
        name: string;
        color: string;
      }>;
    };

    'Featured Image': {
      type: 'files';
      files: Array<{
        name: string;
        file: {
          url: string;
          expiry_time: string;
        };
      }>;
    };

    Status: {
      type: 'select';
      select: {
        name: 'Published' | 'Draft';
      } | null;
    };
  };
}

/**
 * Notion Block Types
 * Used for page content
 */
export interface NotionBlock {
  id: string;
  type: string;
  created_time: string;
  last_edited_time: string;
  has_children: boolean;
}

export interface NotionParagraphBlock extends NotionBlock {
  type: 'paragraph';
  paragraph: {
    rich_text: Array<NotionRichText>;
    color: string;
  };
}

export interface NotionHeadingBlock extends NotionBlock {
  type: 'heading_1' | 'heading_2' | 'heading_3';
  heading_1?: { rich_text: Array<NotionRichText> };
  heading_2?: { rich_text: Array<NotionRichText> };
  heading_3?: { rich_text: Array<NotionRichText> };
}

export interface NotionImageBlock extends NotionBlock {
  type: 'image';
  image: {
    type: 'file' | 'external';
    file?: {
      url: string;
      expiry_time: string;
    };
    external?: {
      url: string;
    };
    caption: Array<NotionRichText>;
  };
}

export interface NotionCodeBlock extends NotionBlock {
  type: 'code';
  code: {
    rich_text: Array<NotionRichText>;
    language: string;
    caption: Array<NotionRichText>;
  };
}

export interface NotionBulletedListBlock extends NotionBlock {
  type: 'bulleted_list_item';
  bulleted_list_item: {
    rich_text: Array<NotionRichText>;
    color: string;
  };
}

export interface NotionNumberedListBlock extends NotionBlock {
  type: 'numbered_list_item';
  numbered_list_item: {
    rich_text: Array<NotionRichText>;
    color: string;
  };
}

/**
 * Notion Rich Text Object
 */
export interface NotionRichText {
  type: 'text';
  text: {
    content: string;
    link: {
      url: string;
    } | null;
  };
  annotations: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
  };
  plain_text: string;
  href: string | null;
}

/**
 * Portfolio Types (Target Schema)
 */
export interface PortfolioProject {
  title: string;
  description?: string;
  image?: string;
  mediaEmbed?: string;
  categories?: string[];
  yearCompleted?: number;
  dateCompleted?: string;
  links?: Array<{
    title: string;
    url: string;
    type?: 'github' | 'live' | 'demo' | 'other';
  }>;
  additionalImages?: string[];
  body: string; // MDX content
}

export interface PortfolioBlogPost {
  title: string;
  description?: string;
  date: string;
  categories?: string[];
  featuredImage?: string;
  body: string; // MDX content
}

/**
 * Mapping Configuration
 */
export interface NotionToPortfolioMapping {
  notionField: string;
  portfolioField: string;
  transformer?: (value: any) => any;
  required?: boolean;
}
