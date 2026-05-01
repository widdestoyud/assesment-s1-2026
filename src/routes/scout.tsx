import { createFileRoute } from '@tanstack/react-router';
import MbcScout from '@pages/MbcScout';

export const Route = createFileRoute('/scout')({
  component: MbcScout,
});
