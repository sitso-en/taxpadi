package com.taxpadi.api.dto.tax;

 public class WhtRateDto {
      private String category;
      private String rate;
      private String description;

      public WhtRateDto(String category, String rate, String description) {
          this.category = category;
          this.rate = rate;
          this.description = description;
      }

      public String getCategory() { return category; }

      public String getRate() { return rate; }
      
      public String getDescription() { return description; }
  }
