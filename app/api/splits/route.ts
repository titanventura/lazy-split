import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
        }

        // Fetch splits where the user is either the creator or a participant
        const { data: participantSplits, error: partError } = await supabase
            .from('participants')
            .select('split_id')
            .eq('user_id', userId);

        if (partError) throw partError;

        const splitIds = participantSplits.map(p => p.split_id);

        const { data: splits, error: splitError } = await supabase
            .from('splits')
            .select('*')
            .or(`creator_id.eq.${userId},id.in.(${splitIds.length > 0 ? splitIds.join(',') : '00000000-0000-0000-0000-000000000000'})`)
            .order('created_at', { ascending: false });

        if (splitError) throw splitError;

        return NextResponse.json({ success: true, data: splits });
    } catch (error: any) {
        console.error('Error fetching splits:', error);
        return NextResponse.json({ success: false, error: error.message || 'Failed to fetch splits' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { description, totalAmount, numberOfPeople, creatorName, creatorUpiId, creatorId, participantNames } = body;

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
                creator_upi_id: creatorUpiId,
                creator_id: creatorId || null
            })
            .select()
            .single();

        if (splitError) throw splitError;

        const splitId = split.id;

        // Add creator as a participant automatically
        const participantsToInsert: any[] = [{
            split_id: splitId,
            name: creatorName.trim(),
            user_id: creatorId || null
        }];

        // Add other participants if provided
        if (participantNames && Array.isArray(participantNames)) {
            participantNames
                .filter(name => name.trim() && name.trim() !== creatorName.trim())
                .forEach(name => {
                    participantsToInsert.push({
                        split_id: splitId,
                        name: name.trim()
                    });
                });
        }

        if (participantsToInsert.length > 0) {
            const { error: partError } = await supabase
                .from('participants')
                .insert(participantsToInsert);

            if (partError) throw partError;
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
