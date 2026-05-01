import { createFileRoute } from '@tanstack/react-router';
import MbcStation from '@src/presentation/pages/MbcStation';

export const Route = createFileRoute('/station')({
  component: MbcStation,
});
