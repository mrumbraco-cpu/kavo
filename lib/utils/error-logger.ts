import { createServiceRoleClient } from '@/lib/supabase/server'

/**
 * Logs an error to the error_logs table in Supabase.
 * This should be used on the server side only.
 */
export async function logError(
    actionType: string,
    error: any,
    metadata: any = {},
    userId?: string | null
) {
    try {
        const supabase = createServiceRoleClient()
        const { error: logError } = await supabase.from('error_logs').insert({
            user_id: userId || null,
            action_type: actionType,
            error_message: error instanceof Error ? error.message : String(error),
            error_stack: error instanceof Error ? error.stack : null,
            metadata: metadata,
            status: 'new'
        })

        if (logError) {
            console.error('Failed to insert error log:', logError)
        }
    } catch (err) {
        console.error('Error in logError utility:', err)
    }
}
