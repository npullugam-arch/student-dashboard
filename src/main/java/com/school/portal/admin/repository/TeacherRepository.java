package com.school.portal.admin.repository;

import com.school.portal.core.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    Optional<Teacher> findByTeacherId(String teacherId);

    // ✅ NEW: search for UI
    @Query("""
        select t from Teacher t
        where lower(t.teacherId) like concat('%', :q, '%')
           or lower(t.fullName) like concat('%', :q, '%')
    """)
    List<Teacher> searchByIdOrName(@Param("q") String q);
}