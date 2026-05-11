import type { AwilixRegistry } from '@di/container';
import type { RoleMode, NfcCapabilityStatus } from '@src/@core/models/mbc';
import type { TFunction } from 'i18next';

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
  nfcCapability: NfcCapabilityStatus;
  onNavigateToRole: (role: RoleMode) => void;
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
  deps: Pick<AwilixRegistry, 'useState' | 'useCallback' | 'useEffect' | 'useTranslation' | 'useNavigate' | 'nfcService'>,
): RolePickerControllerInterface => {
  const { useState, useCallback, useEffect, useTranslation, useNavigate, nfcService } = deps;
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeRole, setActiveRole] = useState<RoleMode | null>(null);
  const [nfcCapability, setNfcCapability] = useState<NfcCapabilityStatus>('permission_pending');

  useEffect(() => {
    const isNfcAvailable = nfcService.isAvailable();
    setNfcCapability(isNfcAvailable ? 'supported' : 'unsupported');
  }, []);

  const onNavigateToRole = useCallback((role: RoleMode) => {
    setActiveRole(role);
    navigate({ to: `/${role}` });
  }, []);

  return {
    primaryRoles: PRIMARY_ROLES,
    secondaryRoles: SECONDARY_ROLES,
    activeRole,
    nfcCapability,
    onNavigateToRole,
    t,
  };
};

export default RolePickerController;
