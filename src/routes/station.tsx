import { createFileRoute } from '@tanstack/react-router';
import MbcStation from '@pages/(mbc)/MbcStation';

export const Route = createFileRoute('/station')({
  component: MbcStation,
});
