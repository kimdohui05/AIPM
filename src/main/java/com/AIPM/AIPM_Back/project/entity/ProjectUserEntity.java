package com.AIPM.AIPM_Back.project.entity;

import com.AIPM.AIPM_Back.user.entity.UserEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "project_user")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectUserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private ProjectEntity project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectRole role;

    public enum ProjectRole {
        ADMIN, MEMBER
    }
}