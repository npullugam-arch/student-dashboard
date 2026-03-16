package com.school.portal.core.repository;

import com.school.portal.core.entity.StudentFeeAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentFeeAccountRepository extends JpaRepository<StudentFeeAccount, Long> {

    Optional<StudentFeeAccount> findByStudentId(String studentId);

    boolean existsByStudentId(String studentId); // ✅ add this

    List<StudentFeeAccount> findTop200ByOrderByStandardAscSectionAscStudentNameAsc();

    List<StudentFeeAccount> findTop200ByStudentIdContainingIgnoreCaseOrStudentNameContainingIgnoreCaseOrderByStandardAscSectionAscStudentNameAsc(
            String studentId, String studentName
    );

    long countByHallTicketAllowedFalse();
}
