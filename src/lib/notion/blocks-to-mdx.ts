/**
 * Notion Blocks to MDX Converter
 * 
 * Converts Notion block content to MDX format for Astro content collections
 */

import type {
  NotionBlock,
  NotionParagraphBlock,
  NotionHeadingBlock,
  NotionImageBlock,
  NotionCodeBlock,
  NotionBulletedListBlock,
  NotionNumberedListBlock,
  NotionRichText,
} from '../../types/notion';

/**
 * Convert Notion blocks to MDX string
 * 
 * @param blocks - Array of Notion blocks from API
 * @returns MDX content string
 */
export async function blocksToMDX(blocks: NotionBlock[]): Promise<string> {
  const mdxParts: string[] = [];
  let inList = false;
  let listType: 'bulleted' | 'numbered' | null = null;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const nextBlock = blocks[i + 1];

    // Check if we're exiting a list
    if (inList && nextBlock && 
        nextBlock.type !== 'bulleted_list_item' && 
        nextBlock.type !== 'numbered_list_item') {
      inList = false;
      listType = null;
      mdxParts.push(''); // Add blank line after list
    }

    const converted = convertBlock(block);
    if (converted) {
      // Check if entering a list
      if ((block.type === 'bulleted_list_item' || block.type === 'numbered_list_item') && !inList) {
        inList = true;
        listType = block.type === 'bulleted_list_item' ? 'bulleted' : 'numbered';
        mdxParts.push(''); // Add blank line before list
      }

      mdxParts.push(converted);
    }
  }

  return mdxParts.join('\n');
}

/**
 * Convert a single Notion block to MDX
 */
function convertBlock(block: NotionBlock): string | null {
  switch (block.type) {
    case 'paragraph':
      return convertParagraph(block as NotionParagraphBlock);
    
    case 'heading_1':
    case 'heading_2':
    case 'heading_3':
      return convertHeading(block as NotionHeadingBlock);
    
    case 'bulleted_list_item':
      return convertBulletedList(block as NotionBulletedListBlock);
    
    case 'numbered_list_item':
      return convertNumberedList(block as NotionNumberedListBlock);
    
    case 'code':
      return convertCode(block as NotionCodeBlock);
    
    case 'image':
      return convertImage(block as NotionImageBlock);
    
    case 'divider':
      return '\n---\n';
    
    default:
      console.warn(`[Notion MDX] Unsupported block type: ${block.type}`);
      return null;
  }
}

/**
 * Convert paragraph block
 */
function convertParagraph(block: NotionParagraphBlock): string {
  const text = richTextToMarkdown(block.paragraph.rich_text);
  return text ? `${text}\n` : '';
}

/**
 * Convert heading block
 */
function convertHeading(block: NotionHeadingBlock): string {
  const level = block.type === 'heading_1' ? 1 : 
                block.type === 'heading_2' ? 2 : 3;
  
  const richText = block.type === 'heading_1' ? block.heading_1?.rich_text :
                   block.type === 'heading_2' ? block.heading_2?.rich_text :
                   block.heading_3?.rich_text;
  
  if (!richText) return '';
  
  const text = richTextToMarkdown(richText);
  const hashes = '#'.repeat(level);
  
  return `${hashes} ${text}\n`;
}

/**
 * Convert bulleted list item
 */
function convertBulletedList(block: NotionBulletedListBlock): string {
  const text = richTextToMarkdown(block.bulleted_list_item.rich_text);
  return `- ${text}`;
}

/**
 * Convert numbered list item
 */
function convertNumberedList(block: NotionNumberedListBlock): string {
  const text = richTextToMarkdown(block.numbered_list_item.rich_text);
  return `1. ${text}`;
}

/**
 * Convert code block
 */
function convertCode(block: NotionCodeBlock): string {
  const code = richTextToPlainText(block.code.rich_text);
  const language = block.code.language || '';
  
  return `\`\`\`${language}\n${code}\n\`\`\`\n`;
}

/**
 * Convert image block
 */
function convertImage(block: NotionImageBlock): string {
  let url: string;
  
  if (block.image.type === 'file') {
    url = block.image.file?.url || '';
  } else {
    url = block.image.external?.url || '';
  }
  
  const caption = block.image.caption.length > 0 
    ? richTextToPlainText(block.image.caption)
    : '';
  
  // Note: For Notion file URLs, these need to be downloaded and replaced
  // with local paths during sync process
  return `![${caption}](${url})\n`;
}

/**
 * Convert Notion rich text array to Markdown with formatting
 */
function richTextToMarkdown(richText: NotionRichText[]): string {
  return richText.map(rt => {
    let text = rt.plain_text;
    const { annotations } = rt;

    // Apply formatting
    if (annotations.code) {
      text = `\`${text}\``;
    }
    if (annotations.bold) {
      text = `**${text}**`;
    }
    if (annotations.italic) {
      text = `*${text}*`;
    }
    if (annotations.strikethrough) {
      text = `~~${text}~~`;
    }

    // Handle links
    if (rt.href) {
      text = `[${text}](${rt.href})`;
    }

    return text;
  }).join('');
}

/**
 * Convert Notion rich text array to plain text (no formatting)
 */
function richTextToPlainText(richText: NotionRichText[]): string {
  return richText.map(rt => rt.plain_text).join('');
}

/**
 * Process image URLs in MDX content
 * Replaces Notion temporary URLs with local paths
 * 
 * @param mdx - MDX content with Notion image URLs
 * @param replacements - Map of Notion URL to local path
 * @returns MDX with local image paths
 */
export function replaceImageUrls(
  mdx: string,
  replacements: Map<string, string>
): string {
  let processed = mdx;
  
  for (const [notionUrl, localPath] of replacements) {
    processed = processed.replace(notionUrl, localPath);
  }
  
  return processed;
}

/**
 * Extract image URLs from MDX content
 * Useful for downloading images before writing file
 * 
 * @param mdx - MDX content
 * @returns Array of image URLs
 */
export function extractImageUrls(mdx: string): string[] {
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const urls: string[] = [];
  let match;

  while ((match = imageRegex.exec(mdx)) !== null) {
    urls.push(match[2]);
  }

  return urls;
}
