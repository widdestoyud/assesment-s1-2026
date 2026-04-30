import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import type { ServiceType } from '@core/services/mbc/models';

export interface ManualCalcFormData {
  checkInTimestamp: string;
  serviceTypeId: string;
}

export interface ManualCalcFormProps {
  onSubmit: (data: ManualCalcFormData) => void;
  serviceTypes: ServiceType[];
  isActive: boolean;
}

const ManualCalcForm: FC<ManualCalcFormProps> = ({
  onSubmit,
  serviceTypes,
  isActive,
}) => {
  const [checkInTimestamp, setCheckInTimestamp] = useState('');
  const [serviceTypeId, setServiceTypeId] = useState('');

  if (!isActive) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!checkInTimestamp || !serviceTypeId) return;
    onSubmit({
      checkInTimestamp: new Date(checkInTimestamp).toISOString(),
      serviceTypeId,
    });
  };

  return (
    <div data-testid="manual-calc-form" className="rounded-lg border-2 border-dashed border-orange-300 bg-orange-50 p-4">
      <h3 className="mb-3 text-sm font-semibold text-orange-700">
        Manual / Offline Calculation
      </h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="mc-timestamp" className="block text-sm font-medium text-gray-700">
            Waktu Check-In
          </label>
          <input
            id="mc-timestamp"
            type="datetime-local"
            value={checkInTimestamp}
            onChange={(e) => setCheckInTimestamp(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="mc-service" className="block text-sm font-medium text-gray-700">
            Layanan
          </label>
          <select
            id="mc-service"
            value={serviceTypeId}
            onChange={(e) => setServiceTypeId(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="" disabled>-- Pilih layanan --</option>
            {serviceTypes.map((st) => (
              <option key={st.id} value={st.id}>{st.displayName}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
        >
          Hitung Tarif
        </button>
      </form>
    </div>
  );
};

export default ManualCalcForm;
