import assert from "node:assert/strict";
import test from "node:test";
import { bundleAddOn, bundlePriceValid, bundleSaving, paymentSummary } from "./bundle.ts";

test("tambahan = paket − biaya asal, total sama dari dua arah", () => {
  assert.equal(bundleAddOn(2_900_000, 1_300_000), 1_600_000);
  assert.equal(bundleAddOn(2_900_000, 2_000_000), 900_000);
  assert.equal(1_300_000 + bundleAddOn(2_900_000, 1_300_000), 2_000_000 + bundleAddOn(2_900_000, 2_000_000));
});

test("harga paket sah hanya di antara biaya terbesar dan jumlah keduanya", () => {
  assert.equal(bundlePriceValid(2_900_000, 1_300_000, 2_000_000), true);
  assert.equal(bundlePriceValid(2_000_000, 1_300_000, 2_000_000), false);
  assert.equal(bundlePriceValid(3_300_000, 1_300_000, 2_000_000), false);
  assert.equal(bundlePriceValid(2_900_000, 0, 2_000_000), false);
  assert.equal(bundlePriceValid(Number.NaN, 1_300_000, 2_000_000), false);
});

test("hemat tidak pernah negatif", () => {
  assert.equal(bundleSaving(2_900_000, 1_300_000, 2_000_000), 400_000);
  assert.equal(bundleSaving(3_500_000, 1_300_000, 2_000_000), 0);
});

test("ringkasan lunas dan DP, dengan dan tanpa paket", () => {
  assert.deepEqual(paymentSummary(1_300_000, 20, "full"), { feeIdr: 1_300_000, payNowIdr: 1_300_000, remainingIdr: 0 });
  assert.deepEqual(paymentSummary(1_300_000, 20, "dp"), { feeIdr: 1_300_000, payNowIdr: 260_000, remainingIdr: 1_040_000 });
  assert.deepEqual(paymentSummary(2_900_000, 20, "dp"), { feeIdr: 2_900_000, payNowIdr: 580_000, remainingIdr: 2_320_000 });
  assert.deepEqual(paymentSummary(2_900_000, null, "dp"), { feeIdr: 2_900_000, payNowIdr: 2_900_000, remainingIdr: 0 });
  assert.deepEqual(paymentSummary(1_300_000, 20, ""), { feeIdr: 1_300_000, payNowIdr: 1_300_000, remainingIdr: 0 });
  assert.equal(paymentSummary(1_333_333, 20, "dp").payNowIdr, 266_667);
});
