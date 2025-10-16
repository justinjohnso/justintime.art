/**
 * Notion Webhook Endpoint
 * 
 * Receives webhook notifications from Notion when content is published or updated
 * Triggers sync process to update portfolio content
 */

import type { APIRoute } from 'astro';
import { verifyNotionSignature, rateLimiter, validateEnvVars } from '../../lib/webhook/security';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Validate environment variables
    validateEnvVars({
      NOTION_WEBHOOK_SECRET: import.meta.env.NOTION_WEBHOOK_SECRET,
    });

    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimiter.isAllowed(clientIp, 10, 60)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get signature from header
    const signature = request.headers.get('notion-signature');
    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing signature' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get raw body for signature verification
    const rawBody = await request.text();

    // Verify signature
    const isValid = verifyNotionSignature(
      rawBody,
      signature,
      import.meta.env.NOTION_WEBHOOK_SECRET
    );

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse webhook payload
    const payload = JSON.parse(rawBody);

    // Log webhook event (for debugging)
    console.log('[Notion Webhook] Received event:', {
      type: payload.type,
      pageId: payload.page_id,
      timestamp: new Date().toISOString(),
    });

    // Handle different event types
    switch (payload.type) {
      case 'page.created':
      case 'page.updated':
        // Trigger sync for this specific page
        await handlePageUpdate(payload.page_id, payload.database_id);
        break;

      case 'page.deleted':
        await handlePageDeletion(payload.page_id);
        break;

      default:
        console.log('[Notion Webhook] Unhandled event type:', payload.type);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Notion Webhook] Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * Handle page creation or update
 * Triggers sync process for the specific page
 */
async function handlePageUpdate(pageId: string, databaseId: string): Promise<void> {
  console.log(`[Notion Webhook] Syncing page ${pageId} from database ${databaseId}`);
  
  // TODO: Implement sync logic
  // This will:
  // 1. Fetch page content from Notion API
  // 2. Transform to MDX format
  // 3. Download/update media files
  // 4. Write to src/content/projects/ or src/content/posts/
  // 5. Optionally trigger git commit
  // 6. Trigger rebuild (if on deployment platform)
  
  // For now, just log
  console.log('[Notion Webhook] Sync logic not yet implemented');
}

/**
 * Handle page deletion
 * Removes corresponding MDX file
 */
async function handlePageDeletion(pageId: string): Promise<void> {
  console.log(`[Notion Webhook] Deleting page ${pageId}`);
  
  // TODO: Implement deletion logic
  // This will:
  // 1. Find corresponding MDX file by Notion page ID
  // 2. Delete MDX file
  // 3. Delete associated media files
  // 4. Optionally trigger git commit
  // 5. Trigger rebuild
  
  // For now, just log
  console.log('[Notion Webhook] Deletion logic not yet implemented');
}
