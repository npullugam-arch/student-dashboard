package com.school.portal.core.repository;

import com.school.portal.core.entity.DoubtMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DoubtMessageRepository extends JpaRepository<DoubtMessage, Long> {
    List<DoubtMessage> findByDoubtIdOrderByCreatedAtAsc(Long doubtId);
}
