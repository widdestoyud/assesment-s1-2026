import { createFileRoute } from '@tanstack/react-router';
import MbcRolePicker from '@pages/(mbc)/MbcRolePicker';

export const Route = createFileRoute('/mbc/')({
  component: MbcRolePicker,
});
