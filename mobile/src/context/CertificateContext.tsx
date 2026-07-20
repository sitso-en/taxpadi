import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCertificates, getCertificateDownloadUrl, requestCertificate } from "@/services/certificates.service";

export type Certificate = {
  id: string;
  documentRef: string;
  taxType: string;
  periodStart: string;
  periodEnd: string;
  amountPaid: number;
  issuedAt: string;
  status: string;       // ACTIVE | EXPIRED | REVOKED
  validUntil: string | null;
};

type CertificateContextType = {
  certificates: Certificate[];
  validCertificates: number;
  loading: boolean;
  refreshCertificates: () => Promise<void>;
  downloadCertificate: (id: string) => Promise<string>;
  requestCertificate: (taxType: string, year: number) => Promise<void>;
};

const CertificateContext = createContext<CertificateContextType>(
  {} as CertificateContextType
);

function mapCertificate(item: any): Certificate {
  return {
    id: item.certificate_id,
    documentRef: item.document_ref,
    taxType: item.tax_type,
    periodStart: item.period_start,
    periodEnd: item.period_end,
    amountPaid: item.amount_paid,
    issuedAt: item.issued_at,
    status: (item.status ?? "ACTIVE").toUpperCase(),
    validUntil: item.valid_until ?? item.expires_at ?? null,
  };
}

export function CertificateProvider({ children }: { children: React.ReactNode }) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshCertificates = async () => {
    setLoading(true);
    try {
      const res = await getCertificates();
      setCertificates((res.data?.certificates ?? []).map(mapCertificate));
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCertificates();
  }, []);

  const downloadCertificate = async (id: string): Promise<string> => {
    const res = await getCertificateDownloadUrl(id);
    return res.data?.pdf_url ?? "";
  };

  const requestNewCertificate = async (taxType: string, year: number): Promise<void> => {
    await requestCertificate({
      tax_type: taxType,
      period_start: `${year}-01-01`,
      period_end: `${year}-12-31`,
    });
    await refreshCertificates();
  };

  const validCertificates = useMemo(
    () => certificates.filter((c) => c.status === "ACTIVE").length,
    [certificates]
  );

  return (
    <CertificateContext.Provider
      value={{ certificates, validCertificates, loading, refreshCertificates, downloadCertificate, requestCertificate: requestNewCertificate }}
    >
      {children}
    </CertificateContext.Provider>
  );
}

export function useCertificates() {
  return useContext(CertificateContext);
}
