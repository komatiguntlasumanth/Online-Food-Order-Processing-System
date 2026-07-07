package com.foodorder.orderservice.config;

import com.foodorder.orderservice.entity.Menu;
import com.foodorder.orderservice.entity.Restaurant;
import com.foodorder.orderservice.repository.RestaurantRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Seeds the database with 7 famous restaurants and their menu items on startup.
 * Only runs when the restaurants table is empty to avoid duplicate inserts.
 */
@Component
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSeeder.class);

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Override
    public void run(String... args) {
        if (restaurantRepository.count() > 0) {
            log.info("Database already seeded with {} restaurants. Skipping.", restaurantRepository.count());
            return;
        }

        log.info("Seeding database with restaurant and menu data...");
        List<Restaurant> restaurants = buildRestaurants();
        restaurantRepository.saveAll(restaurants);
        log.info("Seeded {} restaurants successfully.", restaurants.size());
    }

    private List<Restaurant> buildRestaurants() {
        return List.of(
            karavalli(),
            shiro(),
            nook(),
            timeTraveller(),
            kebabsAndKurries(),
            paradiseBiryani(),
            udupiUpahar()
        );
    }

    // ─── Helper to create Menu item ─────────────────────────────────────────────
    private Menu menuItem(Restaurant r, String name, String desc, double price,
                          boolean veg, double rating, String time, String image) {
        Menu m = new Menu();
        m.setRestaurant(r);
        m.setName(name);
        m.setDesc(desc);
        m.setPrice(price);
        m.setIsAvailable(true);
        m.setVeg(veg);
        m.setRating(rating);
        m.setTime(time);
        m.setImage(image);
        return m;
    }

    // ─── Helper to create Restaurant ────────────────────────────────────────────
    private Restaurant restaurant(String name, String cuisine, String time,
                                  String address, double rating, int reviews,
                                  String costForTwo, String desc, String highlight,
                                  String closesIn, double lat, double lon,
                                  String image) {
        Restaurant r = new Restaurant();
        r.setName(name);
        r.setCuisine(cuisine);
        r.setTime(time);
        r.setAddress(address);
        r.setRating(rating);
        r.setReviews(reviews);
        r.setCostForTwo(costForTwo);
        r.setDesc(desc);
        r.setHighlight(highlight);
        r.setClosesIn(closesIn);
        r.setLatitude(lat);
        r.setLongitude(lon);
        r.setImage(image);
        r.setIsActive(true);
        return r;
    }

    // ─── Restaurant 1: Karavalli @ Taj ──────────────────────────────────────────
    private Restaurant karavalli() {
        Restaurant r = restaurant(
            "Karavalli @ Taj",
            "Indian, Seafood, Mangalorean",
            "30-40 mins",
            "Gateway Hotel, Residency Road, Bengaluru",
            4.8, 2661,
            "₹1,800 for two",
            "Lush greenery, traditional Mangalorean and coastal recipes served under a beautiful tree canopy.",
            "\"The Kozhi melagittathu chicken curry was delicious and will highly recommend.\"",
            "Closes in 44 min",
            12.9734, 77.6105,
            "/images/karavalli.png"
        );

        r.getMenu().addAll(List.of(
            menuItem(r, "Kozhi Melagittathu", "Succulent chicken pieces cooked with freshly crushed pepper and aromatic traditional spices.", 450.00, false, 4.8, "25-30 mins", "/images/non_veg_meals_thali.jpg"),
            menuItem(r, "Tiger Prawns Roast", "Fresh tiger prawns marinated in local spices and roasted with curry leaves.", 650.00, false, 4.9, "20-25 mins", "/images/non_veg_meals_thali.jpg"),
            menuItem(r, "Appam with Veg Stew", "Lacy, soft-centered rice pancakes served with a rich, fragrant coconut milk vegetable stew.", 220.00, true, 4.7, "15-20 mins", "/images/idly.png"),
            menuItem(r, "Karavalli South Indian Thali", "A curated plate of traditional coastal curries, rice, sambar, and rasam.", 320.00, true, 4.6, "30 mins", "/images/veg_meals_thali.jpg"),
            menuItem(r, "Fish Gassi", "Kori gassi-style coconut and red chili gravy with tender fish — an authentic Mangalorean classic.", 520.00, false, 4.8, "25-30 mins", "/images/non_veg_meals_thali.jpg"),
            menuItem(r, "Neer Dosa", "Delicate, lacy rice crepes served rolled with coconut chutney and a side of chicken curry.", 180.00, false, 4.5, "15-20 mins", "/images/PlainDosa.png"),
            menuItem(r, "Banana Blossom Stir Fry", "Crispy stir-fried banana flower with fresh coconut and green chilies.", 160.00, true, 4.4, "20 mins", "/images/veg_meals_thali.jpg")
        ));
        return r;
    }

    // ─── Restaurant 2: Shiro Bengaluru ──────────────────────────────────────────
    private Restaurant shiro() {
        Restaurant r = restaurant(
            "Shiro Bengaluru",
            "Japanese, Sushi, Pan-Asian",
            "35-45 mins",
            "UB City, Vittal Mallya Road, Bengaluru",
            4.5, 1032,
            "₹2,000 for two",
            "Sophisticated Pan-Asian dining with high ceilings, dramatic stone Buddha statues, and premium sushi.",
            "\"Exquisite Sushi!, Atmosphere really gives off out of country Vibes...\"",
            "Closes in 44 min",
            12.9721, 77.5998,
            "/images/shiro.png"
        );

        r.getMenu().addAll(List.of(
            menuItem(r, "Schezwan Noodles", "Spicy wok-tossed noodles with farm-fresh vegetables and Schezwan chili paste.", 120.00, true, 4.4, "20-25 mins", "/images/schezwan_noodles.jpg"),
            menuItem(r, "Veg Fried Rice", "Perfectly seasoned rice wok-tossed with mixed vegetables.", 110.00, true, 4.3, "20-25 mins", "/images/veg_fried_rice.jpg"),
            menuItem(r, "Sushi Platter (Veg)", "Chef-crafted cucumber, avocado, and carrot maki sushi served with wasabi.", 420.00, true, 4.6, "20-25 mins", "/images/idly.png"),
            menuItem(r, "Dumpling Basket (Non-Veg)", "Steamed chicken and chive dumplings with house chili dip.", 350.00, false, 4.5, "15-20 mins", "/images/non_veg_meals_thali.jpg"),
            menuItem(r, "Chicken Ramen", "Japanese-style ramen bowl with soft-boiled egg, bamboo shoots, and rich chicken broth.", 420.00, false, 4.6, "25-30 mins", "/images/non_veg_meals_thali.jpg"),
            menuItem(r, "Miso Soup", "Traditional Japanese clear broth with silken tofu, seaweed, and spring onions.", 80.00, true, 4.2, "10 mins", "/images/veg_meals_thali.jpg"),
            menuItem(r, "Thai Green Curry with Jasmine Rice", "Aromatic Thai green curry with seasonal vegetables and fragrant jasmine rice.", 340.00, true, 4.5, "25-30 mins", "/images/veg_meals_thali.jpg")
        ));
        return r;
    }

    // ─── Restaurant 3: Nook ─────────────────────────────────────────────────────
    private Restaurant nook() {
        Restaurant r = restaurant(
            "Nook",
            "Indian, Asian, Buffet",
            "25-35 mins",
            "Vivanta Bengaluru Residency Road, Bengaluru",
            4.9, 638,
            "₹1,500 for two",
            "Vibrant and contemporary restaurant serving authentic Indian and Asian dishes in tapas style.",
            "\"Fantastic authentic Indian cuisine served in tapas style in a vibrant venue...\"",
            "Closed now",
            12.9698, 77.5890,
            "/images/nook.png"
        );

        r.getMenu().addAll(List.of(
            menuItem(r, "Paneer Biryani", "Rich, layered basmati rice with marinated cottage cheese, slow-cooked in a sealed handi.", 200.00, true, 4.4, "30-35 mins", "/images/paneer_biryani.jpg"),
            menuItem(r, "Samosa Tapas (4 Pcs)", "Bite-sized crisp samosas served with sweet dates chutney and spicy mint dip.", 60.00, true, 4.5, "15-20 mins", "/images/samosa.jpg"),
            menuItem(r, "Egg Biryani", "Aromatic basmati rice cooked with hard-boiled eggs and special spice blend.", 170.00, false, 4.3, "25-30 mins", "/images/egg_biryani.jpg"),
            menuItem(r, "Lamb Seekh Roll", "Spiced minced lamb seekh kebab wrapped in flaky paratha with mint raita.", 280.00, false, 4.6, "20-25 mins", "/images/non_veg_meals_thali.jpg"),
            menuItem(r, "Mezze Platter (Veg)", "Assorted hummus, falafel, pita, and dips — an Indo-Mediterranean shareable plate.", 240.00, true, 4.4, "20 mins", "/images/veg_meals_thali.jpg"),
            menuItem(r, "Kulfi Falooda", "Traditional Indian ice cream with rose syrup, vermicelli, and basil seeds.", 120.00, true, 4.7, "10 mins", "/images/idly.png")
        ));
        return r;
    }

    // ─── Restaurant 4: Time Traveller ───────────────────────────────────────────
    private Restaurant timeTraveller() {
        Restaurant r = restaurant(
            "Time Traveller",
            "Indian, International, Continental",
            "40-50 mins",
            "ITC Gardenia, Residency Road, Bengaluru",
            4.9, 2834,
            "₹1,400 for two",
            "Futuristic hotel dining concept featuring an extensive global buffet and interactive food stations.",
            "\"Ideal dinner buffet place in Bangalore. Wide variety of global cuisines.\"",
            "Closed now",
            12.9850, 77.6200,
            "/images/time_traveller.png"
        );

        r.getMenu().addAll(List.of(
            menuItem(r, "Butter Naan & Paneer Gravy", "Fresh tandoor naan brushed with butter, paired with sweet and creamy paneer gravy.", 160.00, true, 4.6, "25-30 mins", "/images/butter_naan_paneer_gravy.jpg"),
            menuItem(r, "Chapati with Kurma", "Soft whole wheat flatbread served with loaded mixed vegetable kurma.", 80.00, true, 4.2, "20-25 mins", "/images/chapati_with_kurma.jpg"),
            menuItem(r, "Hyderabadi Chicken Biryani", "Premium basmati rice layered with juicy bone-in chicken cooked in authentic Hyderabad style.", 240.00, false, 4.8, "30-35 mins", "/images/hyderabadi_chicken_biryani.jpg"),
            menuItem(r, "Continental Breakfast Platter", "Croissants, scrambled eggs, smoked sausage, hash browns, and fresh juice.", 350.00, false, 4.5, "20 mins", "/images/non_veg_meals_thali.jpg"),
            menuItem(r, "Grilled Fish with Herb Butter", "Fresh catch of the day marinated in herb butter and grilled to perfection.", 480.00, false, 4.7, "30 mins", "/images/non_veg_meals_thali.jpg"),
            menuItem(r, "Mezze Platter (International)", "Mixed Lebanese, Greek, and Indian dips with lavash, pita, and grissini.", 280.00, true, 4.4, "15-20 mins", "/images/veg_meals_thali.jpg"),
            menuItem(r, "Chocolate Fondant", "Warm molten chocolate cake served with vanilla bean ice cream.", 180.00, true, 4.8, "20 mins", "/images/idly.png")
        ));
        return r;
    }

    // ─── Restaurant 5: Kebabs & Kurries ─────────────────────────────────────────
    private Restaurant kebabsAndKurries() {
        Restaurant r = restaurant(
            "Kebabs & Kurries",
            "Indian, Mughlai, Kebab",
            "30-40 mins",
            "ITC Windsor, Golf Course Road, Bengaluru",
            4.9, 1698,
            "₹2,200 for two",
            "Elegant dining paying tribute to India's royal kitchens with mouthwatering charcoal kebabs and curries.",
            "\"Exceptional vegetarian spread and service! Great evening in Kebabs and Kurries.\"",
            "Closes in 44 min",
            12.9620, 77.5950,
            "/images/kebabs_kurries.png"
        );

        r.getMenu().addAll(List.of(
            menuItem(r, "Paneer Butter Masala", "Rich, creamy tomato gravy loaded with soft paneer cubes and butter.", 180.00, true, 4.7, "25-30 mins", "/images/butter_naan_paneer_gravy.jpg"),
            menuItem(r, "Seekh Kebab (Non-Veg)", "Minced spiced chicken skewers roasted on glowing hot charcoal.", 390.00, false, 4.9, "20-25 mins", "/images/non_veg_meals_thali.jpg"),
            menuItem(r, "Tandoori Roti with Dal Makhani", "Clay oven flatbread paired with rich, slow-simmered black lentils.", 150.00, true, 4.8, "25-30 mins", "/images/veg_meals_thali.jpg"),
            menuItem(r, "Galouti Kebab", "Melt-in-the-mouth minced meat patties infused with 150 spices, served on crispy bread.", 480.00, false, 4.9, "25-30 mins", "/images/non_veg_meals_thali.jpg"),
            menuItem(r, "Hara Bhara Kabab", "Green spinach, pea, and potato patties spiced with herbs and pan-fried golden.", 160.00, true, 4.5, "15-20 mins", "/images/veg_meals_thali.jpg"),
            menuItem(r, "Mughlai Chicken Korma", "Tender chicken in a mildly spiced creamy almond and onion gravy.", 360.00, false, 4.7, "30-35 mins", "/images/non_veg_meals_thali.jpg"),
            menuItem(r, "Shahi Paneer", "Cottage cheese cubes in a rich, royal cashew and cream gravy.", 220.00, true, 4.6, "25 mins", "/images/butter_naan_paneer_gravy.jpg"),
            menuItem(r, "Gulab Jamun (2 Pcs)", "Soft rose-flavored milk-solid dumplings soaked in sugar syrup.", 80.00, true, 4.8, "10 mins", "/images/idly.png")
        ));
        return r;
    }

    // ─── Restaurant 6: Paradise Biryani ─────────────────────────────────────────
    private Restaurant paradiseBiryani() {
        Restaurant r = restaurant(
            "Paradise Biryani",
            "Biryani, Mughlai, Kebabs",
            "20-30 mins",
            "Secunderabad, Hyderabad",
            4.5, 5410,
            "₹600 for two",
            "The legendary house of Hyderabadi Biryani, serving aromatic basmati and slow-cooked meat since 1953.",
            "\"Unbeatable aroma, standard recipe that never disappoints for chicken biryani.\"",
            "Closes in 44 min",
            17.4485, 78.3745,
            "/images/hyderabadi_chicken_biryani.jpg"
        );

        r.getMenu().addAll(List.of(
            menuItem(r, "Hyderabadi Chicken Biryani", "Flavourful basmati rice cooked on dum with marinated chicken pieces.", 240.00, false, 4.8, "30-35 mins", "/images/hyderabadi_chicken_biryani.jpg"),
            menuItem(r, "Paneer Biryani", "Aromatic layered basmati rice served with soft marinated cottage cheese.", 200.00, true, 4.4, "30-35 mins", "/images/paneer_biryani.jpg"),
            menuItem(r, "Egg Biryani", "Premium biryani rice served with two spiced boiled eggs.", 170.00, false, 4.3, "25-30 mins", "/images/egg_biryani.jpg"),
            menuItem(r, "Mutton Biryani", "Slow-cooked dum biryani with tender bone-in mutton and premium long-grain rice.", 320.00, false, 4.9, "40-45 mins", "/images/non_veg_meals_thali.jpg"),
            menuItem(r, "Veg Biryani", "Seasonal vegetables cooked dum style in aromatic basmati.", 160.00, true, 4.2, "30 mins", "/images/veg_meals_thali.jpg"),
            menuItem(r, "Mirchi ka Salan", "Tangy peanut and sesame-based chili gravy — the traditional biryani companion.", 60.00, true, 4.5, "15 mins", "/images/veg_meals_thali.jpg"),
            menuItem(r, "Double Ka Meetha", "Hyderabadi bread pudding with condensed milk, dry fruits, and ghee.", 90.00, true, 4.6, "15 mins", "/images/idly.png")
        ));
        return r;
    }

    // ─── Restaurant 7: Udupi Upahar ─────────────────────────────────────────────
    private Restaurant udupiUpahar() {
        Restaurant r = restaurant(
            "Udupi Upahar",
            "South Indian, Vegetarian",
            "15-25 mins",
            "Majestic, Bengaluru",
            4.6, 3200,
            "₹300 for two",
            "A pure vegetarian institution famous for its traditional, piping-hot breakfast dosas, idlis, and filter coffee.",
            "\"Fast service and amazing sambar taste, the idlies are soft like clouds.\"",
            "Closes in 44 min",
            12.9782, 77.6408,
            "/images/idly.png"
        );

        r.getMenu().addAll(List.of(
            menuItem(r, "Idly (2 Pcs)", "Soft and fluffy steamed rice-lentil cakes served with sambar and coconut chutney.", 40.00, true, 4.5, "15-20 mins", "/images/idly.png"),
            menuItem(r, "Poori with Potato Sagu", "Puffy deep-fried wheat flatbread served with dry potato bhaji and coconut chutney.", 60.00, true, 4.4, "20-25 mins", "/images/Poori.jpg"),
            menuItem(r, "Plain Dosa", "Crispy rice batter crepe served with sambar and fresh chutney.", 50.00, true, 4.3, "15-20 mins", "/images/PlainDosa.png"),
            menuItem(r, "Masala Dosa", "Crispy rice crepe stuffed with spiced potato and onion mash, served with chutneys.", 70.00, true, 4.6, "20-25 mins", "/images/masala_dosa.png"),
            menuItem(r, "Ghee Dosa", "Fragrant and extra crispy dosa cooked generously with pure ghee.", 90.00, true, 4.7, "15-20 mins", "/images/ghee_dosa.jpg"),
            menuItem(r, "Vada (2 Pcs)", "Crispy lentil donuts served with sambar and coconut chutney.", 45.00, true, 4.2, "10-15 mins", "/images/Vada.jpg"),
            menuItem(r, "Rava Kesari", "Sweet semolina halwa with saffron, ghee, cashews, and raisins.", 50.00, true, 4.5, "10 mins", "/images/idly.png"),
            menuItem(r, "Filter Coffee", "Traditional South Indian drip coffee served in a stainless steel tumbler and davara.", 30.00, true, 4.9, "5 mins", "/images/idly.png"),
            menuItem(r, "Uttapam (Onion Tomato)", "Thick rice pancake topped with onion, tomato, and chili.", 65.00, true, 4.3, "20 mins", "/images/PlainDosa.png")
        ));
        return r;
    }
}
