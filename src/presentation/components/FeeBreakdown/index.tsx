import type { FC } from 'react';
import type { FeeResult } from '@core/services/mbc/models';
import { formatIDR } from '@utils/helpers/mbc.helper';

export interface FeeBreakdownProps {
  feeResult: FeeResult;
  serviceTypeName: string;
}

const FeeBreakdown: FC<FeeBreakdownProps> = ({ feeResult, serviceTypeName }) => {
  return (
    <div data-testid="fee-breakdown" className="rounded-lg bg-gray-50 p-4">
      <h3 className="mb-3 text-lg font-semibold">Rincian Biaya</h3>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-600">Layanan</dt>
          <dd className="font-medium">{serviceTypeName}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-600">Penggunaan</dt>
          <dd className="font-medium">
            {feeResult.usageUnits} {feeResult.unitLabel}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-600">Tarif</dt>
          <dd className="font-medium">
            {formatIDR(feeResult.ratePerUnit)} / {feeResult.unitLabel}
          </dd>
        </div>
        {feeResult.roundingApplied !== 'none' && (
          <div className="flex justify-between">
            <dt className="text-gray-600">Pembulatan</dt>
            <dd className="font-medium">{feeResult.roundingApplied}</dd>
          </div>
        )}
        <div className="flex justify-between border-t pt-2 text-base font-bold">
          <dt>Total</dt>
          <dd>{formatIDR(feeResult.fee)}</dd>
        </div>
      </dl>
    </div>
  );
};

export default FeeBreakdown;
