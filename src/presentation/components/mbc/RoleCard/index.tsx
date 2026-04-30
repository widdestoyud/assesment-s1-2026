import type { FC } from 'react';
import type { RoleOption } from '@controllers/mbc/role-picker.controller';

export interface RoleCardProps {
  role: RoleOption;
  isActive: boolean;
  onSelect: () => void;
}

const RoleCard: FC<RoleCardProps> = ({ role, isActive, onSelect }) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      data-testid={`role-card-${role.id}`}
      aria-pressed={isActive}
      className={`flex w-full flex-col items-center gap-2 rounded-xl border-2 p-6 text-center transition-colors ${
        isActive
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50'
      }`}
    >
      <span className="text-4xl" aria-hidden="true">
        {role.icon}
      </span>
      <h3 className="text-lg font-semibold">{role.label}</h3>
      <p className="text-sm text-gray-500">{role.description}</p>
    </button>
  );
};

export default RoleCard;
