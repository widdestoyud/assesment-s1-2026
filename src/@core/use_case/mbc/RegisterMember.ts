import type { AwilixRegistry } from '@di/container';
import type { MemberIdentity, OperationResult } from '@core/services/mbc/models';

export interface RegisterMemberInput {
  member: MemberIdentity;
}

export interface RegisterMemberUseCaseInterface {
  execute(input: RegisterMemberInput): Promise<OperationResult>;
}

export const RegisterMemberUseCase = (
  deps: Pick<
    AwilixRegistry,
    'nfcService' | 'cardDataService' | 'silentShieldService'
  >,
): RegisterMemberUseCaseInterface => {
  const { nfcService, cardDataService, silentShieldService } = deps;

  const execute = async (input: RegisterMemberInput): Promise<OperationResult> => {
    // Step 1: Read card
    const rawEncrypted = await nfcService.readCard();

    // Step 2: Try to decrypt and deserialize to check if card already has data
    try {
      const decrypted = silentShieldService.decrypt(rawEncrypted);
      const existingCard = cardDataService.deserialize(decrypted);

      // If we get here, card already has valid member data
      if (existingCard.member.name.length > 0) {
        throw new Error(
          'Card already registered. This card belongs to: ' +
            existingCard.member.name,
        );
      }
    } catch (error: unknown) {
      // If decryption/deserialization fails, card is blank — proceed with registration
      if (
        error instanceof Error &&
        error.message.startsWith('Card already registered')
      ) {
        throw error;
      }
      // Otherwise, card is blank or corrupted — safe to register
    }

    // Step 3: Create fresh card data with registration
    const blankCard = {
      version: 1,
      member: { name: '', memberId: '' },
      balance: 0,
      checkIn: null,
      transactions: [],
    };
    const registeredCard = cardDataService.applyRegistration(
      blankCard,
      input.member,
    );

    // Step 4: Serialize → encrypt → write with verify
    const serialized = cardDataService.serialize(registeredCard);
    const encrypted = silentShieldService.encrypt(serialized);
    const writeResult = await nfcService.writeAndVerify(encrypted);

    if (!writeResult.success) {
      throw new Error(
        `Registration failed: write verification error — ${writeResult.error}`,
      );
    }

    return {
      type: 'registration',
      memberName: input.member.name,
      newBalance: 0,
    };
  };

  return { execute };
};
