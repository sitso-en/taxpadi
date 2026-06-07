package com.taxpadi.api.dto.transaction;

import java.util.List;

public class ImportHistoryListResponse {

    private List<ImportHistoryItem> imports;
    private int total;

    public List<ImportHistoryItem> getImports() { return imports; }
    public void setImports(List<ImportHistoryItem> imports) { this.imports = imports; }

    public int getTotal() { return total; }
    public void setTotal(int total) { this.total = total; }
}
