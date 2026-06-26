package com.taxpadi.api.dto.profile;

import java.util.List;

public class ProfileListResponse {

    private List<ProfileSummaryDto> profiles;
    private int total;

    public ProfileListResponse(List<ProfileSummaryDto> profiles, int total) {
        this.profiles = profiles;
        this.total = total;
    }

    public List<ProfileSummaryDto> getProfiles() { return profiles; }
    public void setProfiles(List<ProfileSummaryDto> profiles) { this.profiles = profiles; }

    public int getTotal() { return total; }
    public void setTotal(int total) { this.total = total; }
}
