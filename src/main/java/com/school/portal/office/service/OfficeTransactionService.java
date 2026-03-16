package com.school.portal.office.service;

import com.school.portal.admin.repository.StudentRepository;
import com.school.portal.core.entity.StudentFeeAccount;
import com.school.portal.core.entity.StudentFeeTransaction;
import com.school.portal.core.repository.StudentFeeAccountRepository;
import com.school.portal.core.repository.StudentFeeTransactionRepository;
import com.school.portal.office.dto.AddTransactionRequest;
import com.school.portal.office.dto.FeeTransactionDto;
import com.school.portal.office.dto.UpdateTransactionRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OfficeTransactionService {
    private final StudentRepository studentRepository; 
    private final StudentFeeAccountRepository feeRepo;
    private final StudentFeeTransactionRepository txnRepo;

    // =========================
    // LIST
    // =========================
    public List<FeeTransactionDto> listForStudent(String studentId) {
        return txnRepo.findTop200ByStudentIdOrderByPaidDateDescCreatedAtDesc(studentId)
                .stream().map(this::toDto).toList();
    }

    // =========================
    // ADD (your existing logic kept)
    // =========================
    public FeeTransactionDto add(String studentId, AddTransactionRequest req, Principal principal) {

        StudentFeeAccount acc = feeRepo.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("Fee account not found for studentId: " + studentId));

        long paidNow = safe(req.getPaidAmount());
        if (paidNow <= 0) throw new RuntimeException("Paid amount must be > 0");

        LocalDate paidDate = (req.getPaidDate() != null && !req.getPaidDate().isBlank())
                ? LocalDate.parse(req.getPaidDate())
                : LocalDate.now();

        // compute new totals
        long totalFee = safe(acc.getTotalFee());
        long paidBefore = safe(acc.getPaidAmount());
        long paidAfter = paidBefore + paidNow;
        if (paidAfter > totalFee) paidAfter = totalFee; // clamp
        long dueAfter = Math.max(0, totalFee - paidAfter);

        // update fee account
        acc.setPaidAmount(paidAfter);
        acc.setDueAmount(dueAfter);

        if (req.getNextDueDate() != null && !req.getNextDueDate().isBlank()) {
            acc.setNextDueDate(LocalDate.parse(req.getNextDueDate()));
        } else {
            acc.setNextDueDate(null);
        }

        // auto hall ticket rule (optional): allow only when due=0
        acc.setHallTicketAllowed(dueAfter == 0);

        feeRepo.save(acc);

        // create transaction snapshot
        String createdBy = principal != null ? principal.getName() : "OFFICE";

        StudentFeeTransaction t = StudentFeeTransaction.builder()
                .studentId(acc.getStudentId())
                .studentName(acc.getStudentName())
                .standard(acc.getStandard())
                .section(acc.getSection())
                .paidDate(paidDate)
                .paidAmount(paidNow)
                .totalFee(totalFee)
                .paidTotalAfter(paidAfter)
                .dueAfter(dueAfter)
                .nextDueDate(acc.getNextDueDate())
                .remarks(req.getRemarks())
                .createdBy(createdBy)
                .createdAt(LocalDateTime.now())
                .build();

        txnRepo.save(t);

        return toDto(t);
    }

    // =========================
    // ✅ EDIT TRANSACTION
    // =========================
    public FeeTransactionDto update(String studentId, Long txId, UpdateTransactionRequest req, Principal principal) {

        StudentFeeTransaction tx = txnRepo.findByIdAndStudentId(txId, studentId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (req.getPaidAmount() == null || req.getPaidAmount() < 0) {
            throw new RuntimeException("Paid amount must be >= 0");
        }
        if (req.getPaidDate() == null || req.getPaidDate().isBlank()) {
            throw new RuntimeException("Paid date is required");
        }

        // update editable fields
        tx.setPaidAmount(req.getPaidAmount());
        tx.setPaidDate(LocalDate.parse(req.getPaidDate()));

        if (req.getNextDueDate() != null && !req.getNextDueDate().isBlank()) {
            tx.setNextDueDate(LocalDate.parse(req.getNextDueDate()));
        } else {
            tx.setNextDueDate(null);
        }

        tx.setRemarks(req.getRemarks());

        // keep audit (optional)
        String editedBy = principal != null ? principal.getName() : "OFFICE";
        tx.setCreatedBy(editedBy);

        txnRepo.save(tx);

        // ✅ recompute all snapshots + update fee account
        recomputeSnapshots(studentId);

        // return updated (after recompute)
        StudentFeeTransaction updated = txnRepo.findByIdAndStudentId(txId, studentId)
                .orElseThrow(() -> new RuntimeException("Transaction not found after update"));

        return toDto(updated);
    }

    // =========================
    // ✅ DELETE TRANSACTION
    // =========================
    public void delete(String studentId, Long txId) {

        StudentFeeTransaction tx = txnRepo.findByIdAndStudentId(txId, studentId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        txnRepo.delete(tx);

        // ✅ recompute after delete too
        recomputeSnapshots(studentId);
    }

    // =========================
    // ✅ Recompute snapshots for all transactions of student
    // Updates:
    // - paidTotalAfter, dueAfter for each txn
    // - feeAccount: paidAmount, dueAmount, nextDueDate, hallTicketAllowed
    // =========================
    private void recomputeSnapshots(String studentId) {

        StudentFeeAccount acc = feeRepo.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("Fee account not found for studentId: " + studentId));

        long totalFee = safe(acc.getTotalFee());

        // chronological recompute
        List<StudentFeeTransaction> all = txnRepo.findByStudentIdOrderByPaidDateAscCreatedAtAsc(studentId);

        long runningPaid = 0;
        StudentFeeTransaction last = null;

        for (StudentFeeTransaction t : all) {
            long paid = safe(t.getPaidAmount());
            runningPaid += paid;

            if (runningPaid > totalFee) runningPaid = totalFee; // clamp

            long due = Math.max(0, totalFee - runningPaid);

            t.setTotalFee(totalFee);
            t.setPaidTotalAfter(runningPaid);
            t.setDueAfter(due);

            last = t;
        }

        txnRepo.saveAll(all);

        // update fee account from recompute
        acc.setPaidAmount(runningPaid);
        acc.setDueAmount(Math.max(0, totalFee - runningPaid));

        if (last != null) {
            acc.setNextDueDate(last.getNextDueDate());
        } else {
            acc.setNextDueDate(null);
        }

        // keep your rule: allow only when due=0
        acc.setHallTicketAllowed(acc.getDueAmount() != null && acc.getDueAmount() == 0);

        feeRepo.save(acc);
    }

    // =========================
    // Mapper
    // =========================
    private FeeTransactionDto toDto(StudentFeeTransaction t) {
        return FeeTransactionDto.builder()
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
                .build();
    }

    private long safe(Long v) { return v == null ? 0 : v; }
}
