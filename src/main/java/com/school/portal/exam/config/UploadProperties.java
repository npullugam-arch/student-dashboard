package com.school.portal.exam.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.upload")
public class UploadProperties {
    /**
     * default: uploads/answer_sheets
     */
    private String answerSheetsDir = "uploads/answer_sheets";
}
