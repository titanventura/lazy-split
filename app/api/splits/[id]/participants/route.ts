import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: splitId } = await params;
        const body = await request.json();
        const { name, userId } = body;

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

        // Check if name or userId already exists
        let query = supabase.from('participants').select('*').eq('split_id', splitId);

        if (userId) {
            query = query.or(`user_id.eq.${userId},name.ilike."${name.trim()}"`);
        } else {
            query = query.ilike('name', name.trim());
        }

        const { data: existing, error: existingError } = await query.maybeSingle();

        if (existing) {
            // Update userId if it wasn't set
            if (userId && !existing.user_id) {
                await supabase.from('participants').update({ user_id: userId }).eq('id', existing.id);
            }

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
                name: name.trim(),
                user_id: userId || null
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
