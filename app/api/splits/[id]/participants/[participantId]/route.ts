import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; participantId: string }> }
) {
    try {
        const { participantId } = await params;
        const body = await request.json();
        const { hasPaid } = body;

        if (typeof hasPaid !== 'boolean') {
            return NextResponse.json({ success: false, error: 'hasPaid must be a boolean' }, { status: 400 });
        }

        // Check if participant exists
        const { data: participant, error: partError } = await supabase
            .from('participants')
            .select('id, name')
            .eq('id', participantId)
            .single();

        if (partError || !participant) {
            return NextResponse.json({ success: false, error: 'Participant not found' }, { status: 404 });
        }

        const markedPaidAt = hasPaid ? new Date().toISOString() : null;

        const { error: updateError } = await supabase
            .from('participants')
            .update({
                has_paid: hasPaid,
                marked_paid_at: markedPaidAt
            })
            .eq('id', participantId);

        if (updateError) throw updateError;

        return NextResponse.json({
            success: true,
            data: {
                participantId,
                name: participant.name,
                hasPaid,
                markedPaidAt
            }
        });

    } catch (error: any) {
        console.error('Error updating participant:', error);
        return NextResponse.json({ success: false, error: error.message || 'Failed to update participant' }, { status: 500 });
    }
}
