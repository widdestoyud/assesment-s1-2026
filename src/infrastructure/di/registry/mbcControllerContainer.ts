import type { AwilixContainer } from 'awilix';
import { asFunction } from 'awilix';

import type { RolePickerControllerInterface } from '@src/controllers/role-picker.controller';
import type { StationControllerInterface } from '@src/controllers/station.controller';
import type { GateControllerInterface } from '@src/controllers/gate.controller';
import type { TerminalControllerInterface } from '@controllers/terminal.controller';
import type { ScoutControllerInterface } from '@src/controllers/scout.controller';

import RolePickerController from '@src/controllers/role-picker.controller';
import StationController from '@src/controllers/station.controller';
import GateController from '@src/controllers/gate.controller';
import TerminalController from '@controllers/terminal.controller';
import ScoutController from '@src/controllers/scout.controller';

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
