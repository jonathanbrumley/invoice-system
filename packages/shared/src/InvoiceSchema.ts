import { Ajv, JSONSchemaType } from 'ajv';
import addFormats from 'ajv-formats';
import addErrors from 'ajv-errors';
import { Invoice, InvoiceStatus, InvoiceAddress, PaymentTerm } from "./Invoice";

const datePattern = "^(\\d{4})-(\\d{2})-(\\d{2})$";
const dateErrorMessage = "Date format must be YYYY-MM-DD";
const moneyPattern = "^\\d+\\.\\d{2}$";
const moneyErrorMessage = "A valid amount must include two digits after the decimal, e.g. '0.23' or '500.00'";

const makeInvoiceAddressSchema = (
  requiredInvoiceAddressFields: string[],
): JSONSchemaType<InvoiceAddress> => {
  const schema: JSONSchemaType<InvoiceAddress> = {
    type: "object",
    nullable: true,
    properties: {
      street: { type: "string", nullable: true },
      city: { type: "string", nullable: true },
      postCode: { type: "string", nullable: true },
      country: { type: "string", nullable: true },
    },
    required: requiredInvoiceAddressFields as any,
  };
  return schema;
}

const makeInvoiceSchema = (
  requiredInvoiceFields: string[],
  requiredInvoiceAddressFields: string[],
  requiredInvoiceItemFields: string[]): JSONSchemaType<Invoice> => {
  const schema: JSONSchemaType<Invoice> = {
    type: "object",
    properties: {
      id: {
        type: "string",
        pattern: "^[A-Z]{2}[0-9]{4}$", // 2 uppercase letters + 4 digits
      },
      status: {
        type: "string",
        enum: [InvoiceStatus.Deleted, InvoiceStatus.Draft, InvoiceStatus.Pending, InvoiceStatus.Paid],
      },
      createdAt: { type: "string", pattern: datePattern },
      paymentDue: { type: "string", pattern: datePattern, nullable: true },
      description: { type: "string", nullable: true },
      paymentTerms: {
        type: "integer",
        enum: [PaymentTerm.Net1Day, PaymentTerm.Net7Days, PaymentTerm.Net30Days],
        nullable: true,
      },
      clientName: { type: "string", nullable: true },
      clientEmail: { type: "string", format: "email", nullable: true },
      senderAddress: makeInvoiceAddressSchema(requiredInvoiceAddressFields) as any,
      clientAddress: makeInvoiceAddressSchema(requiredInvoiceAddressFields) as any,
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string", nullable: true },
            quantity: { type: "integer", minimum: 0, nullable: true },
            price: { type: "string", pattern: moneyPattern, nullable: true },
            total: { type: "string", pattern: moneyPattern, nullable: true },
          },
          required: requiredInvoiceItemFields as any,
          errorMessage: {
            properties: {
              price: moneyErrorMessage,
              total: moneyErrorMessage,
            },
          },
        },
      },
      total: { type: "string", pattern: moneyPattern },
    },
    required: requiredInvoiceFields as any,
    errorMessage: {
      properties: {
        createdAt: dateErrorMessage,
        paymentDue: dateErrorMessage,
        total: moneyErrorMessage,
      },
    },
  };
  return schema;
}

const ajv = new Ajv({allErrors: true});
addFormats(ajv); // Adds support for the "email" format
addErrors(ajv); // Adds support for custom errors

const draftInvoiceSchema = makeInvoiceSchema(["id", "status", "items", "total"], [], []);
export const validateDraftInvoice = ajv.compile(draftInvoiceSchema);

const pendingInvoiceSchema = makeInvoiceSchema(
  [
    "id",
    "status",
    "createdAt",
    "paymentDue",
    "description",
    "paymentTerms",
    "clientName",
    "clientEmail",
    "senderAddress",
    "items",
    "total",
  ],
  ["street", "city", "postCode", "country"],
  ["name", "quantity", "price", "total"]);
  export const validatePendingInvoice = ajv.compile(pendingInvoiceSchema);
