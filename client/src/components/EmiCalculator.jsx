/**
 * EmiCalculator.jsx
 * -----------------
 * Lets visitors estimate their monthly home-loan payment (EMI) for a property.
 *
 * The standard EMI formula is:
 *
 *            P × r × (1 + r)^n
 *   EMI  =  -------------------
 *              (1 + r)^n − 1
 *
 *   P = loan amount, r = monthly interest rate, n = number of months
 */

import { useMemo, useState } from "react";
import { formatIndianPrice, formatRupees } from "../utils/formatters.js";

const DEFAULT_PROPERTY_PRICE = 10000000; // ₹1 Cr if the property has no price
const DEFAULT_DOWN_PAYMENT_PERCENT = 20;
const DEFAULT_INTEREST_RATE_PERCENT = 8.5;
const DEFAULT_LOAN_YEARS = 20;

/**
 * Calculates the monthly payment for a loan.
 *
 * @param {number} loanAmount - amount borrowed in rupees
 * @param {number} yearlyInterestRatePercent - e.g. 8.5 for 8.5%
 * @param {number} loanYears - length of the loan in years
 * @returns {number} monthly payment in rupees
 */
export function calculateMonthlyEmi(loanAmount, yearlyInterestRatePercent, loanYears) {
  const monthlyInterestRate = yearlyInterestRatePercent / 12 / 100;
  const numberOfMonths = loanYears * 12;

  if (loanAmount <= 0 || numberOfMonths <= 0) return 0;
  if (monthlyInterestRate === 0) return loanAmount / numberOfMonths;

  const growthFactor = Math.pow(1 + monthlyInterestRate, numberOfMonths);
  return (loanAmount * monthlyInterestRate * growthFactor) / (growthFactor - 1);
}

export default function EmiCalculator({ propertyPrice }) {
  const startingPrice = propertyPrice > 0 ? propertyPrice : DEFAULT_PROPERTY_PRICE;

  const [homePrice, setHomePrice] = useState(startingPrice);
  const [downPaymentPercent, setDownPaymentPercent] = useState(DEFAULT_DOWN_PAYMENT_PERCENT);
  const [interestRatePercent, setInterestRatePercent] = useState(DEFAULT_INTEREST_RATE_PERCENT);
  const [loanYears, setLoanYears] = useState(DEFAULT_LOAN_YEARS);

  // Recalculate only when one of the inputs changes
  const calculation = useMemo(() => {
    const downPaymentAmount = (homePrice * downPaymentPercent) / 100;
    const loanAmount = homePrice - downPaymentAmount;
    const monthlyEmi = calculateMonthlyEmi(loanAmount, interestRatePercent, loanYears);
    const totalAmountPaid = monthlyEmi * loanYears * 12;
    const totalInterestPaid = totalAmountPaid - loanAmount;
    return { downPaymentAmount, loanAmount, monthlyEmi, totalInterestPaid };
  }, [homePrice, downPaymentPercent, interestRatePercent, loanYears]);

  // The slider range for price: half to double the property price
  const minimumPrice = Math.round(startingPrice * 0.5);
  const maximumPrice = Math.round(startingPrice * 2);

  return (
    <div className="emi-calculator">
      <div className="emi-calculator__inputs">
        <SliderField
          label="Home price"
          valueText={formatIndianPrice(homePrice)}
          min={minimumPrice}
          max={maximumPrice}
          step={100000}
          value={homePrice}
          onChange={setHomePrice}
        />
        <SliderField
          label="Down payment"
          valueText={`${downPaymentPercent}%`}
          min={10}
          max={80}
          step={5}
          value={downPaymentPercent}
          onChange={setDownPaymentPercent}
        />
        <SliderField
          label="Interest rate"
          valueText={`${interestRatePercent.toFixed(2)}%`}
          min={6}
          max={14}
          step={0.05}
          value={interestRatePercent}
          onChange={setInterestRatePercent}
        />
        <SliderField
          label="Loan tenure"
          valueText={`${loanYears} years`}
          min={5}
          max={30}
          step={1}
          value={loanYears}
          onChange={setLoanYears}
        />
      </div>

      <div className="emi-calculator__result">
        <span className="emi-calculator__result-label">Estimated monthly EMI</span>
        <strong className="emi-calculator__emi">{formatRupees(calculation.monthlyEmi)}</strong>
        <dl className="emi-calculator__breakdown">
          <div>
            <dt>Loan amount</dt>
            <dd>{formatIndianPrice(calculation.loanAmount)}</dd>
          </div>
          <div>
            <dt>Down payment</dt>
            <dd>{formatIndianPrice(calculation.downPaymentAmount)}</dd>
          </div>
          <div>
            <dt>Total interest</dt>
            <dd>{formatIndianPrice(calculation.totalInterestPaid)}</dd>
          </div>
        </dl>
        <p className="emi-calculator__note">An estimate only. Final rates depend on your lender.</p>
      </div>
    </div>
  );
}

/** A labelled range slider that shows its current value. */
function SliderField({ label, valueText, min, max, step, value, onChange }) {
  return (
    <label className="slider-field">
      <span className="slider-field__top">
        <span>{label}</span>
        <strong>{valueText}</strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}
