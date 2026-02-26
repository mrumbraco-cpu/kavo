import { Listing } from "@/types/listing";
import { generateListingSlug } from "./slug";

/**
 * Generates the public URL for a listing detail page.
 */
export function getListingUrl(listing: Pick<Listing, 'id' | 'title'>): string {
    const slug = generateListingSlug(listing.title, listing.id);
    return `/listings/${slug}`;
}

/**
 * Extracts the listing ID from a slug.
 * Supported formats:
 * - {slug}-{uuid}
 * - {uuid} (for backward compatibility)
 */
export function parseListingIdFromSlug(slug: string): string {
    // UUID format: 8-4-4-4-12 characters
    const uuidRegex = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;
    const match = slug.match(uuidRegex);
    if (match) {
        return match[1];
    }
    // Fallback: if the slug itself is a UUID
    return slug;
}
