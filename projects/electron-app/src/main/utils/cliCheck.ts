import which from 'which';

export async function checkCommand(command: string): Promise<boolean> {
  try {
    await which(command);
    return true;
  } catch (error) {
    console.error('common-check-error', error);
    return false;
  }
}

export async function getCommandPath(command: string): Promise<string | null> {
  try {
    const path = await which(command);
    return path;
  } catch (error) {
    return null;
  }
}
