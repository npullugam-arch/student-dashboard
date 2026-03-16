package com.school.portal.core.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(
        name = "student_fee_accounts",
        indexes = {
                @Index(name = "idx_fee_student", columnList = "student_id", unique = true),
                @Index(name = "idx_fee_due", columnList = "due_amount")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentFeeAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Student unique id like S1001 (same as Student.studentId)
    @Column(name = "student_id", nullable = false, length = 30, unique = true)
    private String studentId;

    @Column(name = "student_name", nullable = false, length = 120)
    private String studentName;

    @Column(nullable = false)
    private Integer standard;

    @Column(nullable = false, length = 5)
    private String section;

    @Column(name = "total_fee", nullable = false)
    private Long totalFee;

    @Column(name = "paid_amount", nullable = false)
    private Long paidAmount;

    @Column(name = "due_amount", nullable = false)
    private Long dueAmount;

    @Column(name = "next_due_date")
    private LocalDate nextDueDate;

    // add this field inside StudentFeeAccount

    @Column(name = "photo_url", length = 500)
    private String photoUrl;


    // If false → hall ticket blocked
    @Column(name = "hall_ticket_allowed", nullable = false)
    private Boolean hallTicketAllowed;
}
