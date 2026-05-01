import type { AwilixRegistry } from '@di/container';
import type { RoleMode } from '@core/services/mbc/models';

export interface RoleOption {
  id: RoleMode;
  label: string;
  description: string;
  icon: string;
}

export interface RolePickerControllerInterface {
  roles: RoleOption[];
  activeRole: RoleMode | null;
  onSelectRole: (role: RoleMode) => void;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'station',
    label: 'The Station',
    description: 'Registrasi kartu, top-up saldo, konfigurasi service type',
    icon: '🏢',
  },
  {
    id: 'gate',
    label: 'The Gate',
    description: 'Check-in dengan pencatatan timestamp dan service type',
    icon: '🚪',
  },
  {
    id: 'terminal',
    label: 'The Terminal',
    description: 'Check-out, kalkulasi tarif, potong saldo',
    icon: '💳',
  },
  {
    id: 'scout',
    label: 'The Scout',
    description: 'Lihat isi kartu: saldo, status, riwayat transaksi',
    icon: '🔍',
  },
];

const RolePickerController = (
  deps: Pick<AwilixRegistry, 'useState' | 'useCallback'>,
): RolePickerControllerInterface => {
  const { useState, useCallback } = deps;

  const [activeRole, setActiveRole] = useState<RoleMode | null>(null);

  const onSelectRole = useCallback((role: RoleMode) => {
    setActiveRole(role);
  }, []);

  return {
    roles: ROLE_OPTIONS,
    activeRole,
    onSelectRole,
  };
};

export default RolePickerController;
