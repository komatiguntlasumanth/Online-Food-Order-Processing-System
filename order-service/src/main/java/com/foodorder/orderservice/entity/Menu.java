package com.foodorder.orderservice.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "menus")
public class Menu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "menu_id")
    private Long menuId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    @JsonIgnore
    private Restaurant restaurant;

    @Column(name = "name", nullable = false, length = 100)
    @JsonProperty("name")
    private String name;

    @Column(columnDefinition = "TEXT")
    @JsonProperty("desc")
    private String desc;

    @Column(nullable = false)
    private Double price;

    @Column(name = "is_available")
    private Boolean isAvailable = true;

    @Column(name = "image", length = 255)
    @JsonProperty("image")
    private String image;
    private Double rating;
    private String time;
    private Boolean veg;

    public Menu() {}

    public Menu(Long menuId, Restaurant restaurant, String name, String desc,
                Double price, Boolean isAvailable, String image,
                Double rating, String time, Boolean veg) {
        this.menuId = menuId;
        this.restaurant = restaurant;
        this.name = name;
        this.desc = desc;
        this.price = price;
        this.isAvailable = isAvailable;
        this.image = image;
        this.rating = rating;
        this.time = time;
        this.veg = veg;
    }

    public Long getMenuId() {
        return menuId;
    }

    public void setMenuId(Long menuId) {
        this.menuId = menuId;
    }

    public Restaurant getRestaurant() {
        return restaurant;
    }

    public void setRestaurant(Restaurant restaurant) {
        this.restaurant = restaurant;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDesc() {
        return desc;
    }

    public void setDesc(String desc) {
        this.desc = desc;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Boolean getIsAvailable() {
        return isAvailable;
    }

    public void setIsAvailable(Boolean isAvailable) {
        this.isAvailable = isAvailable;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public Boolean getVeg() {
        return veg;
    }

    public void setVeg(Boolean veg) {
        this.veg = veg;
    }
}
