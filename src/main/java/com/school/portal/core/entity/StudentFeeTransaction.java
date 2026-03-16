package com.school.portal.core.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "student_fee_transactions",
        indexes = {
                @Index(name = "idx_txn_student", columnList = "student_id"),
                @Index(name = "idx_txn_paid_date", columnList = "paid_date"),
                @Index(name = "idx_txn_created_at", columnList = "created_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentFeeTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="student_id", nullable=false, length=30)
    private String studentId;

    @Column(name="student_name", nullable=false, length=120)
    private String studentName;

    @Column(nullable = false)
    private Integer standard;

    @Column(nullable = false, length = 5)
    private String section;

    @Column(name="paid_date", nullable=false)
    private LocalDate paidDate;

    @Column(name="paid_amount", nullable=false)
    private Long paidAmount;

    // snapshot after applying this transaction
    @Column(name="total_fee", nullable=false)
    private Long totalFee;

    @Column(name="paid_total_after", nullable=false)
    private Long paidTotalAfter;

    @Column(name="due_after", nullable=false)
    private Long dueAfter;

    @Column(name="next_due_date")
    private LocalDate nextDueDate;

    @Column(name="remarks", length=300)
    private String remarks;

    @Column(name="created_by", length=60)
    private String createdBy; // office username

    @Column(name="created_at", nullable=false)
    private LocalDateTime createdAt;
}
