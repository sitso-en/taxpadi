package com.taxpadi.api.common;

import java.time.LocalDateTime;

public class ApiResponse<T> {
    
    private Boolean success;
    private T data;
    private String message;
    private LocalDateTime timestamp = LocalDateTime.now();



    public ApiResponse(Boolean success, T data, String message) {
      this.success = success;
      this.data = data;
      this.message = message;
      this.timestamp = LocalDateTime.now();
  }

    // --- Getters and Setters ---

    public Boolean getSuccess() {
        return success;
    }
    public void setSuccess(Boolean success) {
        this.success = success;
    }


    public T getData() {
        return data;
    }
    public void setData(T data) {
        this.data= data;
    }


    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }


    public LocalDateTime getTimestamp() {
        return timestamp;
    }
}