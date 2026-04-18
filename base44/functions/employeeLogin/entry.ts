import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { cpf, password } = await req.json();

    console.log('[employeeLogin] Tentativa de login para CPF:', cpf);

    if (!cpf || !password) {
      return Response.json({ error: 'CPF e senha são obrigatórios.' }, { status: 400 });
    }

    let users;
    try {
      users = await base44.asServiceRole.entities.User.list();
      console.log('[employeeLogin] Total de usuários encontrados:', users.length);
    } catch (listError) {
      console.error('[employeeLogin] Erro ao listar usuários:', listError.message, listError);
      return Response.json({
        error: 'Erro ao acessar base de funcionários: ' + listError.message
      }, { status: 500 });
    }

    const employee = users.find(u => u.cpf === cpf && u.custom_password === password);

    if (!employee) {
      const cpfMatch = users.find(u => u.cpf === cpf);
      console.log('[employeeLogin] CPF encontrado?', !!cpfMatch, '| Senha confere?', cpfMatch ? cpfMatch.custom_password === password : 'N/A');
      return Response.json({ error: 'CPF ou senha inválidos.' }, { status: 401 });
    }

    console.log('[employeeLogin] Login bem-sucedido para:', employee.display_name || employee.full_name);

    return Response.json({
      success: true,
      employee: {
        id: employee.id,
        full_name: employee.display_name || employee.full_name,
        role: employee.role,
        cpf: employee.cpf,
      }
    });
  } catch (error) {
    console.error('[employeeLogin] Erro geral:', error.message, error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});