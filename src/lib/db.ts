import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export type Request = {
  id: string;
  subcontractor: string;
  section: string;
  date: string;
  time: string;
  accompanying: string;
  reason: string;
  demandeurEmail: string;
  n1Email: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  approvals: {
    HSE: { status: string; approvedAt: string | null; secretCode: string };
    RH: { status: string; approvedAt: string | null; secretCode: string };
    Direction: { status: string; approvedAt: string | null; secretCode: string };
    N1: { status: string; approvedAt: string | null; secretCode: string };
  };
};

export async function getDb(): Promise<{ requests: Request[] }> {
  const { data, error } = await supabase
    .from('requests')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Supabase getDb error:', error);
    return { requests: [] };
  }

  return { requests: data as Request[] };
}

export async function saveDb(data: { requests: Request[] }) {
  // Non utilisé avec Supabase — les écritures se font directement
  console.warn('saveDb called — use direct Supabase inserts/updates instead');
}

export async function insertRequest(request: Request) {
  const { error } = await supabase
    .from('requests')
    .insert([request]);

  if (error) throw error;
}

export async function updateRequest(id: string, updates: Partial<Request>) {
  const { error } = await supabase
    .from('requests')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

export async function getRequestById(id: string): Promise<Request | null> {
  const { data, error } = await supabase
    .from('requests')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as Request;
}