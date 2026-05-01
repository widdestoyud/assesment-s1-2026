import { createFileRoute } from '@tanstack/react-router';
import MbcTerminal from '@pages/(mbc)/MbcTerminal';

export const Route = createFileRoute('/terminal')({
  component: MbcTerminal,
});
