import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { description, totalAmount, numberOfPeople, creatorName, creatorUpiId, participantNames } = body;

        // Basic validation
        if (!description || !totalAmount || !numberOfPeople || !creatorName || !creatorUpiId) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const splitId = uuidv4();
        const perPersonAmount = Math.floor(totalAmount / numberOfPeople);

        // Create split
        db.prepare(`
      INSERT INTO splits (id, description, total_amount, number_of_people, per_person_amount, creator_name, creator_upi_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(splitId, description, totalAmount, numberOfPeople, perPersonAmount, creatorName, creatorUpiId);

        // Add participants if provided
        if (participantNames && Array.isArray(participantNames)) {
            const insertParticipant = db.prepare(`
        INSERT INTO participants (id, split_id, name) VALUES (?, ?, ?)
      `);
            for (const name of participantNames) {
                if (name.trim()) {
                    insertParticipant.run(uuidv4(), splitId, name.trim());
                }
            }
        }

        return NextResponse.json({
            success: true,
            data: { id: splitId }
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating split:', error);
        return NextResponse.json({ success: false, error: 'Failed to create split' }, { status: 500 });
    }
}
