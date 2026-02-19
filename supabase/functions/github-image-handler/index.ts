import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const GITHUB_PAT = Deno.env.get("GITHUB_PAT");
const GITHUB_OWNER = Deno.env.get("GITHUB_OWNER");
const GITHUB_REPO = Deno.env.get("GITHUB_REPO");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        console.log("DEBUG: Request received", req.method);

        // Check GitHub Config early
        if (!GITHUB_PAT || !GITHUB_OWNER || !GITHUB_REPO) {
            console.error("DEBUG: Missing Config:", {
                hasPAT: !!GITHUB_PAT,
                hasOwner: !!GITHUB_OWNER,
                hasRepo: !!GITHUB_REPO
            });
            throw new Error("Missing GitHub configuration (PAT, OWNER, or REPO)");
        }

        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            throw new Error('Missing Authorization header');
        }

        const token = authHeader.replace('Bearer ', '');

        // Use a custom secret name for internal service-to-service calls
        // because SUPABASE_SERVICE_ROLE_KEY might be reserved or inaccessible.
        const internalSecretEnv = Deno.env.get("INTERNAL_SECRET_KEY");
        const isServiceRole = internalSecretEnv ? (token === internalSecretEnv) : false;

        console.log("DEBUG: isServiceRole:", isServiceRole);

        const supabaseClient = createClient(
            SUPABASE_URL!,
            SUPABASE_ANON_KEY!,
            { global: { headers: { Authorization: authHeader } } }
        );

        let isAdmin = false;
        let user: any = null;

        if (!isServiceRole) {
            const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser();
            if (authError || !authUser) {
                console.error("DEBUG: Auth Error:", authError);
                throw new Error('Invalid or expired token');
            }
            user = authUser;

            const { data: profile } = await supabaseClient
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();
            isAdmin = profile?.role === 'admin';
            console.log("DEBUG: User Admin Status:", isAdmin);
        }

        // Parse Payload
        let body;
        try {
            body = await req.json();
        } catch (e) {
            throw new Error("Invalid JSON body");
        }

        const { action, listingId, fileName, content, sha } = body;
        console.log("DEBUG: Action:", action, "Listing:", listingId, "File:", fileName);

        if (!action || !listingId || !fileName) {
            throw new Error("Missing required fields: action, listingId, or fileName");
        }

        // Ownership check
        if (!isServiceRole && !isAdmin) {
            const { data: listing, error: listingError } = await supabaseClient
                .from('listings')
                .select('owner_id')
                .eq('id', listingId)
                .single();

            if (listingError || !listing || listing.owner_id !== user.id) {
                throw new Error('Permission denied: You do not own this listing');
            }
        }

        const path = `listings/${listingId}/${fileName}`;
        const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;

        if (action === "upload") {
            if (!content) throw new Error("Missing content for upload");

            const uploadBody = {
                message: `Upload image for listing ${listingId}`,
                content: content,
                branch: "main",
                ...(sha ? { sha } : {})
            };

            const res = await fetch(url, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${GITHUB_PAT}`,
                    "Content-Type": "application/json",
                    "Accept": "application/vnd.github.v3+json",
                    "User-Agent": "Supabase-Edge-Function"
                },
                body: JSON.stringify(uploadBody)
            });

            const data = await res.json();
            if (!res.ok) {
                console.error("DEBUG: GitHub API Error (Upload):", data);
                throw new Error(data.message || "GitHub Upload failed");
            }

            return new Response(JSON.stringify({
                url: `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${path}`
            }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        if (action === "delete") {
            let fileSha = sha;
            if (!fileSha) {
                const getRes = await fetch(url, {
                    headers: {
                        "Authorization": `Bearer ${GITHUB_PAT}`,
                        "Accept": "application/vnd.github.v3+json",
                        "User-Agent": "Supabase-Edge-Function"
                    }
                });

                if (getRes.ok) {
                    const getData = await getRes.json();
                    fileSha = getData.sha;
                } else if (getRes.status === 404) {
                    return new Response(JSON.stringify({ success: true, message: "File already deleted" }), {
                        headers: { ...corsHeaders, "Content-Type": "application/json" }
                    });
                } else {
                    throw new Error(`Failed to fetch file SHA from GitHub: ${getRes.status}`);
                }
            }

            if (!fileSha) throw new Error("SHA is required for deletion");

            const res = await fetch(url, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${GITHUB_PAT}`,
                    "Content-Type": "application/json",
                    "Accept": "application/vnd.github.v3+json",
                    "User-Agent": "Supabase-Edge-Function"
                },
                body: JSON.stringify({
                    message: `Delete image for listing ${listingId}`,
                    sha: fileSha,
                    branch: "main"
                })
            });

            const data = await res.json();
            if (!res.ok) {
                console.error("DEBUG: GitHub API Error (Delete):", data);
                throw new Error(data.message || "GitHub Deletion failed");
            }

            return new Response(JSON.stringify({ success: true }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        throw new Error("Invalid action provided");

    } catch (error) {
        console.error('DEBUG: Edge Function Error:', error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
});
