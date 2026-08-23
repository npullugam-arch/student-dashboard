package com.school.portal.auth.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** Provides clean URLs for the three portal login pages. */
@Controller
public class LoginPageController {

    @GetMapping({"/login", "/login/"})
    public String studentAndTeacherLogin() {
        return "forward:/login/login.html";
    }

    @GetMapping("/login/admin")
    public String adminLogin() {
        return "forward:/login/admin.html";
    }

    @GetMapping("/login/office")
    public String officeLogin() {
        return "forward:/login/office.html";
    }
}
