import { createFileRoute } from '@tanstack/react-router';
import MbcRolePicker from '@src/presentation/pages/MbcRolePicker';

export const Route = createFileRoute('/')({
  component: MbcRolePicker,
});
