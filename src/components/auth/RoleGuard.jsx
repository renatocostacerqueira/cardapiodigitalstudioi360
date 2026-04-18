import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeAccessModal from './EmployeeAccessModal';

function getSession() {
  try {
    const raw = localStorage.getItem('employee_session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const ROLE_HOME = {
  admin: '/admin',
  cozinha: '/kitchen',
  entregador: '/delivery',
};

export default function RoleGuard({ allowedRoles, children }) {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(getSession);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setEmployee(getSession());
    setChecked(true);
  }, []);

  if (!checked) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  const hasAccess = employee && allowedRoles.includes(employee.role);

  if (!hasAccess) {
    return (
      <EmployeeAccessModal
        onSuccess={(emp) => {
          setEmployee(emp);
          // Se o perfil logado não tem acesso a esta rota, redireciona para a rota dele
          if (!allowedRoles.includes(emp.role)) {
            const target = ROLE_HOME[emp.role];
            if (target) navigate(target, { replace: true });
          }
        }}
      />
    );
  }

  return children;
}