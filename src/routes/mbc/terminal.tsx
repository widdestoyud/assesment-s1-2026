import { createFileRoute } from '@tanstack/react-router';
import MbcTerminal from '@pages/(mbc)/MbcTerminal';

export const Route = createFileRoute('/mbc/terminal')({
  component: MbcTerminal,
});
