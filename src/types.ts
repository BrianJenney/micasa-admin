export type FormOptions = {
  label: string;
  value: string;
};

export type SupportingDocument = {
  name: string;
};

export type Document = {
  name: string;
  completed: boolean;
  signatureId: string;
};

export type CounterOffers = {
  name: string;
  completed: boolean;
  signatureId: string;
  counterOfferId: string;
};

export type Buyer = {
  _id: string;
  name: string;
  counterOffers: CounterOffers[];
  supportingDocuments: SupportingDocument[];
};

export type User = {
  address?: string;
  email: string;
  firstName: string;
  lastName: string;
  _id: string;
  documents: Document[];
  county?: string;
  parcel: string;
  buyers: Buyer[];
};

export type UserData = User[];

export interface ListingDocumentFormProps {
  userData: User[];
}
