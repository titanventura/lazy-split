import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Fetch split with its participants in one go
        const { data: split, error } = await supabase
            .from('splits')
            .select(`
                *,
                participants (*)
            `)
            .eq('id', id)
            .single();

        if (error || !split) {
            return NextResponse.json({ success: false, error: 'Split not found' }, { status: 404 });
        }

        const participants = split.participants || [];
        const paidCount = participants.filter((p: any) => p.has_paid === true).length;

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
                participants: participants.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    hasPaid: p.has_paid,
                    markedPaidAt: p.marked_paid_at
                })),
                stats: {
                    totalPaid: paidCount,
                    totalPending: participants.length - paidCount,
                    amountCollected: paidCount * split.per_person_amount
                }
            }
        });

    } catch (error: any) {
        console.error('Error fetching split:', error);
        return NextResponse.json({ success: false, error: error.message || 'Failed to fetch split' }, { status: 500 });
    }
}
