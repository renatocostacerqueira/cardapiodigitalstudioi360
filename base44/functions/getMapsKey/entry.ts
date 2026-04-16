import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();

  if (!user) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
  if (!apiKey) {
    return Response.json({ error: 'Chave de API não configurada' }, { status: 500 });
  }

  return Response.json({ apiKey });
});