import { DomainError } from './errors.js';
import { newId, newReference } from './ids.js';
import { Queue } from './waitlistQueue.js';

const MIN_TICKETS_PER_BOOKING = 1;
const MAX_TICKETS_PER_BOOKING = 10;

function validationError(message) {
  throw new DomainError(message, 'VALIDATION');
}

function requireStore(store) {
  if (
    store === null
    || typeof store !== 'object'
    || !(store.events instanceof Map)
    || !(store.bookings instanceof Map)
    || !(store.bookingsByReference instanceof Map)
    || !(store.waitlists instanceof Map)
  ) {
    validationError('A valid store is required.');
  }
}

function requireText(value, label) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    validationError(`${label} must be a non-empty string.`);
  }

  return value.trim();
}

function requireDetails(details, label) {
  if (details === null || typeof details !== 'object' || Array.isArray(details)) {
    validationError(`${label} details must be an object.`);
  }
}

function requireEvent(store, eventId) {
  const id = requireText(eventId, 'Event id');
  const event = store.events.get(id);

  if (event === undefined) {
    throw new DomainError(`Event "${id}" was not found.`, 'NOT_FOUND');
  }

  return event;
}

function requireTier(event, tierId) {
  const id = requireText(tierId, 'Tier id');
  const tier = event.tiers.get(id);

  if (tier === undefined) {
    throw new DomainError(`Ticket tier "${id}" was not found.`, 'NOT_FOUND');
  }

  return tier;
}

export function createStore() {
  return {
    events: new Map(),
    bookings: new Map(),
    bookingsByReference: new Map(),
    waitlists: new Map(),
  };
}

export function createEvent(store, details) {
  requireStore(store);
  requireDetails(details, 'Event');

  const name = requireText(details.name, 'Event name');
  const event = {
    id: newId(),
    name,
    tiers: new Map(),
  };

  store.events.set(event.id, event);
  return event;
}

export function addTier(store, eventId, details) {
  requireStore(store);
  requireDetails(details, 'Ticket tier');

  const event = requireEvent(store, eventId);
  const name = requireText(details.name, 'Ticket tier name');
  const { priceCents, capacity } = details;

  if (!Number.isSafeInteger(priceCents) || priceCents < 0) {
    validationError('Ticket price must be a non-negative whole number of cents.');
  }

  if (!Number.isSafeInteger(capacity) || capacity < 1) {
    validationError('Ticket tier capacity must be a positive whole number.');
  }

  const tier = {
    id: newId(),
    name,
    priceCents,
    capacity,
    available: capacity,
  };

  event.tiers.set(tier.id, tier);
  return tier;
}

export function bookTickets(store, details) {
  requireStore(store);
  requireDetails(details, 'Booking');

  const event = requireEvent(store, details.eventId);
  const tier = requireTier(event, details.tierId);
  const attendeeName = requireText(details.attendeeName, 'Attendee name');
  const { quantity } = details;

  if (
    !Number.isSafeInteger(quantity)
    || quantity < MIN_TICKETS_PER_BOOKING
    || quantity > MAX_TICKETS_PER_BOOKING
  ) {
    validationError('A booking must contain between 1 and 10 tickets.');
  }

  if (tier.available < quantity) {
    throw new DomainError(
      `Only ${tier.available} ticket(s) remain in the "${tier.name}" tier.`,
      'SOLD_OUT',
    );
  }

  const totalCents = tier.priceCents * quantity;
  if (!Number.isSafeInteger(totalCents)) {
    validationError('Booking total must be a safe whole number of cents.');
  }

  let reference = newReference();
  while (store.bookingsByReference.has(reference)) {
    reference = newReference();
  }

  const booking = {
    id: newId(),
    reference,
    eventId: event.id,
    tierId: tier.id,
    attendeeName,
    quantity,
    totalCents,
    status: 'confirmed',
  };

  tier.available -= quantity;
  store.bookings.set(booking.id, booking);
  store.bookingsByReference.set(booking.reference, booking);
  return booking;
}

export function cancelBooking(store, reference) {
  requireStore(store);
  const bookingReference = requireText(reference, 'Booking reference');
  const booking = store.bookingsByReference.get(bookingReference);

  if (booking === undefined) {
    throw new DomainError(`Booking "${bookingReference}" was not found.`, 'NOT_FOUND');
  }

  if (booking.status === 'cancelled') {
    throw new DomainError(`Booking "${bookingReference}" is already cancelled.`, 'ALREADY_CANCELLED');
  }

  const event = requireEvent(store, booking.eventId);
  const tier = requireTier(event, booking.tierId);

  tier.available += booking.quantity;
  booking.status = 'cancelled';
  return booking;
}

export function findBookingByReference(store, reference) {
  requireStore(store);
  const bookingReference = requireText(reference, 'Booking reference');
  const booking = store.bookingsByReference.get(bookingReference);

  if (booking === undefined) {
    throw new DomainError(`Booking "${bookingReference}" was not found.`, 'NOT_FOUND');
  }

  return booking;
}

export function joinWaitlist(store, details) {
  requireStore(store);
  requireDetails(details, 'Waitlist');

  const event = requireEvent(store, details.eventId);
  const tier = requireTier(event, details.tierId);
  const attendeeName = requireText(details.attendeeName, 'Attendee name');
  let queue = store.waitlists.get(tier.id);

  if (queue === undefined) {
    queue = new Queue();
    store.waitlists.set(tier.id, queue);
  }

  const entry = {
    id: newId(),
    eventId: event.id,
    tierId: tier.id,
    attendeeName,
  };

  queue.enqueue(entry);
  return entry;
}
