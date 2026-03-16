package com.school.portal.office.controller;

import com.school.portal.office.dto.BootstrapFeeAccountsResponse;
import com.school.portal.office.dto.FeeOverviewDto;
import com.school.portal.office.dto.FeeRowDto;
import com.school.portal.office.dto.UpdateFeeRequest;
import com.school.portal.office.service.OfficeFeeBootstrapService;
import com.school.portal.office.service.OfficeFeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/office/api/fees")
@RequiredArgsConstructor
public class OfficeFeeController {

    private final OfficeFeeService officeFeeService;
    private final OfficeFeeBootstrapService bootstrapService; // ✅ add


    @GetMapping("/overview")
    public FeeOverviewDto overview() {
        return officeFeeService.overview();
    }

    @GetMapping("/students")
    public List<FeeRowDto> students(@RequestParam(required = false) String q) {
        return officeFeeService.list(q);
    }

    @PutMapping("/students/{studentId}")
    public FeeRowDto update(@PathVariable String studentId, @RequestBody UpdateFeeRequest req) {
        return officeFeeService.upsert(studentId, req);
    }

     @PostMapping("/bootstrap")
    public BootstrapFeeAccountsResponse bootstrap() {
        return bootstrapService.bootstrapForAllActiveStudents();
    }
}
