import { createFileRoute } from '@tanstack/react-router';
import MbcRolePicker from '@pages/MbcRolePicker';

export const Route = createFileRoute('/')({
  component: MbcRolePicker,
});
