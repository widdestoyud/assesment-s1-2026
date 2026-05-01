import { createFileRoute } from '@tanstack/react-router';
import MbcTerminal from '@src/presentation/pages/MbcTerminal';

export const Route = createFileRoute('/terminal')({
  component: MbcTerminal,
});
