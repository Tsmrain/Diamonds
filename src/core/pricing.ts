export const calculateCurrentTotal = (
  basePrice: number,
  baseHours: number,
  checkInDate: Date
): number => {
  const now = new Date();
  const baseSeconds = baseHours * 3600;
  const elapsedSeconds = (now.getTime() - checkInDate.getTime()) / 1000;
  
  if (elapsedSeconds <= baseSeconds) {
    return basePrice; // Aún está dentro del tiempo pagado
  }

  const extraSeconds = elapsedSeconds - baseSeconds;
  const pricePerSecond = basePrice / baseSeconds;
  return basePrice + (extraSeconds * pricePerSecond);
};
