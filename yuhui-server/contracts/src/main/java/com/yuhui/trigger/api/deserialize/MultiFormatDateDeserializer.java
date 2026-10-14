package com.yuhui.trigger.api.deserialize;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

/**
 * Accepts both local datetime strings and ISO 8601 UTC strings for request payloads.
 */
public class MultiFormatDateDeserializer extends JsonDeserializer<Date> {

    private static final String[] PATTERNS = {
            "yyyy-MM-dd HH:mm:ss",
            "yyyy-MM-dd'T'HH:mm:ss.SSSX",
            "yyyy-MM-dd'T'HH:mm:ssX"
    };

    @Override
    public Date deserialize(JsonParser parser, DeserializationContext context) throws IOException {
        String value = parser.getValueAsString();
        if (value == null) {
            return null;
        }

        String text = value.trim();
        if (text.isEmpty()) {
            return null;
        }

        for (String pattern : PATTERNS) {
            try {
                SimpleDateFormat dateFormat = new SimpleDateFormat(pattern, Locale.getDefault());
                dateFormat.setLenient(false);
                if ("yyyy-MM-dd HH:mm:ss".equals(pattern)) {
                    dateFormat.setTimeZone(TimeZone.getTimeZone("GMT+8"));
                } else {
                    dateFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
                }
                return dateFormat.parse(text);
            } catch (ParseException ignored) {
            }
        }

        throw context.weirdStringException(text, Date.class,
                "supported formats: yyyy-MM-dd HH:mm:ss or ISO-8601");
    }
}
