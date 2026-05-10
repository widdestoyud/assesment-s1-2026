import type { AwilixRegistry } from '@di/container';
import type { RoleMode } from '@src/@core/models/mbc';
import type { TFunction } from 'i18next';

export interface RoleOption {
  id: RoleMode;
  label: string;
  descriptionKey: string;
  icon: string;
  color: 'blue' | 'green' | 'orange' | 'purple';
}

export interface RolePickerControllerInterface {
  roles: RoleOption[];
  activeRole: RoleMode | null;
  onSelectRole: (role: RoleMode) => void;
  t: TFunction;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'gate',
    label: 'The Gate',
    descriptionKey: 'mbc_role_gate_description',
    icon: '🚪',
    color: 'green',
  },
  {
    id: 'terminal',
    label: 'The Terminal',
    descriptionKey: 'mbc_role_terminal_description',
    icon: '💳',
    color: 'orange',
  },
  {
    id: 'station',
    label: 'The Station',
    descriptionKey: 'mbc_role_station_description',
    icon: '🏢',
    color: 'blue',
  },
  {
    id: 'scout',
    label: 'The Scout',
    descriptionKey: 'mbc_role_scout_description',
    icon: '🔍',
    color: 'purple',
  },
];

const RolePickerController = (
  deps: Pick<AwilixRegistry, 'useState' | 'useCallback' | 'useTranslation'>,
): RolePickerControllerInterface => {
  const { useState, useCallback, useTranslation } = deps;
  const { t } = useTranslation();

  const [activeRole, setActiveRole] = useState<RoleMode | null>(null);

  const onSelectRole = useCallback((role: RoleMode) => {
    setActiveRole(role);
  }, []);

  return {
    roles: ROLE_OPTIONS,
    activeRole,
    onSelectRole,
    t,
  };
};

export default RolePickerController;
