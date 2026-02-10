import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { id, name, upi_id } = await req.json();

        if (!name) {
            return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
        }

        let query;
        if (id) {
            // Update existing user
            query = supabase.from('users').upsert({ id, name, upi_id: upi_id || null }).select().single();
        } else {
            // Create new user
            query = supabase.from('users').insert({ name, upi_id: upi_id || null }).select().single();
        }

        const { data, error } = await query;

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('User Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to process user' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('User Fetch Error:', error);
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
}
