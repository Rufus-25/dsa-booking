import { performance } from 'node:perf_hooks';

const BOOKINGS = 100_000;
const LOOKUPS = 500;
const bookings = [];
const bookingsByReference = new Map();

for (let index = 0; index < BOOKINGS; index += 1) {
  const booking = { reference: `BOOKING-${index}` };
  bookings.push(booking);
  bookingsByReference.set(booking.reference, booking);
}

const targets = Array.from(
  { length: LOOKUPS },
  (_, index) => bookings[BOOKINGS - 1 - index].reference,
);

let result;
const arrayStart = performance.now();
for (const reference of targets) {
  result = bookings.find((booking) => booking.reference === reference);
}
const arrayMilliseconds = performance.now() - arrayStart;

const mapStart = performance.now();
for (const reference of targets) {
  result = bookingsByReference.get(reference);
}
const mapMilliseconds = performance.now() - mapStart;

if (result === undefined) {
  throw new Error('Benchmark lookup failed to find its target booking.');
}

console.log(`Array.find (${LOOKUPS} lookups in ${BOOKINGS} bookings): ${arrayMilliseconds.toFixed(2)} ms`);
console.log(`Map.get (${LOOKUPS} lookups in ${BOOKINGS} bookings): ${mapMilliseconds.toFixed(2)} ms`);
