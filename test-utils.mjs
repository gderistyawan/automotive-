// Tes ringan tanpa dependensi: node scripts/test-utils.mjs  (atau npm test)
import assert from 'node:assert/strict';
import { calculateFlatCredit } from '../src/utils/creditCalculator.js';
import { buildWhatsAppUrl, sanitizeWhatsAppNumber, waMessages } from '../src/utils/whatsapp.js';
import { normalizeIndonesianPhone, validateBooking } from '../src/utils/booking.js';
import { formatIDR } from '../src/utils/format.js';
import { cars, getCarById } from '../src/data/cars.js';

let n = 0;
const t = (name, fn) => { fn(); n += 1; console.log('  ok -', name); };
const near = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);

// --- Kredit bunga flat ---
t('flat: 300jt, DP 20%, 3 th, 5%', () => {
  const r = calculateFlatCredit({ price: 300_000_000, dpMode: 'percent', dpPercent: 20, tenorYears: 3, annualRatePercent: 5 });
  assert.equal(r.ok, true);
  near(r.downPayment, 60_000_000);
  near(r.principal, 240_000_000);
  near(r.totalInterest, 36_000_000);          // 240jt x 5% x 3
  near(r.monthlyInstallment, 276_000_000 / 36); // 7.666.666,67
  near(r.totalPayment, 60_000_000 + 276_000_000);
});
t('flat: DP nominal 100jt dari 400jt, 5 th, 8%', () => {
  const r = calculateFlatCredit({ price: 400_000_000, dpMode: 'amount', dpAmount: 100_000_000, tenorYears: 5, annualRatePercent: 8 });
  near(r.principal, 300_000_000);
  near(r.totalInterest, 120_000_000);
  near(r.monthlyInstallment, 420_000_000 / 60);
  near(r.dpPercent, 25);
});
t('flat: bunga 0% & biaya tambahan masuk total, tidak dibungakan', () => {
  const r = calculateFlatCredit({ price: 120_000_000, dpMode: 'percent', dpPercent: 0, tenorYears: 1, annualRatePercent: 0, extraFees: 5_000_000 });
  near(r.monthlyInstallment, 10_000_000);
  near(r.totalPayment, 125_000_000);
});
t('validasi: DP > harga ditolak', () => {
  const r = calculateFlatCredit({ price: 100, dpMode: 'amount', dpAmount: 101, tenorYears: 2, annualRatePercent: 5 });
  assert.equal(r.ok, false); assert.ok(r.errors.dp);
});
t('validasi: DP negatif, harga 0, tenor 6, bunga negatif ditolak', () => {
  assert.ok(calculateFlatCredit({ price: 100, dpMode: 'amount', dpAmount: -1, tenorYears: 2, annualRatePercent: 5 }).errors.dp);
  assert.ok(calculateFlatCredit({ price: 0, dpPercent: 10, tenorYears: 2, annualRatePercent: 5 }).errors.price);
  assert.ok(calculateFlatCredit({ price: 100, dpPercent: 10, tenorYears: 6, annualRatePercent: 5 }).errors.tenorYears);
  assert.ok(calculateFlatCredit({ price: 100, dpPercent: 10, tenorYears: 2, annualRatePercent: -1 }).errors.annualRatePercent);
  assert.ok(calculateFlatCredit({ price: '', dpPercent: 10, tenorYears: 2, annualRatePercent: 5 }).errors.price);
});

// --- WhatsApp ---
t('nomor dibersihkan dari +, spasi, tanda hubung', () => {
  assert.equal(sanitizeWhatsAppNumber('+62 812-3456-7890'), '6281234567890');
});
t('URL WhatsApp dengan nomor', () => {
  assert.equal(buildWhatsAppUrl('Halo dunia', '62 812-0000-0000'), 'https://wa.me/6281200000000?text=Halo%20dunia');
});
t('URL WhatsApp tanpa nomor memakai wa.me/?text=', () => {
  assert.ok(buildWhatsAppUrl('Halo', '').startsWith('https://wa.me/?text='));
});
t('pesan mobil memuat nama kendaraan', () => {
  const m = waMessages.car(getCarById('terra-x'));
  assert.ok(m.includes('Terra X') && m.startsWith('Halo Sales DRIVEPULSE'));
});

// --- Booking ---
t('normalisasi nomor HP Indonesia', () => {
  assert.equal(normalizeIndonesianPhone('0812-3456-7890'), '6281234567890');
  assert.equal(normalizeIndonesianPhone('+62 812 3456 7890'), '6281234567890');
  assert.equal(normalizeIndonesianPhone('123'), '');
  assert.equal(normalizeIndonesianPhone('0712345678'), '');
});
t('validasi booking', () => {
  const ok = { fullName: 'Budi Santoso', whatsapp: '081234567890', vehicle: 'terra-x', date: '2030-01-01', time: '10:00', branch: 'main', consent: true };
  assert.deepEqual(validateBooking(ok, '2029-12-31'), {});
  assert.ok(validateBooking({ ...ok, date: '2029-01-01' }, '2029-12-31').date);
  assert.ok(validateBooking({ ...ok, consent: false }).consent);
  assert.ok(validateBooking({ ...ok, whatsapp: 'abc' }).whatsapp);
  assert.ok(Object.keys(validateBooking({})).length >= 6);
});

// --- Data & format ---
t('data kendaraan: id unik, semua kategori filter terwakili', () => {
  assert.equal(new Set(cars.map((c) => c.id)).size, cars.length);
  for (const cat of ['SUV', 'Sedan', 'Hatchback', 'Electric Vehicle', 'Hybrid']) assert.ok(cars.some((c) => c.category === cat), cat);
  assert.ok(cars.every((c) => c.isDemo === true));
});
t('formatIDR', () => {
  assert.ok(formatIDR(7666666.67).includes('7.666.667'));
  assert.equal(formatIDR(null), '—');
});

console.log(`\n${n} tes lulus.`);
