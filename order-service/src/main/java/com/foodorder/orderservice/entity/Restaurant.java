package com.foodorder.orderservice.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "restaurants")
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "restaurant_id")
    private Long restaurantId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "cuisine", length = 100)
    private String cuisine;

    @Column(name = "time", length = 50)
    private String time; // e.g., "30-40 mins"

    @Column(columnDefinition = "TEXT")
    private String address;

    private Double rating;

    private Integer reviews;

    @Column(name = "cost_for_two", length = 50)
    private String costForTwo;

    @Column(columnDefinition = "TEXT")
    private String desc;

    @Column(columnDefinition = "TEXT")
    private String highlight;

    @Column(name = "closes_in", length = 50)
    private String closesIn;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "image", length = 500)
    private String image;

    private Double latitude;
    private Double longitude;

    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<Menu> menu = new ArrayList<>();

    public Restaurant() {}

    // Getters and Setters
    public Long getRestaurantId() { return restaurantId; }
    public void setRestaurantId(Long restaurantId) { this.restaurantId = restaurantId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCuisine() { return cuisine; }
    public void setCuisine(String cuisine) { this.cuisine = cuisine; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getReviews() { return reviews; }
    public void setReviews(Integer reviews) { this.reviews = reviews; }

    public String getCostForTwo() { return costForTwo; }
    public void setCostForTwo(String costForTwo) { this.costForTwo = costForTwo; }

    public String getDesc() { return desc; }
    public void setDesc(String desc) { this.desc = desc; }

    public String getHighlight() { return highlight; }
    public void setHighlight(String highlight) { this.highlight = highlight; }

    public String getClosesIn() { return closesIn; }
    public void setClosesIn(String closesIn) { this.closesIn = closesIn; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public List<Menu> getMenu() { return menu; }
    public void setMenu(List<Menu> menu) { this.menu = menu; }
}
