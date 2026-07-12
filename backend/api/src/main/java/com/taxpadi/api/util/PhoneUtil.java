package com.taxpadi.api.util;

import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.taxpadi.api.exception.BadRequestException;

public class PhoneUtil {

    private static final PhoneNumberUtil UTIL = PhoneNumberUtil.getInstance();

    private PhoneUtil() {}

    public static String normalize(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new BadRequestException("Phone number is required");
        }
        try {
            var number = UTIL.parse(raw, "GH");
            if (!UTIL.isValidNumber(number)) {
                throw new BadRequestException("Invalid phone number");
            }
            return UTIL.format(number, PhoneNumberUtil.PhoneNumberFormat.E164);
        } catch (NumberParseException e) {
            throw new BadRequestException("Invalid phone number");
        }
    }
}
