import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Formata número BR para o formato E.164 esperado pelo Twilio WhatsApp
function formatPhoneToWhatsApp(rawPhone) {
  if (!rawPhone) return null;
  const digits = rawPhone.replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('55') && digits.length >= 12) {
    return `whatsapp:+${digits}`;
  }
  if (digits.length === 10 || digits.length === 11) {
    return `whatsapp:+55${digits}`;
  }
  return `whatsapp:+${digits}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const { event, data, payload_too_large } = payload;

    console.log('[onOrderCreatedSendWhatsApp] Evento recebido:', event?.type, 'Order:', event?.entity_id);

    let order = data;
    if (payload_too_large || !order) {
      order = await base44.asServiceRole.entities.Order.get(event.entity_id);
    }

    if (!order) {
      console.error('[onOrderCreatedSendWhatsApp] Pedido não encontrado');
      return Response.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    if (!order.customer_phone) {
      console.log('[onOrderCreatedSendWhatsApp] Pedido sem telefone, pulando.');
      return Response.json({ skipped: 'no_phone' });
    }

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const fromNumber = Deno.env.get('TWILIO_WHATSAPP_FROM');
    const appId = Deno.env.get('BASE44_APP_ID');

    if (!accountSid || !authToken || !fromNumber) {
      console.error('[onOrderCreatedSendWhatsApp] Credenciais Twilio ausentes');
      return Response.json({ error: 'Credenciais Twilio ausentes' }, { status: 500 });
    }

    const toNumber = formatPhoneToWhatsApp(order.customer_phone);
    if (!toNumber) {
      return Response.json({ error: 'Telefone inválido' }, { status: 400 });
    }

    const baseUrl = `https://app.base44.com/apps/${appId}`;
    const trackingUrl = `${baseUrl}/tracking/${order.id}`;

    const message = `🍔 *Pedido ${order.order_number || ''} recebido!*

Olá, ${order.customer_name}! Seu pedido foi recebido e já está sendo processado.

🔗 Acompanhe em tempo real:
${trackingUrl}

💰 Total: R$ ${(order.total_price || 0).toFixed(2)}

Obrigado pela preferência!`;

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const auth = btoa(`${accountSid}:${authToken}`);
    const params = new URLSearchParams();
    params.append('From', fromNumber);
    params.append('To', toNumber);
    params.append('Body', message);

    const twilioRes = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const twilioData = await twilioRes.json();

    if (!twilioRes.ok) {
      console.error('[onOrderCreatedSendWhatsApp] Erro Twilio:', twilioData);
      return Response.json({ error: 'Erro Twilio', details: twilioData }, { status: 500 });
    }

    console.log('[onOrderCreatedSendWhatsApp] Enviado. SID:', twilioData.sid, 'Para:', toNumber);

    return Response.json({ success: true, sid: twilioData.sid });
  } catch (error) {
    console.error('[onOrderCreatedSendWhatsApp] Erro:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});