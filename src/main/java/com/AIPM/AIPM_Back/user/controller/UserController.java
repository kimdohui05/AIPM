package com.AIPM.AIPM_Back.user.controller;

import com.AIPM.AIPM_Back.user.dto.LoginDto;
import com.AIPM.AIPM_Back.user.dto.RegisterDto;
import com.AIPM.AIPM_Back.user.dto.TokenDto;
import com.AIPM.AIPM_Back.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterDto request) {
        userService.signup(request);
        return ResponseEntity.ok("회원가입 성공");
    }

    @PostMapping("/login")
    public ResponseEntity<TokenDto> login(@RequestBody LoginDto request) {
        TokenDto token = userService.login(request);
        return ResponseEntity.ok(token);
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("인증 성공");
    }
}