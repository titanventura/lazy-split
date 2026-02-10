import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: splitId } = await params;
        const body = await request.json();
        const { name } = body;

        if (!name || !name.trim()) {
            return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
        }

        // Check if split exists
        const { data: split, error: splitError } = await supabase
            .from('splits')
            .select('id')
            .eq('id', splitId)
            .single();

        if (splitError || !split) {
            return NextResponse.json({ success: false, error: 'Split not found' }, { status: 404 });
        }

        // Check if name already exists (case-insensitive search in Supabase usually needs ilike or a specific collation, but for MVP we can use eq and handle it)
        const { data: existing, error: existingError } = await supabase
            .from('participants')
            .select('*')
            .eq('split_id', splitId)
            .ilike('name', name.trim())
            .maybeSingle();

        if (existing) {
            return NextResponse.json({
                success: true,
                data: {
                    participantId: existing.id,
                    name: existing.name,
                    hasPaid: existing.has_paid,
                    isExisting: true
                }
            });
        }

        // Create new participant
        const { data: participant, error: partError } = await supabase
            .from('participants')
            .insert({
                split_id: splitId,
                name: name.trim()
            })
            .select()
            .single();

        if (partError) throw partError;

        return NextResponse.json({
            success: true,
            data: {
                participantId: participant.id,
                name: participant.name,
                hasPaid: false
            }
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error adding participant:', error);
        return NextResponse.json({ success: false, error: error.message || 'Failed to add participant' }, { status: 500 });
    }
}
