import { createFileRoute } from '@tanstack/react-router';
import MbcGate from '@pages/(mbc)/MbcGate';

export const Route = createFileRoute('/gate')({
  component: MbcGate,
});
