package com.school.portal.admin.repository;

import com.school.portal.core.entity.StandardSubject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StandardSubjectRepository extends JpaRepository<StandardSubject, Long> {

    List<StandardSubject> findByStandardAndActiveTrue(Integer standard);

    // ✅ NEW: prevent duplicate standard+subject mapping
    Optional<StandardSubject> findByStandardAndSubject_Id(Integer standard, Long subjectId);
}