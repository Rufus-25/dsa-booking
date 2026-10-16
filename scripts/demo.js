import {
  addTier,
  bookTickets,
  cancelBooking,
  createEvent,
  createStore,
  findBookingByReference,
  joinWaitlist,
} from '../src/domain/inventory.js';

const store = createStore();
const event = createEvent(store, { name: 'Summer Sounds' });
const tier = addTier(store, event.id, {
  name: 'General admission',
  priceCents: 2500,
  capacity: 3,
});

const ada = bookTickets(store, {
  eventId: event.id,
  tierId: tier.id,
  attendeeName: 'Ada',
  quantity: 2,
});
console.log(`Ada booked ${ada.quantity} of ${tier.capacity} seats (${ada.reference}).`);

try {
  bookTickets(store, {
    eventId: event.id,
    tierId: tier.id,
    attendeeName: 'Bayo',
    quantity: 2,
  });
} catch (error) {
  if (error.code !== 'SOLD_OUT') {
    throw error;
  }
  console.log(`Bayo was refused: ${error.code} — only ${tier.available} seat was left.`);
}

const bayo = bookTickets(store, {
  eventId: event.id,
  tierId: tier.id,
  attendeeName: 'Bayo',
  quantity: 1,
});
console.log(`Bayo booked the last seat (${bayo.reference}); the event is sold out.`);

const chika = joinWaitlist(store, {
  eventId: event.id,
  tierId: tier.id,
  attendeeName: 'Chika',
});
const dapo = joinWaitlist(store, {
  eventId: event.id,
  tierId: tier.id,
  attendeeName: 'Dapo',
});
console.log(`Waitlist: ${chika.attendeeName}, then ${dapo.attendeeName}.`);

const foundBooking = findBookingByReference(store, ada.reference);
console.log(`Found ${foundBooking.attendeeName}'s booking by reference ${foundBooking.reference}.`);

cancelBooking(store, ada.reference);
const nextInLine = store.waitlists.get(tier.id).peek();
console.log(`Ada cancelled and released ${ada.quantity} seats. Next in line: ${nextInLine.attendeeName}.`);
