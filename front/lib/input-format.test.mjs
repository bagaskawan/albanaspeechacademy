import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_PHONE_DIGITS,
  MAX_RUPIAH_DIGITS,
  caretFromDigits,
  formatPhone,
  formatThousands,
  percentDigits,
  rupiahDigits,
} from "./input-format.ts";

test("rupiahDigits: digit saja, buang desimal, nol depan, dan potong 12 digit", () => {
  assert.equal(rupiahDigits("1500000"), "1500000");
  assert.equal(rupiahDigits("Rp 1.500.000"), "1500000");
  assert.equal(rupiahDigits("1.500.000,00"), "1500000");
  assert.equal(rupiahDigits("007"), "7");
  assert.equal(rupiahDigits("0"), "0");
  assert.equal(rupiahDigits("abc"), "");
  assert.equal(rupiahDigits(""), "");
  assert.equal(rupiahDigits("1234567890123"), "123456789012");
  assert.equal(MAX_RUPIAH_DIGITS, 12);
});

test("formatThousands memakai titik id-ID", () => {
  assert.equal(formatThousands("1500000"), "1.500.000");
  assert.equal(formatThousands("999"), "999");
  assert.equal(formatThousands("1000"), "1.000");
  assert.equal(formatThousands(""), "");
});

test("percentDigits: maksimal dua digit", () => {
  assert.equal(percentDigits("20"), "20");
  assert.equal(percentDigits("20%"), "20");
  assert.equal(percentDigits("150"), "15");
  assert.equal(percentDigits("05"), "5");
  assert.equal(percentDigits("x"), "");
});

test("formatPhone: nomor Indonesia 4-4-sisa", () => {
  assert.equal(formatPhone("081234567890"), "0812-3456-7890");
  assert.equal(formatPhone("+62 812 3456 7890"), "0812-3456-7890");
  assert.equal(formatPhone("6281234567890"), "0812-3456-7890");
  assert.equal(formatPhone("812345"), "0812-345");
  assert.equal(formatPhone("0812345678901"), "0812-3456-78901");
  assert.equal(formatPhone("08123456789012345"), "0812-3456-789012");
  assert.equal(formatPhone("0812"), "0812");
  assert.equal(formatPhone(""), "");
  assert.equal(MAX_PHONE_DIGITS, 14);
});

test("caretFromDigits meletakkan kursor sesudah digit ke-n", () => {
  assert.equal(caretFromDigits("1.500.000", 0), 0);
  assert.equal(caretFromDigits("1.500.000", 1), 1);
  assert.equal(caretFromDigits("1.500.000", 2), 3);
  assert.equal(caretFromDigits("1.500.000", 7), 9);
  assert.equal(caretFromDigits("0812-3456-7890", 5), 6);
  assert.equal(caretFromDigits("0812", 9), 4);
});
