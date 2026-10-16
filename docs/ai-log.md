# AI log

Every time you give an AI tool a significant prompt, add an entry. Three lines each.
"Nothing was wrong" is allowed, but it is rarely true. Your instructor will read this.

## Build 1

### Prompt 1: Build 1 prompt (docs/build-1.md)
- **What I asked:**
We are starting the Event Ticketing capstone in plain JavaScript (ES modules,
Node 22.13 or newer, no outside packages). It runs in the terminal only: no
server, no database. Read README.md and docs/build-1.md before you write
anything.

Create these files, and set "type": "module" in package.json.

1. src/domain/errors.js: a DomainError class that extends Error and carries a
   machine-readable code (for example VALIDATION, NOT_FOUND, SOLD_OUT).

2. src/domain/ids.js: newId() and newReference(). Use node:crypto, never
   Math.random. A reference is a short, readable booking code that is safe to
   read aloud.

3. src/domain/waitlistQueue.js: a first-in-first-out Queue class built as a
   linked list, with private fields. enqueue, dequeue, peek and size must all
   be fast (O(1)). Do not use array.shift().

4. src/domain/inventory.js: createStore(), createEvent, addTier, bookTickets,
   cancelBooking, findBookingByReference and joinWaitlist.
   - A booking is for 1 to 10 tickets from one tier.
   - If there are not enough seats, throw SOLD_OUT and change nothing.
   - Cancelling releases the seats. Cancelling twice is an error.
   - Find a booking by its reference in O(1) with a Map.

5. scripts/demo.js: tells the whole story. An event sells out, a booking is
   refused, two people join the waitlist, a booking is cancelled, and the next
   person in line is named.

6. scripts/benchmark-lookup.js: compares Map.get with Array.find over many
   bookings and prints both timings. Add "demo" and "benchmark" scripts to
   package.json.

Rules: money is whole cents (never decimals); validate every input and throw a
DomainError with a code; a failed booking must not change anything. When you
are done, list every file you created and any rule from this prompt that you
were unsure about.



- **What came back:**
It created 6 new files in two folders. In scripts folder, benchmark-lookup.js and demo.js were created. In src/domain, errors.js, ids.js, inventory.js and waitlistQueue.js were also created. And also my package.json was edited to include demo and benchmark in the scripts.

Upon running npm run build, it gives this as output which checks all the "When done":

Ada booked 2 of 3 seats (H443NER9).
Bayo was refused: SOLD_OUT — only 1 seat was left.
Bayo booked the last seat (NY7FWFF9); the event is sold out.
Waitlist: Chika, then Dapo.
Found Ada's booking by reference H443NER9.
Ada cancelled and released 2 seats. Next in line: Chika.

Although, I feel it can be better rendered, but it did the job.

- **What was wrong (or "nothing"):**

### Prompt 2:
- **What I asked:**
- **What came back:**
- **What was wrong (or "nothing"):**
