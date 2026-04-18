import React, { useState, useEffect } from 'react';
import EmployeeAccessModal from './EmployeeAccessModal';

function getSession() {
  try {
    const raw = localStorage.getItem('employee_session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function RoleGuard({ allowedRoles, children }) {
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
        onSuccess={(emp) => setEmployee(emp)}
      />
    );
  }

  return children;
}