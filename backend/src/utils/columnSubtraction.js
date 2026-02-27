// backend/src/utils/columnSubtraction.js

function placeName(place) {
  if (place === 1) return "Ones";
  if (place === 10) return "Tens";
  if (place === 100) return "Hundreds";
  if (place === 1000) return "Thousands";
  if (place === 10000) return "Ten-thousands";
  return `Place ${place}`;
}

/**
 * Column subtraction (digit-by-digit) with borrowing.
 * Only supports non-negative integers where a >= b (standard column method).
 */
function columnSubtract(a, b) {
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    throw new Error("columnSubtract supports integers only");
  }
  if (a < 0 || b < 0) {
    throw new Error("columnSubtract supports non-negative integers only");
  }
  if (a < b) {
    throw new Error("columnSubtract currently requires operand1 >= operand2");
  }

  const aDigits = String(a).split("").map(Number);
  const bDigits = String(b).split("").map(Number);

  let i = aDigits.length - 1;
  let j = bDigits.length - 1;

  const resultDigits = [];
  const steps = [];

  let place = 1;
  let borrow = 0;

  while (i >= 0 || j >= 0) {
    const da = i >= 0 ? aDigits[i] : 0;
    const db = j >= 0 ? bDigits[j] : 0;

    let top = da - borrow;

    if (top < db) {
      // need to borrow from the left
      // find next digit to borrow from
      let k = i - 1;
      while (k >= 0 && aDigits[k] === 0) {
        k--;
      }
      if (k < 0) {
        throw new Error("Unexpected borrow failure");
      }

      // borrow 1 from aDigits[k], turning any zeros in between into 9
      aDigits[k] -= 1;
      for (let m = k + 1; m < i; m++) {
        aDigits[m] = 9;
      }

      // current digit receives +10
      top += 10;

      steps.push(
        `${placeName(place)}: borrow from ${placeName(place * 10)} → (${da} becomes ${top})`
      );

      borrow = 0; // borrow handled explicitly above
    }

    const diff = top - db;

    steps.push(`${placeName(place)}: ${top} - ${db} = ${diff}`);
    resultDigits.unshift(diff);

    // move left
    i--;
    j--;
    place *= 10;

    // borrow for next step (only if we didn't borrow via cascade above)
    // In this implementation, borrow is only the "carry-over" from previous subtraction.
    // We set borrow to 0 always because we directly adjust digits when borrowing.
    borrow = 0;
  }

  // remove leading zeros
  while (resultDigits.length > 1 && resultDigits[0] === 0) {
    resultDigits.shift();
  }

  return {
    result: Number(resultDigits.join("")),
    steps
  };
}

module.exports = { columnSubtract };