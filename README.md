# Invoice System

## About

This is a desktop invoice system based on the Tamagui / Solito starter project.
It is a single page web application using a local SQLite file to store invoice data.

## 🏁 Start the app

From the command line:
- Install yarn (using homebrew on MacOs)
- Install dependencies: `yarn`
- Run the server locally: `yarn web`

Browse to http://localhost:3000 to use the application


## Test the app

From the command line:
- Run `yarn test`

There is one test which tests launching the app and it sometimes fails due to timeout.

## 🗂 Folder layout

The main apps are:

- `next` root directory for the desktop/web app
  - `pages` boilerplate plus some example pages I didn't delete
    - `api` requeset handlers for the server-side API which talk to the database
- `packages` 
  - `shared` shared between server and client
    - `Invoice.ts` data model and design decisions about the data model
    - `InvoiceSchema.ts` validation schema for data model using ajv
    - `InvoiceStore.ts` an interface for Invoice storage
    - `InMemoryInvoiceStore.ts` an invoice store used as a mock for tests
  - `server` files used by the next-js server
    - `SQLiteInvoiceStore.ts` a simple InvoiceStore implementation using a local SQLite db file
    - `store.ts` a singleton which ensures handlers share a database connection
  - `ui` components
    - 
  - `app` you'll be importing most files from `app/`
    - `features` (don't use a `screens` folder. organize by feature.)
      - `screen.tsx` - contains the homescreen with connection, navigation state
    - `provider` (contains the TamaguiProvider and ToastProvider)

### Dependencies installed not found in the starter project

- `sqlite` and `sqlite3` for validation
- `ajv`, `ajv-formats` and `ajv-errors` for draft and pending invoice validation and errors
- `lodash` using cloneDeep, set, and get for form mutators
- `nanoid` used to generate unique ids for items within an invoice

Notes:
- I tried using `react-final-form` which is a form library with some validation and state management - but forms don't seem to work with Tamagui so I rolled my own form and state management for this simple case.


### Design choices

- `API`
  - implemented a simple REST API.  GraphQL would be another possibility but more complex than needed for this use case.
  - `invoices`
    - returns an array of invoice summaries. A summary is the information needed in the inventory page
    - invoices are default sorted by last created, which is usable because the most recent work usually shows up on top
      - another option would be to sort by last modified, but that requires another field
    - optional parameters support filtering - only status is implemented but could be extended
    - pagination is supported as an optional limit and offset, but it's not used by the API
  - `upsertInvoice`
    - supports creating or updating an invoice. The id and status are contained within the body which is an invoice
  - `get`
    - returns the invoice selected from the inventory page
  - `requestInvoiceId`
    - this is used when creating a new invoice to reserve IDs so that we can show the ID while the user is editing the invoice.
    - the invoice is reserved in the `Deleted` state so it doesn't show up in the inventory page until saved
    - if an invoice is discarded, we don't hard delete but could clean up such invoices at a later point
    - an alternative would be to generate the ID but not to reserve it, but this could in an unlikely situation cause a conflict on save.
- `SQLite` is simple for this desktop use case, and doesn't require authentication or providing a key to a shared database
  - a future improvement would be to use a hosted database
  - the database could be implemented using NoSQL (Cosmos, Dynamo, Mongo) or a transactional database like Postgres
- `State Management`
  - most application state is hosted in the HomeScreen, which provides a setter for the Invoice being viewed or edited
  - if we support localStorage, we could always store into localStorage when setting the Invoice, then restore from localStorage on mount
  - to support discarding edits, we would record a backup copy of the invoice in the EditInvoice component. This could also be stored and restored in localStorage
- `Deleted` invoices remain in the database with a `Deleted` status.  They don't show up in search but could be recovered.
  - A future improvement for financial systems like this would be to keep an audit and change history, including:
    - each version of the invoice in time history
    - the user who made the change (created, edited, marked as paid, deleted)
- `Navigation`
  - Navigation is all based on buttons in the app, it is currently a single page URL 
  - A future improvement would be to support routes for viewing and editing invoices, then we could link and browsing to an invoice using the URL.
- `Errors`
  - the ClientInvoiceStore supports updating the ConnectionStatus
  - the error could be shown by a Toast or in the header
- `Dates` are represented as plain dates in YYYY-MM-DD format.
  - This avoids confusion with times and problems with timezones
  - The payment terms involves date calculations by day, and including the time of day can confuse matters
- `Currency` is represented using a string format with two decimal digits.
  - best practice is to avoid using floating point for storing or calculating money, since rounding errors may cause calculations to be off
