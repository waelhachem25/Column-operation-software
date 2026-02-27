function placeName(place) {
  if (place === 1) return "Ones";
  if (place === 10) return "Tens";
  if (place === 100) return "Hundreds";
  if (place === 1000) return "Thousands";
  if (place === 10000) return "Ten-thousands";
  return `Place ${place}`;
}

function columnAdd(a, b) {
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    throw new Error("columnAdd supports integers only");
  }
  if (a < 0 || b < 0) {
    throw new Error("columnAdd supports non-negative integers only");
  }

  const aDigits = String(a).split("").map(Number);
  const bDigits = String(b).split("").map(Number);

  let i = aDigits.length - 1;
  let j = bDigits.length - 1;

  let carry = 0;
  let place = 1;

  const resultDigits = [];
  const steps = [];

  while (i >= 0 || j >= 0 || carry > 0) {
    const da = i >= 0 ? aDigits[i] : 0;
    const db = j >= 0 ? bDigits[j] : 0;

    const sum = da + db + carry;
    const digit = sum % 10;
    const nextCarry = Math.floor(sum / 10);

    const carryText = carry ? ` + carry ${carry}` : "";
    steps.push(
      `${placeName(place)}: ${da} + ${db}${carryText} = ${sum} → write ${digit}, carry ${nextCarry}`
    );

    resultDigits.unshift(digit);

    carry = nextCarry;
    i--;
    j--;
    place *= 10;
  }

  return {
    result: Number(resultDigits.join("")),
    steps
  };
}

module.exports = { columnAdd };