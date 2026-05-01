import { createFileRoute } from '@tanstack/react-router';
import MbcGate from '@src/presentation/pages/MbcGate';

export const Route = createFileRoute('/gate')({
  component: MbcGate,
});
