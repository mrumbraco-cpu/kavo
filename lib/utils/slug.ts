export function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .normalize('NFD') // Separate base characters from accents
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9 -]/g, '') // Remove invalid chars
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/-+/g, '-'); // Replace multiple - with single -
}

export function generateListingSlug(title: string, id: string): string {
    const slug = slugify(title);
    return `${slug}-${id}`;
}

export function extractIdFromSlug(slug: string): string | null {
    // UUID format: 8-4-4-4-12 characters
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    const match = slug.match(uuidRegex);
    return match ? match[0] : null;
}
