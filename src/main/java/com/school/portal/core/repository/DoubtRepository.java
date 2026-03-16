package com.school.portal.core.repository;

import com.school.portal.common.enums.DoubtStatus;
import com.school.portal.core.entity.Doubt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DoubtRepository extends JpaRepository<Doubt, Long> {

    List<Doubt> findByStudentIdOrderByLastMessageAtDesc(String studentId);

    List<Doubt> findByTeacherIdOrderByLastMessageAtDesc(String teacherId);

    List<Doubt> findByTeacherIdAndStatusOrderByLastMessageAtDesc(String teacherId, DoubtStatus status);

    List<Doubt> findByStudentIdAndStatusOrderByLastMessageAtDesc(String studentId, DoubtStatus status);
}
