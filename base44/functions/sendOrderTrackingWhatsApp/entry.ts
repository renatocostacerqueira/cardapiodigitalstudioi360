import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Formata número BR para o formato E.164 esperado pelo Twilio WhatsApp
function formatPhoneToWhatsApp(rawPhone) {
  if (!rawPhone) return null;
  const digits = rawPhone.replace(/\D/g, '');
  if (!digits) return null;
  // Já tem código do país (começa com 55 e tem 12-13 dígitos)
  if (digits.startsWith('55') && digits.length >= 12) {
    return `whatsapp:+${digits}`;
  }
  // Número BR sem código do país (10 ou 11 dígitos)
  if (digits.length === 10 || digits.length === 11) {
    return `whatsapp:+55${digits}`;
  }
  // Outros formatos internacionais — adiciona + se não tiver
  return `whatsapp:+${digits}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { order_id } = body;

    if (!order_id) {
      return Response.json({ error: 'order_id é obrigatório' }, { status: 400 });
    }

    // Busca o pedido
    const order = await base44.asServiceRole.entities.Order.get(order_id);
    if (!order) {
      return Response.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    if (!order.customer_phone) {
      return Response.json({ error: 'Pedido sem telefone do cliente' }, { status: 400 });
    }

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const fromNumber = Deno.env.get('TWILIO_WHATSAPP_FROM');

    if (!accountSid || !authToken || !fromNumber) {
      return Response.json({ error: 'Credenciais do Twilio não configuradas' }, { status: 500 });
    }

    const toNumber = formatPhoneToWhatsApp(order.customer_phone);
    if (!toNumber) {
      return Response.json({ error: 'Telefone inválido' }, { status: 400 });
    }

    // Monta a URL de rastreamento
    const appId = Deno.env.get('BASE44_APP_ID');
    const origin = req.headers.get('origin') || req.headers.get('referer') || '';
    // Tenta usar o origin do request, senão monta a partir do app id
    let baseUrl = '';
    try {
      baseUrl = origin ? new URL(origin).origin : `https://app.base44.com/apps/${appId}`;
    } catch {
      baseUrl = `https://app.base44.com/apps/${appId}`;
    }
    const trackingUrl = `${baseUrl}/tracking/${order.id}`;

    const message = `🍔 *Pedido ${order.order_number || ''} recebido!*

Olá, ${order.customer_name}! Seu pedido foi recebido e já está sendo processado.

🔗 Acompanhe em tempo real:
${trackingUrl}

💰 Total: R$ ${(order.total_price || 0).toFixed(2)}

Obrigado pela preferência!`;

    // Chama a API do Twilio
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
      console.error('[sendOrderTrackingWhatsApp] Erro Twilio:', twilioData);
      return Response.json({
        error: 'Erro ao enviar WhatsApp',
        details: twilioData,
      }, { status: 500 });
    }

    console.log('[sendOrderTrackingWhatsApp] Mensagem enviada. SID:', twilioData.sid);

    return Response.json({
      success: true,
      message_sid: twilioData.sid,
      to: toNumber,
      tracking_url: trackingUrl,
    });
  } catch (error) {
    console.error('[sendOrderTrackingWhatsApp] Erro geral:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});