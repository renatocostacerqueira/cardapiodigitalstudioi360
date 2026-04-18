import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Acesso negado. Apenas administradores.' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    // ── LIST ──────────────────────────────────────────────────────────────────
    if (action === 'list') {
      const users = await base44.asServiceRole.entities.User.list();
      const staff = users.filter(u => u.role === 'cozinha' || u.role === 'entregador');
      return Response.json({ users: staff });
    }

    // ── CREATE ────────────────────────────────────────────────────────────────
    if (action === 'create') {
      const { email, password, name, role } = body;
      if (!email || !password || !name || !role) {
        return Response.json({ error: 'Campos obrigatórios: email, senha, nome e perfil.' }, { status: 400 });
      }
      if (!['cozinha', 'entregador'].includes(role)) {
        return Response.json({ error: 'Perfil inválido. Use: cozinha ou entregador' }, { status: 400 });
      }

      // Cria o usuário com e-mail e senha definidos pelo administrador
      await base44.auth.register({ email, password });

      // Após criar, busca o usuário para atualizar o role
      const allUsers = await base44.asServiceRole.entities.User.list();
      const newUser = allUsers.find(u => u.email === email);
      if (newUser) {
        await base44.asServiceRole.entities.User.update(newUser.id, { role });
      }

      return Response.json({ success: true, message: 'Usuário criado com sucesso.' });
    }

    // ── UPDATE ROLE ───────────────────────────────────────────────────────────
    if (action === 'updateRole') {
      const { userId, role } = body;
      if (!userId || !role) {
        return Response.json({ error: 'userId e role são obrigatórios' }, { status: 400 });
      }
      if (!['cozinha', 'entregador'].includes(role)) {
        return Response.json({ error: 'Perfil inválido. Use: cozinha ou entregador' }, { status: 400 });
      }
      await base44.asServiceRole.entities.User.update(userId, { role });
      return Response.json({ success: true });
    }

    // ── DELETE ────────────────────────────────────────────────────────────────
    if (action === 'delete') {
      const { userId } = body;
      if (!userId) {
        return Response.json({ error: 'userId é obrigatório' }, { status: 400 });
      }
      await base44.asServiceRole.entities.User.delete(userId);
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Ação inválida' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});