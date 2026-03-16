// ===============================
// ✅ UPDATED: OfficeFeeBootstrapService.java
// (No backend behavior disturbed; only safer defaults)
// ===============================
package com.school.portal.office.service;

import com.school.portal.admin.repository.StudentRepository;
import com.school.portal.core.entity.Student;
import com.school.portal.core.entity.StudentFeeAccount;
import com.school.portal.core.repository.StudentFeeAccountRepository;
import com.school.portal.office.dto.BootstrapFeeAccountsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OfficeFeeBootstrapService {

    private final StudentRepository studentRepository;
    private final StudentFeeAccountRepository feeRepo;

    @Transactional
    public BootstrapFeeAccountsResponse bootstrapForAllActiveStudents() {

        List<Student> students = studentRepository.findByActiveTrueOrderByStandardAscSectionAscFullNameAsc();

        long created = 0;
        long skipped = 0;

        List<StudentFeeAccount> toCreate = new ArrayList<>();

        for (Student s : students) {
            if (s.getStudentId() == null || s.getStudentId().isBlank()) {
                continue; // safety
            }

            boolean exists = feeRepo.existsByStudentId(s.getStudentId());
            if (exists) {
                skipped++;
                continue;
            }

            StudentFeeAccount acc = StudentFeeAccount.builder()
                    .studentId(s.getStudentId())
                    .studentName(s.getFullName())
                    .standard(s.getStandard() != null ? s.getStandard() : 0)
                    .section(s.getSection() != null ? s.getSection() : "-")
                    .totalFee(0L)
                    .paidAmount(0L)
                    .dueAmount(0L)
                    .nextDueDate(null)
                    // ✅ Keep this (initial value), but note: list API will always fetch fresh profileUrl from Student table.
                    .photoUrl(s.getProfileUrl())
                    .hallTicketAllowed(true)
                    .build();

            toCreate.add(acc);
            created++;
        }

        if (!toCreate.isEmpty()) {
            feeRepo.saveAll(toCreate);
        }

        return BootstrapFeeAccountsResponse.builder()
                .totalActiveStudents(students.size())
                .created(created)
                .skippedAlreadyExists(skipped)
                .build();
    }
}