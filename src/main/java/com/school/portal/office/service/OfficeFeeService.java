// ===============================
// ✅ UPDATED: OfficeFeeService.java
// Fix: Always return fresh name/photo/standard/section from Student table
// ===============================
package com.school.portal.office.service;

import com.school.portal.admin.repository.StudentRepository;
import com.school.portal.core.entity.StudentFeeAccount;
import com.school.portal.core.repository.StudentFeeAccountRepository;
import com.school.portal.office.dto.FeeOverviewDto;
import com.school.portal.office.dto.FeeRowDto;
import com.school.portal.office.dto.UpdateFeeRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OfficeFeeService {

    private final StudentFeeAccountRepository feeRepo;
    private final StudentRepository studentRepository;

    // =============================
    // OVERVIEW
    // =============================
    public FeeOverviewDto overview() {
        List<StudentFeeAccount> all = feeRepo.findAll();

        long totalFee = 0, totalPaid = 0, totalDue = 0;
        for (StudentFeeAccount a : all) {
            totalFee += safe(a.getTotalFee());
            totalPaid += safe(a.getPaidAmount());
            totalDue += safe(a.getDueAmount());
        }

        return FeeOverviewDto.builder()
                .totalStudents(all.size())
                .hallTicketBlocked(feeRepo.countByHallTicketAllowedFalse())
                .totalFee(totalFee)
                .totalPaid(totalPaid)
                .totalDue(totalDue)
                .build();
    }

    // =============================
    // LIST (LEFT SIDE STUDENT LIST)
    // =============================
    public List<FeeRowDto> list(String q) {
        List<StudentFeeAccount> list;

        if (q == null || q.isBlank()) {
            list = feeRepo.findTop200ByOrderByStandardAscSectionAscStudentNameAsc();
        } else {
            list = feeRepo.findTop200ByStudentIdContainingIgnoreCaseOrStudentNameContainingIgnoreCaseOrderByStandardAscSectionAscStudentNameAsc(q, q);
        }

        return list.stream().map(this::toRow).toList();
    }

    // =============================
    // UPDATE FEE ACCOUNT
    // =============================
    public FeeRowDto upsert(String studentId, UpdateFeeRequest req) {

        StudentFeeAccount a = feeRepo.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("Fee account not found for studentId: " + studentId));

        long total = safe(req.getTotalFee());
        long paid = safe(req.getPaidAmount());
        long due = Math.max(0, total - paid);

        a.setTotalFee(total);
        a.setPaidAmount(paid);
        a.setDueAmount(due);
        a.setHallTicketAllowed(req.getHallTicketAllowed() != null ? req.getHallTicketAllowed() : a.getHallTicketAllowed());

        if (req.getNextDueDate() != null && !req.getNextDueDate().isBlank()) {
            a.setNextDueDate(LocalDate.parse(req.getNextDueDate()));
        } else {
            a.setNextDueDate(null);
        }

        feeRepo.save(a);

        return toRow(a);
    }

    // =============================
    // ✅ MAPPER (FIXED)
    // Always fetch latest from Student table
    // =============================
    private FeeRowDto toRow(StudentFeeAccount a) {

        var studentOpt = studentRepository.findByStudentId(a.getStudentId());

        String freshName = a.getStudentName();
        Integer freshStandard = a.getStandard();
        String freshSection = a.getSection();
        String freshPhoto = a.getPhotoUrl(); // fallback if student not found

        if (studentOpt.isPresent()) {
            var s = studentOpt.get();
            freshName = s.getFullName();
            freshStandard = s.getStandard();
            freshSection = s.getSection();
            freshPhoto = s.getProfileUrl();   // ✅ correct field in Student entity
        }

        return FeeRowDto.builder()
                .studentId(a.getStudentId())
                .studentName(freshName)
                .standard(freshStandard)
                .section(freshSection)
                .totalFee(a.getTotalFee())
                .paidAmount(a.getPaidAmount())
                .dueAmount(a.getDueAmount())
                .nextDueDate(a.getNextDueDate() != null ? a.getNextDueDate().toString() : null)
                .hallTicketAllowed(Boolean.TRUE.equals(a.getHallTicketAllowed()))
                .photoUrl(freshPhoto)
                .build();
    }

    private long safe(Long v) {
        return v == null ? 0 : v;
    }
}