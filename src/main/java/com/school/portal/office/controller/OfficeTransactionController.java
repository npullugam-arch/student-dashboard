package com.school.portal.office.controller;

import com.school.portal.office.dto.AddTransactionRequest;
import com.school.portal.office.dto.FeeTransactionDto;
import com.school.portal.office.dto.UpdateTransactionRequest;
import com.school.portal.office.service.OfficeTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/office/api/transactions")
@RequiredArgsConstructor
public class OfficeTransactionController {

    private final OfficeTransactionService service;

    @GetMapping("/student/{studentId}")
    public List<FeeTransactionDto> list(@PathVariable String studentId) {
        return service.listForStudent(studentId);
    }

    @PostMapping("/student/{studentId}")
    public FeeTransactionDto add(@PathVariable String studentId,
                                 @RequestBody AddTransactionRequest req,
                                 Principal principal) {
        return service.add(studentId, req, principal);
    }

    // ✅ NEW: EDIT
    @PutMapping("/student/{studentId}/{txId}")
    public FeeTransactionDto update(@PathVariable String studentId,
                                    @PathVariable Long txId,
                                    @RequestBody UpdateTransactionRequest req,
                                    Principal principal) {
        return service.update(studentId, txId, req, principal);
    }

    // ✅ NEW: DELETE (optional but recommended)
    @DeleteMapping("/student/{studentId}/{txId}")
    public String delete(@PathVariable String studentId,
                         @PathVariable Long txId) {
        service.delete(studentId, txId);
        return "Deleted";
    }
}
