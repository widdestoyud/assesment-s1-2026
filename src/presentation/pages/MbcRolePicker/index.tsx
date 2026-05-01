import type { FC } from 'react';
import { useNavigate } from '@tanstack/react-router';
import container from '@di/container';
import type { RolePickerControllerInterface } from '@src/controllers/role-picker.controller';
import RoleCard from '@components/RoleCard';

const MbcRolePicker: FC = () => {
  const ctrl = container.resolve<RolePickerControllerInterface>('rolePickerController');
  const navigate = useNavigate();

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-center text-2xl font-bold">Membership Benefit Card</h1>
      <p className="mb-8 text-center text-gray-500">Pilih mode operasi</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {ctrl.roles.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            isActive={ctrl.activeRole === role.id}
            onSelect={() => {
              ctrl.onSelectRole(role.id);
              navigate({ to: `/${role.id}` });
            }}
          />
        ))}
      </div>
    </main>
  );
};

export default MbcRolePicker;
