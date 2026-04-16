import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();

  if (!user) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { address } = await req.json();
  if (!address) {
    return Response.json({ error: 'Endereço obrigatório' }, { status: 400 });
  }

  const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== 'OK' || !data.results.length) {
    return Response.json({ error: 'Endereço não encontrado', status: data.status }, { status: 404 });
  }

  const { lat, lng } = data.results[0].geometry.location;
  const formattedAddress = data.results[0].formatted_address;

  return Response.json({ lat, lng, formattedAddress });
});