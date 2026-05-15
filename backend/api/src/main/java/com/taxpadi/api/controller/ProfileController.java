package com.taxpadi.api.controller;                                                           
                                                                                                
  import com.taxpadi.api.common.ApiResponse;                                                    
  import com.taxpadi.api.dto.profile.*;                                                         
  import com.taxpadi.api.model.User;                                                            
  import com.taxpadi.api.security.TaxPadiUserDetails;
  import com.taxpadi.api.service.ProfileService;
  import jakarta.validation.Valid;
  import org.springframework.http.HttpStatus;
  import org.springframework.http.ResponseEntity;
  import org.springframework.security.core.annotation.AuthenticationPrincipal;
  import org.springframework.web.bind.annotation.*;

  import java.util.Map;
  import java.util.UUID;

  @RestController
  @RequestMapping("/api/v1/profiles")
  public class ProfileController {

      private final ProfileService profileService;

      public ProfileController(ProfileService profileService) {
          this.profileService = profileService;
      }

      @GetMapping
      public ResponseEntity<ApiResponse<Map<String, Object>>> getProfiles(
              @AuthenticationPrincipal TaxPadiUserDetails userDetails) {
          User user = userDetails.getUser();
          Map<String, Object> data = profileService.getProfiles(user);
          return ResponseEntity.ok(new ApiResponse<>(true, data, "Profiles retrieved successfully."));
      }

      @PostMapping
      public ResponseEntity<ApiResponse<CreateProfileResponse>> createProfile(
              @AuthenticationPrincipal TaxPadiUserDetails userDetails,
              @Valid @RequestBody CreateProfileRequest request) {
          User user = userDetails.getUser();
          CreateProfileResponse data = profileService.createProfile(user, request);
          return ResponseEntity.status(HttpStatus.CREATED)
                  .body(new ApiResponse<>(true, data, "New profile created successfully."));
      }

      @PutMapping("/{id}")
      public ResponseEntity<ApiResponse<UpdateProfileResponse>> updateProfile(
              @AuthenticationPrincipal TaxPadiUserDetails userDetails,
              @PathVariable UUID id,
              @RequestBody UpdateProfileRequest request) {
          User user = userDetails.getUser();
          UpdateProfileResponse data = profileService.updateProfile(user, id, request);
          return ResponseEntity.ok(new ApiResponse<>(true, data, "Profile updated successfully."));
      }

      @DeleteMapping("/{id}")
      public ResponseEntity<ApiResponse<Void>> deleteProfile(
              @AuthenticationPrincipal TaxPadiUserDetails userDetails,
              @PathVariable UUID id) {
          User user = userDetails.getUser();
          profileService.deleteProfile(user, id);
          return ResponseEntity.ok(new ApiResponse<>(true, null, "Profile deleted successfully."));
      }

      @PutMapping("/{id}/switch")
      public ResponseEntity<ApiResponse<Map<String, Object>>> switchProfile(
              @AuthenticationPrincipal TaxPadiUserDetails userDetails,
              @PathVariable UUID id) {
          User user = userDetails.getUser();
          SwitchProfileResponse active = profileService.switchProfile(user, id);
          return ResponseEntity.ok(new ApiResponse<>(true, Map.of("active_profile", active),
                  "Active profile switched successfully."));
      }
  }