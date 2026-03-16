package com.school.portal.student.controller;

import com.school.portal.admin.repository.StudentRepository;
import com.school.portal.core.entity.Student;
import com.school.portal.core.entity.StudentFeeAccount;
import com.school.portal.core.entity.StudentFeeTransaction;
import com.school.portal.core.repository.StudentFeeAccountRepository;
import com.school.portal.core.repository.StudentFeeTransactionRepository;
import com.school.portal.office.dto.FeeTransactionDto;
import com.school.portal.student.dto.StudentFeeMeDto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/student/api/fees")
@RequiredArgsConstructor
public class StudentFeeController {

    private final StudentRepository studentRepository;
    private final StudentFeeAccountRepository feeRepo;

    // ✅ transactions
    private final StudentFeeTransactionRepository txRepo;

    // =============================
    // ✅ Fee summary (FIXED: name/photo from Student table)
    // =============================
    @GetMapping("/me")
    public StudentFeeMeDto me(Principal principal) {

        String studentId = principal != null ? principal.getName() : null;

        if (studentId == null || studentId.isBlank()) {
            throw new RuntimeException("Student session not found");
        }

        // fee amounts from fee account (correct)
        StudentFeeAccount a = feeRepo.findByStudentId(studentId)
                .orElseThrow(() ->
                        new RuntimeException("Fee account not found for studentId: " + studentId)
                );

        // ✅ fresh profile info from Student table
        Student s = studentRepository.findByStudentId(studentId)
                .orElse(null);

        String freshName = (s != null && s.getFullName() != null) ? s.getFullName() : a.getStudentName();
        Integer freshStd = (s != null && s.getStandard() != null) ? s.getStandard() : a.getStandard();
        String freshSec = (s != null && s.getSection() != null) ? s.getSection() : a.getSection();
        String freshPhoto = (s != null) ? s.getProfileUrl() : a.getPhotoUrl();

        return StudentFeeMeDto.builder()
                .studentId(a.getStudentId())
                .studentName(freshName)          // ✅ UPDATED
                .standard(freshStd)              // ✅ UPDATED
                .section(freshSec)               // ✅ UPDATED
                .totalFee(a.getTotalFee())
                .paidAmount(a.getPaidAmount())
                .dueAmount(a.getDueAmount())
                .nextDueDate(a.getNextDueDate() != null ? a.getNextDueDate().toString() : null)
                .hallTicketAllowed(Boolean.TRUE.equals(a.getHallTicketAllowed()))
                .photoUrl(freshPhoto)            // ✅ UPDATED
                .build();
    }

    // =============================
    // TRANSACTIONS ENDPOINT
    // =============================
    @GetMapping("/me/transactions")
    public List<FeeTransactionDto> myTransactions(Principal principal) {

        String studentId = principal != null ? principal.getName() : null;

        if (studentId == null || studentId.isBlank()) {
            throw new RuntimeException("Student session not found");
        }

        List<StudentFeeTransaction> txList =
                txRepo.findTop200ByStudentIdOrderByPaidDateDescCreatedAtDesc(studentId);

        return txList.stream().map(tx -> FeeTransactionDto.builder()

                .id(tx.getId())

                .studentId(tx.getStudentId())
                .studentName(tx.getStudentName())
                .standard(tx.getStandard())
                .section(tx.getSection())

                .paidDate(tx.getPaidDate() != null ?
                        tx.getPaidDate().toString() : null)

                .paidAmount(tx.getPaidAmount())

                .totalFee(tx.getTotalFee())
                .paidTotalAfter(tx.getPaidTotalAfter())
                .dueAfter(tx.getDueAfter())

                .nextDueDate(tx.getNextDueDate() != null ?
                        tx.getNextDueDate().toString() : null)

                .remarks(tx.getRemarks())

                .createdBy(tx.getCreatedBy())

                .createdAt(tx.getCreatedAt() != null ?
                        tx.getCreatedAt().toString() : null)

                .build()
        ).toList();
    }
}