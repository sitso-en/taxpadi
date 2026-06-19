package com.taxpadi.api.dto.certificate;

import com.taxpadi.api.dto.common.PaginationInfo;

import java.util.List;

public class CertificateListResponse {

    private List<CertificateListItem> certificates;
    private PaginationInfo pagination;

    public CertificateListResponse(List<CertificateListItem> certificates, PaginationInfo pagination) {
        this.certificates = certificates;
        this.pagination = pagination;
    }

    public List<CertificateListItem> getCertificates() { return certificates; }
    public PaginationInfo getPagination() { return pagination; }
}
