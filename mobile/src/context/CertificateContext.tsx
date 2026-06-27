import React, {
  createContext,
  useContext,
  useState,
} from "react";

export type Certificate = {
  id: number;
  name: string;
  issueDate: string;
  status: "Valid" | "Expired";
};

type CertificateContextType = {
  certificates: Certificate[];
  validCertificates: number;
  addCertificate: (
    certificate: Certificate
  ) => void;
};

const CertificateContext =
  createContext<CertificateContextType>(
    {} as CertificateContextType
  );

export function CertificateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [certificates, setCertificates] =
    useState<Certificate[]>([
      {
        id: 1,
        name: "Tax Clearance Certificate",
        issueDate: "2026-06-01",
        status: "Valid",
      },
    ]);

  const validCertificates =
    certificates.filter(
      (certificate) =>
        certificate.status === "Valid"
    ).length;

  const addCertificate = (
    certificate: Certificate
  ) => {
    setCertificates((prev) => [
      ...prev,
      certificate,
    ]);
  };

  return (
    <CertificateContext.Provider
      value={{
        certificates,
        validCertificates,
        addCertificate,
      }}
    >
      {children}
    </CertificateContext.Provider>
  );
}

export function useCertificates() {
  return useContext(
    CertificateContext
  );
}