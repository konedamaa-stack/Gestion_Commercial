export function formatNumber(num: number): string {
  if (num === null || num === undefined) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
