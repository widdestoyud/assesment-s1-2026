import type { AwilixContainer } from 'awilix';
import { asFunction } from 'awilix';

import type { RolePickerControllerInterface } from '@controllers/mbc/role-picker.controller';
import type { StationControllerInterface } from '@controllers/mbc/station.controller';
import type { GateControllerInterface } from '@controllers/mbc/gate.controller';
import type { TerminalControllerInterface } from '@controllers/mbc/terminal.controller';
import type { ScoutControllerInterface } from '@controllers/mbc/scout.controller';

import RolePickerController from '@controllers/mbc/role-picker.controller';
import StationController from '@controllers/mbc/station.controller';
import GateController from '@controllers/mbc/gate.controller';
import TerminalController from '@controllers/mbc/terminal.controller';
import ScoutController from '@controllers/mbc/scout.controller';

export function registerMbcControllerModules(container: AwilixContainer) {
  container.register({
    rolePickerController: asFunction(RolePickerController),
    stationController: asFunction(StationController),
    gateController: asFunction(GateController),
    terminalController: asFunction(TerminalController),
    scoutController: asFunction(ScoutController),
  });
}

export interface MbcControllerContainerInterface {
  rolePickerController: RolePickerControllerInterface;
  stationController: StationControllerInterface;
  gateController: GateControllerInterface;
  terminalController: TerminalControllerInterface;
  scoutController: ScoutControllerInterface;
}
