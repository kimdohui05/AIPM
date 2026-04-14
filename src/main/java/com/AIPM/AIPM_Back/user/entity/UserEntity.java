package com.AIPM.AIPM_Back.user.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Builder.Default
    @Column(nullable = false, unique = true, updatable = false)
    private String uuid = UUID.randomUUID().toString();

    @Column(unique = true, length = 20)
    private String userId;

    @Column(length = 5)
    private String name;

    @Column(length = 10)
    private String nickname;

    @Column(length = 255)
    private String password;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(length = 500)
    private String profileImage;

    @Column(name = "organization_id", length = 100)
    private String organizationId; // 회사명 텍스트 저장

    @Column(name = "department_id", length = 100)
    private String departmentId; // 부서명 텍스트 저장

    @Column(name = "team_id")
    private Long teamId;

    @Column(length = 10)
    private String position;

    @Column(length = 50)
    private String provider;

    @Column(length = 100)
    private String providerId;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Column(columnDefinition = "TEXT")
    private String portfolio;

    public void updateProfile(String name, String nickname, String profileImage,
                                  String organizationId, String departmentId,
                                  String position, String portfolio) {
        if (name != null) this.name = name;
        if (nickname != null) this.nickname = nickname;
        if (profileImage != null) this.profileImage = profileImage;
        if (organizationId != null) this.organizationId = organizationId;
        if (departmentId != null) this.departmentId = departmentId;
        if (position != null) this.position = position;
        if (portfolio != null) this.portfolio = portfolio;
    }
}