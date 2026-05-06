import { createFileRoute } from '@tanstack/react-router';
import MbcStation from '@pages/MbcStation';

export const Route = createFileRoute('/')({
  component: MbcStation,
});
