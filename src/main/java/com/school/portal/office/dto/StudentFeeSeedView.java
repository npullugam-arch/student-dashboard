package com.school.portal.office.dto;

public interface StudentFeeSeedView {
    String getStudentId();
    String getFullName();   // must match Student field getter OR alias from query
    Integer getStandard();
    String getSection();
    String getPhotoUrl();   // optional (if Student has photoUrl)
}
