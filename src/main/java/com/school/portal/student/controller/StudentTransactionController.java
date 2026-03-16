package com.school.portal.student.controller;

import com.school.portal.core.repository.StudentFeeTransactionRepository;
import com.school.portal.office.dto.FeeTransactionDto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/student/api/transactions")
@RequiredArgsConstructor
public class StudentTransactionController {

    private final StudentFeeTransactionRepository txnRepo;

    @GetMapping("/me")
    public List<FeeTransactionDto> myTxns(Principal principal) {
        String studentId = principal != null ? principal.getName() : null;
        if(studentId == null || studentId.isBlank()){
            throw new RuntimeException("Student session not found");
        }

        return txnRepo.findTop200ByStudentIdOrderByPaidDateDescCreatedAtDesc(studentId)
                .stream()
                .map(t -> FeeTransactionDto.builder()
                        .id(t.getId())
                        .studentId(t.getStudentId())
                        .studentName(t.getStudentName())
                        .standard(t.getStandard())
                        .section(t.getSection())
                        .paidDate(t.getPaidDate() != null ? t.getPaidDate().toString() : null)
                        .paidAmount(t.getPaidAmount())
                        .totalFee(t.getTotalFee())
                        .paidTotalAfter(t.getPaidTotalAfter())
                        .dueAfter(t.getDueAfter())
                        .nextDueDate(t.getNextDueDate() != null ? t.getNextDueDate().toString() : null)
                        .remarks(t.getRemarks())
                        .createdBy(t.getCreatedBy())
                        .createdAt(t.getCreatedAt() != null ? t.getCreatedAt().toString() : null)
                        .build()
                )
                .toList();
    }
}
