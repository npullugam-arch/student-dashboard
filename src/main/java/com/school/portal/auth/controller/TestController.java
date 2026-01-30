package com.school.portal.auth.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

   @GetMapping("/test")
public String test() {
    System.out.println("TEST ENDPOINT HIT");
    return "Login successful! Security is working.";
}

}
