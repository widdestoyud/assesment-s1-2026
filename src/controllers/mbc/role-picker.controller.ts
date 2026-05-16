import { useState, useCallback } from 'react';
import type { AwilixRegistry } from '@di/container';
import type { RoleMode, ChipTransferCapabilityStatus } from '@src/@core/models/mbc';
import type { TFunction } from 'i18next';
import { useChipTransferCapability } from './hooks';

export interface RoleOption {
  id: RoleMode;
  labelKey: string;
  subtitleKey: string;
  descriptionKey: string;
  actionKey?: string;
  color: 'gate' | 'terminal' | 'station' | 'scout';
  variant: 'primary' | 'secondary';
}

export interface RolePickerControllerInterface {
  primaryRoles: RoleOption[];
  secondaryRoles: RoleOption[];
  activeRole: RoleMode | null;
  chipTransferCapability: ChipTransferCapabilityStatus;
  onNavigateToRole: (role: RoleMode) => void;
  onRequestNfcPermission: () => void;
  t: TFunction;
}

const PRIMARY_ROLES: RoleOption[] = [
  {
    id: 'gate',
    labelKey: 'mbc_role_gate_label',
    subtitleKey: 'mbc_role_gate_subtitle',
    descriptionKey: 'mbc_role_gate_description_long',
    actionKey: 'mbc_role_gate_action',
    color: 'gate',
    variant: 'primary',
  },
  {
    id: 'terminal',
    labelKey: 'mbc_role_terminal_label',
    subtitleKey: 'mbc_role_terminal_subtitle',
    descriptionKey: 'mbc_role_terminal_description_long',
    actionKey: 'mbc_role_terminal_action',
    color: 'terminal',
    variant: 'primary',
  },
];

const SECONDARY_ROLES: RoleOption[] = [
  {
    id: 'station',
    labelKey: 'mbc_role_station_label',
    subtitleKey: 'mbc_role_station_subtitle',
    descriptionKey: 'mbc_role_station_description',
    color: 'station',
    variant: 'secondary',
  },
  {
    id: 'scout',
    labelKey: 'mbc_role_scout_label',
    subtitleKey: 'mbc_role_scout_subtitle',
    descriptionKey: 'mbc_role_scout_description',
    color: 'scout',
    variant: 'secondary',
  },
];

const RolePickerController = (
  deps: Pick<AwilixRegistry, 'useTranslation' | 'useNavigate' | 'chipTransferService'>,
): RolePickerControllerInterface => {
  const { useTranslation, useNavigate, chipTransferService } = deps;
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeRole, setActiveRole] = useState<RoleMode | null>(null);
  const { chipTransferCapability } = useChipTransferCapability({ chipTransferService });

  const onNavigateToRole = useCallback((role: RoleMode) => {
    setActiveRole(role);
    navigate({ to: `/${role}` });
  }, []);

  const onRequestNfcPermission = useCallback(() => {
    // Triggering a scan will prompt the browser for NFC permission
    chipTransferService.readCard().catch(() => {
      // Expected — user may deny or no card present. Permission state will update via capability hook.
    });
  }, []);

  return {
    primaryRoles: PRIMARY_ROLES,
    secondaryRoles: SECONDARY_ROLES,
    activeRole,
    chipTransferCapability,
    onNavigateToRole,
    onRequestNfcPermission,
    t,
  };
};

export default RolePickerController;
