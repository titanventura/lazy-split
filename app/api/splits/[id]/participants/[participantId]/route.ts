import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

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

        const participant = db.prepare('SELECT * FROM participants WHERE id = ?').get(participantId) as {
            id: string;
            name: string;
            has_paid: number;
        } | undefined;

        if (!participant) {
            return NextResponse.json({ success: false, error: 'Participant not found' }, { status: 404 });
        }

        const markedPaidAt = hasPaid ? new Date().toISOString() : null;

        db.prepare(`
      UPDATE participants SET has_paid = ?, marked_paid_at = ? WHERE id = ?
    `).run(hasPaid ? 1 : 0, markedPaidAt, participantId);

        return NextResponse.json({
            success: true,
            data: {
                participantId,
                name: participant.name,
                hasPaid,
                markedPaidAt
            }
        });

    } catch (error) {
        console.error('Error updating participant:', error);
        return NextResponse.json({ success: false, error: 'Failed to update participant' }, { status: 500 });
    }
}
