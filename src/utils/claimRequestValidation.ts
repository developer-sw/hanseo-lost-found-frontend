export const OWNERSHIP_PROOF_MAX_LENGTH = 1000

type OwnershipProofValidation =
  | { status: 'valid'; ownershipProof: string }
  | { status: 'invalid'; message: string }

export function validateOwnershipProof(value: string): OwnershipProofValidation {
  const ownershipProof = value.trim()
  if (!ownershipProof) return { status: 'invalid', message: '소유 증빙을 입력해 주세요.' }

  if ([...value].length > OWNERSHIP_PROOF_MAX_LENGTH) {
    return { status: 'invalid', message: `소유 증빙은 ${OWNERSHIP_PROOF_MAX_LENGTH}자 이내로 입력해 주세요.` }
  }

  return { status: 'valid', ownershipProof }
}
