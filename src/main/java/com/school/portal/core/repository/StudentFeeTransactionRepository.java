package com.school.portal.core.repository;

import com.school.portal.core.entity.StudentFeeTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentFeeTransactionRepository extends JpaRepository<StudentFeeTransaction, Long> {

    List<StudentFeeTransaction> findTop200ByStudentIdOrderByPaidDateDescCreatedAtDesc(String studentId);

    // ✅ needed for edit safety
    Optional<StudentFeeTransaction> findByIdAndStudentId(Long id, String studentId);

    // ✅ needed to recompute snapshots after edit
    List<StudentFeeTransaction> findByStudentIdOrderByPaidDateAscCreatedAtAsc(String studentId);
}
