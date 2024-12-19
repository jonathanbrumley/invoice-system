import { describe, it, expect } from "vitest";
import { validateDraftInvoice, validatePendingInvoice } from "../InvoiceSchema";
import { makeDraftInvoice, makeRandomInvoiceId, InvoiceStatus } from "../Invoice";

describe("Invoice Validators", () => {
  describe("Draft Invoice Validator", () => {
    it("should validate a valid draft invoice", () => {
      const draftInvoice = makeDraftInvoice(makeRandomInvoiceId());
      const isValid = validateDraftInvoice(draftInvoice);
      expect(isValid).toBe(true);
      expect(validateDraftInvoice.errors).toBeNull();
    });

    it("should fail if a required draft invoice field is missing", () => {
      const invalidDraftInvoice = {
        status: InvoiceStatus.Draft,
        total: "0.00",
      }; // Missing "id" and "items"

      const isValid = validateDraftInvoice(invalidDraftInvoice);
      expect(isValid).toBe(false);
      expect(validateDraftInvoice.errors).not.toBeNull();
    });

    it("should allow optional fields to be omitted in draft invoices", () => {
      const draftInvoice = {
        id: "AB1234",
        status: InvoiceStatus.Draft,
        items: [],
        total: "100.00",
      };

      const isValid = validateDraftInvoice(draftInvoice);
      expect(isValid).toBe(true);
      expect(validateDraftInvoice.errors).toBeNull();
    });

    it("should fail if total is in an invalid format", () => {
      const invalidDraftInvoice = {
        id: "AB1234",
        status: InvoiceStatus.Draft,
        items: [],
        total: "100",
      }; // Invalid total format

      const isValid = validateDraftInvoice(invalidDraftInvoice);
      expect(isValid).toBe(false);
      expect(validateDraftInvoice.errors).not.toBeNull();
    });
  });

  describe("Pending Invoice Validator", () => {
    it("should validate a valid pending invoice", () => {
      const pendingInvoice = {
        id: "XY9876",
        status: InvoiceStatus.Pending,
        createdAt: "2024-12-01",
        paymentDue: "2024-12-31",
        description: "Web development services",
        paymentTerms: 30,
        clientName: "John Doe",
        clientEmail: "john.doe@example.com",
        senderAddress: {
          street: "123 Main St",
          city: "Metropolis",
          postCode: "12345",
          country: "USA",
        },
        clientAddress: {
          street: "456 Elm St",
          city: "Gotham",
          postCode: "67890",
          country: "USA",
        },
        items: [
          { name: "Development", quantity: 1, price: "5000.00", total: "5000.00" },
        ],
        total: "5000.00",
      };

      const isValid = validatePendingInvoice(pendingInvoice);
      expect(isValid).toBe(true);
      expect(validatePendingInvoice.errors).toBeNull();
    });

    it("should fail if a required pending invoice field is missing", () => {
      const invalidPendingInvoice = {
        id: "XY9876",
        status: InvoiceStatus.Pending,
        total: "5000.00",
      }; // Missing multiple required fields

      const isValid = validatePendingInvoice(invalidPendingInvoice);
      expect(isValid).toBe(false);
      expect(validatePendingInvoice.errors).not.toBeNull();
    });

    it("should fail if senderAddress is incomplete in pending invoices", () => {
      const invalidPendingInvoice = {
        id: "XY9876",
        status: InvoiceStatus.Pending,
        createdAt: "2024-12-01",
        paymentDue: "2024-12-15",
        description: "Web development services",
        paymentTerms: 30,
        clientName: "John Doe",
        clientEmail: "john.doe@example.com",
        senderAddress: {
          street: "123 Main St",
          city: "Metropolis",
          // Missing postCode and country
        },
        items: [
          { name: "Development", quantity: 1, price: "5000.00", total: "5000.00" },
        ],
        total: "5000.00",
      };

      const isValid = validatePendingInvoice(invalidPendingInvoice);
      expect(isValid).toBe(false);
      expect(validatePendingInvoice.errors).not.toBeNull();
    });

    it("should fail if email is invalid in pending invoices", () => {
      const invalidPendingInvoice = {
        id: "XY9876",
        status: InvoiceStatus.Pending,
        createdAt: "2024-12-01",
        paymentDue: "2024-12-15",
        description: "Web development services",
        paymentTerms: 30,
        clientName: "John Doe",
        clientEmail: "not-an-email",
        senderAddress: {
          street: "123 Main St",
          city: "Metropolis",
          postCode: "12345",
          country: "USA",
        },
        items: [
          { name: "Development", quantity: 1, price: "5000.00", total: "5000.00" },
        ],
        total: "5000.00",
      };

      const isValid = validatePendingInvoice(invalidPendingInvoice);
      expect(isValid).toBe(false);
      expect(validatePendingInvoice.errors).not.toBeNull();
    });
  });
});
