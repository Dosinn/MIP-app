package com.projekty.projekty.Category;

public record CategoryResponse(
        Long id,
        String name,
        String description,
        String color
) {
    public static CategoryResponse from(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.getColor()
        );
    }
}
