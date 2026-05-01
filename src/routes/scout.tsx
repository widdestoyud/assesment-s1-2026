import { createFileRoute } from '@tanstack/react-router';
import MbcScout from '@src/presentation/pages/MbcScout';

export const Route = createFileRoute('/scout')({
  component: MbcScout,
});
