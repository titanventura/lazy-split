import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { description, totalAmount, numberOfPeople, creatorName, creatorUpiId, participantNames } = body;

        // Basic validation
        if (!description || !totalAmount || !numberOfPeople || !creatorName || !creatorUpiId) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const perPersonAmount = Math.floor(totalAmount / numberOfPeople);

        // Create split
        const { data: split, error: splitError } = await supabase
            .from('splits')
            .insert({
                description,
                total_amount: totalAmount,
                number_of_people: numberOfPeople,
                per_person_amount: perPersonAmount,
                creator_name: creatorName,
                creator_upi_id: creatorUpiId
            })
            .select()
            .single();

        if (splitError) throw splitError;

        const splitId = split.id;

        // Add participants if provided
        if (participantNames && Array.isArray(participantNames)) {
            const participantsToInsert = participantNames
                .filter(name => name.trim())
                .map(name => ({
                    split_id: splitId,
                    name: name.trim()
                }));

            if (participantsToInsert.length > 0) {
                const { error: partError } = await supabase
                    .from('participants')
                    .insert(participantsToInsert);

                if (partError) throw partError;
            }
        }

        return NextResponse.json({
            success: true,
            data: { id: splitId }
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating split:', error);
        return NextResponse.json({ success: false, error: error.message || 'Failed to create split' }, { status: 500 });
    }
}
