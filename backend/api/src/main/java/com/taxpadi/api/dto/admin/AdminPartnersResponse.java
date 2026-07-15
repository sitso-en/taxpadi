package com.taxpadi.api.dto.admin;

import java.util.List;

public class AdminPartnersResponse {

    private List<AdminPartnerItem> partners;

    public AdminPartnersResponse(List<AdminPartnerItem> partners) {
        this.partners = partners;
    }

    public List<AdminPartnerItem> getPartners() { return partners; }
}
