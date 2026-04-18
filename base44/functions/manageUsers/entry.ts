import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { action } = body;

    // ── LIST ──────────────────────────────────────────────────────────────────
    if (action === 'list') {
      const users = await base44.asServiceRole.entities.User.list();
      const staff = users.filter(u => ['admin', 'cozinha', 'entregador'].includes(u.role));
      return Response.json({ users: staff });
    }

    // ── CREATE ────────────────────────────────────────────────────────────────
    if (action === 'create') {
      const { name, cpf, password, role } = body;
      if (!name || !cpf || !password || !role) {
        return Response.json({ error: 'Campos obrigatórios: nome, CPF, senha e perfil.' }, { status: 400 });
      }
      if (!['admin', 'cozinha', 'entregador'].includes(role)) {
        return Response.json({ error: 'Perfil inválido.' }, { status: 400 });
      }

      // Verifica CPF duplicado
      const all = await base44.asServiceRole.entities.User.list();
      const exists = all.find(u => u.cpf === cpf);
      if (exists) {
        return Response.json({ error: 'Já existe um funcionário com este CPF.' }, { status: 400 });
      }

      // Cria o registro de usuário com email fictício baseado no CPF
      const fakeEmail = `${cpf}@funcionario.local`;
      await base44.auth.register({ email: fakeEmail, password, full_name: name });

      // Atualiza role, cpf e custom_password
      const updated = await base44.asServiceRole.entities.User.list();
      const newUser = updated.find(u => u.email === fakeEmail);
      if (newUser) {
        await base44.asServiceRole.entities.User.update(newUser.id, {
          role,
          cpf,
          custom_password: password,
          full_name: name,
        });
      }

      return Response.json({ success: true });
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────
    if (action === 'update') {
      const { userId, role, cpf, password, name } = body;
      if (!userId) {
        return Response.json({ error: 'userId é obrigatório' }, { status: 400 });
      }
      const updateData = {};
      if (role) updateData.role = role;
      if (cpf) updateData.cpf = cpf;
      if (password) updateData.custom_password = password;
      if (name) updateData.full_name = name;

      await base44.asServiceRole.entities.User.update(userId, updateData);
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