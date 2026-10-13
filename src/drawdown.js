/** Pension drawdown projection — canonical logic (also mirrored in Homepage.html). */

export const PROJECTION_HORIZON = 40;
export const INFLATION_RATE = 0.025;

export function withdrawalForYear(baseAnnual, yearIndex, inflationLinked) {
  if (!inflationLinked) return baseAnnual;
  return baseAnnual * (1 + INFLATION_RATE) ** (yearIndex - 1);
}

/**
 * @param {object} params
 * @param {number} params.potSize
 * @param {number} params.annualWithdrawal
 * @param {number} params.annualGrowthPercent
 * @param {boolean} [params.inflationLinked]
 * @param {number} [params.horizon]
 */
export function calculateDrawdown({
  potSize,
  annualWithdrawal,
  annualGrowthPercent,
  inflationLinked = false,
  horizon = PROJECTION_HORIZON,
}) {
  const growthRate = annualGrowthPercent / 100;
  let balance = potSize;
  let yearsLast = 0;
  let totalWithdrawn = 0;
  /** @type {{ year: number, value: number }[]} */
  const yearlyPotAtStart = [];

  for (let year = 1; year <= horizon; year++) {
    const withdrawal = withdrawalForYear(annualWithdrawal, year, inflationLinked);
    yearlyPotAtStart.push({ year, value: balance });

    if (balance < withdrawal) {
      return {
        yearsLast,
        totalWithdrawn,
        lastsBeyondHorizon: false,
        yearlyPotAtStart,
      };
    }

    balance -= withdrawal;
    totalWithdrawn += withdrawal;
    yearsLast = year;
    balance *= 1 + growthRate;
  }

  const nextWithdrawal = withdrawalForYear(annualWithdrawal, horizon + 1, inflationLinked);
  const lastsBeyondHorizon = balance >= nextWithdrawal;

  return {
    yearsLast,
    totalWithdrawn,
    lastsBeyondHorizon,
    yearlyPotAtStart,
    balanceAfterHorizon: balance,
  };
}

export function formatDuration(result) {
  if (result.lastsBeyondHorizon) {
    return `Lasts beyond ${PROJECTION_HORIZON} years`;
  }
  return `Your pot lasts ${result.yearsLast} years`;
}
