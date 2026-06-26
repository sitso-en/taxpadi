package com.taxpadi.api.dto.admin;

import java.util.List;

import com.taxpadi.api.dto.common.PaginationInfo;

public class AdminUserListResponse {
    private List<AdminUserSummary> users;
    private PaginationInfo pagination;


    public AdminUserListResponse(List<AdminUserSummary> users, PaginationInfo pagination) {
        this.users = users;
        this.pagination = pagination;
    }


    public List<AdminUserSummary> getUsers() {
        return users;
    }
    public void setUsers(List<AdminUserSummary> users) {
        this.users = users;
    }


    public PaginationInfo getPagination() {
        return pagination;
    }
    public void setPagination(PaginationInfo pagination) {
        this.pagination = pagination;
    }
    
    
}
