package com.school.portal.admin.service;

import com.school.portal.admin.dto.AssignSubjectToStandardRequest;
import com.school.portal.admin.dto.CreateSubjectRequest;
import com.school.portal.admin.dto.StandardSubjectResponse;
import com.school.portal.admin.repository.StandardSubjectRepository;
import com.school.portal.admin.repository.SubjectRepository;
import com.school.portal.core.entity.StandardSubject;
import com.school.portal.core.entity.SubjectEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminSubjectService {

    private final SubjectRepository subjectRepository;
    private final StandardSubjectRepository standardSubjectRepository;

    public SubjectEntity createSubject(CreateSubjectRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new RuntimeException("Subject name is required");
        }

        String name = request.getName().trim();

        subjectRepository.findByNameIgnoreCase(name)
                .ifPresent(s -> {
                    throw new RuntimeException("Subject already exists");
                });

        SubjectEntity subject = SubjectEntity.builder()
                .name(name)
                .active(true)
                .build();

        return subjectRepository.save(subject);
    }

    public StandardSubject assignToStandard(AssignSubjectToStandardRequest request) {
        if (request.getStandard() == null) throw new RuntimeException("standard is required");
        if (request.getSubjectId() == null) throw new RuntimeException("subjectId is required");

        SubjectEntity subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        StandardSubject existing = standardSubjectRepository
                .findByStandardAndSubject_Id(request.getStandard(), request.getSubjectId())
                .orElse(null);

        if (existing != null) {
            existing.setActive(true);
            return standardSubjectRepository.save(existing);
        }

        StandardSubject standardSubject = StandardSubject.builder()
                .standard(request.getStandard())
                .subject(subject)
                .active(true)
                .build();

        return standardSubjectRepository.save(standardSubject);
    }

    public List<StandardSubjectResponse> getSubjectsForStandard(Integer standard) {
        return standardSubjectRepository
                .findByStandardAndActiveTrue(standard)
                .stream()
                .map(ss -> StandardSubjectResponse.builder()
                        .standardSubjectId(ss.getId())
                        .standard(ss.getStandard())
                        .subjectId(ss.getSubject().getId())
                        .subjectName(ss.getSubject().getName())
                        .build())
                .toList();
    }

    public void removeFromStandard(Long standardSubjectId) {
        StandardSubject ss = standardSubjectRepository.findById(standardSubjectId)
                .orElseThrow(() -> new RuntimeException("StandardSubject not found: " + standardSubjectId));

        ss.setActive(false);
        standardSubjectRepository.save(ss);
    }

    // ✅ NEW METHOD
    public List<SubjectEntity> getAllSubjects() {
        return subjectRepository.findAll();
    }
}
