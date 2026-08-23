package com.school.portal.notice.repository;

import com.school.portal.notice.entity.Notice;
import com.school.portal.notice.entity.NoticeAudienceType;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface NoticeRepository extends JpaRepository<Notice, Long> {

    Optional<Notice> findById(Long id);

    @Query("""
        SELECT n FROM Notice n
        WHERE
          (:published IS NULL OR n.published = :published)
          AND (:q IS NULL
               OR LOWER(n.title) LIKE CONCAT('%', LOWER(CAST(:q AS string)), '%')
               OR LOWER(n.message) LIKE CONCAT('%', LOWER(CAST(:q AS string)), '%'))
        ORDER BY n.createdAt DESC
    """)
    Page<Notice> adminSearch(@Param("q") String q,
                             @Param("published") Boolean published,
                             Pageable pageable);

    @Query("""
        SELECT n FROM Notice n
        WHERE
          n.published = true
          AND n.publishAt <= :now
          AND (n.expireAt IS NULL OR n.expireAt >= :now)
          AND (
             n.audienceType = :all
             OR (:role = 'STUDENT' AND n.audienceType = :studentsAll)
             OR (:role = 'TEACHER' AND n.audienceType = :teachersAll)
             OR (
                :classId IS NOT NULL AND :section IS NOT NULL
                AND :role = 'STUDENT'
                AND n.audienceType = :studentsClass
                AND n.classId = :classId
                AND n.section = :section
             )
             OR (
                :classId IS NOT NULL AND :section IS NOT NULL
                AND :role = 'TEACHER'
                AND n.audienceType = :teachersClass
                AND n.classId = :classId
                AND n.section = :section
             )
          )
        ORDER BY n.publishAt DESC
    """)
    Page<Notice> findForViewer(@Param("now") LocalDateTime now,
                               @Param("role") String role,
                               @Param("classId") Integer classId,
                               @Param("section") String section,
                               @Param("all") NoticeAudienceType all,
                               @Param("studentsAll") NoticeAudienceType studentsAll,
                               @Param("teachersAll") NoticeAudienceType teachersAll,
                               @Param("studentsClass") NoticeAudienceType studentsClass,
                               @Param("teachersClass") NoticeAudienceType teachersClass,
                               Pageable pageable);
}
