import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

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
        const split = db.prepare('SELECT * FROM splits WHERE id = ?').get(splitId);
        if (!split) {
            return NextResponse.json({ success: false, error: 'Split not found' }, { status: 404 });
        }

        // Check if name already exists (case-insensitive)
        const existing = db.prepare(`
      SELECT * FROM participants WHERE split_id = ? AND LOWER(name) = LOWER(?)
    `).get(splitId, name.trim()) as { id: string; name: string; has_paid: number } | undefined;

        if (existing) {
            return NextResponse.json({
                success: true,
                data: {
                    participantId: existing.id,
                    name: existing.name,
                    hasPaid: existing.has_paid === 1,
                    isExisting: true
                }
            });
        }

        // Create new participant
        const participantId = uuidv4();
        db.prepare(`
      INSERT INTO participants (id, split_id, name) VALUES (?, ?, ?)
    `).run(participantId, splitId, name.trim());

        return NextResponse.json({
            success: true,
            data: {
                participantId,
                name: name.trim(),
                hasPaid: false
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Error adding participant:', error);
        return NextResponse.json({ success: false, error: 'Failed to add participant' }, { status: 500 });
    }
}
