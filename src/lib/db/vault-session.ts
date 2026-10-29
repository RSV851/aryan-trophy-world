/**
 * Standard DB callback execution helper.
 */
export async function executeWithVaultAuth<T>(callback: () => Promise<T>): Promise<T> {
  return await callback();
}
