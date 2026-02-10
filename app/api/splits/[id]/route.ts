import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const split = db.prepare(`
      SELECT * FROM splits WHERE id = ?
    `).get(id) as {
            id: string;
            description: string;
            total_amount: number;
            number_of_people: number;
            per_person_amount: number;
            creator_name: string;
            creator_upi_id: string;
            created_at: string;
        } | undefined;

        if (!split) {
            return NextResponse.json({ success: false, error: 'Split not found' }, { status: 404 });
        }

        const participants = db.prepare(`
      SELECT * FROM participants WHERE split_id = ?
    `).all(id) as Array<{
            id: string;
            split_id: string;
            name: string;
            has_paid: number;
            marked_paid_at: string | null;
        }>;

        const paidCount = participants.filter(p => p.has_paid === 1).length;

        return NextResponse.json({
            success: true,
            data: {
                id: split.id,
                description: split.description,
                totalAmount: split.total_amount,
                numberOfPeople: split.number_of_people,
                perPersonAmount: split.per_person_amount,
                creatorName: split.creator_name,
                creatorUpiId: split.creator_upi_id,
                createdAt: split.created_at,
                participants: participants.map(p => ({
                    id: p.id,
                    name: p.name,
                    hasPaid: p.has_paid === 1,
                    markedPaidAt: p.marked_paid_at
                })),
                stats: {
                    totalPaid: paidCount,
                    totalPending: participants.length - paidCount,
                    amountCollected: paidCount * split.per_person_amount
                }
            }
        });

    } catch (error) {
        console.error('Error fetching split:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch split' }, { status: 500 });
    }
}
