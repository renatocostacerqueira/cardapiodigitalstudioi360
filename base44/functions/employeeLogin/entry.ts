import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { cpf, password } = await req.json();

    if (!cpf || !password) {
      return Response.json({ error: 'CPF e senha são obrigatórios.' }, { status: 400 });
    }

    const users = await base44.asServiceRole.entities.User.list();
    const employee = users.find(u => u.cpf === cpf && u.custom_password === password);

    if (!employee) {
      return Response.json({ error: 'CPF ou senha inválidos.' }, { status: 401 });
    }

    return Response.json({
      success: true,
      employee: {
        id: employee.id,
        full_name: employee.full_name,
        role: employee.role,
        cpf: employee.cpf,
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});