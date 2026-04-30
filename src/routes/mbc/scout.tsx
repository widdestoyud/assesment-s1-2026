import { createFileRoute } from '@tanstack/react-router';
import MbcScout from '@pages/(mbc)/MbcScout';

export const Route = createFileRoute('/mbc/scout')({
  component: MbcScout,
});
