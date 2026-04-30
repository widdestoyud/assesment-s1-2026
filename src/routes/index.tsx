import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: () => (
    <div>
      <h1>MyTelkomsel MBC</h1>
      <p>Membership Benefit Card</p>
    </div>
  ),
});
